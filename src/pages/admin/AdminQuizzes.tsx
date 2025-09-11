import React, { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import AdminFooter from "../../components/AdminFooter";
import AdminSidebar from "../../components/AdminSidebar";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/courses");
      setCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch courses");
      setLoading(false);
    }
  };

  const fetchQuizzesForCourse = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/quizzes/course/${courseId}`);
      setQuizzes((prev) => ({ ...prev, [courseId]: res.data }));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch quizzes for this course");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteQuiz = async (quizId: string, courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    setLoading(true);
    try {
      await API.delete(`/quizzes/${quizId}`);
      await fetchQuizzesForCourse(courseId);
      setLoading(false);
    } catch {
      alert("Failed to delete quiz");
      setLoading(false);
    }
  };

  // Loading state
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
            Loading quizzes...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-red-600 text-center bg-[#F9FAFB] min-h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col md:ml-64 bg-gray-50">
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
            Manage Quizzes
          </h1>

          <button
            onClick={() => navigate("/admin/quizzes/create")}
            className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-2xl shadow transition w-full md:w-auto"
          >
            + Create New Quiz
          </button>

          <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {courses.length === 0 && (
              <p className="text-gray-500 text-center col-span-full">
                No courses available.
              </p>
            )}

            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col justify-between"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    const newId =
                      selectedCourseId === course._id ? null : course._id;
                    setSelectedCourseId(newId);
                    if (newId) fetchQuizzesForCourse(course._id);
                  }}
                >
                  <h2 className="text-xl font-bold text-[#1F2937] hover:underline mb-2">
                    {course.title}
                  </h2>
                  <p className="text-gray-600">{course.description}</p>
                </div>

                {selectedCourseId === course._id && (
                  <div className="mt-4 flex flex-col gap-3">
                    {quizzes[course._id]?.length === 0 ? (
                      <p className="text-gray-500 italic">No quizzes yet.</p>
                    ) : (
                      quizzes[course._id]?.map((quiz) => (
                        <div
                          key={quiz._id}
                          className="flex flex-col bg-gray-100 p-4 rounded-xl shadow-sm hover:shadow transition w-full"
                        >
                          <div className="flex justify-between items-center gap-2">
                            <span
                              className="font-medium text-gray-800 truncate"
                              title={quiz.title}
                            >
                              {quiz.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              (Time Limit: {quiz.timeLimit} mins)
                            </span>
                          </div>

                          <div className="mt-2">
                            <button
                              onClick={() =>
                                handleDeleteQuiz(quiz._id, course._id)
                              }
                              className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminQuizzes;
