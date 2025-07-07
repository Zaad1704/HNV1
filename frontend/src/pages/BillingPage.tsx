import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

const BillingPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ['availablePlans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/public/plans');
      return data.data || [];
    }
  });

  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me');
      return data.data;
    }
  });
  
  const currentSubscription = userData?.subscription;
  const organization = userData?.organization;

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await apiClient.put('/billing/change-plan', { planId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert('Subscription updated successfully!');
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update subscription');
    }
  });
  
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/billing/cancel');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert('Subscription will be cancelled at the end of current period');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to cancel subscription');
    }
  });

  const handleSubscribe = async (planId: string) => {
    if (!planId) return;
    
    setIsProcessing(true);
    try {
      await updateSubscriptionMutation.mutateAsync(planId);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await cancelSubscriptionMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!currentSubscription) return 'No active subscription';
    
    // Check organization status first (super admin actions)
    if (organization?.status === 'inactive') return 'Organization Deactivated';
    if (organization?.status === 'pending_deletion') return 'Organization Pending Deletion';
    
    // Check subscription status
    if (currentSubscription.status === 'canceled') return 'Canceled';
    if (currentSubscription.status === 'past_due') return 'Payment Overdue';
    if (currentSubscription.status === 'inactive') return 'Inactive';
    if (currentSubscription.status === 'expired') return 'Expired';
    if (currentSubscription.trialExpiresAt && new Date(currentSubscription.trialExpiresAt) < new Date()) {
      return 'Trial Expired';
    }
    if (currentSubscription.currentPeriodEndsAt && new Date(currentSubscription.currentPeriodEndsAt) < new Date() && !currentSubscription.isLifetime) {
      return 'Period Expired';
    }
    
    return currentSubscription.status;
  };
  
  const isRestricted = () => {
    return organization?.status === 'inactive' || 
           ['canceled', 'past_due', 'inactive', 'expired'].includes(currentSubscription?.status) ||
           (currentSubscription?.trialExpiresAt && new Date(currentSubscription.trialExpiresAt) < new Date()) ||
           (currentSubscription?.currentPeriodEndsAt && new Date(currentSubscription.currentPeriodEndsAt) < new Date() && !currentSubscription?.isLifetime);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Billing & Subscription</h1>
        <p className="text-text-secondary">Manage your subscription and billing information</p>
      </div>

      {/* Restriction Warning */}
      {isRestricted() && (
        <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-400 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Access Restricted</h2>
          </div>
          <p className="text-red-700 mb-4">
            {organization?.status === 'inactive' 
              ? 'Your organization has been deactivated by an administrator. Contact support for assistance.'
              : 'Your subscription is inactive. Please reactivate or upgrade your plan to restore full access.'
            }
          </p>
          {organization?.status !== 'inactive' && (
            <p className="text-red-600 text-sm">
              You can still view your dashboard but cannot access full features until reactivated.
            </p>
          )}
        </div>
      )}

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 p-6 bg-app-surface rounded-3xl border border-app-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Plan</p>
              <p className="font-semibold">{currentSubscription.planId?.name || 'Free Trial'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                currentSubscription.status === 'active' && !isRestricted() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {getSubscriptionStatus()}
              </span>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Next Billing</p>
              <p className="font-semibold">
                {currentSubscription.isLifetime ? 'Lifetime Access' :
                 currentSubscription.nextBillingDate 
                  ? new Date(currentSubscription.nextBillingDate).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Period Ends</p>
              <p className="font-semibold">
                {currentSubscription.currentPeriodEndsAt 
                  ? new Date(currentSubscription.currentPeriodEndsAt).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
          
          {/* Subscription Actions */}
          {currentSubscription.status === 'active' && !currentSubscription.cancelAtPeriodEnd && (
            <div className="mt-4 pt-4 border-t border-app-border">
              <button
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </div>
          )}
          
          {currentSubscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 text-sm">
                Your subscription is scheduled for cancellation at the end of the current period.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border-2 transition-all ${
              currentSubscription?.planId?._id === plan._id
                ? 'border-green-500 bg-green-50'
                : 'border-app-border bg-app-surface hover:border-brand-blue'
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-brand-blue">${plan.price / 100}</span>
                <span className="text-text-secondary">/{plan.duration}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features?.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan._id)}
              disabled={isProcessing || (currentSubscription?.planId?._id === plan._id && !isRestricted()) || organization?.status === 'inactive'}
              className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all ${
                organization?.status === 'inactive'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : currentSubscription?.planId?._id === plan._id && !isRestricted()
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'btn-gradient hover:shadow-lg disabled:opacity-50'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  Processing...
                </div>
              ) : organization?.status === 'inactive' ? (
                'Contact Support'
              ) : currentSubscription?.planId?._id === plan._id && !isRestricted() ? (
                'Current Plan'
              ) : isRestricted() && currentSubscription?.planId?._id === plan._id ? (
                'Reactivate Plan'
              ) : (
                'Select Plan'
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Billing Information */}
      <div className="mt-8 p-6 bg-app-surface rounded-3xl border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Billing Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Payment Method
            </label>
            <div className="p-3 border border-app-border rounded-xl bg-app-bg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    {currentSubscription?.paymentMethod || 'No payment method on file'}
                  </span>
                </div>
                <button className="text-xs text-brand-blue hover:underline">
                  Update
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Billing Email
            </label>
            <div className="p-3 border border-app-border rounded-xl bg-app-bg">
              <span className="text-sm text-text-secondary">{user?.email}</span>
            </div>
          </div>
        </div>
        
        {/* Billing Summary */}
        <div className="mt-6 pt-6 border-t border-app-border">
          <h3 className="font-semibold text-text-primary mb-3">Billing Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Current Plan</span>
              <span className="font-medium">{currentSubscription?.planId?.name || 'Free Trial'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Amount</span>
              <span className="font-medium">${(currentSubscription?.amount || 0) / 100}/{currentSubscription?.billingCycle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Last Payment</span>
              <span className="font-medium">
                {currentSubscription?.lastPaymentDate 
                  ? new Date(currentSubscription.lastPaymentDate).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Billing History */}
      <div className="mt-8 p-6 bg-app-surface rounded-3xl border border-app-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Billing History</h2>
          <button className="flex items-center gap-2 text-sm text-brand-blue hover:underline">
            <Download size={16} />
            Download All
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Mock billing history - replace with real data */}
          {currentSubscription?.lastPaymentDate && (
            <div className="flex items-center justify-between p-3 border border-app-border rounded-xl">
              <div>
                <p className="font-medium text-text-primary">
                  {currentSubscription.planId?.name || 'Subscription'}
                </p>
                <p className="text-sm text-text-secondary">
                  {new Date(currentSubscription.lastPaymentDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-text-primary">
                  ${(currentSubscription.amount || 0) / 100}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Paid
                  </span>
                  <button className="text-xs text-brand-blue hover:underline">
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!currentSubscription?.lastPaymentDate && (
            <div className="text-center py-8 text-text-secondary">
              <p>No billing history available</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BillingPage;