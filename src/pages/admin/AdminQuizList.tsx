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
      <h1 className="text-2xl font-bold mb-4">Quizzes for Course</h1>
      {quizzes.length === 0 ? (
        <p>No quizzes created yet for this course.</p>
      ) : (
        <ul className="space-y-4">
          {quizzes.map((quiz) => (
            <li
              key={quiz._id}
              className="border p-4 rounded shadow hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
            >
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
              <p>Time Limit: {quiz.timeLimit} mins</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminQuizList;
