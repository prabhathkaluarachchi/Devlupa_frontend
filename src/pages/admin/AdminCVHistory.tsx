import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import API from "../../utils/axiosInstance";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

interface ScreeningHistory {
  _id: string;
  screeningId: string;
  jobRequirement: string;
  threshold: number;
  totalAnalyzed: number;
  eligibleCount: number;
  invitationsSent: number;
  createdAt: string;
}

interface CVWithoutEmail {
  fileName: string;
  screeningId: string;
  matchScore: number;
  eligible: boolean;
  extractedEmail?: string | null;
}

// Separate EmailModal component to prevent re-renders
const EmailModal: React.FC<{
  show: boolean;
  onClose: () => void;
  selectedScreening: ScreeningHistory | null;
  cvsWithoutEmail: CVWithoutEmail[];
  loadingCVs: boolean;
  onSendEmail: (fileName: string, email: string) => Promise<void>;
  onSendBulkEmails: (
    emails: Array<{ email: string; fileName: string }>
  ) => Promise<void>;
}> = ({
  show,
  onClose,
  selectedScreening,
  cvsWithoutEmail,
  loadingCVs,
  onSendEmail,
  onSendBulkEmails,
}) => {
  const [emailInputs, setEmailInputs] = useState<{ [key: string]: string }>({});
  const [sendingEmails, setSendingEmails] = useState<{
    [key: string]: boolean;
  }>({});
  const [sendingBulk, setSendingBulk] = useState(false);

  // Initialize email inputs when modal opens or CVs change
  useEffect(() => {
    if (show && cvsWithoutEmail.length > 0) {
      const newEmailInputs: { [key: string]: string } = {};
      cvsWithoutEmail.forEach((cv) => {
        newEmailInputs[cv.fileName] = cv.extractedEmail || "";
      });
      setEmailInputs(newEmailInputs);
    }
  }, [show, cvsWithoutEmail]);

  const handleEmailChange = (fileName: string, email: string) => {
    setEmailInputs((prev) => ({
      ...prev,
      [fileName]: email,
    }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLocalSendEmail = async (fileName: string) => {
    const email = emailInputs[fileName];

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter the student's email address.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (!isValidEmail(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    setSendingEmails((prev) => ({ ...prev, [fileName]: true }));

    try {
      await onSendEmail(fileName, email);

      // Remove from local state after successful send
      setEmailInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[fileName];
        return newInputs;
      });
    } catch (error) {
      console.error("Send Email Error:", error);
    } finally {
      setSendingEmails((prev) => ({ ...prev, [fileName]: false }));
    }
  };

  const handleLocalSendBulkEmails = async () => {
    const validCVs = cvsWithoutEmail.filter((cv) => {
      const email = emailInputs[cv.fileName]?.trim();
      return email && isValidEmail(email);
    });

    if (validCVs.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Valid Emails",
        text: "No valid email addresses found. Please enter email addresses for the CVs.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    setSendingBulk(true);

    try {
      const emailsToSend = validCVs.map((cv) => ({
        email: emailInputs[cv.fileName].trim(),
        fileName: cv.fileName,
      }));

      await onSendBulkEmails(emailsToSend);

      // Remove successfully sent CVs from local state
      setEmailInputs((prev) => {
        const newInputs = { ...prev };
        validCVs.forEach((cv) => {
          delete newInputs[cv.fileName];
        });
        return newInputs;
      });
    } catch (error) {
      console.error("Bulk Send Email Error:", error);
    } finally {
      setSendingBulk(false);
    }
  };

  if (!show || !selectedScreening) return null;

  const validCVs = cvsWithoutEmail.filter((cv) => {
    const email = emailInputs[cv.fileName]?.trim();
    return email && isValidEmail(email);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Add Missing Emails
            </h2>
            <button
              onClick={onClose}
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
          <p className="text-gray-600 mt-2">
            Screening ID:{" "}
            <span className="font-mono">{selectedScreening.screeningId}</span>
          </p>
          <p className="text-gray-600">
            CVs without email:{" "}
            <span className="font-semibold">{cvsWithoutEmail.length}</span>
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loadingCVs ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : cvsWithoutEmail.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                All Emails Added!
              </h3>
              <p className="text-gray-600">
                All CVs have email addresses associated with them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">
                  {validCVs.length} of {cvsWithoutEmail.length} CVs ready to
                  send
                </span>
                {validCVs.length > 0 && (
                  <button
                    onClick={handleLocalSendBulkEmails}
                    disabled={sendingBulk}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm disabled:opacity-50"
                  >
                    {sendingBulk
                      ? "Sending..."
                      : `Send All (${validCVs.length})`}
                  </button>
                )}
              </div>

              {cvsWithoutEmail.map((cv) => {
                const email = emailInputs[cv.fileName] || "";
                const isValid = isValidEmail(email);

                return (
                  <div
                    key={cv.fileName}
                    className="bg-gray-50 border rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {cv.fileName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cv.eligible
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {cv.eligible ? "Eligible" : "Not Eligible"}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {cv.matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          handleEmailChange(cv.fileName, e.target.value)
                        }
                        placeholder="student@example.com"
                        className={`flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          email && !isValid
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      <button
                        onClick={() => handleLocalSendEmail(cv.fileName)}
                        disabled={sendingEmails[cv.fileName] || !isValid}
                        className={`bg-gradient-to-r hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition whitespace-nowrap disabled:opacity-50 ${
                          isValid
                            ? "from-green-500 to-emerald-500"
                            : "from-gray-400 to-gray-500"
                        }`}
                      >
                        {sendingEmails[cv.fileName] ? "Sending..." : "Send"}
                      </button>
                    </div>
                    {email && !isValid && (
                      <p className="text-red-500 text-sm mt-1">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminCVHistory: React.FC = () => {
  const [screenings, setScreenings] = useState<ScreeningHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedScreening, setSelectedScreening] =
    useState<ScreeningHistory | null>(null);
  const [cvsWithoutEmail, setCvsWithoutEmail] = useState<CVWithoutEmail[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);

  useEffect(() => {
    fetchScreeningHistory();
  }, []);

  const fetchScreeningHistory = async () => {
    try {
      const res = await API.get("/admin/cv-screening-history");
      setScreenings(res.data);
    } catch (err: any) {
      console.error("Failed to fetch screening history:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load screening history",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindMissingEmails = async (screening: ScreeningHistory) => {
    setLoadingCVs(true);
    setSelectedScreening(screening);

    try {
      const res = await API.get(
        `/admin/cvs-without-email/${screening.screeningId}`
      );
      setCvsWithoutEmail(res.data.cvs || []);
      setShowEmailModal(true);
    } catch (err: any) {
      console.error("Failed to fetch CVs without email:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to load CVs without email",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleSendEmail = async (fileName: string, email: string) => {
    try {
      const res = await API.post("/admin/send-link", {
        email,
        screeningId: selectedScreening?.screeningId,
        fileName,
      });

      Swal.fire({
        icon: "success",
        title: "Email Sent!",
        text: res.data.message,
        confirmButtonColor: "#10B981",
      });

      // Remove from the list after successful send
      setCvsWithoutEmail((prev) =>
        prev.filter((cv) => cv.fileName !== fileName)
      );

      // Refresh screening history to update invitation count
      fetchScreeningHistory();
    } catch (err: any) {
      console.error("Send Email Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: err.response?.data?.message || "Failed to send email.",
        confirmButtonColor: "#EF4444",
      });
      throw err; // Re-throw to handle in modal
    }
  };

  const handleSendBulkEmails = async (
    emailsToSend: Array<{ email: string; fileName: string }>
  ) => {
    try {
      const res = await API.post("/admin/send-bulk-links", {
        emails: emailsToSend,
        screeningId: selectedScreening?.screeningId,
      });

      let resultMessage = `Successfully sent ${res.data.sentEmails.length} invitations!`;

      if (res.data.failedEmails.length > 0) {
        resultMessage += `<br><br>Failed to send: ${res.data.failedEmails
          .map((f: any) => f.email)
          .join(", ")}`;
      }

      Swal.fire({
        icon: res.data.failedEmails.length > 0 ? "warning" : "success",
        title:
          res.data.failedEmails.length > 0 ? "Partial Success" : "Success!",
        html: resultMessage,
        confirmButtonColor: "#10B981",
      });

      // Remove successfully sent CVs from the list
      const failedFileNames = res.data.failedEmails.map((f: any) => f.fileName);
      setCvsWithoutEmail((prev) =>
        prev.filter((cv) => failedFileNames.includes(cv.fileName))
      );

      // Refresh screening history to update invitation count
      fetchScreeningHistory();
    } catch (err: any) {
      console.error("Bulk Send Email Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: err.response?.data?.message || "Failed to send bulk emails.",
        confirmButtonColor: "#EF4444",
      });
      throw err; // Re-throw to handle in modal
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#F9FAFB] min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col md:ml-64">
          <main className="p-6 flex-grow max-w-6xl mx-auto w-full">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="p-6 flex-grow max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#4F46E5]">
              CV Screening History
            </h1>
            <Link
              to="/admin/cv-filter"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              New Screening
            </Link>
          </div>

          {screenings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg mb-4">
                No screening history found.
              </p>
              <Link
                to="/admin/cv-filter"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Start New Screening
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {screenings.map((screening) => (
                <div
                  key={screening._id}
                  className="bg-white rounded-2xl shadow-md p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {screening.jobRequirement.length > 100
                          ? `${screening.jobRequirement.substring(0, 100)}...`
                          : screening.jobRequirement}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">
                            Screening ID:
                          </span>
                          <p className="text-gray-800 font-mono text-xs">
                            {screening.screeningId}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            Date:
                          </span>
                          <p className="text-gray-800">
                            {format(
                              new Date(screening.createdAt),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            Results:
                          </span>
                          <p className="text-gray-800">
                            <span className="text-green-600 font-semibold">
                              {screening.eligibleCount}
                            </span>{" "}
                            / {screening.totalAnalyzed} Eligible
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            Invitations:
                          </span>
                          <p className="text-gray-800">
                            <span className="text-purple-600 font-semibold">
                              {screening.invitationsSent}
                            </span>{" "}
                            Sent
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            Missing Emails:
                          </span>
                          <p className="text-gray-800">
                            <span className="text-orange-600 font-semibold">
                              {screening.eligibleCount -
                                screening.invitationsSent}
                            </span>{" "}
                            Remaining
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Link
                        to={`/admin/cv-screening/${screening.screeningId}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-center text-sm"
                      >
                        View Details
                      </Link>
                      {screening.eligibleCount - screening.invitationsSent >
                        0 && (
                        <button
                          onClick={() => handleFindMissingEmails(screening)}
                          disabled={loadingCVs}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm disabled:opacity-50"
                        >
                          {loadingCVs ? "Loading..." : "Add Emails"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <EmailModal
            show={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            selectedScreening={selectedScreening}
            cvsWithoutEmail={cvsWithoutEmail}
            loadingCVs={loadingCVs}
            onSendEmail={handleSendEmail}
            onSendBulkEmails={handleSendBulkEmails}
          />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminCVHistory;
