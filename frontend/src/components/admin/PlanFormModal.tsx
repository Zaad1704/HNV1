import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: any) => void;
  plan?: any;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, onSave, plan }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 'monthly',
    features: '',
    limits: {
      maxProperties: 10,
      maxTenants: 50,
      maxAgents: 5
    },
    isPublic: true
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price?.toString() || '',
        duration: plan.duration || 'monthly',
        features: plan.features || '',
        limits: plan.limits || {
          maxProperties: 10,
          maxTenants: 50,
          maxAgents: 5
        },
        isPublic: plan.isPublic ?? true
      });
    }
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLimitChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      limits: { ...prev.limits, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price)
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="app-surface rounded-3xl shadow-app-xl w-full max-w-lg border border-app-border"
          >
            <div className="flex justify-between items-center p-6 border-b border-app-border">
              <h2 className="text-xl font-bold text-text-primary">
                {plan ? 'Edit Plan' : 'Create Plan'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Plan Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Features</label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Limits</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Properties</label>
                    <input
                      type="number"
                      value={formData.limits.maxProperties}
                      onChange={(e) => handleLimitChange('maxProperties', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Tenants</label>
                    <input
                      type="number"
                      value={formData.limits.maxTenants}
                      onChange={(e) => handleLimitChange('maxTenants', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Agents</label>
                    <input
                      type="number"
                      value={formData.limits.maxAgents}
                      onChange={(e) => handleLimitChange('maxAgents', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="rounded"
                />
                <label className="text-sm text-text-secondary">Public Plan</label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2"
                >
                  <Save size={16} />
                  {plan ? 'Update' : 'Create'} Plan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PlanFormModal;