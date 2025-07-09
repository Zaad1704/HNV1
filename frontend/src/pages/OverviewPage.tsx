import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import ActionButtons from '../components/common/ActionButtons';
import FinancialChart from '../components/charts/FinancialChart';
import RentStatusChart from '../components/charts/RentStatusChart';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import MessageButtons from '../components/common/MessageButtons';
import UniversalCard from '../components/common/UniversalCard';
import UniversalHeader from '../components/common/UniversalHeader';
import QuickInsightsWidget from '../components/advanced/QuickInsightsWidget';
import { useCrossData } from '../hooks/useCrossData';
import AddPropertyModal from '../components/common/AddPropertyModal';
import AddTenantModal from '../components/common/AddTenantModal';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import AddExpenseModal from '../components/common/AddExpenseModal';
import ExportModal from '../components/common/ExportModal';
import CashHandoverModal from '../components/common/CashHandoverModal';
import BankTransferModal from '../components/common/BankTransferModal';
import ManualCollectionModal from '../components/common/ManualCollectionModal';
import AddReminderModal from '../components/common/AddReminderModal';
import { DollarSign, Building2, Users, UserCheck, TrendingUp, AlertCircle, RefreshCw, CreditCard, Wrench, Bell, CheckSquare, FileText, Settings, Download, Upload, Banknote, Wallet, Receipt, Plus } from 'lucide-react';
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
    return { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' };
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
);

const OverviewPage = () => {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [remindingTenantId, setRemindingTenantId] = useState<string | null>(null);
  const { stats: crossStats } = useCrossData();
  
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
  const [showQuickActions, setShowQuickActions] = useState(false);
  
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

  const { data: stats = { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' }, isLoading: isLoadingStats } = useQuery({ 
    queryKey: ['overviewStats'], 
    queryFn: fetchOverviewStats,
    retry: 0,
    staleTime: 30000
  });
  const { data: lateTenants = [] } = useQuery({ 
    queryKey: ['lateTenants'], 
    queryFn: fetchLateTenants,
    retry: 0,
    staleTime: 30000
  });
  const { data: expiringLeases = [] } = useQuery({ 
    queryKey: ['expiringLeases'], 
    queryFn: fetchExpiringLeases,
    retry: 0,
    staleTime: 30000
  });
  const { data: financialData = [] } = useQuery({ 
    queryKey: ['financialSummary'], 
    queryFn: fetchFinancialSummary,
    retry: 0,
    staleTime: 30000
  });
  const { data: rentStatusData = [] } = useQuery({ 
    queryKey: ['rentStatus'], 
    queryFn: fetchRentStatus,
    retry: 0,
    staleTime: 30000
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
      
      <div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8 pull-to-refresh"
        style={{ 
          transform: isPulling ? `translateY(${Math.min(pullDistance * 0.5, 30)}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
      <UniversalHeader
        title="Overview"
        subtitle="Property management dashboard overview"
        icon={Building2}
        stats={[
          { label: 'Properties', value: stats?.totalProperties || 0, color: 'blue' },
          { label: 'Tenants', value: stats?.activeTenants || 0, color: 'green' },
          { label: 'Revenue', value: `${currency}${stats?.monthlyRevenue || 0}`, color: 'purple' },
          { label: 'Occupancy', value: `${stats?.occupancyRate || 0}%`, color: 'orange' }
        ]}
      />
      {/* Welcome Section - Redesigned */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Card */}
        <div className="lg:col-span-2 app-gradient rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {user?.organizationId?.logo ? (
                  <img src={user.organizationId.logo} alt="Logo" className="w-12 h-12 rounded-xl" />
                ) : (
                  <Building2 size={32} className="text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.organizationId?.name || `${user?.name}'s Properties`}
                </h1>
                <p className="text-white/80">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-white/80 text-sm">Today's Revenue</p>
                <p className="text-2xl font-bold">{currency}{stats?.todayRevenue?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-white/80 text-sm">Active Properties</p>
                <p className="text-2xl font-bold">{stats?.totalProperties || 0}</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />
        </div>
        
        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="app-surface rounded-2xl p-6 border border-app-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Occupancy Rate</span>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-text-primary">{stats?.occupancyRate || '0%'}</p>
          </div>
          <div className="app-surface rounded-2xl p-6 border border-app-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Monthly Revenue</span>
              <DollarSign size={16} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-text-primary">{currency}{stats?.monthlyRevenue?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/dashboard/tenants" className="app-surface rounded-2xl p-4 border border-app-border hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats?.activeTenants || 0}</p>
              <p className="text-sm text-text-secondary">Active Tenants</p>
            </div>
          </div>
        </Link>
        
        <Link to="/dashboard/properties" className="app-surface rounded-2xl p-4 border border-app-border hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats?.totalProperties || 0}</p>
              <p className="text-sm text-text-secondary">Properties</p>
            </div>
          </div>
        </Link>
        
        <Link to="/dashboard/payments" className="app-surface rounded-2xl p-4 border border-app-border hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats?.totalPayments || 0}</p>
              <p className="text-sm text-text-secondary">Payments</p>
            </div>
          </div>
        </Link>
        
        <Link to="/dashboard/maintenance" className="app-surface rounded-2xl p-4 border border-app-border hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats?.pendingMaintenance || 0}</p>
              <p className="text-sm text-text-secondary">Maintenance</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-8 h-8 app-gradient rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              {t('dashboard.financials_chart_title')}
            </h2>
            <ActionButtons
              onExport={() => setShowExportModal(true)}
              onPrint={() => window.print()}
              showDelete={false}
              showShare={true}
            />
          </div>
          <div onClick={() => navigate('/dashboard/cashflow')} className="cursor-pointer">
            <FinancialChart data={financialData || []} />
          </div>
        </div>
        
        <div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="app-surface rounded-3xl p-8 border border-app-border touch-feedback"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-8 h-8 app-gradient rounded-lg flex items-center justify-center">
                <AlertCircle size={16} className="text-white" />
              </div>
              {t('dashboard.rent_status_chart_title')}
            </h2>
            <ActionButtons
              onExport={() => setShowExportModal(true)}
              onPrint={() => window.print()}
              showDelete={false}
              showShare={true}
            />
          </div>
          <div onClick={() => navigate('/dashboard/payments')} className="cursor-pointer">
            <RentStatusChart data={rentStatusData || []} />
          </div>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-16 h-16 app-gradient rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all"
          >
            <Plus size={24} className={showQuickActions ? 'rotate-45' : ''} style={{ transition: 'transform 0.3s' }} />
          </button>
          
          {showQuickActions && (
            <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border border-app-border p-4 w-80">
              <h3 className="font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Building2, label: 'Property', action: () => setShowAddPropertyModal(true), color: 'bg-blue-500' },
                  { icon: Users, label: 'Tenant', action: () => setShowAddTenantModal(true), color: 'bg-green-500' },
                  { icon: DollarSign, label: 'Payment', action: () => setShowRecordPaymentModal(true), color: 'bg-purple-500' },
                  { icon: FileText, label: 'Expense', action: () => setShowRecordExpenseModal(true), color: 'bg-red-500' },
                  { icon: Wrench, label: 'Maintenance', action: () => setShowRecordMaintenanceModal(true), color: 'bg-orange-500' },
                  { icon: Download, label: 'Export', action: () => setShowExportModal(true), color: 'bg-indigo-500' },
                  { icon: CreditCard, label: 'Cash', action: () => setShowCashHandoverModal(true), color: 'bg-teal-500' },
                  { icon: Banknote, label: 'Transfer', action: () => setShowBankTransferModal(true), color: 'bg-cyan-500' },
                  { icon: Wallet, label: 'Collection', action: () => setShowManualCollectionModal(true), color: 'bg-pink-500' }
                ].map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setShowQuickActions(false); }}
                    className={`${item.color} text-white p-3 rounded-xl flex flex-col items-center gap-1 hover:scale-105 transition-all text-center`}
                  >
                    <item.icon size={16} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div 
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
        </div>
        
        <div 
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
        </div>
      </div>
      </div>
      
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
      
      <AddReminderModal
        isOpen={showRecordReminderModal}
        onClose={() => setShowRecordReminderModal(false)}
      />
      
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