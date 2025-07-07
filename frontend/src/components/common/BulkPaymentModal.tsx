import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Users, Building2, Check, Percent } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface BulkPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tenant {
  _id: string;
  name: string;
  email: string;
  rentAmount: number;
  unit: string;
  status: string;
}

interface Property {
  _id: string;
  name: string;
  address: any;
}

const BulkPaymentModal: React.FC<BulkPaymentModalProps> = ({ isOpen, onClose }) => {
  const { currency } = useCurrency();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: tenants = [], isLoading: tenantsLoading, error: tenantsError } = useQuery({
    queryKey: ['tenants', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty) return [];
      const { data } = await apiClient.get(`/tenants?propertyId=${selectedProperty}`);
      return data.data || [];
    },
    enabled: !!selectedProperty
  });

  const calculateDiscountedAmount = (originalAmount: number) => {
    if (discountType === 'none') return originalAmount;
    
    const discount = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return originalAmount - (originalAmount * discount / 100);
    } else {
      return Math.max(0, originalAmount - discount);
    }
  };

  const getTotalAmount = () => {
    return selectedTenants.reduce((total, tenantId) => {
      const tenant = tenants.find((t: Tenant) => t._id === tenantId);
      if (!tenant) return total;
      return total + calculateDiscountedAmount(tenant.rentAmount || 0);
    }, 0);
  };

  const handleSelectAllTenants = () => {
    const activeTenants = tenants.filter((t: Tenant) => t.status === 'Active');
    setSelectedTenants(activeTenants.map((t: Tenant) => t._id));
  };

  const handleDeselectAllTenants = () => {
    setSelectedTenants([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || selectedTenants.length === 0) {
      alert('Please select a property and at least one tenant');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payments = selectedTenants.map(tenantId => {
        const tenant = tenants.find((t: Tenant) => t._id === tenantId);
        const originalAmount = tenant?.rentAmount || 0;
        const finalAmount = calculateDiscountedAmount(originalAmount);
        
        return {
          tenantId,
          propertyId: selectedProperty,
          amount: finalAmount,
          originalAmount,
          discount: discountType !== 'none' ? {
            type: discountType,
            value: parseFloat(discountValue) || 0,
            amount: originalAmount - finalAmount
          } : null,
          paymentDate,
          paymentMethod,
          description: `Monthly Rent Payment${discountType !== 'none' ? ' (with discount)' : ''}`,
          status: 'Paid'
        };
      });

      await apiClient.post('/bulk/payments', { payments });
      
      alert(`Bulk payment recorded successfully for ${selectedTenants.length} tenants!`);
      onClose();
      
      // Reset form
      setSelectedProperty('');
      setSelectedTenants([]);
      setDiscountType('none');
      setDiscountValue('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Bank Transfer');
    } catch (error: any) {
      console.error('Failed to record bulk payment:', error);
      alert(error.response?.data?.message || 'Failed to record bulk payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Payment</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Property
            </label>
            <div className="relative">
              <Building2 size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  setSelectedTenants([]);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Choose a property...</option>
                {properties.map((property: Property) => (
                  <option key={property._id} value={property._id}>
                    {property.name} - {property.address?.formattedAddress || 'No address'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tenant Selection */}
          {selectedProperty && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Tenants ({selectedTenants.length} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllTenants}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllTenants}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {tenantsLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading tenants...</p>
                  </div>
                ) : tenantsError ? (
                  <p className="text-red-500 text-center py-4">Error loading tenants</p>
                ) : tenants.length > 0 ? (
                  tenants.map((tenant: Tenant) => (
                    <div key={tenant._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTenants(prev => [...prev, tenant._id]);
                            } else {
                              setSelectedTenants(prev => prev.filter(id => id !== tenant._id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-sm text-gray-500">Unit: {tenant.unit} | Status: {tenant.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{currency}{tenant.rentAmount || 0}</p>
                        {discountType !== 'none' && selectedTenants.includes(tenant._id) && (
                          <p className="text-sm text-green-600">
                            After discount: {currency}{calculateDiscountedAmount(tenant.rentAmount || 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No tenants found for this property</p>
                )}
              </div>
            </div>
          )}

          {/* Discount Section */}
          {selectedTenants.length > 0 && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Apply Discount (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="none"
                      checked={discountType === 'none'}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="mr-2"
                    />
                    No Discount
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={discountType === 'percentage'}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="mr-2"
                    />
                    Percentage
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="fixed"
                      checked={discountType === 'fixed'}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="mr-2"
                    />
                    Fixed Amount
                  </label>
                </div>
                
                {discountType !== 'none' && (
                  <div className="relative">
                    {discountType === 'percentage' ? (
                      <Percent size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    ) : (
                      <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    )}
                    <input
                      type="number"
                      step={discountType === 'percentage' ? '1' : '0.01'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={discountType === 'percentage' ? '10' : '50.00'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          {selectedTenants.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Selected Tenants:</span>
                  <span>{selectedTenants.length}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Amount:</span>
                  <span>{currency}{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedTenants.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Recording Payments...' : `Record Payment for ${selectedTenants.length} Tenant${selectedTenants.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkPaymentModal;