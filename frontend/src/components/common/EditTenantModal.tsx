// frontend/src/components/common/EditTenantModal.tsx
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
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-3xl shadow-xl w-full max-w-3xl border border-border-color dark:border-border-color-dark">
                <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">Edit Tenant: {tenant?.name}</h2>
                    <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-light-text dark:text-light-text-dark">
                    {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg">{error}</div>}
                    
                    <h3 className="text-lg font-semibold text-dark-text dark:text-dark-text-dark">Tenant Info</h3>
                    <div><label>Full Name*</label><input type="text" name="name" required value={formData.name || ''} onChange={handleChange} /></div>
                    <div><label>Email*</label><input type="email" name="email" required value={formData.email || ''} onChange={handleChange} /></div>
                    <div>
                        <label>Status</label>
                        <select name="status" value={formData.status || 'Active'} onChange={handleChange}>
                            <option value="Active">{t('common.active')}</option>
                            <option value="Inactive">{t('common.inactive')}</option>
                            <option value="Late">{t('tenant.late')}</option>
                        </select>
                    </div>
                    <div><label>Phone</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-border-color dark:border-border-color-dark mt-4">
                        <button type="button" onClick={onClose} className="btn-light">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="btn-primary">
                            {mutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTenantModal;
