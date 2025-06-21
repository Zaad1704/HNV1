import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings'; // NEW: Import useSiteSettings
import { Chrome } from 'lucide-react'; // NEW: Import Chrome icon for Google button

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const { data: settings } = useSiteSettings(); // NEW: Use settings for logo

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      loginAction(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle Google Login
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/auth/google`; // Directs to backend Google OAuth initiation
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col p-4">
      <div className="text-center my-8">
        <Link to="/" className="inline-flex items-center gap-3">
            {/* NEW: Implement logo based on site settings */}
            <img src={settings?.logos?.faviconUrl || "/logo-min.png"} alt="logo" className="h-10 w-10" />
            <span className="text-2xl font-bold text-brand-dark">{settings?.logos?.companyName || 'HNV Solutions'}</span>
        </Link>
      </div>

      <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full"> {/* Added max-w-sm mx-auto w-full for centering */}
        <h1 className="text-3xl font-bold text-dark-text mb-2 text-center">Welcome Back!</h1> {/* Added text-center */}
        <p className="text-light-text mb-8 text-center">Log in to your account to continue.</p> {/* Added text-center */}

        <form onSubmit={handleLogin} className="space-y-4">
            {error && (<div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-center text-sm"><span>{error}</span></div>)}
            <div>
                <label className="block text-sm font-medium text-light-text">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-light-card border border-border-color rounded-lg"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-light-text">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-light-card border border-border-color rounded-lg"/>
            </div>
            <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full flex justify-center py-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors">
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </div>
        </form>

        {/* NEW: Google Login Button */}
        <div className="relative flex items-center justify-center py-4">
            <div className="flex-grow border-t border-border-color"></div>
            <span className="flex-shrink mx-4 text-light-text text-sm">OR</span>
            <div className="flex-grow border-t border-border-color"></div>
        </div>
        <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-white hover:bg-gray-100 transition-colors">
            <Chrome size={20} /> Sign In with Google
        </button>

      </div>

       <p className="text-center text-sm text-light-text mt-8 py-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-primary hover:underline">
                Sign Up
            </Link>
        </p>
        <p className="text-center text-sm text-light-text">
            <Link to="/forgot-password" className="font-medium text-brand-primary hover:underline">
                Forgot Password?
            </Link>
        </p>
    </div>
  );
};

export default LoginPage;
