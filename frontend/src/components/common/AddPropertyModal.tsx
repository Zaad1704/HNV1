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
  // Add state for the image file
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Add a handler for the file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Use FormData to send both JSON-like data and the file
    const propertyFormData = new FormData();
    propertyFormData.append('name', formData.name);
    // For nested objects like 'address', we send them as separate fields
    propertyFormData.append('address[street]', formData.street);
    propertyFormData.append('address[city]', formData.city);
    propertyFormData.append('address[state]', formData.state);
    propertyFormData.append('address[zipCode]', formData.zipCode);
    propertyFormData.append('numberOfUnits', formData.numberOfUnits.toString());
    
    if (imageFile) {
        propertyFormData.append('image', imageFile);
    }
    
    try {
      // Post the FormData object
      const response = await apiClient.post('/properties', propertyFormData);
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
            {/* ... other form fields for name, address, etc. ... */}
            
            {/* Add the new file input field */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-light-text">Property Image (Optional)</label>
              <input type="file" name="image" id="image" onChange={handleFileChange} className="mt-1 block w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
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
