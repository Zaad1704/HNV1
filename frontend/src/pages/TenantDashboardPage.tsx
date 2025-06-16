import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { HandCoins, MessageSquareWarning, Wrench } from 'lucide-react';

// Define interfaces for our data structure
interface Landlord {
    name: string;
    email: string;
}
interface LeaseInfo {
    property: { name: string; street: string; city: string; };
    unit: string;
    status: string;
    landlord: Landlord;
}
interface Payment {
    _id: string;
    amount: number;
    paymentDate: string;
    status: 'Paid' | 'Pending' | 'Failed';
}
interface TenantDashboardData {
    leaseInfo: LeaseInfo;
    paymentHistory: Payment[];
}

// Data fetching function for React Query
const fetchTenantDashboardData = async (): Promise<TenantDashboardData> => {
    const { data } = await apiClient.get('/tenant-portal/dashboard');
    return data.data;
};

const TenantDashboardPage = () => {
    const { data, isLoading, isError, error } = useQuery<TenantDashboardData, Error>({
        queryKey: ['tenantDashboard'],
        queryFn: fetchTenantDashboardData,
    });

    if (isLoading) return <div className="text-white text-center p-8">Loading Your Dashboard...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Error: {error.message}</div>;

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            Paid: 'bg-green-500/20 text-green-400',
            Pending: 'bg-yellow-500/20 text-yellow-400',
            Failed: 'bg-red-500/20 text-red-400',
        };
        return statusMap[status] || 'bg-gray-500/20 text-gray-300';
    };

    return (
        <div className="text-white space-y-8">
            <h1 className="text-4xl font-bold">My Tenant Dashboard</h1>

            {/* Lease & Property Information Card */}
            <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Lease & Property Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">PROPERTY</p>
                        <p className="font-bold text-white">{data?.leaseInfo.property.name}</p>
                        <p>{data?.leaseInfo.property.street}, {data?.leaseInfo.property.city}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">UNIT</p>
                        <p className="font-bold text-white">{data?.leaseInfo.unit}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">LANDLORD/AGENT</p>
                        <p className="font-bold text-white">{data?.leaseInfo.landlord.name}</p>
                        <a href={`mailto:${data?.leaseInfo.landlord.email}`} className="text-cyan-400 hover:underline">{data?.leaseInfo.landlord.email}</a>
                    </div>
                     <div>
                        <p className="text-sm font-semibold text-slate-500">LEASE STATUS</p>
                        <p className="font-bold text-white">{data?.leaseInfo.status}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment History */}
                <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center"><HandCoins className="mr-2" />Payment History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-600">
                                <tr>
                                    <th className="py-2 text-sm font-semibold text-slate-400">Date</th>
                                    <th className="py-2 text-sm font-semibold text-slate-400">Amount</th>
                                    <th className="py-2 text-sm font-semibold text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.paymentHistory.map(p => (
                                    <tr key={p._id} className="border-b border-slate-700">
                                        <td className="py-3 text-slate-300">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                        <td className="py-3 font-mono text-white">${p.amount.toFixed(2)}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(p.status)}`}>{p.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Actions & Requests */}
                <div className="space-y-6">
                    <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                         <h2 className="text-xl font-bold text-pink-400 mb-3 flex items-center"><Wrench className="mr-2" />Submit a Maintenance Request</h2>
                         <p className="text-slate-400 mb-4">Have an issue in your unit? Let us know.</p>
                         <button className="w-full px-5 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-500">
                            Create Request
                         </button>
                    </div>
                     <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                         <h2 className="text-xl font-bold text-red-400 mb-3 flex items-center"><MessageSquareWarning className="mr-2" />Emergency Contact</h2>
                         <p className="text-slate-400">For emergencies like fire or flood, please call us immediately at <span className="font-bold text-white">(555) 123-9999</span>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboardPage;
