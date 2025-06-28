import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, logout } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finalizing login...');

  useEffect(() => {
    const handleAuthentication = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Google authentication failed. Please try again.');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      if (token) {
        try {
          // Store token temporarily and fetch user data
          const response = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Google auth user data:', response.data);
          
          let userData;
          if (response.data.success && response.data.data) {
            userData = response.data.data;
          } else if (response.data.user) {
            userData = response.data.user;
          } else {
            userData = response.data;
          }
          
          // Use the login method from auth store
          login(token, userData);
          
          setStatus('success');
          setMessage('Login successful! Redirecting to dashboard...');
          
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        } catch (error) {
          console.error('Failed to fetch user after Google authentication:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          logout();
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } else {
        setStatus('error');
        setMessage('No authentication token received.');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleAuthentication();
  }, [searchParams, navigate, login, logout]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-3xl">
          {status === 'loading' && (
            <div className="w-16 h-16 app-gradient rounded-full animate-pulse"></div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-red-600" />
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-text-secondary">{message}</p>
        
        {status === 'loading' && (
          <div className="mt-6">
            <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleAuthCallback;