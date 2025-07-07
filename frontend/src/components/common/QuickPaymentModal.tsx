import React, { useState } from 'react';
import { X, DollarSign, User, Calendar, Building2, Search, Percent } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({ isOpen, onClose }) => {
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [tenantSearch, setTenantSearch] = useState('');
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: 'Rent Payment',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty) return [];
      const { data } = await apiClient.get(`/tenants?propertyId=${selectedProperty}`);
      return data.data || [];
    },
    enabled: !!selectedProperty
  });

  const filteredTenants = tenants.filter((tenant: any) => 
    tenant.name.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  const selectedTenantData = tenants.find((t: any) => t._id === selectedTenant);
  const originalAmount = selectedTenantData?.rentAmount || parseFloat(formData.amount) || 0;
  
  const calculateDiscountedAmount = (amount: number) => {
    if (discountType === 'none') return amount;
    const discount = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return amount - (amount * discount / 100);
    } else {
      return Math.max(0, amount - discount);
    }
  };

  const finalAmount = calculateDiscountedAmount(originalAmount);
  
  const generateReceipt = (paymentData: any, tenantData: any, paymentId: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const organizationName = user?.organization?.name || user?.name + "'s Organization" || "Your Organization";
    const receiptNumber = `RCP-${Date.now()}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${receiptNumber}</title>
          <style>
            @media print {
              body { margin: 0; font-size: 12px; }
              .no-print { display: none; }
            }
            body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 10px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 15px; font-size: 10px; }
            .thermal { width: 58mm; }
          </style>
        </head>
        <body class="thermal">
          <div class="header">
            <h3 style="margin: 0;">${organizationName}</h3>
            <p style="margin: 5px 0;">PAYMENT RECEIPT</p>
            <p style="margin: 0; font-size: 10px;">Receipt #: ${receiptNumber}</p>
          </div>
          
          <div class="row">
            <span>Date:</span>
            <span>${new Date(paymentData.paymentDate).toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span>Time:</span>
            <span>${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="row">
            <span>Tenant:</span>
            <span>${tenantData?.name || 'N/A'}</span>
          </div>
          <div class="row">
            <span>Unit:</span>
            <span>${tenantData?.unit || 'N/A'}</span>
          </div>
          <div class="row">
            <span>Property:</span>
            <span>${properties.find(p => p._id === selectedProperty)?.name || 'N/A'}</span>
          </div>
          
          <div style="border-top: 1px dashed #000; margin: 10px 0; padding-top: 10px;">
            <div class="row">
              <span>Description:</span>
              <span>${paymentData.description}</span>
            </div>
            ${paymentData.originalAmount !== paymentData.amount ? `
              <div class="row">
                <span>Original Amount:</span>
                <span>${currency}${paymentData.originalAmount.toFixed(2)}</span>
              </div>
              <div class="row" style="color: green;">
                <span>Discount (${paymentData.discount?.type === 'percentage' ? paymentData.discount.value + '%' : currency + paymentData.discount?.value}):</span>
                <span>-${currency}${paymentData.discount?.amount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="row total">
              <span>TOTAL PAID:</span>
              <span>${currency}${paymentData.amount.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="row">
            <span>Payment Method:</span>
            <span>${paymentData.paymentMethod}</span>
          </div>
          <div class="row">
            <span>Status:</span>
            <span>PAID</span>
          </div>
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p style="margin: 10px 0;">Powered by</p>
            <p style="font-weight: bold;">HNV Property Management</p>
            <p>Solutions</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const paymentData = {
        tenantId: selectedTenant,
        propertyId: selectedProperty,
        amount: finalAmount,
        originalAmount: originalAmount,
        discount: discountType !== 'none' ? {
          type: discountType,
          value: parseFloat(discountValue) || 0,
          amount: originalAmount - finalAmount
        } : null,
        description: formData.description,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        status: 'Paid'
      };
      
      const response = await apiClient.post('/payments', paymentData);
      const paymentId = response.data.data._id;
      
      // Generate receipt
      generateReceipt(paymentData, selectedTenantData, paymentId);
      
      alert('Payment recorded successfully! Receipt generated.');
      onClose();
      
      // Reset form
      setSelectedProperty('');
      setSelectedTenant('');
      setTenantSearch('');
      setDiscountType('none');
      setDiscountValue('');
      setFormData({
        amount: '',
        description: 'Rent Payment',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash'
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Payment</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  setSelectedTenant('');
                  setTenantSearch('');
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Choose a property...</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tenant Selection */}
          {selectedProperty && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Tenant
              </label>
              <div className="relative mb-2">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search tenants..."
                />
              </div>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg">
                {filteredTenants.map((tenant: any) => (
                  <div
                    key={tenant._id}
                    onClick={() => {
                      setSelectedTenant(tenant._id);
                      setFormData({ ...formData, amount: tenant.rentAmount?.toString() || '' });
                    }}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedTenant === tenant._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-500">Unit: {tenant.unit}</p>
                      </div>
                      <p className="font-medium">${tenant.rentAmount || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discount Section */}
          {selectedTenant && (
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
              
              {/* Amount Summary */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Original Amount:</span>
                  <span>{currency}{originalAmount}</span>
                </div>
                {discountType !== 'none' && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{currency}{(originalAmount - finalAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg border-t pt-2 mt-2">
                  <span>Final Amount:</span>
                  <span>{currency}{finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Date
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>

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
              disabled={isSubmitting || !selectedTenant}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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