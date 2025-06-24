import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './api/client';

// --- Layouts and Guards ---
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';

// --- Lazy-loaded Page Components ---
const LandingPage = React.lazy(() =\> import('./pages/LandingPage'));
const LoginPage = React.lazy(() =\> import('./pages/LoginPage'));
const RegisterPage = React.lazy(() =\> import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() =\> import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() =\> import('./pages/ResetPasswordPage'));
const GoogleAuthCallback = React.lazy(() =\> import('./pages/GoogleAuthCallback'));
const AcceptAgentInvitePage = React.lazy(() =\> import('./pages/AcceptAgentInvitePage'));
const TermsPage = React.lazy(() =\> import('./pages/TermsPage'));
const PrivacyPolicyPage = React.lazy(() =\> import('./pages/PrivacyPolicyPage'));
const NotFound = React.lazy(() =\> import('./pages/NotFound'));
const DashboardRedirector = React.lazy(() =\> import('./pages/DashboardRedirector'));
const OverviewPage = React.lazy(() =\> import('./pages/OverviewPage'));
const PropertiesPage = React.lazy(() =\> import('./pages/PropertiesPage'));
const PropertyDetailsPage = React.lazy(() =\> import('./pages/PropertyDetailsPage'));
const TenantsPage = React.lazy(() =\> import('./pages/TenantsPage'));
const TenantProfilePage = React.lazy(() =\> import('./pages/TenantProfilePage'));
const TenantStatementPage = React.lazy(() =\> import('./pages/TenantStatementPage'));
const ExpensesPage = React.lazy(() =\> import('./pages/ExpensesPage'));
const MaintenanceRequestsPage = React.lazy(() =\> import('./pages/MaintenanceRequestsPage'));
const CashFlowPage = React.lazy(() =\> import('./pages/CashFlowPage'));
const RemindersPage = React.lazy(() =\> import('./pages/RemindersPage'));
const UsersPage = React.lazy(() =\> import('./pages/UsersPage'));
const BillingPage = React.lazy(() =\> import('./pages/BillingPage'));
const AuditLogPage = React.lazy(() =\> import('./pages/AuditLogPage'));
const SettingsPage = React.lazy(() =\> import('./pages/SettingsPage'));
const ApprovalRequestsPage = React.lazy(() =\> import('./pages/ApprovalRequestsPage'));
const TenantDashboardPage = React.lazy(() =\> import('./pages/TenantDashboardPage'));
const AdminDashboardPage = React.lazy(() =\> import('./pages/AdminDashboardPage'));
const AdminOrganizationsPage = React.lazy(() =\> import('./pages/AdminOrganizationsPage'));
const AdminUsersPage = React.lazy(() =\> import('./pages/AdminUsersPage'));
const AdminPlansPage = React.lazy(() =\> import('./pages/AdminPlansPage'));
const SiteEditorPage = React.lazy(() =\> import('./pages/SuperAdmin/SiteEditorPage'));
const AdminBillingPage = React.lazy(() =\> import('./pages/AdminBillingPage'));
const AdminProfilePage = React.lazy(() =\> import('./pages/SuperAdmin/AdminProfilePage'));

const FullScreenLoader = () =\> (
<div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white"><p>Loading Application...</p></div>
);

function App() {
const { token, user, setUser, logout } = useAuthStore();
const [isSessionLoading, setSessionLoading] = useState(true);

useEffect(() =\> {
const checkUserSession = async () =\> {
if (token && \!user) {
try {
const response = await apiClient.get('/auth/me');
setUser(response.data.data);
} catch (error) {
console.error("Session check failed, logging out.", error);
logout();
}
}
setSessionLoading(false);
};
checkUserSession();
}, []);

if (isSessionLoading) {
return <FullScreenLoader />;
}

return (
\<Suspense fallback={<FullScreenLoader />}\>
<Routes>
\<Route path="/" element={<PublicLayout />}\>
\<Route index element={<LandingPage />} /\>
\<Route path="terms" element={<TermsPage />} /\>
\<Route path="privacy" element={<PrivacyPolicyPage />} /\>
</Route>
\<Route path="/login" element={<LoginPage />} /\>
\<Route path="/register" element={<RegisterPage />} /\>
\<Route path="/forgot-password" element={<ForgotPasswordPage />} /\>
\<Route path="/reset-password/:token" element={<ResetPasswordPage />} /\>
\<Route path="/accept-agent-invite/:token" element={<AcceptAgentInvitePage />} /\>
\<Route path="/auth/google/callback" element={<GoogleAuthCallback />} /\>

<Route path="/dashboard" element={<ProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    <Route index element={<DashboardRedirector />} />
    <Route path="overview" element={<OverviewPage />} />
    <Route path="tenant" element={<TenantDashboardPage />} />
    <Route path="properties" element={<PropertiesPage />} />
    <Route path="properties/:propertyId" element={<PropertyDetailsPage />} />
    <Route path="tenants" element={<TenantsPage />} />
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
    <Route path="approvals" element={<ApprovalRequestsPage />} />
  </Route>
</Route>

<Route path="/admin" element={<AdminRoute />}>
    <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="organizations" element={<AdminOrganizationsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="site-editor" element={<SiteEditorPage />} />
        <Route path="billing" element={<AdminBillingPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
    </Route>
</Route>

<Route path="*" element={<NotFound />} />
</Routes>
</Suspense>


);
}

export default App;
