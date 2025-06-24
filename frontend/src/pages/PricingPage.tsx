import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import PricingPlanCard from '../components/landing/PricingPlanCard';

// Fetch public plans from the backend
const fetchPublicPlans = async () => {
    const { data } = await apiClient.get('/plans');
    // Ensure we only show plans marked as public
    return data.data.filter((p: any) => p.isPublic);
};

const PricingPage = () => {
    const { data: plans = [], isLoading, isError } = useQuery({
        queryKey: ['publicPlans'],
        queryFn: fetchPublicPlans
    });
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-dark text-dark-text p-8">
            <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
                <p className="text-lg text-light-text mb-12">
                    Select the plan that best fits your needs to continue.
                </p>

                {isLoading && <p>Loading plans...</p>}
                {isError && <p className="text-red-400">Could not load pricing plans. Please try again later.</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan: any) => (
                        <div key={plan._id} onClick={() => navigate(`/payment-summary/${plan._id}`)} className="cursor-pointer">
                            <PricingPlanCard plan={plan} />
                        </div>
                    ))}
                </div>

                 <div className="mt-12">
                    <Link to="/dashboard" className="text-brand-accent-light hover:underline">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
