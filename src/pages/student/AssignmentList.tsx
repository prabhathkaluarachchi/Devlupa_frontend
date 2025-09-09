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
            Loading assignments...
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
        <main className="flex-grow  mx-auto w-full p-6">
          <h1 className="text-3xl font-bold text-[#4F46E5] mb-8">
            {courseId ? "📚 Assignments for This Course" : "📚 All Assignments"}
          </h1>

          {assignments.length === 0 ? (
            <p className="text-gray-600 text-center">
              {courseId
                ? "No assignments available for this course."
                : "No assignments available."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((a) => (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:bg-[#EEF2FF] transition"
                >
                  {a.imageUrl && (
                    <img
                      src={
                        a.imageUrl.startsWith("http")
                          ? a.imageUrl
                          : `http://localhost:5000${a.imageUrl}`
                      }
                      alt={a.title}
                      className="rounded-xl mb-4 object-cover h-40 w-full"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
                    {a.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {a.description}
                  </p>
                  {a.dueDate && (
                    <p className="text-gray-500 mb-4">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  )} 
                  <button
                    onClick={() => navigate(`/assignments/${a._id}/attempt`)}
                    className="mt-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
                  >
                    Attempt Assignment
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        <StudentFooter />
      </div>
    </div>
  );
};

export default AssignmentList;
