import React, { useState, useMemo } from "react";
import apiClient from "../api/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: { name: string; };
};

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: fetchedUsers = [], isLoading: queryLoading, isError } = useQuery({
    queryKey: ['allAdminUsers'],
    queryFn: async () => {
        const response = await apiClient.get("/super-admin/users");
        setUsers(response.data.data);
        return response.data.data;
    }
  });

  // --- SOLUTION: Mutation for deleting a user ---
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => {
        return apiClient.delete(`/super-admin/users/${userId}`);
    },
    onSuccess: () => {
        // Refetch the users list to update the UI
        queryClient.invalidateQueries({ queryKey: ['allAdminUsers'] });
        alert('User deleted successfully.');
    },
    onError: (err: any) => {
        alert(err.response?.data?.message || 'Failed to delete user.');
    }
  });

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the user "${userName}"? This action cannot be undone.`)) {
        deleteUserMutation.mutate(userId);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (queryLoading) return <div className="p-4 text-center">Loading users...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">{error || 'Failed to fetch users.'}</div>;

  return (
    <div className="text-dark-text">
      <h1 className="text-3xl font-bold mb-4">Manage All Users</h1>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-3 border border-border-color rounded-lg w-full bg-light-card"
      />
      <div className="bg-light-card p-6 rounded-xl shadow-sm border border-border-color overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/10 border-b border-border-color">
            <tr>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Name</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Email</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Role</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Organization</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-brand-secondary">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-light-text">{user.email}</td>
                <td className="p-4 text-light-text">{user.role}</td>
                <td className="p-4 text-light-text">{user.organizationId?.name || 'N/A'}</td>
                {/* --- SOLUTION: Delete button added to the actions column --- */}
                <td className="p-4">
                  <button 
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    disabled={deleteUserMutation.isLoading}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
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

export default AdminUsersPage;
