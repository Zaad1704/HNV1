import React, { useState, useMemo } from "react";
import apiClient from "../api/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, X, CreditCard, DollarSign, AlertTriangle } from 'lucide-react';

type User = { _id: string; name: string; email: string; role: string; organizationId?: { name: string; _id: string; }; createdAt?: string; lastLogin?: string; isEmailVerified?: boolean; };

const AdminUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['allAdminUsers'],
    queryFn: async () => {
        try {
            const response = await apiClient.get("/super-admin/users");
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    },
    retry: 3,
    retryDelay: 1000
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/super-admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAdminUsers'] });
      setSelectedUser(null);
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete user.'),
  });

  const updateUserPlanMutation = useMutation({
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) => 
      apiClient.put(`/super-admin/users/${userId}/plan`, { planId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAdminUsers'] });
      alert('User plan updated successfully');
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to update plan.'),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await apiClient.get('/super-admin/plans');
      return response.data.data;
    }
  });

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email})? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter( (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (isLoading) return <div className="p-4 text-center text-text-secondary">Loading users...</div>;
  if (isError) return (
    <div className="text-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} className="text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Failed to Load Users</h2>
      <p className="text-text-secondary mb-4">Error: {error?.message || 'Unknown error'}</p>
      <button 
        onClick={() => window.location.reload()}
        className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary mt-1">Manage all platform users</p>
        </div>
        <div className="text-sm text-text-secondary">
          Total: {filteredUsers.length} users
        </div>
      </div>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
      />
      <div className="app-surface p-6 rounded-3xl border border-app-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-app-bg border-b border-app-border">
            <tr>
              <th className="text-left p-4 font-semibold text-text-secondary text-sm">Name</th>
              <th className="text-left p-4 font-semibold text-text-secondary text-sm">Email</th>
              <th className="text-left p-4 font-semibold text-text-secondary text-sm">Role</th>
              <th className="text-left p-4 font-semibold text-text-secondary text-sm">Organization</th>
              <th className="text-right p-4 font-semibold text-text-secondary text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {filteredUsers.map((user: User) => (
              <tr key={user._id} className="hover:bg-app-bg transition-colors duration-150">
                <td className="p-4 font-medium text-text-primary">{user.name}</td>
                <td className="p-4 text-text-secondary">{user.email}</td>
                <td className="p-4 text-text-secondary">{user.role}</td>
                <td className="p-4 text-text-secondary">{user.organizationId?.name || 'N/A'}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
                      title="View Details"
                    >
                      <Eye size={16}/>
                    </button>
                    <button 
                      onClick={() => {
                        const planId = prompt('Enter Plan ID for user:');
                        if (planId) updateUserPlanMutation.mutate({ userId: user._id, planId });
                      }}
                      className="p-2 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" 
                      title="Manage Billing"
                    >
                      <CreditCard size={16}/>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                      title="Delete User"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="app-surface rounded-3xl p-6 w-full max-w-md border border-app-border shadow-app-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-primary">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Name</label>
                <p className="text-text-primary font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Email</label>
                <p className="text-text-primary">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Role</label>
                <p className="text-text-primary">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Organization</label>
                <p className="text-text-primary">{selectedUser.organizationId?.name || 'No Organization'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Email Verified</label>
                <p className="text-text-primary">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
              </div>
              {selectedUser.createdAt && (
                <div>
                  <label className="text-sm font-medium text-text-secondary">Created</label>
                  <p className="text-text-primary">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {selectedUser.lastLogin && (
                <div>
                  <label className="text-sm font-medium text-text-secondary">Last Login</label>
                  <p className="text-text-primary">{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => {
                  const planId = prompt('Enter Plan ID:');
                  if (planId) updateUserPlanMutation.mutate({ userId: selectedUser._id, planId });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <DollarSign size={16} />
                Update Plan
              </button>
              <button 
                onClick={() => handleDeleteUser(selectedUser)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-app-bg text-text-primary rounded-2xl hover:bg-app-border transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
