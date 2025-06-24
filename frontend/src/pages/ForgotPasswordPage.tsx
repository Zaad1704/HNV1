import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Mail } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const { data: settings } = useSiteSettings();

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
<div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
<div className="w-full max-w-md bg-light-card shadow-xl rounded-2xl p-8 sm:p-12 border border-border-color">
<div className="text-center mb-8">
<Link to="/" className="inline-flex items-center gap-3">
<img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" />
</Link>
</div>
<h1 className="text-3xl font-bold mb-4 text-center">Forgot Your Password?</h1>
<p className="text-light-text text-center mb-8">No problem. Enter your email address below, and we'll send you a link to reset it.</p>

{message && <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center mb-6">{message}</div>}
{error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-6">{error}</div>}

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
          className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
        />
    </div>
    <div>
        <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors disabled:opacity-50">
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


);
};

export default ForgotPasswordPage;
