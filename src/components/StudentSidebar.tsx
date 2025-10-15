import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import axios from "../utils/axiosInstance";
import logo from "../assets/logopng-01.png"; // updated logo

interface UserProfile {
  name: string;
  email: string;
}

const StudentSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await axios.get("/users/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUser();
  }, [token]);

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

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Courses",
      path: "/courses",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: "Quizzes",
      path: "/quizzes",
      icon: <FileQuestion className="w-5 h-5" />,
    },
    {
      name: "Assignments",
      path: "/assignments",
      icon: <ClipboardList className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile toggle button - Previous style */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 md:left-0 right-0 h-full bg-[#e0f0ff] shadow-lg z-40 transform transition-transform duration-300
          w-64 flex flex-col border-l border-gray-200
          ${isOpen ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
      >
        {/* Logo + User Profile */}
        <div className="flex flex-col items-center justify-center border-b p-4 text-center">
          <img
            src={logo}
            alt="DevLupa Logo"
            className="h-16 object-contain mb-3"
          />
          {user && (
            <div>
              <p className="text-gray-800 font-semibold text-base">
                {user.name}
              </p>
              <p className="text-gray-500 text-[12px] truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg transition
                ${
                  isActive
                    ? "bg-[#4F46E5] text-white"
                    : "text-gray-700 hover:bg-[#4F46E5] hover:text-white"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 justify-center w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg font-semibold transition"
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
