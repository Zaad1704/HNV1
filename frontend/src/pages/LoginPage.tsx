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
  // FIX: Get both setToken and setUser actions from the auth store.
  const { setToken, setUser } = useAuthStore();
  const { data: settings } = useSiteSettings();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      // FIX: Check for both token and user data in the response.
      if (response.data.token && response.data.user) {
        // FIX: Set both the token and the user object in the global state.
        setToken(response.data.token);
        setUser(response.data.user);
        
        // FIX: Navigate to the dashboard immediately after state is set.
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error("Login response was missing token or user data.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
      setLoading(false); // Ensure loading is reset on error.
    }
    // No longer need to manage the loading state on success, as the page will navigate away.
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `${apiClient.defaults.baseURL}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col p-4">
        <header className="absolute top-0 left-0 right-0 p-4">
            <div className="container mx-auto flex justify-center">
                 <Link to="/" className="inline-flex items-center gap-3">
                    <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" />
                    <span className="text-xl font-bold text-brand-dark">{settings?.logos?.companyName || 'HNV Solutions'}</span>
                </Link>
            </div>
        </header>
      <div className="w-full max-w-4xl m-auto bg-light-card grid md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden border border-border-color">
        <div className="hidden md:flex flex-col justify-center p-12 order-1" style={{ background: 'linear-gradient(165deg, #3D52A0, #7091E6)'}}>
            <h2 className="text-3xl font-bold text-white mb-4">A smarter way to manage properties.</h2>
            <p className="text-indigo-200 mb-6">Our platform provides the tools, security, and support you need to grow your business.</p>
            <div className="mt-4 border-t border-white/20 pt-6">
                <p className="text-sm text-indigo-100">Don't have an account?</p>
                <Link to="/register" className="font-bold text-white hover:underline">Sign Up Here</Link>
            </div>
        </div>
        
        <div className="p-8 sm:p-12 order-2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-light-text mb-8">Log in to your account to continue.</p>
            <form onSubmit={handleLogin} className="space-y-6">
                {error && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm"><span>{error}</span></div>}
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-light-text">Email Address</label>
                    <input type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>
                <div>
                    <div className="flex justify-between items-baseline">
                        <label htmlFor="password"className="block text-sm font-medium text-light-text">Password</label>
                        <Link to="/forgot-password" className="text-sm text-brand-primary hover:underline">Forgot Password?</Link>
                    </div>
                    <input type="password" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors disabled:opacity-50">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
            </form>
             <div className="relative flex items-center justify-center py-4">
                <div className="flex-grow border-t border-border-color"></div>
                <span className="flex-shrink mx-4 text-light-text text-sm">OR</span>
                <div className="flex-grow border-t border-border-color"></div>
            </div>
            <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-white hover:bg-gray-100 transition-colors">
                <Chrome size={20} /> Sign In with Google
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
