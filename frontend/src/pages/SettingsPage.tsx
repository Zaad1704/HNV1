import React from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield } from 'lucide-react';

const SettingsPage = () => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="w-12 h-12 app-gradient rounded-xl mb-4 flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Profile Settings</h3>
          <p className="text-text-secondary mb-4">Update your personal information</p>
          <button className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
            Edit Profile
          </button>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="w-12 h-12 app-gradient rounded-xl mb-4 flex items-center justify-center">
            <Bell size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Notifications</h3>
          <p className="text-text-secondary mb-4">Configure notification preferences</p>
          <button className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
            Manage Notifications
          </button>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="w-12 h-12 app-gradient rounded-xl mb-4 flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Security</h3>
          <p className="text-text-secondary mb-4">Password and security settings</p>
          <button className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
            Security Settings
          </button>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="w-12 h-12 app-gradient rounded-xl mb-4 flex items-center justify-center">
            <Settings size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Preferences</h3>
          <p className="text-text-secondary mb-4">App preferences and settings</p>
          <button className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
            App Settings
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;