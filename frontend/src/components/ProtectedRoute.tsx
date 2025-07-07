import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;