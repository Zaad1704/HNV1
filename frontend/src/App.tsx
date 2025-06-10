import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Import the page and layout components with the .tsx extension
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage.tsx';
import PropertiesPage from './pages/PropertiesPage.tsx';
import TenantsPage from './pages/TenantsPage.tsx';
import PaymentsPage from './pages/PaymentsPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import AuditLogPage from './pages/AuditLogPage.tsx';

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

// --- Protected Route Component ---
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Dashboard Routes --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="site-editor" element={<SiteEditorPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>

        {/* Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
