import React, { useEffect, useState } from "react";
import apiClient from "../api/client"; // Corrected: Import the default export
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore"; // Corrected: Import as named export

const AcceptInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await apiClient.get(`/auth/verify-invite/${token}`);
        setEmail(response.data.email);
      } catch (err) {
        setError("Invalid or expired invitation token.");
      }
    };
    verifyToken();
  }, [token]);

  const handleAccept = async (password: string) => {
    try {
      const response = await apiClient.post(`/auth/accept-invite/${token}`, { password });
      login(response.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept invite.");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Accept Invitation</h1>
        <p className="mb-4">
          You have been invited to join the organization with the email:{" "}
          <strong>{email}</strong>
        </p>
        <p className="mb-4">
          Please set a password to complete your registration.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const password = (e.target as any).password.value;
            handleAccept(password);
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Accept & Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
