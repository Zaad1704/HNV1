import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from "./pages/HomePage";
import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/org/dashboard" 
        element={
          <ProtectedRoute>
            <OrganizationDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
