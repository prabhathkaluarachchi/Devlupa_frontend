import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/axiosInstance";
import Swal from "sweetalert2";
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
  const [, setSuccessMsg] = useState<string | null>(null);

  const showAlert = (
    icon: "success" | "error" | "warning" | "info" | "question",
    title: string,
    text: string = "",
    confirmButtonText: string = "OK",
    showCancelButton: boolean = false,
    cancelButtonText: string = "Cancel"
  ) => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonText,
      cancelButtonText,
      showCancelButton,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
    });
  };

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
        const errorMsg =
          err.response?.data?.message || "Failed to fetch assignment.";
        setError(errorMsg);
        showAlert("error", "Error", errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async () => {
    try {
      if (!submission.trim() && !file) {
        showAlert(
          "warning",
          "Submission Required",
          "Please provide text or upload a file."
        );
        return;
      }

      const result = await showAlert(
        "question",
        "Submit Assignment?",
        "Are you sure you want to submit this assignment? You cannot edit it after submission.",
        "Yes, Submit",
        true,
        "Review Again"
      );

      if (!result.isConfirmed) {
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

      showAlert(
        "success",
        "Success!",
        "Your assignment has been submitted successfully."
      );
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to submit assignment.";
      setError(errorMsg);
      showAlert("error", "Submission Failed", errorMsg);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return "bg-red-100 border-red-300 text-red-800";
    if (daysUntilDue === 0)
      return "bg-orange-100 border-orange-300 text-orange-800";
    if (daysUntilDue <= 3)
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-green-100 border-green-300 text-green-800";
  };

  const getDueDateText = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return "Overdue";
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    return `Due in ${daysUntilDue} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <span className="text-indigo-600 text-lg font-semibold">
            Loading Assignment...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-2 px-6 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Assignment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested assignment could not be found.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-2 px-6 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64 transition-all">
        <main className="flex-grow max-w-4xl mx-auto p-6 w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">📝</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {assignment.title}
                </span>
              </h1>

              {/* Due Date Badge */}
              {assignment.dueDate && (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${getDueDateColor(
                    assignment.dueDate
                  )}`}
                >
                  <span>📅</span>
                  <span>{getDueDateText(assignment.dueDate)}</span>
                  <span className="text-sm opacity-75">
                    ({new Date(assignment.dueDate).toLocaleDateString()})
                  </span>
                </div>
              )}
            </div>

            {/* Assignment Image */}
            {assignment.imageUrl && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-md bg-gray-50">
                <img
                  src={
                    assignment.imageUrl.startsWith("http")
                      ? assignment.imageUrl
                      : `${import.meta.env.VITE_BACKEND_BASE_URL}${
                          assignment.imageUrl
                        }`
                  }
                  alt={assignment.title}
                  className="w-full h-auto object-cover"
                />

                {/* Download Image Button */}
                <div className="flex justify-end mt-3 p-4">
                  <a
                    href={
                      assignment.imageUrl.startsWith("http")
                        ? assignment.imageUrl
                        : `${import.meta.env.VITE_BACKEND_BASE_URL}${
                            assignment.imageUrl
                          }`
                    }
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
                  >
                    <span>⬇️</span>
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span>
                Assignment Description
              </h2>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                {assignment.description}
              </p>
            </div>

            {/* Submission Status */}
            {assignment.submitted ? (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Assignment Submitted
                    </h3>
                    <p className="text-green-600">
                      Your work has been successfully submitted.
                    </p>
                  </div>
                </div>

                {/* Submitted Content */}
                {assignment.studentSubmission?.content && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Your Submission:
                    </h4>
                    <pre className="bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto text-gray-800 whitespace-pre-wrap">
                      {assignment.studentSubmission.content}
                    </pre>
                  </div>
                )}

                {/* Submitted File */}
                {assignment.studentSubmission?.fileUrl && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Uploaded File:
                    </h4>
                    <a
                      href={`${import.meta.env.VITE_BACKEND_BASE_URL}${
                        assignment.studentSubmission.fileUrl
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <span>📂</span>
                      Download Submitted File
                    </a>
                  </div>
                )}

                {/* Grading Results */}
                {assignment.studentSubmission?.status === "graded" && (
                  <div className="bg-white rounded-xl border border-green-300 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🎉</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 text-lg">
                          Grade: {assignment.studentSubmission.grade}%
                        </h4>
                      </div>
                    </div>
                    {assignment.studentSubmission?.remarks && (
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">
                          Feedback:
                        </h5>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {assignment.studentSubmission.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Submission Form */
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>✍️</span>
                    Your Submission
                  </h2>

                  {/* Text Submission */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Written Answer
                    </label>
                    <textarea
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      placeholder="Write your answer here... You can provide a detailed explanation, code, or any text-based response."
                      className="w-full h-48 border border-gray-300 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Upload (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">📎</span>
                          <span className="text-gray-600">
                            {file ? file.name : "Click to upload a file"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Supports PDF, DOC, images, and code files
                          </span>
                        </div>
                      </label>
                    </div>
                    {file && (
                      <div className="mt-2 flex items-center gap-2 text-green-600">
                        <span>✅</span>
                        <span>File selected: {file.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!submission.trim() && !file}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    <span>🚀 Submit Assignment</span>
                  </button>

                  {/* Requirements Note */}
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Please provide either a written answer or upload a file (or
                    both)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Assignment Tips */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>💡</span>
              Submission Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Review instructions carefully</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Check file format requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Proofread your submission</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Submit before the deadline</span>
              </div>
            </div>
          </div>
        </main>

        <StudentFooter />
      </div>
    </div>
  );
};

export default AttemptAssignment;
