import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import PlanFormModal from '../components/admin/PlanFormModal';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string;
  limits: {
    maxProperties: number;
    maxTenants: number;
    maxAgents: number;
  };
  isPublic: boolean;
}

const fetchPlans = async (): Promise<Plan[]> => {
  const { data } = await apiClient.get('/plans');
  return data.data;
};

const createPlan = async (plan: Omit<Plan, '_id'>) => {
  const { data } = await apiClient.post('/plans', plan);
  return data.data;
};

const updatePlan = async ({ id, ...plan }: { id: string } & Partial<Plan>) => {
  const { data } = await apiClient.put(`/plans/${id}`, plan);
  return data.data;
};

const deletePlan = async (planId: string) => {
  await apiClient.delete(`/plans/${planId}`);
};

const AdminPlansPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: fetchPlans
  });

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPlans']);
      setShowModal(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPlans']);
      setShowModal(false);
      setEditingPlan(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPlans']);
    }
  });

  const handleSavePlan = (plan: any) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan._id, ...plan });
    } else {
      createMutation.mutate(plan);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      deleteMutation.mutate(planId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading plans...</span>
      </div>
    );
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
          onClick={() => {
            setEditingPlan(null);
            setShowModal(true);
          }}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add Plan
        </button>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: Plan, index: number) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  plan.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.isPublic ? 'Public' : 'Private'}
                </span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-text-primary">${plan.price}</span>
                <span className="text-text-secondary">/{plan.duration}</span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-text-secondary mb-2">Limits:</p>
                <div className="text-xs text-text-muted space-y-1">
                  <div>Properties: {plan.limits.maxProperties}</div>
                  <div>Tenants: {plan.limits.maxTenants}</div>
                  <div>Agents: {plan.limits.maxAgents}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 bg-app-bg hover:bg-app-border text-text-primary py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CreditCard size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Plans Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Create your first subscription plan to start monetizing your platform.
          </p>
          <button
            onClick={() => {
              setEditingPlan(null);
              setShowModal(true);
            }}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Create First Plan
          </button>
        </motion.div>
      )}

      <PlanFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        plan={editingPlan}
      />
    </motion.div>
  );
};

export default AdminPlansPage;