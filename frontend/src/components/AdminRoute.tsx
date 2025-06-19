// frontend/src/components/AdminRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Verifying Permissions...</div>
    </div>
);

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && !user) {
    return <FullScreenLoader />;
  }

  const isAdmin = isAuthenticated && user && (user.role === 'Super Admin' || user.role === 'Super Moderator');

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
