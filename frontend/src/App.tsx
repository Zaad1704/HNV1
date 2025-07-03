// frontend/src/App.tsx
import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';
import LoadingSpinner from './components/common/LoadingSpinner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n'; // Initialize i18n
import { CurrencyProvider } from './contexts/CurrencyContext';

import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';

// Lazy load all pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const GoogleAuthCallback = React.lazy(() => import('./pages/GoogleAuthCallback'));
const AcceptAgentInvitePage = React.lazy(() => import('./pages/AcceptAgentInvitePage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const ResubscribePage = React.lazy(() => import('./pages/ResubscribePage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const PlansPage = React.lazy(() => import('./pages/PlansPage'));
const PaymentSummaryPage = React.lazy(() => import('./pages/PaymentSummaryPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));

// Dashboard pages - ensure these are correctly imported and accessible
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const OverviewPage = React.lazy(() => import('./pages/OverviewPage'));
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage'));
const TenantsPage = React.lazy(() => import('./pages/TenantsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const PaymentsPage = React.lazy(() => import('./pages/PaymentsPage'));
const ExpensesPage = React.lazy(() => import('./pages/ExpensesPage'));
const MaintenanceRequestsPage = React.lazy(() => import('./pages/MaintenanceRequestsPage'));
const CashFlowPage = React.lazy(() => import('./pages/CashFlowPage'));
const RemindersPage = React.lazy(() => import('./pages/RemindersPage'));
const ApprovalRequestsPage = React.lazy(() => import('./pages/ApprovalRequestsPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const BillingPage = React.lazy(() => import('./pages/BillingPage'));
const AuditLogPage = React.lazy(() => import('./pages/AuditLogPage'));
const PropertyDetailsPage = React.lazy(() => import('./pages/PropertyDetailsPage'));
const TenantProfilePage = React.lazy(() => import('./pages/TenantProfilePage'));
const TenantDashboardPage = React.lazy(() => import('./pages/TenantDashboardPage'));

// Admin pages
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const AdminOrganizationsPage = React.lazy(() => import('./pages/AdminOrganizationsPage'));
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage'));
const AdminModeratorsPage = React.lazy(() => import('./pages/SuperAdmin/AdminModeratorsPage'));
const AdminPlansPage = React.lazy(() => import('./pages/AdminPlansPage'));
const SiteEditorPage = React.lazy(() => import('./pages/SuperAdmin/SiteEditorPage'));
const AdminBillingPage = React.lazy(() => import('./pages/AdminBillingPage'));
const AdminMaintenancePage = React.lazy(() => import('./pages/AdminMaintenancePage'));
const AdminDataManagementPage = React.lazy(() => import('./pages/AdminDataManagementPage'));
const AdminProfilePage = React.lazy(() => import('./pages/SuperAdmin/AdminProfilePage')); // SuperAdmin profile page

const FullScreenLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-app-bg">
        <LoadingSpinner size="lg" text="Loading Application..." />
    </div>
);

function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      if (token && !user) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          console.error("Session check failed, logging out.", error);
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
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <ErrorBoundary>
          <OfflineIndicator />
          <PWAInstallPrompt />
          <Suspense fallback={<FullScreenLoader />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="accept-agent-invite/:token" element={<AcceptAgentInvitePage />} />
          <Route path="auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="payment-summary/:planId" element={<PaymentSummaryPage />} />
          <Route path="verify-email/:token" element={<VerifyEmailPage />} />
          {/* Tenant Public Portal routes */}
          {/* <Route path="tenant-portal/:token" element={<TenantPublicPortalPage />} /> */}
        </Route>
        
        {/* Authenticated Routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* General User Dashboards */}
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<TenantProfilePage />} /> {/* Assuming a generic profile page */}

            {/* Landlord/Agent Specific Routes */}
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/:propertyId" element={<PropertyDetailsPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="tenants/:tenantId/profile" element={<TenantProfilePage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="maintenance" element={<MaintenanceRequestsPage />} />
            <Route path="cashflow" element={<CashFlowPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="approvals" element={<ApprovalRequestsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="resubscribe" element={<PlansPage />} />
            
            {/* Tenant Specific Dashboard */}
            <Route path="tenant" element={<TenantDashboardPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
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
            <Route path="profile" element={<AdminProfilePage />} /> {/* Admin's own profile page */}
          </Route>
        </Route>
        
        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
