import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserCheck, Lock } from 'lucide-react';

const AcceptAgentInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const acceptInviteMutation = useMutation({
    mutationFn: async (data: { token: string; password?: string }) => {
      const response = await apiClient.post('/auth/accept-agent-invite', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to accept invitation');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (token) {
      acceptInviteMutation.mutate({ token, password });
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Accept Invitation</h1>
          <p className="text-text-secondary">Set your password to complete registration</p>
        </div>

        <div className="app-surface rounded-3xl p-8 border border-app-border shadow-app-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-center text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder="Create your password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={acceptInviteMutation.isLoading}
              className="w-full btn-gradient py-4 text-lg font-semibold rounded-2xl disabled:opacity-50"
            >
              {acceptInviteMutation.isLoading ? 'Processing...' : 'Accept Invitation'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptAgentInvitePage;