// frontend/src/pages/AdminOrganizationsPage.tsx
import React from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, CheckCircle, XCircle } from 'lucide-react';

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
    
    // NEW: Mutation for updating status
    const updateStatusMutation = useMutation(
        ({ orgId, status }) => apiClient.put(`/super-admin/organizations/${orgId}/status`, { status }), {
        onSuccess: () => queryClient.invalidateQueries(['allOrganizations']),
        onError: () => alert('Failed to update status.'),
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

    const handleUpdateStatus = (orgId, status) => {
        if (window.confirm(`Are you sure you want to ${status} this organization's subscription?`)) {
            updateStatusMutation.mutate({ orgId, status });
        }
    };
    
    if (isLoading) return <div className="text-white text-center p-8">Loading organizations...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch organizations.</div>;

    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Manage All Organizations</h1>
            <div className="bg-light-card rounded-xl border border-border-color overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Organization</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Plan</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Status</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {organizations.map((org) => (
                            <tr key={org._id}>
                                <td className="p-4">
                                    <p className="font-bold text-dark-text">{org.name}</p>
                                    <p className="text-sm text-light-text">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{org.subscription?.planId?.name || 'No Plan'}</span>
                                    }
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2 whitespace-nowrap">
                                    {org.subscription?.isLifetime ? (
                                        <button onClick={() => handleRevokeLifetime(org._id)} className="font-medium text-xs bg-orange-600 text-white py-1 px-3 rounded-md hover:bg-orange-500">Revoke Lifetime</button>
                                    ) : (
                                        <button onClick={() => handleGrantLifetime(org._id)} className="font-medium text-xs bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-400">Grant Lifetime</button>
                                    )}
                                    <button onClick={() => handleUpdateStatus(org.subscription.organizationId, 'active')} className="font-medium text-xs bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-500" title="Activate Subscription"><CheckCircle size={14}/></button>
                                    <button onClick={() => handleUpdateStatus(org.subscription.organizationId, 'inactive')} className="font-medium text-xs bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500" title="Deactivate Subscription"><XCircle size={14}/></button>
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
