import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google auth error:', error);
      navigate('/login?error=google-auth-failed');
      return;
    }

    if (token) {
      // Decode token to get user info (in production, validate token properly)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          _id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role || 'Landlord'
        };
        
        login(token, user);
        navigate('/dashboard');
      } catch (error) {
        console.error('Token parsing error:', error);
        navigate('/login?error=invalid-token');
      }
    } else {
      navigate('/login?error=no-token');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;