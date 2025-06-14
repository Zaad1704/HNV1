import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// --- Import All Page Components ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage'; // For user settings
import OrganizationPage from './pages/OrganizationPage';
import UsersPage from './pages/UsersPage';
import BillingPage from './pages/BillingPage';

// ... other imports for admin pages ...
import AdminDashboardPage from './pages/AdminDashboardPage';


const NotFound = () => <div className="p-8 text-white"><h1>404 - Page Not Found</h1></div>;

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => { /* ... remains the same ... */ };

function App() {
  const { token, user, setUser, logout } = useAuthStore();

  useEffect(() => {
    const checkUserSession = async () => {
      if (token && !user) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          console.error("Session token is invalid or expired. Logging out.");
          logout();
        }
      }
    };
    checkUserSession();
  }, [token, user, setUser, logout]);

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

        {/* --- FIX: Consolidated All Protected User Routes Under DashboardLayout --- */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="organization" element={<OrganizationPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="settings" element={<SettingsPage />} /> 
          </Route>
        </Route>
        
        {/* --- Protected Super Admin Routes --- */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          {/* ... other admin routes ... */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
