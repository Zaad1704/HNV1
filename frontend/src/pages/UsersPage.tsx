// frontend/src/pages/UsersPage.tsx
import React, { useState } from "react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Send, Mail } from "lucide-react";

// --- API Fetching ---
const fetchOrgUsers = async () => {
    const { data } = await apiClient.get('/users/organization');
    return data.data;
};

const fetchProperties = async () => { // Add implementation for fetchProperties here if it's used directly in this file
    const { data } = await apiClient.get('/properties');
    return data.data;
};

// Define the type for the tenant data
interface Tenant {
    _id: string;
    name: string;
}

// Define the InviteModal component if it's not in a separate file (it seems to be in the same file based on the previous snippet)
const InviteModal = ({ isOpen, onClose, userRole }: { isOpen: boolean; onClose: () => void; userRole: string | undefined }) => {
    const queryClient = useQueryClient();
    const { data: properties = [], isLoading: isLoadingProperties } = useQuery(['propertiesForInvite'], fetchProperties, { enabled: isOpen });
    const [recipientEmail, setRecipientEmail] = useState('');
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: ({ email, role, propertyId }: { email: string, role: string, propertyId: string }) =>
            apiClient.post('/invitations/invite-user', { recipientEmail: email, role, propertyId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orgUsers'] }); // Refetch users after invite
            onClose();
            setRecipientEmail('');
            setSelectedPropertyId('');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to send invitation.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const roleToInvite = userRole === 'Agent' ? 'Landlord' : 'Agent'; // Determine role based on current user
        mutation.mutate({ email: recipientEmail, role: roleToInvite, propertyId: selectedPropertyId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card rounded-xl shadow-xl w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-dark-text">Invite New {userRole === 'Agent' ? 'Landlord' : 'Agent'}</h2>
                    <button onClick={onClose} className="text-light-text hover:text-dark-text text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-light-text">Recipient Email</label>
                        <input type="email" id="email" required value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="property" className="block text-sm font-medium text-light-text">Associate with Property</label>
                        <select id="property" required value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} disabled={isLoadingProperties} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md">
                            <option value="">{isLoadingProperties ? 'Loading Properties...' : 'Select Property'}</option>
                            {properties.map((prop: any) => (
                                <option key={prop._id} value={prop._id}>{prop.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-dark-text font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-50">
                            {mutation.isLoading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Users Page Component ---
const UsersPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const { data: orgUsers = [], isLoading } = useQuery({ queryKey: ['orgUsers'], queryFn: fetchOrgUsers });

    const pageTitle = user?.role === 'Agent' ? 'Manage Landlords' : 'My Team';
    const buttonTitle = user?.role === 'Agent' ? 'Invite Landlord' : 'Invite Agent';

    return (
        <div className="text-dark-text">
            <InviteModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} userRole={user?.role} />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{pageTitle}</h1>
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark shadow-md transition-colors"
                >
                    <PlusCircle size={18} />
                    <span>{buttonTitle}</span>
                </button>
            </div>

            <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                {isLoading ? <p className="p-4 text-center text-light-text">Loading users...</p> : (
                    <ul className="divide-y divide-border-color">
                        {orgUsers.map((u: any) => (
                            <li key={u._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 space-y-2 sm:space-y-0">
                                <div>
                                    <p className="font-bold text-dark-text">{u.name}</p>
                                    <p className="text-sm text-light-text flex items-center gap-2"><Mail size={14} />{u.email}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${u.role === 'Landlord' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span>
                            </li>
                        ))}
                    </ul>
                )}
                { !isLoading && orgUsers.length === 0 && <p className="p-8 text-center text-light-text">No other users in this organization yet.</p>}
            </div>
        </div>
    );
};

export default UsersPage;
