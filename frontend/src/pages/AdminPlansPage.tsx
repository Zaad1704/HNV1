import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import PlanFormModal from '../components/admin/PlanFormModal';

const AdminPlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/plans');
            setPlans(response.data.data);
        } catch (err) {
            setError("Failed to fetch plans.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);
    
    const handleAddNew = () => { setSelectedPlan(null); setIsModalOpen(true); };
    const handleEdit = (plan) => { setSelectedPlan(plan); setIsModalOpen(true); };
    const handleDelete = async (planId) => {
        if(window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
            try {
                await apiClient.delete(`/plans/${planId}`);
                fetchPlans(); // Refetch plans after deletion
            } catch (err) {
                alert('Failed to delete plan.');
            }
        }
     };

    if (loading) return <div className="text-center p-8">Loading plans...</div>;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

    return (
        <div className="text-dark-text">
            <PlanFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchPlans}
                plan={selectedPlan}
            />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Subscription Plans</h1>
                <button onClick={handleAddNew} className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark shadow-md transition-colors">
                    + Add New Plan
                </button>
            </div>
            <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-border-color">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Plan Name</th>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Price</th>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Limits</th>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {plans.map(plan => (
                                <tr key={plan._id} className="hover:bg-gray-50">
                                    <td className="p-4 font-semibold text-dark-text">{plan.name}</td>
                                    <td className="p-4 text-light-text">${(plan.price / 100).toFixed(2)} / {plan.duration}</td>
                                    <td className="p-4 text-sm text-light-text">
                                        Prop: {plan.limits.maxProperties}, Tenants: {plan.limits.maxTenants}, Agents: {plan.limits.maxAgents}
                                    </td>
                                    <td className="p-4 space-x-4">
                                        <button onClick={() => handleEdit(plan)} className="font-medium text-brand-primary hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(plan._id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPlansPage;
