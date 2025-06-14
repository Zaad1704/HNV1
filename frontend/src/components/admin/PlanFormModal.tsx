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
        price: Math.round(parseFloat(formData.price) * 100),
        duration: formData.duration,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        limits: formData.limits,
      };

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
              <label htmlFor="name" className="text-slate-300 text-sm font-medium">Plan Name</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 bg-slate-900 p-3 rounded-lg border border-slate-600"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="price" className="text-slate-300 text-sm font-medium">Price (in dollars)</label>
                <input id="price" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full mt-1 bg-slate-900 p-3 rounded-lg border border-slate-600"/>
            </div>
            <div>
                <label htmlFor="duration" className="text-slate-300 text-sm font-medium">Duration</label>
                <select id="duration" name="duration" value={formData.duration} onChange={handleChange} className="w-full mt-1 bg-slate-900 p-3 rounded-lg border border-slate-600">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>
          </div>

          <div>
              <label className="text-slate-300 text-sm font-medium">Plan Limits</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                 <input aria-label="Max Properties" type="number" name="limits.maxProperties" value={formData.limits.maxProperties} onChange={handleChange} placeholder="Max Properties" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
                 <input aria-label="Max Tenants" type="number" name="limits.maxTenants" value={formData.limits.maxTenants} onChange={handleChange} placeholder="Max Tenants" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
                 <input aria-label="Max Agents" type="number" name="limits.maxAgents" value={formData.limits.maxAgents} onChange={handleChange} placeholder="Max Agents" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
              </div>
          </div>
          
          <div>
              <label htmlFor="features" className="text-slate-300 text-sm font-medium">Features (comma-separated)</label>
              <textarea id="features" name="features" value={formData.features} onChange={handleChange} required rows={4} className="w-full mt-1 bg-slate-900 p-3 rounded-lg border border-slate-600" placeholder="e.g. Feature One, Another Feature, Premium Support"></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanFormModal;
