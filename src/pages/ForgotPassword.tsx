import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Email address</label>
          <input
            type="email"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Send Reset Link
          </button>
        </form>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        <button
          onClick={() => navigate("/login")}
          className="mt-6 text-blue-600 hover:underline text-sm"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
