// frontend/src/pages/ResubscribePage.tsx
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, ArrowLeftCircle, ShieldAlert, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { useAuthStore } from '../store/authStore';

// Interfaces for type safety
interface IPlanDisplay {
    _id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
}

interface ISubscriptionDisplay {
    organizationId: string;
    planId: IPlanDisplay;
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
        retry: false, // Do not retry on failure, handle errors immediately
    });

    const reactivateMutation = useMutation({
        mutationFn: (planId: string) => createCheckoutSession(planId),
        onSuccess: (redirectUrl) => {
            window.location.href = redirectUrl;
        },
        onError: (err: any) => {
            alert(`Failed to initiate checkout: ${err.response?.data?.message || 'Please try again.'}`);
        }
    });

    const handleReactivate = () => {
        if (billingInfo?.planId?._id) {
            reactivateMutation.mutate(billingInfo.planId._id);
        } else {
            alert('Could not retrieve your previous plan. Please choose a new plan from our pricing page.');
            navigate('/pricing');
        }
    };

    const handleGoBackToLogin = () => {
        logout();
        navigate('/login', { replace: true });
    };

    if (isLoading) {
        return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-dark-text dark:text-dark-text-dark">Loading subscription details...</div>;
    }

    if (isError || !billingInfo) {
         return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex justify-center items-center p-4 transition-colors duration-300">
                <div className="text-center bg-light-card dark:bg-dark-card p-10 rounded-2xl shadow-xl border border-border-color dark:border-border-color-dark max-w-lg transition-all duration-200">
                    <ShieldAlert className="mx-auto text-brand-orange w-16 h-16 mb-4" /> {/* Adjusted color to brand-orange */}
                    <h1 className="text-3xl font-bold text-dark-text dark:text-dark-text-dark mb-4">Subscription Issue</h1>
                    <p className="text-light-text dark:text-light-text-dark text-lg mb-8">
                        We could not find an active or restorable subscription for your account. This can happen if the subscription has been removed or if your session has expired.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/pricing" className="px-6 py-3 bg-brand-primary font-semibold text-white rounded-lg hover:bg-brand-secondary transition-colors duration-200">
                            View Pricing Plans
                        </Link>
                        <button onClick={handleGoBackToLogin} className="px-6 py-3 bg-light-bg dark:bg-dark-bg/50 border border-border-color dark:border-border-color-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-dark-bg/70 transition-colors flex items-center gap-2 mx-auto sm:mx-0">
                            <ArrowLeftCircle size={20} /> Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex justify-center items-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-2xl border border-border-color dark:border-border-color-dark transition-all duration-200">
                <h1 className="text-3xl font-bold text-center mb-2">Your Account is {initialStatus.replace('_', ' ')}</h1>
                <p className="text-light-text dark:text-light-text-dark text-center mb-6">
                    To regain full access, please reactivate your subscription.
                </p>

                <div className="bg-light-bg dark:bg-dark-bg/50 p-6 rounded-lg mb-6 border border-border-color dark:border-border-color-dark transition-all duration-200">
                    <h2 className="text-2xl font-bold text-brand-primary dark:text-brand-secondary">{billingInfo.planId?.name || 'Previous Plan'} Plan</h2>
                    <p className="text-lg font-mono text-light-text dark:text-light-text-dark mt-2">
                        ${(billingInfo.planId?.price / 100)?.toFixed(2) || '0.00'} / {billingInfo.planId?.duration || 'N/A'}
                    </p>
                    <ul className="text-light-text dark:text-light-text-dark space-y-2 mt-4 text-sm">
                        {(billingInfo.planId?.features || []).map((feature: string) => (
                            <li key={feature} className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-brand-primary dark:text-brand-secondary" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={handleReactivate}
                    disabled={reactivateMutation.isLoading}
                    className="w-full py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <CreditCard size={20} /> {reactivateMutation.isLoading ? 'Redirecting...' : 'Reactivate Subscription'}
                </button>
                <button
                    onClick={handleGoBackToLogin}
                    className="w-full mt-4 py-3 border border-border-color dark:border-border-color-dark text-light-text dark:text-light-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-dark-bg/70 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeftCircle size={20} /> Cancel and Go Back
                </button>
            </div>
        </div>
    );
};

export default ResubscribePage;
