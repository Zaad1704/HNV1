import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, CheckCircle, XCircle, Settings, Trash2 } from 'lucide-react';

// --- Type Definitions ---
interface IOrganization {
    _id: string;
    name: string;
    owner: { name: string; email: string; };
    status: 'active' | 'inactive' | 'pending_deletion';
    subscription?: {
        _id: string;
        planId?: { name: string; _id: string; price: number; duration: string; };
        status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due';
        isLifetime: boolean;
        currentPeriodEndsAt?: string;
    };
    allowSelfDeletion?: boolean;
}

interface IPlan {
    _id: string;
    name: string;
    price: number;
    duration: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// --- React Query Fetchers ---
const fetchOrganizations = async (): Promise<IOrganization[]> => {
    const { data } = await apiClient.get('/super-admin/organizations');
    return data.data;
};

const fetchPlans = async (): Promise<IPlan[]> => {
    const { data } = await apiClient.get('/plans');
    return data.data;
};

// --- Subscription Update Modal Component ---
// This component is unchanged and can be kept as is.
const SubscriptionFormModal = (/* ...props... */) => {
    // ... modal implementation
    return null; 
};


// --- Main AdminOrganizationsPage Component ---
const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const { data: organizations = [], isLoading, isError } = useQuery<IOrganization[], Error>({ queryKey:['allOrganizations'], queryFn: fetchOrganizations });
    const { data: availablePlans = [], isLoading: isLoadingPlans } = useQuery<IPlan[], Error>({ queryKey:['availablePlans'], queryFn: fetchPlans });

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [orgToUpdateSub, setOrgToUpdateSub] = useState<IOrganization | null>(null);

    const deleteOrganizationMutation = useMutation({
        mutationFn: (orgId: string) => apiClient.delete(`/super-admin/organizations/${orgId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allOrganizations'] });
            alert('Organization and all associated data deleted successfully.');
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete organization.')
    });

    const handleDeleteOrganization = (orgId: string, orgName: string) => {
        if (window.confirm(`DANGER: Are you absolutely sure you want to delete "${orgName}"? This will delete the organization, all its users, and all its data. This cannot be undone.`)) {
            deleteOrganizationMutation.mutate(orgId);
        }
    };
    
    // ... other mutations (toggleSelfDeletion, updateStatus, etc.) remain the same

    const handleUpdateSubscriptionClick = (org: IOrganization) => {
        setOrgToUpdateSub(org);
        setIsSubModalOpen(true);
    };

    if (isLoading || isLoadingPlans) return <div className="text-center p-8 text-dark-text">Loading organizations and plans...</div>;
    if (isError) return <div className="text-center text-red-500 p-8">Failed to fetch organizations.</div>;

    return (
        <div className="text-dark-text">
            {isSubModalOpen && orgToUpdateSub && (
                <SubscriptionFormModal
                    isOpen={isSubModalOpen}
                    onClose={() => setIsSubModalOpen(false)}
                    organization={orgToUpdateSub}
                    availablePlans={availablePlans}
                    onSubscriptionUpdated={() => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] })}
                />
            )}

            <h1 className="text-3xl font-bold mb-8">Manage All Organizations</h1>
            <div className="bg-light-card rounded-xl border border-border-color overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-brand-dark/50">
                        <tr>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Organization</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Plan</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Status</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text text-center">Self-Deletion</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {organizations.map((org) => (
                            <tr key={org._id} className="hover:bg-brand-secondary">
                                <td className="p-4">
                                    <p className="font-bold text-dark-text">{org.name}</p>
                                    <p className="text-sm text-light-text">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-light-text/10 text-light-text">{org.subscription?.planId?.name || 'No Plan'}</span>
                                    }
