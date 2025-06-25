// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { Chrome } from 'lucide-react';
// REMOVED: import Navbar from '../components/layout/Navbar'; // No longer needed here

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setToken, setUser } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            if (response.data.token && response.data.user) {
                setToken(response.data.token);
                setUser(response.data.user);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // No role selected for login, so no 'state' parameter is needed.
        window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
    };

    return (
        // REMOVED: <Navbar /> // No longer needed here as PublicLayout already provides it
        <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-light-card rounded-3xl shadow-2xl border border-border-color p-8 md:p-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-dark-text">Welcome Back!</h1>
                    <p className="text-light-text mt-2">Log in to your account to continue.</p>
                </div>

                {error && <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg text-center text-sm mb-6">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Email Address</label>
                        <input type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline">
                            <label className="block text-sm font-medium text-light-text mb-1">Password</label>
                            <Link to="/forgot-password" className="text-sm text-brand-primary hover:underline">Forgot Password?</Link>
                        </div>
                        <input type="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="relative flex items-center justify-center my-6">
                    <div className="flex-grow border-t border-border-color"></div>
                    <span className="flex-shrink mx-4 text-light-text text-sm">OR</span>
                    <div className="flex-grow border-t border-border-color"></div>
                </div>

                <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-light-bg hover:bg-gray-100 transition-colors">
                    <Chrome size={20} /> Sign In with Google
                </button>
                
                 <div className="mt-8 text-center text-sm">
                    <p className="text-light-text">
                        Don't have an account? <Link to="/register" className="font-bold text-brand-primary hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
