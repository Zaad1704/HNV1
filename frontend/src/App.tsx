import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// --- Import All Page Components From Your Repository ---
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import AcceptInvitePage from './pages/AcceptInvitePage.tsx';

// Authenticated User Pages
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import OrganizationPage from './pages/OrganizationPage.tsx';
import UsersPage from './pages/UsersPage.tsx';
import InviteUsersPage from './pages/InviteUsersPage.tsx';
import BillingPage from './pages/BillingPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import PropertiesPage from './pages/PropertiesPage.tsx';
import TenantsPage from './pages/TenantsPage.tsx';
import AuditLogPage from './pages/AuditLogPage.tsx';


// Super Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import AdminUsersPage from './pages/AdminUsersPage.tsx';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage.tsx';
import AdminBillingPage from './pages/AdminBillingPage.tsx';
import AdminContentPage from './pages/AdminContentPage.tsx';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage.tsx';
import AdminPlansPage from './pages/AdminPlansPage.tsx'; // The new page for managing plans

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

// --- Route Protection Components ---
const ProtectedRoute = () => {
  // In a real app, this would be more robust, checking token validity
  const isAuthenticated = useAuthStore((state) => !!state.user); 
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: !!state.user,
    user: state.user,
  }));
  const isAdmin = isAuthenticated && user?.role === 'Super Admin';
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

        {/* --- Protected User Routes --- */}
        {/* All routes inside here will use the DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="settings" element={<ProfilePage />} /> 
             {/* You might want to move other user pages inside this layout too */}
          </Route>
          {/* Standalone pages that still require login but might not need the full sidebar */}
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/invite" element={<InviteUsersPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        

        {/* --- Protected Super Admin Routes --- */}
        <Route path="/admin" element={<AdminRoute />}>
          {/* A developer could create a separate AdminLayout component here */}
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="organizations" element={<AdminOrganizationsPage />} />
          <Route path="billing" element={<AdminBillingPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="site-editor" element={<SiteEditorPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
        </Route>

        {/* Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
