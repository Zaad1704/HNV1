// frontend/src/pages/DashboardRedirector.tsx

import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Loading Your Dashboard...</div>
    </div>
);

const DashboardRedirector = () => {
  const { user, isAuthenticated } = useAuthStore();

  // If we are authenticated but the user object is not yet loaded,
  // it means the /api/auth/me call is in progress. Show a loading screen.
  if (isAuthenticated && !user) {
    return <FullScreenLoader />;
  }

  // If the check is complete and there is still no user object,
  // then something is wrong, so redirect to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Once the user object is available, perform the role-based redirect.
  switch (user.role) {
    case 'Tenant':
      return <Navigate to="/dashboard/tenant" replace />;
    case 'Super Admin':
    case 'Super Moderator': // Also handle moderators
      // Super Admins should be able to access both dashboards.
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
