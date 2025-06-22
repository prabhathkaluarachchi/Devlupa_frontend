// src/routes/AdminRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode; // Accept any React children
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>; // Wrap children in fragment
};

export default AdminRoute;

