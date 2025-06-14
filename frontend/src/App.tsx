import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// ... all your page imports ...
import LandingPage from './pages/LandingPage.tsx';
// ... etc.

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => { /* ... remains the same ... */ };

function App() {
  const { token, user, setUser, logout } = useAuthStore();

  // This effect runs once on app load to get user data if a token exists
  useEffect(() => {
    const fetchUserData = async () => {
      if (token && !user) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          console.error("Session expired or invalid, logging out.");
          logout();
        }
      }
    };
    fetchUserData();
  }, [token, user, setUser, logout]);


  return (
    <Router>
      <Routes>
        {/* ... all your routes remain the same ... */}
        <Route path="/" element={<LandingPage />} />
        {/* ... etc. ... */}
      </Routes>
    </Router>
  );
}

export default App;
