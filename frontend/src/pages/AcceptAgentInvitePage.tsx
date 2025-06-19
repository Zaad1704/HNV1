import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';

// --- React Query Fetcher ---
const fetchInviteDetails = async (token: string | undefined) => {
    if (!token) throw new Error("No token provided.");
    const { data } = await apiClient.get(`/invitations/accept/${token}`);
    return data.data;
};

// --- React Query Mutator ---
const acceptInviteMutationFn = ({ token, password }: { token: string | undefined, password?: string }) => {
    if (!token) throw new Error("No token provided.");
    return apiClient.post(`/invitations/accept/${token}`, { password });
};

const AcceptAgentInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Fetch the invitation details using the token from the URL
  const { data: inviteDetails, isLoading, isError, error } = useQuery({
      queryKey: ['inviteDetails', token],
      queryFn: () => fetchInviteDetails(token)
  });

  const mutation = useMutation({
      mutationFn: acceptInviteMutationFn,
      onSuccess: (response) => {
          // On success, the backend returns a JWT. Log the user in.
          login(response.data.token);
          navigate('/dashboard'); // Redirect to the dashboard
      },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteDetails.isExistingUser && password !== confirmPassword) {
        mutation.reset();
        mutation.mutate({ token, password: undefined }); // Clear error state
        mutation.setFailureReason(new Error("Passwords do not match."));
        return;
    }
    mutation.mutate({ token, password });
  };

  const renderContent = () => {
    if (isLoading) {
        return <p className="text-center text-slate-300">Verifying Invitation...</p>;
    }
    if (isError || !inviteDetails) {
        return (
            <div className="text-center text-red-400">
                <p>This invitation is invalid or has expired.</p>
                <Link to="/login" className="text-cyan-400 hover:underline mt-4 inline-block">Return to Login</Link>
            </div>
        );
    }
    return (
        <>
            <h1 className="text-3xl font-bold mb-2 text-center">You're Invited!</h1>
            <p className="text-slate-400 text-center mb-8">
                <strong>{inviteDetails.inviterName}</strong> has invited you to join their team as an Agent/Manager.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!inviteDetails.isExistingUser && (
                    <>
                        <p className="text-sm text-center bg-slate-700/50 p-3 rounded-lg">Since you're new, please set a password to create your account.</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Create Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"/>
                        </div>
                    </>
                )}
                 {mutation.isError && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center text-sm">{(mutation.error as any)?.response?.data?.message || (mutation.error as Error).message || 'An error occurred.'}</div>}
                <button type="submit" disabled={mutation.isPending} className="w-full py-3 px-4 rounded-lg font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600">
                    {mutation.isPending ? 'Accepting...' : 'Accept Invitation & Continue'}
                </button>
            </form>
        </>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 shadow-2xl rounded-2xl p-8 sm:p-12">
        {renderContent()}
      </div>
    </div>
  );
};

export default AcceptAgentInvitePage;
