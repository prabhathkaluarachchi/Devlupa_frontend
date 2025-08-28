import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Toggle menu open/close
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Close menu on navigation (mobile UX)
  const closeMenu = () => {
    setMenuOpen(false);
  };

  if (!token) {
    return (
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#4F46E5]">
          <Link to="/" onClick={closeMenu}>
            DevLupa
          </Link>
        </h1>
        <nav>
          <Link
            to="/register"
            className="text-[#4F46E5] hover:underline font-semibold"
            onClick={closeMenu}
          >
            Register
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-[#4F46E5]">
        <Link to="/dashboard" onClick={closeMenu}>
          DevLupa
        </Link>
      </h1>

      {/* Desktop menu */}
      <nav className="hidden md:flex space-x-4 items-center">
        <Link
          to="/dashboard"
          className="text-gray-700 hover:text-[#4F46E5]"
          onClick={closeMenu}
        >
          Dashboard
        </Link>
        <Link
          to="/courses"
          className="text-gray-700 hover:text-[#4F46E5]"
          onClick={closeMenu}
        >
          Courses
        </Link>
        <Link
          to="/quizzes"
          className="text-gray-700 hover:text-[#4F46E5]"
          onClick={closeMenu}
        >
          Quizzes
        </Link>
        <Link
          to="/assignments"
          className="text-gray-700 hover:text-[#4F46E5]"
          onClick={closeMenu}
        >
          Assignments
        </Link>
        <button
          onClick={() => {
            handleLogout();
            closeMenu();
          }}
          className="ml-4 text-red-500 hover:underline"
        >
          Logout
        </button>
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden focus:outline-none"
        aria-label="Toggle menu"
        onClick={toggleMenu}
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {menuOpen ? (
            // X icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            // Hamburger icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6">
          <button
            onClick={toggleMenu}
            aria-label="Close menu"
            className="self-end mb-6 text-gray-700 hover:text-[#4F46E5] focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <nav className="flex flex-col space-y-6 text-lg font-semibold text-gray-700">
            <Link
              to="/dashboard"
              onClick={() => {
                closeMenu();
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/courses"
              onClick={() => {
                closeMenu();
              }}
            >
              Courses
            </Link>
            <Link
              to="/student-quizzes"
              onClick={() => {
                closeMenu();
              }}
            >
              Quizzes
            </Link>
            <Link
              to="/student-assignments"
              onClick={() => {
                closeMenu();
              }}
            >
              Assignments
            </Link>
            <button
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
              className="text-red-500 hover:underline text-left"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
