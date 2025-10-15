import React, { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import AdminFooter from "../../components/AdminFooter";
import AdminSidebar from "../../components/AdminSidebar";

interface Quiz {
  _id: string;
  title: string;
  timeLimit: number;
  createdAt?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
}

const AdminQuizzes: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [, setSelectedCourseId] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );

  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, quizzesRes] = await Promise.all([
        API.get("/courses"),
        API.get("/quizzes"), // Fetch all quizzes at once
      ]);

      setCourses(coursesRes.data);

      // Organize quizzes by courseId
      const quizzesByCourse: Record<string, Quiz[]> = {};
      quizzesRes.data.forEach((quiz: any) => {
        const courseId = quiz.course?._id || quiz.course;
        if (courseId) {
          if (!quizzesByCourse[courseId]) {
            quizzesByCourse[courseId] = [];
          }
          quizzesByCourse[courseId].push(quiz);
        }
      });

      setQuizzes(quizzesByCourse);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch courses");
      setLoading(false);
    }
  };

  const fetchQuizzesForCourse = async (courseId: string) => {
    setError(null);
    try {
      const res = await API.get(`/quizzes/course/${courseId}`);
      setQuizzes((prev) => ({ ...prev, [courseId]: res.data }));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch quizzes for this course");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteQuiz = async (quizId: string, courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await API.delete(`/quizzes/${quizId}`);
      await fetchQuizzesForCourse(courseId);
    } catch {
      alert("Failed to delete quiz");
    }
  };

  const toggleCourseExpansion = async (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
      setSelectedCourseId(null);
    } else {
      newExpanded.add(courseId);
      setSelectedCourseId(courseId);
      if (!quizzes[courseId]) {
        await fetchQuizzesForCourse(courseId);
      }
    }
    setExpandedCourses(newExpanded);
  };

  const getTotalQuizzes = () => {
    return Object.values(quizzes).reduce(
      (total, courseQuizzes) => total + courseQuizzes.length,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-[#4F46E5]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-[#4F46E5] text-lg font-semibold mt-4">
            Loading quizzes...
          </span>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          <AdminSidebar />
          <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Courses
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
          <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
            Manage Quizzes
          </h1>

          {/* Header Section with Create Button and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 lg:col-span-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Quiz Management
                    </h2>
                    <p className="text-sm text-gray-600">
                      Create and manage quizzes for your courses
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/admin/quizzes/create")}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Quiz
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-lg inline-flex">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">
                  Total Quizzes
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {getTotalQuizzes()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Across {courses.length} courses
                </p>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Courses Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Create courses first to add quizzes
                </p>
                <button
                  onClick={() => navigate("/admin/courses")}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Manage Courses
                </button>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {course.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>
                            {quizzes[course._id]?.length || 0} quizzes
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCourseExpansion(course._id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <svg
                        className={`w-4 h-4 mr-2 transition-transform ${
                          expandedCourses.has(course._id) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      {expandedCourses.has(course._id)
                        ? "Hide Quizzes"
                        : "View Quizzes"}
                    </button>
                  </div>

                  {/* Quizzes Section */}
                  {expandedCourses.has(course._id) && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Course Quizzes ({quizzes[course._id]?.length || 0})
                        </h4>
                        {error && (
                          <p className="text-red-600 text-sm">{error}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {!quizzes[course._id] ? (
                          <div className="text-center py-4">
                            <svg
                              className="animate-spin h-6 w-6 text-[#4F46E5] mx-auto mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                            <p className="text-gray-500">Loading quizzes...</p>
                          </div>
                        ) : quizzes[course._id].length === 0 ? (
                          <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                            <svg
                              className="w-12 h-12 text-gray-400 mx-auto mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="text-gray-500 mb-4">
                              No quizzes created yet
                            </p>
                            <button
                              onClick={() => navigate("/admin/quizzes/create")}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                              Create First Quiz
                            </button>
                          </div>
                        ) : (
                          quizzes[course._id].map((quiz) => (
                            <div
                              key={quiz._id}
                              className="flex justify-between items-center bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-gray-900 truncate mr-2">
                                    {quiz.title}
                                  </h5>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                    {quiz.timeLimit} mins
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleDeleteQuiz(quiz._id, course._id)
                                }
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors ml-2 flex-shrink-0"
                                aria-label={`Delete quiz ${quiz.title}`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminQuizzes;
