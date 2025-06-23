import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// Layouts and Route Guards
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Page Components
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
// ... (all your other lazy-loaded page imports) ...
const NotFound = React.lazy(() => import('./pages/NotFound'));


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
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        {/* ... Other routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
