// frontend/src/pages/AdminOrganizationsPage.tsx

import React from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff } from 'lucide-react';

const fetchOrganizations = async () => {
    const { data } = await apiClient.get('/super-admin/organizations');
    return data.data;
};

const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const { data: organizations = [], isLoading, isError } = useQuery(['allOrganizations'], fetchOrganizations);

    const grantMutation = useMutation((orgId) => apiClient.put(`/super-admin/organizations/${orgId}/grant-lifetime`), {
        onSuccess: () => queryClient.invalidateQueries(['allOrganizations']),
        onError: () => alert('Failed to grant lifetime access.'),
    });

    const revokeMutation = useMutation((orgId) => apiClient.put(`/super-admin/organizations/${orgId}/revoke-lifetime`), {
        onSuccess: () => queryClient.invalidateQueries(['allOrganizations']),
        onError: () => alert('Failed to revoke lifetime access.'),
    });

    const handleGrantLifetime = (orgId) => {
        if (window.confirm('Are you sure you want to grant LIFETIME access?')) {
            grantMutation.mutate(orgId);
        }
    };
    
    const handleRevokeLifetime = (orgId) => {
        if (window.confirm('Are you sure you want to REVOKE lifetime access?')) {
            revokeMutation.mutate(orgId);
        }
    };
    
    if (isLoading) return <div className="text-white text-center p-8">Loading organizations...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch organizations.</div>;

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Manage All Organizations</h1>
            <div className="bg-slate-800/70 rounded-2xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="p-4 uppercase">Organization</th>
                            <th className="p-4 uppercase">Plan</th>
                            <th className="p-4 uppercase">Status</th>
                            <th className="p-4 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {organizations.map((org) => (
                            <tr key={org._id}>
                                <td className="p-4">
                                    <p className="font-bold text-white">{org.name}</p>
                                    <p className="text-sm text-slate-400">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-600/50 text-slate-300">{org.subscription?.planId?.name || 'No Plan'}</span>
                                    }
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    {org.subscription?.isLifetime ? (
                                        <button onClick={() => handleRevokeLifetime(org._id)} className="font-medium text-xs bg-orange-600 text-white py-1 px-3 rounded-md hover:bg-orange-500">Revoke Lifetime</button>
                                    ) : (
                                        <button onClick={() => handleGrantLifetime(org._id)} className="font-medium text-xs bg-yellow-600 text-white py-1 px-3 rounded-md hover:bg-yellow-500">Grant Lifetime</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrganizationsPage;
