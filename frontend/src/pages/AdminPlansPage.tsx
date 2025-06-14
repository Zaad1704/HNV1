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
            setError('Failed to fetch subscription plans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);
    
    const handleAddNew = () => {
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (planId) => {
        if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
            try {
                await apiClient.delete(`/plans/${planId}`);
                fetchPlans(); // Refresh the list
            } catch (err) {
                alert('Failed to delete plan.');
            }
        }
    };

    if (loading) return <div className="text-white">Loading plans...</div>;
    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div className="text-white">
            <PlanFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchPlans}
                plan={selectedPlan}
            />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Manage Subscription Plans</h1>
                <button onClick={handleAddNew} className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500">
                    + Add New Plan
                </button>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                <table className="w-full">
                    <thead className="text-left text-slate-400">
                        <tr>
                            <th className="p-4">Plan Name</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Features</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {plans.map(plan => (
                            <tr key={plan._id}>
                                <td className="p-4 font-bold">{plan.name}</td>
                                <td className="p-4">${(plan.price / 100).toFixed(2)} / month</td>
                                <td className="p-4 text-sm text-slate-300">{plan.features.join(', ')}</td>
                                <td className="p-4 space-x-2">
                                    <button onClick={() => handleEdit(plan)} className="text-yellow-400">Edit</button>
                                    <button onClick={() => handleDelete(plan._id)} className="text-red-500">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPlansPage;
