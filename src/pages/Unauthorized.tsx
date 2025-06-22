import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
    <p className="mb-4">You do not have permission to view this page.</p>
    <Link to="/" className="text-blue-600 underline">
      Go to Login
    </Link>
  </div>
);

export default Unauthorized;
