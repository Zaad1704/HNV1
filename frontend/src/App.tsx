import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Subdomain detection utility
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0]; // Returns 'login' from 'login.hnvpm.com'
  }
  return null;
};
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';
import LoadingSpinner from './components/common/LoadingSpinner';
import PWAInstallPrompt from './components/PWAInstallPromptSimple';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import { registerServiceWorker } from './utils/pwaUtils';
import HelpCenter from './components/common/HelpCenter';
import HelpWidget from './components/common/HelpWidget';
import QuickAccessWidget from './components/common/QuickAccessWidgetSimple';
import EnhancedFeedbackWidget from './components/common/EnhancedFeedbackWidget';
import SkipLink from './components/common/SkipLink';

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
const GoogleCallbackPage = React.lazy(() => import('./pages/GoogleCallbackPage'));
const GoogleDebugPage = React.lazy(() => import('./pages/GoogleDebugPage'));
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
const AdminSettingsPage = React.lazy(() => import('./pages/SuperAdmin/AdminSettingsPage'));

const FullScreenLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-app-bg">
        <LoadingSpinner size="lg" text="Loading Application..." />
    </div>
);

function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);
  const subdomain = getSubdomain();
  
  // Register service worker for PWA
  useEffect(() => {
    registerServiceWorker();
  }, []);
  


  useEffect(() => {
    setSessionLoading(false);
  }, []);

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  // Subdomain routing removed - causing crashes

  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <ToastProvider>
        <ErrorBoundary>
        <SkipLink />
        <OfflineIndicator />
        <PWAInstallPrompt />
        <HelpCenter />
        <HelpWidget />
        <QuickAccessWidget />
        <EnhancedFeedbackWidget />
        <Suspense fallback={<FullScreenLoader />}>
        <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
        </Route>
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="organizations" element={<AdminOrganizationsPage />} />
          <Route path="moderators" element={<AdminModeratorsPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="billing" element={<AdminBillingPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        
        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}

export default App;
