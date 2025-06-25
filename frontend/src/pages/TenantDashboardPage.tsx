// frontend/src/pages/TenantDashboardPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { HandCoins, MessageSquareWarning, Wrench, CreditCard, Home, Calendar, Phone, MapPin, CheckCircle } from 'lucide-react';
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
    property?: PropertyInfo;
    unit: string;
    status: string;
    landlord?: LandlordInfo;
    rentAmount?: number;
    leaseEndDate?: string;
}

interface DueLineItem {
    description: string;
    amount: number;
}

// NEW: Updated UpcomingDues interface to match backend Invoice structure
interface UpcomingDues {
    invoiceId: string; // NEW: ID of the outstanding invoice
    invoiceNumber: string; // NEW: Invoice number
    totalAmount: number;
    lineItems: DueLineItem[];
    dueDate: string;
}

interface Payment {
    _id: string;
    amount: number;
    paymentDate: string;
    status: string;
}

interface TenantDashboardData {
    leaseInfo?: LeaseInfo;
    paymentHistory: Payment[];
    upcomingDues?: UpcomingDues; // Now represents a real outstanding invoice
}

// Fetch Tenant Dashboard Data
const fetchTenantDashboardData = async (): Promise<TenantDashboardData> => {
    const { data } = await apiClient.get('/tenant-portal/dashboard');
    return data.data;
};

// Mutation function for initiating rent payment
// Now accepts invoiceId and lineItems
const createRentSession = async ({ invoiceId, lineItems }: { invoiceId: string; lineItems: DueLineItem[]; }) => {
    const { data } = await apiClient.post('/billing/create-rent-payment', { invoiceId, lineItems });
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
        if (!data?.upcomingDues?.invoiceId) {
            alert('No outstanding invoice found to pay.');
            return;
        }
        // Pass the invoiceId and lineItems to the mutation
        mutation.mutate({
            invoiceId: data.upcomingDues.invoiceId,
            lineItems: data.upcomingDues.lineItems
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading Your Dashboard...</div>;
    if (isError) return (
        <div className="text-red-400 text-center p-8 dark:text-red-400">
            Error: {error?.message || 'Failed to load dashboard data.'}
            <p className="mt-4">Ensure your backend has active invoices for tenants, or try generating some from the admin panel.</p>
        </div>
    );

    if (!data?.leaseInfo && !data?.paymentHistory && !data?.upcomingDues) {
        return (
            <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">
                <h1 className="text-4xl font-bold mb-4">Welcome, {user?.name}!</h1>
                <p className="text-light-text dark:text-light-text-dark mb-4">Your tenant dashboard is loading. If you do not see your lease information, please contact your landlord or administrator.</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 px-5 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors duration-200">
                    Submit a Maintenance Request
                </button>
            </div>
        );
    }

    const leaseInfo = data.leaseInfo || {};
    const paymentHistory = data.paymentHistory || [];
    const upcomingDues = data.upcomingDues;
    
    const nextPaymentDueDateDisplay = upcomingDues?.dueDate ? formatDate(upcomingDues.dueDate) : 'N/A';
    const nextPaymentAmountDisplay = upcomingDues?.totalAmount !== undefined ? `$${upcomingDues.totalAmount.toFixed(2)}` : '$0.00';


    return (
        <div className="text-dark-text dark:text-dark-text-dark space-y-8">
            <MaintenanceRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <h1 className="text-4xl font-bold">My Tenant Dashboard</h1>

            {/* Payment Hub Card */}
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark transition-all duration-200">
                <h2 className="text-xl font-bold mb-2">Payment Hub</h2>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-light-text dark:text-light-text-dark">Next Payment Due:</p>
                        <p className="text-3xl font-bold">{nextPaymentDueDateDisplay}</p>
                        <p className="text-lg font-mono opacity-80">{nextPaymentAmountDisplay}</p>
                        {upcomingDues && <p className="text-light-text dark:text-light-text-dark text-sm">Invoice: {upcomingDues.invoiceNumber}</p>}
                    </div>
                    <button
                        onClick={handlePayRent}
                        // Disable if no outstanding invoice is found or amount is 0
                        disabled={mutation.isLoading || !upcomingDues?.invoiceId || upcomingDues.totalAmount === 0}
                        className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white font-bold rounded-lg shadow-xl hover:bg-brand-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                    >
                        <CreditCard />
                        {mutation.isLoading ? 'Redirecting...' : 'Pay Rent Now'}
                    </button>
                </div>
                {/* Display upcoming dues breakdown */}
                {upcomingDues && upcomingDues.lineItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border-color dark:border-border-color-dark">
                        <p className="text-light-text dark:text-light-text-dark text-sm font-semibold mb-2">Breakdown of Next Payment:</p>
                        <ul className="text-sm space-y-1">
                            {upcomingDues.lineItems.map((item, index) => (
                                <li key={index} className="flex justify-between text-dark-text dark:text-dark-text-dark">
                                    <span>{item.description}</span>
                                    <span>${item.amount.toFixed(2)}</span>
                                </li>
                            ))}
                            <li className="flex justify-between font-bold pt-1 border-t border-border-color dark:border-border-color-dark">
                                <span>Total</span>
                                <span>${upcomingDues.totalAmount.toFixed(2)}</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Lease Info Card */}
            <div className="bg-light-card dark:bg-dark-card/70 p-6 rounded-2xl shadow-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
                <h2 className="text-xl font-bold mb-3">My Lease Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-light-text dark:text-light-text-dark">
                    <p className="flex items-center gap-2"><Home size={18} className="text-brand-primary dark:text-brand-secondary" /> <strong>Property:</strong> {leaseInfo.property?.name || 'N/A'}, Unit {leaseInfo.unit || 'N/A'}</p>
                    <p className="flex items-center gap-2"><MapPin size={18} className="text-brand-primary dark:text-brand-secondary" /> <strong>Address:</strong> {leaseInfo.property?.street || 'N/A'}, {leaseInfo.property?.city || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Calendar size={18} className="text-brand-primary dark:text-brand-secondary" /> <strong>Lease Status:</strong> {leaseInfo.status || 'N/A'}</p>
                    {leaseInfo.leaseEndDate && <p className="flex items-center gap-2"><Calendar size={18} className="text-brand-primary dark:text-brand-secondary" /> <strong>Lease End:</strong> {new Date(leaseInfo.leaseEndDate).toLocaleDateString()}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment History Card */}
                <div className="bg-light-card dark:bg-dark-card/70 p-6 rounded-2xl shadow-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
                    <h2 className="text-xl font-bold mb-4">Payment History</h2>
                    {paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-light-text dark:text-light-text-dark">
                                <thead className="text-dark-text dark:text-dark-text-dark uppercase border-b border-border-color dark:border-border-color-dark">
                                    <tr>
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3 text-right">Amount</th>
                                        <th className="py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((payment) => (
                                        <tr key={payment._id} className="border-b border-border-color dark:border-border-color-dark last:border-b-0 hover:bg-light-bg dark:hover:bg-dark-bg/40 transition-colors duration-150">
                                            <td className="py-2 px-3">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                            <td className="py-2 px-3 text-right font-mono text-dark-text dark:text-dark-text-dark">${payment.amount.toFixed(2)}</td>
                                            <td className="py-2 px-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'Paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{payment.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-light-text dark:text-light-text-dark text-center py-8">No past payments recorded.</p>
                    )}
                </div>

                {/* Maintenance & Emergency Section */}
                <div className="space-y-6">
                    <div className="bg-light-card dark:bg-dark-card/70 p-6 rounded-2xl shadow-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
                         <h2 className="text-xl font-bold text-brand-primary dark:text-brand-secondary mb-3 flex items-center"><Wrench className="mr-2" />Submit a Maintenance Request</h2>
                         <p className="text-light-text dark:text-light-text-dark mb-4">Have an issue in your unit? Let us know.</p>
                         <button onClick={() => setIsModalOpen(true)} className="w-full px-5 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors duration-200">
                            Create Request
                         </button>
                    </div>
                    <div className="bg-light-card dark:bg-dark-card/70 p-6 rounded-2xl shadow-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
                        <h2 className="text-xl font-bold text-brand-accent-dark mb-3 flex items-center"><MessageSquareWarning className="mr-2" />Emergency Contact</h2>
                        <p className="text-light-text dark:text-light-text-dark mb-4">For urgent issues, please contact your landlord directly:</p>
                        <p className="text-dark-text dark:text-dark-text-dark font-semibold flex items-center gap-2 mb-1"><Users size={18} className="text-brand-primary dark:text-brand-secondary"/> {leaseInfo.landlord?.name || 'Your Landlord'}</p>
                        <p className="text-dark-text dark:text-dark-text-dark font-semibold flex items-center gap-2"><Phone size={18} className="text-brand-primary dark:text-brand-secondary"/> {leaseInfo.landlord?.email || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboardPage;
