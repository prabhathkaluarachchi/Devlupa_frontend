import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/StudentFooter";

interface Quiz {
  _id: string;
  title: string;
  timeLimit: number;
}

const QuizList: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/quizzes/course/${courseId}`)
      .then((res) => {
        setQuizzes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quizzes", err);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="text-[#4F46E5] text-lg font-semibold">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-grow max-w-5xl mx-auto w-full p-6">
        <h1 className="text-3xl font-bold text-[#4F46E5] mb-8">📝 Quizzes</h1>

        {quizzes.length === 0 ? (
          <p className="text-gray-600 text-center">No quizzes available for this course.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
              >
                <h2 className="text-xl font-semibold text-[#1F2937]">{quiz.title}</h2>
                <p className="text-gray-600 mt-2 mb-4">
                  Time Limit: {quiz.timeLimit} minutes
                </p>
                <button
                  onClick={() => navigate(`/student/quizzes/${quiz._id}`)}
                  className="bg-[#4F46E5] text-white py-2 rounded-lg hover:bg-[#4338CA] transition"
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

export default QuizList;
