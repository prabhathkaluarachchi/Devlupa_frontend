import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/StudentFooter";

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
  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`/quizzes/${quizId}`);
      const data = res.data;
      setQuiz(data);

      // Check if already completed
      try {
        const statusRes = await axios.get(`/quizzes/${quizId}/status`);
        if (statusRes.data.completed) {
          setScore(statusRes.data.score);

          // ✅ Safe fallback if no answers or mismatched length
          if (
            Array.isArray(statusRes.data.answers) &&
            statusRes.data.answers.length === data.questions.length
          ) {
            setAnswers(statusRes.data.answers);
          } else {
            setAnswers(Array(data.questions.length).fill(-1));
          }
          setTimeLeft(0);
        } else {
          setAnswers(Array(data.questions.length).fill(-1));
          setTimeLeft(data.timeLimit * 60);
        }
      } catch (statusErr) {
        console.error("Quiz status check failed:", statusErr);
        setAnswers(Array(data.questions.length).fill(-1));
        setTimeLeft(data.timeLimit * 60);
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (!quiz || score !== null) return; // stop if quiz loaded and score set

    if (timeLeft > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);

      // Only submit if answers length matches questions length
      if (answers.length === quiz.questions.length && !answers.includes(-1)) {
        handleSubmit();
      } else {
        // optionally alert or silently ignore
        console.log("Not submitting due to incomplete or mismatched answers");
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, quiz, score, answers]);

  // Change handler
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

    if (score !== null) {
      return; // Prevent submission if quiz already completed
    }

    if (answers.length !== quiz.questions.length) {
      alert("Answers count mismatch quiz questions. Cannot submit.");
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

  return (
    <>
      <StudentHeader />
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>

        {score === null && (
          <div className="mb-6 text-lg font-semibold">
            Time Remaining:{" "}
            <span
              className={`font-mono ${timeLeft <= 10 ? "text-red-600" : ""}`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        {quiz.questions.map((q, i) => (
          <div key={i} className="mb-6">
            <p className="font-medium mb-2">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-1">
              {q.options.map((opt, idx) => {
                const isSelected = answers[i] === idx;
                const isCorrect = opt.isCorrect;
                const correctIndex = q.options.findIndex((o) => o.isCorrect);

                let optionStyle = "";
                if (score !== null) {
                  if (isSelected && isCorrect)
                    optionStyle = "bg-green-100 border-green-500";
                  else if (isSelected && !isCorrect)
                    optionStyle = "bg-red-100 border-red-500";
                  else if (!isSelected && idx === correctIndex)
                    optionStyle = "bg-green-50";
                }

                return (
                  <label
                    key={idx}
                    className={`block p-2 border rounded ${optionStyle}`}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={idx}
                      checked={isSelected}
                      onChange={() => handleChange(i, idx)}
                      disabled={score !== null}
                      className="mr-2"
                    />
                    {opt.text}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {score === null ? (
          <button
            onClick={handleSubmit}
            disabled={answers.includes(-1)}
            className="mt-4 px-6 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            Submit Quiz
          </button>
        ) : (
          <div className="mt-6 text-xl font-semibold">
            Your Score: {score}/{quiz.questions.length}
          </div>
        )}
      </div>
      <StudentFooter />
    </>
  );
};

export default AttemptQuiz;
