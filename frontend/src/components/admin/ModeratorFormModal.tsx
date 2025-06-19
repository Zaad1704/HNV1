import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useMutation } from '@tanstack/react-query';

// Define the list of available permissions for your platform
const AVAILABLE_PERMISSIONS = [
    { id: 'can_manage_users', label: 'Manage Users & Orgs' },
    { id: 'can_manage_billing', label: 'Manage Billing & Plans' },
    { id: 'can_manage_content', label: 'Manage Site Content' },
    { id: 'can_view_reports', label: 'View Platform Reports' }
];

const ModeratorFormModal = ({ isOpen, onClose, moderator }: { isOpen: boolean, onClose: () => void, moderator: any }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        permissions: [] as string[],
    });
    const [error, setError] = useState('');

    const isEditing = !!moderator;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: moderator.name,
                email: moderator.email,
                password: '', // Don't show existing password
                permissions: moderator.permissions || [],
            });
        } else {
            setFormData({ name: '', email: '', password: '', permissions: [] });
        }
    }, [moderator, isEditing, isOpen]);

    const mutation = useMutation({
        mutationFn: (modData: any) => {
            if (isEditing) {
                return apiClient.put(`/super-admin/moderators/${moderator._id}`, modData);
            }
            return apiClient.post('/super-admin/moderators', modData);
        },
        onSuccess: () => {
            onClose(); // Close the modal on success
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} moderator.`);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePermissionChange = (permissionId: string) => {
        setFormData(prev => {
            const newPermissions = prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId];
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const dataToSubmit: any = {
            name: formData.name,
            email: formData.email,
            permissions: formData.permissions,
        };
        // Only include password if creating a new moderator
        if (!isEditing) {
            dataToSubmit.password = formData.password;
        }
        mutation.mutate(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Moderator' : 'Add New Moderator'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEditing} className="mt-1 w-full px-3 py-2 border rounded-md disabled:bg-gray-100" />
                    </div>
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_PERMISSIONS.map(perm => (
                                <label key={perm.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.permissions.includes(perm.id)}
                                        onChange={() => handlePermissionChange(perm.id)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <span>{perm.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                            {mutation.isPending ? 'Saving...' : 'Save Moderator'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModeratorFormModal;
