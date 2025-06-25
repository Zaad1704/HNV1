// frontend/src/App.tsx
import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

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
const PaymentSummaryPage = React.lazy(() => import('./pages/PaymentSummaryPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage'));
const TenantsPage = React.lazy(() => import('./pages/TenantsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
// ... other dashboard pages

const FullScreenLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-light-bg dark:bg-dark-bg"><p className="text-dark-text dark:text-dark-text-dark">Loading Application...</p></div>
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
        </Route>
        
        {/* Authenticated Routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Add other dashboard routes here */}
          </Route>
        </Route>

        {/* Admin Routes would go here */}
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
