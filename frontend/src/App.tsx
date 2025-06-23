// frontend/src/App.tsx

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import axios from 'axios';

// --- Import Layouts, Routes, and Pages ---
// ... (all your existing imports)

const FullScreenLoader = () => <div className="h-screen w-full flex items-center justify-center bg-brand-bg text-dark-text"><p>Loading Platform...</p></div>;

// A new component to handle the logic after authentication
function AuthHandler() {
    const { user, token, setUser, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        // This effect runs whenever the token changes.
        const checkUserSession = async () => {
            if (token && !user) {
                try {
                    const response = await apiClient.get('/auth/me');
                    setUser(response.data.data); // Correctly access the user object
                } catch (error) {
                    console.error("Session check failed, logging out.", error);
                    logout();
                    navigate('/login', { replace: true });
                }
            }
        };

        checkUserSession();
    }, [token, user, setUser, logout, navigate]);

    // This effect runs when the user object is successfully set
    useEffect(() => {
        if (user) {
            // Once we have a user, navigate to the dashboard
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    return null; // This component doesn't render anything itself
}

function App() {
  // We no longer need the complex useEffect here, it's moved to AuthHandler
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Router>
        {/* AuthHandler will manage session state globally */}
        <AuthHandler />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            {/* ... all your public routes ... */}
          </Route>

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* ... other auth routes ... */}

          {/* Protected Routes - Dashboard */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
             {/* All nested dashboard routes go here now */}
             <Route path="overview" element={<OverviewPage />} />
             <Route path="properties" element={<PropertiesPage />} />
             {/* ... and so on for all dashboard pages */}
          </Route>
          
          {/* ... Admin Routes and NotFound Route ... */}
        </Routes>
      </Router>
    </Suspense>
  );
}

export default App;
