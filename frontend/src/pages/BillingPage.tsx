import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { CheckCircle, CreditCard, ShoppingCart } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext'; // NEW: Import useLang

const fetchBillingInfo = async () => {
  const { data } = await apiClient.get("/billing");
  return data.data;
};

const BillingPage: React.FC = () => {
  const { currencyName } = useLang(); // NEW: Get currencyName
  const { data: billingInfo, isLoading, isError } = useQuery({
      queryKey: ['billingInfo'], 
      queryFn: fetchBillingInfo
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const getStatusChip = (status?: string) => {
      if (!status) return null;
      const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full capitalize';
      switch(status) {
          case 'active': return <div className={`${baseClasses} bg-green-100 text-green-800`}>Active</div>;
          case 'trialing': return <div className={`${baseClasses} bg-blue-100 text-blue-800`}>Trial</div>;
          case 'canceled':
          case 'past_due':
            return <div className={`${baseClasses} bg-red-100 text-red-800`}>{status.replace('_', ' ')}</div>;
          default:
            return <div className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</div>;
      }
  };

  if (isLoading) return <div className="text-center p-8">Loading Billing Information...</div>;
  if (isError) return <div className="text-center text-red-500 p-8">Failed to fetch billing information.</div>;

  return (
    <div className="text-dark-text dark:text-dark-text-dark"> {/* Added dark mode class */}
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Details */}
        <div className="lg:col-span-2 bg-light-card p-8 rounded-xl shadow-sm border border-border-color dark:bg-dark-card dark:border-border-color-dark"> {/* Added dark mode classes */}
          <h2 className="text-2xl font-bold text-dark-text mb-1 dark:text-dark-text-dark">Your Current Plan</h2> {/* Added dark mode class */}
          <p className="text-light-text mb-6 dark:text-light-text-dark">Manage your subscription and view plan details.</p> {/* Added dark mode class */}
          
          <div className="bg-brand-bg p-6 rounded-lg border border-border-color dark:bg-dark-bg dark:border-border-color-dark"> {/* Added dark mode classes */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-3xl font-extrabold text-brand-dark dark:text-brand-primary">{billingInfo?.planId?.name}</h3> {/* Added dark mode class */}
                    <p className="text-lg font-mono mt-1 text-light-text dark:text-light-text-dark"> {/* Added dark mode class */}
                        {/* NEW: Display currency based on detected currency */}
                        {currencyName}{(billingInfo?.planId?.price / 100).toFixed(2)} / {billingInfo?.planId?.duration}
                    </p>
                </div>
                {getStatusChip(billingInfo?.status)}
            </div>
            
            <div className="border-t border-border-color my-6 dark:border-border-color-dark"></div> {/* Added dark mode class */}

            <h4 className="font-semibold text-dark-text mb-3 dark:text-dark-text-dark">Plan Features:</h4> {/* Added dark mode class */}
            <ul className="space-y-3 text-light-text dark:text-light-text-dark"> {/* Added dark mode class */}
              {(billingInfo?.planId?.features || []).map((feature: string) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Billing Actions */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-light-card p-6 rounded-xl border border-border-color dark:bg-dark-card dark:border-border-color-dark"> {/* Added dark mode classes */}
                <p className="text-sm text-light-text dark:text-light-text-dark">Your subscription is currently {billingInfo?.status}.</p> {/* Added dark mode class */}
                <p className="font-semibold text-dark-text mt-1 dark:text-dark-text-dark"> {/* Added dark mode class */}
                    {billingInfo?.status === 'trialing' ? 'Your trial expires on:' : 'Your plan renews on:'}
                </p>
                <p className="text-2xl font-bold font-mono text-brand-primary">
                    {formatDate(billingInfo?.status === 'trialing' ? billingInfo?.trialExpiresAt : billingInfo?.currentPeriodEndsAt)}
                </p>
            </div>
             <div className="bg-light-card p-6 rounded-xl border border-border-color dark:bg-dark-card dark:border-border-color-dark"> {/* Added dark mode classes */}
                <button className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark transition-colors shadow-md">
                  <CreditCard />
                  Manage Subscription
                </button>
                 <p className="text-xs text-light-text mt-3 text-center dark:text-light-text-dark">You will be redirected to our payment partner to manage your subscription.</p> {/* Added dark mode class */}
            </div>
        </div>

      </div>
    </div>
  );
};

export default BillingPage;
