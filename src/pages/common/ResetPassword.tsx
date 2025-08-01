import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import logo from "../../assets/logo.png";
import sampleImage from "../../assets/auth-illustration.png"; // Optional: reuse the image from auth page

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`/auth/reset-password/${token}`, { newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left section - form */}
        <div className="p-10 sm:p-12 flex flex-col justify-center">
          <img src={logo} alt="DevLupa Logo" className="w-24 mb-6 mx-auto" />
          <h2 className="text-3xl font-bold mb-6 text-center text-[#4F46E5]">
            Reset Your Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-[#1F2937]">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full p-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              placeholder="Enter your new password"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md hover:opacity-90 transition"
            >
              Reset Password
            </button>
          </form>

          {message && (
            <p className="mt-4 text-green-600 text-center font-medium">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
          )}
        </div>

        {/* Right section - optional illustration */}
        <div className="bg-gradient-to-br from-blue-50 via-cyan-100 to-white p-10 flex flex-col justify-center items-center text-center">
          <img
            src={sampleImage}
            alt="Secure Reset"
            className="w-3/4 max-w-sm mb-6"
          />
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Secure Reset</h2>
          <p className="text-blue-700 max-w-xs">
            Create a new password to continue your learning journey with DevLupa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
