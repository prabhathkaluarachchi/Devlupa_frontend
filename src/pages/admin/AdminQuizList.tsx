import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";

interface Quiz {
  _id: string;
  title: string;
  timeLimit: number;
}

const AdminQuizList: React.FC = () => {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`/quizzes/course/${courseId}`);
        setQuizzes(res.data);
      } catch (err) {
        console.error("Failed to load quizzes", err);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quizzes for Course</h1>
      {quizzes.length === 0 ? (
        <p>No quizzes created yet for this course.</p>
      ) : (
        <ul className="space-y-4">
          {quizzes.map((quiz) => (
            <li
              key={quiz._id}
              onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
              className="
                bg-gradient-to-r from-blue-500 to-cyan-500
                hover:opacity-90
                text-white
                font-semibold
                px-6 py-3
                rounded-2xl
                shadow
                cursor-pointer
                transition
                select-none
              "
            >
              <h2 className="text-lg">{quiz.title}</h2>
              <p className="text-sm">Time Limit: {quiz.timeLimit} mins</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminQuizList;
