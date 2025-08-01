import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import logo from "../../assets/logo.png";
import sampleImage from "../../assets/auth-illustration.png";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "register" | "forgot">("login");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", loginForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const role = res.data.user.role?.toLowerCase();
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/register", registerForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const role = res.data.user.role?.toLowerCase();
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage("");
    setForgotError("");
    try {
      const res = await axios.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMessage(res.data.message);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left side: Forms */}
        <div className="p-10 sm:p-12 flex flex-col justify-center">
          <img src={logo} alt="Logo" className="w-24 mx-auto mb-6" />
          {view === "login" && (
            <>
              <h3 className="text-2xl font-semibold mb-6 text-center">Login</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md hover:opacity-90 transition">
                  Login
                </button>
              </form>
              <div className="flex justify-between mt-4 text-sm text-gray-600">
                <span onClick={() => setView("forgot")} className="cursor-pointer underline">
                  Forgot Password?
                </span>
                <span onClick={() => setView("register")} className="cursor-pointer underline">
                  Create an account
                </span>
              </div>
            </>
          )}

          {view === "register" && (
            <>
              <h3 className="text-2xl font-semibold mb-6 text-center">Register</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  placeholder="Name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md hover:opacity-90 transition">
                  Register
                </button>
              </form>
              <p className="mt-4 text-sm text-center text-gray-600">
                Already have an account?{' '}
                <span onClick={() => setView("login")} className="text-blue-600 cursor-pointer underline">
                  Login
                </span>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <h3 className="text-2xl font-semibold mb-6 text-center">Forgot Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md hover:opacity-90 transition">
                  Send Reset Link
                </button>
              </form>
              {forgotMessage && <p className="mt-3 text-green-600 text-center text-sm">{forgotMessage}</p>}
              {forgotError && <p className="mt-3 text-red-600 text-center text-sm">{forgotError}</p>}
              <p className="mt-4 text-sm text-center text-gray-600">
                Remembered your password?{' '}
                <span onClick={() => setView("login")} className="text-blue-600 cursor-pointer underline">
                  Login
                </span>
              </p>
            </>
          )}
        </div>

        {/* Right side: Illustration */}
        <div className="bg-gradient-to-br from-blue-50 via-cyan-100 to-white p-10 flex flex-col justify-center items-center text-center">
          <img src={sampleImage} alt="Illustration" className="w-3/4 max-w-sm mb-6" />
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Welcome to the DevLupa digital platform</h2>
          <p className="text-blue-700 max-w-xs">
            Learn new skills, challenge yourself, and grow with DevLupa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
