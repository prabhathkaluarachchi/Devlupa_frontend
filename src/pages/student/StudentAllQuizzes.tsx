import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/StudentFooter";

interface Quiz {
  _id: string;
  title: string;
  course: {
    _id: string;
    title: string;
  };
  timeLimit: number;
}

const StudentAllQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/quizzes") // Your backend endpoint to get all quizzes
      .then((res) => {
        setQuizzes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch quizzes", err);
        setLoading(false);
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
            Loading Quizzes...
          </span>
        </div>
      </div>
    );

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <StudentHeader />

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        <h1 className="text-3xl font-bold text-[#4F46E5] mb-8 flex items-center gap-2">
          📝 Available Quizzes
        </h1>

        {quizzes.length === 0 ? (
          <p className="text-gray-600 text-center">
            No quizzes available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col"
              >
                <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
                  {quiz.title}
                </h2>
                <p className="text-gray-700 mb-4">
                  Course: {quiz.course ? quiz.course.title : "Course Deleted"}
                </p>
                <p className="text-gray-600 mb-6">
                  Time Limit: {quiz.timeLimit} minutes
                </p>

                <button
                  onClick={() => navigate(`/student/quizzes/${quiz._id}`)}
                  className="mt-auto bg-[#4F46E5] text-white py-2 rounded-lg hover:bg-[#4338CA] transition"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <StudentFooter />
    </div>
  );
};

export default StudentAllQuizzes;
