import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useMutation } from '@tanstack/react-query';
import { X, Upload, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddPropertyModal = ({ 
  isOpen, 
  onClose, 
  onPropertyAdded 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded: (property: any) => void;
}) => {
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

  const mutation = useMutation({
    mutationFn: (propertyData: FormData) => apiClient.post('/properties', propertyData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (response) => {
      onPropertyAdded(response.data.data);
      onClose();
      // Reset form
      setFormData({
        name: '', 
        street: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        numberOfUnits: 1,
      });
      setImageFile(null);
      setError('');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="app-surface rounded-3xl shadow-app-xl w-full max-w-lg border border-app-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-app-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 app-gradient rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Add New Property</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-app-bg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm"
                >
                  {error}
                </motion.div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Enter property name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="street"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={handleChange}
                    className="sm:col-span-2"
                  />
                  <input
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <input
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                  />
                  <input
                    name="zipCode"
                    placeholder="Zip Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="numberOfUnits" className="block text-sm font-medium text-text-secondary mb-2">
                  Number of Units
                </label>
                <input
                  type="number"
                  min="1"
                  name="numberOfUnits"
                  id="numberOfUnits"
                  required
                  value={formData.numberOfUnits}
                  onChange={handleChange}
                  placeholder="1"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-text-secondary mb-2">
                  Property Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="image"
                    id="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex items-center justify-center w-full p-6 border-2 border-dashed border-app-border rounded-2xl cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all"
                  >
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-text-muted mb-2" />
                      <p className="text-sm text-text-secondary">
                        {imageFile ? imageFile.name : 'Click to upload image'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary hover:bg-app-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isLoading}
                  className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 disabled:opacity-50"
                >
                  {mutation.isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Building2 size={16} />
                  )}
                  {mutation.isLoading ? 'Saving...' : 'Save Property'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddPropertyModal;
