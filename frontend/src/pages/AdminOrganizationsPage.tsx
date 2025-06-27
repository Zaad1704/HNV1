import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, CheckCircle, XCircle, Settings, Trash2 } from 'lucide-react';

interface IOrganization { _id: string; name: string; owner: { name: string; email: string; }; status: 'active' | 'inactive' | 'pending_deletion'; subscription?: { _id: string; planId?: { name: string; _id: string; price: number; duration: string; }; status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due'; isLifetime: boolean; currentPeriodEndsAt?: string; }; allowSelfDeletion?: boolean; }
interface IPlan { _id: string; name: string; price: number; duration: 'daily' | 'weekly' | 'monthly' | 'yearly'; }

const fetchOrganizations = async (): Promise<IOrganization[]> => {
    const { data } = await apiClient.get('/super-admin/organizations');
    return data.data;
};

const fetchPlans = async (): Promise<IPlan[]> => {
    const { data } = await apiClient.get('/plans');
    return data.data;
};

const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const { data: organizations = [], isLoading, isError } = useQuery<IOrganization[], Error>({ queryKey:['allOrganizations'], queryFn: fetchOrganizations });
    const { data: availablePlans = [] } = useQuery<IPlan[], Error>({ queryKey:['availablePlans'], queryFn: fetchPlans });

    const getStatusChip = (status?: string) => {
        if (!status) return null;
        const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full capitalize';
        const statusMap = {
            active: `${baseClasses} bg-green-500/20 text-green-300`,
            trialing: `${baseClasses} bg-blue-500/20 text-blue-300`,
            canceled: `${baseClasses} bg-red-500/20 text-red-400`,
            past_due: `${baseClasses} bg-yellow-500/20 text-yellow-300`,
            inactive: `${baseClasses} bg-gray-500/20 text-gray-300`,
        };
        const statusClass = statusMap[status as keyof typeof statusMap] || statusMap.inactive;
        return <span className={statusClass}>{status.replace('_', ' ')}</span>;
    };

    const deleteOrgMutation = useMutation({
        mutationFn: (orgId: string) => apiClient.delete(`/super-admin/organizations/${orgId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete organization.'),
    });

    const handleDeleteOrg = (orgId: string, orgName: string) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the organization "${orgName}"? This will delete all associated users, properties, tenants, and billing data. This action cannot be undone.`)) {
            deleteOrgMutation.mutate(orgId);
        }
    };

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading organizations...</div>;
    if (isError) return <div className="text-center text-red-400 p-8">Failed to fetch organizations.</div>;

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
            <h1 className="text-3xl font-bold mb-8">Manage All Organizations</h1>
            <div className="bg-light-card rounded-xl border border-border-color overflow-hidden shadow-lg dark:bg-dark-card dark:border-border-color-dark">
                <table className="w-full text-left">
                    <thead className="bg-light-bg border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Organization</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Plan</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Status</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text text-right dark:text-light-text-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                        {organizations.map((org) => (
                            <tr key={org._id} className="hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                <td className="p-4">
                                    <p className="font-bold text-dark-text dark:text-dark-text-dark">{org.name}</p>
                                    <p className="text-sm text-light-text dark:text-light-text-dark">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-brand-accent-dark/20 text-brand-accent-dark"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-light-text/10 text-light-text dark:text-light-text-dark">{org.subscription?.planId?.name || 'No Plan'}</span>
                                    }
                                </td>
                                <td className="p-4">
                                    {getStatusChip(org.subscription?.status)}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleDeleteOrg(org._id, org.name)} className="p-2 rounded-md text-brand-orange hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/50" title="Delete Organization Permanently"><Trash2 size={16}/></button>
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
