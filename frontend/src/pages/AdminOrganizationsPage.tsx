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

// --- SOLUTION: Fully Implemented SubscriptionFormModal ---
const SubscriptionFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    organization: IOrganization;
    availablePlans: IPlan[];
    onSubscriptionUpdated: () => void;
}> = ({ isOpen, onClose, organization, availablePlans, onSubscriptionUpdated }) => {
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
            <div className="bg-light-card rounded-lg shadow-xl w-full max-w-md border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-dark-text">Manage Subscription</h2>
                    <button onClick={onClose} className="text-light-text hover:text-dark-text text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-500/10 text-red-300 p-3 rounded-md text-sm">{error}</div>}
                    <div>
                        <label htmlFor="plan" className="block text-sm font-medium text-light-text">Plan</label>
                        <select id="plan" value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-border-color bg-brand-dark/50 rounded-md text-dark-text" required>
                            <option value="">-- Select a Plan --</option>
                            {availablePlans.map(plan => (
                                <option key={plan._id} value={plan._id}>{plan.name} (${(plan.price / 100).toFixed(2)})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-light-text">Status</label>
                        <select id="status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-border-color bg-brand-dark/50 rounded-md text-dark-text" required>
                            <option value="active">Active</option>
                            <option value="trialing">Trialing</option>
                            <option value="inactive">Inactive</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-brand-secondary text-dark-text font-semibold rounded-lg hover:bg-opacity-80">Cancel</button>
                        <button type="submit" disabled={updateSubscriptionMutation.isLoading} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                            {updateSubscriptionMutation.isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const { data: organizations = [], isLoading, isError } = useQuery<IOrganization[], Error>({ queryKey:['allOrganizations'], queryFn: fetchOrganizations });
    const { data: availablePlans = [], isLoading: isLoadingPlans } = useQuery<IPlan[], Error>({ queryKey:['availablePlans'], queryFn: fetchPlans });

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [orgToUpdateSub, setOrgToUpdateSub] = useState<IOrganization | null>(null);

    // --- SOLUTION: Implemented all mutations ---
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
                                </td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' || org.subscription?.status === 'trialing' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleUpdateSubscriptionClick(org)} className="p-2 rounded-md hover:bg-light-text/10" title="Manage Subscription Manually"><Settings size={16}/></button>
                                        <button onClick={() => handleUpdateStatus(org._id, org.subscription?.status === 'active' ? 'inactive' : 'active')} className="p-2 rounded-md hover:bg-light-text/10" title={org.subscription?.status === 'active' ? 'Deactivate' : 'Activate'}>
                                            {org.subscription?.status === 'active' ? <XCircle size={16} className="text-red-400"/> : <CheckCircle size={16} className="text-green-400"/>}
                                        </button>
                                        <button onClick={() => org.subscription?.isLifetime ? handleRevokeLifetime(org._id) : handleGrantLifetime(org._id)} className="p-2 rounded-md hover:bg-light-text/10" title={org.subscription?.isLifetime ? 'Revoke Lifetime' : 'Grant Lifetime'}>
                                            {org.subscription?.isLifetime ? <ShieldOff size={16} className="text-red-400"/> : <ShieldCheck size={16} className="text-amber-400"/>}
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
