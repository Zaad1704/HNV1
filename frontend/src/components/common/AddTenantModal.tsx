import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded }: { isOpen: boolean, onClose: () => void, onTenantAdded: (tenant: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', propertyId: '', unit: '',
    referenceName: '', referencePhone: '', referenceEmail: ''
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { /* ... (existing useEffect to fetch properties) ... */ }, [isOpen]);

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
      // A developer would add logic here to first upload files (image, ID)
      // and get back URLs to include in the submissionData.
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyId: formData.propertyId,
        unit: formData.unit,
        reference: {
            name: formData.referenceName,
            phone: formData.referencePhone,
            email: formData.referenceEmail,
        }
      };
      const response = await apiClient.post('/tenants', submissionData);
      onTenantAdded(response.data.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add tenant.');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Add New Tenant</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}
            
            {/* --- Primary Tenant Info --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
                  <input type="text" name="name" id="name" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
                </div>
                 <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
                  <input type="email" name="email" id="email" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
                </div>
            </div>
            {/* ... Other fields like phone, property, unit ... */}

            {/* --- NEW: Document/Image Uploads --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-300">Tenant Photo</label>
                    <input type="file" name="imageUrl" id="imageUrl" className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600"/>
                 </div>
                 <div>
                    <label htmlFor="idCardUrl" className="block text-sm font-medium text-slate-300">Government ID Card</label>
                    <input type="file" name="idCardUrl" id="idCardUrl" className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600"/>
                 </div>
            </div>

            {/* --- NEW: Optional Reference Section --- */}
            <div className="pt-4 mt-4 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white">Reference <span className="text-sm text-slate-400">(Optional)</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="referenceName" className="block text-sm font-medium text-slate-300">Reference Full Name</label>
                        <input type="text" name="referenceName" id="referenceName" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
                    </div>
                    <div>
                        <label htmlFor="referencePhone" className="block text-sm font-medium text-slate-300">Reference Phone</label>
                        <input type="tel" name="referencePhone" id="referencePhone" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500">Save Tenant</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenantModal;
