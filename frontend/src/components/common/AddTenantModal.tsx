import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, PlusCircle, Trash2 } from 'lucide-react';

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const createTenant = async (newTenant: any) => {
    // A developer would add file upload logic here first
    const { data } = await apiClient.post('/tenants', newTenant);
    return data.data;
};

const AddTenantModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    
    // State for basic form data
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', propertyId: '', unit: '', leaseEndDate: '',
        gender: 'Male', fatherName: '', motherName: '', spouseName: '', numberOfOccupants: 1,
    });

    // Separate state for the dynamic list of additional adults
    const [additionalAdults, setAdditionalAdults] = useState<{ name: string, phone: string }[]>([]);

    // Fetch properties for the dropdown
    const { data: properties, isLoading: isLoadingProperties } = useQuery(['properties'], fetchProperties, { enabled: isOpen });

    // Mutation for creating the tenant
    const mutation = useMutation(createTenant, {
        onSuccess: () => {
            queryClient.invalidateQueries(['tenants']);
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to add tenant.');
        }
    });

    // Handlers for form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdultChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedAdults = [...additionalAdults];
        updatedAdults[index] = { ...updatedAdults[index], [e.target.name]: e.target.value };
        setAdditionalAdults(updatedAdults);
    };

    const addAdult = () => {
        setAdditionalAdults([...additionalAdults, { name: '', phone: '' }]);
    };

    const removeAdult = (index: number) => {
        const updatedAdults = additionalAdults.filter((_, i) => i !== index);
        setAdditionalAdults(updatedAdults);
    };

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
                    
                    {/* --- Primary Info --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label htmlFor="name" className="block text-sm text-slate-300">Full Name*</label><input type="text" name="name" required onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label htmlFor="email" className="block text-sm text-slate-300">Email*</label><input type="email" name="email" required onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label htmlFor="phone" className="block text-sm text-slate-300">Phone</label><input type="tel" name="phone" onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label htmlFor="gender" className="block text-sm text-slate-300">Gender</label><select name="gender" onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"><option>Male</option><option>Female</option><option>Other</option></select></div>
                        <div><label htmlFor="fatherName" className="block text-sm text-slate-300">Father's Name</label><input type="text" name="fatherName" onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label htmlFor="motherName" className="block text-sm text-slate-300">Mother's Name</label><input type="text" name="motherName" onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label htmlFor="spouseName" className="block text-sm text-slate-300">Spouse's Name</label><input type="text" name="spouseName" onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                    </div>

                    {/* --- Lease & Property Info --- */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                        <div><label htmlFor="propertyId" className="block text-sm text-slate-300">Property*</label><select name="propertyId" required onChange={handleChange} disabled={isLoadingProperties} className="mt-1 w-full bg-slate-900 p-2 rounded-md"><option value="">{isLoadingProperties ? 'Loading...' : 'Select'}</option>{properties?.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                        <div><label htmlFor="unit" className="block text-sm text-slate-300">Unit*</label><input type="text" name="unit" required onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label htmlFor="leaseEndDate" className="block text-sm text-slate-300">Lease End Date</label><input type="date" name="leaseEndDate" onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                    </div>
                    
                    {/* --- Occupants Info --- */}
                    <div className="pt-4 border-t border-slate-700">
                         <h3 className="text-lg font-semibold text-white">Occupants</h3>
                         <div><label htmlFor="numberOfOccupants" className="block text-sm text-slate-300">How many people will live in the unit?*</label><input type="number" name="numberOfOccupants" min="1" required onChange={handleChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                         
                         <div className="mt-4 space-y-3">
                            <label className="block text-sm text-slate-300">Additional Adults</label>
                            {additionalAdults.map((adult, index) => (
                                <div key={index} className="flex items-end gap-2 p-3 bg-slate-900/50 rounded-md">
                                    <div className="flex-grow grid grid-cols-2 gap-2">
                                        <input type="text" name="name" placeholder={`Adult ${index + 2} Name`} value={adult.name} onChange={(e) => handleAdultChange(index, e)} className="w-full bg-slate-900 p-2 rounded-md"/>
                                        <input type="tel" name="phone" placeholder="Phone Number" value={adult.phone} onChange={(e) => handleAdultChange(index, e)} className="w-full bg-slate-900 p-2 rounded-md"/>
                                    </div>
                                    <button type="button" onClick={() => removeAdult(index)} className="p-2 text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={addAdult} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"><PlusCircle size={16}/> Add Another Adult</button>
                         </div>
                    </div>

                    <div className="flex justify-end
