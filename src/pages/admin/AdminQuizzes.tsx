import React, { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/AdminFooter";

interface Quiz {
  _id: string;
  title: string;
  timeLimit: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
}

const AdminQuizzes: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
  const navigate = useNavigate();

  const fetchCourses = async () => {
    const res = await API.get("/courses");
    setCourses(res.data);
  };

  const fetchQuizzesForCourse = async (courseId: string) => {
    const res = await API.get(`/quizzes/course/${courseId}`);
    setQuizzes((prev) => ({ ...prev, [courseId]: res.data }));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteQuiz = async (quizId: string, courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await API.delete(`/quizzes/${quizId}`);
      await fetchQuizzesForCourse(courseId);
    } catch {
      alert("Failed to delete quiz");
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <AdminHeader />

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
          Admin: Manage Quizzes by Course
        </h1>

        <button
          onClick={() => navigate("/admin/quizzes/create")}
          className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-2xl shadow transition"
        >
          + Create New Quiz
        </button>

        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 mb-6"
          >
            <div
              className="cursor-pointer"
              onClick={() => {
                const newId = selectedCourseId === course._id ? null : course._id;
                setSelectedCourseId(newId);
                if (newId) fetchQuizzesForCourse(course._id);
              }}
            >
              <h2 className="text-xl font-bold text-[#1F2937] hover:underline">
                {course.title}
              </h2>
              <p className="text-gray-600">{course.description}</p>
            </div>

            {selectedCourseId === course._id && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-[#374151]">Quizzes</h3>
                {quizzes[course._id]?.length === 0 ? (
                  <p className="text-gray-500 italic">No quizzes yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {quizzes[course._id]?.map((quiz) => (
                      <li
                        key={quiz._id}
                        className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-xl hover:shadow"
                      >
                        <span className="text-gray-800 font-medium">
                          {quiz.title}{" "}
                          <span className="text-sm text-gray-500">
                            (Time Limit: {quiz.timeLimit} mins)
                          </span>
                        </span>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id, course._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold transition"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminQuizzes;
