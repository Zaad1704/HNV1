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
        <div className="min-h-screen bg-light-bg flex flex-col p-4 items-center justify-center">
            <div className="w-full max-w-4xl bg-light-card grid md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden border border-border-color">
                <div className="hidden md:flex flex-col justify-center p-12 order-1 md:order-2" style={{ background: 'linear-gradient(165deg, #1A759F, #168AAD)'}}> {/* Updated gradient to new brand colors */}
                    <h2 className="text-dark-text text-3xl font-bold mb-4">A smarter way to manage properties.</h2>
                    <p className="text-light-text mb-6">Our platform provides the tools, security, and support you need to grow your business.</p>
                    <div className="mt-4 border-t border-border-color pt-6">
                        <p className="text-light-text text-sm">Don't have an account?</p>
                        <Link to="/register" className="font-bold text-brand-primary hover:underline transition-colors">Sign Up Here</Link>
                    </div>
                </div>
                
                <div className="p-8 sm:p-12 order-2 md:order-1 flex flex-col justify-center bg-light-card">
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" width="40" height="40" />
                            <span className="text-xl font-bold text-dark-text">{settings?.logos?.companyName || 'HNV Solutions'}</span>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-dark-text">Welcome Back!</h1>
                    <p className="text-light-text mb-8">Log in to your account to continue.</p>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-center text-sm"><span>{error}</span></div>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-light-text">Email Address</label>
                            <input type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-light-card border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text transition-all" />
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="password"className="block text-sm font-medium text-light-text">Password</label>
                                <Link to="/forgot-password" className="text-sm text-brand-primary hover:underline transition-colors">Forgot Password?</Link>
                            </div>
                            <input type="password" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-light-card border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text transition-all" />
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-white bg-brand-primary hover:bg-brand-secondary transition-all duration-200 disabled:opacity-50">
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                    <div className="relative flex items-center justify-center py-4">
                        <div className="flex-grow border-t border-border-color"></div>
                        <span className="flex-shrink mx-4 text-light-text text-sm">OR</span>
                        <div className="flex-grow border-t border-border-color"></div>
                    </div>
                    <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-light-card hover:bg-brand-subtle/50 transition-all duration-200">
                        <Chrome size={20} /> Sign In with Google
                    </button>
                    <div className="mt-8 text-center text-xs text-light-text">
                        By signing in, you agree to our 
                        <Link to="/terms" target="_blank" className="underline hover:text-brand-primary transition-colors"> Terms</Link> and 
                        <Link to="/privacy" target="_blank" className="underline hover:text-brand-primary transition-colors"> Privacy Policy</Link>.
                    </div>
                </div>
              </div>
        </div>
    );
};

export default LoginPage;
