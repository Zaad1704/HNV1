// frontend/src/components/common/AddTenantModal.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, PlusCircle, Trash2 } from 'lucide-react';

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const createTenant = async (newTenant: any) => {
    const { data } = await apiClient.post('/tenants', newTenant);
    return data.data;
};

const AddTenantModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', propertyId: '', unit: '', leaseEndDate: '', rentAmount: 0,
        gender: 'Male', fatherName: '', motherName: '', spouseName: '', numberOfOccupants: 1,
    });
    const [additionalAdults, setAdditionalAdults] = useState<{ name: string, phone: string }[]>([]);
    const { data: properties, isLoading: isLoadingProperties } = useQuery(['propertiesForTenantModal'], fetchProperties, { enabled: isOpen });

    const mutation = useMutation(createTenant, {
        onSuccess: () => {
            queryClient.invalidateQueries(['tenants']);
            onClose();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to add tenant.')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Completed: handleAdultChange function
    const handleAdultChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newAdults = [...additionalAdults];
        // Ensure the property exists on the object before assigning
        if (name === 'name') {
            newAdults[index].name = value;
        } else if (name === 'phone') {
            newAdults[index].phone = value;
        }
        setAdditionalAdults(newAdults);
    };

    const addAdult = () => setAdditionalAdults([...additionalAdults, { name: '', phone: '' }]);
    const removeAdult = (index: number) => setAdditionalAdults(additionalAdults.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const finalTenantData = { ...formData, additionalAdults };
        mutation.mutate(finalTenantData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card rounded-xl shadow-xl w-full max-w-3xl border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-dark-text">Add New Tenant</h2>
                    <button onClick={onClose} className="text-light-text hover:text-dark-text"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto text-light-text">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">{error}</div>}

                    <h3 className="text-lg font-semibold text-dark-text border-b border-border-color pb-2">Primary Tenant Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div><label className="block text-sm font-medium text-light-text">Full Name*</label><input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                         <div><label className="block text-sm font-medium text-light-text">Email*</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                         <div><label className="block text-sm font-medium text-light-text">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                    </div>

                    <h3 className="text-lg font-semibold text-dark-text border-b border-border-color pb-2 mt-4">Lease & Property</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           <div><label className="block text-sm font-medium text-light-text">Property*</label><select name="propertyId" required value={formData.propertyId} onChange={handleChange} disabled={isLoadingProperties} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"><option value="">{isLoadingProperties ? 'Loading...' : 'Select'}</option>{properties?.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                           <div><label className="block text-sm font-medium text-light-text">Unit*</label><input type="text" name="unit" required value={formData.unit} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                           <div><label className="block text-sm font-medium text-light-text">Monthly Rent*</label><input type="number" name="rentAmount" required value={formData.rentAmount} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                           <div><label className="block text-sm font-medium text-light-text">Lease End Date</label><input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                       </div>

                    <h3 className="text-lg font-semibold text-dark-text border-b border-border-color pb-2 mt-4">Other Occupants</h3>
                    {additionalAdults.map((adult, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border-color p-3 rounded-md relative">
                            <div>
                                <label className="block text-sm font-medium text-light-text">Adult Name</label>
                                <input type="text" name="name" value={adult.name} onChange={(e) => handleAdultChange(index, e)} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light-text">Adult Phone</label>
                                <input type="tel" name="phone" value={adult.phone} onChange={(e) => handleAdultChange(index, e)} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/>
                            </div>
                            <button type="button" onClick={() => removeAdult(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    <button type="button" onClick={addAdult} className="flex items-center gap-2 text-brand-primary font-semibold"><PlusCircle size={18}/> Add Another Adult</button>


                    <div className="flex justify-end space-x-4 pt-6 border-t border-border-color mt-6"><button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-dark-text font-semibold rounded-lg">Cancel</button><button type="submit" disabled={mutation.isLoading} className="px-6 py-2.5 bg-brand-orange text-white font-semibold rounded-lg disabled:opacity-50">{mutation.isLoading ? 'Saving...' : 'Save Tenant'}</button></div>
                </form>
            </div>
        </div>
    );
};
export default AddTenantModal;
