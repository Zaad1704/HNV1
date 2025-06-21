// frontend/src/pages/ResubscribePage.tsx
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, ArrowLeftCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; // Needed for logout

// Define interfaces for type safety, mirroring backend models
interface IPlanDisplay {
    _id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
}

interface ISubscriptionDisplay {
    organizationId: string; // Could be populated organization object if needed
    planId: IPlanDisplay; // Populated plan object
    status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due';
    isLifetime: boolean;
    trialExpiresAt?: string;
    currentPeriodEndsAt?: string;
}

const fetchBillingDetails = async (): Promise<ISubscriptionDisplay> => {
    const { data } = await apiClient.get('/billing');
    return data.data;
};

const createCheckoutSession = async (planId: string): Promise<string> => {
    const { data } = await apiClient.post('/billing/create-checkout-session', { planId });
    return data.redirectUrl;
};

const ResubscribePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialStatus = searchParams.get('status') || 'inactive';
    const { logout } = useAuthStore();

    const { data: billingInfo, isLoading, isError, error } = useQuery<ISubscriptionDisplay, Error>({
        queryKey: ['userBillingInfoResubscribe'],
        queryFn: fetchBillingDetails,
        // Only enable this query if a token is likely present.
        // If App.tsx logs out due to 401, this won't run or will fail with 401.
        retry: false, // Do not retry on failure, handle errors immediately
        staleTime: Infinity, // Data on this page doesn't need to refetch often
    });

    const reactivateMutation = useMutation({
        mutationFn: (planId: string) => createCheckoutSession(planId),
        onSuccess: (redirectUrl) => {
            // After successful initiation, redirect user to the payment gateway
            window.location.href = redirectUrl;
        },
        onError: (err: any) => {
            alert(`Failed to initiate checkout: ${err.response?.data?.message || 'Please try again.'}`);
        }
    });

    const handleReactivate = () => {
        // Ensure billingInfo and planId are available before attempting mutation
        if (billingInfo?.planId?._id) {
            reactivateMutation.mutate(billingInfo.planId._id);
        } else {
            // Fallback if plan data is missing
            alert('Could not retrieve plan information for reactivation. Please contact support.');
        }
    };

    const handleGoBackToLogin = () => {
        logout(); // Clear session to effectively log out
        navigate('/login', { replace: true });
    };

    // --- Loading State ---
    if (isLoading) {
        return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-dark-text">Loading subscription details...</div>;
    }

    // --- Error State (from useQuery fetch) ---
    // This catches network errors, 401s, 500s from the /billing endpoint
    if (isError) {
         return (
            <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center p-4">
                <div className="text-center bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                    <h1 className="text-3xl font-bold text-red-400 mb-4">Access Issue</h1>
                    <p className="text-slate-300 text-lg mb-8">We encountered an issue fetching your subscription details: {error?.message || 'Unknown error'}.</p>
                    <p className="text-slate-300 text-sm mb-8">This might be due to an invalid session. Please try logging in again.</p>
                    <button onClick={handleGoBackToLogin} className="px-6 py-3 bg-slate-700 font-semibold rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2 mx-auto">
                        <ArrowLeftCircle size={20} /> Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // --- No Billing Info Found State (e.g., 404 from /billing, or empty data) ---
    // If billingInfo is null/undefined after loading and no specific error
    if (!billingInfo) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center p-4">
                <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
                    <h1 className="text-3xl font-bold text-yellow-400 mb-4">No Subscription Found</h1>
                    <p className="text-slate-300 text-lg mb-8">It looks like your account doesn't have an associated subscription. Please contact support or choose a new plan.</p>
                    <button onClick={handleGoBackToLogin} className="w-full mt-4 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <ArrowLeftCircle size={20} /> Go Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // --- Main Content for Resubscribe Page (when billingInfo is successfully loaded) ---
    return (
        <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center p-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h1 className="text-3xl font-bold text-center mb-2">Your Account Is {initialStatus.replace('_', ' ').toUpperCase()}</h1>
                <p className="text-slate-400 text-center mb-6">
                    To regain full access to your dashboard, please reactivate your subscription.
                </p>

                <div className="bg-slate-700/50 p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-bold text-yellow-400">{billingInfo.planId?.name || 'N/A'} Plan</h2> {/* Use optional chaining */}
                    <p className="text-lg font-mono text-slate-300 mt-2">
                        ${(billingInfo.planId?.price / 100)?.toFixed(2) || '0.00'} / {billingInfo.planId?.duration || 'N/A'} {/* Use optional chaining */}
                    </p>
                    <ul className="text-slate-300 space-y-2 mt-4 text-sm">
                        {(billingInfo.planId?.features || []).map((feature: string) => ( // Use optional chaining
                            <li key={feature} className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={handleReactivate}
                    disabled={reactivateMutation.isLoading}
                    className="w-full py-3 bg-cyan-600 font-semibold rounded-lg hover:bg-cyan-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <CreditCard size={20} /> {reactivateMutation.isLoading ? 'Redirecting to Payment...' : 'Reactivate Subscription'}
                </button>
                <button
                    onClick={handleGoBackToLogin}
                    className="w-full mt-4 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeftCircle size={20} /> Cancel and Go Back
                </button>
            </div>
        </div>
    );
};

export default ResubscribePage;
