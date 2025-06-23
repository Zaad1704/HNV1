import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import './services/i18n.js';
import { LangProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// --- Layout & Route Components ---
import PublicLayout from './components/layout/PublicLayout'; // FIX: Added the missing import for PublicLayout
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DashboardRedirector from './pages/DashboardRedirector';

// --- Page Components (Lazy Loaded) ---
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const GoogleAuthCallback = React.lazy(() => import('./pages/GoogleAuthCallback'));
const AcceptAgentInvitePage = React.lazy(() => import('./pages/AcceptAgentInvitePage'));
const OverviewPage = React.lazy(() => import('./pages/OverviewPage'));
// ... (add other lazy-loaded pages here if desired)
const NotFound = React.lazy(() => import('./pages/NotFound'));


const FullScreenLoader = () => <div className="h-screen w-full flex items-center justify-center bg-brand-bg text-dark-text"><p>Loading...</p></div>;

// This component handles the logic after a token is set.
function AuthSessionManager() {
    const { user, token, setUser, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyUserSession = async () => {
            if (token && !user) {
                try {
                    const response = await apiClient.get('/auth/me');
                    if (response.data.data) {
                        setUser(response.data.data);
                    } else {
                       throw new Error("No user data in response");
                    }
                } catch (error) {
                    console.error("Session verification failed, logging out.", error);
                    logout(); 
                }
            }
        };
        verifyUserSession();
    }, [token, user, setUser, logout, navigate]);

    return null; // This component does not render anything.
}


function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <ThemeProvider>
          <LangProvider>
            <Router>
              <AuthSessionManager />
              <Routes>
                {/* Public routes wrapped in PublicLayout */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
                  {/* Add other public-facing static pages here */}
                </Route>

                {/* Standalone Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                <Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<ProtectedRoute />}>
                  <Route path="*" element={<DashboardLayout />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                   <Route path="*" element={<AdminLayout />} />
                </Route>
                
                {/* Fallback Route */}
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
