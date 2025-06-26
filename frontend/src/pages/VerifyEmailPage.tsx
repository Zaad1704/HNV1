import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
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
        const response = await apiClient.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">Verifying Your Email</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
          status === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {status === 'success' ? (
            <CheckCircle size={32} className="text-white" />
          ) : (
            <XCircle size={32} className="text-white" />
          )}
        </div>
        
        <h1 className={`text-3xl font-bold mb-4 ${
          status === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h1>
        
        <p className="text-text-secondary mb-8">
          {message}
        </p>
        
        {status === 'success' ? (
          <Link 
            to="/login" 
            className="btn-gradient px-8 py-3 rounded-2xl inline-flex items-center gap-2 font-semibold"
          >
            Continue to Login
            <ArrowRight size={16} />
          </Link>
        ) : (
          <div className="space-y-4">
            <Link 
              to="/register" 
              className="btn-gradient px-8 py-3 rounded-2xl inline-flex items-center gap-2 font-semibold"
            >
              Try Again
              <ArrowRight size={16} />
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
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
