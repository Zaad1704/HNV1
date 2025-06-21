import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import './services/i18n.js';

// --- Layout & Route Components ---
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// --- Page Components ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OverviewPage from './pages/OverviewPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import ExpensesPage from './pages/ExpensesPage';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage';
import UsersPage from './pages/UsersPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import AuditLogPage from './pages/AuditLogPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPlansPage from './pages/AdminPlansPage';
import AdminBillingPage from './pages/AdminBillingPage';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage';
import NotFound from './pages/NotFound';
// ... other page imports

const FullScreenLoader = () => <div className="h-screen w-full flex items-center justify-center bg-brand-bg"><p>Loading Platform...</p></div>;

function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);

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

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            {/* ... other public routes */}
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="maintenance" element={<MaintenanceRequestsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="organizations" element={<AdminOrganizationsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="billing" element={<AdminBillingPage />} />
                <Route path="site-editor" element={<SiteEditorPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Suspense>
  );
}

export default App;
