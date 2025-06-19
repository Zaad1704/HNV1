// frontend/src/App.tsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import i18n from './services/i18n';

// --- Layout Components ---
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// --- Public Page Components ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AcceptAgentInvitePage from './pages/AcceptAgentInvitePage';

// --- Authenticated User Page Components ---
import DashboardRedirector from './pages/DashboardRedirector';
import OverviewPage from './pages/OverviewPage';
import TenantDashboardPage from './pages/TenantDashboardPage';
import OrganizationPage from './pages/OrganizationPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import UsersPage from './pages/UsersPage';
import BillingPage from './pages/BillingPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage';
import ExpensesPage from './pages/ExpensesPage'; 

// --- Super Admin Page Components ---
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminBillingPage from './pages/AdminBillingPage';
import AdminPlansPage from './pages/AdminPlansPage';
import AdminProfilePage from './pages/SuperAdmin/AdminProfilePage';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage';
import AdminModeratorsPage from './pages/SuperAdmin/AdminModeratorsPage';

const NotFound = () => <div className="p-8 text-white"><h1>404 - Page Not Found</h1></div>;

const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Loading Application...</div>
    </div>
);

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Corrected: Make AdminRoute aware of the loading state
const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // While authenticated and waiting for user data, show a loader
  if (isAuthenticated && !user) {
    return <FullScreenLoader />;
  }

  const isAdmin = isAuthenticated && user && (user.role === 'Super Admin' || user.role === 'Super Moderator');
  
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      // Only check if a token exists and we don't have a user object yet
      if (token && !user) {
        try {
          const response = await apiClient.get('/auth/me');
          // Corrected: The user object is nested under the 'user' key
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
    const detectLanguage = async () => {
      try {
        const response = await apiClient.get('/localization/detect');
        const detectedLang = response.data.lang; // e.g., 'bn', 'es'
        if (detectedLang && i18n.options.supportedLngs && i18n.options.supportedLngs.includes(detectedLang)) {
            // Check if language has already been set by user to avoid overriding
            const userLang = localStorage.getItem('i18nextLng');
            if (!userLang || userLang === detectedLang) {
                 i18n.changeLanguage(detectedLang);
            }
        }
      } catch (error) {
        console.error("IP-based language detection failed, falling back to default.", error);
      }
    };
    detectLanguage();
  }, []);

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
        <Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} />

        {/* --- Protected User Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardRedirector />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="tenant" element={<TenantDashboardPage />} />
            <Route path="organization" element={<OrganizationPage />} />
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
