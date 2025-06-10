import React, { useState } from "react";
import apiClient from "../api/client"; // Corrected: Import the default export

const InviteUsersPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await apiClient.post("/users/invite", { email, role });
      setMessage(`Invitation sent to ${email}`);
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invitation.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Invite New User</h1>
      <form onSubmit={handleInvite} className="max-w-md bg-white p-6 rounded-lg shadow-md">
        {message && <div className="text-green-500 mb-4">{message}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="agent">Agent</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Send Invitation
        </button>
      </form>
    </div>
  );
};

export default InviteUsersPage;
