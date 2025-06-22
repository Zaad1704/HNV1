// frontend/src/components/common/ReminderFormModal.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

// Define types for data
interface TenantOption {
    _id: string;
    name: string;
    unit: string;
    propertyId: { name: string };
}

interface ReminderFormData {
    tenantId: string;
    type: 'email_rent_reminder' | 'app_rent_reminder' | 'sms_rent_reminder';
    message: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextRunDate: string; // YYYY-MM-DD
    status: 'active' | 'inactive';
}

interface IReminder { // For pre-populating edit form
    _id?: string;
    tenantId: TenantOption | string; // Can be populated or just ID
    type: 'email_rent_reminder' | 'app_rent_reminder' | 'sms_rent_reminder';
    message?: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextRunDate: string | Date;
    status: 'active' | 'inactive' | 'sent' | 'failed';
}

interface ReminderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void; // Callback to refetch list
    reminderToEdit?: IReminder; // Optional, for editing
}

const fetchTenantsForReminder = async (): Promise<TenantOption[]> => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

const ReminderFormModal: React.FC<ReminderFormModalProps> = ({ isOpen, onClose, onSaveSuccess, reminderToEdit }) => {
    const queryClient = useQueryClient();
    const isEditing = !!reminderToEdit;

    const [formData, setFormData] = useState<ReminderFormData>({
        tenantId: '',
        type: 'email_rent_reminder',
        message: '',
        frequency: 'monthly',
        nextRunDate: new Date().toISOString().split('T')[0],
        status: 'active',
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing && reminderToEdit) {
            setFormData({
                tenantId: typeof reminderToEdit.tenantId === 'object' ? reminderToEdit.tenantId._id : reminderToEdit.tenantId,
                type: reminderToEdit.type,
                message: reminderToEdit.message || '',
                frequency: reminderToEdit.frequency,
                nextRunDate: new Date(reminderToEdit.nextRunDate).toISOString().split('T')[0],
                status: reminderToEdit.status === 'sent' || reminderToEdit.status === 'failed' ? 'active' : reminderToEdit.status, // Don't allow 'sent'/'failed' as editable status
            });
        } else {
            // Reset form for new reminder
            setFormData({
                tenantId: '',
                type: 'email_rent_reminder',
                message: '',
                frequency: 'monthly',
                nextRunDate: new Date().toISOString().split('T')[0],
                status: 'active',
            });
        }
    }, [isEditing, reminderToEdit, isOpen]); // Reset when modal opens or reminderToEdit changes

    const { data: tenants, isLoading: isLoadingTenants } = useQuery({
        queryKey: ['tenantsForReminder'],
        queryFn: fetchTenantsForReminder,
        enabled: isOpen, // Only fetch tenants when modal is open
    });

    const mutation = useMutation({
        mutationFn: (data: ReminderFormData) => 
            isEditing ? apiClient.put(`/reminders/${reminderToEdit?._id}`, data) : apiClient.post('/reminders', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] }); // Refetch list
            onSaveSuccess();
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} reminder.`);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card rounded-xl shadow-xl w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-dark-text">{isEditing ? 'Edit Reminder' : 'Create New Reminder'}</h2>
                    <button onClick={onClose} className="text-light-text hover:text-dark-text"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

                    {/* Tenant Selection */}
                    <div>
                        <label htmlFor="tenantId" className="block text-sm font-medium text-light-text">Tenant</label>
                        <select name="tenantId" id="tenantId" value={formData.tenantId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md" required disabled={isEditing}>
                            <option value="">{isLoadingTenants ? 'Loading Tenants...' : 'Select a Tenant'}</option>
                            {tenants?.map(tenant => (
                                <option key={tenant._id} value={tenant._id}>{tenant.name} - Unit {tenant.unit} ({tenant.propertyId?.name})</option>
                            ))}
                        </select>
                    </div>

                    {/* Reminder Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-light-text">Reminder Type</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md" required>
                            <option value="email_rent_reminder">Email Rent Reminder</option>
                            <option value="app_rent_reminder">In-App Rent Reminder</option>
                            <option value="sms_rent_reminder">SMS Rent Reminder (requires SMS service)</option>
                        </select>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-light-text">Frequency</label>
                        <select name="frequency" id="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md" required>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    {/* Next Run Date */}
                    <div>
                        <label htmlFor="nextRunDate" className="block text-sm font-medium text-light-text">Next Send Date</label>
                        <input type="date" name="nextRunDate" id="nextRunDate" value={formData.nextRunDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md" required/>
                    </div>

                    {/* Message (Optional) */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-light-text">Custom Message (Optional)</label>
                        <textarea name="message" id="message" rows={3} value={formData.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md"></textarea>
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-light-text">Status</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md" required>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-dark-text font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-orange text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
                            {mutation.isLoading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Reminder' : 'Create Reminder')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReminderFormModal;
