// frontend/src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// A simple loading component for the loading state
const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Loading...</div>
    </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  // This handles the brief moment after login or on page refresh
  // where we are authenticated but haven't fetched the user object yet.
  if (isAuthenticated && !user) {
    return <FullScreenLoader />;
  }

  // If authenticated and user is loaded, show the nested content (e.g., the dashboard).
  // Otherwise, redirect to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
