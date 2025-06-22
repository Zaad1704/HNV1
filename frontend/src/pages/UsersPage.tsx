import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";

const fetchOrgUsers = async () => {
  const { data } = await apiClient.get("/users/org");
  return data.users;
};

const fetchProperties = async () => {
  const { data } = await apiClient.get("/properties");
  return data.properties;
};

const InviteModal = ({ isOpen, onClose, userRole }) => {
  const queryClient = useQueryClient();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: ({ email, role, propertyId }) =>
      apiClient.post("/invitations/invite-user", {
        recipientEmail: email,
        role,
        propertyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      onClose();
      setRecipientEmail("");
      setSelectedPropertyId("");
    },
    onError: (err) => {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        useAuthStore.getState().logout();
        window.location.href = "/login";
      } else {
        setError(
          err.response?.data?.message || "Failed to send invitation."
        );
      }
    },
  });

  const { data: properties = [], isLoading: isLoadingProperties } = useQuery(
    ["propertiesForInvite"],
    fetchProperties,
    { enabled: isOpen }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    mutation.mutate({
      email: recipientEmail,
      role: userRole === "Agent" ? "Landlord" : "Agent",
      propertyId: selectedPropertyId,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-30 inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Invite a {userRole === "Agent" ? "Landlord" : "Agent"}</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Recipient Email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded"
            required
          />
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded"
            required
          >
            <option value="">Select Property</option>
            {properties.map((prop) => (
              <option key={prop._id} value={prop._id}>{prop.name}</option>
            ))}
          </select>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="px-3 py-2 bg-indigo-600 text-white rounded">
              {mutation.isLoading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const { user } = useAuthStore();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const { data: orgUsers = [], isLoading } = useQuery({
    queryKey: ["orgUsers"],
    queryFn: fetchOrgUsers,
  });

  const pageTitle = user?.role === "Agent" ? "Manage Landlords" : "My Team";
  const buttonTitle = user?.role === "Agent" ? "Invite Landlord" : "Invite Agent";

  return (
    <div className="text-dark-text">
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        userRole={user?.role}
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
        >
          <span>{buttonTitle}</span>
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4">
        {/* List org users here */}
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {orgUsers.map((u) => (
              <li key={u._id}>{u.name} ({u.email}) - {u.role}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
