import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  const handleSaveProfile = () => {
    alert('Profile settings saved!');
  };

  const handleSaveNotifications = () => {
    alert('Notification settings saved!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

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

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="app-surface rounded-3xl p-4 border border-app-border">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'app-gradient text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-app-bg'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">Profile Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full p-3 border border-app-border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full p-3 border border-app-border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-3 border border-app-border rounded-xl"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="btn-gradient px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                >
                  <Save size={16} />
                  Save Profile
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">Notification Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                    { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                      <div>
                        <h3 className="font-medium text-text-primary">{item.label}</h3>
                        <p className="text-sm text-text-secondary">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveNotifications}
                  className="btn-gradient px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                >
                  <Save size={16} />
                  Save Notifications
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">Security Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Change Password</h3>
                    <p className="text-sm text-text-secondary mb-4">Update your account password</p>
                    <button className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
                      Change Password
                    </button>
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-text-secondary mb-4">Add an extra layer of security</p>
                    <button className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">App Preferences</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Theme</h3>
                    <p className="text-sm text-text-secondary mb-4">Choose your preferred theme</p>
                    <select className="p-2 border border-app-border rounded-xl">
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System</option>
                    </select>
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Language</h3>
                    <p className="text-sm text-text-secondary mb-4">Select your language</p>
                    <select className="p-2 border border-app-border rounded-xl">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;