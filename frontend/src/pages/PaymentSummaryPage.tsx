import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const PaymentSummaryPage = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlanDetails = async () => {
            if (!planId) {
                setError('No plan selected.');
                setLoading(false);
                return;
            }
            try {
                // In a real app, you might have a public GET /api/plans/:id endpoint.
                // For now, we fetch all and find the one we need.
                const response = await apiClient.get('/plans');
                const selectedPlan = response.data.data.find(p => p._id === planId);
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
                // In a real app, this redirects to 2Checkout. Here it goes to our mock success page.
                window.location.href = response.data.redirectUrl;
            }
        } catch (err) {
            setError('Could not initiate payment session. Please try again later.');
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white text-center p-8">Loading Plan Details...</div>;
    if (error) return <div className="text-red-400 text-center p-8">{error}</div>;
    if (!plan) return <div className="text-white text-center p-8">Plan not found.</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center p-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h1 className="text-3xl font-bold text-center mb-2">Order Summary</h1>
                <p className="text-slate-400 text-center mb-6">You are about to subscribe to the following plan:</p>
                
                <div className="bg-slate-700/50 p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-bold text-yellow-400">{plan.name}</h2>
                    <p className="text-4xl font-extrabold text-white mt-2">
                        ${(plan.price / 100).toFixed(2)}
                        <span className="text-lg font-medium text-slate-400"> / {plan.duration}</span>
                    </p>
                    <ul className="text-slate-300 space-y-2 mt-4 text-sm">
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
                    className="w-full py-3 bg-cyan-600 font-semibold rounded-lg hover:bg-cyan-500 transition-all disabled:bg-slate-600"
                >
                    {loading ? 'Redirecting...' : 'Proceed to Secure Payment'}
                </button>
                 <p className="text-xs text-slate-500 mt-4 text-center">You will be redirected to our secure payment partner, 2Checkout, to complete your purchase.</p>
            </div>
        </div>
    );
};

export default PaymentSummaryPage;
