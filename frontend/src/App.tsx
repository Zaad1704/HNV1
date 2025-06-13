import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// We are temporarily removing the auth store import to isolate the error
// import { useAuthStore } from './store/authStore';

// --- We will only import the public pages for this test ---
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import AcceptInvitePage from './pages/AcceptInvitePage.tsx';

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

// This is a simple placeholder for the dashboard content
const DashboardPlaceholder = () => (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Welcome to the Dashboard!</h1>
        <p>If you can see this, the authentication and routing are working correctly.</p>
    </div>
);


// --- Route Protection Component ---
// This is our final test. We are removing the call to useAuthStore completely.
const ProtectedRoute = () => {
  // const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Temporarily commented out
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
        {/* We are testing if the app renders when the auth store is not called */}
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
