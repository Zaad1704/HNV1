import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

// Define the shape of a Payment for type safety
interface IPayment {
    _id: string;
    tenantId: string;
    amount: number;
    paymentDate: string;
    status: string;
    // Include new fields if necessary from your Payment model update
    lineItems?: { description: string; amount: number; }[];
    paidForMonth?: string;
}

// Fetch tenants to populate the dropdown
const fetchTenants = async () => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

// Create the mutation function for submitting the form
const recordPayment = async (newPayment: any): Promise<IPayment> => {
    const { data } = await apiClient.post('/payments', newPayment);
    return data.data; // Assuming it returns the created payment object
};

const RecordPaymentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tenantId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0],
    lineItems: [] as { description: string; amount: number; }[], // Initialize lineItems
    paidForMonth: new Date().toISOString().split('T')[0].substring(0, 7), // YYYY-MM format initially for picker
    totalCalculatedAmount: 0 // For internal calculation
  });
  const [error, setError] = useState('');
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false); // New state for receipt generation loading

  // Fetch tenants for the dropdown
  const { data: tenants, isLoading } = useQuery(['tenantsForPayment'], fetchTenants, { enabled: isOpen });

  // Update total calculated amount whenever line items change
  React.useEffect(() => {
    const sum = formData.lineItems.reduce((acc, item) => acc + (item.amount || 0), 0);
    setFormData(prev => ({ ...prev, totalCalculatedAmount: sum }));
  }, [formData.lineItems]);


  // New mutation for recording payment AND generating receipt
  const paymentAndReceiptMutation = useMutation({
    mutationFn: recordPayment,
    onSuccess: async (newPayment) => { // newPayment contains the _id from the backend
      queryClient.invalidateQueries({ queryKey: ['payments'] }); // Refetch payments list
      
      // Immediately trigger receipt generation
      await handleDownloadReceipt(newPayment._id);
      
      onClose(); // Close modal after payment and receipt
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to record payment.');
      setIsGeneratingReceipt(false); // Ensure loading state is reset
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLineItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newLineItems = [...formData.lineItems];
    if (field === 'amount') {
      newLineItems[index].amount = Number(value);
    } else {
      newLineItems[index].description = String(value);
    }
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', amount: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    setIsGeneratingReceipt(true);
    try {
      const response = await apiClient.get(`/receipts/payment/${paymentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt:", error);
      alert("Could not generate and download receipt.");
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate total amount (if line items are used, amount field might be ignored or used as total)
    // For now, let's enforce that if lineItems exist, the amount should match the sum
    const finalAmount = formData.lineItems.length > 0 ? formData.totalCalculatedAmount : Number(formData.amount);
    if (!finalAmount || finalAmount <= 0) {
        setError('Please enter a valid amount or breakdown.');
        return;
    }
    if (formData.lineItems.length > 0 && formData.totalCalculatedAmount !== Number(formData.amount)) {
        // Optional: warn or auto-set if sum of line items should dictate total amount field
        // For this implementation, we'll use the calculated total from line items if they are present.
        // If line items are empty, use the single 'amount' field.
    }


    const submissionData = {
        tenantId: formData.tenantId,
        amount: finalAmount, // Use calculated amount if line items exist
        paymentDate: formData.paymentDate,
        status: 'Paid', // Default status
        lineItems: formData.lineItems.filter(item => item.description && item.amount > 0), // Filter empty line items
        paidForMonth: formData.paidForMonth ? `${formData.paidForMonth}-01` : undefined, // Send as first day of month
    };

    paymentAndReceiptMutation.mutate(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Record Manual Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
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
              <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Total Amount ($)</label>
              <input type="number" name="amount" id="amount" required value={formData.lineItems.length > 0 ? formData.totalCalculatedAmount.toFixed(2) : formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white" disabled={formData.lineItems.length > 0}/>
              {formData.lineItems.length > 0 && <p className="text-xs text-slate-400 mt-1">Sum of breakdown below.</p>}
            </div>
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-300">Payment Date</label>
              <input type="date" name="paymentDate" id="paymentDate" required value={formData.paymentDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
            </div>
          </div>
            
          {/* New: Paid For Month */}
          <div>
            <label htmlFor="paidForMonth" className="block text-sm font-medium text-slate-300">Paid For Month</label>
            <input type="month" name="paidForMonth" id="paidForMonth" value={formData.paidForMonth} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
          </div>

          {/* New: Line Items Breakdown */}
          <div className="space-y-2 border border-slate-700 p-4 rounded-md">
            <h3 className="text-base font-semibold text-white">Payment Breakdown (Optional)</h3>
            {formData.lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="Description (e.g., Rent, Water, Maintenance)"
                    className="w-full px-2 py-1 bg-slate-900 border-slate-600 rounded-md text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="w-full px-2 py-1 bg-slate-900 border-slate-600 rounded-md text-white text-sm"
                  />
                  <button type="button" onClick={() => removeLineItem(index)} className="text-red-400 hover:text-red-300 text-lg">&times;</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addLineItem} className="text-cyan-400 text-sm hover:underline mt-2">
              + Add Line Item
            </button>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
            <button
              type="submit"
              disabled={paymentAndReceiptMutation.isLoading || isGeneratingReceipt}
              className="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600"
            >
                {paymentAndReceiptMutation.isLoading || isGeneratingReceipt ? 'Saving & Generating...' : 'Save Payment & Print Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
