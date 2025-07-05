import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface VerificationStatus {
  isEmailVerified: boolean;
  email: string;
  verificationDeadline: string;
  hoursRemaining: number;
  isExpired: boolean;
}

const EmailVerificationWarning: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const { data } = await apiClient.get('/auth/verification-status');
      if (data.success) {
        setVerificationStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const { data } = await apiClient.post('/auth/resend-verification');
      if (data.success) {
        // Show success message or toast
        alert('Verification email sent successfully!');
      }
    } catch (error: any) {
      console.error('Failed to resend verification:', error);
      alert(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  // Don't show if user is Super Admin, Google user, or email is already verified
  // Check for Google user by multiple methods
  const authMethod = localStorage.getItem('auth-method');
  const isGoogleUser = (user as any)?.googleId || 
                      (user as any)?.provider === 'google' || 
                      authMethod === 'google' ||
                      user?.email?.includes('@gmail.com') || // Additional check for Gmail users
                      !verificationStatus; // If no verification status, likely Google user
  
  if (user?.role === 'Super Admin' || isGoogleUser || verificationStatus?.isEmailVerified || isDismissed || isLoading) {
    return null;
  }

  const getUrgencyColor = (hoursRemaining: number, isExpired: boolean) => {
    if (isExpired) return 'bg-red-50 border-red-200 text-red-800';
    if (hoursRemaining <= 2) return 'bg-red-50 border-red-200 text-red-800';
    if (hoursRemaining <= 6) return 'bg-orange-50 border-orange-200 text-orange-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  const getUrgencyIcon = (hoursRemaining: number, isExpired: boolean) => {
    if (isExpired) return <AlertTriangle className="text-red-500" size={20} />;
    if (hoursRemaining <= 2) return <AlertTriangle className="text-red-500" size={20} />;
    if (hoursRemaining <= 6) return <Clock className="text-orange-500" size={20} />;
    return <Mail className="text-yellow-500" size={20} />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`mx-4 mb-6 p-4 rounded-2xl border-2 ${getUrgencyColor(verificationStatus?.hoursRemaining || 0, verificationStatus?.isExpired || false)} relative`}
      >
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex-shrink-0 mt-0.5">
            {getUrgencyIcon(verificationStatus?.hoursRemaining || 0, verificationStatus?.isExpired || false)}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              {verificationStatus?.isExpired ? 'Account Restricted - Verify Email' : 'Email Verification Required'}
            </h3>
            
            <p className="mb-3 text-sm">
              {verificationStatus?.isExpired ? (
                <>
                  Your email address <strong>{verificationStatus?.email}</strong> verification has expired.
                  <span className="block mt-1 font-semibold text-red-700">
                    🔒 Your account is now restricted to view-only access. Verify your email to restore full functionality!
                  </span>
                </>
              ) : (
                <>
                  Please verify your email address <strong>{verificationStatus?.email}</strong> within{' '}
                  <strong>{verificationStatus?.hoursRemaining} hours</strong> to maintain full access.
                  {verificationStatus?.hoursRemaining <= 2 && (
                    <span className="block mt-1 font-semibold">
                      ⚠️ Account will be restricted to view-only after expiration!
                    </span>
                  )}
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="flex items-center gap-2 bg-white border border-current px-4 py-2 rounded-xl font-semibold hover:bg-black/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                {isResending ? 'Sending...' : 'Verify Now'}
              </button>
              
              <div className="text-xs opacity-75">
                Check your email inbox and spam folder for the verification link.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailVerificationWarning;