import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, UserCheck, X } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Invite {
  _id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Agent');
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await apiClient.post('/users/invite', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['invites']);
      setEmail('');
      setRole('Agent');
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email, role });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="app-surface rounded-3xl shadow-app-xl w-full max-w-md border border-app-border">
        <div className="flex justify-between items-center p-6 border-b border-app-border">
          <h2 className="text-xl font-bold text-text-primary">Invite User</h2>
          <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full"
            >
              <option value="Agent">Agent</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMutation.isLoading}
              className="btn-gradient px-6 py-3 rounded-2xl disabled:opacity-50"
            >
              {inviteMutation.isLoading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      try {
        const { data } = await apiClient.get('/users');
        return (data.data || []).filter((user: User) => user.role !== 'SuperAdmin');
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  const { data: invites = [], isLoading: invitesLoading, error: invitesError } = useQuery({
    queryKey: ['invites'],
    queryFn: async (): Promise<Invite[]> => {
      try {
        const { data } = await apiClient.get('/users/invites');
        return data.data || [];
      } catch (error) {
        console.error('Failed to fetch invites:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
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
        <h2 className="text-xl font-semibold text-text-primary mb-4">Active Users</h2>
        {users.length > 0 ? (
          <div className="space-y-4">
            {users.map((u: User) => (
              <div key={u._id} className="flex items-center justify-between p-4 bg-app-bg rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{u.name || 'Unknown'}</p>
                    <p className="text-sm text-text-secondary">{u.email || 'No email'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {u.role || 'Unknown'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {u.status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No active users</p>
        )}
      </div>

      {/* Pending Invites */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Pending Invites</h2>
        {invites.length > 0 ? (
          <div className="space-y-4">
            {invites.map((invite: Invite) => (
              <div key={invite._id} className="flex items-center justify-between p-4 bg-app-bg rounded-2xl">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-text-muted" />
                  <div>
                    <p className="font-medium text-text-primary">{invite.email}</p>
                    <p className="text-sm text-text-secondary">
                      Invited {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {invite.role}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {invite.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No pending invites</p>
        )}
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </motion.div>
  );
};

export default UsersPage;