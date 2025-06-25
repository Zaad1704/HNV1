// frontend/src/components/admin/PlanFormModal.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
// Ensure you have an IPlan interface or use 'any' for now
// import { IPlan } from '../../../../backend/models/Plan'; 
import { X } from 'lucide-react'; // Import X icon

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark transition-all duration-200">
        <h2 className="text-xl font-bold p-6 border-b border-border-color dark:border-border-color-dark flex justify-between items-center">
          {isEditing ? 'Edit Subscription Plan' : 'Create New Plan'}
          <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark transition-colors"><X size={24} /></button>
        </h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md transition-all duration-200">{error}</p>}
          
          {/* Plan Basic Information */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-1">Plan Name</label>
            <input name="name" id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Basic Landlord, Premium Agent" required className="w-full bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark placeholder-light-text dark:placeholder-light-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
          </div>
          
          {/* Pricing Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-1">Price (USD)</label>
              <input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} placeholder="e.g., 9.99" required className="w-full bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark placeholder-light-text dark:placeholder-light-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
              <p className="text-xs text-light-text dark:text-light-text-dark mt-1">Enter price in USD (e.g., 10.00 for $10).</p>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-1">Billing Cycle</label>
              <select name="duration" id="duration" value={formData.duration} onChange={handleChange} className="w-full bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Plan Limits */}
          <label className="block text-sm font-medium text-light-text dark:text-light-text-dark pt-2">Subscription Limits</label>
          <div className="grid grid-cols-3 gap-4">
             <div>
                <label htmlFor="maxProperties" className="sr-only">Max Properties</label>
                <input type="number" name="limits.maxProperties" id="maxProperties" value={formData.limits.maxProperties} onChange={handleChange} placeholder="Max Properties" className="w-full bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark placeholder-light-text dark:placeholder-light-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
                <p className="text-xs text-light-text dark:text-light-text-dark mt-1">Number of properties.</p>
             </div>
             <div>
                <label htmlFor="maxTenants" className="sr-only">Max Tenants</label>
                <input type="number" name="limits.maxTenants" id="maxTenants" value={formData.limits.maxTenants} onChange={handleChange} placeholder="Max Tenants" className="w-full bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark placeholder-light-text dark:placeholder-light-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
                <p className="text-xs text-light-text dark:text-light-text-dark mt-1">Number of tenants.</p>
             </div>
             <div>
                <label htmlFor="maxAgents" className="sr-only">Max Agents</label>
                <input type="number" name="limits.maxAgents" id="maxAgents" value={formData.limits.maxAgents} onChange={handleChange} placeholder="Max Agents" className="w-full bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark placeholder-light-text dark:placeholder-light-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
                <p className="text-xs text-light-text dark:text-light-text-dark mt-1">Number of agent users.</p>
             </div>
          </div>
          
          {/* Plan Features */}
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-1">Features (comma-separated list)</label>
            <textarea name="features" id="features" value={formData.features} onChange={handleChange} required rows={3} className="w-full bg-light-bg dark:bg-dark-bg p-3 rounded-lg border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark placeholder-light-text dark:placeholder-light-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" placeholder="e.g., Unlimited Properties, Advanced Reporting, Email Support"></textarea>
            <p className="text-xs text-light-text dark:text-light-text-dark mt-1">List key features, separated by commas.</p>
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="h-4 w-4 rounded text-brand-primary dark:text-brand-secondary border-border-color dark:border-border-color-dark focus:ring-brand-primary transition-colors"/>
            <label htmlFor="isPublic" className="text-light-text dark:text-light-text-dark text-sm">Visible on public pricing page</label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors duration-200">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanFormModal;
