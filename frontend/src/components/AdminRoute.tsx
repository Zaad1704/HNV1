import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminLayout from './layout/AdminLayout';

// Lazy load admin pages
const AdminDashboardPage = React.lazy(() => import('../pages/AdminDashboardPage'));
const AdminOrganizationsPage = React.lazy(() => import('../pages/AdminOrganizationsPage'));
const AdminUsersPage = React.lazy(() => import('../pages/AdminUsersPage'));
const AdminModeratorsPage = React.lazy(() => import('../pages/SuperAdmin/AdminModeratorsPage'));
const AdminPlansPage = React.lazy(() => import('../pages/AdminPlansPage'));
const SiteEditorPage = React.lazy(() => import('../pages/SuperAdmin/SiteEditorPage'));
const AdminBillingPage = React.lazy(() => import('../pages/AdminBillingPage'));
const AdminMaintenancePage = React.lazy(() => import('../pages/AdminMaintenancePage'));
const AdminDataManagementPage = React.lazy(() => import('../pages/AdminDataManagementPage'));
const AdminProfilePage = React.lazy(() => import('../pages/SuperAdmin/AdminProfilePage'));
const AdminSettingsPage = React.lazy(() => import('../pages/SuperAdmin/AdminSettingsPage'));

const AdminRoute: React.FC = () => {
  const { token, user } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!['Super Admin', 'Super Moderator'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="organizations" element={<AdminOrganizationsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="moderators" element={<AdminModeratorsPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="site-editor" element={<SiteEditorPage />} />
        <Route path="billing" element={<AdminBillingPage />} />
        <Route path="maintenance" element={<AdminMaintenancePage />} />
        <Route path="data-management" element={<AdminDataManagementPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<AdminDashboardPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoute;