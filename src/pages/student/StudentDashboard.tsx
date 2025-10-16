import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  percentage: number;
}

interface QuizProgress {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
}

interface AssignmentProgress {
  assignmentId: string;
  assignmentTitle: string;
  submitted: boolean;
  status: "Pending" | "Submitted" | "Graded";
  score: number | null;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [quizProgress, setQuizProgress] = useState<QuizProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Student");
  const [assignmentProgress, setAssignmentProgress] = useState<
    AssignmentProgress[]
  >([]);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await axios.get("/users/profile");
        setUserName(res.data.name || "Student");
      } catch (err) {
        console.error(err);
        setUserName("Student");
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const fetchAssignmentsProgress = async () => {
      try {
        const res = await axios.get("/assignments/progress");
        setAssignmentProgress(res.data.assignments || []);
      } catch {
        setAssignmentError("Failed to load assignment progress");
      }
    };

    fetchAssignmentsProgress();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const courseRes = await axios.get("/users/studentprogress");
        setProgress(courseRes.data);
      } catch (err) {
        console.error("Course progress error:", err);
        setError("Failed to load course progress");
      }

      try {
        const quizRes = await axios.get("/users/studentquizprogress");
        const quizzes = Array.isArray(quizRes.data.quizzes)
          ? quizRes.data.quizzes
          : [];
        setQuizProgress(quizzes);
      } catch (err) {
        console.error("Quiz progress error:", err);
        setQuizError("Failed to load quiz progress");
      }

      setLoading(false);
    };

    fetchProgress();
  }, []);

  const getColor = (percentage: number) => {
    if (percentage >= 80) return "#16a34a"; // green
    if (percentage >= 50) return "#facc15"; // yellow
    return "#ef4444"; // red
  };

  // Calculate statistics
  const totalCourses = progress.length;
  const totalQuizzes = quizProgress.length;
  const totalAssignments = assignmentProgress.length;
  const averageCourseProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, course) => sum + course.percentage, 0) /
            progress.length
        )
      : 0;
  const submittedAssignments = assignmentProgress.filter(
    (a) => a.status === "Submitted" || a.status === "Graded"
  ).length;

  // Fixed Chart data for course progress
  const getColor2 = (percentage: number) => {
    if (percentage >= 90) return "#6366F1"; // Indigo-500
    if (percentage >= 75) return "#3B82F6"; // Blue-500
    if (percentage >= 50) return "#06B6D4"; // Cyan-500
    if (percentage >= 25) return "#8B5CF6"; // Purple-500
    return "#9CA3AF"; // Gray-400 for very low progress
  };

  // Fixed Chart data for course progress
  const courseChartData = {
    labels:
      progress.length > 0
        ? progress.map((course) =>
            course.courseTitle.length > 15
              ? course.courseTitle.substring(0, 15) + "..."
              : course.courseTitle
          )
        : ["No Courses"],
    datasets: [
      {
        label: "Completion %",
        data:
          progress.length > 0
            ? progress.map((course) => course.percentage)
            : [0],
        backgroundColor:
          progress.length > 0
            ? progress.map((course) => getColor2(course.percentage))
            : ["#9CA3AF"], // Gray
        borderColor:
          progress.length > 0
            ? progress.map((course) => getColor2(course.percentage))
            : ["#9CA3AF"],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    maintainAspectRatio: false,
  };

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
          <span className="mt-4 text-[#4F46E5] font-semibold">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <StudentSidebar />
        <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
          <h1 className="text-4xl font-bold mb-8 text-[#4F46E5]">
            Welcome back, {userName}!
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">
                    Enrolled Courses
                  </h2>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">
                    Avg. Course Progress
                  </h2>
                  <p className="text-2xl font-semibold text-gray-900">
                    {averageCourseProgress}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">
                    Total Quizzes
                  </h2>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalQuizzes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">
                    Assignments
                  </h2>
                  <p className="text-2xl font-semibold text-gray-900">
                    {submittedAssignments}/{totalAssignments}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout: Course Progress Chart + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quick Actions - Gradient Card Style */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-md p-6 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h2>
                  <p className="text-sm text-gray-600">
                    Jump to your learning areas
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/courses")}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-blue-300 hover:shadow-md"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Browse Courses
                </button>
                <button
                  onClick={() => navigate("/quizzes")}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-purple-300 hover:shadow-md"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Take Quizzes
                </button>
                <button
                  onClick={() => navigate("/assignments")}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-green-300 hover:shadow-md"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  View Assignments
                </button>
              </div>
            </div>

            {/* Course Progress Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Course Progress Overview
              </h3>
              <div className="h-64">
                {progress.length > 0 ? (
                  <Bar data={courseChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No course progress data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Three Column Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Progress */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Course Progress ({progress.length})
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {error ? (
                  <p className="text-red-600 text-center py-4">{error}</p>
                ) : progress.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No courses enrolled yet
                  </p>
                ) : (
                  progress.map(({ courseId, courseTitle, percentage }) => (
                    <div
                      key={courseId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/courses/${courseId}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {courseTitle}
                        </p>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>{percentage}% complete</span>
                        </div>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 ml-4">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getColor(percentage),
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quiz Progress */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quiz Results ({quizProgress.length})
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {quizError ? (
                  <p className="text-red-600 text-center py-4">{quizError}</p>
                ) : quizProgress.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No quizzes taken yet
                  </p>
                ) : (
                  quizProgress.map(
                    ({ quizId, quizTitle, correctAnswers, totalQuestions }) => {
                      const percentage =
                        totalQuestions > 0
                          ? Math.round((correctAnswers / totalQuestions) * 100)
                          : 0;

                      return (
                        <div
                          key={quizId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/quizzes/${quizId}`)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {quizTitle}
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                              <span>
                                {correctAnswers}/{totalQuestions} correct
                              </span>
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              percentage >= 80
                                ? "bg-green-100 text-green-800"
                                : percentage >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {percentage}%
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>

            {/* Assignment Progress */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assignments ({assignmentProgress.length})
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {assignmentError ? (
                  <p className="text-red-600 text-center py-4">
                    {assignmentError}
                  </p>
                ) : assignmentProgress.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No assignments yet
                  </p>
                ) : (
                  assignmentProgress.map(
                    ({ assignmentId, assignmentTitle, status, score }) => (
                      <div
                        key={assignmentId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/assignments/${assignmentId}`)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {assignmentTitle}
                          </p>
                          <div className="flex items-center text-sm text-gray-600">
                            <span>
                              {status === "Graded" && score !== null
                                ? `Score: ${score}`
                                : status}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === "Graded"
                              ? "bg-green-100 text-green-800"
                              : status === "Submitted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {status}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <StudentFooter />
    </div>
  );
};

export default StudentDashboard;
