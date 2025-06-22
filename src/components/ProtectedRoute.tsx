import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: 'admin' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user || !user.role) {
    // Not logged in or invalid user object
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    // Role mismatch
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
