import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes.
  // In App.tsx, this will be the DashboardLayout.
  return <Outlet />;
};

export default ProtectedRoute;
