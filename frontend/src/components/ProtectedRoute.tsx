import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const FullScreenLoader = () => (
  <div className="flex items-center justify-center h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
    <div className="text-dark-text dark:text-dark-text-dark text-lg">Verifying Permissions...</div>
  </div>
);

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
