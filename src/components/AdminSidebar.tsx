import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logopng-01.png"; // Admin logo

const AdminSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  if (!token) return null;

  const links = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Courses",
      path: "/admin/courses",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: "Quizzes",
      path: "/admin/quizzes",
      icon: <FileQuestion className="w-5 h-5" />,
    },
    {
      name: "Assignments",
      path: "/admin/assignments",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
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
        {/* Logo Section */}
        <div className="flex items-center justify-center h-20 border-b p-4">
          <img src={logo} alt="Admin Logo" className="h-16 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {links.map((link) => {
            let isActive = false;
            if (link.path === "/admin") {
              isActive = location.pathname === link.path;
            } else {
              isActive = location.pathname.startsWith(link.path);
            }

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

        {/* Logout Button */}
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

export default AdminSidebar;
