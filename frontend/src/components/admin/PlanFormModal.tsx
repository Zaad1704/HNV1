// frontend/src/components/admin/PlanFormModal.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
// Ensure you have an IPlan interface or use 'any' for now
// import { IPlan } from '../../../../backend/models/Plan'; 

const PlanFormModal = ({ isOpen, onClose, onSave, plan }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '0.00',
    duration: 'monthly',
    features: '',
    limits: { maxProperties: 1, maxTenants: 5, maxAgents: 1 },
    isPublic: true,
  });
  const [error, setError] = useState('');
  const isEditing = !!plan;

  useEffect(() => {
    if (isOpen && plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price ? (plan.price / 100).toFixed(2) : '0.00',
        duration: plan.duration || 'monthly',
        features: plan.features ? plan.features.join(', ') : '',
        limits: {
          maxProperties: plan.limits?.maxProperties || 1,
          maxTenants: plan.limits?.maxTenants || 5,
          maxAgents: plan.limits?.maxAgents || 1,
        },
        isPublic: plan.isPublic !== false,
      });
    } else {
      // Reset form on close or when adding new
      setFormData({
        name: '', price: '0.00', duration: 'monthly', features: '',
        limits: { maxProperties: 1, maxTenants: 5, maxAgents: 1 },
        isPublic: true,
      });
    }
  }, [plan, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('limits.')) {
      const limitKey = name.split('.')[1];
      setFormData(prev => ({ ...prev, limits: { ...prev.limits, [limitKey]: Number(value) } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const submissionData = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      };

      if (isEditing) {
        await apiClient.put(`/plans/${plan._id}`, submissionData);
      } else {
        await apiClient.post('/plans', submissionData);
      }
      onSave(); // Trigger refetch of plans list
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700 text-slate-300"> {/* Added text-slate-300 for clarity */}
        <h2 className="text-white text-xl font-bold p-6 border-b border-slate-700">
          {isEditing ? 'Edit Subscription Plan' : 'Create New Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
          
          {/* Plan Basic Information */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Plan Name</label>
            <input name="name" id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Basic Landlord, Premium Agent" required className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:ring-cyan-600 focus:border-cyan-600"/>
          </div>
          
          {/* Pricing Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-1">Price (USD)</label>
              <input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} placeholder="e.g., 9.99" required className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:ring-cyan-600 focus:border-cyan-600"/>
              <p className="text-xs text-slate-400 mt-1">Enter price in USD (e.g., 10.00 for $10).</p>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-1">Billing Cycle</label>
              <select name="duration" id="duration" value={formData.duration} onChange={handleChange} className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white focus:ring-cyan-600 focus:border-cyan-600">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Plan Limits */}
          <label className="block text-sm font-medium text-slate-300 pt-2">Subscription Limits</label>
          <div className="grid grid-cols-3 gap-4">
             <div>
                <label htmlFor="maxProperties" className="sr-only">Max Properties</label> {/* Screen reader only label */}
                <input type="number" name="limits.maxProperties" id="maxProperties" value={formData.limits.maxProperties} onChange={handleChange} placeholder="Max Properties" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:ring-cyan-600 focus:border-cyan-600"/>
                <p className="text-xs text-slate-400 mt-1">Number of properties.</p>
             </div>
             <div>
                <label htmlFor="maxTenants" className="sr-only">Max Tenants</label>
                <input type="number" name="limits.maxTenants" id="maxTenants" value={formData.limits.maxTenants} onChange={handleChange} placeholder="Max Tenants" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:ring-cyan-600 focus:border-cyan-600"/>
                <p className="text-xs text-slate-400 mt-1">Number of tenants.</p>
             </div>
             <div>
                <label htmlFor="maxAgents" className="sr-only">Max Agents</label>
                <input type="number" name="limits.maxAgents" id="maxAgents" value={formData.limits.maxAgents} onChange={handleChange} placeholder="Max Agents" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:ring-cyan-600 focus:border-cyan-600"/>
                <p className="text-xs text-slate-400 mt-1">Number of agent users.</p>
             </div>
          </div>
          
          {/* Plan Features */}
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-slate-300 mb-1">Features (comma-separated list)</label>
            <textarea name="features" id="features" value={formData.features} onChange={handleChange} required rows={3} className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:ring-cyan-600 focus:border-cyan-600" placeholder="e.g., Unlimited Properties, Advanced Reporting, Email Support"></textarea>
            <p className="text-xs text-slate-400 mt-1">List key features, separated by commas.</p>
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="h-4 w-4 rounded text-cyan-600 border-gray-300 focus:ring-cyan-500"/>
            <label htmlFor="isPublic" className="text-slate-300 text-sm">Visible on public pricing page</label>
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
