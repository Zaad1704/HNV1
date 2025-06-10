import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// --- Import All Page Components From Your Repository ---
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import AcceptInvitePage from './pages/AcceptInvitePage.tsx';

// Authenticated User Pages
import DashboardPage from './pages/DashboardPage.tsx';
import OrganizationPage from './pages/OrganizationPage.tsx';
import UsersPage from './pages/UsersPage.tsx';
import InviteUsersPage from './pages/InviteUsersPage.tsx';
import BillingPage from './pages/BillingPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';

// Super Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import AdminUsersPage from './pages/AdminUsersPage.tsx';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage.tsx';
import AdminBillingPage from './pages/AdminBillingPage.tsx';
import AdminContentPage from './pages/AdminContentPage.tsx';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage.tsx';

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

// --- Route Protection Components ---
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
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
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/invite" element={<InviteUsersPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* --- Protected Super Admin Routes --- */}
        <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="organizations" element={<AdminOrganizationsPage />} />
            <Route path="billing" element={<AdminBillingPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="site-editor" element={<SiteEditorPage />} />
        </Route>

        {/* Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
