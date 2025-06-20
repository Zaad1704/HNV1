import React, { useState } from 'react';
import apiClient from '../../api/client';

const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }: { isOpen: boolean, onClose: () => void, onPropertyAdded: (property: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    numberOfUnits: 1,
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const propertyData = {
        name: formData.name,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        numberOfUnits: formData.numberOfUnits,
      };
      const response = await apiClient.post('/properties', propertyData);
      onPropertyAdded(response.data.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add property.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-light-card rounded-xl shadow-xl w-full max-w-lg border border-border-color" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-border-color">
          <h2 className="text-xl font-bold text-dark-text">Add New Property</h2>
          <button onClick={onClose} className="text-light-text hover:text-dark-text text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-text">Property Name</label>
              <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md focus:ring-2 focus:ring-brand-orange" />
            </div>
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-light-text">Street Address</label>
              <input type="text" name="street" id="street" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md focus:ring-2 focus:ring-brand-orange" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                 <label htmlFor="city" className="block text-sm font-medium text-light-text">City</label>
                 <input type="text" name="city" id="city" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md focus:ring-2 focus:ring-brand-orange" />
              </div>
              <div>
                 <label htmlFor="state" className="block text-sm font-medium text-light-text">State / Province</label>
                 <input type="text" name="state" id="state" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md focus:ring-2 focus:ring-brand-orange" />
              </div>
               <div>
                 <label htmlFor="zipCode" className="block text-sm font-medium text-light-text">Zip / Postal Code</label>
                 <input type="text" name="zipCode" id="zipCode" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md focus:ring-2 focus:ring-brand-orange" />
              </div>
            </div>
             <div>
                <label htmlFor="numberOfUnits" className="block text-sm font-medium text-light-text">Number of Units</label>
                <input type="number" name="numberOfUnits" id="numberOfUnits" required min="1" onChange={handleChange} value={formData.numberOfUnits} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md focus:ring-2 focus:ring-brand-orange" />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-dark-text font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-brand-orange text-white font-semibold rounded-lg hover:opacity-90">Save Property</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;
