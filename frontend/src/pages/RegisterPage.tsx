import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from 'api/client';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        try {
            const response = await apiClient.post('/auth/register', formData);
            alert(response.data.message);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };
    
    const roleCardClasses = "role-card p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center";
    const selectedRoleClasses = "border-brand-primary ring-2 ring-brand-primary/50 shadow-md bg-brand-primary/10";

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-dark-text">Create Your Account</h1>
                    <p className="text-light-text">Start your free trial today.</p>
                </div>

                {error && <div className="bg-red-500/10 text-red-600 px-4 py-3 rounded-lg text-center text-sm mb-6">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2">First, choose your role</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div onClick={() => handleRoleSelect('Landlord')} className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-border-color bg-light-bg hover:bg-gray-200/50'}`}><h3 className="font-bold text-dark-text">Landlord</h3></div>
                            <div onClick={() => handleRoleSelect('Agent')} className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-border-color bg-light-bg hover:bg-gray-200/50'}`}><h3 className="font-bold text-dark-text">Agent</h3></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Full Name</label>
                        <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Create Password</label>
                        <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-3 bg-light-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary" />
                    </div>

                    <button type="submit" disabled={loading || !formData.role} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-white bg-brand-primary hover:bg-brand-primary/90 transition-all duration-200 disabled:opacity-50">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                 <div className="mt-6 text-center text-sm">
                    <p className="text-light-text">
                        Already have an account? <Link to="/login" className="font-bold text-brand-primary hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
