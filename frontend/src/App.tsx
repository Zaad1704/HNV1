// frontend/src/App.tsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
// ... other page imports

const NotFound = () => <div className="p-8 text-white"><h1>404 - Page Not Found</h1></div>;

// Helper components like FullScreenLoader, ProtectedRoute, AdminRoute remain the same

function App() {
  // All existing logic for session and language check remains the same

  return (
    <Router>
      <Routes>
        {/* --- Public Routes using the PublicLayout --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          {/* The other public pages now live as sections inside LandingPage */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Route>

        {/* --- Standalone Auth Routes (no shared layout) --- */}
        <Route path="/login" element={<LoginPage />} />
        {/* ... other auth routes ... */}
        
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
