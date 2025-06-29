import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center relative">
      <h1 className="text-2xl font-bold text-[#4F46E5]">
        <Link to="/admin" onClick={closeMenu}>DevLupa Admin</Link>
      </h1>

      {/* Desktop nav */}
      <nav className="hidden md:flex space-x-4">
        <Link to="/admin" className="text-gray-700 hover:text-[#4F46E5]">Dashboard</Link>
        <Link to="/admin/courses" className="text-gray-700 hover:text-[#4F46E5]">Courses</Link>
        <Link to="/admin/quizzes" className="text-gray-700 hover:text-[#4F46E5]">Quizzes</Link>
        <Link to="/admin-assignments" className="text-gray-700 hover:text-[#4F46E5]">Assignments</Link>
        <button onClick={handleLogout} className="ml-4 text-red-500 hover:underline">Logout</button>
      </nav>

      {/* Hamburger button mobile */}
      <button
        className="md:hidden text-gray-700 focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Full screen overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6">
          <button
            onClick={closeMenu}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <nav className="flex flex-col space-y-6 text-lg font-semibold text-gray-700">
            <Link to="/admin" onClick={closeMenu}>Dashboard</Link>
            <Link to="/admin/courses" onClick={closeMenu}>Courses</Link>
            <Link to="/admin/quizzes" onClick={closeMenu}>Quizzes</Link>
            <Link to="/admin-assignments" onClick={closeMenu}>Assignments</Link>
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

export default AdminHeader;
