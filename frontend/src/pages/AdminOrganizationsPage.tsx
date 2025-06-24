import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, CheckCircle, XCircle, Settings, Trash2, Globe } from 'lucide-react';

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
// (This component is unchanged from the previous response)
interface SubscriptionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: IOrganization;
    availablePlans: IPlan[];
    onSubscriptionUpdated: () => void;
}
const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({ isOpen, onClose, organization, availablePlans, onSubscriptionUpdated }) => {
    // ... (modal code remains the same)
    const [selectedPlanId, setSelectedPlanId] = useState<string>(organization.subscription?.planId?._id || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(organization.subscription?.status || 'inactive');
    const [error, setError] = useState<string | null>(null);

    const updateSubscriptionMutation = useMutation({
        mutationFn: ({ orgId, planId, status }: { orgId: string, planId: string, status: string }) =>
            apiClient.put(`/super-admin/organizations/${orgId}/subscription`, { planId, status }),
        onSuccess: () => {
            onSubscriptionUpdated();
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to update subscription.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!selectedPlanId) {
            setError('Please select a plan.');
            return;
        }
        updateSubscriptionMutation.mutate({ orgId: organization._id, planId: selectedPlanId, status: selectedStatus });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Update Subscription for {organization.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* ... (modal form content remains the same) */}
                </form>
            </div>
        </div>
    );
};


// --- Main AdminOrganizationsPage Component ---
const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const { data: organizations = [], isLoading, isError } = useQuery<IOrganization[], Error>({ queryKey:['allOrganizations'], queryFn: fetchOrganizations });
    const { data: availablePlans = [], isLoading: isLoadingPlans } = useQuery<IPlan[], Error>({ queryKey:['availablePlans'], queryFn: fetchPlans });

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [orgToUpdateSub, setOrgToUpdateSub] = useState<IOrganization | null>(null);

    // --- SOLUTION: Mutation for deleting an organization ---
    const deleteOrganizationMutation = useMutation({
        mutationFn: (orgId: string) => {
            return apiClient.delete(`/super-admin/organizations/${orgId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allOrganizations'] });
            alert('Organization deleted successfully.');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete organization.');
        }
    });

    const handleDeleteOrganization = (orgId: string, orgName: string) => {
        if (window.confirm(`DANGER: Are you absolutely sure you want to delete the organization "${orgName}"? This will also delete all associated users, properties, tenants, and billing data. This action cannot be undone.`)) {
            deleteOrganizationMutation.mutate(orgId);
        }
    };

    const toggleSelfDeletionMutation = useMutation({
        mutationFn: ({ orgId, enable }: { orgId: string, enable: boolean }) => apiClient.put(`/super-admin/organizations/${orgId}/toggle-self-deletion`, { enable }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to toggle self-deletion.'),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orgId, status }: { orgId: string, status: string }) => apiClient.put(`/super-admin/organizations/${orgId}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to update status.'),
    });

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

    const handleUpdateSubscriptionClick = (org: IOrganization) => {
        setOrgToUpdateSub(org);
        setIsSubModalOpen(true);
    };

    const handleToggleSelfDeletion = (orgId: string, currentStatus: boolean) => {
        toggleSelfDeletionMutation.mutate({ orgId, enable: !currentStatus });
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
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Self-Deletion</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Actions</th>
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
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' || org.subscription?.status === 'trialing' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleToggleSelfDeletion(org._id, org.allowSelfDeletion ?? true)}
                                        className={`p-2 rounded-full transition-colors duration-200 ease-in-out ${
                                            org.allowSelfDeletion ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        }`}
                                        disabled={toggleSelfDeletionMutation.isLoading}
                                        title={org.allowSelfDeletion ? 'Self-Deletion Enabled' : 'Self-Deletion Disabled'}
                                    >
                                        {org.allowSelfDeletion ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    </button>
                                </td>
                                <td className="p-4 space-x-1 whitespace-nowrap">
                                    <button onClick={() => handleUpdateSubscriptionClick(org)} className="p-2 rounded-md hover:bg-light-text/10" title="Update Subscription"><Settings size={16}/></button>
                                    <button onClick={() => handleGrantLifetime(org._id)} className="p-2 rounded-md hover:bg-light-text/10" title="Grant Lifetime" disabled={org.subscription?.isLifetime}><ShieldCheck size={16}/></button>
                                    
                                    {/* --- SOLUTION: Delete button added --- */}
