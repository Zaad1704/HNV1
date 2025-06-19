import React, { useState, useMemo, useEffect } from 'react';
import apiClient from '../api/client';
import { ShieldCheck } from 'lucide-react';

const AdminOrganizationsPage = () => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get('/super-admin/organizations');
            // Update the mapping to include the isLifetime flag
            const formattedOrgs = response.data.data.map((org: any) => ({
                id: org._id,
                name: org.name,
                owner: org.owner?.name || 'N/A',
                plan: org.subscription?.planId?.name || 'N/A',
                userCount: org.members?.length || 0,
                status: org.subscription?.status || org.status,
                isLifetime: org.subscription?.isLifetime || false, // Add isLifetime
            }));
            setOrganizations(formattedOrgs);
        } catch (err) {
            setError('Failed to fetch organization data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleSubscriptionChange = async (orgId: string, action: 'active' | 'inactive') => {
        try {
            await apiClient.put(`/super-admin/organizations/${orgId}/subscription`, { status: action });
            fetchOrganizations(); 
        } catch (err) {
            alert(`Failed to ${action} subscription.`);
        }
    };

    // --- NEW: Handler for granting lifetime access ---
    const handleGrantLifetime = async (orgId: string) => {
        if (window.confirm('Are you sure you want to grant LIFETIME access to this organization? This action cannot be easily undone.')) {
            try {
                await apiClient.put(`/super-admin/organizations/${orgId}/grant-lifetime`);
                fetchOrganizations();
            } catch (err) {
                alert('Failed to grant lifetime access.');
            }
        }
    };

    const getStatusClass = (status: string) => status === 'active' || status === 'trialing' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-400';
    const getPlanClass = (plan: string) => {
        if (plan.includes('Agent')) return 'bg-sky-500/20 text-sky-400';
        if (plan.includes('Landlord')) return 'bg-pink-500/20 text-pink-400';
        if (plan.includes('Admin')) return 'bg-amber-500/20 text-amber-400';
        return 'bg-slate-600/50 text-slate-400';
    };

    if (loading) return <div className="text-white text-center p-8">Loading organizations...</div>;
    if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Manage All Organizations</h1>
            <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Organization & Owner</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Plan</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {organizations.map((org: any) => (
                                <tr key={org.id} className="hover:bg-slate-800">
                                    <td className="p-4">
                                        <p className="font-bold text-white">{org.name}</p>
                                        <p className="text-sm text-slate-400">{org.owner}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {org.isLifetime && <ShieldCheck size={16} className="text-yellow-400" title="Lifetime Subscription"/>}
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanClass(org.plan)}`}>
                                                {org.isLifetime ? 'Lifetime' : org.plan}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(org.status)}`}>
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-2">
                                        <button onClick={() => handleSubscriptionChange(org.id, 'active')} className="font-medium text-xs bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-500 transition-colors">Activate</button>
                                        <button onClick={() => handleSubscriptionChange(org.id, 'inactive')} className="font-medium text-xs bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 transition-colors">Deactivate</button>
                                        {!org.isLifetime && (
                                            <button onClick={() => handleGrantLifetime(org.id)} className="font-medium text-xs bg-yellow-600 text-white py-1 px-3 rounded-md hover:bg-yellow-500 transition-colors">Grant Lifetime</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrganizationsPage;
