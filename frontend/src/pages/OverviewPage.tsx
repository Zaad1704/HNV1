import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import FinancialChart from '../components/charts/FinancialChart';
import RentStatusChart from '../components/charts/RentStatusChart';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import { DollarSign, Building2, Users, FileClock, Wrench, CreditCard, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../contexts/LanguageContext';
import { useWindowSize } from '../hooks/useWindowSize';
import { useAuthStore } from '../store/authStore';

// --- API Fetching Functions ---
const fetchOverviewStats = async () => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data;
};
const fetchLateTenants = async () => {
    const { data } = await apiClient.get('/dashboard/late-tenants');
    return data.data;
};
const fetchFinancialSummary = async () => {
    const { data } = await apiClient.get('/dashboard/financial-summary');
    return data.data;
};
const fetchRentStatus = async () => {
    const { data } = await apiClient.get('/dashboard/rent-status');
    return data.data;
};
const fetchRecentActivity = async () => {
    const { data } = await apiClient.get('/dashboard/recent-activity');
    return data.data;
};
const sendRentReminder = async (tenantId: string) => {
    const { data } = await apiClient.post('/communication/send-rent-reminder', { tenantId });
    return data;
};

const StatCard = ({ title, value, icon, currency = '', to }: { title: string, value: number | string, icon: React.ReactNode, currency?: string, to: string }) => (
    <Link to={to} className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm flex items-start justify-between hover:shadow-md hover:-translate-y-1 transition-all">
        <div>
            <p className="text-sm font-medium text-light-text">{title}</p>
            <p className="text-3xl font-bold text-dark-text mt-2">
                {currency}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg border border-border-color">
            {icon}
        </div>
    </Link>
);

const DashboardNavCard = ({ to, icon, title, description }: { to: string, icon: React.ReactNode, title: string, description: string }) => (
    <Link to={to} className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm hover:shadow-md hover:border-brand-primary transition-all flex items-center gap-4">
        <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-dark-text">{title}</h3>
            <p className="text-sm text-light-text">{description}</p>
        </div>
    </Link>
);


const OverviewPage = () => {
const { t } = useTranslation();
const { currencyName } = useLang();
const { width } = useWindowSize();
const { isAuthenticated } = useAuthStore();
const queryClient = useQueryClient();

const { data: stats, isLoading: isLoadingStats } = useQuery({
queryKey: ['overviewStats'],
queryFn: fetchOverviewStats,
enabled: isAuthenticated
});
const { data: lateTenants } = useQuery({
queryKey: ['lateTenants'],
queryFn: fetchLateTenants,
enabled: isAuthenticated
});
const { data: financialData } = useQuery({
queryKey: ['financialSummary'],
queryFn: fetchFinancialSummary,
enabled: isAuthenticated
});
const { data: rentStatusData } = useQuery({
queryKey: ['rentStatus'],
queryFn: fetchRentStatus,
enabled: isAuthenticated
});
const { data: recentActivity } = useQuery({
queryKey: ['recentActivity'],
queryFn: fetchRecentActivity,
enabled: isAuthenticated
});

const [remindingTenantId, setRemindingTenantId] = useState<string | null>(null);

const reminderMutation = useMutation({
    mutationFn: sendRentReminder,
    onSuccess: (data, tenantId) => {
        alert(data.message || `Reminder sent successfully to tenant ${tenantId}!`);
    },
    onError: (error: any) => {
        alert(`Failed to send reminder: ${error.response?.data?.message || error.message}`);
    },
    onSettled: () => {
        setRemindingTenantId(null);
    }
});

const handleSendReminder = (tenantId: string) => {
    setRemindingTenantId(tenantId);
    reminderMutation.mutate(tenantId);
};


if (isLoadingStats) {
return <div className="text-dark-text text-center p-8">Loading Dashboard Data...</div>;
}

const lateTenantItems = lateTenants?.map((t: any) => ({
    id: t._id,
    primaryText: `${t.name} (${t.propertyId?.name || 'N/A'})`,
    secondaryText: `Unit: ${t.unit}`,
})) || [];

if (width < 768) {
return (
<div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
        <StatCard title={t('dashboard.monthly_revenue')} value={stats?.monthlyRevenue || 0} icon={<DollarSign />} currency={currencyName} to="/dashboard/cashflow" />
        <StatCard title={t('dashboard.total_properties')} value={stats?.totalProperties || 0} icon={<Building2 />} to="/dashboard/properties" />
        <StatCard title={t('dashboard.active_tenants')} value={stats?.activeTenants || 0} icon={<Users />} to="/dashboard/tenants" />
        <StatCard title={t('dashboard.occupancy_rate')} value={stats?.occupancyRate || '0%'} icon={<UserCheck />} to="/dashboard/tenants" />
    </div>

    <div className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm">
        <h2 className="text-lg font-bold text-dark-text mb-4">{t('dashboard.financials_chart_title')}</h2>
        <FinancialChart data={financialData || []} />
    </div>

     <ActionItemWidget
        title={t('dashboard.overdue_rent_reminders')}
        items={lateTenantItems}
        actionText={t('dashboard.send_reminder')}
        emptyText="No tenants with overdue rent."
        linkTo="/dashboard/tenants?filter=late"
        onActionClick={handleSendReminder}
        isActionLoading={reminderMutation.isLoading}
        loadingItemId={remindingTenantId}
    />
    
    <div className="grid grid-cols-1 gap-4">
        <DashboardNavCard to="/dashboard/expenses" icon={<CreditCard />} title={t('dashboard.expenses')} description="Track and manage all expenses" />
        <DashboardNavCard to="/dashboard/maintenance" icon={<Wrench />} title={t('dashboard.maintenance')} description="View and manage all requests" />
    </div>
</div>
)
}

return (
<div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.monthly_revenue')} value={stats?.monthlyRevenue || 0} icon={<DollarSign />} currency={currencyName} to="/dashboard/cashflow" />
        <StatCard title={t('dashboard.total_properties')} value={stats?.totalProperties || 0} icon={<Building2 />} to="/dashboard/properties" />
        <StatCard title={t('dashboard.active_tenants')} value={stats?.activeTenants || 0} icon={<Users />} to="/dashboard/tenants" />
        <StatCard title={t('dashboard.occupancy_rate')} value={stats?.occupancyRate || '0%'} icon={<UserCheck />} to="/dashboard/tenants" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold text-dark-text mb-4">{t('dashboard.financials_chart_title')}</h2>
            <FinancialChart data={financialData || []} />
        </div>
        <div className="lg:col-span-1 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold text-dark-text mb-4">Rent Payment Status</h2>
            <RentStatusChart data={rentStatusData || []} />
        </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActionItemWidget
            title={t('dashboard.overdue_rent_reminders')}
            items={lateTenantItems}
            actionText={t('dashboard.send_reminder')}
            emptyText="No tenants with overdue rent."
            linkTo="/dashboard/tenants?filter=late"
            onActionClick={handleSendReminder}
            isActionLoading={reminderMutation.isLoading}
            loadingItemId={remindingTenantId}
        />
        <ActionItemWidget
            title={t('dashboard.upcoming_lease_expirations')}
            items={[]}
            actionText={t('dashboard.renew_lease')}
            emptyText="No leases expiring soon."
            linkTo="/dashboard/tenants?filter=expiring"
        />
    </div>
</div>
);


};

export default OverviewPage;
