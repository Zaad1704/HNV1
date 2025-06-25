import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, PlusCircle, Trash2 } from 'lucide-react';

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const createTenant = async (newTenantData: FormData) => {
    const { data } = await apiClient.post('/tenants', newTenantData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data;
};

const AddTenantModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', propertyId: '', unit: '', leaseEndDate: '', rentAmount: 0,
        fatherName: '', motherName: '', permanentAddress: '', govtIdNumber: '',
        referenceName: '', referencePhone: '', referenceIdNumber: '',
    });
    const [imageFiles, setImageFiles] = useState<{
        imageUrl: File | null;
        govtIdImageUrlFront: File | null;
        govtIdImageUrlBack: File | null;
    }>({
        imageUrl: null,
        govtIdImageUrlFront: null,
        govtIdImageUrlBack: null,
    });
    
    const [additionalAdults, setAdditionalAdults] = useState<{ name: string, phone: string }[]>([]);

    const { data: properties, isLoading: isLoadingProperties } = useQuery({
        queryKey:['propertiesForTenantModal'], 
        queryFn: fetchProperties, 
        enabled: isOpen 
    });

    const mutation = useMutation({
        mutationFn: createTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            onClose(); 
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to add tenant.')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(prev => ({ ...prev, [e.target.name]: e.target.files?.[0] || null }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const finalTenantData = new FormData();

        for (const key in formData) {
            finalTenantData.append(key, (formData as any)[key]);
        }
        for (const key in imageFiles) {
            if ((imageFiles as any)[key]) {
                finalTenantData.append(key, (imageFiles as any)[key]);
            }
        }
        
        finalTenantData.append('additionalAdults', JSON.stringify(additionalAdults));
        
        mutation.mutate(finalTenantData);
    };
    
    const handleAdultChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newAdults = [...additionalAdults];
        (newAdults[index] as any)[name] = value;
        setAdditionalAdults(newAdults);
    };
    const addAdult = () => setAdditionalAdults([...additionalAdults, { name: '', phone: '' }]);
    const removeAdult = (index: number) => setAdditionalAdults(additionalAdults.filter((_, i) => i !== index));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card rounded-xl shadow-xl w-full max-w-4xl border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-dark-text">Add New Tenant</h2>
                    <button onClick={onClose} className="text-light-text hover:text-dark-text"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto text-sm text-light-text">
                    {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-center">{error}</div>}

                    <h3 className="text-lg font-semibold text-dark-text border-b border-border-color pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div><label>Full Name*</label><input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 w-full bg-dark-bg p-2 rounded-md border border-border-color text-dark-text"/></div>
                         <div><label>Father's Name</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="mt-1 w-full bg-dark-bg p-2 rounded-md border border-border-color text-dark-text"/></div>
                         <div><label>Mother's Name</label><input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="mt-1 w-full bg-dark-bg p-2 rounded-md border border-border-color text-dark-text"/></div>
                         <div><label>Email*</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full bg-dark-bg p-2 rounded-md border border-border-color text-dark-text"/></div>
                         <div><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full bg-dark-bg p-2 rounded-md border border-border-color text-dark-text"/></div>
                         <div className="md:col-span-3"><label>Permanent Address</label><input type="text" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="mt-1 w-full bg-dark-bg p-2 rounded-md border border-border-color text-dark-text"/></div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6 border-t border-border-color mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-dark-bg text-dark-text font-semibold rounded-lg hover:bg-border-color">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-6 py-2.5 bg-brand-primary text-brand-dark font-semibold rounded-lg disabled:opacity-50">
                            {mutation.isLoading ? 'Saving...' : 'Save Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddTenantModal;
