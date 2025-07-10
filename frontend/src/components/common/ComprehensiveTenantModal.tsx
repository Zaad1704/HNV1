import React, { useState } from 'react';
import { X, Upload, User, Phone, Mail, MapPin, CreditCard, Users, Camera, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';

interface ComprehensiveTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: (tenant: any) => void;
}

const ComprehensiveTenantModal: React.FC<ComprehensiveTenantModalProps> = ({ isOpen, onClose, onTenantAdded }) => {
  const [searchParams] = useSearchParams();
  const preSelectedProperty = searchParams.get('propertyId');
  const preSelectedUnit = searchParams.get('unit');
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    propertyId: preSelectedProperty || '',
    unit: preSelectedUnit || '',
    rentAmount: '',
    leaseEndDate: '',
    status: 'Active',
    
    // Personal Details
    fatherName: '',
    motherName: '',
    presentAddress: '',
    permanentAddress: '',
    govtIdNumber: '',
    
    // Reference (Optional)
    referenceName: '',
    referencePhone: '',
    referenceEmail: '',
    referenceAddress: '',
    referenceRelation: '',
    referenceGovtId: '',
    
    // Commercial Properties
    securityDeposit: '',
    
    // Residential Properties
    numberOfOccupants: 1
  });
  
  const [images, setImages] = useState({
    tenantImage: null as File | null,
    govtIdFront: null as File | null,
    govtIdBack: null as File | null
  });
  
  const [additionalAdults, setAdditionalAdults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const handleImageUpload = (field: string, file: File) => {
    setImages(prev => ({ ...prev, [field]: file }));
  };
  
  const addAdditionalAdult = () => {
    setAdditionalAdults(prev => [...prev, {
      name: '',
      phone: '',
      fatherName: '',
      motherName: '',
      permanentAddress: '',
      govtIdNumber: '',
      relation: '',
      image: null
    }]);
  };
  
  const removeAdditionalAdult = (index: number) => {
    setAdditionalAdults(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateAdditionalAdult = (index: number, field: string, value: any) => {
    setAdditionalAdults(prev => prev.map((adult, i) => 
      i === index ? { ...adult, [field]: value } : adult
    ));
  };
  
  const selectedProperty = properties.find(p => p._id === formData.propertyId);
  const isCommercial = selectedProperty?.propertyType === 'Commercial';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add basic form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key as keyof typeof formData] as string);
      });
      
      // Add images
      if (images.tenantImage) {
        submitData.append('tenantImage', images.tenantImage);
      }
      if (images.govtIdFront) {
        submitData.append('govtIdFront', images.govtIdFront);
      }
      if (images.govtIdBack) {
        submitData.append('govtIdBack', images.govtIdBack);
      }
      
      // Add additional adults with images
      const adultsData = additionalAdults.map((adult, index) => {
        const adultData = { ...adult };
        delete adultData.image;
        delete adultData.govtIdImage;
        return adultData;
      });
      submitData.append('additionalAdults', JSON.stringify(adultsData));
      
      // Add additional adult images
      additionalAdults.forEach((adult, index) => {
        if (adult.image) {
          submitData.append(`additionalAdultImage_${index}`, adult.image);
        }
        if (adult.govtIdImage) {
          submitData.append(`additionalAdultGovtId_${index}`, adult.govtIdImage);
        }
      });
      
      const { data } = await apiClient.post('/tenants', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onTenantAdded(data.data);
      alert('Tenant added successfully!');
      onClose();
      
      // Reset form
      setFormData({
        name: '', email: '', phone: '', whatsappNumber: '',
        propertyId: preSelectedProperty || '', unit: preSelectedUnit || '', rentAmount: '',
        leaseEndDate: '', status: 'Active', fatherName: '', motherName: '',
        presentAddress: '', permanentAddress: '', govtIdNumber: '',
        referenceName: '', referencePhone: '', referenceEmail: '',
        referenceAddress: '', referenceRelation: '', referenceGovtId: '', securityDeposit: '',
        numberOfOccupants: 1
      });
      setImages({ tenantImage: null, govtIdFront: null, govtIdBack: null });
      setAdditionalAdults([]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Add Tenant - Comprehensive Form</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number (if different)
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Property & Unit Details */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Property & Unit Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property *
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map((property: any) => (
                    <option key={property._id} value={property._id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit/Room *
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent *
                </label>
                <input
                  type="number"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name *
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name *
                </label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Present Address *
                </label>
                <textarea
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permanent Address *
                </label>
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID Number *
                </label>
                <input
                  type="text"
                  value={formData.govtIdNumber}
                  onChange={(e) => setFormData({ ...formData, govtIdNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('tenantImage', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID (Front) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('govtIdFront', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID (Back) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('govtIdBack', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Security Deposit (Commercial) */}
          {isCommercial && (
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4">Commercial Property Details</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit *
                </label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Residential Occupants */}
          {!isCommercial && (
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4">Residential Details</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People Staying *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfOccupants}
                  onChange={(e) => setFormData({ ...formData, numberOfOccupants: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium">Additional Adults</h5>
                <button
                  type="button"
                  onClick={addAdditionalAdult}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Adult
                </button>
              </div>
              
              {additionalAdults.map((adult, index) => (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h6 className="font-medium">Adult {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeAdditionalAdult(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={adult.name}
                      onChange={(e) => updateAdditionalAdult(index, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={adult.phone}
                      onChange={(e) => updateAdditionalAdult(index, 'phone', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Government ID"
                      value={adult.govtIdNumber}
                      onChange={(e) => updateAdditionalAdult(index, 'govtIdNumber', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Relation to Main Tenant"
                      value={adult.relation}
                      onChange={(e) => updateAdditionalAdult(index, 'relation', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateAdditionalAdult(index, 'image', e.target.files?.[0] || null)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Government ID Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateAdditionalAdult(index, 'govtIdImage', e.target.files?.[0] || null)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reference (Optional) */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Reference (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Name
                </label>
                <input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Phone
                </label>
                <input
                  type="tel"
                  value={formData.referencePhone}
                  onChange={(e) => setFormData({ ...formData, referencePhone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Email
                </label>
                <input
                  type="email"
                  value={formData.referenceEmail}
                  onChange={(e) => setFormData({ ...formData, referenceEmail: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relation
                </label>
                <input
                  type="text"
                  value={formData.referenceRelation}
                  onChange={(e) => setFormData({ ...formData, referenceRelation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Address
                </label>
                <textarea
                  value={formData.referenceAddress}
                  onChange={(e) => setFormData({ ...formData, referenceAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Government ID
                </label>
                <input
                  type="text"
                  value={formData.referenceGovtId}
                  onChange={(e) => setFormData({ ...formData, referenceGovtId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding Tenant...' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComprehensiveTenantModal;