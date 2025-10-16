import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  dueDate?: string;
  course?: {
    _id: string;
    title: string;
  };
}

const AssignmentList: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const url = courseId
          ? `/assignments/course/${courseId}`
          : `/assignments/all`; // fetch all if no courseId
        const res = await axios.get(url);
        setAssignments(res.data);
      } catch (err) {
        console.error("Failed to load assignments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return "text-red-600 bg-red-100";
    if (daysUntilDue === 0) return "text-orange-600 bg-orange-100";
    if (daysUntilDue <= 3) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
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
            Loading Assignments...
          </span>
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
        <main className="flex-grow max-w-7xl mx-auto w-full p-6">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {courseId ? "Course Assignments" : "All Assignments"}
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              {courseId
                ? "Complete these assignments to demonstrate your understanding of the course material."
                : "Browse and complete assignments across all your courses to track your learning progress."}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {assignments.length}
              </div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {
                  assignments.filter(
                    (a) => a.dueDate && getDaysUntilDue(a.dueDate) >= 0
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {
                  assignments.filter(
                    (a) => a.dueDate && getDaysUntilDue(a.dueDate) < 0
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {
                  assignments.filter(
                    (a) =>
                      a.dueDate &&
                      getDaysUntilDue(a.dueDate) <= 3 &&
                      getDaysUntilDue(a.dueDate) >= 0
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  {courseId
                    ? "No Assignments Available"
                    : "No Assignments Found"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {courseId
                    ? "There are no assignments available for this course yet."
                    : "There are no assignments available at the moment."}
                </p>
                {courseId && (
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-2 px-6 rounded-xl transition-all"
                  >
                    Go Back
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {assignments.map((assignment, index) => (
                <div
                  key={assignment._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  {/* Assignment Image */}
                  {assignment.imageUrl && (
                    <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-100 rounded-xl">
                      <img
                        src={
                          assignment.imageUrl.startsWith("http")
                            ? assignment.imageUrl
                            : `${import.meta.env.VITE_BACKEND_BASE_URL}${
                                assignment.imageUrl
                              }`
                        }
                        alt={assignment.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Assignment Content */}
                  <div className="p-6">
                    {/* Assignment Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {assignment.title}
                      </h2>
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold ml-3">
                        {index + 1}
                      </div>
                    </div>

                    {/* Course Info (if available) */}
                    {assignment.course && !courseId && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 text-sm">📚</span>
                        <span className="text-sm text-blue-700 font-medium">
                          {assignment.course.title}
                        </span>
                      </div>
                    )}

                    {/* Due Date */}
                    {assignment.dueDate && (
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getDueDateColor(
                          assignment.dueDate
                        )}`}
                      >
                        <span>📅</span>
                        <span>{getDueDateText(assignment.dueDate)}</span>
                        <span className="text-xs opacity-75">
                          ({new Date(assignment.dueDate).toLocaleDateString()})
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">
                      {assignment.description}
                    </p>

                    {/* Action Button - Keeping the original gradient */}
                    <button
                      onClick={() =>
                        navigate(`/assignments/${assignment._id}/attempt`)
                      }
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn"
                    >
                      <span>Attempt Assignment</span>
                      <span className="group-hover/btn:translate-x-1 transition-transform">
                        →
                      </span>
                    </button>

                    {/* Quick Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500 gap-2">
                        <span>💡</span>
                        <span>Click to start working on this assignment</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assignment Tips Section */}
          {assignments.length > 0 && (
            <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>🎯</span>
                Assignment Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">⏰</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Start Early
                  </h3>
                  <p className="text-sm text-gray-600">
                    Begin assignments well before the due date
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📖</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Review Material
                  </h3>
                  <p className="text-sm text-gray-600">
                    Go through course content before starting
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">✅</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Check Requirements
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ensure you meet all assignment criteria
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Plan Your Work
                  </h3>
                  <p className="text-sm text-gray-600">
                    Break down tasks into manageable steps
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        <StudentFooter />
      </div>
    </div>
  );
};

export default AssignmentList;
