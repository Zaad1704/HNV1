import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, DollarSign, Calendar, Users, Check } from 'lucide-react';
import apiClient from '../api/client';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular: boolean;
  isPublic: boolean;
  maxProperties: number;
  maxUsers: number;
}

const fetchPlans = async (): Promise<Plan[]> => {
  const { data } = await apiClient.get('/super-admin/plans');
  return data.data;
};

const AdminPlansPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 'monthly',
    features: [],
    isPopular: false,
    isPublic: true,
    maxProperties: 10,
    maxUsers: 5,
    maxTenants: 50,
    maxAgents: 3
  });

  const availableFeatures = [
    { id: 'property_management', name: 'Property Management', category: 'core' },
    { id: 'tenant_portal', name: 'Tenant Portal', category: 'core' },
    { id: 'payment_processing', name: 'Payment Processing', category: 'core' },
    { id: 'maintenance_requests', name: 'Maintenance Requests', category: 'core' },
    { id: 'financial_reporting', name: 'Financial Reporting', category: 'reports' },
    { id: 'advanced_analytics', name: 'Advanced Analytics', category: 'reports' },
    { id: 'custom_reports', name: 'Custom Reports', category: 'reports' },
    { id: 'multi_user_access', name: 'Multi-User Access', category: 'collaboration' },
    { id: 'agent_management', name: 'Agent Management', category: 'collaboration' },
    { id: 'role_permissions', name: 'Role & Permissions', category: 'collaboration' },
    { id: 'api_access', name: 'API Access', category: 'integration' },
    { id: 'third_party_integrations', name: 'Third-Party Integrations', category: 'integration' },
    { id: 'white_label', name: 'White Label Branding', category: 'premium' },
    { id: 'priority_support', name: 'Priority Support', category: 'premium' },
    { id: 'custom_domain', name: 'Custom Domain', category: 'premium' }
  ];

  const queryClient = useQueryClient();
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: fetchPlans
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData: any) => apiClient.post('/super-admin/plans', planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      setShowModal(false);
      resetForm();
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiClient.put(`/super-admin/plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      setShowModal(false);
      resetForm();
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/super-admin/plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPlans'] })
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      duration: 'monthly',
      features: [],
      isPopular: false,
      isPublic: true,
      maxProperties: 10,
      maxUsers: 5,
      maxTenants: 50,
      maxAgents: 3
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price / 100,
      duration: plan.duration,
      features: plan.features,
      isPopular: plan.isPopular,
      isPublic: plan.isPublic,
      maxProperties: plan.maxProperties,
      maxUsers: plan.maxUsers,
      maxTenants: (plan as any).maxTenants || 50,
      maxAgents: (plan as any).maxAgents || 3
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
      ...formData,
      price: formData.price * 100
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan._id, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const getFeatureName = (featureId: string) => {
    return availableFeatures.find(f => f.id === featureId)?.name || featureId;
  };

  const getFeaturesByCategory = (category: string) => {
    return availableFeatures.filter(f => f.category === category);
  };

  if (isLoading) {
    return <div className="text-center p-8 text-text-secondary">Loading plans...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Subscription Plans</h1>
          <p className="text-text-secondary mt-1">Manage pricing plans and features</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`app-surface rounded-3xl p-6 border transition-all hover:shadow-app-lg ${
              plan.isPopular ? 'border-brand-orange shadow-app' : 'border-app-border'
            }`}
          >
            {plan.isPopular && (
              <div className="text-center mb-4">
                <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-text-primary">
                  ${(plan.price / 100).toFixed(2)}
                </span>
                <span className="text-text-secondary">/{plan.duration}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  {plan.maxUsers} users
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={12} />
                  {plan.maxProperties} properties
                </div>
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  {(plan as any).maxTenants || 50} tenants
                </div>
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  {(plan as any).maxAgents || 3} agents
                </div>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  {getFeatureName(feature)}
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete plan "${plan.name}"?`)) {
                    deletePlanMutation.mutate(plan._id);
                  }
                }}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>

            <div className="mt-4 flex justify-between text-xs text-text-muted">
              <span>{plan.isPublic ? 'Public' : 'Private'}</span>
              <span>ID: {plan._id.slice(-6)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-surface rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                    placeholder="e.g., Professional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                    placeholder="29.99"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Max Properties
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxProperties}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxProperties: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Max Tenants
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxTenants}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTenants: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Max Agents
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxAgents}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAgents: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-4">
                  Select Features
                </label>
                <div className="space-y-6">
                  {['core', 'reports', 'collaboration', 'integration', 'premium'].map(category => (
                    <div key={category}>
                      <h4 className="font-medium text-text-primary mb-3 capitalize">
                        {category === 'core' ? 'Core Features' : 
                         category === 'reports' ? 'Reporting & Analytics' :
                         category === 'collaboration' ? 'Team Collaboration' :
                         category === 'integration' ? 'Integrations' : 'Premium Features'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getFeaturesByCategory(category).map(feature => (
                          <label key={feature.id} className="flex items-center gap-3 p-3 border border-app-border rounded-xl hover:bg-app-bg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.features.includes(feature.id)}
                              onChange={() => toggleFeature(feature.id)}
                              className="w-4 h-4 text-brand-blue"
                            />
                            <span className="text-sm text-text-primary">{feature.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                    className="w-4 h-4 text-brand-blue"
                  />
                  <span className="text-text-secondary">Mark as Popular</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-brand-blue"
                  />
                  <span className="text-text-secondary">Public Plan</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-app-border text-text-secondary rounded-2xl hover:bg-app-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                  className="btn-gradient px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPlansPage;