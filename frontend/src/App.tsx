import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import { LangProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './services/i18n.js';

// --- Layouts and Route Guards ---
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DashboardRedirector from './pages/DashboardRedirector';

// --- Page Components (Lazy Loaded for performance) ---
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const GoogleAuthCallback = React.lazy(() => import('./pages/GoogleAuthCallback'));
const OverviewPage = React.lazy(() => import('./pages/OverviewPage'));
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage'));
const TenantsPage = React.lazy(() => import('./pages/TenantsPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
// (Add other lazy-loaded pages here as needed)


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
      // If a token exists in storage, but we don't have the user details yet, fetch them.
      if (token && !user) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data); // Set the user in our state
        } catch (error) {
          console.error("Session check failed, logging out.", error);
          logout(); // The token is invalid, so log out completely.
        }
      }
      // We are done with the initial check.
      setSessionLoading(false);
    };

    checkUserSession();
  }, [token]); // This effect runs only when the token changes.

  // While checking the session, show a loader to prevent rendering the wrong routes.
  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  // Now that the session is verified, render the main application router.
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <ThemeProvider>
          <LangProvider>
            <Router>
              <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
                  {/* Other public pages like /about, /contact go here */}
                </Route>

                {/* --- Authentication Routes --- */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                {/* Other auth pages go here */}
                
                {/* --- Protected User Dashboard --- */}
                <Route path="/dashboard" element={<ProtectedRoute />}>
                  <Route path="*" element={<DashboardLayout />} />
                </Route>
                
                {/* --- Protected Admin Dashboard --- */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route path="*" element={<AdminLayout />} />
                </Route>

                {/* --- Not Found Fallback --- */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </LangProvider>
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
