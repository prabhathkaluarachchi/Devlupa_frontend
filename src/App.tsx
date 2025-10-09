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
import Test from "./pages/common/Test";
import AdminAssignments from "./pages/admin/AdminAssignments";
import AttemptAssignment from "./pages/student/AttemptAssignment";
import AssignmentList from "./pages/student/AssignmentList";
import AdminManageUsers from "./pages/admin/AdminManageUsers";
import GradeAssignment from "./pages/admin/GradeAssignment";
import AdminCVfilter from "./pages/admin/AdminCVfilter";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/test" element={<Test />} />

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
        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute role="admin">
              <AdminAssignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cv-filter"
          element={
            <ProtectedRoute role="admin">
              <AdminCVfilter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assignments/:assignmentId/user/:userId/grade"
          element={
            <ProtectedRoute role="admin">
              <GradeAssignment />
            </ProtectedRoute>
          }
        />

        {/* Student protected routes */}
        <Route
          path="/quizzes"
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
          path="/assignments"
          element={
            <ProtectedRoute role="student">
              <AssignmentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments/:assignmentId"
          element={
            <ProtectedRoute role="student">
              <AttemptAssignment />
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
          path="/quizzes/:quizId"
          element={
            <ProtectedRoute role="student">
              <AttemptQuiz />
            </ProtectedRoute>
          }
        />
        {/* All assignments */}
        <Route
          path="/assignments"
          element={
            <ProtectedRoute role="student">
              <AssignmentList />
            </ProtectedRoute>
          }
        />

        {/* Assignments per course */}
        <Route
          path="/courses/:courseId/assignments"
          element={
            <ProtectedRoute role="student">
              <AssignmentList />
            </ProtectedRoute>
          }
        />

        {/* Assignment attempt page */}
        <Route
          path="/assignments/:assignmentId/attempt"
          element={
            <ProtectedRoute role="student">
              <AttemptAssignment />
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
