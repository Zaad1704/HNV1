import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { CheckCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchBillingInfo = async () => {
  const { data } = await apiClient.get("/billing");
  return data.data;
};

const BillingPage: React.FC = () => {
  const { data: billingInfo, isLoading, isError, error } = useQuery({
      queryKey: ['billingInfo'],
      queryFn: fetchBillingInfo,
      retry: false
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusChip = (status?: string) => {
      if (!status) return null;
      const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full capitalize';
      const statusMap = {
          active: `${baseClasses} bg-green-500/20 text-green-300`,
          trialing: `${baseClasses} bg-blue-500/20 text-blue-300`,
          canceled: `${baseClasses} bg-red-500/20 text-red-400`,
          past_due: `${baseClasses} bg-yellow-500/20 text-yellow-300`,
      };
      return statusMap[status as keyof typeof statusMap] || `${baseClasses} bg-gray-500/20 text-gray-300`;
  };

  if (isLoading) return <div className="text-center p-8 text-dark-text">Loading Billing Information...</div>;
  
  if (isError) return <div className="text-center text-red-400 p-8">Error loading subscription details: {(error as Error).message}</div>;

  if (!billingInfo || !billingInfo.planId) {
    return (
        <div className="text-center bg-light-card p-8 rounded-xl border border-border-color">
            <h2 className="text-2xl font-bold text-dark-text">No Active Subscription Found</h2>
            <p className="mt-2 text-light-text">Please subscribe to a plan to unlock all features.</p>
            <Link to="/pricing" className="mt-4 inline-block px-6 py-3 bg-brand-primary text-brand-dark font-bold rounded-lg hover:bg-opacity-90">
                View Plans
            </Link>
        </div>
    );
  }

  return (
    <div className="text-dark-text">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-light-card p-8 rounded-xl shadow-lg border border-border-color">
          <h2 className="text-2xl font-bold text-dark-text mb-1">Your Current Plan</h2>
          <p className="text-light-text mb-6">Manage your subscription and view plan details.</p>
          <div className="bg-dark-bg/50 p-6 rounded-lg border border-border-color">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-extrabold text-brand-primary">{billingInfo.planId.name}</h3>
                <p className="text-lg font-mono mt-1 text-light-text">
                  ${(billingInfo.planId.price / 100).toFixed(2)} / {billingInfo.planId.duration}
                </p>
              </div>
              {getStatusChip(billingInfo.status)}
            </div>
            <div className="border-t border-border-color my-6"></div>
            <h4 className="font-semibold text-dark-text mb-3">Plan Features:</h4>
            <ul className="space-y-3 text-light-text">
              {(billingInfo.planId.features || []).map((feature: string) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-light-card p-6 rounded-xl border border-border-color">
            <p className="text-sm text-light-text">Your subscription is currently {billingInfo.status}.</p>
            <p className="font-semibold text-dark-text mt-1">
              {billingInfo.status === 'trialing' ? 'Your trial expires on:' : 'Your plan renews on:'}
            </p>
            <p className="text-2xl font-bold font-mono text-brand-primary">
              {formatDate(billingInfo.status === 'trialing' ? billingInfo.trialExpiresAt : billingInfo.currentPeriodEndsAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
