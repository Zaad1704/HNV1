// frontend/src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from '../api/client';
// REMOVED: import Navbar from "../components/layout/Navbar"; // No longer needed here
import { UserPlus, Chrome } from "lucide-react"; // Added Chrome icon

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

    const handleGoogleSignup = () => {
        if (!formData.role) {
            setError('Please select a role before signing up with Google.');
            return;
        }
        // Encode the role into the 'state' parameter for Google OAuth
        const state = btoa(JSON.stringify({ role: formData.role }));
        window.location.href = `${apiClient.defaults.baseURL}/auth/google?role=${formData.role}&state=${state}`;
    };
    
    const roleCardClasses = "role-card p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 text-center";
    const selectedRoleClasses = "border-brand-primary ring-2 ring-brand-primary/50 shadow-md bg-brand-primary/10";
    const isRoleSelected = !!formData.role;

    return (
        // REMOVED: <Navbar /> // No longer needed here as PublicLayout already provides it
        <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-light-card rounded-3xl shadow-2xl border border-border-color p-8 md:p-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-dark-text">Create Your Account</h1>
                    <p className="text-light-text mt-2">Start your free trial today.</p>
                </div>

                {error && <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg text-center text-sm mb-6">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2">First, choose your role</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div onClick={() => handleRoleSelect('Landlord')} className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-border-color bg-light-bg hover:bg-gray-100'}`}><h3 className="font-bold text-dark-text">Landlord</h3></div>
                            <div onClick={() => handleRoleSelect('Agent')} className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-border-color bg-light-bg hover:bg-gray-100'}`}><h3 className="font-bold text-dark-text">Agent</h3></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Full Name</label>
                        <input type="text" name="name" required onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Create Password</label>
                        <input type="password" name="password" required onChange={handleChange} />
                    </div>

                    <button type="submit" disabled={loading || !isRoleSelected} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                       <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="relative flex items-center justify-center my-6">
                    <div className="flex-grow border-t border-border-color"></div>
                    <span className="flex-shrink mx-4 text-light-text text-sm">OR</span>
                    <div className="flex-grow border-t border-border-color"></div>
                </div>

                <button onClick={handleGoogleSignup} disabled={!isRoleSelected} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-light-bg hover:bg-gray-100 transition-colors">
                    <Chrome size={20} /> Sign Up with Google
                </button>
                
                 <div className="mt-8 text-center text-sm">
                    <p className="text-light-text">
                        Already have an account? <Link to="/login" className="font-bold text-brand-primary hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
