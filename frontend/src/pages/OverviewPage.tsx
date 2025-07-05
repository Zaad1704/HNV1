import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import FinancialChart from '../components/charts/FinancialChart';
import RentStatusChart from '../components/charts/RentStatusChart';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import MessageButtons from '../components/common/MessageButtons';
import AddPropertyModal from '../components/common/AddPropertyModal';
import AddTenantModal from '../components/common/AddTenantModal';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import AddExpenseModal from '../components/common/AddExpenseModal';
import ExportModal from '../components/common/ExportModal';
import CashHandoverModal from '../components/common/CashHandoverModal';
import BankTransferModal from '../components/common/BankTransferModal';
import ManualCollectionModal from '../components/common/ManualCollectionModal';
import { DollarSign, Building2, Users, UserCheck, TrendingUp, AlertCircle, RefreshCw, CreditCard, Wrench, Bell, CheckSquare, FileText, Settings, Download, Upload, Banknote, Wallet, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuthStore } from '../store/authStore';
import { IExpiringLease } from '../hooks/useExpiringLeases';
import { motion } from 'framer-motion';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

const fetchOverviewStats = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data || { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' };
  } catch (error) {
    console.error('Overview stats error:', error);
    throw error;
  }
};

const fetchLateTenants = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/late-tenants');
    return data.data || [];
  } catch (error) {
    console.error('Late tenants error:', error);
    return [];
  }
};

const fetchExpiringLeases = async (): Promise<IExpiringLease[]> => {
  try {
    const { data } = await apiClient.get('/dashboard/expiring-leases');
    return data.data || [];
  } catch (error) {
    console.error('Expiring leases error:', error);
    return [];
  }
};

const fetchFinancialSummary = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/financial-summary');
    return data.data || [];
  } catch (error) {
    console.error('Financial summary error:', error);
    return [];
  }
};

const fetchRentStatus = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/rent-status');
    return data.data || [];
  } catch (error) {
    console.error('Rent status error:', error);
    return [];
  }
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
  
  // Modal states for action buttons
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showRecordExpenseModal, setShowRecordExpenseModal] = useState(false);
  const [showRecordMaintenanceModal, setShowRecordMaintenanceModal] = useState(false);
  const [showRecordReminderModal, setShowRecordReminderModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCashHandoverModal, setShowCashHandoverModal] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [showManualCollectionModal, setShowManualCollectionModal] = useState(false);
  const [showRecordReceiptModal, setShowRecordReceiptModal] = useState(false);
  
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

  const { data: stats = { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' }, isLoading: isLoadingStats, error: statsError } = useQuery({ 
    queryKey: ['overviewStats'], 
    queryFn: fetchOverviewStats,
    retry: 1,
    staleTime: 30000,
    onError: (error) => console.error('Stats query error:', error)
  });
  const { data: lateTenants = [] } = useQuery({ 
    queryKey: ['lateTenants'], 
    queryFn: fetchLateTenants,
    retry: 1,
    staleTime: 30000,
    onError: (error) => console.error('Late tenants error:', error)
  });
  const { data: expiringLeases = [] } = useQuery({ 
    queryKey: ['expiringLeases'], 
    queryFn: fetchExpiringLeases,
    retry: 1,
    staleTime: 30000,
    onError: (error) => console.error('Expiring leases error:', error)
  });
  const { data: financialData = [] } = useQuery({ 
    queryKey: ['financialSummary'], 
    queryFn: fetchFinancialSummary,
    retry: 1,
    staleTime: 30000,
    onError: (error) => console.error('Financial data error:', error)
  });
  const { data: rentStatusData = [] } = useQuery({ 
    queryKey: ['rentStatus'], 
    queryFn: fetchRentStatus,
    retry: 1,
    staleTime: 30000,
    onError: (error) => console.error('Rent status error:', error)
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

  const handleWhatsAppReminder = (tenant: any) => {
    // This will be called from ActionItemWidget if we modify it
    console.log('WhatsApp reminder for:', tenant);
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
          className="fixed top-0 left-0 right-0 z-[90] flex justify-center pt-4"
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

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="app-surface rounded-3xl p-8 border border-app-border"
      >
        <h2 className="text-xl font-bold text-text-primary mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: Building2, label: 'Record Property', action: () => setShowAddPropertyModal(true), color: 'gradient-dark-orange-blue' },
            { icon: Users, label: 'Record Tenant', action: () => setShowAddTenantModal(true), color: 'gradient-orange-blue' },
            { icon: DollarSign, label: 'Record Payment', action: () => setShowRecordPaymentModal(true), color: 'gradient-dark-orange-blue' },
            { icon: FileText, label: 'Record Expense', action: () => setShowRecordExpenseModal(true), color: 'gradient-orange-blue' },
            { icon: Wrench, label: 'Record Maintenance', action: () => setShowRecordMaintenanceModal(true), color: 'gradient-dark-orange-blue' },
            { icon: Bell, label: 'Record Reminder', action: () => setShowRecordReminderModal(true), color: 'gradient-orange-blue' },
            { icon: Download, label: 'Export Data', action: () => setShowExportModal(true), color: 'gradient-dark-orange-blue' },
            { icon: Upload, label: 'Import Data', action: () => setShowImportModal(true), color: 'gradient-orange-blue' },
            { icon: CreditCard, label: 'Cash Handover', action: () => setShowCashHandoverModal(true), color: 'gradient-dark-orange-blue' },
            { icon: Banknote, label: 'Bank Transfer', action: () => setShowBankTransferModal(true), color: 'gradient-orange-blue' },
            { icon: Wallet, label: 'Manual Collection', action: () => setShowManualCollectionModal(true), color: 'gradient-dark-orange-blue' },
            { icon: Receipt, label: 'Record Receipt', action: () => setShowRecordReceiptModal(true), color: 'gradient-orange-blue' }
          ].map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`${item.color} text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:shadow-lg hover:scale-105 transition-all text-center`}
            >
              <item.icon size={24} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>



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
            isActionLoading={reminderMutation.isPending}
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
      
      {/* Modals */}
      <AddPropertyModal
        isOpen={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
        onPropertyAdded={() => {}}
      />
      <AddTenantModal
        isOpen={showAddTenantModal}
        onClose={() => setShowAddTenantModal(false)}
        onTenantAdded={() => {}}
      />
      <QuickPaymentModal
        isOpen={showRecordPaymentModal}
        onClose={() => setShowRecordPaymentModal(false)}
      />
      <AddExpenseModal
        isOpen={showRecordExpenseModal}
        onClose={() => setShowRecordExpenseModal(false)}
        onExpenseAdded={() => {}}
      />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        section="overview"
        title="Dashboard Data"
      />
      <CashHandoverModal
        isOpen={showCashHandoverModal}
        onClose={() => setShowCashHandoverModal(false)}
      />
      <BankTransferModal
        isOpen={showBankTransferModal}
        onClose={() => setShowBankTransferModal(false)}
      />
      <ManualCollectionModal
        isOpen={showManualCollectionModal}
        onClose={() => setShowManualCollectionModal(false)}
      />
      
      {/* Placeholder alerts for remaining modals */}
      {showRecordMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Record Maintenance</h3>
            <p className="text-gray-600 mb-4">Maintenance recording feature coming soon!</p>
            <button 
              onClick={() => setShowRecordMaintenanceModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {showRecordReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Record Reminder</h3>
            <p className="text-gray-600 mb-4">Reminder setup feature coming soon!</p>
            <button 
              onClick={() => setShowRecordReminderModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Import Data</h3>
            <p className="text-gray-600 mb-4">Data import feature coming soon!</p>
            <button 
              onClick={() => setShowImportModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {showRecordReceiptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Record Receipt</h3>
            <p className="text-gray-600 mb-4">Receipt recording feature coming soon!</p>
            <button 
              onClick={() => setShowRecordReceiptModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewPage;