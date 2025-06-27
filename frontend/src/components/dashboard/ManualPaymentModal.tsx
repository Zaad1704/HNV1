import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  tenants: Array<{ _id: string; name: string; unit: string; rentAmount: number }>;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tenants
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    tenantId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'Paid',
    paidForMonth: new Date().toISOString().split('T')[0].substring(0, 7), // YYYY-MM format
    lineItems: [{ description: 'Rent Payment', amount: 0 }],
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill amount when tenant is selected
    if (name === 'tenantId') {
      const selectedTenant = tenants.find(t => t._id === value);
      if (selectedTenant) {
        setFormData(prev => ({
          ...prev,
          amount: selectedTenant.rentAmount.toString(),
          lineItems: [{ description: `Rent Payment - Unit ${selectedTenant.unit}`, amount: selectedTenant.rentAmount }]
        }));
      }
    }
  };

  const handleLineItemChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    
    setFormData(prev => ({
      ...prev,
      lineItems: newLineItems,
      amount: newLineItems.reduce((sum, item) => sum + item.amount, 0).toString()
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', amount: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      const newLineItems = formData.lineItems.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        lineItems: newLineItems,
        amount: newLineItems.reduce((sum, item) => sum + item.amount, 0).toString()
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      paidForMonth: new Date(formData.paidForMonth + '-01') // Convert YYYY-MM to Date
    });
    onClose();
    // Reset form
    setFormData({
      tenantId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Paid',
      paidForMonth: new Date().toISOString().split('T')[0].substring(0, 7),
      lineItems: [{ description: 'Rent Payment', amount: 0 }],
      notes: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Record Manual Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tenant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tenant *
            </label>
            <select
              name="tenantId"
              value={formData.tenantId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a tenant</option>
              {tenants.map(tenant => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.name} - Unit {tenant.unit} (${tenant.rentAmount})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paid For Month
              </label>
              <input
                type="month"
                name="paidForMonth"
                value={formData.paidForMonth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Breakdown
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Item
              </button>
            </div>
            
            {formData.lineItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {formData.lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              required
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Additional notes about this payment..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPaymentModal;