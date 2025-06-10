import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client"; // Corrected: Import the default export
import { useAuthStore } from "../store/authStore"; // Corrected: Import as named export

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.role) {
      setError('Please select a role (Landlord or Agent).');
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', formData);
      const { token } = response.data;
      login(token);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  const roleCardClasses = "role-card p-5 border-2 rounded-lg cursor-pointer transition-all duration-200";
  const selectedRoleClasses = "border-indigo-600 ring-2 ring-indigo-300 shadow-lg";

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="https://placehold.co/50x50/4338ca/ffffff?text=HNV" alt="HNV Logo" className="h-12 w-12 rounded-lg mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Create Your Account</h1>
          <p className="text-gray-500 mt-2">Join to streamline your property management.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First, choose your role</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => handleRoleSelect('Landlord')}
                className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-gray-300'}`}
              >
                <h3 className="font-bold text-lg text-gray-800">I am a Landlord</h3>
                <p className="text-sm text-gray-600 mt-1">I own properties and manage my own portfolio.</p>
              </div>
              <div
                onClick={() => handleRoleSelect('Agent')}
                className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-gray-300'}`}
              >
                <h3 className="font-bold text-lg text-gray-800">I am an Agent</h3>
                <p className="text-sm text-gray-600 mt-1">I manage properties for multiple owners.</p>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" id="email" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Create Password</label>
            <input type="password" name="password" id="password" required onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create Account
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
