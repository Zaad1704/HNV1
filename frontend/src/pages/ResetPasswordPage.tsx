import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Get the reset token from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    if (!token) {
        setError('Invalid or missing reset token.');
        setLoading(false);
        return;
    }

    try {
      const response = await apiClient.put(`/password-reset/reset/${token}`, { password });
      setMessage(response.data.message + ' Redirecting to login...');
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-light-card dark:bg-dark-card shadow-2xl rounded-2xl p-8 sm:p-12 border border-border-color dark:border-border-color-dark transition-all duration-200">
        <h1 className="text-3xl font-bold mb-8 text-center">Choose a New Password</h1>
        
        {message && <div className="bg-green-500/20 text-green-300 p-3 rounded-lg text-center mb-6">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center mb-6">{error}</div>}

        {!message && ( // Hide the form after a success message is shown
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-light-text dark:text-light-text-dark">New Password</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark"
                />
            </div>
             <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark"
                />
            </div>
            <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-secondary disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
