import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';

const EditPropertyModal = ({ isOpen, onClose, property, onPropertyUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    numberOfUnits: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  // When the modal opens or the property prop changes, pre-fill the form
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        street: property.address?.street || '',
        city: property.address?.city || '',
        state: property.address?.state || '',
        zipCode: property.address?.zipCode || '',
        numberOfUnits: property.numberOfUnits || 1,
      });
    }
  }, [property, isOpen]);

  const mutation = useMutation({
    mutationFn: (propertyData: FormData) => {
      // Send a PUT request with FormData to handle the image
      return apiClient.put(`/properties/${property._id}`, propertyData);
    },
    onSuccess: () => {
      onPropertyUpdated(); // This will refetch the properties list
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update property.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const propertyFormData = new FormData();
    propertyFormData.append('name', formData.name);
    propertyFormData.append('address[street]', formData.street);
    propertyFormData.append('address[city]', formData.city);
    propertyFormData.append('address[state]', formData.state);
    propertyFormData.append('address[zipCode]', formData.zipCode);
    propertyFormData.append('numberOfUnits', formData.numberOfUnits.toString());

    if (imageFile) {
      propertyFormData.append('image', imageFile);
    }
    
    mutation.mutate(propertyFormData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg border border-border-color dark:border-border-color-dark transition-all duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
          <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">Edit Property</h2>
          <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark text-2xl transition-colors">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg transition-all duration-200">{error}</div>}
          
          {/* Form fields are similar to AddPropertyModal */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Property Name</label>
            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
          </div>
          {/* ... other fields for address, units etc. ... */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-light-text-dark">Address</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <input name="street" placeholder="Street" value={formData.street} onChange={handleChange} className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
              <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
              <input name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
              <input name="zipCode" placeholder="Zip Code" value={formData.zipCode} onChange={handleChange} className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
            </div>
          </div>
          <div>
            <label htmlFor="numberOfUnits" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Number of Units</label>
            <input type="number" min="1" name="numberOfUnits" id="numberOfUnits" required value={formData.numberOfUnits} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Property Image (Optional)</label>
            {property.imageUrl && !imageFile && <img src={property.imageUrl} alt="Current Property" className="h-24 w-auto rounded-md my-2" />}
            <input type="file" name="image" id="image" onChange={handleFileChange} className="mt-1 block w-full text-sm text-light-text dark:text-light-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-light-bg dark:file:bg-dark-bg file:text-light-text dark:file:text-light-text-dark hover:file:bg-border-color dark:hover:file:bg-border-color-dark transition-all duration-200"/>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
              <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors duration-200 disabled:opacity-50">
                {mutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyModal;
