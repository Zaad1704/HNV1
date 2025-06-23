import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// --- Providers and Global Styles ---
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

// --- Page Components (Lazy Loaded for performance) ---
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const GoogleAuthCallback = React.lazy(() => import('./pages/GoogleAuthCallback'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const DashboardRedirector = React.lazy(() => import('./pages/DashboardRedirector'));
const OverviewPage = React.lazy(() => import('./pages/OverviewPage'));
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailsPage = React.lazy(() => import('./pages/PropertyDetailsPage'));
const TenantsPage = React.lazy(() => import('./pages/TenantsPage'));
const TenantProfilePage = React.lazy(() => import('./pages/TenantProfilePage'));
const ExpensesPage = React.lazy(() => import('./pages/ExpensesPage'));
const MaintenanceRequestsPage = React.lazy(() => import('./pages/MaintenanceRequestsPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const BillingPage = React.lazy(() => import('./pages/BillingPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AuditLogPage = React.lazy(() => import('./pages/AuditLogPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const AdminOrganizationsPage = React.lazy(() => import('./pages/AdminOrganizationsPage'));
// (Add any other lazy-loaded pages here)


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
          console.error("Session check failed. Logging out.", error);
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
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <ThemeProvider>
          <LangProvider>
            <Router>
              <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
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
                  <Route path="properties/:propertyId" element={<PropertyDetailsPage />} />
                  <Route path="tenants" element={<TenantsPage />} />
                  <Route path="tenants/:tenantId/profile" element={<TenantProfilePage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="maintenance" element={<MaintenanceRequestsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="billing" element={<BillingPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="audit-log" element={<AuditLogPage />} />
                </Route>
                
                {/* --- Protected Admin Routes --- */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="organizations" element={<AdminOrganizationsPage />} />
                    {/* Add other admin routes here */}
                </Route>

                {/* --- Fallback Route --- */}
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
