import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await apiClient.get(`/api/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (err: any) {
        console.error('Email verification error:', err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Mail size={32} className="text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Verifying Email...</h1>
            <p className="text-text-secondary">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Email Verified!</h1>
            <p className="text-text-secondary mb-8">{message}</p>
            <Link 
              to="/login" 
              className="btn-gradient px-8 py-3 rounded-2xl inline-flex items-center gap-2"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Verification Failed</h1>
            <p className="text-text-secondary mb-8">{message}</p>
            <div className="space-y-4">
              <Link 
                to="/register" 
                className="btn-gradient px-8 py-3 rounded-2xl inline-flex items-center gap-2"
              >
                Register Again
              </Link>
              <div>
                <Link 
                  to="/login" 
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;