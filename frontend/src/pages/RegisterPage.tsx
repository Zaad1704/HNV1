import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client"; 
import { useAuthStore } from "../store/authStore";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleRoleSelect = (role: string) => { /* ... remains the same ... */ };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... remains the same ... */ };

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
      if (response.data.token) {
        login(response.data.token);
        navigate('/dashboard');
      } else {
        throw new Error("Token not found in registration response");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  
  // ... all JSX remains the same, just ensure the onSubmit for the form is handleRegister
  return (
    // ... your full RegisterPage JSX ...
  );
};

export default RegisterPage;
