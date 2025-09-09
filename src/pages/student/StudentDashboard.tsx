import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  percentage: number;
}

interface QuizProgress {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [quizProgress, setQuizProgress] = useState<QuizProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const courseRes = await axios.get("/users/studentprogress");
        setProgress(courseRes.data);
      } catch {
        setError("Failed to load course progress");
      }

      try {
        const quizRes = await axios.get("/users/studentquizprogress");
        const quizzes = Array.isArray(quizRes.data.quizzes)
          ? quizRes.data.quizzes
          : [];
        setQuizProgress(quizzes);
      } catch {
        setQuizError("Failed to load quiz progress");
      }

      setLoading(false);
    };

    fetchProgress();
  }, []);

  const getColor = (percentage: number) => {
    if (percentage >= 80) return "#16a34a"; // green
    if (percentage >= 50) return "#facc15"; // yellow
    return "#ef4444"; // red
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
          <span className="mt-4 text-[#4F46E5] font-semibold">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64 transition-all">
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-[#4F46E5] mb-6">
            Dashboard
          </h1>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
              onClick={() => navigate("/courses")}
            >
              <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
                📚 My Courses
              </h2>
              <p className="text-gray-600">
                View and continue your enrolled courses.
              </p>
            </div>
            <div
              className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
              onClick={() => navigate("/quizzes")}
            >
              <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
                📝 My Quizzes
              </h2>
              <p className="text-gray-600">Take or review your quizzes.</p>
            </div>
            <div
              className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
              onClick={() => navigate("/assignments")}
            >
              <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
                📂 My Assignments
              </h2>
              <p className="text-gray-600">Submit and track assignments.</p>
            </div>
          </div>

          {/* 📘 Course Progress */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">
              📘 Course Progress
            </h2>
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : progress.length === 0 ? (
              <p className="text-gray-600">No course progress yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {progress.map(({ courseId, courseTitle, percentage }) => (
                  <div
                    key={courseId}
                    className="bg-white rounded-xl p-5 shadow hover:shadow-lg cursor-pointer"
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    <h3 className="text-lg font-bold text-[#4F46E5] mb-1">
                      {courseTitle}
                    </h3>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Completion</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getColor(percentage),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 📝 Quiz Progress */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">
              📝 Quiz Progress
            </h2>
            {quizError ? (
              <p className="text-red-600">{quizError}</p>
            ) : quizProgress.length === 0 ? (
              <p className="text-gray-600">No quiz progress available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizProgress.map(
                  ({ quizId, quizTitle, correctAnswers, totalQuestions }) => {
                    const completionPercentage =
                      totalQuestions > 0
                        ? Math.round((correctAnswers / totalQuestions) * 100)
                        : 0;

                    return (
                      <div
                        key={quizId}
                        className="bg-white rounded-xl p-5 shadow hover:shadow-lg cursor-pointer"
                        onClick={() => navigate(`/quizzes/${quizId}`)}
                      >
                        <h3 className="text-lg font-bold text-[#4F46E5] mb-1">
                          {quizTitle}
                        </h3>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Completion</span>
                          <span>{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full"
                            style={{
                              width: `${completionPercentage}%`,
                              backgroundColor: getColor(completionPercentage),
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* 🕓 Recent Activity */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">
              🕓 Recent Activity
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Watched “Intro to React” – 2 days ago</li>
              <li>Submitted Assignment 1 for Web Dev – 3 days ago</li>
              <li>Scored 8/10 in HTML Quiz – 5 days ago</li>
            </ul>
          </div>
        </main>
        <StudentFooter />
      </div>
    </div>
  );
};

export default StudentDashboard;
