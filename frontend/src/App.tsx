import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';

// --- Import All Page Components ---
// Public Pages
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';

// Authenticated User Pages
import DashboardPage from './pages/DashboardPage.tsx';
import OrganizationPage from './pages/OrganizationPage.tsx';
import UsersPage from './pages/UsersPage.tsx';
import InviteUsersPage from './pages/InviteUsersPage.tsx';
import AcceptInvitePage from './pages/AcceptInvitePage.tsx';
import BillingPage from './pages/BillingPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';

// Super Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import AdminUsersPage from './pages/AdminUsersPage.tsx';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage.tsx';
import AdminBillingPage from './pages/AdminBillingPage.tsx';
import AdminContentPage from './pages/AdminContentPage.tsx';
import SiteEditorPage from './pages/SuperAdmin/SiteEditorPage.tsx'; // Assuming this is the correct path

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
  // Check if authenticated and if the user role is 'Super Admin'
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
        <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
            <Route path="/admin/billing" element={<AdminBillingPage />} />
            <Route path="/admin/content" element={<AdminContentPage />} />
            {/* Kept the original path from our previous work for the site editor */}
            <Route path="/admin/site-editor" element={<SiteEditorPage />} />
        </Route>

        {/* Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
