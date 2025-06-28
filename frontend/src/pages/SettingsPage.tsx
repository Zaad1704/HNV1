import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { User, Mail, Lock, Save, Bell, Globe, Palette, Trash2, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, getNextToggleLanguage } = useLang();
  const { currency, currencyCode } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organizationName: user?.organizationId?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('email', formData.email);
      if (formData.organizationName) {
        updateData.append('organizationName', formData.organizationName);
      }
      if (profileImage) {
        updateData.append('profileImage', profileImage);
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage('New passwords do not match');
          setLoading(false);
          return;
        }
        updateData.append('currentPassword', formData.currentPassword);
        updateData.append('newPassword', formData.newPassword);
      }

      const { data } = await apiClient.put('/auth/profile', updateData);
      setUser(data.data);
      setMessage('Profile updated successfully!');
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2 app-surface rounded-3xl p-6 border border-app-border">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Profile Information</h2>
          
          {message && (
            <div className={`p-4 rounded-2xl mb-6 ${
              message.includes('success') 
                ? 'bg-green-50 text-green-600 border border-green-200' 
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Organization Name
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Profile Picture / Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
              />
            </div>

            <hr className="border-app-border" />

            <div>
              <h3 className="font-medium text-text-primary mb-4">Change Password (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient px-8 py-3 rounded-2xl flex items-center gap-2 font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Palette size={20} />
              Appearance
            </h3>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-app-bg rounded-2xl hover:bg-app-border transition-colors"
            >
              <span className="text-text-primary">Theme</span>
              <span className="text-text-secondary capitalize">{theme}</span>
            </button>
          </div>

          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Globe size={20} />
              Language
            </h3>
            <button
              onClick={() => setLang(getNextToggleLanguage().code)}
              className="w-full flex items-center justify-between p-4 bg-app-bg rounded-2xl hover:bg-app-border transition-colors"
            >
              <span className="text-text-primary">Language</span>
              <span className="text-text-secondary">{getNextToggleLanguage().name}</span>
            </button>
          </div>

          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-text-primary">Email Notifications</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-text-primary">Push Notifications</span>
                <input type="checkbox" className="rounded" />
              </label>
            </div>
          </div>

          <div className="app-surface rounded-3xl p-6 border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
              <Trash2 size={20} />
              Danger Zone
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors">
                <Download size={16} />
                Download All Data
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Account deletion is permanent and cannot be undone. Download your data first.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;