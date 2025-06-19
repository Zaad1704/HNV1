import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import { PlusCircle, Send } from "lucide-react";

// --- React Query Fetch Functions ---
const fetchOrgUsers = async () => {
  const { data } = await apiClient.get("/users/organization");
  return data.data;
};

const fetchManagedAgents = async () => {
  const { data } = await apiClient.get("/users/my-agents");
  return data.data;
};

// --- Invite Agent Mutation ---
const inviteAgentMutationFn = (recipientEmail: string) => {
    return apiClient.post('/invitations/invite-agent', { recipientEmail });
}

const UsersPage: React.FC = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteError, setInviteError] = useState("");

    // Fetch all users in the organization for the general list
    const { data: orgUsers = [], isLoading: isLoadingOrgUsers } = useQuery({ queryKey: ['orgUsers'], queryFn: fetchOrgUsers });

    // Fetch agents specifically managed by this Landlord
    const { data: managedAgents = [], isLoading: isLoadingAgents } = useQuery({ 
        queryKey: ['managedAgents'], 
        queryFn: fetchManagedAgents,
        enabled: user?.role === 'Landlord' // Only run this query if the user is a Landlord
    });

    const inviteMutation = useMutation({
        mutationFn: inviteAgentMutationFn,
        onSuccess: () => {
            alert(`Invitation sent to ${inviteEmail}`);
            setInviteEmail("");
            setInviteModalOpen(false);
            // Optional: refetch agent list if you want to show pending invites
        },
        onError: (error: any) => {
            setInviteError(error.response?.data?.message || "Failed to send invitation.");
        }
    });
    
    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError("");
        if (!inviteEmail) {
            setInviteError("Email address cannot be empty.");
            return;
        }
        inviteMutation.mutate(inviteEmail);
    }
    
    const getStatusChip = (status?: string) => {
      if (!status) return null;
      const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full capitalize';
      switch(status) {
          case 'active':
            return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Active</span>;
          case 'suspended':
            return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>Suspended</span>;
          default:
            return <span className={`${baseClasses} bg-slate-600/50 text-slate-400`}>{status}</span>;
      }
  };

  return (
    <div className="text-white space-y-10">
      
      {/* --- Agent Management Section (For Landlords Only) --- */}
      {user?.role === 'Landlord' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold">Manage Your Agents / Managers</h2>
            <button 
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
            >
                <PlusCircle size={18} />
                Invite Agent
            </button>
          </div>
          <div className="bg-slate-800/70 rounded-2xl border border-slate-700">
             {isLoadingAgents ? <p className="p-4 text-center">Loading agents...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Email</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managedAgents.map((agent: any) => (
                                <tr key={agent._id} className="border-t border-slate-800 hover:bg-slate-800">
                                    <td className="p-4">{agent.name}</td>
                                    <td className="p-4 text-slate-400">{agent.email}</td>
                                    <td className="p-4">{getStatusChip(agent.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
             { !isLoadingAgents && managedAgents.length === 0 && <p className="p-8 text-center text-slate-500">You have not invited any agents yet.</p>}
          </div>
        </div>
      )}

      {/* --- Organization Users List (For All Roles) --- */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Users in Your Organization</h2>
        <div className="bg-slate-800/70 rounded-2xl border border-slate-700">
            {isLoadingOrgUsers ? <p className="p-4 text-center">Loading users...</p> : (
                <ul className="divide-y divide-slate-800">
                    {orgUsers.map((u: any) => (
                        <li key={u._id} className="flex justify-between items-center p-4">
                            <div>
                                <p className="font-bold">{u.name}</p>
                                <p className="text-sm text-slate-400">{u.email}</p>
                            </div>
                            <span className="text-sm font-semibold text-cyan-400">{u.role}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
      
      {/* Invite Agent Modal */}
      {isInviteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
              <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                  <div className="flex justify-between items-center p-4 border-b border-slate-700">
                      <h3 className="font-bold text-lg">Invite an Agent/Manager</h3>
                      <button onClick={() => setInviteModalOpen(false)} className="text-2xl">&times;</button>
                  </div>
                  <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                      <p className="text-sm text-slate-400">Enter the email address of the person you want to invite. They will receive an email with instructions to join your team.</p>
                      <div>
                          <label htmlFor="inviteEmail" className="block text-sm font-medium text-slate-300">Agent's Email Address</label>
                          <input 
                              type="email" 
                              id="inviteEmail"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              required
                              className="mt-1 w-full bg-slate-900 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
                          />
                      </div>
                      {inviteError && <p className="text-sm text-red-400">{inviteError}</p>}
                      <div className="flex justify-end gap-4 pt-2">
                           <button type="button" onClick={() => { setInviteModalOpen(false); setInviteError(""); }} className="px-4 py-2 bg-slate-600 rounded-lg">Cancel</button>
                           <button type="submit" disabled={inviteMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg disabled:bg-cyan-800">
                               {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'} <Send size={16}/>
                           </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default UsersPage;
