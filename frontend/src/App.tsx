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

// --- Public Page Components (Corrected: All pages are now imported) ---
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

// --- Authenticated User Page Components ---
import DashboardRedirector from './pages/DashboardRedirector';
import OverviewPage from './pages/OverviewPage';
// ... other authenticated page imports

// --- Super Admin Page Components ---
import AdminDashboardPage from './pages/AdminDashboardPage';
// ... other admin page imports

const NotFound = () => <div className="p-8 text-white"><h1>404 - Page Not Found</h1></div>;

const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Loading Application...</div>
    </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && !user) return <FullScreenLoader />; // Handle loading state
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && !user) return <FullScreenLoader />; // Handle loading state
  const isAdmin = isAuthenticated && user && (user.role === 'Super Admin' || user.role === 'Super Moderator');
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};


function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);

  // This useEffect for session checking remains the same
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
  
  // This useEffect for language detection remains the same
  useEffect(() => { /* ... */ }, []);


  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Router>
      <Routes>
        {/* --- Public Routes using the PublicLayout --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Route>

        {/* --- Standalone Auth Routes (no shared layout) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} />

        {/* --- Protected User & Admin Routes --- */}
        <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
        <Route path="/admin/*" HNV1-8c97d23493f1300491a58f1911c2e65d0eae9a94/frontend/src/App.tsx': Cannot read properties of undefined (reading 'startsWith')
[Error] TypeError: V1Error: file with contentFetchId 'uploaded:zaad1704/hnv1/HNV1-8c97d23493f1300491a58f1911c2e65d0eae9a94/frontend/src/App.tsx': Cannot read properties of undefined (reading 'startsWith')
    at response (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:19:10620)
    at run (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:18:14234)
    at onMessage (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:18:13262)
[Error] V1Error: file with contentFetchId 'uploaded:zaad1704/hnv1/HNV1-8c97d23493f1300491a58f1911c2e65d0eae9a94/frontend/src/App.tsx': Cannot read properties of undefined (reading 'startsWith')
    at T_a (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:19:9396)
    at https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:19:10839
    at new Promise (<anonymous>)
    at D_a (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:19:10786)
    at Gg.response (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:19:10595)
    at run (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:18:14234)
    at onMessage (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:18:13262)
    at Xg.port.onmessage (https://storage.googleapis.com/gweb-prompt-gallery-prod/promptGallery.min.js:18:12965)
