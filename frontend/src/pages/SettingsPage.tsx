import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, Save, User as UserIcon, Palette, Globe, Sun, Moon, ChevronDown, Lock } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPage = () => {
    const { user, setToken } = useAuthStore();
    const queryClient = useQueryClient();
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

    const uploadLogoMutation = useMutation({ /* ... same as before ... */ });
    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => setBranding({ ...branding, [e.target.name]: e.target.value });
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... same as before ... */ };
    const handleUpdateBranding = (e: React.FormEvent) => { /* ... same as before ... */ };

    // --- NEW: Password Change Logic ---
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const passwordMutation = useMutation({
        mutationFn: (data: any) => apiClient.put('/users/update-password', data),
        onSuccess: (response) => {
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            // Update the token in the store with the new one from the backend
            if (response.data.token) {
                setToken(response.data.token);
            }
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
        }
    });

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        passwordMutation.mutate({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
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
                    {/* Profile, Language, Theme, and Branding sections remain the same */}
                    <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><UserIcon /> Your Profile</h2>
                        <p>Name: {user?.name}</p><p>Email: {user?.email}</p>
                    </div>

                    {/* --- NEW PASSWORD CHANGE SECTION --- */}
                    <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Lock /> Change Password</h2>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-1">Current Password</label>
                                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordInputChange} required className="w-full bg-brand-bg p-3 rounded-md border border-border-color"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-1">New Password</label>
                                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} required className="w-full bg-brand-bg p-3 rounded-md border border-border-color"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-1">Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordInputChange} required className="w-full bg-brand-bg p-3 rounded-md border border-border-color"/>
                            </div>
                            <div className="text-right pt-4">
                                <button type="submit" disabled={passwordMutation.isLoading} className="px-6 py-2.5 bg-brand-primary rounded-lg text-white font-semibold shadow-md hover:bg-brand-dark transition-colors disabled:opacity-50">
                                    {passwordMutation.isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
