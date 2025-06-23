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
  // FIX: Get setToken instead of loginAction
  const setToken = useAuthStore((state) => state.setToken);
  const { data: settings } = useSiteSettings(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.token) {
        // FIX: Just set the token. App.tsx will handle the rest.
        setToken(response.data.token);
        // The navigation will now be handled by App.tsx's effect after user is fetched
      } else {
        throw new Error("Login response was missing a token.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
      setLoading(false); // Make sure loading is set to false on error
    } 
    // Do not set loading to false in the success case, let the page transition happen.
  };

  // Google Login remains the same
  const handleGoogleLogin = () => {
    const googleAuthUrl = `${apiClient.defaults.baseURL}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  return (
    // The JSX for this component remains unchanged.
    <div className="min-h-screen bg-brand-bg flex flex-col p-4">
      {/* ... rest of your JSX ... */}
    </div>
  );
};

export default LoginPage;
