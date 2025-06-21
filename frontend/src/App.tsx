import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import './services/i18n.js';

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
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // FIX: Add
import ResetPasswordPage from './pages/ResetPasswordPage'; // FIX: Add
import PaymentSuccessPage from './pages/PaymentSuccessPage'; // FIX: Add
import PaymentCancelPage from './pages/PaymentCancelPage'; // FIX: Add
import PaymentSummaryPage from './pages/PaymentSummaryPage'; // FIX: Add (if public access is needed for summary before login)
import GoogleAuthCallback from './pages/GoogleAuthCallback'; // FIX: Add GoogleAuthCallback
import AcceptInvitePage from './pages/AcceptInvitePage'; // FIX: Add AcceptInvitePage
import AcceptAgentInvitePage from './pages/AcceptAgentInvitePage'; // FIX: Add AcceptAgentInvitePage
import TermsPage from './pages/TermsPage'; // FIX: Add TermsPage
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'; // FIX: Add PrivacyPolicyPage
import AboutPage from './pages/AboutPage'; // FIX: Add AboutPage (as standalone page if not just section of landing)
import ContactPage from './pages/ContactPage'; // FIX: Add ContactPage (as standalone page if not just section of landing)
import FeaturesPage from './pages/FeaturesPage'; // FIX: Add FeaturesPage (as standalone page if not just section of landing)

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
import OrganizationPage from './pages/OrganizationPage'; // FIX: Add OrganizationPage if used
import TenantDashboardPage from './pages/TenantDashboardPage'; // FIX: Add TenantDashboardPage

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPlansPage from './pages/AdminPlansPage';
import AdminBillingPage from './pages/AdminBillingPage';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage';
import AdminMaintenancePage from './pages/AdminMaintenancePage'; // FIX: Add
import AdminDataManagementPage from './pages/AdminDataManagementPage'; // FIX: Add
import AdminModeratorsPage from './pages/SuperAdmin/AdminModeratorsPage'; // FIX: Add

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
          console.error("Session token is invalid or expired. Logging out.", error);
          logout();
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
          {/* Public Routes - Rendered with PublicLayout (Navbar, Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} /> {/* FIX: Add */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} /> {/* FIX: Add */}
            <Route path="/about" element={<AboutPage />} /> {/* FIX: Add as standalone page */}
            <Route path="/features" element={<FeaturesPage />} /> {/* FIX: Add as standalone page */}
            <Route path="/contact" element={<ContactPage />} /> {/* FIX: Add as standalone page */}
            
            {/* Payment related public pages */}
            <Route path="/payment-summary/:planId" element={<PaymentSummaryPage />} /> {/* FIX: Add */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} /> {/* FIX: Add */}
            <Route path="/payment-cancel" element={<PaymentCancelPage />} /> {/* FIX: Add */}
          </Route>

          {/* Authentication Routes (No Layout or minimal layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* FIX: Add */}
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* FIX: Add */}
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} /> {/* FIX: Add Google Callback */}
          <Route path="/accept-invite/:token" element={<AcceptInvitePage />} /> {/* FIX: Add User Invite */}
          <Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} /> {/* FIX: Add Agent Invite */}

          {/* Protected Routes - Rendered with DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Main dashboard overview, default to OverviewPage as per typical setup */}
              <Route index element={<OverviewPage />} /> 
              <Route path="overview" element={<OverviewPage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="maintenance" element={<MaintenanceRequestsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="organization" element={<OrganizationPage />} /> {/* FIX: Add Organization page */}
              {/* Specific tenant dashboard route */}
              <Route path="tenant" element={<TenantDashboardPage />} /> {/* FIX: Add Tenant Dashboard */}
            </Route>
          </Route>
        
          {/* Admin Protected Routes - Rendered with AdminLayout */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="organizations" element={<AdminOrganizationsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="moderators" element={<AdminModeratorsPage />} /> {/* FIX: Add Moderators page */}
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="billing" element={<AdminBillingPage />} />
                <Route path="site-editor" element={<SiteEditorPage />} />
                <Route path="maintenance" element={<AdminMaintenancePage />} /> {/* FIX: Add */}
                <Route path="data-management" element={<AdminDataManagementPage />} /> {/* FIX: Add */}
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
