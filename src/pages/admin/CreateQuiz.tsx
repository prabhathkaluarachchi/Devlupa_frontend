import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import AdminFooter from "../../components/AdminFooter";
import AdminSidebar from "../../components/AdminSidebar";

interface Course {
  _id: string;
  title: string;
}

interface Question {
  question: string;
  options: { text: string; isCorrect: boolean }[];
}

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 2 }, () => ({
      question: "",
      options: Array.from({ length: 4 }, () => ({
        text: "",
        isCorrect: false,
      })),
    }))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    fetchCourses();
  }, []);

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const updated = [...questions];
    updated[index][field] = value as never;
    setQuestions(updated);
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIndex: number, correctIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === correctIndex,
    }));
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (
      !selectedCourse ||
      !title ||
      questions.some(
        (q) =>
          q.question.trim() === "" ||
          q.options.some((o) => o.text.trim() === "") ||
          !q.options.some((o) => o.isCorrect)
      )
    ) {
      alert(
        "Please fill all fields completely and select one correct answer per question."
      );
      return;
    }

    try {
      setLoading(true);
      await axios.post("/quizzes", {
        course: selectedCourse,
        title,
        timeLimit,
        questions,
      });
      alert("Quiz created successfully!");
      navigate("/admin/quizzes");
    } catch (err: any) {
      console.error("Quiz creation failed", err);
      alert(err.response?.data?.message || "Error creating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col md:ml-64 bg-gray-50">
        <div className="p-6 w-full mx-auto">
          <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">Create New Quiz</h1>

          <label className="block mb-2 font-medium">Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4 transition"
          >
            <option value="">-- Select a Course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-medium">Quiz Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4 transition"
          />

          <label className="block mb-2 font-medium">
            Time Limit (minutes):
          </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-6 transition"
          />

          <h2 className="text-xl font-semibold mb-4">Add 2 Questions:</h2>
          {questions.map((q, i) => (
            <div
              key={i}
              className="mb-8 border p-4 rounded-2xl shadow-sm bg-gray-50"
            >
              <label className="block font-medium mb-2">Question {i + 1}</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(i, "question", e.target.value)
                }
                className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4 transition"
                placeholder="Enter the question"
              />

              {q.options.map((opt, j) => (
                <div key={j} className="mb-3 flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={opt.isCorrect}
                    onChange={() => handleCorrectChange(i, j)}
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(i, j, e.target.value)}
                    className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full transition"
                    placeholder={`Option ${j + 1}`}
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-2xl shadow transition"
          >
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>

        <AdminFooter />
      </div>
    </div>
  );
};

export default CreateQuiz;
