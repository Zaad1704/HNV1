import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import DashboardLayout from './layout/DashboardLayout';

// Lazy load dashboard pages
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const OverviewPage = React.lazy(() => import('../pages/OverviewPage'));
const PropertiesPage = React.lazy(() => import('../pages/PropertiesPage'));
const TenantsPage = React.lazy(() => import('../pages/TenantsPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const PaymentsPage = React.lazy(() => import('../pages/PaymentsPage'));
const ExpensesPage = React.lazy(() => import('../pages/ExpensesPage'));
const MaintenanceRequestsPage = React.lazy(() => import('../pages/MaintenanceRequestsPage'));
const CashFlowPage = React.lazy(() => import('../pages/CashFlowPage'));
const RemindersPage = React.lazy(() => import('../pages/RemindersPage'));
const ApprovalRequestsPage = React.lazy(() => import('../pages/ApprovalRequestsPage'));
const UsersPage = React.lazy(() => import('../pages/UsersPage'));
const BillingPage = React.lazy(() => import('../pages/BillingPage'));
const AuditLogPage = React.lazy(() => import('../pages/AuditLogPage'));
const PropertyDetailsPage = React.lazy(() => import('../pages/PropertyDetailsPage'));
const TenantProfilePage = React.lazy(() => import('../pages/TenantProfilePage'));
const TenantDashboardPage = React.lazy(() => import('../pages/TenantDashboardPage'));
const PlansPage = React.lazy(() => import('../pages/PlansPage'));

const ProtectedRoute: React.FC = () => {
  const { token, user } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<TenantProfilePage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/:propertyId" element={<PropertyDetailsPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="tenants/:tenantId/profile" element={<TenantProfilePage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="maintenance" element={<MaintenanceRequestsPage />} />
        <Route path="cashflow" element={<CashFlowPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="approvals" element={<ApprovalRequestsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="resubscribe" element={<PlansPage />} />
        <Route path="tenant" element={<TenantDashboardPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ProtectedRoute;