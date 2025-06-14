import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client"; 
import { useAuthStore } from "../store/authStore";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
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
    try {
      const response = await apiClient.post('/auth/register', formData);
      // FIX: Check for the token and call the correct login action from the store
      if (response.data && response.data.token) {
        loginAction(response.data.token);
        navigate('/dashboard');
      } else {
         throw new Error("Registration response did not include a token.");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const roleCardClasses = "role-card p-5 border-2 rounded-lg cursor-pointer transition-all duration-200";
  const selectedRoleClasses = "border-cyan-500 ring-2 ring-cyan-500/50 shadow-lg bg-slate-700";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 sm:p-12 bg-slate-800 order-2 md:order-1">
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-slate-400 mb-8">Start your free trial today.</p>
            <form onSubmit={handleRegister} className="space-y-6">
                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center"><span>{error}</span></div>}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">First, choose your role</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div onClick={() => handleRoleSelect('Landlord')} className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-slate-600 bg-slate-900'}`}><h3 className="font-bold text-base text-white">I am a Landlord</h3></div>
                        <div onClick={() => handleRoleSelect('Agent')} className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-slate-600 bg-slate-900'}`}><h3 className="font-bold text-base text-white">I am an Agent</h3></div>
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
                    <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
                    <input type="email" name="email" id="email" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-300">Create Password</label>
                    <input type="password" name="password" id="password" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                </div>
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-cyan-500 order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-4">Join a Smarter Way to Manage Properties.</h2>
            <p className="text-blue-100 mb-6">Our platform provides the tools, security, and support you need to grow your business.</p>
            <div className="mt-4 border-t border-blue-400/50 pt-6"><p className="text-sm text-blue-200">Already have an account?</p><Link to="/login" className="font-bold text-white hover:underline">Sign In Here</Link></div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
