import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { CheckCircle, CreditCard } from 'lucide-react';

const fetchBillingInfo = async () => {
  const { data } = await apiClient.get("/billing");
  return data.data;
};

const createCheckoutSession = async (planId: string): Promise<string> => {
    const { data } = await apiClient.post('/billing/create-checkout-session', { planId });
    return data.redirectUrl;
};

const BillingPage: React.FC = () => {
  const { data: billingInfo, isLoading, isError } = useQuery({
      queryKey: ['billingInfo'], 
      queryFn: fetchBillingInfo
  });

  const manageSubscriptionMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (redirectUrl) => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    },
    onError: (err: any) => {
        alert(`Failed to open subscription management: ${err.response?.data?.message || 'Please try again.'}`);
    }
  });

  const handleManageSubscription = () => {
      // Use the active planId from billingInfo to manage the subscription
      const planId = billingInfo?.planId?._id;
      if (planId) {
          manageSubscriptionMutation.mutate(planId);
      } else {
          // If no plan, redirect to the main pricing page to choose a new one.
          // This requires a new route in your App.tsx, e.g., <Route path="/pricing" element={<PricingPage />} />
          // For now, we'll alert the user.
          alert("No active plan found. Please contact support or choose a new plan.");
          // navigate('/pricing'); // Or navigate to a pricing page
      }
  };

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
  if (isError) return <div className="text-center text-red-500 p-8">Could not find an active subscription for your account. Please contact support.</div>;

  // FIX: Added a check to handle cases where billingInfo exists but the planId is missing or not populated.
  if (!billingInfo || !billingInfo.planId) {
    return (
        <div className="text-center text-amber-600 bg-amber-50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold">Plan Information Missing</h2>
            <p className="mt-2">Your account has a subscription, but the associated plan details could not be found.</p>
            <p className="mt-1">The plan may have been deleted. Please contact support or select a new plan.</p>
        </div>
    );
  }

  return (
    <div className="text-dark-text dark:text-dark-text-dark">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-light-card p-8 rounded-xl shadow-sm border border-border-color dark:bg-dark-card dark:border-border-color-dark">
          <h2 className="text-2xl font-bold text-dark-text mb-1 dark:text-dark-text-dark">Your Current Plan</h2>
          <p className="text-light-text mb-6 dark:text-light-text-dark">Manage your subscription and view plan details.</p>
          
          <div className="bg-brand-bg p-6 rounded-lg border border-border-color dark:bg-dark-bg dark:border-border-color-dark">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-3xl font-extrabold text-brand-dark dark:text-brand-primary">{billingInfo.planId.name}</h3>
                    <p className="text-lg font-mono mt-1 text-light-text dark:text-light-text-dark">
                        ${(billingInfo.planId.price / 100).toFixed(2)} / {billingInfo.planId.duration}
                    </p>
                </div>
                {getStatusChip(billingInfo.status)}
            </div>
            
            <div className="border-t border-border-color my-6 dark:border-border-color-dark"></div>

            <h4 className="font-semibold text-dark-text mb-3 dark:text-dark-text-dark">Plan Features:</h4>
            <ul className="space-y-3 text-light-text dark:text-light-text-dark">
              {(billingInfo.planId.features || []).map((feature: string) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <div className="bg-light-card p-6 rounded-xl border border-border-color dark:bg-dark-card dark:border-border-color-dark">
                <p className="text-sm text-light-text dark:text-light-text-dark">Your subscription is currently {billingInfo.status}.</p>
                <p className="font-semibold text-dark-text mt-1 dark:text-dark-text-dark">
                    {billingInfo.status === 'trialing' ? 'Your trial expires on:' : 'Your plan renews on:'}
                </p>
                <p className="text-2xl font-bold font-mono text-brand-primary">
                    {formatDate(billingInfo.status === 'trialing' ? billingInfo.trialExpiresAt : billingInfo.currentPeriodEndsAt)}
                </p>
            </div>
             <div className="bg-light-card p-6 rounded-xl border border-border-color dark:bg-dark-card dark:border-border-color-dark">
                <button 
                  onClick={handleManageSubscription}
                  disabled={manageSubscriptionMutation.isLoading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark transition-colors shadow-md disabled:opacity-50"
                >
                  <CreditCard />
                  {manageSubscriptionMutation.isLoading ? 'Redirecting...' : 'Manage Subscription'}
                </button>
                 <p className="text-xs text-light-text mt-3 text-center dark:text-light-text-dark">You will be redirected to our payment partner to manage your subscription.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default BillingPage;
