import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

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
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 shadow-2xl rounded-2xl p-8 sm:p-12">
        <h1 className="text-3xl font-bold mb-4 text-center">Forgot Your Password?</h1>
        <p className="text-slate-400 text-center mb-8">No problem. Enter your email address below, and we'll send you a link to reset it.</p>
        
        {message && <div className="bg-green-500/20 text-green-300 p-3 rounded-lg text-center mb-6">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center mb-6">{error}</div>}

        {!message && ( // Hide the form after a success message is shown
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
            </div>
            <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-cyan-600 hover:bg-
