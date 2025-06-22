import React from 'react';
import { Navigate } from 'react-router-dom';

interface User {
  role: string;
}

const AdminDashboard: React.FC = () => {
  const userString = localStorage.getItem('user');

  if (!userString) return <Navigate to="/login" replace />;

  let user: User;
  try {
    user = JSON.parse(userString);
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Welcome Admin 👨‍💼</h2>
      {/* Admin Features */}
    </div>
  );
};

export default AdminDashboard;



