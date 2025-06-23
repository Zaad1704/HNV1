import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// --- Layouts and Route Guards ---
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// --- Page Components (Lazy Loaded for performance) ---
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const GoogleAuthCallback = React.lazy(() => import('./pages/GoogleAuthCallback'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const DashboardRedirector = React.lazy(() => import('./pages/DashboardRedirector'));
const OverviewPage = React.lazy(() => import('./pages/OverviewPage'));
// ... (Add other lazy-loaded pages here as needed)


const FullScreenLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-brand-bg text-dark-text">
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
  }, [token]);

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* --- Authentication Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        
        {/* --- Protected Dashboard Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardRedirector />} />
            <Route path="overview" element={<OverviewPage />} />
            {/* Add all other dashboard routes here */}
          </Route>
        </Route>
        
        {/* --- Protected Admin Routes --- */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
             {/* Add all admin routes here */}
          </Route>
        </Route>

        {/* --- Fallback Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
