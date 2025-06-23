// frontend/src/App.tsx

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';
import './services/i18n.js';
import axios from 'axios';

// --- Layout & Route Components ---
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// --- Page Components ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
// ... other page imports
import TenantStatementPage from './pages/TenantStatementPage'; 
import TenantProfilePage from './pages/TenantProfilePage'; // <-- Import the new page
import RemindersPage from './pages/RemindersPage'; 

// ... other page imports

import NotFound from './pages/NotFound';
import { LangProvider } from './contexts/LanguageContext';

const FullScreenLoader = () => <div className="h-screen w-full flex items-center justify-center bg-brand-bg text-dark-text"><p>Loading Platform...</p></div>;

function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      if (token && !user) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.error(`Session check failed with status ${error.response.status}. Interceptor handled logout.`);
          } else {
            console.error("Non-Axios error during session check. Logging out.", error);
            logout();
          }
        }
      }
      setSessionLoading(false);
    };
    checkUserSession();
  }, [token, user, setUser, logout]);

  if (isSessionLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Router>
        <LangProvider> 
          <Routes>
            {/* ... other routes (Public, Auth) */}

            {/* Protected Routes - Dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<OverviewPage />} /> 
                <Route path="overview" element={<OverviewPage />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="properties/:propertyId" element={<PropertyDetailsPage />} />
                <Route path="tenants" element={<TenantsPage />} />
                {/* ADD THE NEW ROUTE FOR THE TENANT PROFILE PAGE */}
                <Route path="tenants/:tenantId/profile" element={<TenantProfilePage />} />
                <Route path="tenants/:tenantId/statement" element={<TenantStatementPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="maintenance" element={<MaintenanceRequestsPage />} />
                <Route path="cashflow" element={<CashFlowPage />} /> 
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="audit-log" element={<AuditLogPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="organization" element={<OrganizationPage />} />
                <Route path="tenant" element={<TenantDashboardPage />} />
              </Route>
            </Route>

            {/* ... other routes (Admin, Fallback) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LangProvider>
      </Router>
    </Suspense>
  );
}

export default App;
