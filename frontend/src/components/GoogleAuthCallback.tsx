import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=google-auth-failed');
        return;
      }

      if (token) {
        try {
          // Get user info with the token
          const response = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success && response.data.data) {
            login(token, response.data.data);
            navigate('/dashboard');
          } else {
            navigate('/login?error=invalid-token');
          }
        } catch (err) {
          console.error('Google auth callback error:', err);
          navigate('/login?error=auth-failed');
        }
      } else {
        navigate('/login?error=no-token');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;