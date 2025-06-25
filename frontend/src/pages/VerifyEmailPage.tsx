import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { CircleCheck, AlertTriangle, LoaderCircle } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await apiClient.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(res.data.message);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verifyToken();
    }, [token]);

    const renderIcon = () => {
        switch (status) {
            case 'verifying':
                return <LoaderCircle className="w-16 h-16 text-brand-primary dark:text-brand-secondary animate-spin" />;
            case 'success':
                return <CircleCheck className="w-16 h-16 text-green-500" />;
            case 'error':
                return <AlertTriangle className="w-16 h-16 text-red-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-light-card dark:bg-dark-card text-center shadow-2xl rounded-xl p-8 sm:p-12 border border-border-color dark:border-border-color-dark transition-all duration-200">
                <div className="mx-auto mb-6 w-16 h-16">
                    {renderIcon()}
                </div>
                <h1 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-4">
                    {status === 'verifying' && 'Verification in Progress'}
                    {status === 'success' && 'Verification Successful'}
                    {status === 'error' && 'Verification Failed'}
                </h1>
                <p className="text-light-text dark:text-light-text-dark mb-8">{message}</p>
                {status !== 'verifying' && (
                     <Link 
                        to="/login" 
                        className="w-full inline-block py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-secondary transition-colors duration-200"
                    >
                        Proceed to Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
