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
    const handleAdultChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedAdults = [...additionalAdults];
        updatedAdults[index] = { ...updatedAdults[index], [e.target.name]: e.target.value };
        setAdditionalAdults(updatedAdults);
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
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-700">
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Add New Tenant</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
                    {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center">{error}</div>}
                    <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-white">Lease & Property Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                           <div><label className="block text-sm text-slate-300">Property*</label><select name="propertyId" required value={formData.propertyId} onChange={handleChange} disabled={isLoadingProperties} className="mt-1 w-full bg-slate-900 p-2 rounded-md"><option value="">{isLoadingProperties ? 'Loading...' : 'Select'}</option>{properties?.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                           <div><label className="block text-sm text-slate-300">Unit*</label><input type="text" name="unit" required value={formData.unit} onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                           <div><label className="block text-sm text-slate-300">Monthly Rent Amount*</label><input type="number" name="rentAmount" required value={formData.rentAmount} onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                           <div><label className="block text-sm text-slate-300">Lease End Date</label><input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                       </div>
                    </div>
                    {/* ... other form sections ... */}
                    <div className="flex justify-end space-x-4 pt-6"><button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-600 font-semibold rounded-lg">Cancel</button><button type="submit" disabled={mutation.isLoading} className="px-6 py-2.5 bg-cyan-600 font-semibold rounded-lg disabled:bg-slate-500">{mutation.isLoading ? 'Saving...' : 'Save Tenant'}</button></div>
                </form>
            </div>
        </div>
    );
};
export default AddTenantModal;
