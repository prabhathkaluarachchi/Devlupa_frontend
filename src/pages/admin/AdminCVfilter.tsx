import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import API from "../../utils/axiosInstance";

interface CVResult {
  fileName: string;
  matchScore: number;
  matchingRequirements: string[];
  missingRequirements: string[];
  extractedEmail: string | null;
  eligible: boolean;
  error?: string;
}

const AdminCVFilter: React.FC = () => {
  const [requirement, setRequirement] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CVResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailInputs, setEmailInputs] = useState<{ [key: string]: string }>({});
  const [sendingEmails, setSendingEmails] = useState<{ [key: string]: boolean }>({});

  // Handle multiple file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
      // Reset previous results
      setResults([]);
      
      // Pre-fill email inputs with extracted emails (you'll need to extract them after analysis)
      const newEmailInputs: { [key: string]: string } = {};
      newFiles.forEach(file => {
        newEmailInputs[file.name] = "";
      });
      setEmailInputs(newEmailInputs);
    }
  };

  // Reset form
  const resetForm = () => {
    setRequirement("");
    setFiles([]);
    setResults([]);
    setEmailInputs({});
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Analyze Multiple CVs
  const analyzeCVs = async () => {
    if (!files.length || !requirement.trim()) {
      alert("Please upload CV files and enter the job requirement.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("cvs", file);
      });
      formData.append("requirement", requirement);

      const res = await API.post("/admin/cv-filter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(res.data.results || []);
      
      // Pre-fill email inputs with extracted emails
      const newEmailInputs: { [key: string]: string } = {};
      res.data.results.forEach((result: CVResult) => {
        newEmailInputs[result.fileName] = result.extractedEmail || "";
      });
      setEmailInputs(newEmailInputs);

    } catch (err: any) {
      console.error("CV Analysis Error:", err);
      alert(err.response?.data?.message || "⚠️ Failed to analyze CVs.");
    } finally {
      setLoading(false);
    }
  };

  // Handle email input change for specific CV
  const handleEmailChange = (fileName: string, email: string) => {
    setEmailInputs(prev => ({
      ...prev,
      [fileName]: email
    }));
  };

  // Send registration email for specific CV
  const handleSendEmail = async (fileName: string) => {
    const email = emailInputs[fileName];
    
    if (!email.trim()) {
      alert("Please enter or verify the student's email address.");
      return;
    }

    setSendingEmails(prev => ({ ...prev, [fileName]: true }));

    try {
      const res = await API.post("/admin/send-link", { email });
      alert(res.data.message);
    } catch (err: any) {
      console.error("Send Email Error:", err);
      alert(err.response?.data?.message || "Failed to send email.");
    } finally {
      setSendingEmails(prev => ({ ...prev, [fileName]: false }));
    }
  };

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="p-6 flex-grow max-w-6xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-[#4F46E5] mb-6">
            CV Filter – Internship Eligibility (Multiple CVs)
          </h1>

          {/* Upload & Requirement Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <label className="block font-medium mb-2 text-gray-700">
              Upload CV Files (PDF, DOCX, TXT) - Multiple Selection
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded p-2 mb-4"
            />
            
            {files.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Selected files: {files.length} CV(s)
                </p>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                  {files.map((file, index) => (
                    <div key={index} className="text-sm text-gray-700 py-1">
                      • {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="block font-medium mb-2 text-gray-700">
              Job Requirement / Description
            </label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Paste LinkedIn job post or company requirement here..."
              className="w-full border border-gray-300 rounded p-3 h-32"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={analyzeCVs}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow transition flex-1"
              >
                {loading ? `Analyzing ${files.length} CV(s)...` : `Analyze ${files.length} CV(s)`}
              </button>
              
              {(files.length > 0 || requirement) && (
                <button
                  onClick={resetForm}
                  type="button"
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Beautiful Loading Animation */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                <div className="text-center">
                  {/* Animated Spinner */}
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                  </div>
                  
                  {/* Pulsing Text */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 animate-pulse">
                    Analyzing CVs...
                  </h3>
                  
                  {/* Progress Dots */}
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  
                  {/* File Count */}
                  <p className="text-gray-600 mb-2">
                    Processing {files.length} CV{files.length > 1 ? 's' : ''}
                  </p>
                  
                  {/* Progress Message */}
                  <p className="text-sm text-gray-500">
                    This may take a few moments depending on file sizes...
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Analysis Summary
                </h2>
                <button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm"
                >
                  New Analysis
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">{results.length}</p>
                  <p className="text-gray-600">Total Analyzed</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                  <p className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.eligible).length}
                  </p>
                  <p className="text-gray-600">Eligible</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                  <p className="text-2xl font-bold text-red-600">
                    {results.filter(r => !r.eligible).length}
                  </p>
                  <p className="text-gray-600">Not Eligible</p>
                </div>
              </div>
            </div>
          )}

          {/* Individual CV Results */}
          {results.map((result, index) => (
            <div key={index} className="bg-gray-50 border rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {result.fileName}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.eligible 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {result.eligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>

              {result.error ? (
                <p className="text-red-600 mb-4">{result.error}</p>
              ) : (
                <>
                  <p className="text-lg text-gray-700 mb-2">
                    Match Score:{" "}
                    <span
                      className={`font-bold ${
                        result.matchScore >= 75 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.matchScore}%
                    </span>
                  </p>

                  {/* Matching Requirements */}
                  {result.matchingRequirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-green-600 mb-2">
                        ✅ Matching Requirements:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.matchingRequirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="text-gray-700 text-sm">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Requirements */}
                  {result.missingRequirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-red-600 mb-2">
                        ❌ Missing Requirements:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.missingRequirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="text-gray-700 text-sm">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Email Section for Eligible CVs */}
                  {result.eligible && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <label className="block font-medium mb-2 text-gray-700">
                        Student Email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={emailInputs[result.fileName] || ""}
                          onChange={(e) => handleEmailChange(result.fileName, e.target.value)}
                          placeholder="student@example.com"
                          className="flex-1 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleSendEmail(result.fileName)}
                          disabled={sendingEmails[result.fileName]}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl shadow transition whitespace-nowrap disabled:opacity-50"
                        >
                          {sendingEmails[result.fileName] ? "Sending..." : "Send Link"}
                        </button>
                      </div>
                      {result.extractedEmail && (
                        <p className="text-sm text-gray-500 mt-1">
                          Extracted from CV: {result.extractedEmail}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminCVFilter;