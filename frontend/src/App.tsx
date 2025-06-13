import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// --- We will only import the public pages for this test ---
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import AcceptInvitePage from './pages/AcceptInvitePage.tsx';
// We are temporarily removing the real DashboardLayout and DashboardPage imports

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

// This is a simple placeholder for the dashboard content
const DashboardPlaceholder = () => (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Welcome to the Dashboard!</h1>
        <p>If you can see this, the authentication and routing are working correctly.</p>
    </div>
);


// --- Route Protection Component ---
// We are testing if this component is the source of the issue.
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // For this test, let's assume the user is always authenticated to isolate routing issues.
  const isAuthForTest = true; 
  
  return isAuthForTest ? <Outlet /> : <Navigate to="/login" replace />;
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
        {/* We are now using a very simple placeholder inside the protected route */}
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Route>

        {/* All other routes are disabled for now */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
