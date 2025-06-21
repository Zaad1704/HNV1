import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client"; 
import { useAuthStore } from "../store/authStore";
import { useSiteSettings } from "../hooks/useSiteSettings"; // NEW: Import useSiteSettings
import { Chrome } from 'lucide-react'; // NEW: Import Chrome icon for Google button

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const { data: settings } = useSiteSettings(); // NEW: Use settings for logo

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
      loginAction(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle Google Signup (same endpoint as login, backend handles new users)
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/auth/google`; // Directs to backend Google OAuth initiation
  };

  const roleCardClasses = "role-card p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center";
  const selectedRoleClasses = "border-brand-primary ring-2 ring-brand-primary/50 shadow-md bg-indigo-50";

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-light-card grid md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden border border-border-color">
        {/* Form Column */}
        <div className="p-8 sm:p-12 order-2 md:order-1 flex flex-col justify-center">
            <div className="mb-8">
                 <Link to="/" className="inline-flex items-center gap-3">
                    {/* NEW: Implement logo based on site settings */}
                    <img src={settings?.logos?.faviconUrl || "/logo-min.png"} alt="logo" className="h-8 w-8" />
                    <span className="text-xl font-bold text-brand-dark">{settings?.logos?.companyName || 'HNV Solutions'}</span>
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-light-text mb-8">Start your free trial today.</p>
            <form onSubmit={handleRegister} className="space-y-6">
                {error && <div className="bg-red-100 border border-red-200 text-danger px-4 py-3 rounded-lg text-center text-sm"><span>{error}</span></div>}
                <div>
                    <label className="block text-sm font-medium text-light-text mb-2">First, choose your role</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div onClick={() => handleRoleSelect('Landlord')} className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-border-color bg-brand-bg hover:bg-gray-100'}`}><h3 className="font-bold text-base">I am a Landlord</h3></div>
                        <div onClick={() => handleRoleSelect('Agent')} className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-border-color bg-brand-bg hover:bg-gray-100'}`}><h3 className="font-bold text-base">I am an Agent</h3></div>
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-light-text">Full Name</label>
                    <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-light-text">Email Address</label>
                    <input type="email" name="email" id="email" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-light-text">Create Password</label>
                    <input type="password" name="password" id="password" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors disabled:opacity-50">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>
            </form>

            {/* NEW: Google Signup Button */}
            <div className="relative flex items-center justify-center py-4">
                <div className="flex-grow border-t border-border-color"></div>
                <span className="flex-shrink mx-4 text-light-text text-sm">OR</span>
                <div className="flex-grow border-t border-border-color"></div>
            </div>
            <button onClick={handleGoogleSignup} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-white hover:bg-gray-100 transition-colors">
                <Chrome size={20} /> Sign Up with Google
            </button>

        </div>
        {/* Gradient Promo Column */}
        <div className="hidden md:flex flex-col justify-center p-12 order-1 md:order-2" style={{ background: 'linear-gradient(165deg, #3D52A0, #7091E6)'}}>
            <h2 className="text-3xl font-bold text-white mb-4">A smarter way to manage properties.</h2>
            <p className="text-indigo-200 mb-6">Our platform provides the tools, security, and support you need to grow your business.</p>
            <div className="mt-4 border-t border-white/20 pt-6">
                <p className="text-sm text-indigo-100">Already have an account?</p>
                <Link to="/login" className="font-bold text-white hover:underline">Sign In Here</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
