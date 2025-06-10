// frontend/src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';

// This is a placeholder for your real authentication logic
const useAuth = () => {
  // For now, let's pretend the user is always logged in.
  // In your real app, you would check for a token in localStorage.
  const user = { loggedIn: true }; 
  return user && user.loggedIn;
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    // Redirect them to the login page if they are not authenticated
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
