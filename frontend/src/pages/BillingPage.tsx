import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { CheckCircle, CreditCard, ShoppingCart } from 'lucide-react';

// Fetch function for React Query
const fetchBillingInfo = async () => {
  const { data } = await apiClient.get("/billing");
  return data.data;
};

const BillingPage: React.FC = () => {
  const { data: billingInfo, isLoading, isError } = useQuery({
      queryKey: ['billingInfo'], 
      queryFn: fetchBillingInfo
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusChip = (status?: string) => {
      if (!status) return null;
      const baseClasses = 'px-3 py-1 text-sm font-bold rounded-full capitalize';
      switch(status) {
          case 'active':
            return <div className={`${baseClasses} bg-green-500/20 text-green-300`}>Active</div>;
          case 'trialing':
            return <div className={`${baseClasses} bg-sky-500/20 text-sky-300`}>Trial</div>;
          case 'canceled':
          case 'past_due':
            return <div className={`${baseClasses} bg-red-500/20 text-red-300`}>{status.replace('_', ' ')}</div>;
          default:
            return <div className={`${baseClasses} bg-slate-600/50 text-slate-400`}>{status}</div>;
      }
  };

  if (isLoading) return <div className="text-white text-center p-8">Loading Billing Information...</div>;
  if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch billing information.</div>;

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-8">Billing & Subscription</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Details */}
        <div className="lg:col-span-2 bg-slate-800/70 p-8 rounded-2xl shadow-lg border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-1">Your Current Plan</h2>
          <p className="text-slate-400 mb-6">Manage your subscription and view plan details.</p>
          
          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-3xl font-extrabold text-yellow-400">{billingInfo?.planId?.name}</h3>
                    <p className="text-lg font-mono mt-1 text-slate-300">
                        ${(billingInfo?.planId?.price / 100).toFixed(2)} / {billingInfo?.planId?.duration}
                    </p>
                </div>
                {getStatusChip(billingInfo?.status)}
            </div>
            
            <div className="border-t border-slate-700 my-6"></div>

            <h4 className="font-semibold text-white mb-3">Plan Features:</h4>
            <ul className="space-y-2 text-slate-300">
              {(billingInfo?.planId?.features || []).map((feature: string) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Billing Actions */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-400">Your subscription is currently {billingInfo?.status}.</p>
                <p className="font-semibold text-white mt-1">
                    {billingInfo?.status === 'trialing' ? 'Your trial expires on:' : 'Your plan renews on:'}
                </p>
                <p className="text-2xl font-bold font-mono text-cyan-400">
                    {formatDate(billingInfo?.status === 'trialing' ? billingInfo?.trialExpiresAt : billingInfo?.currentPeriodEndsAt)}
                </p>
            </div>
             <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700">
                <button className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors">
                  <CreditCard />
                  Manage Subscription
                </button>
                 <p className="text-xs text-slate-500 mt-3 text-center">You will be redirected to our payment partner to manage your subscription.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default BillingPage;
