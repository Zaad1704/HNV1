// frontend/src/App.tsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import i18n from './services/i18n';

// --- Layout Components ---
import PublicLayout from './components/layout/PublicLayout'; // NEW
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// --- Public Page Components ---
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage'; // NEW
import AboutPage from './pages/AboutPage'; // NEW
import ContactPage from './pages/ContactPage'; // NEW
import LoginPage from './pages/LoginPage';
// ... other public page imports

const NotFound = () => <div className="p-8 text-white"><h1>404 - Page Not Found</h1></div>;

// ... (FullScreenLoader, ProtectedRoute, AdminRoute components remain the same)

function App() {
  // ... (all the existing useEffect logic remains the same)

  return (
    <Router>
      <Routes>
        {/* --- Public Routes using the new Layout --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          {/* You can add a pricing page route here if you create one */}
          {/* <Route path="/pricing" element={<PricingPage />} /> */}
        </Route>

        {/* --- Standalone Auth Routes (no shared layout) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} />

        {/* --- Protected User & Admin Routes --- */}
        <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
        <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>} />
        
        {/* --- Fallback Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
