import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Unauthorized from "./pages/common/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/student/StudentDashboard";
import ResetPassword from "./pages/common/ResetPassword";
import QuizList from "./pages/student/QuizList";
import AttemptQuiz from "./pages/student/AttemptQuiz";
import CreateQuiz from "./pages/admin/CreateQuiz";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AuthPage from "./pages/common/AuthPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import StudentAllQuizzes from "./pages/student/StudentAllQuizzes";
import Courses from "./pages/student/Courses";
import CourseDetail from "./pages/student/CourseDetail";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin protected routes */}
        <Route
          path="/admin/quizzes"
          element={
            <ProtectedRoute role="admin">
              <AdminQuizzes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/quizzes/create"
          element={
            <ProtectedRoute role="admin">
              <CreateQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute role="admin">
              <AdminCourses />
            </ProtectedRoute>
          }
        />

        {/* Student protected routes */}
        <Route
          path="/student-quizzes"
          element={
            <ProtectedRoute role="student">
              <StudentAllQuizzes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute role="student">
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute role="student">
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/quizzes"
          element={
            <ProtectedRoute role="student">
              <QuizList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quizzes/:quizId"
          element={
            <ProtectedRoute role="student">
              <AttemptQuiz />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<AuthPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
