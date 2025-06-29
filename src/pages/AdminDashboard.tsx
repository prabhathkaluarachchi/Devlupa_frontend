import React, { useEffect, useState } from "react";
import API from "../utils/axiosInstance";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useNavigate } from "react-router-dom";

interface CourseProgress {
  courseId: string;
  completedCount: number;
  totalVideos: number;
  percentage: number;
  courseTitle: string;
}

interface UserProgress {
  _id: string;
  name: string;
  progress: CourseProgress[];
}

interface Summary {
  totalUsers: number;
  totalCourses: number;
  totalQuizzes: number;
  totalAssignments: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userProgressList, setUserProgressList] = useState<UserProgress[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  const [quizProgressMap, setQuizProgressMap] = useState<Map<string, any>>(
    new Map()
  );

  useEffect(() => {
    Promise.all([
      API.get("/admin/users-progress"), // existing course progress
      API.get("/admin/dashboard-summary"),
      API.get("/admin/users-quiz-progress"), // new quiz progress data
    ])
      .then(([progressRes, summaryRes, quizProgressRes]) => {
        setUserProgressList(progressRes.data);
        setSummary(summaryRes.data);

        // Map quiz progress by userId for quick lookup
        const quizProgressMap = new Map();
        quizProgressRes.data.forEach((qp: any) => {
          quizProgressMap.set(qp.userId, qp);
        });
        setQuizProgressMap(quizProgressMap);

        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load dashboard data");
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading)
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

  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <AdminHeader />

      <main className="p-6 flex-grow max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-[#4F46E5] mb-8">
          Admin Dashboard
        </h1>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              { title: "Total Users", value: summary.totalUsers },
              { title: "Total Courses", value: summary.totalCourses },
              { title: "Total Quizzes", value: summary.totalQuizzes },
              { title: "Total Assignments", value: summary.totalAssignments },
            ].map(({ title, value }) => (
              <div
                key={title}
                className="bg-white rounded-2xl shadow-md p-6 cursor-default hover:shadow-lg transition"
              >
                <p className="text-gray-500 font-semibold">{title}</p>
                <p className="text-4xl font-extrabold text-[#4F46E5] mt-2">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links as Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
            onClick={() => navigate("/admin/courses")}
          >
            <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
              📚 Manage Courses
            </h2>
            <p className="text-gray-600">Add, edit, or delete courses.</p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
            onClick={() => navigate("/admin/quizzes")}
          >
            <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
              📝 Manage Quizzes
            </h2>
            <p className="text-gray-600">Create and review quizzes.</p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
            onClick={() => navigate("/admin-assignments")}
          >
            <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
              📂 Manage Assignments
            </h2>
            <p className="text-gray-600">Track and score assignments.</p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:bg-[#EEF2FF]"
            onClick={() => navigate("/admin-certificates")}
          >
            <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
              🎓 Manage Certificates
            </h2>
            <p className="text-gray-600">Issue and manage certificates.</p>
          </div>
        </div>

        {/* Users Cards */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">
            Registered Users
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProgressList.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedUser(user);
                }}
                className="bg-white rounded-2xl shadow p-5 cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold text-[#4F46E5]">
                    {user.name}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Enrolled in {user.progress.length} course
                    {user.progress.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUser(user);
                  }}
                  className="mt-4 self-start bg-[#4F46E5] text-white px-4 py-2 rounded-lg shadow hover:bg-[#4338CA] transition"
                >
                  View Progress
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Selected User Progress */}
        {selectedUser && (
          <section className="bg-white rounded-2xl shadow p-6 max-w-4xl mx-auto mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1F2937]">
                {selectedUser.name}'s Progress
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-red-500 hover:underline font-semibold"
              >
                Close
              </button>
            </div>

            {/* 📘 Course Progress */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-[#4F46E5] mb-4">
                📘 Course Progress
              </h3>

              {selectedUser.progress.length === 0 ? (
                <p className="text-gray-500">No course progress yet.</p>
              ) : (
                <div className="space-y-6">
                  {selectedUser.progress.map(
                    ({ courseId, courseTitle, percentage }) => (
                      <div key={courseId}>
                        <p className="font-medium text-[#374151] text-lg">
                          {courseTitle}
                        </p>
                        <p className="text-sm text-[#6B7280] mb-1">
                          Completion: {percentage}%
                        </p>
                        <progress
                          className="w-full h-4 rounded bg-gray-200"
                          value={percentage}
                          max={100}
                          aria-label={`${courseTitle} progress`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={percentage}
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

{/* 📝 Quiz Progress */}
<div className="mb-10">
  <h3 className="text-xl font-semibold text-[#4F46E5] mb-4">
    📝 Quiz Progress
  </h3>

  {selectedUser &&
  quizProgressMap.has(selectedUser._id) &&
  quizProgressMap.get(selectedUser._id).quizzes.length > 0 ? (
    <div className="space-y-4">
      {quizProgressMap.get(selectedUser._id).quizzes.map(
        (
          quiz: {
            quizTitle: string;
            totalQuestions: number;
            correctAnswers: number;
            scorePercentage: number;
          },
          index: number
        ) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <h4 className="text-lg font-semibold text-[#1F2937] mb-1">
              {quiz.quizTitle}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Correct:{" "}
              <span className="font-medium text-[#4F46E5]">
                {quiz.correctAnswers}
              </span>{" "}
              / {quiz.totalQuestions} (
              <span className="font-medium">{quiz.scorePercentage}%</span>)
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${quiz.scorePercentage}%`,
                  backgroundColor:
                    quiz.scorePercentage >= 80
                      ? "#16a34a" // green
                      : quiz.scorePercentage >= 50
                      ? "#facc15" // yellow
                      : "#ef4444", // red
                }}
              ></div>
            </div>
          </div>
        )
      )}
    </div>
  ) : (
    <p className="italic text-gray-500">No quiz progress available.</p>
  )}
</div>


            {/* 📂 Assignment Progress (placeholder) */}
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-[#4F46E5] mb-4">
                📂 Assignment Progress
              </h3>
              <p className="italic text-gray-500">
                Coming soon – assignment tracking logic here...
              </p>
            </div>
          </section>
        )}
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminDashboard;
