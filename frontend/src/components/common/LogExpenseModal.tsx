import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch properties to populate the dropdown
const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

// Create the mutation function
const createExpense = async (newExpense: any) => {
    const { data } = await apiClient.post('/expenses', newExpense);
    return data.data;
};

const LogExpenseModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    description: '', amount: '', category: 'Repairs', date: new Date().toISOString().split('T')[0], propertyId: ''
  });
  const [error, setError] = useState('');

  // Fetch properties for the dropdown
  const { data: properties, isLoading } = useQuery(['properties'], fetchProperties, { enabled: isOpen });

  // Setup the mutation
  const mutation = useMutation(createExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']); // Refetch expenses after success
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to log expense.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Log New Expense</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
            <input type="text" name="description" id="description" required value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Amount ($)</label>
              <input type="number" name="amount" id="amount" required value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-300">Date</label>
              <input type="date" name="date" id="date" required value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
                <select name="category" id="category" required value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white">
                    <option>Repairs</option><option>Utilities</option><option>Management Fees</option><option>Insurance</option><option>Taxes</option><option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-slate-300">Property</label>
                <select name="propertyId" id="propertyId" required value={formData.propertyId} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white">
                  <option value="">{isLoading ? 'Loading...' : 'Select Property'}</option>
                  {properties?.map((prop: any) => <option key={prop._id} value={prop._id}>{prop.name}</option>)}
                </select>
              </div>
          </div>
            
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">
                {mutation.isLoading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogExpenseModal;
