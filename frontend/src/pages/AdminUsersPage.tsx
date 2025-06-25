import React, { useState, useMemo } from "react";
import apiClient from "../api/client";
import { useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

type User = { _id: string; name: string; email: string; role: string; organizationId?: { name: string; }; };

const AdminUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['allAdminUsers'],
    queryFn: async () => {
        const response = await apiClient.get("/super-admin/users");
        return response.data.data;
    }
  });

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter( (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (isLoading) return <div className="p-4 text-center text-dark-text">Loading users...</div>;
  if (isError) return <div className="p-4 text-center text-red-400">Failed to fetch users.</div>;

  return (
    <div className="text-dark-text">
      <h1 className="text-3xl font-bold mb-4">Manage All Users</h1>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-3 border border-border-color rounded-lg w-full bg-light-card text-dark-text"
      />
      <div className="bg-light-card p-6 rounded-xl shadow-lg border border-border-color overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-bg/50 border-b border-border-color">
            <tr>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Name</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Email</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Role</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Organization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {filteredUsers.map((user: User) => (
              <tr key={user._id} className="hover:bg-dark-bg/40">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-light-text">{user.email}</td>
                <td className="p-4 text-light-text">{user.role}</td>
                <td className="p-4 text-light-text">{user.organizationId?.name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
