// frontend/src/pages/TenantDashboardPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { HandCoins, MessageSquareWarning, Wrench, CreditCard, Home, Calendar, Phone, MapPin } from 'lucide-react';
import MaintenanceRequestModal from '../components/common/MaintenanceRequestModal';
import { useAuthStore } from '../store/authStore';

// Define interfaces for type safety
interface PropertyInfo {
    name: string;
    street: string;
    city: string;
}

interface LandlordInfo {
    name: string;
    email: string;
}

interface LeaseInfo {
    property?: PropertyInfo; // Make optional as it might not be immediately available
    unit: string;
    status: string;
    landlord?: LandlordInfo; // Make optional
    rentAmount?: number; // Make optional
    leaseEndDate?: string; // Add leaseEndDate to interface
}

interface Payment {
    _id: string;
    amount: number;
    paymentDate: string;
    status: string;
}

interface TenantDashboardData {
    leaseInfo?: LeaseInfo; // Make optional as initial fetch might not have it
    paymentHistory: Payment[];
}

// Fetch Tenant Dashboard Data
const fetchTenantDashboardData = async (): Promise<TenantDashboardData> => {
    const { data } = await apiClient.get('/tenant-portal/dashboard');
    return data.data;
};

// Mutation function for initiating rent payment
const createRentSession = async () => {
    const { data } = await apiClient.post('/billing/create-rent-payment');
    return data;
};

const TenantDashboardPage = () => {
    const { user } = useAuthStore();
    const { data, isLoading, isError, error } = useQuery<TenantDashboardData, Error>({
        queryKey: ['tenantDashboardData'],
        queryFn: fetchTenantDashboardData,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mutation = useMutation(createRentSession, {
        onSuccess: (data) => {
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        },
        onError: (err: any) => {
            alert(`Error initiating payment: ${err.response?.data?.message || 'Could not initiate payment.'}`);
        }
    });

    const handlePayRent = () => {
        mutation.mutate();
    };

    // Dynamically calculate next payment due date
    const calculateNextPaymentDueDate = (leaseEndDate?: string, status?: string): string => {
        if (!leaseEndDate || status !== 'Active') return 'N/A';
        try {
            const lastEndDate = new Date(leaseEndDate);
            // Assuming monthly payments and due on 1st of month after lease end
            // This is a simplification; a real system would have payment cycles
            const nextMonth = new Date(lastEndDate.getFullYear(), lastEndDate.getMonth() + 1, 1);
            return nextMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            console.error("Error calculating next payment due date:", e);
            return 'N/A';
        }
    };


    if (isLoading) return <div className="text-white text-center p-8">Loading Your Dashboard...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Error: {error?.message || 'Failed to load dashboard data.'}</div>;

    if (!data?.leaseInfo && !data?.paymentHistory) {
        return (
            <div className="text-white text-center p-8">
                <h1 className="text-4xl font-bold mb-4">Welcome, {user?.name}!</h1>
                <p className="text-slate-300 mb-4">Your tenant dashboard is loading. If you do not see your lease information, please contact your landlord or administrator.</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 px-5 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-500">
                    Submit a Maintenance Request
                </button>
            </div>
        );
    }

    const leaseInfo = data.leaseInfo || {};
    const paymentHistory = data.paymentHistory || [];
    const nextPaymentDueDate = calculateNextPaymentDueDate(leaseInfo.leaseEndDate, leaseInfo.status);

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
                        <p className="text-3xl font-bold">{nextPaymentDueDate}</p>
                        <p className="text-lg font-mono opacity-80">${leaseInfo.rentAmount?.toFixed(2) || '0.00'}</p>
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
                <h2 className="text-xl font-bold mb-3">My Lease Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <p className="flex items-center gap-2"><Home size={18} /> <strong>Property:</strong> {leaseInfo.property?.name || 'N/A'}, Unit {leaseInfo.unit || 'N/A'}</p>
                    <p className="flex items-center gap-2"><MapPin size={18} /> <strong>Address:</strong> {leaseInfo.property?.street || 'N/A'}, {leaseInfo.property?.city || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Calendar size={18} /> <strong>Lease Status:</strong> {leaseInfo.status || 'N/A'}</p>
                    {leaseInfo.leaseEndDate && <p className="flex items-center gap-2"><Calendar size={18} /> <strong>Lease End:</strong> {new Date(leaseInfo.leaseEndDate).toLocaleDateString()}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment History Card */}
                <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h2 className="text-xl font-bold mb-4">Payment History</h2>
                    {paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm text-slate-300">
                                <thead className="text-slate-400 uppercase border-b border-slate-700">
                                    <tr>
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3 text-right">Amount</th>
                                        <th className="py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((payment) => (
                                        <tr key={payment._id} className="border-b border-slate-700 last:border-b-0">
                                            <td className="py-2 px-3">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                            <td className="py-2 px-3 text-right font-mono">${payment.amount.toFixed(2)}</td>
                                            <td className="py-2 px-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'Paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{payment.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">No past payments recorded.</p>
                    )}
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
                        <h2 className="text-xl font-bold text-yellow-400 mb-3 flex items-center"><MessageSquareWarning className="mr-2" />Emergency Contact</h2>
                        <p className="text-slate-400 mb-4">For urgent issues, please contact your landlord directly:</p>
                        <p className="text-white font-semibold flex items-center gap-2 mb-1"><Users size={18}/> {leaseInfo.landlord?.name || 'Your Landlord'}</p>
                        <p className="text-white font-semibold flex items-center gap-2"><Phone size={18}/> {leaseInfo.landlord?.email || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboardPage;
