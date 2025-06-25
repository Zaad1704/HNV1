import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Chrome, CircleCheck } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
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
            setError('Please select a role (Landlord or Agent).');
            setLoading(false);
            return;
        }
        if (!agreedToTerms) {
            setError('You must agree to the Terms and Conditions and Privacy Policy.');
            setLoading(false);
            return;
        }
        try {
            await apiClient.post('/auth/register', formData);
            setIsSuccess(true);
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

    if (isSuccess) {
        return (
             <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-light-card dark:bg-dark-card text-center shadow-2xl rounded-xl p-8 sm:p-12 border border-border-color dark:border-border-color-dark">
                    <CircleCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-4">Registration Successful!</h1>
                    <p className="text-light-text dark:text-light-text-dark mb-8">
                        A verification link has been sent to your email address. Please check your inbox and follow the link to activate your account.
                    </p>
                    <Link 
                        to="/login" 
                        className="w-full inline-block py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-opacity-90 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    const roleCardClasses = "role-card p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center";
    const selectedRoleClasses = "border-brand-primary ring-2 ring-brand-primary/50 shadow-md bg-brand-secondary/10 dark:bg-dark-card";

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-light-card dark:bg-dark-card shadow-xl rounded-xl p-8 sm:p-12 border border-border-color dark:border-border-color-dark">
                 <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-12" />
                    </Link>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-dark-text dark:text-dark-text-dark text-center">Create Your Account</h1>
                <p className="text-light-text dark:text-light-text-dark mb-8 text-center">Start your free trial today.</p>

                {error && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm mb-6"><span>{error}</span></div>}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-2">First, choose your role</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div onClick={() => handleRoleSelect('Landlord')} className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-border-color dark:border-border-color-dark bg-gray-50 dark:bg-dark-bg hover:bg-gray-100'}`}><h3 className="font-bold text-dark-text dark:text-dark-text-dark">I am a Landlord</h3></div>
                            <div onClick={() => handleRoleSelect('Agent')} className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-border-color dark:border-border-color-dark bg-gray-50 dark:bg-dark-bg hover:bg-gray-100'}`}><h3 className="font-bold text-dark-text dark:text-dark-text-dark">I am an Agent</h3></div>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-gray-300">Full Name</label>
                            <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-secondary focus:outline-none text-dark-text dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-gray-300">Email Address</label>
                            <input type="email" name="email" id="email" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-secondary focus:outline-none text-dark-text dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-light-text dark:text-gray-300">Create Password</label>
                            <input type="password" name="password" id="password" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-secondary focus:outline-none text-dark-text dark:text-white" />
                        </div>

                        <div className="flex items-start space-x-3">
                            <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 mt-1 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-primary" />
                            <div className="text-sm">
                                <label htmlFor="terms" className="font-medium text-light-text dark:text-gray-300">I agree to the <Link to="/terms" target="_blank" className="text-brand-primary dark:text-brand-secondary hover:underline">Terms</Link> and <Link to="/privacy" target="_blank" className="text-brand-primary dark:text-brand-secondary hover:underline">Privacy Policy</Link>.</label>
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !agreedToTerms || !formData.role} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                     <p className="mt-8 text-center text-sm text-light-text dark:text-gray-300">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-brand-primary dark:text-brand-secondary hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
