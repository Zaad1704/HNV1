import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useMutation } from '@tanstack/react-query';
import { X, UploadCloud } from 'lucide-react';

const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }: { isOpen: boolean, onClose: () => void, onPropertyAdded: (property: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '', street: '', city: '', state: '', zipCode: '', numberOfUnits: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (propertyData: FormData) => apiClient.post('/properties', propertyData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (response) => {
      onPropertyAdded(response.data.data);
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to add property.')
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImageFile(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const propertyFormData = new FormData();
    propertyFormData.append('name', formData.name);
    propertyFormData.append('address[street]', formData.street);
    propertyFormData.append('address[city]', formData.city);
    propertyFormData.append('address[state]', formData.state);
    propertyFormData.append('address[zipCode]', formData.zipCode);
    propertyFormData.append('numberOfUnits', formData.numberOfUnits.toString());
    
    if (imageFile) propertyFormData.append('image', imageFile);
    
    mutation.mutate(propertyFormData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-light-card rounded-xl shadow-xl w-full max-w-lg border border-border-color transform scale-100 opacity-100 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-border-color">
          <h2 className="text-xl font-bold text-dark-text">Add New Property</h2>
          <button onClick={onClose} className="text-light-text hover:text-dark-text text-2xl transition-colors">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm transition-all">{error}</div>}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-light-text">Property Name</label>
            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-dark-bg border-border-color rounded-md text-dark-text focus:ring-brand-primary focus:border-brand-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text">Address</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <input name="street" placeholder="Street" value={formData.street} onChange={handleChange} className="w-full px-3 py-2 bg-dark-bg border-border-color rounded-md text-dark-text focus:ring-brand-primary focus:border-brand-primary transition-all" />
              <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 bg-dark-bg border-border-color rounded-md text-dark-text focus:ring-brand-primary focus:border-brand-primary transition-all" />
              <input name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 bg-dark-bg border-border-color rounded-md text-dark-text focus:ring-brand-primary focus:border-brand-primary transition-all" />
              <input name="zipCode" placeholder="Zip Code" value={formData.zipCode} onChange={handleChange} className="w-full px-3 py-2 bg-dark-bg border-border-color rounded-md text-dark-text focus:ring-brand-primary focus:border-brand-primary transition-all" />
            </div>
          </div>
          <div>
            <label htmlFor="numberOfUnits" className="block text-sm font-medium text-light-text">Number of Units</label>
            <input type="number" min="1" name="numberOfUnits" id="numberOfUnits" required value={formData.numberOfUnits} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-dark-bg border-border-color rounded-md text-dark-text focus:ring-brand-primary focus:border-brand-primary transition-all"/>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-light-text">Property Image</label>
            <input type="file" name="image" id="image" onChange={handleFileChange} className="mt-1 block w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-light-text file:bg-dark-bg hover:file:bg-border-color transition-all"/>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-dark-bg text-dark-text font-semibold rounded-lg hover:bg-border-color transition-colors">Cancel</button>
              <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-primary text-dark-text font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all">
                <UploadCloud size={16} /> {mutation.isLoading ? 'Saving...' : 'Save Property'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
