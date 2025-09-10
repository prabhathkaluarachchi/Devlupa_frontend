import React, { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";

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
  const [assignmentProgressMap, setAssignmentProgressMap] = useState<
    Map<string, any>
  >(new Map());

  const cardItems: { label: string; key: keyof Summary; color: string }[] = [
    {
      label: "Total Users",
      key: "totalUsers",
      color: "from-blue-400 to-blue-600",
    },
    {
      label: "Total Courses",
      key: "totalCourses",
      color: "from-green-400 to-green-600",
    },
    {
      label: "Total Quizzes",
      key: "totalQuizzes",
      color: "from-yellow-400 to-yellow-500",
    },
    {
      label: "Total Assignments",
      key: "totalAssignments",
      color: "from-pink-400 to-pink-600",
    },
  ];

  useEffect(() => {
    Promise.all([
      API.get("/admin/users-progress"),
      API.get("/admin/dashboard-summary"),
      API.get("/admin/users-quiz-progress"),
      API.get("/admin/users-assignment-progress"),
    ])
      .then(([progressRes, summaryRes, quizRes, assignmentRes]) => {
        setUserProgressList(progressRes.data);
        setSummary(summaryRes.data);

        const quizMap = new Map();
        quizRes.data.forEach((qp: any) => quizMap.set(qp.userId, qp));
        setQuizProgressMap(quizMap);

        const assignmentMap = new Map();
        assignmentRes.data.forEach((ap: any) =>
          assignmentMap.set(ap.userId, ap.assignments)
        );
        setAssignmentProgressMap(assignmentMap);

        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load dashboard data");
        setLoading(false);
        console.error(err);
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
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      {/* ✅ Sidebar */}
      <AdminSidebar />

      {/* ✅ Main content (shifted right when sidebar open on desktop) */}
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="p-6 flex-grow max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-[#4F46E5] mb-8">
            Admin Dashboard
          </h1>

          {/* Summary Section */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
              {/* Left: Cards (2x2, smaller width) */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {cardItems.map(({ label, key }) => {
                  const value = summary[key];
                  return (
                    <div
                      key={label}
                      className="bg-white text-[#1F2937] rounded-2xl shadow-md p-4 flex flex-col justify-center"
                    >
                      <p className="text-lg font-semibold">{label}</p>
                      <p className="text-3xl font-extrabold mt-2">{value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Right: Combined Chart (wider) */}
              <div className="md:col-span-3 bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-[#4F46E5] mb-4">
                  Summary Chart
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
                    data={cardItems.map(({ label, key }) => ({
                      name: label,
                      value: summary[key],
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} barSize={60} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#FBBF24"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              {
                label: "📚 Manage Courses",
                desc: "Add, edit, or delete courses.",
                link: "/admin/courses",
                bg: "bg-white",
                hover: "hover:bg-[#EEF2FF]",
              },
              {
                label: "📝 Manage Quizzes",
                desc: "Create and review quizzes.",
                link: "/admin/quizzes",
                bg: "bg-white",
                hover: "hover:bg-[#FEF3C7]",
              },
              {
                label: "📂 Manage Assignments",
                desc: "Track and score assignments.",
                link: "/admin/assignments",
                bg: "bg-white",
                hover: "hover:bg-[#E0F2FE]",
              },
              {
                label: "🎓 Manage Users",
                desc: "View and manage user accounts.",
                link: "/admin/users",
                bg: "bg-white",
                hover: "hover:bg-[#FCE7F3]",
              },
            ].map(({ label, desc, link, bg, hover }) => (
              <div
                key={label}
                className={`${bg} ${hover} rounded-2xl shadow-md p-6 cursor-pointer transition`}
                onClick={() => navigate(link)}
              >
                <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
                  {label}
                </h2>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>

          {/* Users */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">
              Registered Users
            </h2>

            <div className="overflow-x-auto bg-white shadow rounded-2xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-700">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">
                      Enrolled Courses
                    </th>
                    <th className="px-6 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userProgressList.map((user, idx) => (
                    <React.Fragment key={user._id}>
                      <tr
                        className={`border-t hover:bg-gray-50 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td
                          className="px-6 py-4 font-medium text-[#4F46E5] cursor-pointer"
                          onClick={() =>
                            setSelectedUser(
                              selectedUser && selectedUser._id === user._id
                                ? null
                                : user
                            )
                          }
                        >
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.progress.length} course
                          {user.progress.length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(
                                selectedUser && selectedUser._id === user._id
                                  ? null
                                  : user
                              );
                            }}
                            className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg shadow hover:bg-[#4338CA] transition"
                          >
                            {selectedUser && selectedUser._id === user._id
                              ? "Hide Progress"
                              : "View Progress"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {selectedUser && selectedUser._id === user._id && (
                        <tr>
                          <td colSpan={3} className="bg-[#F9FAFB] p-6">
                            {/* ✅ Progress Details */}
                            <div className="space-y-8">
                              {/* Course Progress */}
                              <div>
                                <h3 className="text-xl font-semibold text-[#4F46E5] mb-4">
                                  📘 Course Progress
                                </h3>
                                {selectedUser.progress.length === 0 ? (
                                  <p className="text-gray-500">
                                    No course progress yet.
                                  </p>
                                ) : (
                                  <div className="space-y-4">
                                    {selectedUser.progress.map(
                                      ({
                                        courseId,
                                        courseTitle,
                                        percentage,
                                      }) => (
                                        <div
                                          key={courseId}
                                          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                                        >
                                          <p className="font-medium text-[#1F2937] text-lg">
                                            {courseTitle}
                                          </p>
                                          <p className="text-sm text-gray-600 mb-2">
                                            Completion:{" "}
                                            <span className="font-medium text-[#4F46E5]">
                                              {percentage}%
                                            </span>
                                          </p>
                                          <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                              className="h-3 rounded-full transition-all"
                                              style={{
                                                width: `${percentage}%`,
                                                backgroundColor:
                                                  percentage >= 80
                                                    ? "#16a34a"
                                                    : percentage >= 50
                                                    ? "#facc15"
                                                    : "#ef4444",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Quiz Progress */}
                              <div>
                                <h3 className="text-xl font-semibold text-[#4F46E5] mb-4">
                                  📝 Quiz Progress
                                </h3>
                                {quizProgressMap.has(selectedUser._id) &&
                                quizProgressMap.get(selectedUser._id).quizzes
                                  .length > 0 ? (
                                  <div className="space-y-4">
                                    {quizProgressMap
                                      .get(selectedUser._id)
                                      .quizzes.map((quiz: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                                        >
                                          <h4 className="text-lg font-semibold text-[#1F2937]">
                                            {quiz.quizTitle}
                                          </h4>
                                          <p className="text-sm text-gray-600 mb-2">
                                            Correct:{" "}
                                            <span className="font-medium text-[#4F46E5]">
                                              {quiz.correctAnswers}
                                            </span>{" "}
                                            / {quiz.totalQuestions} (
                                            {quiz.scorePercentage}%)
                                          </p>
                                          <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                              className="h-3 rounded-full"
                                              style={{
                                                width: `${quiz.scorePercentage}%`,
                                                backgroundColor:
                                                  quiz.scorePercentage >= 80
                                                    ? "#16a34a"
                                                    : quiz.scorePercentage >= 50
                                                    ? "#facc15"
                                                    : "#ef4444",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <p className="italic text-gray-500">
                                    No quiz progress available.
                                  </p>
                                )}
                              </div>

                              {/* Assignment Progress */}
                              <div>
                                <h3 className="text-xl font-semibold text-[#4F46E5] mb-4">
                                  📂 Assignment Progress
                                </h3>

                                {selectedUser &&
                                assignmentProgressMap.has(selectedUser._id) &&
                                assignmentProgressMap.get(selectedUser._id)
                                  .length > 0 ? (
                                  <div className="space-y-4">
                                    {assignmentProgressMap
                                      .get(selectedUser._id)
                                      .map((assignment: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                                        >
                                          <h4 className="text-lg font-semibold text-[#1F2937]">
                                            {assignment.title}
                                          </h4>

                                          {/* Status */}
                                          <p className="text-sm text-gray-600 mb-2">
                                            Status:{" "}
                                            <span className="font-medium">
                                              {assignment.submitted
                                                ? "Submitted"
                                                : "Not Submitted"}
                                            </span>
                                          </p>

                                          {/* Score */}
                                          {assignment.submitted &&
                                            assignment.score !== null && (
                                              <p className="text-sm text-gray-600 mb-2">
                                                Score:{" "}
                                                <span className="font-medium text-[#4F46E5]">
                                                  {assignment.score}%
                                                </span>
                                              </p>
                                            )}

                                          {/* Grade Button */}
                                          {assignment.submitted &&
                                            assignment.score === null && (
                                              <button
                                                onClick={() =>
                                                  navigate(
                                                    `/admin/assignments/${assignment.assignmentId}/user/${selectedUser._id}/grade`
                                                  )
                                                }
                                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition"
                                              >
                                                Grade
                                              </button>
                                            )}

                                          {/* Progress Bar */}
                                          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                                            <div
                                              className="h-3 rounded-full"
                                              style={{
                                                width: `${
                                                  assignment.score ?? 0
                                                }%`,
                                                backgroundColor:
                                                  assignment.score !== null
                                                    ? assignment.score >= 80
                                                      ? "#16a34a"
                                                      : assignment.score >= 50
                                                      ? "#facc15"
                                                      : "#ef4444"
                                                    : assignment.submitted
                                                    ? "#ccc"
                                                    : "#ef4444",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <p className="italic text-gray-500">
                                    No assignment progress available.
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;
