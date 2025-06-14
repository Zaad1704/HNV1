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
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
// ... import other pages as needed

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'Super Admin';
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  const { token, user, setUser, logout } = useAuthStore();

  // This effect runs on app load to get user data if a token exists in localStorage
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="settings" element={<ProfilePage />} />
          </Route>
        </Route>
        
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          {/* ... other admin routes */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
