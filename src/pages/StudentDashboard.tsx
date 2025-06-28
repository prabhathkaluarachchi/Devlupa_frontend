import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";
import StudentFooter from "../components/StudentFooter";
import axios from "../utils/axiosInstance";

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  percentage: number;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/users/studentprogress")
      .then((res) => {
        setProgress(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load progress data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-[#4F46E5]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
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
          <span className="text-[#4F46E5] text-lg font-semibold mt-4">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#4F46E5] mb-6">
          Welcome to Your Dashboard 👋
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
            onClick={() => navigate("/student-quizzes")}
          >
            <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
              📝 My Quizzes
            </h2>
            <p className="text-gray-600">Take or review your quizzes.</p>
          </div>
          <div
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
            onClick={() => navigate("/student-assignments")}
          >
            <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
              📂 My Assignments
            </h2>
            <p className="text-gray-600">Submit and track assignments.</p>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">
            📊 Course Progress
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
                  className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/courses/${courseId}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/courses/${courseId}`);
                    }
                  }}
                  aria-label={`Go to course ${courseTitle}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#4F46E5]">
                      {courseTitle}
                    </h3>
                    <span className="text-sm text-gray-500">{percentage}%</span>
                  </div>
                  <div
                    className="h-3 bg-gray-200 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="bg-[#4F46E5] h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional: Recent Activity */}
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
  );
};

export default StudentDashboard;
