import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/StudentFooter";

interface Option {
  text: string;
  isCorrect: boolean;
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
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeExpired, setTimeExpired] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`/quizzes/${quizId}`);
      const data = res.data;
      setQuiz(data);

      try {
        const statusRes = await axios.get(`/quizzes/${quizId}/status`);
        if (statusRes.data.completed) {
          setScore(statusRes.data.score);
          setAnswers(
            Array.isArray(statusRes.data.answers) &&
            statusRes.data.answers.length === data.questions.length
              ? statusRes.data.answers
              : Array(data.questions.length).fill(-1)
          );
          setTimeLeft(0);
          setTimeExpired(false);
        } else {
          setAnswers(Array(data.questions.length).fill(-1));
          setTimeLeft(data.timeLimit * 60);
          setTimeExpired(false);
        }
      } catch {
        setAnswers(Array(data.questions.length).fill(-1));
        setTimeLeft(data.timeLimit * 60);
        setTimeExpired(false);
      }
    } catch (err) {
      console.error("Failed to load quiz", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizId]);

  useEffect(() => {
    if (!quiz || score !== null) return;

    if (timeLeft > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !timeExpired) {
      // Timer just reached zero
      setTimeExpired(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft, quiz, score, timeExpired]);

  // Auto-submit when time expired and all questions answered
  useEffect(() => {
    if (timeExpired) {
      if (answers.length === quiz?.questions.length && !answers.includes(-1)) {
        handleSubmit();
      }
    }
  }, [timeExpired]);

  const handleChange = (questionIndex: number, selectedIndex: number) => {
    if (score !== null || timeExpired) return;
    const updated = [...answers];
    updated[questionIndex] = selectedIndex;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    if (score !== null) return;

    if (answers.includes(-1)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      const res = await axios.post(`/quizzes/${quizId}/submit`, { answers });
      setScore(res.data.score);
      setTimeExpired(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed");
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

  return (
    <>
      <StudentHeader />
      <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#4F46E5]">
          {quiz.title}
        </h1>

        {score === null && (
          <div className="mb-8 text-center">
            {!timeExpired ? (
              <span
                className={`inline-block text-xl font-bold px-5 py-2 rounded-full shadow 
                ${
                  timeLeft > 30
                    ? "bg-green-100 text-green-800"
                    : timeLeft > 10
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800 animate-pulse"
                }`}
              >
                ⏱ Time Left: {formatTime(timeLeft)}
              </span>
            ) : (
              <span className="inline-block text-xl font-bold px-5 py-2 rounded-full shadow bg-red-600 text-white animate-pulse">
                ⏰ Time's up!
              </span>
            )}
          </div>
        )}

        {quiz.questions.map((q, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm"
          >
            <p className="font-medium text-lg mb-4">
              {i + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const isSelected = answers[i] === idx;
                const isCorrect = opt.isCorrect;
                const correctIndex = q.options.findIndex((o) => o.isCorrect);

                let borderColor = "border-gray-300";
                let bgColor = "bg-white";
                let icon = null;

                if (score !== null) {
                  if (isSelected && isCorrect) {
                    borderColor = "border-green-500";
                    bgColor = "bg-green-100";
                    icon = "✅";
                  } else if (isSelected && !isCorrect) {
                    borderColor = "border-red-500";
                    bgColor = "bg-red-100";
                    icon = "❌";
                  } else if (!isSelected && isCorrect) {
                    borderColor = "border-green-300";
                    bgColor = "bg-green-50";
                    icon = "✅";
                  }
                } else if (isSelected) {
                  borderColor = "border-blue-500";
                  bgColor = "bg-blue-50";
                }

                return (
                  <label
                    key={idx}
                    className={`flex items-center p-3 rounded-lg border ${borderColor} ${bgColor} cursor-pointer transition-all`}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={idx}
                      checked={isSelected}
                      onChange={() => handleChange(i, idx)}
                      disabled={score !== null || timeExpired}
                      className="mr-3"
                    />
                    <span className="text-sm sm:text-base flex-1">
                      {opt.text}
                    </span>
                    {score !== null && icon && (
                      <span className="ml-2 text-lg">{icon}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {score === null ? (
          <button
            onClick={handleSubmit}
            disabled={answers.includes(-1) || timeExpired}
            className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition 
              ${
                answers.includes(-1) || timeExpired
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Submit Quiz
          </button>
        ) : (
          <div className="mt-8 bg-green-50 text-green-800 border border-green-300 rounded-lg p-4 text-center text-xl font-semibold shadow-sm">
            🎉 Your Score: {score}/{quiz.questions.length}
          </div>
        )}
      </div>
      <StudentFooter />
    </>
  );
};

export default AttemptQuiz;
