import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded }: { isOpen: boolean, onClose: () => void, onTenantAdded: (tenant: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unit: '',
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Fetch the user's properties to populate the dropdown select
  useEffect(() => {
    if (isOpen) {
      const fetchProperties = async () => {
        try {
          const response = await apiClient.get('/properties');
          setProperties(response.data.data);
        } catch (err) {
          console.error("Failed to fetch properties for modal", err);
          setError("Could not load properties list.");
        }
      };
      fetchProperties();
    }
  }, [isOpen]); // Refetch properties every time the modal opens

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.propertyId) {
      setError('You must select a property.');
      return;
    }
    try {
      const response = await apiClient.post('/tenants', formData);
      onTenantAdded(response.data.data); // Pass new tenant back to the parent page
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add tenant.');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Add New Tenant</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
                  <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500"/>
                </div>
                 <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
                  <input type="email" name="email" id="email" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500"/>
                </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Phone Number (Optional)</label>
              <input type="tel" name="phone" id="phone" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-slate-300">Property</label>
                <select name="propertyId" id="propertyId" required onChange={handleChange} value={formData.propertyId} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500">
                  <option value="" disabled>Select a property...</option>
                  {properties.map(prop => (
                    <option key={prop._id} value={prop._id}>{prop.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-slate-300">Unit / Apartment #</label>
                <input type="text" name="unit" id="unit" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500"/>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500">Save Tenant</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTenantModal;
