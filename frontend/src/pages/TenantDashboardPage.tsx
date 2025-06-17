import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { HandCoins, MessageSquareWarning, Wrench, CreditCard } from 'lucide-react';
import MaintenanceRequestModal from '../components/common/MaintenanceRequestModal';

// ... (Interfaces and fetchTenantDashboardData function remain the same) ...
interface LeaseInfo { /* ... */ }
interface Payment { /* ... */ }
interface TenantDashboardData { /* ... */ }
const fetchTenantDashboardData = async (): Promise<TenantDashboardData> => { /* ... */ };

// --- NEW: Mutation function for initiating rent payment ---
const createRentSession = async () => {
    const { data } = await apiClient.post('/billing/create-rent-payment-session');
    return data;
};

const TenantDashboardPage = () => {
    const { data, isLoading, isError, error } = useQuery<TenantDashboardData, Error>({ /* ... */ });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- NEW: useMutation hook for the payment button ---
    const mutation = useMutation(createRentSession, {
        onSuccess: (data) => {
            // On success, the backend returns a redirectUrl. Redirect the user.
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        },
        onError: (err: any) => {
            alert(`Error: ${err.response?.data?.message || 'Could not initiate payment.'}`);
        }
    });

    const handlePayRent = () => {
        mutation.mutate(); // Trigger the mutation
    };

    if (isLoading) return <div className="text-white text-center p-8">Loading Your Dashboard...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Error: {error.message}</div>;

    return (
        <div className="text-white space-y-8">
            <MaintenanceRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <h1 className="text-4xl font-bold">My Tenant Dashboard</h1>
            
            {/* Payment Hub Card */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                <h2 className="text-xl font-bold mb-2">Payment Hub</h2>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-blue-200">Next Payment Due:</p>
                        <p className="text-3xl font-bold">July 1, 2025</p>
                        <p className="text-lg font-mono opacity-80">$1,200.00</p>
                    </div>
                    <button 
                        onClick={handlePayRent}
                        disabled={mutation.isLoading}
                        className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-xl hover:bg-slate-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                    >
                        <CreditCard />
                        {mutation.isLoading ? 'Redirecting...' : 'Pay Rent Now'}
                    </button>
                </div>
            </div>

            {/* Lease Info Card */}
            <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                {/* ... existing lease info content ... */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment History Card */}
                <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                    {/* ... existing payment history table ... */}
                </div>

                {/* Maintenance & Emergency Section */}
                <div className="space-y-6">
                    <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                         <h2 className="text-xl font-bold text-pink-400 mb-3 flex items-center"><Wrench className="mr-2" />Submit a Maintenance Request</h2>
                         <p className="text-slate-400 mb-4">Have an issue in your unit? Let us know.</p>
                         <button onClick={() => setIsModalOpen(true)} className="w-full px-5 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-500">
                            Create Request
                         </button>
                    </div>
                    <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                        {/* ... existing emergency contact card ... */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboardPage;
