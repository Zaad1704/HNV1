import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

const EditTenantModal = ({ isOpen, onClose, tenant, onTenantUpdated }:any) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                email: tenant.email || '',
                phone: tenant.phone || '',
                unit: tenant.unit || '',
                status: tenant.status || 'Active',
                fatherName: tenant.fatherName || '',
                motherName: tenant.motherName || '',
                permanentAddress: tenant.permanentAddress || '',
                govtIdNumber: tenant.govtIdNumber || '',
            });
        }
    }, [tenant, isOpen]);

    const mutation = useMutation({
        mutationFn: (updatedData: FormData) => apiClient.put(`/tenants/${tenant._id}`, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenantDetails', tenant._id] });
            onTenantUpdated();
            onClose();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to update tenant.')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedFormData = new FormData();
        for (const key in formData) {
            updatedFormData.append(key, formData[key]);
        }
        mutation.mutate(updatedFormData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-3xl border border-border-color dark:border-border-color-dark transition-all duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">Edit Tenant: {tenant?.name}</h2>
                    <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-light-text dark:text-light-text-dark">
                    {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg transition-all duration-200">{error}</div>}
                    
                    <h3 className="text-lg font-semibold text-dark-text dark:text-dark-text-dark">Tenant Info</h3>
                    <div><label>Full Name*</label><input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="mt-1 w-full bg-light-bg dark:bg-dark-bg p-2 rounded-md border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/></div>
                    <div><label>Email*</label><input type="email" name="email" required value={formData.email || ''} onChange={handleChange} className="mt-1 w-full bg-light-bg dark:bg-dark-bg p-2 rounded-md border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/></div>
                    <div>
                        <label>Status</label>
                        <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="mt-1 w-full bg-light-bg dark:bg-dark-bg p-2 rounded-md border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Late">Late</option>
                        </select>
                    </div>
                    <div><label>Phone</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 w-full bg-light-bg dark:bg-dark-bg p-2 rounded-md border border-border-color dark:border-border-color-dark text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/></div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-border-color dark:border-border-color-dark mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-light-bg dark:bg-dark-bg rounded-lg text-dark-text dark:text-dark-text-dark hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50">
                            {mutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTenantModal;
