import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Link } from 'react-router-dom'; // Import Link
import FinancialChart from '../components/charts/FinancialChart';
import OccupancyChart from '../components/charts/OccupancyChart';
import RentStatusChart from '../components/charts/RentStatusChart'; // Import new chart
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import { DollarSign, Building2, Users, FileClock } from 'lucide-react'; // Import FileClock icon
import { useTranslation } from 'react-i18next';
import { useLang } from '../contexts/LanguageContext';

// --- API Fetching Functions ---
const fetchOverviewStats = async () => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data;
};
const fetchLateTenants = async () => {
    const { data } = await apiClient.get('/dashboard/late-tenants');
    return data.data;
};
const fetchExpiringLeases = async () => {
    const { data } = await apiClient.get('/dashboard/expiring-leases');
    return data.data;
};
const fetchFinancialSummary = async () => {
    const { data } = await apiClient.get('/dashboard/financial-summary');
    return data.data;
};
const fetchOccupancySummary = async () => {
    const { data } = await apiClient.get('/dashboard/occupancy-summary');
    return data.data;
};
// NEW: Fetcher for rent status
const fetchRentStatus = async () => {
    const { data } = await apiClient.get('/dashboard/rent-status');
    return data.data;
};
// NEW: Fetcher for recent activity
const fetchRecentActivity = async () => {
    const { data } = await apiClient.get('/dashboard/recent-activity');
    return data.data;
};
const sendRentReminder = async (tenantId: string) => {
    const { data } = await apiClient.post('/communication/send-rent-reminder', { tenantId });
    return data.message;
};

// Updated StatCard to be a clickable Link
const StatCard = ({ title, value, icon, currency = '', to }) => (
    <Link to={to} className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm flex items-center justify-between hover:border-brand-primary transition-colors">
        <div>
            <p className="text-sm font-medium text-light-text">{title}</p>
            <p className="text-3xl font-bold text-dark-text mt-2">
                {currency}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
        <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-lg">
            {icon}
        </div>
    </Link>
);

const OverviewPage = () => {
    const { t } = useTranslation();
    const { currencyName } = useLang();
    const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

    // --- All Data Queries ---
    const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ['overviewStats'], queryFn: fetchOverviewStats });
    const { data: lateTenants, isLoading: isLoadingLate } = useQuery({ queryKey: ['lateTenants'], queryFn: fetchLateTenants });
    const { data: expiringLeases, isLoading: isLoadingLeases } = useQuery({ queryKey: ['expiringLeases'], queryFn: fetchExpiringLeases });
    const { data: financialData, isLoading: isLoadingFinancial } = useQuery({ queryKey: ['financialSummary'], queryFn: fetchFinancialSummary });
    const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({ queryKey: ['occupancySummary'], queryFn: fetchOccupancySummary });
    const { data: rentStatusData, isLoading: isLoadingRentStatus } = useQuery({ queryKey: ['rentStatus'], queryFn: fetchRentStatus });
    const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({ queryKey: ['recentActivity'], queryFn: fetchRecentActivity });

    const reminderMutation = useMutation({
        mutationFn: sendRentReminder,
        onMutate: (tenantId) => setSendingReminderId(tenantId),
        onSuccess: (message) => alert(message),
        onError: (err: any) => alert(`Failed to send reminder: ${err.response?.data?.message || err.message}`),
        onSettled: () => setSendingReminderId(null),
    });

    const handleSendReminder = (tenantId: string) => {
        if (window.confirm('Are you sure you want to send a rent reminder email to this tenant?')) {
            reminderMutation.mutate(tenantId);
        }
    };

    const isLoading = isLoadingStats || isLoadingLate || isLoadingLeases || isLoadingFinancial || isLoadingOccupancy || isLoadingRentStatus || isLoadingActivity;

    if (isLoading) {
        return <div className="text-dark-text text-center p-8">Loading Dashboard Data...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-dark-text">{t('dashboard.overview')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('dashboard.monthly_revenue')} value={stats?.monthlyRevenue || 0} currency={currencyName} icon={<DollarSign className="w-6 h-6"/>} to="/dashboard/payments" />
                <StatCard title={t('dashboard.total_properties')} value={stats?.totalProperties || 0} icon={<Building2 className="w-6 h-6"/>} to="/dashboard/properties" />
                <StatCard title={t('dashboard.active_tenants')} value={stats?.activeTenants || 0} icon={<Users className="w-6 h-6"/>} to="/dashboard/tenants" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">{t('dashboard.financials_chart_title')}</h2>
                    <FinancialChart data={financialData || []} />
                </div>
                <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Current Rent Status</h2>
                    <RentStatusChart data={rentStatusData || []} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ActionItemWidget
                    title={t('dashboard.overdue_rent_reminders')}
                    items={lateTenants?.map(t => ({ id: t._id, primaryText: t.name, secondaryText: `Property: ${t.propertyId?.name || 'N/A'}` }))}
                    actionText={t('dashboard.send_reminder')}
                    linkTo="/dashboard/tenants"
                    onActionClick={handleSendReminder}
                    isActionLoading={reminderMutation.isLoading}
                    loadingItemId={sendingReminderId}
                    emptyText="No tenants are currently overdue."
                />
                <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Recent Activity</h2>
                    <ul className="space-y-4">
                        {(recentActivity || []).map((activity) => (
                            <li key={activity._id} className="flex items-center gap-4">
                                <div className="p-2 bg-light-bg rounded-full border border-border-color">
                                    <FileClock size={20} className="text-light-text" />
                                </div>
                                <div>
                                    <p className="font-semibold text-dark-text">{activity.action.replace(/_/g, ' ')}</p>
                                    <p className="text-sm text-light-text">
                                        by {activity.user?.name || 'System'} - {new Date(activity.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
