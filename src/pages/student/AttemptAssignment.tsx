import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/axiosInstance";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/StudentFooter";

interface StudentSubmission {
  content?: string;
  fileUrl?: string;
  status?: string; // "submitted" | "graded"
  grade?: number;
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
          setFile(null); // optional
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
        setError("Please provide text or upload a file.");
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

      setSuccessMsg("Assignment submitted successfully!");
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
      setError(err.response?.data?.message || "Failed to submit assignment.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!assignment)
    return <div className="text-center mt-10">Assignment not found.</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <StudentHeader />
      <main className="flex-grow max-w-3xl mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
          <p className="mb-4">{assignment.description}</p>
          {assignment.imageUrl && (
            <img
              src={
                assignment.imageUrl.startsWith("http")
                  ? assignment.imageUrl
                  : `http://localhost:5000${assignment.imageUrl}`
              }
              alt={assignment.title}
              className="mb-4 rounded"
            />
          )}
          {assignment.dueDate && (
            <p className="mb-4 text-gray-600">
              Due Date: {new Date(assignment.dueDate).toLocaleString()}
            </p>
          )}

          {assignment.submitted ? (
            <div className="bg-green-100 p-4 rounded">
              <p className="font-medium text-green-700 mb-2">
                ✅ You have already submitted this assignment.
              </p>

              {assignment.studentSubmission?.content && (
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto mb-2">
                  {assignment.studentSubmission.content}
                </pre>
              )}

              {assignment.studentSubmission?.fileUrl && (
                <a
                  href={`http://localhost:5000${assignment.studentSubmission.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  📂 Download submitted file
                </a>
              )}

              {assignment.studentSubmission?.status === "graded" && (
                <p className="mt-3 text-green-700 font-semibold">
                  🎉 Graded: {assignment.studentSubmission.grade}%
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Write your answer here..."
                className="border border-gray-300 rounded p-2 mb-4 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mb-4"
              />

              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Submit Assignment
              </button>
              {successMsg && (
                <p className="text-green-600 mt-2">{successMsg}</p>
              )}
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          )}
        </div>
      </main>
      <StudentFooter />
    </div>
  );
};

export default AttemptAssignment;
