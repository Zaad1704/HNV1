import React, { useEffect, useState, useMemo } from "react";
import apiClient from "../api/client";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: { name: string; };
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/super-admin/users");
        setUsers(response.data.data);
      } catch (err) {
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading) return <div className="p-4 text-center">Loading users...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

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
          <thead className="bg-gray-50 border-b border-border-color">
            <tr>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Name</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Email</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Role</th>
              <th className="text-left p-4 font-semibold text-light-text uppercase text-sm">Organization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
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
