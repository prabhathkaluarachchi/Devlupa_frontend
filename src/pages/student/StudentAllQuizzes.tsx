import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";

interface Quiz {
  _id: string;
  title: string;
  course: {
    _id: string;
    title: string;
  };
  timeLimit: number;
  description?: string;
}

const StudentAllQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    axios
      .get("/quizzes")
      .then((res) => {
        setQuizzes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch quizzes", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <span className="text-indigo-600 text-lg font-semibold">
            Loading Quizzes...
          </span>
        </div>
      </div>
    );
  }

  const filteredQuizzes =
    filter === "all"
      ? quizzes
      : quizzes.filter((quiz) => quiz.course?._id === filter);

  const uniqueCourses = Array.from(
    new Set(quizzes.map((quiz) => quiz.course?._id).filter(Boolean))
  );

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64 transition-all">
        <main className="flex-grow max-w-7xl mx-auto w-full p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Course Quizzes
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Test your knowledge across all courses with these interactive
              quizzes. Track your progress and improve your skills.
            </p>
          </div>

          {/* Filter Section */}
          {uniqueCourses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">
                  Filter by Course:
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === "all"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All Quizzes
                  </button>
                  {uniqueCourses.map((courseId) => {
                    const course = quizzes.find(
                      (q) => q.course?._id === courseId
                    )?.course;
                    return (
                      <button
                        key={courseId}
                        onClick={() => setFilter(courseId)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          filter === courseId
                            ? "bg-indigo-600 text-white shadow-md"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {course?.title || "Unknown Course"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {quizzes.length}
              </div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {
                  Array.from(
                    new Set(quizzes.map((q) => q.course?._id).filter(Boolean))
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {quizzes.reduce(
                  (total, quiz) => total + (quiz.timeLimit || 0),
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Minutes</div>
            </div>
          </div>

          {/* Quiz Cards */}
          {filteredQuizzes.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❓</span>
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  {filter === "all"
                    ? "No Quizzes Available"
                    : "No Quizzes in This Course"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {filter === "all"
                    ? "There are no quizzes available at the moment."
                    : "There are no quizzes available for this course yet."}
                </p>
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-xl transition-all"
                  >
                    View All Quizzes
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <div
                  key={quiz._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  {/* Quiz Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold line-clamp-2 group-hover:text-indigo-100 transition-colors">
                        {quiz.title}
                      </h2>
                      <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Quiz Body */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 rounded-lg">
                      <span className="text-indigo-600">📚</span>
                      <div>
                        <div className="text-sm font-semibold text-indigo-800">
                          Course
                        </div>
                        <div className="text-sm text-indigo-600">
                          {quiz.course ? quiz.course.title : "Course Deleted"}
                        </div>
                      </div>
                    </div>

                    {/* Time Info Only */}
                    <div className="bg-blue-50 rounded-lg p-3 text-center mb-6">
                      <div className="text-blue-600 text-sm font-semibold mb-1">
                        Time Limit
                      </div>
                      <div className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1">
                        <span>⏱️</span>
                        {quiz.timeLimit} min
                      </div>
                    </div>

                    {/* Description */}
                    {quiz.description && (
                      <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">
                        {quiz.description}
                      </p>
                    )}

                    {/* Start Button */}
                    <button
                      onClick={() => navigate(`/quizzes/${quiz._id}`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn"
                    >
                      <span>Start Quiz</span>
                      <span className="group-hover/btn:scale-110 transition-transform">
                        🎯
                      </span>
                    </button>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500 gap-2">
                        <span>💡</span>
                        <span>Complete within {quiz.timeLimit} minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips Section */}
          {quizzes.length > 0 && (
            <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>🎯</span>
                Quiz Preparation Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">⏰</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Time Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Practice completing within time limits
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Track Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitor your improvement
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Identify Weak Areas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Focus on topics needing practice
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Review Material
                  </h3>
                  <p className="text-sm text-gray-600">
                    Study before attempting quizzes
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

export default StudentAllQuizzes;
