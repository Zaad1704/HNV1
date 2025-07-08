import React, { useState, useEffect } from 'react';
import { X, Upload, User, Search } from 'lucide-react';
import apiClient from '../../api/client';
import { useQuery } from '@tanstack/react-query';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: (tenant: any) => void;
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onTenantAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unit: '',
    rentAmount: '',
    leaseStartDate: '',
    leaseEndDate: '',
    securityDeposit: '',
    status: 'Active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [showUnits, setShowUnits] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  // Fetch vacant units when property is selected
  useEffect(() => {
    const fetchVacantUnits = async () => {
      if (formData.propertyId) {
        try {
          const { data } = await apiClient.get(`/properties/${formData.propertyId}/vacant-units`);
          setVacantUnits(data.data || []);
          setShowUnits(true);
        } catch (error) {
          console.error('Failed to fetch vacant units:', error);
          setVacantUnits([]);
        }
      } else {
        setVacantUnits([]);
        setShowUnits(false);
      }
    };
    fetchVacantUnits();
  }, [formData.propertyId]);

  // Auto-fill rent amount when unit is selected
  const handleUnitSelect = (unit: any) => {
    setFormData({
      ...formData,
      unit: unit.unitNumber,
      rentAmount: unit.lastRentAmount || unit.suggestedRent || ''
    });
    setShowUnits(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const tenantData = {
        ...formData,
        rentAmount: Number(formData.rentAmount),
        securityDeposit: Number(formData.securityDeposit)
      };
      
      const response = await apiClient.post('/tenants', tenantData);
      
      if (response.data?.success) {
        onTenantAdded(response.data.data);
        alert('Tenant added successfully!');
        onClose();
        setFormData({
          name: '', email: '', phone: '', propertyId: '', unit: '',
          rentAmount: '', leaseStartDate: '', leaseEndDate: '', securityDeposit: '', status: 'Active'
        });
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to add tenant'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Tenant</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property</label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unit: '', rentAmount: '' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select Property</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>{property.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  onFocus={() => formData.propertyId && setShowUnits(true)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={formData.propertyId ? "Select vacant unit" : "Select property first"}
                  required
                  readOnly={formData.propertyId && vacantUnits.length > 0}
                />
                {formData.propertyId && (
                  <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}
              </div>
              
              {/* Vacant Units Dropdown */}
              {showUnits && vacantUnits.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {vacantUnits.map((unit: any, index) => (
                    <div
                      key={index}
                      onClick={() => handleUnitSelect(unit)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{unit.unitNumber}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {unit.lastRentAmount ? `Last rent: $${unit.lastRentAmount}` : 'No previous rent'}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Vacant</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showUnits && vacantUnits.length === 0 && formData.propertyId && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No vacant units available</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rent Amount
                {formData.rentAmount && (
                  <span className="text-xs text-blue-600 ml-2">(Auto-filled from unit history)</span>
                )}
              </label>
              <input
                type="number"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter rent amount"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security Deposit</label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lease Start</label>
              <input
                type="date"
                value={formData.leaseStartDate}
                onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lease End</label>
              <input
                type="date"
                value={formData.leaseEndDate}
                onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenantModal;