// frontend/src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Chrome } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const navigate = useNavigate();
    const { setUser, setToken } = useAuthStore();
    const { data: settings } = useSiteSettings();

    const handleRoleSelect = (role: string) => {
        setFormData({ ...formData, role });
        if (error === 'Please select a role.') setError('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!formData.role) {
            setError('Please select a role.');
            setLoading(false);
            return;
        }
        if (!agreedToTerms) {
            setError('You must agree to the Terms and Conditions and Privacy Policy.');
            setLoading(false);
            return;
        }
        try {
            const response = await apiClient.post('/auth/register', formData);
            // The backend returns a success message, not token/user directly on register,
            // as email verification is required first.
            // If the backend is changed to return token/user on immediate registration,
            // then the lines below would be uncommented.
            // setToken(response.data.token);
            // setUser(response.data.user);
            // navigate('/dashboard');
            alert(response.data.message); // Show success message from backend
            navigate('/login'); // Redirect to login for verification
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        if (!formData.role) {
            setError('Please select a role (Landlord or Agent) before signing up with Google.');
            return;
        }
        const roleQueryParam = `?role=${formData.role}`;
        window.location.href = `${import.meta.env.VITE_API_URL || ''}/auth/google${roleQueryParam}`;
    };

    const roleCardClasses = "role-card p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center";
    const selectedRoleClasses = "border-brand-primary ring-2 ring-brand-primary/50 shadow-md bg-brand-secondary";

    return (
        <div className="min-h-screen bg-light-bg flex items-center justify-center p-4 dark:bg-dark-bg">
            <div className="w-full max-w-4xl bg-light-card grid md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden border border-border-color dark:bg-dark-card dark:border-border-color-dark">
                {/* Right Side Panel */}
                <div className="hidden md:flex flex-col justify-center p-12 order-1 md:order-2" style={{ background: 'linear-gradient(165deg, var(--brand-primary), var(--brand-secondary))' }}>
                    <h2 className="text-dark-text dark:text-dark-text-dark text-3xl font-bold mb-4">A smarter way to manage properties.</h2>
                    <p className="text-light-text dark:text-light-text-dark mb-6">Our platform provides the tools, security, and support you need to grow your business.</p>
                    <div className="mt-4 border-t border-border-color dark:border-border-color-dark pt-6">
                        <p className="text-light-text dark:text-light-text-dark text-sm">Already have an account?</p>
                        <Link to="/login" className="font-bold text-brand-accent-dark hover:underline">Sign In Here</Link>
                    </div>
                </div>

                {/* Left Side Form */}
                <div className="p-8 sm:p-12 order-2 md:order-1 flex flex-col justify-center bg-light-card dark:bg-dark-card">
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" width="40" height="40" />
                            <span className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{settings?.logos?.companyName || 'HNV Solutions'}</span>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-dark-text dark:text-dark-text-dark">Create Your Account</h1>
                    <p className="text-light-text dark:text-light-text-dark mb-8">Start your free trial today.</p>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-center text-sm mb-6"><span>{error}</span></div>}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-2">First, choose your role</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div onClick={() => handleRoleSelect('Landlord')} className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-border-color bg-light-bg hover:bg-light-bg/50 dark:bg-dark-bg/50 dark:hover:bg-dark-bg/70 dark:border-border-color-dark'}`}><h3 className="font-bold text-dark-text dark:text-dark-text-dark">I am a Landlord</h3></div>
                                <div onClick={() => handleRoleSelect('Agent')} className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-border-color bg-light-bg hover:bg-light-bg/50 dark:bg-dark-bg/50 dark:hover:bg-dark-bg/70 dark:border-border-color-dark'}`}><h3 className="font-bold text-dark-text dark:text-dark-text-dark">I am an Agent</h3></div>
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Full Name</label>
                                <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Email Address</label>
                                <input type="email" name="email" id="email" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark" />
                            </div>
                            <div>
                                <label htmlFor="password"className="block text-sm font-medium text-light-text dark:text-light-text-dark">Create Password</label>
                                <input type="password" name="password" id="password" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark" />
                            </div>

                            <div className="flex items-start space-x-3">
                                <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 mt-1 text-brand-primary bg-brand-secondary border-border-color rounded focus:ring-brand-primary" />
                                <div className="text-sm">
                                    <label htmlFor="terms" className="font-medium text-light-text dark:text-light-text-dark">I agree to the <Link to="/terms" target="_blank" className="text-brand-accent-dark hover:underline">Terms</Link> and <Link to="/privacy" target="_blank" className="text-brand-accent-dark hover:underline">Privacy Policy</Link>.</label>
                                </div>
                            </div>

                            <button type="submit" disabled={loading || !agreedToTerms || !formData.role} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="relative flex items-center justify-center">
                            <div className="flex-grow border-t border-border-color dark:border-border-color-dark"></div>
                            <span className="flex-shrink mx-4 text-light-text dark:text-light-text-dark text-sm">OR</span>
                            <div className="flex-grow border-t border-border-color dark:border-border-color-dark"></div>
                        </div>
                        
                        {/* --- SOLUTION: Disabled state added to Google button --- */}
                        <button onClick={handleGoogleSignup} disabled={!formData.role} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-light-card hover:bg-brand-subtle/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed dark:bg-dark-card dark:border-border-color-dark dark:text-dark-text-dark dark:hover:bg-dark-bg/50">
                            <Chrome size={20} /> Sign Up with Google
                        </button>
                        {!formData.role && <p className="text-center text-xs text-brand-subtle">Please select a role above to enable Google Sign-Up.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
