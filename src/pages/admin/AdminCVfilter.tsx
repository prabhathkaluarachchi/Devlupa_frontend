import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import API from "../../utils/axiosInstance";
import Swal from "sweetalert2";

interface CVResult {
  fileName: string;
  matchScore: number;
  matchingRequirements: string[];
  missingRequirements: string[];
  extractedEmail: string | null;
  eligible: boolean;
  error?: string;
  cvFileId?: string;
}

const AdminCVFilter: React.FC = () => {
  const [requirement, setRequirement] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CVResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailInputs, setEmailInputs] = useState<{ [key: string]: string }>({});
  const [sendingEmails, setSendingEmails] = useState<{ [key: string]: boolean }>({});
  const [threshold, setThreshold] = useState<number>(45);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [screeningId, setScreeningId] = useState<string | null>(null);

  // Handle multiple file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
      setResults([]);
      setScreeningId(null);

      const newEmailInputs: { [key: string]: string } = {};
      newFiles.forEach((file) => {
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
    setThreshold(45);
    setScreeningId(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Analyze Multiple CVs
  const analyzeCVs = async () => {
    if (!files.length || !requirement.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please upload CV files and enter the job requirement.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setScreeningId(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("cvs", file);
      });
      formData.append("requirement", requirement);
      formData.append("threshold", threshold.toString());

      const res = await API.post("/admin/cv-filter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(res.data.results || []);
      setScreeningId(res.data.screeningId);

      const newEmailInputs: { [key: string]: string } = {};
      res.data.results.forEach((result: CVResult) => {
        newEmailInputs[result.fileName] = result.extractedEmail || "";
      });
      setEmailInputs(newEmailInputs);
    } catch (err: any) {
      console.error("CV Analysis Error:", err);
      Swal.fire({
        icon: "error",
        title: "Analysis Failed",
        text: err.response?.data?.message || "⚠️ Failed to analyze CVs.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle email input change for specific CV
  const handleEmailChange = (fileName: string, email: string) => {
    setEmailInputs((prev) => ({
      ...prev,
      [fileName]: email,
    }));
  };

  // Send registration email for specific CV
  const handleSendEmail = async (fileName: string) => {
    const email = emailInputs[fileName];

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter or verify the student's email address.",
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
      const res = await API.post("/admin/send-link", { 
        email, 
        screeningId, 
        fileName 
      });
      Swal.fire({
        icon: "success",
        title: "Email Sent!",
        text: res.data.message,
        confirmButtonColor: "#10B981",
      });
    } catch (err: any) {
      console.error("Send Email Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: err.response?.data?.message || "Failed to send email.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setSendingEmails((prev) => ({ ...prev, [fileName]: false }));
    }
  };

  // Helper function to get fileName by email
  const getFileNameByEmail = (email: string) => {
    const entry = Object.entries(emailInputs).find(([fileName, emailValue]) => 
      emailValue === email
    );
    return entry ? entry[0] : '';
  };

  // Send bulk emails to all eligible students
  const handleSendBulkEmails = async () => {
    const eligibleResults = results.filter(
      (result) => result.eligible && !result.error
    );

    if (eligibleResults.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Eligible Students",
        text: "No eligible students found to send emails.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    // Collect valid emails with file names
    const emailsToSend: Array<{email: string, fileName: string}> = [];
    const missingEmails: string[] = [];
    const invalidEmails: string[] = [];

    eligibleResults.forEach((result) => {
      const email = emailInputs[result.fileName]?.trim();
      if (email && isValidEmail(email)) {
        emailsToSend.push({ email, fileName: result.fileName });
      } else if (!email) {
        missingEmails.push(result.fileName);
      } else {
        invalidEmails.push(result.fileName);
      }
    });

    // Show warning for missing emails but proceed with available ones
    if (missingEmails.length > 0 || invalidEmails.length > 0) {
      let warningMessage = "";
      if (missingEmails.length > 0) {
        warningMessage += `Missing emails for: ${missingEmails
          .slice(0, 5)
          .join(", ")}${
          missingEmails.length > 5
            ? ` and ${missingEmails.length - 5} more`
            : ""
        }\n`;
      }
      if (invalidEmails.length > 0) {
        warningMessage += `Invalid emails for: ${invalidEmails
          .slice(0, 5)
          .join(", ")}${
          invalidEmails.length > 5
            ? ` and ${invalidEmails.length - 5} more`
            : ""
        }\n`;
      }
      warningMessage += `\nDo you want to send invitations to ${emailsToSend.length} students with valid emails and skip the others?`;

      const result = await Swal.fire({
        icon: "warning",
        title: "Email Issues Found",
        html: warningMessage.replace(/\n/g, "<br>"),
        showCancelButton: true,
        confirmButtonText: "Yes, Send",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#10B981",
        cancelButtonColor: "#6B7280",
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    if (emailsToSend.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Valid Emails",
        text: "No valid email addresses found for eligible students.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    setSendingBulk(true);

    try {
      const res = await API.post("/admin/send-bulk-links", {
        emails: emailsToSend,
        screeningId
      });

      let resultMessage = `Successfully sent ${res.data.sentEmails.length} invitations!`;

      if (res.data.failedEmails.length > 0) {
        resultMessage += `<br><br>Failed to send: ${res.data.failedEmails
          .map((f: any) => f.email)
          .join(", ")}`;
      }

      if (missingEmails.length > 0) {
        resultMessage += `<br><br>Skipped (no email): ${missingEmails.join(", ")}`;
      }

      Swal.fire({
        icon: res.data.failedEmails.length > 0 ? "warning" : "success",
        title: res.data.failedEmails.length > 0 ? "Partial Success" : "Success!",
        html: resultMessage,
        confirmButtonColor: "#10B981",
      });
    } catch (err: any) {
      console.error("Bulk Send Email Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: err.response?.data?.message || "Failed to send bulk emails.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setSendingBulk(false);
    }
  };

  // Generate PDF Report
  const handleGenerateReport = async () => {
    if (results.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No analysis results available to generate report.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    setGeneratingReport(true);

    try {
      const response = await API.post(
        "/admin/generate-report",
        {
          results,
          threshold,
          requirement,
          emailInputs,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cv-screening-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Report Generated!",
        text: "PDF report generated successfully!",
        confirmButtonColor: "#10B981",
      });
    } catch (err: any) {
      console.error("Report Generation Error:", err);
      Swal.fire({
        icon: "error",
        title: "Generation Failed",
        text: err.response?.data?.message || "Failed to generate PDF report.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Get categorized results
  const eligibleResults = results.filter(
    (result) => result.eligible && !result.error
  );
  const notEligibleResults = results.filter(
    (result) => !result.eligible && !result.error
  );
  const errorResults = results.filter((result) => result.error);

  // Get email status counts
  const eligibleWithEmail = eligibleResults.filter(
    (result) =>
      emailInputs[result.fileName] && isValidEmail(emailInputs[result.fileName])
  );
  const eligibleWithoutEmail = eligibleResults.filter(
    (result) =>
      !emailInputs[result.fileName] ||
      !isValidEmail(emailInputs[result.fileName])
  );

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="p-6 flex-grow max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-[#4F46E5]">
              Internship Eligibility Checking
            </h1>
            <a 
              href="/admin/cv-history" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              View History
            </a>
          </div>

          {/* Upload & Requirement Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <label className="block font-medium mb-2 text-gray-700">
              Upload CV Files (PDF, DOCX, TXT) - Up to 100 files
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
              className="w-full border border-gray-300 rounded p-3 h-32 mb-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Eligibility Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter threshold percentage"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum score required for eligibility (Default: 45%)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={analyzeCVs}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow transition flex-1"
              >
                {loading
                  ? `Analyzing ${files.length} CV(s)...`
                  : `Analyze ${files.length} CV(s)`}
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
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-2 animate-pulse">
                    Analyzing CVs...
                  </h3>

                  <div className="flex justify-center space-x-2 mb-4">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>

                  <p className="text-gray-600 mb-2">
                    Processing {files.length} CV{files.length > 1 ? "s" : ""}
                  </p>

                  <p className="text-sm text-gray-500">
                    This may take a few moments depending on file sizes...
                  </p>

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
                <div className="flex gap-2">
                  {eligibleResults.length > 0 && (
                    <>
                      <button
                        onClick={handleSendBulkEmails}
                        disabled={sendingBulk}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm disabled:opacity-50"
                      >
                        {sendingBulk
                          ? "Sending..."
                          : `Send All (${eligibleWithEmail.length})`}
                      </button>
                      <button
                        onClick={handleGenerateReport}
                        disabled={generatingReport}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm disabled:opacity-50"
                      >
                        {generatingReport ? "Generating..." : "PDF Report"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={resetForm}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm"
                  >
                    New Analysis
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">
                    {results.length}
                  </p>
                  <p className="text-gray-600">Total Analyzed</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                  <p className="text-2xl font-bold text-green-600">
                    {eligibleResults.length}
                  </p>
                  <p className="text-gray-600">Eligible</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-600">
                    {eligibleWithEmail.length}
                  </p>
                  <p className="text-gray-600">With Email</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                  <p className="text-2xl font-bold text-red-600">
                    {notEligibleResults.length}
                  </p>
                  <p className="text-gray-600">Not Eligible</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100">
                  <p className="text-2xl font-bold text-yellow-600">
                    {threshold}%
                  </p>
                  <p className="text-gray-600">Threshold</p>
                </div>
              </div>

              {/* Email Status Summary */}
              {eligibleWithoutEmail.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">⚠️</span>
                    <p className="text-yellow-800 font-medium">
                      {eligibleWithoutEmail.length} eligible candidate(s)
                      missing email addresses
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Eligible CVs Section */}
          {eligibleResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg mr-2">
                  ✅
                </span>
                Eligible Candidates ({eligibleResults.length})
                <span className="ml-4 text-sm font-normal text-gray-600">
                  {eligibleWithEmail.length} with email •{" "}
                  {eligibleWithoutEmail.length} without email
                </span>
              </h2>
              {eligibleResults.map((result, index) => (
                <CVResultCard
                  key={index}
                  result={result}
                  emailInputs={emailInputs}
                  sendingEmails={sendingEmails}
                  onEmailChange={handleEmailChange}
                  onSendEmail={handleSendEmail}
                />
              ))}
            </div>
          )}

          {/* Not Eligible CVs Section */}
          {notEligibleResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-lg mr-2">
                  ❌
                </span>
                Not Eligible Candidates ({notEligibleResults.length})
              </h2>
              {notEligibleResults.map((result, index) => (
                <CVResultCard
                  key={index}
                  result={result}
                  emailInputs={emailInputs}
                  sendingEmails={sendingEmails}
                  onEmailChange={handleEmailChange}
                  onSendEmail={handleSendEmail}
                />
              ))}
            </div>
          )}

          {/* Error CVs Section */}
          {errorResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-yellow-600 mb-4 flex items-center">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-lg mr-2">
                  ⚠️
                </span>
                Failed Analysis ({errorResults.length})
              </h2>
              {errorResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border rounded-2xl p-6 mb-4"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {result.fileName}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Analysis Failed
                    </span>
                  </div>
                  <p className="text-red-600 mt-2">{result.error}</p>
                </div>
              ))}
            </div>
          )}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

// CVResultCard component
const CVResultCard: React.FC<{
  result: CVResult;
  emailInputs: { [key: string]: string };
  sendingEmails: { [key: string]: boolean };
  onEmailChange: (fileName: string, email: string) => void;
  onSendEmail: (fileName: string) => void;
}> = ({ result, emailInputs, sendingEmails, onEmailChange, onSendEmail }) => {
  const hasValidEmail =
    emailInputs[result.fileName] &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInputs[result.fileName]);

  return (
    <div className="bg-gray-50 border rounded-2xl p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {result.fileName}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              result.eligible
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {result.eligible ? "Eligible" : "Not Eligible"}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {result.matchScore}%
          </span>
          {result.eligible && !hasValidEmail && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              No Email
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Matching Requirements */}
        {result.matchingRequirements.length > 0 && (
          <div>
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
          <div>
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
      </div>

      {/* Email Section for All CVs */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block font-medium mb-2 text-gray-700">
          Student Email{" "}
          {!hasValidEmail && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailInputs[result.fileName] || ""}
            onChange={(e) => onEmailChange(result.fileName, e.target.value)}
            placeholder="student@example.com"
            className={`flex-1 border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !hasValidEmail ? "border-red-300" : "border-gray-300"
            }`}
          />
          <button
            onClick={() => onSendEmail(result.fileName)}
            disabled={sendingEmails[result.fileName] || !hasValidEmail}
            className={`bg-gradient-to-r hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl shadow transition whitespace-nowrap disabled:opacity-50 ${
              result.eligible 
                ? "from-green-500 to-emerald-500" 
                : "from-blue-500 to-cyan-500"
            }`}
          >
            {sendingEmails[result.fileName] ? "Sending..." : "Send Link"}
          </button>
        </div>
        {result.extractedEmail && (
          <p className="text-sm text-gray-500 mt-1">
            Extracted from CV: {result.extractedEmail}
          </p>
        )}
        {!hasValidEmail && (
          <p className="text-sm text-red-500 mt-1">
            Please enter a valid email address to send invitation
          </p>
        )}
        {!result.eligible && (
          <p className="text-sm text-blue-500 mt-1">
            Manual override: Sending platform registration link despite eligibility score
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminCVFilter;