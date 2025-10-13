import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import API from "../../utils/axiosInstance";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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

const AdminCVHistory: React.FC = () => {
  const [screenings, setScreenings] = useState<ScreeningHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreeningHistory();
  }, []);

  const fetchScreeningHistory = async () => {
    try {
      const res = await API.get("/admin/cv-screening-history");
      setScreenings(res.data);
    } catch (err: any) {
      console.error("Failed to fetch screening history:", err);
    } finally {
      setLoading(false);
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
              <p className="text-gray-500 text-lg mb-4">No screening history found.</p>
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
                <div key={screening._id} className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {screening.jobRequirement.length > 100 
                          ? `${screening.jobRequirement.substring(0, 100)}...`
                          : screening.jobRequirement
                        }
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Screening ID:</span>
                          <p className="text-gray-800 font-mono text-xs">{screening.screeningId}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Date:</span>
                          <p className="text-gray-800">
                            {format(new Date(screening.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Results:</span>
                          <p className="text-gray-800">
                            <span className="text-green-600 font-semibold">{screening.eligibleCount}</span> / {screening.totalAnalyzed} Eligible
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Invitations:</span>
                          <p className="text-gray-800">
                            <span className="text-purple-600 font-semibold">{screening.invitationsSent}</span> Sent
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/admin/cv-screening/${screening.screeningId}`}
                      className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      View Details
                    </Link>
                  </div>
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

export default AdminCVHistory;