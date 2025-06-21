import React, { useState } from "react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Send, Mail } from "lucide-react";

// --- API Fetching ---
const fetchOrgUsers = async () => { /* ... */ };
const fetchProperties = async () => { /* ... */ };

// --- Invite Modal Sub-Component ---
const InviteModal = ({ isOpen, onClose, userRole }) => {
    // ... (implementation from previous turn)
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
