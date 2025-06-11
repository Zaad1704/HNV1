import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the apiClient to make the real API call
      const response = await apiClient.post('/auth/login', { email, password });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-cyan-500">
            <img src="https://placehold.co/80x80/ffffff/3b82f6?text=HNV" alt="HNV Logo" className="w-20 h-20 rounded-lg mb-6" />
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-blue-100">Sign in to access your property management dashboard and streamline your operations.</p>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 sm:p-12 bg-slate-800">
            <div className="md:hidden text-center mb-8">
                <img src="https://placehold.co/60x60/ffffff/3b82f6?text=HNV" alt="HNV Logo" className="w-16 h-16 rounded-lg mx-auto mb-4" />
                <h1 className="text-3xl font-bold">Welcome Back</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                    <span>{error}</span>
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
                    <input
                    type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                    <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">Forgot password?</a>
                    </div>
                    <input
                    type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                <div>
                    <button type="submit" disabled={loading}
                    className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all disabled:bg-slate-600">
                    {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
                    Start your trial
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

