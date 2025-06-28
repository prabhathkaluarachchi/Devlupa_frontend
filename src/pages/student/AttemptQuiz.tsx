import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axiosInstance";

interface Option {
  text: string;
  isCorrect: boolean; // won't be shown to the student
}

interface Question {
  question: string;
  options: Option[];
}

interface Quiz {
  _id: string;
  title: string;
  timeLimit: number; // in minutes
  questions: Question[];
}

const AttemptQuiz: React.FC = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/quizzes/${quizId}`);
        const data = res.data;
        setQuiz(data);
        setAnswers(Array(data.questions.length).fill(-1));
        setTimeLeft(data.timeLimit * 60);
      } catch (err) {
        console.error("Failed to load quiz", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!quiz || score !== null) return;

    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleSubmit(); // Auto-submit
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, quiz, score]);

  // Answer change
  const handleChange = (questionIndex: number, selectedIndex: number) => {
    if (score !== null) return;
    const updated = [...answers];
    updated[questionIndex] = selectedIndex;
    setAnswers(updated);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!quiz) {
      alert("Quiz not fully loaded yet.");
      return;
    }

    if (answers.length !== quiz.questions.length) {
      alert("Answer count does not match number of questions.");
      return;
    }

    if (answers.includes(-1)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      const res = await axios.post(`/quizzes/${quizId}/submit`, { answers });
      setScore(res.data.score);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err: any) {
      console.error("Submission failed", err);
      alert(err.response?.data?.message || "Submission error");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) return <div className="p-6">Loading quiz...</div>;
  if (!quiz) return <div className="p-6">Quiz not found.</div>;

  if (score !== null) {
    return (
      <div className="p-6 text-xl font-semibold">
        Your Score: {score}/{quiz.questions.length}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>

      <div className="mb-6 text-lg font-semibold">
        Time Remaining:{" "}
        <span className={`font-mono ${timeLeft <= 10 ? "text-red-600" : ""}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {quiz.questions.map((q, i) => (
        <div key={i} className="mb-6">
          <p className="font-medium mb-2">
            {i + 1}. {q.question}
          </p>
          <div className="space-y-1">
            {q.options.map((opt, idx) => (
              <label
                key={idx}
                className={`block cursor-pointer ${
                  score !== null ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`question-${i}`}
                  value={idx}
                  checked={answers[i] === idx}
                  onChange={() => handleChange(i, idx)}
                  className="mr-2"
                  disabled={score !== null}
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      {score === null ? (
        <button
          onClick={handleSubmit}
          disabled={
            !quiz ||
            answers.includes(-1) ||
            answers.length !== quiz.questions.length
          }
          className="mt-4 px-6 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
        >
          Submit Quiz
        </button>
      ) : (
        <button
          disabled
          className="mt-4 px-6 py-2 rounded text-white bg-gray-500 cursor-not-allowed"
        >
          Quiz Submitted
        </button>
      )}
    </div>
  );
};

export default AttemptQuiz;
