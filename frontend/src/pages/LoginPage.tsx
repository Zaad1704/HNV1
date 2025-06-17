import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

// ... (GoogleIcon component)

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... (other state variables)

  const handleLogin = async (e: React.FormEvent) => { /* ... */ };
  const handleGoogleLogin = () => { /* ... */ };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 sm:p-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Portal Log In</h1>
            {/* ... (Google Button and OR separator) ... */}
            
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"/>
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                        {/* --- FIX: Updated this link --- */}
                        <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                            Forgot password?
                        </Link>
                    </div>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"/>
                </div>
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600">
                      {loading ? 'Signing In...' : 'Sign In with Email'}
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
