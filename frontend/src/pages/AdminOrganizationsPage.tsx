import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, CheckCircle, XCircle, Settings, Trash2, Crown, CrownIcon, Shield, AlertTriangle } from 'lucide-react';

interface IOrganization { _id: string; name: string; owner: { name: string; email: string; }; status: 'active' | 'inactive' | 'pending_deletion'; subscription?: { _id: string; planId?: { name: string; _id: string; price: number; duration: string; }; status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due'; isLifetime: boolean; currentPeriodEndsAt?: string; }; allowSelfDeletion?: boolean; }
interface IPlan { _id: string; name: string; price: number; duration: 'daily' | 'weekly' | 'monthly' | 'yearly'; }

const fetchOrganizations = async (): Promise<IOrganization[]> => {
    try {
        const { data } = await apiClient.get('/super-admin/organizations');
        return data.data || [];
    } catch (error) {
        console.error('Failed to fetch organizations:', error);
        throw error;
    }
};

const fetchPlans = async (): Promise<IPlan[]> => {
    const { data } = await apiClient.get('/super-admin/plans');
    return data.data;
};

const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const { data: organizations = [], isLoading, isError, error } = useQuery<IOrganization[], Error>({ 
        queryKey:['allOrganizations'], 
        queryFn: fetchOrganizations,
        retry: 3,
        retryDelay: 1000
    });
    const { data: availablePlans = [] } = useQuery<IPlan[], Error>({ queryKey:['availablePlans'], queryFn: fetchPlans });

    const deleteOrgMutation = useMutation({
        mutationFn: (orgId: string) => apiClient.delete(`/super-admin/organizations/${orgId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete organization.'),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ orgId, action }: { orgId: string; action: 'activate' | 'deactivate' }) => 
            apiClient.patch(`/super-admin/organizations/${orgId}/${action}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to update organization status.'),
    });

    const lifetimeMutation = useMutation({
        mutationFn: ({ orgId, action }: { orgId: string; action: 'grant-lifetime' | 'revoke-lifetime' }) => 
            apiClient.patch(`/super-admin/organizations/${orgId}/${action}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to update lifetime access.'),
    });

    const handleDeleteOrg = (orgId: string, orgName: string) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the organization "${orgName}"? This will delete all associated users, properties, tenants, and billing data. This action cannot be undone.`)) {
            deleteOrgMutation.mutate(orgId);
        }
    };

    if (isLoading) return <div className="text-center p-8 text-text-secondary">Loading organizations...</div>;
    if (isError) return (
        <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Failed to Load Organizations</h2>
            <p className="text-text-secondary mb-4">Error: {error?.message || 'Unknown error'}</p>
            <button 
                onClick={() => window.location.reload()}
                className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Organizations</h1>
                    <p className="text-text-secondary mt-1">Manage all platform organizations</p>
                </div>
                <div className="text-sm text-text-secondary">
                    Total: {organizations.length} organizations
                </div>
            </div>
            <div className="app-surface rounded-3xl border border-app-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-app-bg border-b border-app-border">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Organization</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Plan</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Status</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {organizations.map((org) => (
                            <tr key={org._id} className="hover:bg-app-bg transition-colors duration-150">
                                <td className="p-4">
                                    <p className="font-bold text-text-primary">{org.name}</p>
                                    <p className="text-sm text-text-secondary">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{org.subscription?.planId?.name || 'No Plan'}</span>
                                    }
                                </td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' || org.subscription?.status === 'trialing' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {org.subscription?.status === 'active' ? (
                                            <button 
                                                onClick={() => toggleStatusMutation.mutate({ orgId: org._id, action: 'deactivate' })}
                                                className="p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                                                title="Deactivate"
                                            >
                                                <XCircle size={16}/>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => toggleStatusMutation.mutate({ orgId: org._id, action: 'activate' })}
                                                className="p-2 rounded-md text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" 
                                                title="Activate"
                                            >
                                                <CheckCircle size={16}/>
                                            </button>
                                        )}
                                        {org.subscription?.isLifetime ? (
                                            <button 
                                                onClick={() => lifetimeMutation.mutate({ orgId: org._id, action: 'revoke-lifetime' })}
                                                className="p-2 rounded-md text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors" 
                                                title="Revoke Lifetime"
                                            >
                                                <ShieldOff size={16}/>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => lifetimeMutation.mutate({ orgId: org._id, action: 'grant-lifetime' })}
                                                className="p-2 rounded-md text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors" 
                                                title="Grant Lifetime"
                                            >
                                                <Crown size={16}/>
                                            </button>
                                        )}
                                        <button className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Manage Subscription">
                                            <Settings size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteOrg(org._id, org.name)} 
                                            className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                                            title="Delete Organization Permanently"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
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
