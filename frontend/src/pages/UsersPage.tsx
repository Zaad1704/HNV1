import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import { Send, XCircle } from 'lucide-react'; // Import icons

// --- API Fetching Functions ---
const fetchOrgUsers = async () => {
  const { data } = await apiClient.get("/users/organization");
  return data.data; // Updated to access the nested data property
};

const fetchPendingInvitations = async () => {
  const { data } = await apiClient.get("/invitations/pending");
  return data.data;
};

// InviteModal component remains largely the same...
const InviteModal = ({ isOpen, onClose }) => { /* ... */ };

const UsersPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  // --- Queries for both users and invitations ---
  const { data: orgUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["orgUsers"],
    queryFn: fetchOrgUsers,
  });
  const { data: pendingInvites = [], isLoading: isLoadingInvites } = useQuery({
    queryKey: ["pendingInvitations"],
    queryFn: fetchPendingInvitations,
  });

  // --- Mutations for resend and revoke actions ---
  const resendMutation = useMutation({
    mutationFn: (inviteId: string) => apiClient.post(`/invitations/${inviteId}/resend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] }),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => apiClient.post(`/invitations/${inviteId}/revoke`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] }),
  });

  const pageTitle = "Users & Invitations";
  const buttonTitle = user?.role === "Landlord" ? "Invite Agent" : "Invite User";

  return (
    <div className="text-dark-text">
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark shadow-md transition-colors"
        >
          <span>{buttonTitle}</span>
        </button>
      </div>

      {/* --- Section for Current Team Members --- */}
      <h2 className="text-2xl font-bold mb-4">Current Team Members</h2>
      <div className="bg-light-card rounded-xl shadow-sm border p-4 mb-8">
        {isLoadingUsers ? (
          <div>Loading users...</div>
        ) : orgUsers.length > 0 ? (
          <ul className="divide-y divide-border-color">
            {orgUsers.map((u) => (
              <li key={u._id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-light-text">{u.email}</p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{u.role}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-light-text py-4">No other users in this organization yet.</p>
        )}
      </div>

      {/* --- Section for Pending Invitations --- */}
      <h2 className="text-2xl font-bold mb-4">Pending Invitations</h2>
      <div className="bg-light-card rounded-xl shadow-sm border p-4">
        {isLoadingInvites ? (
          <div>Loading invitations...</div>
        ) : pendingInvites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="p-3 text-sm font-semibold text-light-text">Email</th>
                  <th className="p-3 text-sm font-semibold text-light-text">Role</th>
                  <th className="p-3 text-sm font-semibold text-light-text">Invited On</th>
                  <th className="p-3 text-sm font-semibold text-light-text text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {pendingInvites.map((invite) => (
                  <tr key={invite._id}>
                    <td className="p-3 font-medium">{invite.recipientEmail}</td>
                    <td className="p-3">{invite.role}</td>
                    <td className="p-3 text-light-text">{new Date(invite.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => resendMutation.mutate(invite._id)} className="p-2 text-green-600 hover:bg-green-100 rounded-md" title="Resend Invitation"><Send size={16}/></button>
                      <button onClick={() => revokeMutation.mutate(invite._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Revoke Invitation"><XCircle size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-light-text py-4">No pending invitations.</p>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
