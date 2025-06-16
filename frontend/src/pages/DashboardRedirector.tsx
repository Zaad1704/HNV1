import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

const DashboardRedirector = () => {
  const { user } = useAuthStore();

  // This is a fallback, as ProtectedRoute should prevent this.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect user based on their role.
  switch (user.role) {
    case 'Tenant':
      return <Navigate to="/dashboard/tenant" replace />;
    case 'Super Admin':
      // Super Admins might want to land on their user dash or admin dash.
      // Let's send them to their main overview first.
      return <Navigate to="/dashboard/overview" replace />;
    case 'Landlord':
    case 'Agent':
      return <Navigate to="/dashboard/overview" replace />;
    default:
      // Default fallback to the login page if role is unknown.
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirector;
