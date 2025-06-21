// frontend/src/pages/UsersPage.tsx
import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Send, Users, Building, Mail } from "lucide-react";

// --- API Fetching Functions ---
const fetchOrgUsers = async () => {
    const { data } = await apiClient.get("/users/organization");
    return data.data;
};
const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

// --- Invite Modal Component ---
const InviteModal = ({ isOpen, onClose, userRole }) => {
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [propertyId, setPropertyId] = useState("");
    const [error, setError] = useState("");

    const { data: properties = [], isLoading: isLoadingProperties } = useQuery({ queryKey: ['propertiesForInvite'], queryFn: fetchProperties });
    
    const inviteRole = userRole === 'Agent' ? 'Landlord' : 'Agent';

    const mutation = useMutation({
        mutationFn: (inviteData: any) => apiClient.post('/invitations/invite-user', inviteData),
        onSuccess: () => {
            alert(`Invitation sent to ${email}`);
            onClose();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to send invitation.')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!propertyId) {
            setError("You must select a property to associate with this invitation.");
            return;
        }
        mutation.mutate({ recipientEmail: email, role: inviteRole, propertyId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card rounded-lg shadow-xl w-full max-w-md border border-border-color">
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="font-bold text-lg text-dark-text">Invite a new {inviteRole}</h3>
                    <button onClick={onClose} className="text-2xl text-light-text">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-light-text">The invited {inviteRole} will be associated with the property you select.</p>
                    <div>
                        <label className="block text-sm font-medium text-light-text">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full bg-brand-bg p-3 rounded-lg border border-border-color"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text">Associate with Property</label>
                        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} required disabled={isLoadingProperties} className="mt-1 w-full bg-brand-bg p-3 rounded-lg border border-border-color">
                            <option value="">{isLoadingProperties ? 'Loading...' : 'Select a property'}</option>
                            {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg disabled:opacity-50">
                            {mutation.isPending ? 'Sending...' : 'Send Invitation'} <Send size={16}/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Users Page ---
const UsersPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    
    const { data: orgUsers = [], isLoading } = useQuery({ queryKey: ['orgUsers'], queryFn: fetchOrgUsers });
    
    const pageTitle = user?.role === 'Agent' ? 'Manage Landlords' : 'Manage Team';
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
                    {buttonTitle}
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
