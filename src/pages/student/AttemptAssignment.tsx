import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/axiosInstance";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";

interface StudentSubmission {
  content?: string;
  fileUrl?: string;
  status?: string;
  grade?: number;
  remarks?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  dueDate?: string;
  submitted?: boolean;
  studentSubmission?: StudentSubmission;
}

const AttemptAssignment: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const fetchAssignment = async () => {
      try {
        const res = await API.get(`/assignments/${assignmentId}`);
        setAssignment(res.data);

        if (res.data.submitted && res.data.studentSubmission) {
          setSubmission(res.data.studentSubmission.content || "");
          setFile(null);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch assignment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async () => {
    try {
      if (!submission.trim() && !file) {
        setError("⚠️ Please provide text or upload a file.");
        return;
      }

      const formData = new FormData();
      formData.append("assignmentId", assignmentId!);
      if (submission.trim()) formData.append("content", submission);
      if (file) formData.append("file", file);

      const res = await API.post(
        `/assignments/${assignmentId}/submit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccessMsg("✅ Assignment submitted successfully!");
      setError(null);

      setAssignment((prev) =>
        prev
          ? {
              ...prev,
              submitted: true,
              studentSubmission: {
                content: submission,
                fileUrl: res.data.fileUrl,
                status: "submitted",
              },
            }
          : prev
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "❌ Failed to submit assignment.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!assignment)
    return <div className="text-center mt-10">Assignment not found.</div>;

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64 transition-all">
        <main className="flex-grow max-w-5xl mx-auto p-6 w-full">
          <div className="bg-white shadow-lg rounded-2xl p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-[#4F46E5] mb-8">
              {assignment.title}
            </h1>

            {/* Description */}
            <p className="mb-6 text-gray-700 leading-relaxed">
              {assignment.description}
            </p>

            {/* Image */}
            {assignment.imageUrl && (
              <img
                src={
                  assignment.imageUrl.startsWith("http")
                    ? assignment.imageUrl
                    : `${import.meta.env.VITE_BACKEND_BASE_URL}${assignment.imageUrl}`
                }
                alt={assignment.title}
                className="mb-6 rounded-lg shadow-md max-h-80 w-full object-cover"
              />
            )}

            {/* Due Date */}
            {assignment.dueDate && (
              <p className="mb-6 text-sm text-gray-600">
                ⏰ <span className="font-medium">Due:</span>{" "}
                {new Date(assignment.dueDate).toLocaleString()}
              </p>
            )}

            {/* Already Submitted */}
            {assignment.submitted ? (
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <p className="font-medium text-green-700 mb-3">
                  ✅ You have already submitted this assignment.
                </p>

                {assignment.studentSubmission?.content && (
                  <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3 text-gray-800">
                    {assignment.studentSubmission.content}
                  </pre>
                )}

                {assignment.studentSubmission?.fileUrl && (
                  <a
                    href={`${import.meta.env.VITE_BACKEND_BASE_URL}${assignment.studentSubmission.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium underline"
                  >
                    📂 Download submitted file
                  </a>
                )}

                {/* Grading */}
                {assignment.studentSubmission?.status === "graded" && (
                  <div className="mt-4 bg-white border rounded-lg p-4 shadow-sm">
                    <p className="text-green-700 font-semibold text-lg">
                      🎉 Graded: {assignment.studentSubmission.grade}%
                    </p>
                    {assignment.studentSubmission?.remarks && (
                      <p className="mt-2 text-gray-700">
                        📝 Feedback: {assignment.studentSubmission.remarks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Submission Form */
              <div className="flex flex-col space-y-4">
                <textarea
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  placeholder="✍️ Write your answer here..."
                  className="border border-gray-300 rounded-lg p-4 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                ></textarea>

                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />

                <button
                  onClick={handleSubmit}
                  className="mt-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
                >
                  🚀 Submit Assignment
                </button>

                {/* Alerts */}
                {successMsg && (
                  <p className="text-green-600 font-medium">{successMsg}</p>
                )}
                {error && <p className="text-red-600 font-medium">{error}</p>}
              </div>
            )}
          </div>
        </main>

        <StudentFooter />
      </div>
    </div>
  );
};

export default AttemptAssignment;
