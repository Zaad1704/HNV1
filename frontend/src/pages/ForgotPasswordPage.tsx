// frontend/src/pages/ForgotPasswordPage.tsx
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
<div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex items-center justify-center p-4 transition-colors duration-300">
<div className="w-full max-w-md bg-light-card dark:bg-dark-card shadow-xl rounded-2xl p-8 sm:p-12 border border-border-color dark:border-border-color-dark">
<div className="text-center mb-8">
<Link to="/" className="inline-flex items-center gap-3">
<img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" width="40" height="40" /> {/* Added width and height */}
</Link>
</div>
<h1 className="text-3xl font-bold mb-4 text-center">Forgot Your Password?</h1>
<p className="text-light-text dark:text-light-text-dark text-center mb-8">No problem. Enter your email address below, and we'll send you a link to reset it.</p>

{message && <div className="bg-green-500/20 text-green-300 p-3 rounded-lg text-center mb-6">{message}</div>}
{error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center mb-6">{error}</div>}

{!message && (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div>
        <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark"
        />
    </div>
    <div>
        <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-secondary transition-colors disabled:opacity-50">
          <Mail size={18}/> {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
    </div>
  </form>
)}
 <p className="mt-8 text-center text-sm text-light-text dark:text-light-text-dark">
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
