import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Plus, DollarSign, Calendar, User } from 'lucide-react';
import apiClient from '../api/client';
import { useCurrency } from '../contexts/CurrencyContext';

const fetchPayments = async () => {
  try {
    const { data } = await apiClient.get('/payments');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [];
  }
};

const PaymentsPage = () => {
  const { currency } = useCurrency();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading payments...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Payments</h1>
          <p className="text-text-secondary mt-1">Track and manage rent payments</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Record Payment
        </button>
      </div>

      {payments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment: any, index: number) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  payment.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {payment.status || 'Pending'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {currency}{payment.amount?.toLocaleString() || '0'}
              </h3>
              
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{payment.tenantId?.name || 'Unknown Tenant'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{payment.date ? new Date(payment.date).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CreditCard size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Payments Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Start tracking payments by recording your first payment.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Record First Payment
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentsPage;