import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, User as UserIcon, Building } from 'lucide-react';

const SettingsPage = () => {
    const { user, setToken, logout, setUser } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    // State for branding form
    const [brandingData, setBrandingData] = useState({
        companyName: user?.organizationId?.branding?.companyName || '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(user?.organizationId?.branding?.companyLogoUrl || null);

    const [message, setMessage] = useState({ type: '', text: '' });

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };
    
    const handleBrandingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBrandingData({ ...brandingData, [e.target.name]: e.target.value });
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const passwordMutation = useMutation({
        mutationFn: (passData: any) => apiClient.put('/users/update-password', passData),
        onSuccess: (data) => {
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setToken(data.data.token);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
        }
    });
    
    const brandingMutation = useMutation({
        mutationFn: (formData: FormData) => apiClient.put('/orgs/me/branding', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: async () => {
            setMessage({ type: 'success', text: 'Branding updated successfully! Refreshing session...' });
            // Refetch user data to update the branding in the dashboard header
            const response = await apiClient.get('/auth/me');
            setUser(response.data.data);
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update branding.' });
        }
    });

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        passwordMutation.mutate({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
    };

    const handleUpdateBranding = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        const formData = new FormData();
        formData.append('companyName', brandingData.companyName);
        if (logoFile) {
            formData.append('companyLogo', logoFile);
        }
        brandingMutation.mutate(formData);
    };

    const deleteAccountMutation = useMutation({
        mutationFn: () => apiClient.post('/users/request-deletion'),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Deletion request successful. You will be logged out now.' });
            setTimeout(() => {
                logout();
                navigate('/login', { replace: true });
            }, 3000);
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to request account deletion.' });
        }
    });

    const handleDeleteAccount = () => {
        if (window.confirm('Are you absolutely sure you want to delete your account? This action is irreversible and will permanently erase all your data after a grace period.')) {
            deleteAccountMutation.mutate();
        }
    };

    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>
            {message.text && (
                <div className={`p-3 rounded-lg mb-6 text-center text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-3 space-y-8">
                    {/* Profile Info */}
                    <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><UserIcon /> Your Profile</h2>
                        <p><strong className="text-light-text">Name:</strong> {user?.name}</p>
                        <p><strong className="text-light-text">Email:</strong> {user?.email}</p>
                        <p><strong className="text-light-text">Role:</strong> {user?.role}</p>
                    </div>
                    
                    {/* Branding Settings Card */}
                    {user?.role === 'Landlord' && (
                        <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Building /> Organization Branding</h2>
                            <form onSubmit={handleUpdateBranding} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-light-text mb-1">Company Name</label>
                                    <input type="text" name="companyName" value={brandingData.companyName} onChange={handleBrandingInputChange} className="w-full bg-light-bg p-2 rounded-md border border-border-color"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-light-text mb-1">Company Logo</label>
                                    {logoPreview && <img src={logoPreview} alt="Logo Preview" className="h-16 w-auto rounded-md my-2 bg-white p-1" />}
                                    <input type="file" name="companyLogo" accept="image/*" onChange={handleLogoFileChange} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
                                </div>
                                <div className="text-right pt-2">
                                    <button type="submit" disabled={brandingMutation.isLoading} className="px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
                                        {brandingMutation.isLoading ? 'Saving...' : 'Update Branding'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {/* Change Password */}
                    <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Lock /> Change Password</h2>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-1">Current Password</label>
                                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordInputChange} required className="w-full bg-light-bg p-2 rounded-md border border-border-color"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-1">New Password</label>
                                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} required className="w-full bg-light-bg p-2 rounded-md border border-border-color"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-1">Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordInputChange} required className="w-full bg-light-bg p-2 rounded-md border border-border-color"/>
                            </div>
                            <div className="text-right pt-2">
                                <button type="submit" disabled={passwordMutation.isLoading} className="px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
                                    {passwordMutation.isLoading ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Danger Zone - Account Deletion */}
                    <div className="bg-light-card p-8 rounded-xl border-2 border-red-500/50 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-red-700"><AlertTriangle /> Danger Zone</h2>
                        <p className="text-light-text mb-4">
                            Deleting your account is a permanent action. All of your data, including properties, tenants, and financial records, will be scheduled for permanent removal from our systems. This cannot be undone.
                        </p>
                        <div className="text-right">
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={deleteAccountMutation.isLoading}
                                className="px-6 py-2.5 bg-red-600 rounded-lg text-white font-semibold shadow-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteAccountMutation.isLoading ? 'Processing...' : 'Request Account Deletion'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
