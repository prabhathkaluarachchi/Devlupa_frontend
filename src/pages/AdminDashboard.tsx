import React, { useEffect, useState } from "react";
import API from "../utils/axiosInstance";

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
  const [userProgressList, setUserProgressList] = useState<UserProgress[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);

  useEffect(() => {
    Promise.all([
      API.get("/admin/users-progress"),
      API.get("/admin/dashboard-summary")
    ])
      .then(([progressRes, summaryRes]) => {
        setUserProgressList(progressRes.data);
        setSummary(summaryRes.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load dashboard data");
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-[#F9FAFB] min-h-screen">
      <h1 className="text-4xl font-bold text-[#4F46E5] mb-8">Admin Dashboard</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-gray-500">Total Users</h2>
            <p className="text-2xl text-[#4F46E5] font-bold">{summary.totalUsers}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-gray-500">Total Courses</h2>
            <p className="text-2xl text-[#4F46E5] font-bold">{summary.totalCourses}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-gray-500">Total Quizzes</h2>
            <p className="text-2xl text-[#4F46E5] font-bold">{summary.totalQuizzes}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-gray-500">Total Assignments</h2>
            <p className="text-2xl text-[#4F46E5] font-bold">{summary.totalAssignments}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">Registered Users</h2>
        <table className="w-full text-left">
          <thead className="text-[#6B7280] border-b">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Course Count</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {userProgressList.map((user) => (
              <tr key={user._id} className="border-b hover:bg-[#E5E7EB] cursor-pointer">
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.progress.length}</td>
                <td className="py-2 text-[#4F46E5] underline" onClick={() => setSelectedUser(user)}>
                  View Progress
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected User Progress */}
      {selectedUser && (
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#1F2937]">
              {selectedUser.name}'s Course Progress
            </h2>
            <button
              className="text-[#EF4444] font-medium"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
          {selectedUser.progress.length === 0 ? (
            <p className="text-gray-500 mt-2">No course progress yet.</p>
          ) : (
            <div className="mt-4">
              {selectedUser.progress.map((course) => (
                <div key={`${selectedUser._id}-${course.courseTitle}`} className="mb-4">
                  <p className="font-medium">Course: {course.courseTitle}</p>
                  <p className="text-sm text-[#6B7280]">Completion: {course.percentage}%</p>
                  <progress
                    className="w-full h-3 rounded"
                    value={course.percentage}
                    max={100}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
