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

    if (isLoading) return <div className="text-center p-8 text-dark-text">Loading organizations...</div>;
    if (isError) return <div className="text-center text-red-400 p-8">Failed to fetch organizations.</div>;

    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Manage All Organizations</h1>
            <div className="bg-light-card rounded-xl border border-border-color overflow-hidden shadow-lg">
                <table className="w-full text-left">
                    <thead className="bg-dark-bg/50">
                        <tr>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Organization</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Plan</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Status</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {organizations.map((org) => (
                            <tr key={org._id} className="hover:bg-dark-bg/40">
                                <td className="p-4">
                                    <p className="font-bold text-dark-text">{org.name}</p>
                                    <p className="text-sm text-light-text">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-light-text/10 text-light-text">{org.subscription?.planId?.name || 'No Plan'}</span>
                                    }
                                </td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' || org.subscription?.status === 'trialing' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleDeleteOrg(org._id, org.name)} className="p-2 rounded-md text-red-400 hover:bg-dark-bg" title="Delete Organization Permanently"><Trash2 size={16}/></button>
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
