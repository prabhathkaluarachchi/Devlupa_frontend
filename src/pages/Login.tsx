import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosInstance";
import Header from "../components/StudentHeader"; // the new header
import StudentFooter from "../components/StudentFooter";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role?.toLowerCase();
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "student") {
        navigate("/dashboard");
      } else {
        navigate("/unauthorized");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex flex-col md:flex-row flex-grow items-center justify-center px-6 py-12 max-w-7xl mx-auto gap-10">
        {/* Left side: info + image */}
        <section className="md:w-1/2 max-w-md text-center md:text-left">
          <h1 className="text-4xl font-bold text-[#4F46E5] mb-4">Welcome to DevLupa</h1>
          <p className="text-gray-700 mb-6">
            DevLupa is your ultimate skills development platform for undergraduates.
            Learn industry-relevant courses, take quizzes, submit assignments, and track your progress all in one place.
          </p>
          <img
            src="https://translate.how/i/learn.webp"
            alt="Learning illustration"
            className="w-full max-w-sm mx-auto md:mx-0"
          />
        </section>

        {/* Right side: login form */}
        <section className="md:w-1/2 max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Login to Your Account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#4F46E5] text-white py-3 rounded-md hover:bg-[#4338CA] transition-colors"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-[#4F46E5] cursor-pointer underline"
            >
              Register
            </span>
          </p>
        </section>
      </main>

      <StudentFooter />
    </div>
  );
};

export default Login;
