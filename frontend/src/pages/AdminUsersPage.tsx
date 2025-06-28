import React, { useState, useMemo } from "react";
import apiClient from "../api/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, X } from 'lucide-react';

type User = { _id: string; name: string; email: string; role: string; organizationId?: { name: string; _id: string; }; createdAt?: string; lastLogin?: string; isEmailVerified?: boolean; };

const AdminUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['allAdminUsers'],
    queryFn: async () => {
        const response = await apiClient.get("/super-admin/users");
        return response.data.data;
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/super-admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAdminUsers'] });
      setSelectedUser(null);
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete user.'),
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

  if (isLoading) return <div className="p-4 text-center text-dark-text dark:text-dark-text-dark">Loading users...</div>;
  if (isError) return <div className="p-4 text-center text-red-400 dark:text-red-400">Failed to fetch users.</div>;

  return (
    <div className="text-dark-text dark:text-dark-text-dark">
      <h1 className="text-3xl font-bold mb-4">Manage All Users</h1>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-3 border border-border-color rounded-lg w-full bg-light-card text-dark-text focus:ring-brand-primary focus:border-brand-primary transition-all dark:bg-dark-card dark:border-border-color-dark dark:text-dark-text-dark"
      />
      <div className="bg-light-card p-6 rounded-xl shadow-lg border border-border-color overflow-x-auto dark:bg-dark-card dark:border-border-color-dark">
        <table className="w-full">
          <thead className="bg-light-bg border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
            <tr>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm dark:text-light-text-dark">Name</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm dark:text-light-text-dark">Email</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm dark:text-light-text-dark">Role</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm dark:text-light-text-dark">Organization</th>
              <th className="text-right p-4 font-semibold text-light-text uppercase text-sm dark:text-light-text-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
            {filteredUsers.map((user: User) => (
              <tr key={user._id} className="hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/40">
                <td className="p-4 font-medium text-dark-text dark:text-dark-text-dark">{user.name}</td>
                <td className="p-4 text-light-text dark:text-light-text-dark">{user.email}</td>
                <td className="p-4 text-light-text dark:text-light-text-dark">{user.role}</td>
                <td className="p-4 text-light-text dark:text-light-text-dark">{user.organizationId?.name || 'N/A'}</td>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                <p className="text-gray-900 dark:text-white">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</label>
                <p className="text-gray-900 dark:text-white">{selectedUser.organizationId?.name || 'No Organization'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</label>
                <p className="text-gray-900 dark:text-white">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
              </div>
              {selectedUser.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {selectedUser.lastLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => handleDeleteUser(selectedUser)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
