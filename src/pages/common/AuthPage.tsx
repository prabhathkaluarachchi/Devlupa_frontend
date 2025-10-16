import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Swal from "sweetalert2";
import logo from "../../assets/logo.png";
import sampleImage from "../../assets/auth-illustration.png";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "register" | "forgot">("login");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const showAlert = (
    icon: "success" | "error" | "warning" | "info",
    title: string,
    text: string = ""
  ) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "#3b82f6",
    });
  };

  const validatePassword = (password: string): boolean => {
    // Allows letters (a-z, A-Z), numbers (0-9), and special characters: # @ $ ! % * ? &
    const regex = /^[a-zA-Z0-9#@$!%*?&]{6,12}$/;
    return regex.test(password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", loginForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const role = res.data.user.role?.toLowerCase();

      showAlert(
        "success",
        "Login Successful!",
        `Welcome back, ${res.data.user.name || "User"}!`
      );

      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : "/dashboard");
      }, 1500);
    } catch (err: any) {
      showAlert(
        "error",
        "Login Failed",
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    if (!validatePassword(registerForm.password)) {
      showAlert(
        "warning",
        "Invalid Password",
        "Password must be 6-12 characters long and can contain letters, numbers, and special characters: # @ $ ! % * ? &"
      );
      return;
    }

    // Check if names are provided
    if (!registerForm.firstName.trim() || !registerForm.lastName.trim()) {
      showAlert(
        "warning",
        "Name Required",
        "Please provide both first and last name."
      );
      return;
    }

    try {
      // Combine first and last name for backend compatibility
      const payload = {
        name: `${registerForm.firstName} ${registerForm.lastName}`,
        email: registerForm.email,
        password: registerForm.password,
      };

      const res = await axios.post("/auth/register", payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const role = res.data.user.role?.toLowerCase();

      showAlert(
        "success",
        "Registration Successful!",
        `Welcome to DevLupa, ${registerForm.firstName}!`
      );

      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : "/dashboard");
      }, 1500);
    } catch (err: any) {
      showAlert(
        "error",
        "Registration Failed",
        err.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage("");
    setForgotError("");

    if (!forgotEmail) {
      showAlert(
        "warning",
        "Email Required",
        "Please enter your email address."
      );
      return;
    }

    try {
      const res = await axios.post("/auth/forgot-password", {
        email: forgotEmail,
      });
      setForgotMessage(res.data.message);
      showAlert(
        "success",
        "Reset Link Sent!",
        "Check your email for password reset instructions."
      );
      setForgotEmail("");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Unable to send reset link. Please try again.";
      setForgotError(errorMsg);
      showAlert("error", "Request Failed", errorMsg);
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
                  placeholder="Email Address"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md hover:opacity-90 transition font-medium"
                >
                  Login
                </button>
              </form>
              <div className="flex justify-between mt-4 text-sm text-gray-600">
                <span
                  onClick={() => setView("forgot")}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                >
                  Forgot Password?
                </span>
                <span
                  onClick={() => setView("register")}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                >
                  Create an account
                </span>
              </div>
            </>
          )}

          {view === "register" && (
            <>
              <h3 className="text-2xl font-semibold mb-6 text-center">
                Create Account
              </h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={registerForm.firstName}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={registerForm.lastName}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="password"
                  placeholder="Password (6-12 characters, letters, numbers, #@$!%*?&)"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 -mt-2">
                  Password must be 6-12 characters long and can contain letters,
                  numbers, and special characters: # @ $ ! % * ? &
                </p>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md hover:opacity-90 transition font-medium"
                >
                  Create Account
                </button>
              </form>
              <p className="mt-4 text-sm text-center text-gray-600">
                Already have an account?{" "}
                <span
                  onClick={() => setView("login")}
                  className="text-blue-600 cursor-pointer hover:underline font-medium"
                >
                  Login
                </span>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <h3 className="text-2xl font-semibold mb-6 text-center">
                Reset Your Password
              </h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md hover:opacity-90 transition font-medium"
                >
                  Send Reset Link
                </button>
              </form>
              {forgotMessage && (
                <p className="mt-3 text-green-600 text-center text-sm">
                  {forgotMessage}
                </p>
              )}
              {forgotError && (
                <p className="mt-3 text-red-600 text-center text-sm">
                  {forgotError}
                </p>
              )}
              <p className="mt-4 text-sm text-center text-gray-600">
                Remembered your password?{" "}
                <span
                  onClick={() => setView("login")}
                  className="text-blue-600 cursor-pointer hover:underline font-medium"
                >
                  Back to Login
                </span>
              </p>
            </>
          )}
        </div>

        {/* Right side: Illustration */}
        <div className="bg-gradient-to-br from-blue-50 via-cyan-100 to-white p-10 flex flex-col justify-center items-center text-center">
          <img
            src={sampleImage}
            alt="Illustration"
            className="w-3/4 max-w-sm mb-6"
          />
          <h2 className="text-2xl font-bold text-blue-800 mb-2">
            Welcome to the DevLupa digital platform
          </h2>
          <p className="text-blue-700 max-w-xs">
            Learn new skills, challenge yourself, and grow with DevLupa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;