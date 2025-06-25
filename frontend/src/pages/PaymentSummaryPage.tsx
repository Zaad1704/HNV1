import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
// Removed: import { useLang } from '../contexts/LanguageContext';

const PaymentSummaryPage = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true); // Changed initial state to true
    const [error, setError] = useState('');
    // Removed: const { currencyName } = useLang();

    useEffect(() => {
        const fetchPlanDetails = async () => {
            if (!planId) {
                setError('No plan selected.');
                setLoading(false);
                return;
            }
            try {
                const response = await apiClient.get('/plans');
                const selectedPlan = response.data.data.find((p: any) => p._id === planId);
                if (selectedPlan) {
                    setPlan(selectedPlan);
                } else {
                    setError('Selected plan could not be found.');
                }
            } catch (err) {
                setError('Failed to load plan details.');
            } finally {
                setLoading(false);
            }
        };
        fetchPlanDetails();
    }, [planId]);

    const handleProceedToPayment = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.post('/billing/create-checkout-session', { planId });
            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            }
        } catch (err: any) {
            setError('Could not initiate payment session. Please try again later.');
            setLoading(false);
        }
    };

    if (loading) return <div className="text-dark-text dark:text-dark-text-dark text-center p-8">Loading Plan Details...</div>;
    if (error) return <div className="text-red-400 text-center p-8 dark:text-red-400">{error}</div>;
    if (!plan) return <div className="text-dark-text dark:text-dark-text-dark text-center p-8">Plan not found.</div>;

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex justify-center items-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-2xl border border-border-color dark:border-border-color-dark transition-all duration-200">
                <h1 className="text-3xl font-bold text-center mb-2">Order Summary</h1>
                <p className="text-light-text dark:text-light-text-dark text-center mb-6">You are about to subscribe to the following plan:</p>
                
                <div className="bg-light-bg dark:bg-dark-bg/50 p-6 rounded-lg mb-6 border border-border-color dark:border-border-color-dark transition-all duration-200">
                    <h2 className="text-2xl font-bold text-brand-primary dark:text-brand-secondary">{plan.name}</h2>
                    <p className="text-4xl font-extrabold text-dark-text dark:text-dark-text-dark mt-2">
                        ${(plan.price / 100).toFixed(2)}
                        <span className="text-lg font-medium text-light-text dark:text-light-text-dark"> / {plan.duration}</span>
                    </p>
                    <ul className="text-light-text dark:text-light-text-dark space-y-2 mt-4 text-sm">
                        {plan.features.map((feature: string) => (
                            <li key={feature} className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <button 
                    onClick={handleProceedToPayment} 
                    disabled={loading}
                    className="w-full py-3 bg-brand-primary font-semibold rounded-lg hover:bg-brand-secondary text-white transition-all duration-200 disabled:opacity-50"
                >
                    {loading ? 'Redirecting...' : 'Proceed to Secure Payment'}
                </button>
                 <p className="text-xs text-light-text dark:text-light-text-dark mt-4 text-center">You will be redirected to our secure payment partner, 2Checkout, to complete your purchase.</p>
            </div>
        </div>
    );
};

export default PaymentSummaryPage;
