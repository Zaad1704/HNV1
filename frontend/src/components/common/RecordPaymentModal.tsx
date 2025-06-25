import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { X, DownloadCloud } from 'lucide-react';

interface IPayment {
    _id: string;
    // other fields...
}

const fetchTenants = async () => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

const recordPayment = async (newPayment: any): Promise<IPayment> => {
    const { data } = await apiClient.post('/payments', newPayment);
    return data.data;
};

const RecordPaymentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tenantId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0],
    lineItems: [] as { description: string; amount: number; }[],
    paidForMonth: new Date().toISOString().split('T')[0].substring(0, 7),
    totalCalculatedAmount: 0
  });
  const [error, setError] = useState('');

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenantsForPayment'], 
    queryFn: fetchTenants, 
    enabled: isOpen
  });

  React.useEffect(() => {
    const sum = formData.lineItems.reduce((acc, item) => acc + (item.amount || 0), 0);
    setFormData(prev => ({ ...prev, totalCalculatedAmount: sum }));
  }, [formData.lineItems]);

  const paymentMutation = useMutation({
    mutationFn: recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to record payment.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handlers for line items, add/remove etc. would go here

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const finalAmount = formData.lineItems.length > 0 ? formData.totalCalculatedAmount : Number(formData.amount);
    if (!finalAmount || finalAmount <= 0) {
        setError('Please enter a valid amount or breakdown.');
        return;
    }
    const submissionData = {
        tenantId: formData.tenantId,
        amount: finalAmount,
        paymentDate: formData.paymentDate,
        status: 'Paid',
        lineItems: formData.lineItems.filter(item => item.description && item.amount > 0),
        paidForMonth: formData.paidForMonth ? `${formData.paidForMonth}-01` : undefined,
    };
    paymentMutation.mutate(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
          <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">Record Manual Payment</h2>
          <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark text-2xl transition-colors">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg transition-all duration-200">{error}</div>}
          
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Tenant</label>
            <select name="tenantId" id="tenantId" required value={formData.tenantId} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200">
              <option value="">{isLoading ? 'Loading...' : 'Select a Tenant'}</option>
              {tenants?.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Total Amount ($)</label>
              <input type="number" step="0.01" name="amount" id="amount" required value={formData.lineItems.length > 0 ? formData.totalCalculatedAmount.toFixed(2) : formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" disabled={formData.lineItems.length > 0}/>
            </div>
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Payment Date</label>
              <input type="date" name="paymentDate" id="paymentDate" required value={formData.paymentDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={paymentMutation.isLoading}
              className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:opacity-50 transition-colors duration-200"
            >
                {paymentMutation.isLoading ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
