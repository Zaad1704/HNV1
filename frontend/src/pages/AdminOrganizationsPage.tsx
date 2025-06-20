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
    const { data: organizations = [], isLoading, isError } = useQuery({ queryKey:['allOrganizations'], queryFn: fetchOrganizations });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orgId, status }: { orgId: string, status: string }) => apiClient.put(`/super-admin/organizations/${orgId}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to update status.'),
    });

    // FIX: New mutations for lifetime access
    const grantLifetimeMutation = useMutation({
        mutationFn: (orgId: string) => apiClient.put(`/super-admin/organizations/${orgId}/grant-lifetime`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to grant lifetime access.'),
    });

    const revokeLifetimeMutation = useMutation({
        mutationFn: (orgId: string) => apiClient.put(`/super-admin/organizations/${orgId}/revoke-lifetime`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to revoke lifetime access.'),
    });

    const handleUpdateStatus = (orgId: string, status: string) => {
        if (window.confirm(`Are you sure you want to set this organization's subscription to '${status}'?`)) {
            updateStatusMutation.mutate({ orgId, status });
        }
    };

    // FIX: New handlers for lifetime access
    const handleGrantLifetime = (orgId: string) => {
        if (window.confirm('Are you sure you want to grant lifetime access to this organization?')) {
            grantLifetimeMutation.mutate(orgId);
        }
    };

    const handleRevokeLifetime = (orgId: string) => {
        if (window.confirm('Are you sure you want to revoke lifetime access for this organization?')) {
            revokeLifetimeMutation.mutate(orgId);
        }
    };
    
    if (isLoading) return <div className="text-center p-8">Loading organizations...</div>;
    if (isError) return <div className="text-center text-red-500 p-8">Failed to fetch organizations.</div>;

    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Manage All Organizations</h1>
            <div className="bg-light-card rounded-xl border border-border-color overflow-hidden shadow-sm">
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
                            <tr key={org._id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <p className="font-bold text-dark-text">{org.name}</p>
                                    <p className="text-sm text-light-text">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{org.subscription?.planId?.name || 'No Plan'}</span>
                                    }
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2 whitespace-nowrap">
                                    <button 
                                        onClick={() => handleUpdateStatus(org._id, 'active')} 
                                        className="font-medium text-xs bg-green-100 text-green-700 p-2 rounded-md hover:bg-green-200" 
                                        title="Activate Subscription"
                                        disabled={updateStatusMutation.isLoading || org.subscription?.status === 'active'}
                                    >
                                        <CheckCircle size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(org._id, 'inactive')} 
                                        className="font-medium text-xs bg-red-100 text-red-700 p-2 rounded-md hover:bg-red-200" 
                                        title="Deactivate Subscription"
                                        disabled={updateStatusMutation.isLoading || org.subscription?.status === 'inactive'}
                                    >
                                        <XCircle size={16}/>
                                    </button>
                                    {/* FIX: Add Grant Lifetime Access Button */}
                                    <button 
                                        onClick={() => handleGrantLifetime(org._id)} 
                                        className="font-medium text-xs bg-purple-100 text-purple-700 p-2 rounded-md hover:bg-purple-200" 
                                        title="Grant Lifetime Access"
                                        disabled={grantLifetimeMutation.isLoading || org.subscription?.isLifetime}
                                    >
                                        <ShieldCheck size={16}/>
                                    </button>
                                    {/* FIX: Add Revoke Lifetime Access Button */}
                                    <button 
                                        onClick={() => handleRevokeLifetime(org._id)} 
                                        className="font-medium text-xs bg-orange-100 text-orange-700 p-2 rounded-md hover:bg-orange-200" 
                                        title="Revoke Lifetime Access"
                                        disabled={revokeLifetimeMutation.isLoading || !org.subscription?.isLifetime}
                                    >
                                        <ShieldOff size={16}/>
                                    </button>
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
