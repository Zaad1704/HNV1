import React, { useState, useMemo } from 'react';
import { X, DollarSign, Search, Check, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface BulkPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
}

const BulkPaymentModal: React.FC<BulkPaymentModalProps> = ({ isOpen, onClose, propertyId }) => {
  const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  });
  const [searchTenant, setSearchTenant] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tenants } = useQuery({
    queryKey: ['tenants', propertyId],
    queryFn: async () => {
      const url = propertyId ? `/tenants?propertyId=${propertyId}` : '/tenants';
      const { data } = await apiClient.get(url);
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

  const handleTenantToggle = (tenantId: string) => {
    const newSelected = new Set(selectedTenants);
    if (newSelected.has(tenantId)) {
      newSelected.delete(tenantId);
    } else {
      newSelected.add(tenantId);
    }
    setSelectedTenants(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTenants.size === filteredTenants.length) {
      setSelectedTenants(new Set());
    } else {
      setSelectedTenants(new Set(filteredTenants.map((t: any) => t._id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenants.size === 0) {
      alert('Please select at least one tenant');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const promises = Array.from(selectedTenants).map(tenantId => {
        const tenant = tenants.find((t: any) => t._id === tenantId);
        return apiClient.post('/payments', {
          tenantId,
          amount: tenant?.rentAmount || 0,
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes,
          status: 'Paid'
        });
      });

      await Promise.all(promises);
      alert(`Successfully recorded ${selectedTenants.size} payments!`);
      onClose();
      setSelectedTenants(new Set());
    } catch (error) {
      console.error('Failed to record bulk payments:', error);
      alert('Failed to record some payments. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = Array.from(selectedTenants).reduce((sum, tenantId) => {
    const tenant = tenants?.find((t: any) => t._id === tenantId);
    return sum + (tenant?.rentAmount || 0);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="app-surface rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-app-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Users size={24} className="text-blue-500" />
            Bulk Payment Recording
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-app-bg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search and Select All */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              {selectedTenants.size === filteredTenants?.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Tenant List */}
          <div className="border border-app-border rounded-xl max-h-60 overflow-y-auto">
            {filteredTenants?.map((tenant: any) => (
              <div
                key={tenant._id}
                className={`p-4 border-b border-app-border last:border-b-0 hover:bg-app-bg transition-colors ${
                  selectedTenants.has(tenant._id) ? 'bg-blue-50' : ''
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTenants.has(tenant._id)}
                    onChange={() => handleTenantToggle(tenant._id)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <div className="w-10 h-10 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{tenant.name}</p>
                    <p className="text-sm text-text-secondary">Unit {tenant.unit} • {tenant.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">${tenant.rentAmount || 0}</p>
                    <p className="text-xs text-text-secondary">Rent Amount</p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Payment Method
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              >
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Money Order">Money Order</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
              rows={3}
              placeholder="Additional notes for all payments..."
            />
          </div>

          {/* Summary */}
          {selectedTenants.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-800">
                    {selectedTenants.size} tenant{selectedTenants.size > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-blue-600">
                    Total amount: ${totalAmount.toLocaleString()}
                  </p>
                </div>
                <DollarSign size={24} className="text-blue-500" />
              </div>
            </div>
          )}

          {/* Actions */}
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
              disabled={isSubmitting || selectedTenants.size === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : `Record ${selectedTenants.size} Payment${selectedTenants.size > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkPaymentModal;