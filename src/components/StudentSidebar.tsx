import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react"; // lucide-react icons

const StudentSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!token) {
    return (
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#4F46E5]">
          <Link to="/">DevLupa</Link>
        </h1>
        <nav>
          <Link
            to="/register"
            className="text-[#4F46E5] hover:underline font-semibold"
          >
            Register
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transform transition-transform duration-300
        w-64 flex flex-col border-r border-gray-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-2xl font-bold text-[#4F46E5]">DevLupa</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#4F46E5] hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/courses"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#4F46E5] hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            <BookOpen className="w-5 h-5" />
            Courses
          </Link>
          <Link
            to="/quizzes"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#4F46E5] hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            <FileQuestion className="w-5 h-5" />
            Quizzes
          </Link>
          <Link
            to="/assignments"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#4F46E5] hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            <ClipboardList className="w-5 h-5" />
            Assignments
          </Link>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 text-red-500 hover:bg-red-100 w-full p-2 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default StudentSidebar;
