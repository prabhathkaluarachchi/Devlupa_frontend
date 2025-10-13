import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/axiosInstance";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";

interface Submission {
  _id: string;
  userId: string;
  userName: string;
  assignmentId: string;
  assignmentTitle: string;
  submission?: string;
  fileUrl?: string;
  score?: number;
  remarks?: string;
}

const GradeAssignment: React.FC = () => {
  const { assignmentId, userId } = useParams<{
    assignmentId: string;
    userId: string;
  }>();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<number | "">("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch submission
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await API.get(
          `/assignments/${assignmentId}/user/${userId}`
        );
        setSubmission(res.data);
        if (res.data.score !== undefined) setScore(res.data.score);
        if (res.data.remarks) setRemarks(res.data.remarks);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch submission");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [assignmentId, userId]);

  // Handle grading
  const handleGrade = async () => {
    if (!submission) return;

    try {
      await API.put(`/assignments/grade/${submission._id}`, {
        score,
        remarks,
      });
      navigate("/admin"); // back to admin dashboard
    } catch (err) {
      console.error(err);
      setError("Failed to grade assignment");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!submission) return <div className="p-6">Submission not found</div>;

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="p-6 flex-grow max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-[#4F46E5] mb-6">
            Grade Assignment
          </h1>

          {/* Show Student Submission */}
          <div className="bg-gray-50 border rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Student Submission
            </h3>

            {submission.submission && (
              <div className="mb-4">
                <h4 className="font-medium mb-1">Text Submission:</h4>
                <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
                  {submission.submission}
                </pre>
              </div>
            )}

            {submission.fileUrl && (
              <div className="mb-4">
                <h4 className="font-medium mb-1">Uploaded File:</h4>
                <a
                  href={`${import.meta.env.VITE_BACKEND_BASE_URL}${submission.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  📂 Download Submitted File
                </a>
              </div>
            )}
          </div>

          {/* Grading Form */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <label className="block font-medium mb-2">Score</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              placeholder="Enter score (e.g. 85)"
              className="w-full border border-gray-300 rounded p-2 mb-4"
            />

            <label className="block font-medium mb-2">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Feedback for student"
              className="w-full border border-gray-300 rounded p-2 h-24"
            />

            <button
              onClick={handleGrade}
              className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
            >
              Save Grade
            </button>
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default GradeAssignment;
