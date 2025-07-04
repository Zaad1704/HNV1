import React, { useState } from 'react';
import { X, DollarSign, User, Calendar } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface RecordCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecorded: () => void;
}

const RecordCashFlowModal: React.FC<RecordCashFlowModalProps> = ({ isOpen, onClose, onRecorded }) => {
  const [formData, setFormData] = useState({
    type: 'cash_handover',
    amount: '',
    toUser: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const recordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/cashflow', data);
      return response.data;
    },
    onSuccess: () => {
      alert('Cash flow recorded successfully!');
      onRecorded();
      setFormData({
        type: 'cash_handover',
        amount: '',
        toUser: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    },
    onError: (error: any) => {
      alert(`Failed to record cash flow: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    recordMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="app-surface rounded-3xl p-6 w-full max-w-md border border-app-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <DollarSign size={24} className="text-blue-500" />
            Record Cash Flow
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-app-bg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Transaction Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              required
            >
              <option value="cash_handover">Cash Handover</option>
              <option value="bank_deposit">Bank Deposit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              To User (Optional)
            </label>
            <input
              type="text"
              value={formData.toUser}
              onChange={(e) => setFormData({ ...formData, toUser: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              placeholder="Recipient name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Transaction Date
            </label>
            <input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-app-bg text-text-primary rounded-xl hover:bg-app-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordMutation.isPending}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {recordMutation.isPending ? 'Recording...' : 'Record Cash Flow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordCashFlowModal;