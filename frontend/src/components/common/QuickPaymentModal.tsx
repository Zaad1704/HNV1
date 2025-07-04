import React, { useState, useMemo } from 'react';
import { X, DollarSign, Calendar, User, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    tenantId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTenant, setSearchTenant] = useState('');

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tenants');
      return data.data || [];
    },
    enabled: isOpen
  });

  const filteredTenants = useMemo(() => {
    if (!tenants || !searchTenant) return tenants || [];
    return tenants.filter((tenant: any) => 
      tenant.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
      tenant.unit.toLowerCase().includes(searchTenant.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTenant.toLowerCase())
    );
  }, [tenants, searchTenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiClient.post('/payments', {
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'Paid'
      });
      
      alert('Payment recorded successfully!');
      onClose();
      setFormData({
        tenantId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="app-surface rounded-3xl p-6 w-full max-w-md border border-app-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <DollarSign size={24} className="text-green-500" />
            Quick Payment
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-app-bg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tenant
            </label>
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search tenant by name, unit, or email..."
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-app-border rounded-xl bg-app-surface text-text-primary text-sm"
              />
            </div>
            <select
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              required
            >
              <option value="">Select Tenant</option>
              {filteredTenants?.map((tenant: any) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.name} - Unit {tenant.unit} - ${tenant.rentAmount || 0}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
            >
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online Payment">Online Payment</option>
              <option value="Money Order">Money Order</option>
            </select>
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
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