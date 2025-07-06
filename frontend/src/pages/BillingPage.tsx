import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, AlertTriangle, RefreshCw } from 'lucide-react';
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

  const { data: currentSubscription } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me');
      return data.data?.subscription;
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await apiClient.put('/billing/subscription', {
        planId,
        status: 'active'
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      alert('Subscription updated successfully!');
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update subscription');
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

  const getSubscriptionStatus = () => {
    if (!currentSubscription) return 'No active subscription';
    
    if (currentSubscription.status === 'canceled') return 'Canceled';
    if (currentSubscription.status === 'past_due') return 'Payment Overdue';
    if (currentSubscription.trialExpiresAt && new Date(currentSubscription.trialExpiresAt) < new Date()) {
      return 'Trial Expired';
    }
    return currentSubscription.status;
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

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 p-6 bg-app-surface rounded-3xl border border-app-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Plan</p>
              <p className="font-semibold">{currentSubscription.planId?.name || 'Free Trial'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                currentSubscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {getSubscriptionStatus()}
              </span>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Next Billing</p>
              <p className="font-semibold">
                {currentSubscription.nextBillingDate 
                  ? new Date(currentSubscription.nextBillingDate).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
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
              disabled={isProcessing || currentSubscription?.planId?._id === plan._id}
              className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all ${
                currentSubscription?.planId?._id === plan._id
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'btn-gradient hover:shadow-lg disabled:opacity-50'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  Processing...
                </div>
              ) : currentSubscription?.planId?._id === plan._id ? (
                'Current Plan'
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
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">
                  {currentSubscription?.paymentMethod || 'No payment method on file'}
                </span>
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
      </div>
    </motion.div>
  );
};

export default BillingPage;