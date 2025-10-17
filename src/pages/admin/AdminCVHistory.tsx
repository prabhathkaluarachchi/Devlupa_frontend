import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import API from "../../utils/axiosInstance";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

interface ScreeningHistory {
  manualEmailsSent: number;
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
  emailSent?: boolean;
}

interface CVEligibleWithEmail {
  fileName: string;
  screeningId: string;
  matchScore: number;
  eligible: boolean;
  extractedEmail: string;
  emailSent: boolean;
}

// Separate EmailModal component to prevent re-renders
const EmailModal: React.FC<{
  show: boolean;
  onClose: () => void;
  selectedScreening: ScreeningHistory | null;
  cvsWithoutEmail: CVWithoutEmail[];
  cvsEligibleWithEmail: CVEligibleWithEmail[];
  loadingCVs: boolean;
  onSendEmail: (fileName: string, email: string, isManual?: boolean) => Promise<void>;
  onSendBulkEmails: (
    emails: Array<{ email: string; fileName: string; isManual?: boolean }>
  ) => Promise<void>;
  mode: 'missing' | 'eligible';
  onRefreshScreening: () => Promise<void>;
  onUpdateCVs: (mode: 'missing' | 'eligible', fileNames: string[]) => void;
}> = ({
  show,
  onClose,
  selectedScreening,
  cvsWithoutEmail,
  cvsEligibleWithEmail,
  loadingCVs,
  onSendEmail,
  onSendBulkEmails,
  mode,
  onRefreshScreening,
  onUpdateCVs,
}) => {
  const [emailInputs, setEmailInputs] = useState<{ [key: string]: string }>({});
  const [sendingEmails, setSendingEmails] = useState<{
    [key: string]: boolean;
  }>({});
  const [sendingBulk, setSendingBulk] = useState(false);

  // Get the current list of CVs based on mode
  const currentCVs = mode === 'missing' ? cvsWithoutEmail : cvsEligibleWithEmail;

  // Initialize email inputs when modal opens or CVs change
  useEffect(() => {
    if (show && currentCVs.length > 0) {
      const newEmailInputs: { [key: string]: string } = {};
      currentCVs.forEach((cv) => {
        if (mode === 'missing') {
          newEmailInputs[cv.fileName] = (cv as CVWithoutEmail).extractedEmail || "";
        } else {
          newEmailInputs[cv.fileName] = (cv as CVEligibleWithEmail).extractedEmail || "";
        }
      });
      setEmailInputs(newEmailInputs);
    }
  }, [show, currentCVs, mode]);

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
      const isManual = mode === 'missing';
      await onSendEmail(fileName, email, isManual);

      // Remove from local state after successful send
      setEmailInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[fileName];
        return newInputs;
      });

      // Notify parent to remove this CV from the list
      onUpdateCVs(mode, [fileName]);

      // Refresh screening data after successful send
      await onRefreshScreening();
    } catch (error) {
      console.error("Send Email Error:", error);
    } finally {
      setSendingEmails((prev) => ({ ...prev, [fileName]: false }));
    }
  };

  const handleLocalSendBulkEmails = async () => {
    const validCVs = currentCVs.filter((cv) => {
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
        isManual: mode === 'missing',
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

      // Notify parent to remove these CVs from the list
      const sentFileNames = validCVs.map(cv => cv.fileName);
      onUpdateCVs(mode, sentFileNames);

      // Refresh screening data after successful bulk send
      await onRefreshScreening();
    } catch (error) {
      console.error("Bulk Send Email Error:", error);
    } finally {
      setSendingBulk(false);
    }
  };

  const handleClose = () => {
    // Refresh screening data when modal closes to ensure latest counts
    onRefreshScreening();
    onClose();
  };

  if (!show || !selectedScreening) return null;

  const validCVs = currentCVs.filter((cv) => {
    const email = emailInputs[cv.fileName]?.trim();
    return email && isValidEmail(email);
  });

  const getModalTitle = () => {
    return mode === 'missing' 
      ? "Add Missing Emails" 
      : "Send Invitations to Eligible Candidates";
  };

  const getModalDescription = () => {
    return mode === 'missing'
      ? "CVs without valid email addresses"
      : "Eligible CVs with extracted email addresses";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {getModalTitle()}
            </h2>
            <button
              onClick={handleClose}
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
            {getModalDescription()}:{" "}
            <span className="font-semibold">{currentCVs.length}</span>
          </p>
          {mode === 'eligible' && (
            <p className="text-sm text-blue-600 mt-1">
              These CVs have extracted email addresses but invitations weren't sent during initial screening.
            </p>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loadingCVs ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : currentCVs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {mode === 'missing' ? 'All Emails Added!' : 'All Invitations Sent!'}
              </h3>
              <p className="text-gray-600">
                {mode === 'missing' 
                  ? 'All CVs have email addresses associated with them.'
                  : 'All eligible CVs with email addresses have been sent invitations.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">
                  {validCVs.length} of {currentCVs.length} CVs ready to send
                </span>
                {validCVs.length > 0 && (
                  <button
                    onClick={handleLocalSendBulkEmails}
                    disabled={sendingBulk}
                    className={`bg-gradient-to-r hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm disabled:opacity-50 ${
                      mode === 'missing' 
                        ? 'from-purple-500 to-pink-500' 
                        : 'from-green-500 to-emerald-500'
                    }`}
                  >
                    {sendingBulk
                      ? "Sending..."
                      : `Send All (${validCVs.length})`}
                  </button>
                )}
              </div>

              {currentCVs.map((cv) => {
                const email = emailInputs[cv.fileName] || "";
                const isValid = isValidEmail(email);
                const isAlreadySent = cv.emailSent;

                return (
                  <div
                    key={cv.fileName}
                    className={`border rounded-xl p-4 ${
                      isAlreadySent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
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
                          {isAlreadySent && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Sent
                            </span>
                          )}
                          {mode === 'eligible' && cv.extractedEmail && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              Extracted
                            </span>
                          )}
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
                        disabled={isAlreadySent || mode === 'eligible'}
                        className={`flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          (email && !isValid)
                            ? "border-red-300"
                            : isAlreadySent
                            ? "border-green-300 bg-green-50"
                            : mode === 'eligible'
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-300"
                        } ${(isAlreadySent || mode === 'eligible') ? 'cursor-not-allowed' : ''}`}
                      />
                      <button
                        onClick={() => handleLocalSendEmail(cv.fileName)}
                        disabled={sendingEmails[cv.fileName] || !isValid || isAlreadySent}
                        className={`bg-gradient-to-r hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition whitespace-nowrap disabled:opacity-50 ${
                          isValid && !isAlreadySent
                            ? mode === 'missing'
                              ? "from-green-500 to-emerald-500"
                              : "from-blue-500 to-cyan-500"
                            : "from-gray-400 to-gray-500"
                        }`}
                      >
                        {sendingEmails[cv.fileName] 
                          ? "Sending..." 
                          : isAlreadySent 
                            ? "Sent" 
                            : "Send"
                        }
                      </button>
                    </div>
                    {email && !isValid && (
                      <p className="text-red-500 text-sm mt-1">
                        Please enter a valid email address
                      </p>
                    )}
                    {mode === 'eligible' && cv.extractedEmail && (
                      <p className="text-blue-600 text-sm mt-1">
                        Email extracted from CV
                      </p>
                    )}
                    {isAlreadySent && (
                      <p className="text-green-600 text-sm mt-1">
                        Invitation already sent
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
              onClick={handleClose}
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
  const [emailModalMode, setEmailModalMode] = useState<'missing' | 'eligible'>('missing');
  const [selectedScreening, setSelectedScreening] = useState<ScreeningHistory | null>(null);
  const [cvsWithoutEmail, setCvsWithoutEmail] = useState<CVWithoutEmail[]>([]);
  const [cvsEligibleWithEmail, setCvsEligibleWithEmail] = useState<CVEligibleWithEmail[]>([]);
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
    setEmailModalMode('missing');

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

  const handleSendToEligibleWithEmail = async (screening: ScreeningHistory) => {
    setLoadingCVs(true);
    setSelectedScreening(screening);
    setEmailModalMode('eligible');

    try {
      const res = await API.get(
        `/admin/cvs-eligible-with-email/${screening.screeningId}`
      );
      setCvsEligibleWithEmail(res.data.cvs || []);
      setShowEmailModal(true);
    } catch (err: any) {
      console.error("Failed to fetch eligible CVs with email:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to load eligible CVs with email",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleSendEmail = async (fileName: string, email: string, isManual: boolean = false) => {
    try {
      const res = await API.post("/admin/send-link", {
        email,
        screeningId: selectedScreening?.screeningId,
        fileName,
        isManual,
      });

      Swal.fire({
        icon: "success",
        title: "Email Sent!",
        text: res.data.message,
        confirmButtonColor: "#10B981",
      });

      return res.data;
    } catch (err: any) {
      console.error("Send Email Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: err.response?.data?.message || "Failed to send email.",
        confirmButtonColor: "#EF4444",
      });
      throw err;
    }
  };

  const handleSendBulkEmails = async (
    emailsToSend: Array<{ email: string; fileName: string; isManual?: boolean }>
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

      return res.data;
    } catch (err: any) {
      console.error("Bulk Send Email Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: err.response?.data?.message || "Failed to send bulk emails.",
        confirmButtonColor: "#EF4444",
      });
      throw err;
    }
  };

  // Helper function to check if screening has any remaining emails to send - FIXED
  const hasRemainingEmails = (screening: ScreeningHistory) => {
    const totalSent = (screening.invitationsSent || 0) + (screening.manualEmailsSent || 0);
    return screening.eligibleCount - totalSent > 0;
  };

  // Update the refreshScreeningData function to be more robust:
  const refreshScreeningData = async () => {
    try {
      // Refresh the entire screening list
      const res = await API.get("/admin/cv-screening-history");
      setScreenings(res.data);
      
      // Also refresh the selected screening if it exists
      if (selectedScreening) {
        const updatedScreening = res.data.find(
          (s: ScreeningHistory) => s.screeningId === selectedScreening.screeningId
        );
        if (updatedScreening) {
          setSelectedScreening(updatedScreening);
        }
      }
    } catch (error) {
      console.error("Failed to refresh screening data:", error);
    }
  };

  // Handle updating CV lists when emails are sent
  const handleUpdateCVs = (mode: 'missing' | 'eligible', fileNames: string[]) => {
    if (mode === 'missing') {
      setCvsWithoutEmail(prev => 
        prev.filter(cv => !fileNames.includes(cv.fileName))
      );
    } else {
      setCvsEligibleWithEmail(prev => 
        prev.filter(cv => !fileNames.includes(cv.fileName))
      );
    }
  };

  // Calculate remaining emails for display
  const getRemainingEmails = (screening: ScreeningHistory) => {
    const totalSent = (screening.invitationsSent || 0) + (screening.manualEmailsSent || 0);
    return screening.eligibleCount - totalSent;
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
                            Remaining:
                          </span>
                          <p className="text-gray-800">
                            <span className={`font-semibold ${
                              hasRemainingEmails(screening) 
                                ? "text-orange-600" 
                                : "text-green-600"
                            }`}>
                              {getRemainingEmails(screening)}
                            </span>{" "}
                            Not Sent
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
                      
                      {/* Button for CVs with missing emails - only show if there are remaining emails */}
                      {hasRemainingEmails(screening) && (
                        <button
                          onClick={() => handleFindMissingEmails(screening)}
                          disabled={loadingCVs}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm disabled:opacity-50"
                        >
                          {loadingCVs ? "Loading..." : "Add Missing Emails"}
                        </button>
                      )}
                      
                      {/* Button for eligible CVs with emails that weren't sent - only show if there are remaining emails */}
                      {hasRemainingEmails(screening) && (
                        <button
                          onClick={() => handleSendToEligibleWithEmail(screening)}
                          disabled={loadingCVs}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm disabled:opacity-50"
                        >
                          {loadingCVs ? "Loading..." : "Send to Eligible"}
                        </button>
                      )}

                      {/* Show completion message when no emails remaining */}
                      {!hasRemainingEmails(screening) && (
                        <div className="text-center p-2 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-green-600 text-sm font-medium">
                            ✅ All invitations sent
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <EmailModal
            show={showEmailModal}
            onClose={() => {
              fetchScreeningHistory(); // Force refresh when modal closes
              setShowEmailModal(false);
            }}
            selectedScreening={selectedScreening}
            cvsWithoutEmail={cvsWithoutEmail}
            cvsEligibleWithEmail={cvsEligibleWithEmail}
            loadingCVs={loadingCVs}
            onSendEmail={handleSendEmail}
            onSendBulkEmails={handleSendBulkEmails}
            mode={emailModalMode}
            onRefreshScreening={refreshScreeningData}
            onUpdateCVs={handleUpdateCVs}
          />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminCVHistory;