import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings'; // Import hook for logo

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.417-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.088,5.574l6.19,5.238C39.988,35.617,44,28.609,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const { data: settings } = useSiteSettings(); // Use settings for logo

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      loginAction(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header link back to landing page */}
        <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
                <img src={settings?.logos?.faviconUrl} alt="logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-brand-dark">{settings?.logos?.companyName || 'HNV Solutions'}</span>
            </Link>
        </div>

        {/* Login Card */}
        <div className="bg-light-card shadow-xl rounded-2xl p-8 sm:p-12">
            <h1 className="text-3xl font-bold mb-8 text-center text-dark-text">Welcome Back</h1>
            
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg font-semibold text-dark-text bg-white border border-border-color hover:bg-gray-50 transition-colors mb-6"
            >
              <GoogleIcon />
              Sign In with Google
            </button>
            
            <div className="flex items-center my-4">
                <hr className="w-full border-border-color" />
                <span className="px-4 text-light-text font-semibold text-sm">OR</span>
                <hr className="w-full border-border-color" />
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                {error && (<div className="bg-red-100 border border-red-200 text-danger px-4 py-3 rounded-lg text-center text-sm" role="alert"><span>{error}</span></div>)}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-light-text">Email Address</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="block text-sm font-medium text-light-text">Password</label>
                        <Link to="/forgot-password" className="text-sm text-brand-primary hover:underline font-medium">
                            Forgot password?
                        </Link>
                    </div>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
                </div>
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors disabled:opacity-50">
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
            </form>
            <p className="mt-8 text-center text-sm text-light-text">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-brand-primary hover:underline">
                    Start your trial
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
