import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, CheckCircle, XCircle, Settings, Trash2, Globe } from 'lucide-react'; // Added Settings, Trash2, Globe icons

// --- Type Definitions (Optional, but good practice for clarity) ---
interface IOrganization {
    _id: string;
    name: string;
    owner: { name: string; email: string; };
    status: 'active' | 'inactive' | 'pending_deletion';
    subscription?: {
        _id: string;
        planId?: { name: string; _id: string; price: number; duration: string; }; // Populated plan
        status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due';
        isLifetime: boolean;
        currentPeriodEndsAt?: string;
    };
    allowSelfDeletion?: boolean; // New field from backend
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
    const { data } = await apiClient.get('/plans'); // Assuming /api/plans is public or accessible
    return data.data;
};

// --- Subscription Update Modal Component (Defined inline for simplicity) ---
interface SubscriptionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: IOrganization;
    availablePlans: IPlan[];
    onSubscriptionUpdated: () => void;
}

const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
    isOpen, onClose, organization, availablePlans, onSubscriptionUpdated
}) => {
    const [selectedPlanId, setSelectedPlanId] = useState<string>(organization.subscription?.planId?._id || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(organization.subscription?.status || 'inactive');
    const [error, setError] = useState<string | null>(null);

    const updateSubscriptionMutation = useMutation({
        mutationFn: ({ orgId, planId, status }: { orgId: string, planId: string, status: string }) =>
            apiClient.put(`/super-admin/organizations/${orgId}/subscription`, { planId, status }),
        onSuccess: () => {
            onSubscriptionUpdated(); // Trigger refetch of organizations
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
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                    <div>
                        <label htmlFor="plan" className="block text-sm font-medium text-gray-700">Select Plan</label>
                        <select
                            id="plan"
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            required
                        >
                            <option value="">-- Select a Plan --</option>
                            {availablePlans.map(plan => (
                                <option key={plan._id} value={plan._id}>{plan.name} (${(plan.price / 100).toFixed(2)})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Set Status</label>
                        <select
                            id="status"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            required
                        >
                            <option value="active">Active</option>
                            <option value="trialing">Trialing</option>
                            <option value="inactive">Inactive</option>
                            <option value="canceled">Canceled</option>
                            <option value="past_due">Past Due</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={updateSubscriptionMutation.isLoading} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {updateSubscriptionMutation.isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
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

    // Mutation for toggling self-deletion
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

    // Handler for A.1 - open modal to update subscription
    const handleUpdateSubscriptionClick = (org: IOrganization) => {
        setOrgToUpdateSub(org);
        setIsSubModalOpen(true);
    };

    // Handler for A.2 - toggle self-deletion
    const handleToggleSelfDeletion = (orgId: string, currentStatus: boolean) => {
        toggleSelfDeletionMutation.mutate({ orgId, enable: !currentStatus });
    };
    
    if (isLoading || isLoadingPlans) return <div className="text-center p-8">Loading organizations and plans...</div>;
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
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Organization</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Plan</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Status</th>
                            <th className="p-4 uppercase text-sm font-semibold text-light-text">Self-Deletion</th> {/* New column */}
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
                                <td className="p-4 text-center"> {/* New column for self-deletion toggle */}
                                    <button
                                        onClick={() => handleToggleSelfDeletion(org._id, org.allowSelfDeletion ?? true)} // Default to true if undefined
                                        className={`p-2 rounded-full transition-colors duration-200 ease-in-out ${
                                            org.allowSelfDeletion ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                        disabled={toggleSelfDeletionMutation.isLoading}
                                        title={org.allowSelfDeletion ? 'Self-Deletion Enabled' : 'Self-Deletion Disabled'}
                                    >
                                        {org.allowSelfDeletion ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    </button>
                                </td>
                                <td className="p-4 space-x-2 whitespace-nowrap">
                                    {/* Update Subscription Button (A.1) */}
                                    <button 
                                        onClick={() => handleUpdateSubscriptionClick(org)} 
                                        className="font-medium text-xs bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200" 
                                        title="Update Subscription Plan"
                                        disabled={isLoadingPlans}
                                    >
                                        <Settings size={16}/>
                                    </button>
                                    {/* Existing Status Toggle Buttons */}
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
                                    {/* Lifetime Access Buttons */}
                                    <button 
                                        onClick={() => handleGrantLifetime(org._id)} 
                                        className="font-medium text-xs bg-purple-100 text-purple-700 p-2 rounded-md hover:bg-purple-200" 
                                        title="Grant Lifetime Access"
                                        disabled={grantLifetimeMutation.isLoading || org.subscription?.isLifetime}
                                    >
                                        <ShieldCheck size={16}/>
                                    </button>
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
