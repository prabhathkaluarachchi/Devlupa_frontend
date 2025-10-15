import { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import Swal from 'sweetalert2';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  quizPercentage: number;
  assignmentPercentage: number;
  coursePercentage: number;
  overallPercentage: number;
}

interface CertificateData {
  studentName: string;
  companyName: string;
  internshipField: string;
  startDate: string;
  endDate: string;
  completionDate: string;
  companyDetails: string;
  supervisorName: string;
  supervisorTitle: string;
}

const AdminManageUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificatePopup, setShowCertificatePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData>({
    studentName: "",
    companyName: "DevLupa",
    internshipField: "Software Development Internship",
    startDate: "",
    endDate: "",
    completionDate: new Date().toISOString().split("T")[0],
    companyDetails: "DevLupa - Software Development Company",
    supervisorName: "",
    supervisorTitle: "Senior Developer",
  });
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, quizRes, assignmentRes, userRes] = await Promise.all([
          API.get("/admin/users-progress"),
          API.get("/admin/users-quiz-progress"),
          API.get("/admin/users-assignment-progress"),
          API.get("/users"),
        ]);

        const courseData = courseRes.data;
        const quizData = quizRes.data;
        const assignmentData = assignmentRes.data;
        const userList = userRes.data;

        const mergedUsers: UserRow[] = courseData.map((user: any) => {
          const userInfo = userList.find((u: any) => u._id === user._id);

          let coursePercentage = 0;
          if (user.progress.length > 0) {
            coursePercentage =
              user.progress.reduce(
                (acc: number, p: any) => acc + (p.percentage || 0),
                0
              ) / user.progress.length;
          }

          const quizInfo = quizData.find((q: any) => q.userId === user._id);
          let quizPercentage = 0;
          if (quizInfo && quizInfo.quizzes.length > 0) {
            quizPercentage =
              quizInfo.quizzes.reduce(
                (acc: number, q: any) => acc + (q.scorePercentage || 0),
                0
              ) / quizInfo.quizzes.length;
          }

          const assignmentInfo = assignmentData.find(
            (a: any) => a.userId === user._id
          );
          let assignmentPercentage = 0;
          if (assignmentInfo && assignmentInfo.assignments.length > 0) {
            const graded = assignmentInfo.assignments.filter(
              (a: any) => a.score !== null
            );
            if (graded.length > 0) {
              assignmentPercentage =
                graded.reduce(
                  (acc: number, a: any) => acc + (a.score || 0),
                  0
                ) / graded.length;
            }
          }

          const overallPercentage =
            (quizPercentage + assignmentPercentage + coursePercentage) / 3;

          return {
            _id: user._id,
            name: userInfo?.name || "Unnamed",
            email: userInfo?.email || "N/A",
            quizPercentage: Math.round(quizPercentage),
            assignmentPercentage: Math.round(assignmentPercentage),
            coursePercentage: Math.round(coursePercentage),
            overallPercentage: Math.round(overallPercentage),
          };
        });

        setUsers(
          mergedUsers.sort((a, b) => b.overallPercentage - a.overallPercentage)
        );
      } catch (err) {
        console.error("Failed to load users", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load users data',
          confirmButtonColor: '#4F46E5',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          confirmButtonColor: '#4F46E5',
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete user.',
          confirmButtonColor: '#4F46E5',
        });
      }
    }
  };

  const handleOfferCertificate = (user: UserRow) => {
    setSelectedUser(user);
    setCertificateData((prev) => ({
      ...prev,
      studentName: user.name,
      completionDate: new Date().toISOString().split("T")[0],
    }));
    setShowCertificatePopup(true);
  };

  // Separate CertificatePopup component to prevent re-renders of the main component
  const CertificatePopup = () => {
    const [localCertificateData, setLocalCertificateData] =
      useState<CertificateData>(certificateData);

    // Update local state when certificateData changes (when user is selected)
    useEffect(() => {
      setLocalCertificateData(certificateData);
    }, [certificateData]);

    const handleLocalInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setLocalCertificateData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const validateForm = (): boolean => {
      const requiredFields = [
        'studentName',
        'companyName', 
        'internshipField',
        'startDate',
        'endDate',
        'completionDate',
        'supervisorName',
        'supervisorTitle',
        'companyDetails'
      ];

      const missingFields = requiredFields.filter(field => 
        !localCertificateData[field as keyof CertificateData] || 
        localCertificateData[field as keyof CertificateData] === ''
      );

      if (missingFields.length > 0) {
        const fieldNames: { [key: string]: string } = {
          studentName: 'Student Name',
          companyName: 'Company Name',
          internshipField: 'Internship Field',
          startDate: 'Start Date',
          endDate: 'End Date',
          completionDate: 'Completion Date',
          supervisorName: 'Supervisor Name',
          supervisorTitle: 'Supervisor Title',
          companyDetails: 'Company Details'
        };

        const missingFieldNames = missingFields.map(field => fieldNames[field]).join(', ');
        
        Swal.fire({
          icon: 'warning',
          title: 'Missing Information',
          html: `Please fill in all required fields:<br><strong>${missingFieldNames}</strong>`,
          confirmButtonColor: '#4F46E5',
        });
        return false;
      }

      // Validate dates
      const startDate = new Date(localCertificateData.startDate);
      const endDate = new Date(localCertificateData.endDate);
      
      if (startDate > endDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Dates',
          text: 'Start date cannot be after end date',
          confirmButtonColor: '#4F46E5',
        });
        return false;
      }

      return true;
    };

    const handleLocalSendEmail = async () => {
      if (!selectedUser) return;

      // Validate form before sending
      if (!validateForm()) {
        return;
      }

      setSendingEmail(true);
      try {
        const response = await API.post("/admin/send-certificate", {
          userEmail: selectedUser.email,
          certificateData: localCertificateData,
        });

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Certificate Sent!',
            text: `Certificate has been sent successfully to ${selectedUser.email}`,
            confirmButtonColor: '#4F46E5',
          });
          setShowCertificatePopup(false);
          setCertificateData(localCertificateData);
        }
      } catch (error) {
        console.error("Error sending email:", error);
        await Swal.fire({
          icon: 'error',
          title: 'Failed to Send',
          text: 'Error sending certificate email. Please try again.',
          confirmButtonColor: '#4F46E5',
        });
      } finally {
        setSendingEmail(false);
      }
    };

    const handleLocalDownloadPDF = async () => {
      // Validate form before downloading
      if (!validateForm()) {
        return;
      }

      setGeneratingPDF(true);
      try {
        const certificateContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: 'Times New Roman', serif;
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .certificate {
                background: white;
                padding: 60px 40px;
                border: 20px solid #f4d03f;
                border-radius: 10px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 800px;
                position: relative;
              }
              .header {
                margin-bottom: 40px;
              }
              .title {
                font-size: 48px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
              }
              .subtitle {
                font-size: 24px;
                color: #7f8c8d;
                margin-bottom: 40px;
              }
              .content {
                margin: 40px 0;
              }
              .student-name {
                font-size: 36px;
                font-weight: bold;
                color: #e74c3c;
                margin: 20px 0;
                padding: 10px;
                border-bottom: 2px solid #bdc3c7;
              }
              .description {
                font-size: 20px;
                line-height: 1.6;
                margin: 30px 0;
                color: #2c3e50;
              }
              .details {
                display: flex;
                justify-content: space-between;
                margin: 40px 0;
                text-align: left;
              }
              .company-details, .internship-details {
                flex: 1;
                padding: 0 20px;
              }
              .signatures {
                display: flex;
                justify-content: space-around;
                margin-top: 60px;
                border-top: 2px solid #bdc3c7;
                padding-top: 30px;
              }
              .signature {
                text-align: center;
              }
              .signature-line {
                width: 200px;
                border-top: 1px solid #2c3e50;
                margin: 20px 0 10px 0;
              }
              .date {
                margin-top: 30px;
                font-size: 18px;
                color: #7f8c8d;
              }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="header">
                <div class="title">CERTIFICATE OF COMPLETION</div>
                <div class="subtitle">This is to certify that</div>
              </div>
              
              <div class="content">
                <div class="student-name">${localCertificateData.studentName}</div>
                
                <div class="description">
                  has successfully completed the ${localCertificateData.internshipField} 
                  at ${localCertificateData.companyName} from ${localCertificateData.startDate} to ${localCertificateData.endDate}.
                </div>
                
                <div class="description">
                  ${localCertificateData.companyDetails}
                </div>
              </div>
              
              <div class="signatures">
                <div class="signature">
                  <div class="signature-line"></div>
                  <div>${localCertificateData.supervisorName}</div>
                  <div>${localCertificateData.supervisorTitle}</div>
                  <div>${localCertificateData.companyName}</div>
                </div>
              </div>
              
              <div class="date">
                Date of Completion: ${localCertificateData.completionDate}
              </div>
            </div>
          </body>
          </html>
        `;

        const blob = new Blob([certificateContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Internship_Certificate_${localCertificateData.studentName}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await Swal.fire({
          icon: 'success',
          title: 'Certificate Downloaded!',
          text: 'Certificate has been downloaded successfully',
          confirmButtonColor: '#4F46E5',
        });

        setCertificateData(localCertificateData);
      } catch (error) {
        console.error("Error generating certificate:", error);
        await Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: 'Error generating certificate. Please try again.',
          confirmButtonColor: '#4F46E5',
        });
      } finally {
        setGeneratingPDF(false);
      }
    };

    if (!showCertificatePopup || !selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Generate Internship Certificate
              </h2>
              <button
                onClick={() => setShowCertificatePopup(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={localCertificateData.studentName}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={localCertificateData.companyName}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internship Field *
                  </label>
                  <input
                    type="text"
                    name="internshipField"
                    value={localCertificateData.internshipField}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Date *
                  </label>
                  <input
                    type="date"
                    name="completionDate"
                    value={localCertificateData.completionDate}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={localCertificateData.startDate}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={localCertificateData.endDate}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supervisor Name *
                  </label>
                  <input
                    type="text"
                    name="supervisorName"
                    value={localCertificateData.supervisorName}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supervisor Title *
                  </label>
                  <input
                    type="text"
                    name="supervisorTitle"
                    value={localCertificateData.supervisorTitle}
                    onChange={handleLocalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Details *
                </label>
                <textarea
                  name="companyDetails"
                  value={localCertificateData.companyDetails}
                  onChange={handleLocalInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical"
                  required
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Recipient:</strong> {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t">
              <button
                onClick={handleLocalDownloadPDF}
                disabled={generatingPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {generatingPDF ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Download Certificate'
                )}
              </button>

              <button
                onClick={handleLocalSendEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {sendingEmail ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send via Email'
                )}
              </button>

              <button
                onClick={() => setShowCertificatePopup(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-[#4F46E5]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="mt-4 text-[#4F46E5] font-semibold">
            Loading Users...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
          <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
            Manage Users
          </h1>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full border bg-white rounded-lg shadow overflow-hidden">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Course %</th>
                  <th className="p-3 text-left">Quiz %</th>
                  <th className="p-3 text-left">Assignment %</th>
                  <th className="p-3 text-left">Overall %</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.coursePercentage}%</td>
                    <td className="p-3">{user.quizPercentage}%</td>
                    <td className="p-3">{user.assignmentPercentage}%</td>
                    <td className="p-3 font-semibold text-[#4F46E5]">
                      {user.overallPercentage}%
                    </td>
                    <td className="p-3 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>

                      {user.overallPercentage >= 85 ? (
                        <button
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white px-3 py-2 rounded-lg shadow transition"
                          onClick={() => handleOfferCertificate(user)}
                        >
                          Offer Certificate
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                        >
                          Not Eligible
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">{user.name}</h2>
                  <span className="text-gray-500">{user.email}</span>
                </div>

                <div className="flex justify-between">
                  <span>Course:</span>
                  <span>{user.coursePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Quiz:</span>
                  <span>{user.quizPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Assignment:</span>
                  <span>{user.assignmentPercentage}%</span>
                </div>
                <div className="flex justify-between font-semibold text-[#4F46E5]">
                  <span>Overall:</span>
                  <span>{user.overallPercentage}%</span>
                </div>

                <div className="flex flex-col space-y-2 mt-2">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>

                  {user.overallPercentage >= 85 ? (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      onClick={() => handleOfferCertificate(user)}
                    >
                      Offer Certificate
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                    >
                      Not Eligible
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto">
            <AdminFooter />
          </div>
        </div>
      </div>

      {/* Certificate Popup */}
      <CertificatePopup />
    </div>
  );
};

export default AdminManageUsers;