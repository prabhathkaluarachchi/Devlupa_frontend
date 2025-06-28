import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] px-4">
    <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md text-center">
      <h1 className="text-4xl font-extrabold text-[#4F46E5] mb-4">🚫 Access Denied</h1>
      <p className="text-gray-700 mb-8 text-lg">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="inline-block bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-6 py-3 rounded-2xl transition"
      >
        Go to Login
      </Link>
    </div>
  </div>
);

export default Unauthorized;
