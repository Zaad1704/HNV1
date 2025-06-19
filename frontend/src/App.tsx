// frontend/src/App.tsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import i18n from './services/i18n';

// --- Layout Components ---
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// --- Page Imports ---
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AcceptAgentInvitePage from './pages/AcceptAgentInvitePage';
import AcceptInvitePage from './pages/AcceptInvitePage';

// --- Authenticated User Page Components ---
import DashboardRedirector from './pages/DashboardRedirector';
import OverviewPage from './pages/OverviewPage';
import TenantDashboardPage from './pages/TenantDashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import ExpensesPage from './pages/ExpensesPage';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage';
import UsersPage from './pages/UsersPage';
import BillingPage from './pages/BillingPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';

// --- Super Admin Page Components ---
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminModeratorsPage from './pages/SuperAdmin/AdminModeratorsPage';
import AdminBillingPage from './pages/AdminBillingPage';
import AdminPlansPage from './pages/AdminPlansPage';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage';
import AdminProfilePage from './pages/SuperAdmin/AdminProfilePage';

const NotFound = () => <div className="p-8 text-white"><h1>404 - Page Not Found</h1></div>;

const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Loading Application...</div>
    </div>
);

const ProtectedRoute = () => {
    const { isAuthenticated, user } = useAuthStore();
    if (isAuthenticated && !user) return <FullScreenLoader />;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
    const { isAuthenticated, user } = useAuthStore();
    if (isAuthenticated && !user) return <FullScreenLoader />;
    const isAdmin = isAuthenticated && user && (user.role === 'Super Admin' || user.role === 'Super Moderator');
    return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      if (token && !user) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error("Session token is invalid or expired. Logging out.", error);
          logout();
        }
      }
      setSessionLoading(false);
    };
    checkUserSession();
  }, [token, user, setUser, logout]);

  useEffect(() => {
    // Language detection logic can remain here
  }, []);

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Route>

        {/* --- Auth Routes (no layout) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
        
        {/* --- Protected User Dashboard --- */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardRedirector />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="tenant" element={<TenantDashboardPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="maintenance" element={<MaintenanceRequestsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        {/* --- Protected Super Admin Routes --- */}
        {/* THIS IS THE CORRECTED LINE */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="organizations" element={<AdminOrganizationsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="moderators" element={<AdminModeratorsPage />} />
            <Route path="billing" element={<AdminBillingPage />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="site-editor" element={<SiteEditorPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        {/* --- Fallback Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
