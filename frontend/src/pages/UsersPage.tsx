import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, Calendar, MoreVertical } from 'lucide-react';
import apiClient from '../api/client';

const fetchUsers = async () => {
  try {
    const { data } = await apiClient.get('/users');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

const fetchInvites = async () => {
  try {
    const { data } = await apiClient.get('/invitations');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch invites:', error);
    return [];
  }
};

const sendInvite = async (email: string, role: string) => {
  const { data } = await apiClient.post('/invitations', { email, role });
  return data.data;
};

const UsersPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 1
  });

  const { data: invites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: fetchInvites,
    retry: 1
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) => sendInvite(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      setShowInviteModal(false);
      setInviteEmail('');
    }
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  if (usersLoading || invitesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading users...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Users & Invites</h1>
          <p className="text-text-secondary mt-1">Manage team members and invitations</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Invite User
        </button>
      </div>

      {/* Active Users */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Team Members</h2>
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user: any, index: number) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-app-bg rounded-xl border border-app-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{user.name}</h3>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Landlord' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'Agent' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status || 'active'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No team members yet.</p>
        )}
      </div>

      {/* Pending Invites */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Pending Invitations</h2>
        {invites.length > 0 ? (
          <div className="space-y-3">
            {invites.map((invite: any, index: number) => (
              <motion.div
                key={invite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-app-bg rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-text-secondary" />
                  <div>
                    <p className="font-medium text-text-primary">{invite.email}</p>
                    <p className="text-sm text-text-secondary">Role: {invite.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending
                  </span>
                  <p className="text-xs text-text-secondary mt-1">
                    {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No pending invitations.</p>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-app-surface rounded-3xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-text-primary mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-3 border border-app-border rounded-xl"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-3 border border-app-border rounded-xl"
                >
                  <option value="Agent">Agent</option>
                  <option value="Landlord">Landlord</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="flex-1 btn-gradient py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 border border-app-border rounded-xl font-semibold text-text-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UsersPage;