import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import FinancialChart from '../components/charts/FinancialChart';
import RentStatusChart from '../components/charts/RentStatusChart';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import { DollarSign, Building2, Users, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../contexts/LanguageContext';
import { IExpiringLease } from '../hooks/useExpiringLeases';
import { motion } from 'framer-motion';

const fetchOverviewStats = async () => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data;
};
const fetchLateTenants = async () => {
    const { data } = await apiClient.get('/dashboard/late-tenants');
    return data.data;
};
const fetchExpiringLeases = async (): Promise<IExpiringLease[]> => {
    const { data } = await apiClient.get('/dashboard/expiring-leases');
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
const sendRentReminder = async (tenantId: string) => {
    const { data } = await apiClient.post('/communication/send-rent-reminder', { tenantId });
    return data;
};

const StatCard = ({ title, value, icon, to, delay = 0 }: { title: string, value: number | string, icon: React.ReactNode, to: string, delay?: number }) => (
    <Link to={to} style={{ animationDelay: `${delay}s` }} className="bg-light-card dark:bg-dark-card p-6 rounded-3xl border border-border-color dark:border-border-color-dark shadow-sm flex items-center justify-between hover:shadow-xl hover:-translate-y-2 transform transition-all group duration-300 animate-fadeInUp opacity-0">
        <div>
            <p className="text-sm font-medium text-light-text group-hover:text-dark-text dark:group-hover:text-dark-text-dark transition-colors duration-200">{title}</p>
            <p className="text-3xl font-bold text-dark-text dark:text-dark-text-dark mt-1">{value}</p>
        </div>
        <div className="text-brand-primary dark:text-brand-secondary group-hover:text-brand-dark dark:group-hover:text-brand-accent-light transition-colors duration-200">
            {icon}
        </div>
    </Link>
);

const OverviewPage = () => {
    const { t } = useTranslation();
    const { currencyName } = useLang();
    const queryClient = useQueryClient();
    const [remindingTenantId, setRemindingTenantId] = useState<string | null>(null);

    const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ['overviewStats'], queryFn: fetchOverviewStats });
    const { data: lateTenants } = useQuery({ queryKey: ['lateTenants'], queryFn: fetchLateTenants });
    const { data: expiringLeases } = useQuery({ queryKey: ['expiringLeases'], queryFn: fetchExpiringLeases });
    const { data: financialData } = useQuery({ queryKey: ['financialSummary'], queryFn: fetchFinancialSummary });
    const { data: rentStatusData } = useQuery({ queryKey: ['rentStatus'], queryFn: fetchRentStatus });

    const reminderMutation = useMutation({
        mutationFn: sendRentReminder,
        onSuccess: (data, tenantId) => { alert(data.message || `Reminder sent to tenant ${tenantId}!`); },
        onError: (error: any) => { alert(`Failed to send reminder: ${error.response?.data?.message || error.message}`); },
        onSettled: () => { setRemindingTenantId(null); }
    });

    const handleSendReminder = (tenantId: string) => {
        setRemindingTenantId(tenantId);
        reminderMutation.mutate(tenantId);
    };

    if (isLoadingStats) {
        return <div className="text-dark-text dark:text-dark-text-dark text-center p-8">Loading Dashboard Data...</div>;
    }

    const lateTenantItems = lateTenants?.map((t: any) => ({ id: t._id, primaryText: `${t.name} (${t.propertyId?.name || 'N/A'})`, secondaryText: `Unit: ${t.unit}` })) || [];
    const expiringLeaseItems = expiringLeases?.map((l: any) => ({ id: l._id, primaryText: `${l.name} (${l.propertyId?.name || 'N/A'})`, secondaryText: `Expires: ${new Date(l.leaseEndDate).toLocaleDateString()}` })) || [];

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.4,
    };

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard delay={0.1} title={t('dashboard.monthly_revenue')} value={`${currencyName}${stats?.monthlyRevenue?.toLocaleString() || 0}`} icon={<DollarSign className="w-8 h-8" />} to="/dashboard/cashflow" />
                <StatCard delay={0.2} title={t('dashboard.total_properties')} value={stats?.totalProperties || 0} icon={<Building2 className="w-8 h-8" />} to="/dashboard/properties" />
                <StatCard delay={0.3} title={t('dashboard.active_tenants')} value={stats?.activeTenants || 0} icon={<Users className="w-8 h-8" />} to="/dashboard/tenants" />
                <StatCard delay={0.4} title={t('dashboard.occupancy_rate')} value={stats?.occupancyRate || '0%'} icon={<UserCheck className="w-8 h-8" />} to="/dashboard/tenants" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div style={{ animationDelay: '0.5s' }} className="lg:col-span-2 bg-light-card dark:bg-dark-card p-6 rounded-3xl border border-border-color dark:border-border-color-dark shadow-sm transition-all duration-200 animate-fadeInUp opacity-0">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark mb-4">{t('dashboard.financials_chart_title')}</h2>
                    <FinancialChart data={financialData || []} />
                </div>
                <div style={{ animationDelay: '0.6s' }} className="lg:col-span-1 bg-light-card dark:bg-dark-card p-6 rounded-3xl border border-border-color dark:border-border-color-dark shadow-sm transition-all duration-200 animate-fadeInUp opacity-0">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark mb-4">{t('dashboard.rent_status_chart_title')}</h2>
                    <RentStatusChart data={rentStatusData || []} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div style={{ animationDelay: '0.7s' }} className="bg-light-card dark:bg-dark-card p-6 rounded-3xl border border-border-color dark:border-border-color-dark shadow-sm transition-all duration-200 animate-fadeInUp opacity-0">
                    <ActionItemWidget
                        title={t('dashboard.overdue_rent_reminders')}
                        items={lateTenantItems}
                        actionText={t('dashboard.send_reminder')}
                        emptyText={t('dashboard.no_overdue_rent')}
                        linkTo="/dashboard/tenants?filter=late"
                        onActionClick={handleSendReminder}
                        isActionLoading={reminderMutation.isLoading}
                        loadingItemId={remindingTenantId}
                    />
                </div>
                <div style={{ animationDelay: '0.8s' }} className="bg-light-card dark:bg-dark-card p-6 rounded-3xl border border-border-color dark:border-border-color-dark shadow-sm transition-all duration-200 animate-fadeInUp opacity-0">
                    <ActionItemWidget
                        title={t('dashboard.upcoming_lease_expirations')}
                        items={expiringLeaseItems}
                        actionText={t('dashboard.renew_lease')}
                        emptyText={t('dashboard.no_expiring_leases')}
                        linkTo="/dashboard/tenants?filter=expiring"
                        onActionClick={(itemId) => alert(`Renew Lease for ${itemId}`)}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default OverviewPage;
