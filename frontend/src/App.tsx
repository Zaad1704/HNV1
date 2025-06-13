import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// --- Import Only the Public Page Components ---
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
// We will add the other pages back in the next steps

const NotFound = () => <div className="p-8"><h1>404 - Page Not Found</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        {/* We are starting with only the routes we know are stable. */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* All other routes are temporarily disabled for this test. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
