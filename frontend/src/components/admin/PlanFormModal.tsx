import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const PlanFormModal = ({ isOpen, onClose, onSave, plan }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '0.00',
    duration: 'monthly',
    features: '',
    limits: {
      maxProperties: 1,
      maxTenants: 5,
      maxAgents: 1,
    }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price ? (plan.price / 100).toFixed(2) : '0.00',
        duration: plan.duration || 'monthly',
        features: plan.features ? plan.features.join(', ') : '',
        limits: {
          maxProperties: plan.limits?.maxProperties || 1,
          maxTenants: plan.limits?.maxTenants || 5,
          maxAgents: plan.limits?.maxAgents || 1,
        }
      });
    } else {
      setFormData({
        name: '', price: '0.00', duration: 'monthly', features: '',
        limits: { maxProperties: 1, maxTenants: 5, maxAgents: 1 }
      });
    }
  }, [plan, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('limits.')) {
        const limitKey = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            limits: { ...prev.limits, [limitKey]: Number(value) }
        }));
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const submissionData = {
        name: formData.name,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        duration: formData.duration,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        limits: formData.limits,
      }; // FIX: The object was not properly closed here.

      if (plan) {
        await apiClient.put(`/plans/${plan._id}`, submissionData);
      } else {
        await apiClient.post('/plans', submissionData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to save plan. Please check the details and ensure the name is unique.');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-white text-xl font-bold p-6 border-b border-slate-700">
          {plan ? 'Edit Subscription Plan' : 'Create New Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
          
          <div>
              <label htmlFor="name" className="text-slate-300 text-sm font
