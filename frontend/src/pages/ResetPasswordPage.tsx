import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post(`/auth/reset-password/${token}`, {
        password: formData.password
      });
      console.log('Reset password response:', response.data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">Password Reset!</h1>
          <p className="text-text-secondary mb-8">
            Your password has been successfully reset. You'll be redirected to login shortly.
          </p>
          <Link 
            to="/login" 
            className="btn-gradient px-8 py-3 rounded-2xl inline-flex items-center gap-2"
          >
            Go to Login
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Reset Password</h1>
          <p className="text-text-secondary">Enter your new password below</p>
        </div>

        <div className="app-surface rounded-3xl p-8 border border-app-border shadow-app-lg">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-center text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-4 text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Reset Password
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;