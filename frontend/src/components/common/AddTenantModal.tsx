import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, Search, Image } from 'lucide-react';
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
  const [loadingUnits, setLoadingUnits] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { data: properties = [], error: propertiesError } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      try {
        console.log('Fetching properties...');
        const { data } = await apiClient.get('/properties');
        console.log('Properties response:', data);
        return data.data || [];
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        throw error;
      }
    },
    enabled: isOpen,
    retry: 2,
    retryDelay: 1000
  });
  
  // Log properties error if any
  if (propertiesError) {
    console.error('Properties query error:', propertiesError);
  }

  // Fetch vacant units when property is selected
  useEffect(() => {
    const fetchVacantUnits = async () => {
      if (formData.propertyId) {
        setLoadingUnits(true);
        try {
          console.log('Fetching vacant units for property:', formData.propertyId);
          const { data } = await apiClient.get(`/properties/${formData.propertyId}/vacant-units`);
          console.log('Vacant units response:', data);
          setVacantUnits(data.data || []);
        } catch (error) {
          console.error('Failed to fetch vacant units:', error);
          setVacantUnits([]);
        } finally {
          setLoadingUnits(false);
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
    try {
      if (unit && unit.unitNumber) {
        setFormData(prev => ({
          ...prev,
          unit: unit.unitNumber,
          rentAmount: unit.lastRentAmount || unit.suggestedRent || prev.rentAmount
        }));
      }
      setShowUnits(false);
    } catch (error) {
      console.error('Error selecting unit:', error);
      setShowUnits(false);
    }
  };

  const handleUnitInputClick = () => {
    if (formData.propertyId && vacantUnits.length > 0) {
      setShowUnits(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUnits(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Starting tenant submission...');
      
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields: Name, Email, and Phone');
      }
      
      if (!formData.propertyId || !formData.unit) {
        throw new Error('Please select a property and unit');
      }
      
      if (!formData.rentAmount || !formData.leaseStartDate || !formData.leaseEndDate) {
        throw new Error('Please fill in rent amount and lease dates');
      }
      
      let imageUrl = '';
      
      // Upload image if selected
      if (imageFile) {
        console.log('Uploading tenant image...');
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        try {
          const imageResponse = await apiClient.post('/upload/image', imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000
          });
          imageUrl = imageResponse.data?.data?.url || imageResponse.data?.url || '';
          console.log('Image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('Failed to upload image:', error);
          // Continue without image - not critical
        }
      }
      
      const tenantData = {
        ...formData,
        rentAmount: Number(formData.rentAmount) || 0,
        securityDeposit: Number(formData.securityDeposit) || 0,
        imageUrl
      };
      
      console.log('Submitting tenant data:', { 
        name: tenantData.name, 
        propertyId: tenantData.propertyId, 
        unit: tenantData.unit 
      });
      
      const response = await apiClient.post('/tenants', tenantData, {
        timeout: 30000
      });
      
      console.log('Tenant creation response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        onTenantAdded(response.data.data);
        alert('Tenant added successfully!');
        onClose();
        
        // Reset form
        setFormData({
          name: '', email: '', phone: '', propertyId: '', unit: '',
          rentAmount: '', leaseStartDate: '', leaseEndDate: '', securityDeposit: '', status: 'Active'
        });
        setImageFile(null);
        setImagePreview('');
      } else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (error: any) {
      console.error('Tenant submission error:', error);
      
      let errorMessage = 'Failed to add tenant';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - please check your connection';
      } else if (error.message) {
        // Validation or other error
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit
                {loadingUnits && <span className="text-xs text-blue-600 ml-2">Loading units...</span>}
                {vacantUnits.length > 0 && <span className="text-xs text-green-600 ml-2">{vacantUnits.length} vacant units</span>}
              </label>
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  onClick={handleUnitInputClick}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                  placeholder={formData.propertyId ? "Click to select unit or type manually" : "Select property first"}
                  required
                />
                {formData.propertyId && vacantUnits.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUnitInputClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                  >
                    <Search size={16} />
                  </button>
                )}
              </div>
              
              {/* Vacant Units Dropdown */}
              {showUnits && vacantUnits.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {vacantUnits.map((unit: any) => (
                    <button
                      key={unit.unitNumber}
                      type="button"
                      onClick={() => handleUnitSelect(unit)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Unit {unit.unitNumber}</span>
                        {unit.lastRentAmount > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            ${unit.lastRentAmount}/month
                          </span>
                        )}
                      </div>
                      {unit.lastRentAmount > 0 ? (
                        <div className="text-xs text-green-600 mt-1">
                          ✓ Previous rent available
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 mt-1">
                          No previous rent data
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {formData.propertyId && vacantUnits.length === 0 && !loadingUnits && (
                <p className="text-xs text-amber-600 mt-1">
                  No vacant units available. All units may be occupied.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Rent Amount
                {formData.unit && formData.rentAmount && (
                  <span className="text-xs text-green-600 ml-2">
                    ✓ Auto-filled for Unit {formData.unit}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={formData.unit ? "Amount for selected unit" : "Enter rent amount"}
                  required
                />
              </div>
              {formData.unit && !formData.rentAmount && (
                <p className="text-xs text-amber-600 mt-1">
                  No previous rent data for Unit {formData.unit}. Please enter amount manually.
                </p>
              )}
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tenant Photo</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Image size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Upload tenant photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="tenant-image"
                  />
                  <label
                    htmlFor="tenant-image"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
                  >
                    <Upload size={16} />
                    Choose Photo
                  </label>
                </div>
              )}
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