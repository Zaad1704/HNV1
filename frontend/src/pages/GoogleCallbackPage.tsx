import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');
        const message = urlParams.get('message');

        if (error) {
          // Redirect to login with error
          navigate(`/login?error=${error}&message=${encodeURIComponent(message || 'Google authentication failed')}`, { replace: true });
          return;
        }

        if (token && userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            login(token, userData);
            
            // Redirect based on user role
            if (userData.role === 'Super Admin' || userData.role === 'Super Moderator') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
            navigate('/login?error=auth-verification-failed&message=Failed to process authentication data', { replace: true });
          }
        } else {
          navigate('/login?error=no-token&message=Authentication token not received', { replace: true });
        }
      } catch (error) {
        console.error('Google callback error:', error);
        navigate('/login?error=auth-verification-failed&message=Authentication verification failed', { replace: true });
      }
    };

    handleGoogleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Completing Google Sign-in</h2>
        <p className="text-text-secondary">Please wait while we verify your authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;