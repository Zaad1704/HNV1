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
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-light-card dark:bg-dark-card shadow-2xl rounded-xl p-8 sm:p-12 border border-border-color dark:border-border-color-dark">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-12" width="48" height="48" />
                    </Link>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-center text-dark-text dark:text-dark-text-dark">Welcome Back!</h1>
                <p className="text-light-text dark:text-light-text-dark text-center mb-8">Log in to your account to continue.</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm"><span>{error}</span></div>}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-gray-300">Email Address</label>
                        <input type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-secondary focus:outline-none text-dark-text dark:text-white" />
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="password"className="block text-sm font-medium text-light-text dark:text-gray-300">Password</label>
                            <Link to="/forgot-password" className="text-sm text-brand-primary dark:text-brand-secondary hover:underline">Forgot Password?</Link>
                        </div>
                        <input type="password" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-secondary focus:outline-none text-dark-text dark:text-white" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-opacity-90 transition-colors disabled:opacity-50">
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="relative flex items-center justify-center py-6">
                    <div className="flex-grow border-t border-border-color dark:border-border-color-dark"></div>
                    <span className="flex-shrink mx-4 text-light-text dark:text-light-text-dark text-sm">OR</span>
                    <div className="flex-grow border-t border-border-color dark:border-border-color-dark"></div>
                </div>

                <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color dark:border-border-color-dark rounded-lg shadow-sm font-semibold text-dark-text dark:text-dark-text-dark bg-light-card dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                    <Chrome size={20} /> Sign In with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
