import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building, Save, User as UserIcon, Palette, Globe, Sun, Moon, Lock, AlertTriangle } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPage = () => {
    const { user, setToken, logout } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [branding, setBranding] = useState({ companyName: '', companyLogoUrl: '', companyAddress: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const { lang, setLang, getNextToggleLanguage, currentLanguageName } = useLang();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (user?.organizationId?.branding) {
            setBranding(user.organizationId.branding);
        }
    }, [user]);
    
    // Branding and Password change logic remains the same...
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
    const passwordMutation = useMutation({ /* ... */ });
    const handleUpdatePassword = (e: React.FormEvent) => { /* ... */ };
    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => setBranding({ ...branding, [e.target.name]: e.target.value });
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
    const handleUpdateBranding = (e: React.FormEvent) => { /* ... */ };
    const uploadLogoMutation = useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append('image', file);
            // This endpoint might need to be created if not already present
            return apiClient.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (response) => {
            setBranding(prev => ({ ...prev, companyLogoUrl: response.data.imageUrl }));
            setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Logo upload failed.' });
        }
    });

    // --- Account Deletion Logic ---
    const deleteAccountMutation = useMutation({
        mutationFn: () => apiClient.post('/users/request-deletion'),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Deletion request successful. You will be logged out now.' });
            // After a short delay, log the user out and redirect to login page.
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
        // Use a confirmation dialog to prevent accidental deletion
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
                    
                    {/* Change Password */}
                    <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Lock /> Change Password</h2>
                        {/* ... password form ... */}
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
