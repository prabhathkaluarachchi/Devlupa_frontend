import { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  quizPercentage: number;
  assignmentPercentage: number;
  coursePercentage: number;
  overallPercentage: number;
}

const AdminManageUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, quizRes, assignmentRes, userRes] = await Promise.all([
          API.get("/admin/users-progress"),
          API.get("/admin/users-quiz-progress"),
          API.get("/admin/users-assignment-progress"),
          API.get("/users"), // 👈 this ensures we have email + name
        ]);

        const courseData = courseRes.data; // { _id, name, progress: [{ percentage }] }
        const quizData = quizRes.data; // { userId, quizzes: [{ scorePercentage }] }
        const assignmentData = assignmentRes.data; // { userId, assignments: [{ score }] }
        const userList = userRes.data; // { _id, name, email }

        const mergedUsers: UserRow[] = courseData.map((user: any) => {
          // Find the user info from userRes to get the email
          const userInfo = userList.find((u: any) => u._id === user._id);

          // 📘 Course Average
          let coursePercentage = 0;
          if (user.progress.length > 0) {
            coursePercentage =
              user.progress.reduce(
                (acc: number, p: any) => acc + (p.percentage || 0),
                0
              ) / user.progress.length;
          }

          // 📝 Quiz Average
          const quizInfo = quizData.find((q: any) => q.userId === user._id);
          let quizPercentage = 0;
          if (quizInfo && quizInfo.quizzes.length > 0) {
            quizPercentage =
              quizInfo.quizzes.reduce(
                (acc: number, q: any) => acc + (q.scorePercentage || 0),
                0
              ) / quizInfo.quizzes.length;
          }

          // 📂 Assignment Average
          const assignmentInfo = assignmentData.find(
            (a: any) => a.userId === user._id
          );
          let assignmentPercentage = 0;
          if (assignmentInfo && assignmentInfo.assignments.length > 0) {
            const graded = assignmentInfo.assignments.filter(
              (a: any) => a.score !== null
            );
            if (graded.length > 0) {
              assignmentPercentage =
                graded.reduce(
                  (acc: number, a: any) => acc + (a.score || 0),
                  0
                ) / graded.length;
            }
          }

          // 🎓 Overall Average (always divide by 3)
          const overallPercentage =
            (quizPercentage + assignmentPercentage + coursePercentage) / 3;

          return {
            _id: user._id,
            name: userInfo?.name || "Unnamed",
            email: userInfo?.email || "N/A", // 👈 now email comes from userList
            quizPercentage: Math.round(quizPercentage),
            assignmentPercentage: Math.round(assignmentPercentage),
            coursePercentage: Math.round(coursePercentage),
            overallPercentage: Math.round(overallPercentage),
          };
        });

        setUsers(mergedUsers);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
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
            Loading Users...
          </span>
        </div>
      </div>
    );
  }

  return (
<div className="flex flex-col min-h-screen">
  <div className="flex flex-1">
    <AdminSidebar />

    <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full border bg-white rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Course %</th>
              <th className="p-3 text-left">Quiz %</th>
              <th className="p-3 text-left">Assignment %</th>
              <th className="p-3 text-left">Overall %</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.coursePercentage}%</td>
                <td className="p-3">{user.quizPercentage}%</td>
                <td className="p-3">{user.assignmentPercentage}%</td>
                <td className="p-3 font-semibold text-[#4F46E5]">
                  {user.overallPercentage}%
                </td>
                <td className="p-3 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>

                  {user.overallPercentage >= 85 ? (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      onClick={() =>
                        alert(`Certificate offered to ${user.name}`)
                      }
                    >
                      Offer Certificate
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                    >
                      Not Eligible
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <span className="text-gray-500">{user.email}</span>
            </div>

            <div className="flex justify-between">
              <span>Course:</span>
              <span>{user.coursePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Quiz:</span>
              <span>{user.quizPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Assignment:</span>
              <span>{user.assignmentPercentage}%</span>
            </div>
            <div className="flex justify-between font-semibold text-[#4F46E5]">
              <span>Overall:</span>
              <span>{user.overallPercentage}%</span>
            </div>

            <div className="flex flex-col space-y-2 mt-2">
              <button
                onClick={() => handleDelete(user._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>

              {user.overallPercentage >= 85 ? (
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  onClick={() =>
                    alert(`Certificate offered to ${user.name}`)
                  }
                >
                  Offer Certificate
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                >
                  Not Eligible
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer always at bottom */}
      <div className="mt-auto">
        <AdminFooter />
      </div>
    </div>
  </div>
</div>



  );
};

export default AdminManageUsers;
