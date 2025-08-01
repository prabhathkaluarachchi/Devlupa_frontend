import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import lockImage from '../../assets/auth-illustration.png'; // Optional placeholder image

const Unauthorized: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 px-4 py-10">
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
      {/* Left side - message */}
      <div className="p-10 sm:p-12 flex flex-col justify-center text-center">
        <img src={logo} alt="DevLupa Logo" className="w-24 mb-6 mx-auto" />
        <h1 className="text-4xl font-extrabold text-[#4F46E5] mb-4">🚫 Access Denied</h1>
        <p className="text-[#1F2937] mb-8 text-lg">
          You do not have permission to view this page.
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Go to Login
        </Link>
      </div>

      {/* Right side - optional image */}
      <div className="bg-gradient-to-br from-blue-50 via-cyan-100 to-white p-10 flex items-center justify-center">
        <img
          src={lockImage}
          alt="Unauthorized Access"
          className="w-3/4 max-w-sm"
        />
      </div>
    </div>
  </div>
);

export default Unauthorized;