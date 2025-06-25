// frontend/src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useAuthStore } from 'store/authStore';
import apiClient from 'api/client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsCard = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <motion.div 
        className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-border-color dark:border-border-color-dark shadow-lg"
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
    >
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-dark-text dark:text-dark-text-dark">
            <Icon className="text-brand-primary" size={22} />
            {title}
        </h2>
        <div className="space-y-4">
            {children}
        </div>
    </motion.div>
);

const FormInput = ({ label, ...props }: { label: string, [key: string]: any }) => (
    <div>
        <label className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-1">{label}</label>
        <input {...props} />
    </div>
);

const SettingsPage = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const passwordMutation = useMutation({
        mutationFn: (passData: any) => apiClient.put('/users/update-password', passData),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
        passwordMutation.mutate({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
    };

    const deleteAccountMutation = useMutation({
        mutationFn: () => apiClient.post('/users/request-deletion'),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Deletion request successful. You will be logged out.' });
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
        if (window.confirm('Are you absolutely sure? This action is irreversible and will permanently erase all your data after a grace period.')) {
            deleteAccountMutation.mutate();
        }
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto p-4 md:p-0"
        >
            <h1 className="text-3xl font-bold mb-8 text-dark-text dark:text-dark-text-dark">Settings</h1>
            {message.text && (
                <div className={`p-3 rounded-lg mb-6 text-center text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            <div className="space-y-8">
                <SettingsCard title="Your Profile" icon={UserIcon}>
                    <p><strong className="text-light-text dark:text-light-text-dark">Name:</strong> <span className="font-semibold">{user?.name}</span></p>
                    <p><strong className="text-light-text dark:text-light-text-dark">Email:</strong> <span className="font-semibold">{user?.email}</span></p>
                    <p><strong className="text-light-text dark:text-light-text-dark">Role:</strong> <span className="font-semibold">{user?.role}</span></p>
                </SettingsCard>
                
                <SettingsCard title="Change Password" icon={Lock}>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <FormInput label="Current Password" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordInputChange} required />
                        <FormInput label="New Password" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} required />
                        <FormInput label="Confirm New Password" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordInputChange} required />
                        <div className="text-right pt-2">
                            <button type="submit" disabled={passwordMutation.isLoading} className="btn-primary">
                                {passwordMutation.isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </SettingsCard>

                 <div className="bg-red-500/10 p-6 sm:p-8 rounded-3xl border-2 border-red-500/30">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-red-500"><AlertTriangle /> Danger Zone</h2>
                    <p className="text-red-300 mb-4">
                        Requesting account deletion is a permanent action. All your data will be erased after a grace period.
                    </p>
                    <div className="text-right">
                        <button onClick={handleDeleteAccount} disabled={deleteAccountMutation.isLoading} className="px-5 py-2 bg-red-600 rounded-lg text-white font-semibold shadow-md hover:bg-red-700 disabled:opacity-50">
                            {deleteAccountMutation.isLoading ? 'Processing...' : 'Request Account Deletion'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SettingsPage;
