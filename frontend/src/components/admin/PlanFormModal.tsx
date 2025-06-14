import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const PlanFormModal = ({ isOpen, onClose, onSave, plan }) => {
  const [formData, setFormData] = useState({ name: '', price: 0, features: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: (plan.price / 100).toFixed(2), // Convert from cents to dollars for display
        features: plan.features.join(', '), // Convert array to comma-separated string
      });
    } else {
      setFormData({ name: '', price: 0, features: '' });
    }
  }, [plan, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const submissionData = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100), // Convert from dollars to cents for storage
        features: formData.features.split(',').map(f => f.trim()).filter(f => f), // Convert string to array
      };

      if (plan) {
        // Update existing plan
        await apiClient.put(`/plans/${plan._id}`, submissionData);
      } else {
        // Create new plan
        await apiClient.post('/plans', submissionData);
      }
      onSave(); // This will trigger a refetch on the parent page
      onClose();
    } catch (err) {
      setError('Failed to save plan. Please check the details.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-white text-lg font-bold p-4 border-b border-slate-700">
          {plan ? 'Edit Subscription Plan' : 'Create New Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <p className="text-red-400">{error}</p>}
          {/* Form fields for name, price, features... */}
          <div>
              <label className="text-slate-300 text-sm">Plan Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-900 p-2 rounded-md border border-slate-600"/>
          </div>
          <div>
              <label className="text-slate-300 text-sm">Price (in dollars)</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-slate-900 p-2 rounded-md border border-slate-600"/>
          </div>
          <div>
              <label className="text-slate-300 text-sm">Features (comma-separated)</label>
              <textarea name="features" value={formData.features} onChange={handleChange} required rows={3} className="w-full bg-slate-900 p-2 rounded-md border border-slate-600"></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 rounded-md">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanFormModal;
