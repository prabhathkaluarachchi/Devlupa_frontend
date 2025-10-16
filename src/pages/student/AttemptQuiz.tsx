import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Swal from "sweetalert2";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";

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
  timeLimit: number;
  questions: Question[];
}

const AttemptQuiz: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeExpired, setTimeExpired] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showAlert = (
    icon: "success" | "error" | "warning" | "info" | "question",
    title: string,
    text: string = "",
    confirmButtonText: string = "OK",
    showCancelButton: boolean = false,
    cancelButtonText: string = "Cancel"
  ) => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonText,
      cancelButtonText,
      showCancelButton,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
    });
  };

  const confirmStartQuiz = async () => {
    if (!quiz) return;

    const result = await showAlert(
      "question",
      "Start Quiz?",
      `You have ${quiz.timeLimit} minutes to complete ${quiz.questions.length} questions. Once started, the timer cannot be paused.`,
      "Start Quiz",
      true,
      "Go Back"
    );

    if (result.isConfirmed) {
      setQuizStarted(true);
      // Start the timer when user confirms
      if (timeLeft > 0 && !timerRef.current) {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      }
    } else {
      // User chose to go back
      navigate(-1);
    }
  };

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
          setQuizStarted(true); // Quiz already completed
        } else {
          setAnswers(Array(data.questions.length).fill(-1));
          setTimeLeft(data.timeLimit * 60);
          setTimeExpired(false);
          // Show confirmation for new quiz
          setTimeout(() => {
            confirmStartQuiz();
          }, 500);
        }
      } catch {
        setAnswers(Array(data.questions.length).fill(-1));
        setTimeLeft(data.timeLimit * 60);
        setTimeExpired(false);
        // Show confirmation for new quiz
        setTimeout(() => {
          confirmStartQuiz();
        }, 500);
      }
    } catch (err) {
      console.error("Failed to load quiz", err);
      showAlert("error", "Error", "Failed to load quiz. Please try again.");
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
    if (!quiz || score !== null || !quizStarted) return;

    if (timeLeft > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !timeExpired && quizStarted) {
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
  }, [timeLeft, quiz, score, timeExpired, quizStarted]);

  // Auto-submit when time expired and all questions answered
  useEffect(() => {
    if (timeExpired && quizStarted) {
      if (answers.length === quiz?.questions.length && !answers.includes(-1)) {
        handleSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeExpired]);

  const handleChange = (questionIndex: number, selectedIndex: number) => {
    if (score !== null || timeExpired || !quizStarted) return;
    const updated = [...answers];
    updated[questionIndex] = selectedIndex;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (!quiz || !quizStarted) return;
    if (score !== null) return;

    if (answers.includes(-1)) {
      const result = await showAlert(
        "warning",
        "Unanswered Questions",
        "You have not answered all questions. Are you sure you want to submit?",
        "Submit Anyway",
        true,
        "Continue Quiz"
      );

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      const res = await axios.post(`/quizzes/${quizId}/submit`, { answers });
      setScore(res.data.score);
      setTimeExpired(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Show success alert
      const percentage = (res.data.score / quiz.questions.length) * 100;
      let message = "";
      if (percentage === 100) {
        message = "Perfect score! Excellent work! 🏆";
      } else if (percentage >= 70) {
        message = "Great job! You passed! 👍";
      } else {
        message = "Keep practicing! You can do better! 💪";
      }

      showAlert(
        "success",
        "Quiz Submitted!",
        `Your score: ${res.data.score}/${quiz.questions.length}\n${message}`
      );
    } catch (err: any) {
      showAlert(
        "error",
        "Submission Failed",
        err.response?.data?.message ||
          "Unable to submit quiz. Please try again."
      );
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    const answered = answers.filter((answer) => answer !== -1).length;
    return (answered / quiz.questions.length) * 100;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <span className="text-indigo-600 text-lg font-semibold">
            Loading Quiz...
          </span>
        </div>
      </div>
    );

  if (!quiz)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Quiz Not Found
          </h2>
          <p className="text-gray-600">
            The requested quiz could not be loaded.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  // Show quiz instructions if not started
  if (!quizStarted && score === null) {
    return (
      <div className="flex bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <StudentSidebar />
        <div className="flex flex-col flex-1 ml-0 md:ml-64 transition-all">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {quiz.title}
              </h1>
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center gap-3 text-gray-600">
                  <span>⏱️</span>
                  <span>Time Limit: {quiz.timeLimit} minutes</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span>❓</span>
                  <span>Questions: {quiz.questions.length}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span>⚠️</span>
                  <span>Timer starts immediately</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span>🚫</span>
                  <span>Cannot pause once started</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={confirmStartQuiz}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
          <StudentFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64 transition-all">
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {/* Quiz Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {quiz.title}
                </h1>
                <p className="text-gray-600">
                  {quiz.questions.length} questions • {quiz.timeLimit} minutes
                </p>
              </div>

              {/* Timer & Progress */}
              <div className="mt-4 lg:mt-0 lg:ml-6">
                {score === null && (
                  <div className="flex flex-col items-center">
                    <div
                      className={`text-2xl font-bold px-6 py-3 rounded-xl shadow-lg ${
                        timeLeft > 300
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : timeLeft > 60
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-red-100 text-red-800 border border-red-200 animate-pulse"
                      }`}
                    >
                      {!timeExpired ? (
                        <div className="flex items-center gap-2">
                          <span>⏱️</span>
                          {formatTime(timeLeft)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>⏰</span>
                          Time's Up!
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {answers.filter((a) => a !== -1).length} of{" "}
                      {quiz.questions.length} answered
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Questions Navigation */}
          {score === null && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentQuestion === index
                        ? "bg-indigo-600 text-white shadow-md"
                        : answers[index] !== -1
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Question */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h2>
              {score !== null && (
                <div className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  Score: {score}/{quiz.questions.length}
                </div>
              )}
            </div>

            <p className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
              {quiz.questions[currentQuestion].question}
            </p>

            <div className="space-y-3">
              {quiz.questions[currentQuestion].options.map((opt, idx) => {
                const isSelected = answers[currentQuestion] === idx;
                const isCorrect = opt.isCorrect;

                let borderColor = "border-gray-300";
                let bgColor = "bg-white";
                let textColor = "text-gray-800";
                let icon = null;

                if (score !== null) {
                  if (isSelected && isCorrect) {
                    borderColor = "border-green-500";
                    bgColor = "bg-green-50";
                    textColor = "text-green-800";
                    icon = "✅";
                  } else if (isSelected && !isCorrect) {
                    borderColor = "border-red-500";
                    bgColor = "bg-red-50";
                    textColor = "text-red-800";
                    icon = "❌";
                  } else if (!isSelected && isCorrect) {
                    borderColor = "border-green-300";
                    bgColor = "bg-green-50";
                    textColor = "text-green-800";
                    icon = "✅";
                  }
                } else if (isSelected) {
                  borderColor = "border-indigo-500";
                  bgColor = "bg-indigo-50";
                  textColor = "text-indigo-800";
                }

                return (
                  <label
                    key={idx}
                    htmlFor={`question-${currentQuestion}-option-${idx}`}
                    className={`flex items-center p-4 rounded-xl border-2 ${borderColor} ${bgColor} cursor-pointer transition-all duration-200 hover:shadow-md ${
                      score === null && !timeExpired && quizStarted
                        ? "hover:border-indigo-300"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      id={`question-${currentQuestion}-option-${idx}`}
                      name={`question-${currentQuestion}`}
                      value={idx}
                      checked={isSelected}
                      onChange={() => handleChange(currentQuestion, idx)}
                      disabled={score !== null || timeExpired || !quizStarted}
                      className="mr-4 cursor-pointer w-5 h-5 text-indigo-600"
                    />
                    <span className={`flex-1 font-medium ${textColor}`}>
                      {opt.text}
                    </span>
                    {score !== null && icon && (
                      <span className="ml-3 text-lg" aria-hidden="true">
                        {icon}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mb-6">
            <button
              onClick={() =>
                setCurrentQuestion((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>←</span>
              Previous
            </button>

            <button
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(quiz.questions.length - 1, prev + 1)
                )
              }
              disabled={currentQuestion === quiz.questions.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <span>→</span>
            </button>
          </div>

          {/* Submit Button or Results */}
          {score === null ? (
            <button
              onClick={handleSubmit}
              disabled={timeExpired || !quizStarted}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 ${
                timeExpired || !quizStarted
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {timeExpired ? "Time Expired" : "Submit Quiz"}
            </button>
          ) : (
<div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
  <div className="text-4xl mb-4">🎉</div>
  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    Quiz Completed!
  </h2>
  <p className="text-xl font-semibold text-gray-800 mb-4">
    Your Score: {score}/{quiz.questions.length}
  </p>
  <p
    className={`font-medium ${
      score === quiz.questions.length
        ? "text-green-600"
        : score >= quiz.questions.length * 0.7
        ? "text-blue-600"
        : "text-red-600"
    }`}
  >
    {score === quiz.questions.length
      ? "Perfect score! Excellent work! 🏆"
      : score >= quiz.questions.length * 0.7
      ? "Great job! You're doing well! 👍"
      : "Keep practicing! You'll get better! 💪"}
  </p>
</div>

          )}
        </div>

        <StudentFooter />
      </div>
    </div>
  );
};

export default AttemptQuiz;
