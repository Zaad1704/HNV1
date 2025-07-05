import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import { useCurrency } from '../contexts/CurrencyContext';

const fetchBilling = async () => {
  try {
    const { data } = await apiClient.get('/billing/subscription');
    return data.data || {};
  } catch (error) {
    console.error('Failed to fetch billing:', error);
    return {};
  }
};

const fetchInvoices = async () => {
  try {
    const { data } = await apiClient.get('/billing/invoices');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return [];
  }
};

const BillingPage = () => {
  const { currency } = useCurrency();
  
  const { data: subscription = {}, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchBilling,
    retry: 1
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    retry: 1
  });

  if (subLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading billing...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Billing</h1>
        <p className="text-text-secondary mt-1">Manage subscription and billing</p>
      </div>

      {/* Current Subscription */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Current Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CreditCard size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              {subscription.planName || 'Free Trial'}
            </h3>
            <p className="text-text-secondary">
              {currency}{subscription.amount || '0'}/month
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
              subscription.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              {subscription.status === 'active' ? 
                <CheckCircle size={32} className="text-white" /> :
                <AlertCircle size={32} className="text-white" />
              }
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              {subscription.status === 'active' ? 'Active' : 'Trial'}
            </h3>
            <p className="text-text-secondary">
              {subscription.status || 'Status'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              Next Billing
            </h3>
            <p className="text-text-secondary">
              {subscription.nextBilling ? 
                new Date(subscription.nextBilling).toLocaleDateString() : 
                'No date set'
              }
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button className="btn-gradient px-6 py-3 rounded-xl font-semibold">
            Upgrade Plan
          </button>
          <button className="px-6 py-3 border border-app-border rounded-xl font-semibold text-text-secondary">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Billing History</h2>
        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((invoice: any, index: number) => (
              <motion.div
                key={invoice._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-app-bg rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 app-gradient rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {currency}{invoice.amount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {invoice.description || 'Monthly subscription'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status || 'paid'}
                  </span>
                  <p className="text-xs text-text-secondary mt-1">
                    {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary">No billing history available.</p>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="app-surface rounded-3xl p-6 border border-app-border text-center">
          <h3 className="text-lg font-bold text-text-primary mb-2">Properties</h3>
          <p className="text-3xl font-bold text-brand-blue">
            {subscription.usage?.properties || 0}
          </p>
          <p className="text-text-secondary text-sm">
            of {subscription.limits?.properties || '∞'} allowed
          </p>
        </div>
        
        <div className="app-surface rounded-3xl p-6 border border-app-border text-center">
          <h3 className="text-lg font-bold text-text-primary mb-2">Users</h3>
          <p className="text-3xl font-bold text-brand-orange">
            {subscription.usage?.users || 0}
          </p>
          <p className="text-text-secondary text-sm">
            of {subscription.limits?.users || '∞'} allowed
          </p>
        </div>
        
        <div className="app-surface rounded-3xl p-6 border border-app-border text-center">
          <h3 className="text-lg font-bold text-text-primary mb-2">Storage</h3>
          <p className="text-3xl font-bold text-brand-blue">
            {subscription.usage?.storage || '0'} GB
          </p>
          <p className="text-text-secondary text-sm">
            of {subscription.limits?.storage || '∞'} GB allowed
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BillingPage;