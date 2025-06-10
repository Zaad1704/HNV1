// frontend/src/App.tsx

import React from 'react';
// FIX: Import Routes and Route from react-router-dom
import { Routes, Route } from 'react-router-dom';

// Import your page components and ProtectedRoute
import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import ProtectedRoute from './components/ProtectedRoute'; // Assuming this is the path

function App() {
  return (
    // FIX: All <Route> components are wrapped in a <Routes> component
    <Routes>
      {/* Add your other routes here, like the homepage */}
      <Route path="/" element={<div>Welcome Home!</div>} />

      <Route 
        path="/org/dashboard" 
        element={
          <ProtectedRoute>
            <OrganizationDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      
      {/* Add a catch-all route for pages that don't exist */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
