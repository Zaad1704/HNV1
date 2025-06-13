import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// --- Import a minimal set of components for this test ---
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import AcceptInvitePage from './pages/AcceptInvitePage.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx'; // Re-introducing the layout
import DashboardPage from './pages/DashboardPage.tsx'; // Re-introducing the main dashboard page

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

// --- Route Protection Component ---
// We will test if this logic is causing the issue.
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
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
        
        {/* --- Protected Route Test --- */}
        {/* We are now adding back the protected route with just the dashboard */}
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
            </Route>
        </Route>

        {/* All other routes are disabled for now */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
