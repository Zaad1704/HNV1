// frontend/src/pages/BillingPage.tsx

import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query'; // Import useMutation
import apiClient from '../api/client';
import { CheckCircle, CreditCard } from 'lucide-react';

const fetchBillingInfo = async () => {
  const { data } = await apiClient.get("/billing");
  return data.data;
};

// FIX: Added a mutation function to create a checkout session.
const createCheckoutSession = async (planId: string): Promise<string> => {
    const { data } = await apiClient.post('/billing/create-checkout-session', { planId });
    return data.redirectUrl;
};

const BillingPage: React.FC = () => {
  const { data: billingInfo, isLoading, isError } = useQuery({
      queryKey: ['billingInfo'], 
      queryFn: fetchBillingInfo
  });

  // FIX: Added the mutation hook to handle the button click.
  const manageSubscriptionMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (redirectUrl) => {
        if (redirectUrl) {
            // Redirect the user to the payment provider's page.
            window.location.href = redirectUrl;
        }
    },
    onError: (err: any) => {
        alert(`Failed to open subscription management: ${err.response?.data?.message || 'Please try again.'}`);
    }
  });

  const handleManageSubscription = () => {
    if (billingInfo?.planId?._id) {
        manageSubscriptionMutation.mutate(billingInfo.planId._id);
    } else {
        alert("Current plan information is not available. Cannot manage subscription.");
    }
  };

  const formatDate = (dateString?: string) => { /* ... no change ... */ };
  const getStatusChip = (status?: string) => { /* ... no change ... */ };

  if (isLoading) return <div className="text-center p-8">Loading Billing Information...</div>;
  if (isError) return <div className="text-center text-red-500 p-8">Failed to fetch billing information.</div>;

  return (
    <div className="text-dark-text dark:text-dark-text-dark">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Details */}
        <div className="lg:col-span-2 bg-light-card p-8 rounded-xl shadow-sm border border-border-color dark:bg-dark-card dark:border-border-color-dark">
            {/* ... content remains the same ... */}
        </div>

        {/* Billing Actions */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-light-card p-6 rounded-xl border border-border-color dark:bg-dark-card dark:border-border-color-dark">
                 {/* ... content remains the same ... */}
            </div>
             <div className="bg-light-card p-6 rounded-xl border border-border-color dark:bg-dark-card dark:border-border-color-dark">
                {/* FIX: Added onClick handler and disabled state to the button */}
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
