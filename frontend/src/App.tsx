// frontend/src/App.tsx

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import './services/i18n.js';
import axios from 'axios';

// --- Layout & Route Components ---
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// --- Page Components ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import PaymentSummaryPage from './pages/PaymentSummaryPage';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import AcceptInvitePage from './pages/AcceptInvitePage';
import AcceptAgentInvitePage from './pages/AcceptAgentInvitePage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import ResubscribePage from './pages/ResubscribePage';

// Dashboard Pages
import OverviewPage from './pages/OverviewPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import ExpensesPage from './pages/ExpensesPage';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage';
import UsersPage from './pages/UsersPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import AuditLogPage from './pages/AuditLogPage';
import OrganizationPage from './pages/OrganizationPage';
import TenantDashboardPage from './pages/TenantDashboardPage';
import CashFlowPage from './pages/CashFlowPage'; 
import TenantStatementPage from './pages/TenantStatementPage'; 
// NEW IMPORT for Reminders Page
import RemindersPage from './pages/RemindersPage'; 

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPlansPage from './pages/AdminPlansPage';
import AdminBillingPage from './pages/AdminBillingPage';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage';
import AdminMaintenancePage from './pages/AdminMaintenancePage';
import AdminDataManagementPage from './pages/AdminDataManagementPage';
import AdminModeratorsPage from './pages/SuperAdmin/AdminModeratorsPage';

import NotFound from './pages/NotFound';

const FullScreenLoader = () => <div className="h-screen w-full flex items-center justify-center bg-brand-bg text-dark-text"><p>Loading Platform...</p></div>;

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
          if (axios.isAxiosError(error) && error.response) {
            console.error(`Session check failed with status ${error.response.status}. Interceptor handled logout.`);
          } else {
            console.error("Non-Axios error during session check. Logging out.", error);
            logout();
          }
        }
      }
      setSessionLoading(false);
    };
    checkUserSession();
  }, [token, user, setUser, logout]);

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/payment-summary/:planId" element={<PaymentSummaryPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-cancel" element={<PaymentCancelPage />} />
          </Route>

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
          <Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} />
          <Route path="/resubscribe" element={<ResubscribePage />} />

          {/* Protected Routes - Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} /> 
              <Route path="overview" element={<OverviewPage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="tenants/:tenantId/statement" element={<TenantStatementPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="maintenance" element={<MaintenanceRequestsPage />} />
              <Route path="cashflow" element={<CashFlowPage />} /> 
              <Route path="reminders" element={<RemindersPage />} /> {/* NEW ROUTE */}
              <Route path="users" element={<UsersPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="tenant" element={<TenantDashboardPage />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="organizations" element={<AdminOrganizationsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="moderators" element={<AdminModeratorsPage />} />
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="billing" element={<AdminBillingPage />} />
                <Route path="site-editor" element={<SiteEditorPage />} />
                <Route path="maintenance" element={<AdminMaintenancePage />} />
                <Route path="data-management" element={<AdminDataManagementPage />} />
            </Route>
          </Route>

          {/* Fallback for any unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Suspense>
  );
}

export default App;
