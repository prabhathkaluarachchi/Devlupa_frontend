import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import API from "../../utils/axiosInstance";
import { format } from "date-fns";

interface ScreeningDetail {
  screeningId: string;
  jobRequirement: string;
  threshold: number;
  results: Array<{
    _id: string;
    fileName: string;
    matchScore: number;
    matchingRequirements: string[];
    missingRequirements: string[];
    extractedEmail: string | null;
    eligible: boolean;
    error?: string;
    emailSent: boolean;
    emailSentTo?: string;
    emailSentAt?: string;
    cvFile: {
      _id: string;
      originalName: string;
      fileType: string;
      fileSize: number;
    };
  }>;
  totalAnalyzed: number;
  eligibleCount: number;
  invitationsSent: number;
  createdAt: string;
}

const AdminCVScreeningDetails: React.FC = () => {
  const { screeningId } = useParams<{ screeningId: string }>();
  const [screening, setScreening] = useState<ScreeningDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (screeningId) {
      fetchScreeningDetails();
    }
  }, [screeningId]);

  const fetchScreeningDetails = async () => {
    try {
      const res = await API.get(`/admin/cv-screening/${screeningId}`);
      setScreening(res.data);
    } catch (err: any) {
      console.error("Failed to fetch screening details:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCV = async (fileId: string, fileName: string) => {
    try {
      const response = await API.get(`/admin/download-cv/${fileId}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Failed to download CV:", err);
      alert('Failed to download CV file');
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

  if (!screening) {
    return (
      <div className="flex bg-[#F9FAFB] min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col md:ml-64">
          <main className="p-6 flex-grow max-w-6xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">Screening not found.</p>
              <Link 
                to="/admin/cv-history" 
                className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Back to History
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const eligibleResults = screening.results.filter(r => r.eligible && !r.error);
  const notEligibleResults = screening.results.filter(r => !r.eligible && !r.error);
  const errorResults = screening.results.filter(r => r.error);

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="p-6 flex-grow max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#4F46E5]">
                Screening Details
              </h1>
              <p className="text-gray-600 mt-2">Screening ID: {screening.screeningId}</p>
            </div>
            <Link 
              to="/admin/cv-history" 
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Back to History
            </Link>
          </div>

          {/* Screening Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Screening Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{screening.totalAnalyzed}</p>
                <p className="text-gray-600">Total Analyzed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{screening.eligibleCount}</p>
                <p className="text-gray-600">Eligible</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{screening.invitationsSent}</p>
                <p className="text-gray-600">Invitations Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{screening.threshold}%</p>
                <p className="text-gray-600">Threshold</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Created: {format(new Date(screening.createdAt), 'MMMM dd, yyyy HH:mm')}
            </div>
          </div>

          {/* Job Requirement */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Job Requirement</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{screening.jobRequirement}</p>
          </div>

          {/* Results Sections */}
          {eligibleResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                ✅ Eligible Candidates ({eligibleResults.length})
              </h2>
              {eligibleResults.map((result) => (
                <CVResultCard 
                  key={result._id} 
                  result={result} 
                  onDownload={downloadCV}
                />
              ))}
            </div>
          )}

          {notEligibleResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                ❌ Not Eligible Candidates ({notEligibleResults.length})
              </h2>
              {notEligibleResults.map((result) => (
                <CVResultCard 
                  key={result._id} 
                  result={result} 
                  onDownload={downloadCV}
                />
              ))}
            </div>
          )}

          {errorResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-yellow-600 mb-4">
                ⚠️ Analysis Errors ({errorResults.length})
              </h2>
              {errorResults.map((result) => (
                <div key={result._id} className="bg-gray-50 border rounded-2xl p-6 mb-4">
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

// CV Result Card for Details Page
const CVResultCard: React.FC<{
  result: any;
  onDownload: (fileId: string, fileName: string) => void;
}> = ({ result, onDownload }) => {
  return (
    <div className="bg-gray-50 border rounded-2xl p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {result.fileName}
          </h3>
          {result.emailSent && (
            <p className="text-sm text-green-600 mt-1">
              ✅ Invitation sent to {result.emailSentTo} on {format(new Date(result.emailSentAt!), 'MMM dd, HH:mm')}
            </p>
          )}
        </div>
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
          <button
            onClick={() => onDownload(result.cvFile._id, result.cvFile.originalName)}
            className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600"
          >
            Download CV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {result.matchingRequirements.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-green-600 mb-2">
              ✅ Matching Requirements:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {result.matchingRequirements.map((req: string, reqIndex: number) => (
                <li key={reqIndex} className="text-gray-700 text-sm">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.missingRequirements.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-red-600 mb-2">
              ❌ Missing Requirements:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {result.missingRequirements.map((req: string, reqIndex: number) => (
                <li key={reqIndex} className="text-gray-700 text-sm">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {result.extractedEmail && (
        <p className="text-sm text-gray-500">
          Extracted email: {result.extractedEmail}
        </p>
      )}
    </div>
  );
};

export default AdminCVScreeningDetails;