import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../utils/axiosInstance";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/StudentFooter";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  dueDate?: string;
}

const AssignmentsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const res = await API.get(`/assignments/course/${courseId}`);
      setAssignments(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
      alert("Failed to load assignments");
    }
  };

  useEffect(() => {
    if (courseId) fetchAssignments();
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="text-[#4F46E5] text-lg font-semibold mt-4">
            Loading assignments...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <StudentHeader />

      <main className="flex-grow p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
          Assignments
        </h1>

        {assignments.length === 0 && (
          <p className="text-gray-500 text-center">No assignments available.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-[#1F2937]">{a.title}</h2>
                <p className="text-gray-600 mt-1">{a.description}</p>
                {a.imageUrl && (
                  <img
                    src={a.imageUrl}
                    alt={a.title}
                    className="mt-3 rounded-lg w-48"
                  />
                )}
                {a.dueDate && (
                  <p className="text-sm text-gray-500 mt-2">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <Link
                to={`/assignments/${a._id}/attempt?courseId=${courseId}`}
                className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white text-center font-semibold px-5 py-2 rounded-2xl shadow transition"
              >
                Attempt Assignment
              </Link>
            </div>
          ))}
        </div>
      </main>

      <StudentFooter />
    </div>
  );
};

export default AssignmentsPage;
