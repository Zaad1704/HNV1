// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Chrome } from 'lucide-react'; 

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setToken, setUser } = useAuthStore();
    const { data: settings } = useSiteSettings();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            if (response.data.token && response.data.user) {
                setToken(response.data.token);
                setUser(response.data.user);
                navigate('/dashboard', { replace: true });
            } else {
                throw new Error("Login response was missing token or user data.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-light-card rounded-2xl shadow-xl border border-border-color p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-dark-text">Welcome Back!</h1>
                    <p className="text-light-text">Log in to your account to continue.</p>
                </div>

                {error && <div className="bg-red-500/10 text-red-600 px-4 py-3 rounded-lg text-center text-sm mb-6">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Email Address</label>
                        <input type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Password</label>
                        <input type="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                 <div className="mt-6 text-center text-sm">
                    <p className="text-light-text">
                        Don't have an account? <Link to="/register" className="font-bold text-brand-primary hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
