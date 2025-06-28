import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import FinancialChart from '../components/charts/FinancialChart';
import RentStatusChart from '../components/charts/RentStatusChart';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import QuickActions from '../components/dashboard/QuickActions';
import { DollarSign, Building2, Users, UserCheck, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuthStore } from '../store/authStore';
import { IExpiringLease } from '../hooks/useExpiringLeases';
import { motion } from 'framer-motion';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

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

const StatCard = ({ 
  title, 
  value, 
  icon, 
  to, 
  delay = 0,
  trend 
}: { 
  title: string;
  value: number | string;
  icon: React.ReactNode;
  to: string;
  delay?: number;
  trend?: { value: number; isPositive: boolean };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Link 
      to={to} 
      className="app-card app-surface rounded-3xl p-6 flex items-center justify-between hover:shadow-app-lg transition-all duration-300 group touch-feedback"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
          {title}
        </p>
        <p className="text-3xl font-bold text-text-primary mt-2">
          {value}
        </p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            <TrendingUp size={14} className={trend.isPositive ? '' : 'rotate-180'} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="w-14 h-14 app-gradient rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </Link>
  </motion.div>
);

const OverviewPage = () => {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [remindingTenantId, setRemindingTenantId] = useState<string | null>(null);
  
  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['overviewStats'] });
    await queryClient.invalidateQueries({ queryKey: ['lateTenants'] });
    await queryClient.invalidateQueries({ queryKey: ['expiringLeases'] });
    await queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    await queryClient.invalidateQueries({ queryKey: ['rentStatus'] });
  };
  
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: refreshData,
    threshold: 80
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({ 
    queryKey: ['overviewStats'], 
    queryFn: fetchOverviewStats 
  });
  const { data: lateTenants } = useQuery({ 
    queryKey: ['lateTenants'], 
    queryFn: fetchLateTenants 
  });
  const { data: expiringLeases } = useQuery({ 
    queryKey: ['expiringLeases'], 
    queryFn: fetchExpiringLeases 
  });
  const { data: financialData } = useQuery({ 
    queryKey: ['financialSummary'], 
    queryFn: fetchFinancialSummary 
  });
  const { data: rentStatusData } = useQuery({ 
    queryKey: ['rentStatus'], 
    queryFn: fetchRentStatus 
  });

  const reminderMutation = useMutation({
    mutationFn: sendRentReminder,
    onSuccess: (data, tenantId) => { 
      alert(data.message || `Reminder sent to tenant ${tenantId}!`); 
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">{t('dashboard.loading_data')}</span>
      </div>
    );
  }

  const lateTenantItems = lateTenants?.map((t: any) => ({ 
    id: t._id, 
    primaryText: `${t.name} (${t.propertyId?.name || 'N/A'})`, 
    secondaryText: `Unit: ${t.unit}` 
  })) || [];
  
  const expiringLeaseItems = expiringLeases?.map((l: any) => ({ 
    id: l._id, 
    primaryText: `${l.name} (${l.propertyId?.name || 'N/A'})`, 
    secondaryText: `Expires: ${new Date(l.leaseEndDate).toLocaleDateString()}` 
  })) || [];

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
          style={{ transform: `translateY(${Math.min(pullDistance, 60)}px)` }}
        >
          <div className="bg-app-surface rounded-full p-3 shadow-app-lg border border-app-border">
            <RefreshCw 
              size={20} 
              className={`text-brand-blue ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8 pull-to-refresh"
        style={{ 
          transform: isPulling ? `translateY(${Math.min(pullDistance * 0.5, 30)}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
      {/* Welcome Section */}
      <div className="app-gradient rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}!
            {user?.organizationId?.name && (
              <span className="block text-xl font-normal text-white/90 mt-1">
                to {user.organizationId.name}
              </span>
            )}
          </h1>
          <p className="text-white/80">
            Here's what's happening with your properties today.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          delay={0.1} 
          title={t('dashboard.monthly_revenue')} 
          value={`${currency}${stats?.monthlyRevenue?.toLocaleString() || 0}`} 
          icon={<DollarSign size={24} />} 
          to="/dashboard/cashflow"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          delay={0.2} 
          title={t('dashboard.total_properties')} 
          value={stats?.totalProperties || 0} 
          icon={<Building2 size={24} />} 
          to="/dashboard/properties"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard 
          delay={0.3} 
          title={t('dashboard.active_tenants')} 
          value={stats?.activeTenants || 0} 
          icon={<Users size={24} />} 
          to="/dashboard/tenants"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard 
          delay={0.4} 
          title={t('dashboard.occupancy_rate')} 
          value={stats?.occupancyRate || '0%'} 
          icon={<UserCheck size={24} />} 
          to="/dashboard/tenants"
          trend={{ value: 3, isPositive: false }}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-2 app-surface rounded-3xl p-8 border border-app-border touch-feedback"
        >
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <div className="w-8 h-8 app-gradient rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            {t('dashboard.financials_chart_title')}
          </h2>
          <FinancialChart data={financialData || []} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="app-surface rounded-3xl p-8 border border-app-border touch-feedback"
        >
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <div className="w-8 h-8 app-gradient rounded-lg flex items-center justify-center">
              <AlertCircle size={16} className="text-white" />
            </div>
            {t('dashboard.rent_status_chart_title')}
          </h2>
          <RentStatusChart data={rentStatusData || []} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
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
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <ActionItemWidget
            title={t('dashboard.upcoming_lease_expirations')}
            items={expiringLeaseItems}
            actionText={t('dashboard.renew_lease')}
            emptyText={t('dashboard.no_expiring_leases')}
            linkTo="/dashboard/tenants?filter=expiring"
            onActionClick={(itemId) => alert(`Renew Lease for ${itemId}`)}
          />
        </motion.div>
      </div>
      </motion.div>
    </div>
  );
};

export default OverviewPage;