import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

// Fetch tenants to populate the dropdown
const fetchTenants = async () => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

// Create the mutation function for submitting the form
const recordPayment = async (newPayment: any) => {
    const { data } = await apiClient.post('/payments', newPayment);
    return data.data;
};

const RecordPaymentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tenantId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  // Fetch tenants for the dropdown
  const { data: tenants, isLoading } = useQuery(['tenantsForPayment'], fetchTenants, { enabled: isOpen });

  const mutation = useMutation(recordPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']); // This will refetch the payments list automatically
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to record payment.');
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
          <h2 className="text-xl font-bold text-white">Record Manual Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}
          
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-slate-300">Tenant</label>
            <select name="tenantId" id="tenantId" required value={formData.tenantId} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white">
              <option value="">{isLoading ? 'Loading Tenants...' : 'Select a Tenant'}</option>
              {tenants?.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Amount ($)</label>
              <input type="number" name="amount" id="amount" required value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
            </div>
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-300">Payment Date</label>
              <input type="date" name="paymentDate" id="paymentDate" required value={formData.paymentDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
            </div>
          </div>
            
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">
                {mutation.isLoading ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
