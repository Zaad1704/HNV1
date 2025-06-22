import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import FinancialChart from '../components/charts/FinancialChart';
import OccupancyChart from '../components/charts/OccupancyChart';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import { DollarSign, Building2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../contexts/LanguageContext';

// API Fetching Functions remain the same
const fetchOverviewStats = async () => { /* ... */ };
const fetchLateTenants = async () => { /* ... */ };
const fetchExpiringLeases = async () => { /* ... */ };
const fetchFinancialSummary = async () => { /* ... */ };
const fetchOccupancySummary = async () => { /* ... */ };
const sendRentReminder = async (tenantId: string) => { /* ... */ };


const StatCard = ({ title, value, icon, currency = '' }) => (
    <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-light-text">{title}</p>
            <p className="text-3xl font-bold text-dark-text mt-2">
                {currency}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
        <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-lg">
            {icon}
        </div>
    </div>
);

const OverviewPage = () => {
    const { t } = useTranslation();
    const { currencyName } = useLang();
    const queryClient = useQueryClient();
    const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ['overviewStats'], queryFn: fetchOverviewStats });
    const { data: lateTenants, isLoading: isLoadingLate } = useQuery({ queryKey: ['lateTenants'], queryFn: fetchLateTenants });
    const { data: expiringLeases, isLoading: isLoadingLeases } = useQuery({ queryKey: ['expiringLeases'], queryFn: fetchExpiringLeases });
    const { data: financialData, isLoading: isLoadingFinancial } = useQuery({ queryKey: ['financialSummary'], queryFn: fetchFinancialSummary });
    const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({ queryKey: ['occupancySummary'], queryFn: fetchOccupancySummary });
    const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

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

    const isLoading = isLoadingStats || isLoadingLate || isLoadingLeases || isLoadingFinancial || isLoadingOccupancy;

    if (isLoading) {
        return <div className="text-dark-text text-center p-8">Loading Dashboard Data...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-dark-text">{t('dashboard.overview')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('dashboard.monthly_revenue')} value={stats?.monthlyRevenue || 0} currency={currencyName} icon={<DollarSign className="w-6 h-6"/>} />
                <StatCard title={t('dashboard.total_properties')} value={stats?.totalProperties || 0} icon={<Building2 className="w-6 h-6"/>} />
                <StatCard title={t('dashboard.active_tenants')} value={stats?.activeTenants || 0} icon={<Users className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">{t('dashboard.financials_chart_title')}</h2>
                    <FinancialChart data={financialData || []} />
                </div>
                <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">{t('dashboard.occupancy_chart_title')}</h2>
                    <OccupancyChart data={occupancyData || []} />
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
                />
                <ActionItemWidget
                    title={t('dashboard.upcoming_lease_expirations')}
                    items={expiringLeases?.map(t => ({ id: t._id, primaryText: t.name, secondaryText: `Expires on: ${new Date(t.leaseEndDate).toLocaleDateString()}` }))}
                    actionText={t('dashboard.renew_lease')}
                    linkTo="/dashboard/tenants"
                />
            </div>
        </div>
    );
};

export default OverviewPage;
