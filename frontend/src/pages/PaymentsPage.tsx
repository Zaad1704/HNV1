import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Plus, DollarSign, Calendar, User, Download, Building2, Users, FileText } from 'lucide-react';
import LazyLoader from '../components/common/LazyLoader';
import SkeletonLoader from '../components/common/SkeletonLoader';
import SwipeableCard from '../components/mobile/SwipeableCard';
import { useBackgroundRefresh } from '../hooks/useBackgroundRefresh';
import UniversalHeader from '../components/common/UniversalHeader';
import UniversalActionButton from '../components/common/UniversalActionButton';
import UniversalCard from '../components/common/UniversalCard';
import UniversalStatusBadge from '../components/common/UniversalStatusBadge';
import { useCrossData } from '../hooks/useCrossData';
import apiClient from '../api/client';
import { useCurrency } from '../contexts/CurrencyContext';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import ManualPaymentModal from '../components/common/ManualPaymentModal';
import BulkPaymentModal from '../components/common/BulkPaymentModal';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import MonthlyCollectionSheet from '../components/common/MonthlyCollectionSheet';
import AgentHandoverModal from '../components/common/AgentHandoverModal';
import MessageButtons from '../components/common/MessageButtons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { deletePayment, confirmDelete, handleDeleteError, handleDeleteSuccess } from '../utils/deleteHelpers';

const fetchPayments = async (propertyId?: string) => {
  try {
    const url = propertyId ? `/payments?propertyId=${propertyId}` : '/payments';
    const { data } = await apiClient.get(url);
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [];
  }
};

const PaymentsPage = () => {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkPayment, setShowBulkPayment] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showAgentHandover, setShowAgentHandover] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', propertyId],
    queryFn: () => fetchPayments(propertyId || undefined),
    retry: 1
  });

  const handlePaymentAdded = (newPayment: any) => {
    queryClient.setQueryData(['payments'], (old: any) => [...(old || []), newPayment]);
  };

  const handleDeletePayment = async (paymentId: string, amount: number) => {
    if (confirmDelete(`${currency}${amount}`, 'payment')) {
      try {
        await deletePayment(paymentId);
        queryClient.setQueryData(['payments'], (old: any) => 
          (old || []).filter((p: any) => p._id !== paymentId)
        );
        handleDeleteSuccess('payment');
      } catch (error: any) {
        handleDeleteError(error, 'payment');
      }
    }
  };

  // Background refresh
  useBackgroundRefresh([['payments']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={8} />;
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Payments"
        subtitle={propertyId ? `Payments for selected property (${payments.length} payments)` : `Track and manage rent payments (${payments.length} payments)`}
        icon={CreditCard}
        stats={[
          { label: 'Total', value: payments.length, color: 'blue' },
          { label: 'This Month', value: payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).length, color: 'green' },
          { label: 'Amount', value: `$${stats?.totalIncome?.toLocaleString() || 0}`, color: 'purple' },
          { label: 'Completed', value: payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length, color: 'green' }
        ]}
        actions={
          <>
            <UniversalActionButton variant="secondary" size="sm" icon={Building2} onClick={() => setShowBulkPayment(true)}>Bulk Payment</UniversalActionButton>
            <UniversalActionButton variant="success" size="sm" icon={Users} onClick={() => setShowQuickPayment(true)}>Quick Payment</UniversalActionButton>
            <UniversalActionButton variant="warning" size="sm" icon={FileText} onClick={() => setShowCollectionSheet(true)}>Collection Sheet</UniversalActionButton>
            <UniversalActionButton variant="success" size="sm" icon={Download} onClick={() => setShowExport(true)}>Export</UniversalActionButton>
            <UniversalActionButton variant="primary" icon={DollarSign} onClick={() => setShowAddModal(true)}>Payment Collection</UniversalActionButton>
          </>
        }
      />

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search payments by tenant or property..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'Completed', label: 'Completed' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Failed', label: 'Failed' }
        ]}
      />

      {payments.length > 0 ? (
        <div className="universal-grid universal-grid-4">
          {payments.map((payment: any, index: number) => (
            <LazyLoader key={payment._id}>
              <div className="md:hidden">
                <SwipeableCard
                  onDelete={() => handleDeletePayment(payment._id, payment.amount)}
                  onView={() => window.open(`/dashboard/payments/${payment._id}`, '_blank')}
                >
                  <UniversalCard delay={index * 0.1} gradient="green">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="w-14 h-14 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <DollarSign size={24} className="text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                  payment.status === 'Completed' || payment.status === 'Paid'
                    ? 'bg-green-100/90 text-green-800' 
                    : payment.status === 'Failed'
                    ? 'bg-red-100/90 text-red-800'
                    : 'bg-yellow-100/90 text-yellow-800'
                }`}>
                  {payment.status || 'Pending'}
                </span>
              </div>
              
              <div className="relative z-10 mb-4">
                <h3 className="text-2xl font-bold text-text-primary group-hover:text-brand-blue transition-colors duration-300">
                  {currency}{payment.amount?.toLocaleString() || '0'}
                </h3>
                {payment.originalAmount && payment.originalAmount !== payment.amount && (
                  <p className="text-sm text-green-600 font-medium">
                    Original: {currency}{payment.originalAmount} (Discount Applied)
                  </p>
                )}
              </div>
              
              <div className="relative z-10 bg-app-bg/50 rounded-2xl p-4 space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-text-primary font-medium truncate">
                    {payment.tenantId?.name || 'Unknown Tenant'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar size={14} className="text-green-600" />
                  </div>
                  <span className="text-sm text-text-primary font-medium">
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'No date'}
                  </span>
                </div>
                {payment.paymentMethod && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm text-text-primary font-medium">
                      {payment.paymentMethod}
                    </span>
                  </div>
                )}
                {payment.collectionMethod && payment.collectionMethod.includes('agent') && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users size={14} className="text-orange-600" />
                    </div>
                    <span className="text-sm text-text-primary font-medium">
                      {payment.agentName ? `Agent: ${payment.agentName}` : 'Agent Collection'}
                    </span>
                  </div>
                )}
                {payment.referenceNumber && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText size={14} className="text-gray-600" />
                    </div>
                    <span className="text-sm text-text-primary font-medium">
                      Ref: {payment.referenceNumber}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="relative z-10 flex gap-2">
                <button 
                  onClick={() => handleDeletePayment(payment._id, payment.amount)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-2 rounded-xl text-xs font-medium transition-colors border border-red-200"
                  title="Delete Payment"
                >
                  🗑️
                </button>
                <div className="flex-1">
                  <MessageButtons
                    phone={payment.tenantId?.phone}
                    email={payment.tenantId?.email}
                    name={payment.tenantId?.name}
                    messageType="paymentConfirmation"
                    additionalData={{
                      amount: payment.amount,
                      date: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Today'
                    }}
                  />
                </div>
              </div>
                  </UniversalCard>
                </SwipeableCard>
              </div>
              <div className="hidden md:block">
                <UniversalCard delay={index * 0.1} gradient="green">
                  {/* Same content as mobile but without swipe */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="w-14 h-14 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <DollarSign size={24} className="text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                      payment.status === 'Completed' || payment.status === 'Paid'
                        ? 'bg-green-100/90 text-green-800' 
                        : payment.status === 'Failed'
                        ? 'bg-red-100/90 text-red-800'
                        : 'bg-yellow-100/90 text-yellow-800'
                    }`}>
                      {payment.status || 'Pending'}
                    </span>
                  </div>
                  <div className="relative z-10 mb-4">
                    <h3 className="text-2xl font-bold text-text-primary group-hover:text-brand-blue transition-colors duration-300">
                      {currency}{payment.amount?.toLocaleString() || '0'}
                    </h3>
                  </div>
                </UniversalCard>
              </div>
            </LazyLoader>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="relative">
            <div className="w-32 h-32 gradient-dark-orange-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CreditCard size={64} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <DollarSign size={16} className="text-yellow-900" />
            </div>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
            No Payments Yet
          </h3>
          <p className="text-text-secondary mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            Start tracking your rental income by recording payments. Use bulk payment for multiple tenants or quick payment for individual transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowBulkPayment(true)}
              className="group relative bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-3xl font-bold text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Building2 size={20} />
              Bulk Payment
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="group relative btn-gradient px-8 py-4 rounded-3xl font-bold text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <DollarSign size={20} />
              Manual Payment
            </button>
          </div>
        </div>
      )}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={payments}
        filename="payments"
        filters={searchFilters}
        title="Export Payments"
      />

      <ManualPaymentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPaymentAdded={handlePaymentAdded}
      />
      
      <BulkPaymentModal
        isOpen={showBulkPayment}
        onClose={() => setShowBulkPayment(false)}
      />
      
      <QuickPaymentModal
        isOpen={showQuickPayment}
        onClose={() => setShowQuickPayment(false)}
      />
      
      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
      />
      
      <AgentHandoverModal
        isOpen={showAgentHandover}
        onClose={() => setShowAgentHandover(false)}
        onHandoverRecorded={(handover) => {
          // Refresh payments or handle handover record
          console.log('Agent handover recorded:', handover);
        }}
      />
      
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-16 h-16 gradient-dark-orange-blue rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
        >
          <DollarSign size={24} className="text-white group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-orange/5 to-brand-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/3 to-pink-500/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PaymentsPage;