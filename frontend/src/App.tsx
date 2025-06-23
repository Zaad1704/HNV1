import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
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
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage'));
const TenantsPage = React.lazy(() => import('./pages/TenantsPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
// (Add imports for all your other pages here)


const FullScreenLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-brand-bg text-dark-text">
        <p>Loading Platform...</p>
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
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* --- Public Routes --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          {/* Add other public pages like /about, /contact here */}
        </Route>

        {/* --- Authentication Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        
        {/* --- Protected Dashboard Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardRedirector />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            {/* Add all other user-facing dashboard routes here */}
        </Route>
        
        {/* --- Protected Admin Routes --- */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            {/* Add all other admin routes here */}
        </Route>

        {/* --- Fallback Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
