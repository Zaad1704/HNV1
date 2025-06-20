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
        price: Math.round(parseFloat(formData.price) * 100),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      };

      if (isEditing) {
        await apiClient.put(`/plans/${plan._id}`, submissionData);
      } else {
        await apiClient.post('/plans', submissionData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700">
        <h2 className="text-white text-xl font-bold p-6 border-b border-slate-700">
          {isEditing ? 'Edit Subscription Plan' : 'Create New Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
          
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Plan Name" required className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
          
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="Price (USD)" required className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
            <select name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
          </div>

          <label className="block text-slate-300 text-sm font-medium pt-2">Plan Limits</label>
          <div className="grid grid-cols-3 gap-4">
             <input type="number" name="limits.maxProperties" value={formData.limits.maxProperties} onChange={handleChange} placeholder="Max Properties" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
             <input type="number" name="limits.maxTenants" value={formData.limits.maxTenants} onChange={handleChange} placeholder="Max Tenants" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
             <input type="number" name="limits.maxAgents" value={formData.limits.maxAgents} onChange={handleChange} placeholder="Max Agents" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600"/>
          </div>
          
          <textarea name="features" value={formData.features} onChange={handleChange} required rows={3} className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600" placeholder="Features (comma-separated)"></textarea>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="h-4 w-4 rounded"/>
            <label htmlFor="isPublic" className="text-slate-300 text-sm">Visible on public pricing page</label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-600 rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-cyan-600 rounded-lg">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanFormModal;
