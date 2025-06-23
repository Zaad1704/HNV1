// frontend/src/App.tsx

import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// Layouts and Guards
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const GoogleAuthCallback = React.lazy(() => import('./pages/GoogleAuthCallback'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
// FIX: Import the DashboardRedirector
const DashboardRedirector = React.lazy(() => import('./pages/DashboardRedirector'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage')); // Or OverviewPage
const TenantDashboardPage = React.lazy(() => import('./pages/TenantDashboardPage'));


const FullScreenLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <p>Loading...</p>
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
  }, []); // The dependency array remains empty to prevent race conditions

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="auth/google/callback" element={<GoogleAuthCallback />} />
        </Route>
        
        {/* FIX: Reworked Dashboard Routing */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* The index route now uses the redirector to send users to the correct page */}
            <Route index element={<DashboardRedirector />} />
            
            {/* Define the actual dashboard pages here */}
            <Route path="overview" element={<DashboardPage />} />
            <Route path="tenant" element={<TenantDashboardPage />} />
            
            {/* You would continue to define all other dashboard routes here */}
            {/* e.g., <Route path="properties" element={<PropertiesPage />} /> */}
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
