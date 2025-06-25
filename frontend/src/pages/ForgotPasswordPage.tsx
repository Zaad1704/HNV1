// frontend/src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Mail } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await apiClient.post('/password-reset/forgot', { email });
            setMessage(response.data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-light-card rounded-3xl shadow-2xl p-8 md:p-12 border border-border-color">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-dark-text">Forgot Your Password?</h1>
                        <p className="text-light-text mt-2">No problem. Enter your email and we'll send a reset link.</p>
                    </div>

                    {message && <div className="bg-green-500/10 text-green-600 p-3 rounded-lg text-center mb-6">{message}</div>}
                    {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-center mb-6">{error}</div>}

                    {!message && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-light-text">Email Address</label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="mt-1"
                            />
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                              <Mail size={18}/> {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                      </form>
                    )}
                     <p className="mt-8 text-center text-sm text-light-text">
                        Remembered your password?{' '}
                        <Link to="/login" className="font-medium text-brand-primary hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default ForgotPasswordPage;
