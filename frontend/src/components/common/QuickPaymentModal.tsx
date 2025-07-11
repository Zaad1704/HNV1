import React, { useState } from 'react';
import { X, DollarSign, Calendar, CreditCard } from 'lucide-react';
import apiClient from '../../api/client';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  onPaymentAdded: () => void;
}

const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({ isOpen, onClose, tenant, onPaymentAdded }) => {
  const [formData, setFormData] = useState({
    amount: tenant?.rentAmount?.toString() || '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    rentMonth: new Date().toISOString().slice(0, 7),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const paymentData = {
        tenantId: tenant._id,
        propertyId: tenant.propertyId?._id || tenant.propertyId,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        rentMonth: formData.rentMonth,
        notes: formData.notes,
        status: 'Paid'
      };

      await apiClient.post('/payments', paymentData);
      alert('Payment recorded successfully!');
      onPaymentAdded();
      onClose();
      
      // Reset form
      setFormData({
        amount: tenant?.rentAmount?.toString() || '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        rentMonth: new Date().toISOString().slice(0, 7),
        notes: ''
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Failed to record payment: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Quick Payment</h3>
              <p className="text-sm text-gray-600">{tenant?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Online">Online Payment</option>
              <option value="Mobile Banking">Mobile Banking</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rent Month</label>
            <input
              type="month"
              value={formData.rentMonth}
              onChange={(e) => setFormData({ ...formData, rentMonth: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickPaymentModal;