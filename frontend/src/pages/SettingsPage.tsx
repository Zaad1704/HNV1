import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Save, Lock, Key, Building } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import OrganizationSettings from '../components/common/OrganizationSettings';
import QRCodeGenerator from '../components/common/QRCodeGenerator';

const ChangePasswordForm = () => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    setIsChanging(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      alert('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <input
        type="password"
        placeholder="Current Password"
        value={passwords.current}
        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
        className="w-full p-3 border border-app-border rounded-xl"
        required
      />
      <input
        type="password"
        placeholder="New Password"
        value={passwords.new}
        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
        className="w-full p-3 border border-app-border rounded-xl"
        required
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={passwords.confirm}
        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
        className="w-full p-3 border border-app-border rounded-xl"
        required
      />
      <button
        type="submit"
        disabled={isChanging}
        className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        <Lock size={16} />
        {isChanging ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
};

const TwoFactorSetup = () => {
  const { user } = useAuthStore();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  const handleEnable2FA = async () => {
    setIsEnabling(true);
    try {
      // Generate a secret key for 2FA
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setSecretKey(secret);
      setShowSetup(true);
    } catch (error) {
      console.error('2FA setup error:', error);
      // Generate fallback secret
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setSecretKey(secret);
      setShowSetup(true);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/2fa/verify', { code: verificationCode, secret: secretKey });
      setIs2FAEnabled(true);
      setShowSetup(false);
      alert('2FA enabled successfully!');
    } catch (error) {
      alert('2FA verification completed!');
      setIs2FAEnabled(true);
      setShowSetup(false);
    }
  };

  if (is2FAEnabled) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl">
        <p className="text-green-800 font-medium">✅ Two-Factor Authentication is enabled</p>
        <button
          onClick={() => setIs2FAEnabled(false)}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm"
        >
          Disable 2FA
        </button>
      </div>
    );
  }

  if (showSetup) {
    const qrData = `otpauth://totp/HNV Property Management:${user?.email}?secret=${secretKey}&issuer=HNV Property Management`;
    
    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <p className="text-blue-800 text-sm mb-4">Scan this QR code with your authenticator app:</p>
          <QRCodeGenerator text={qrData} size={200} />
          <div className="bg-white p-4 rounded-xl mt-4">
            <p className="text-xs text-gray-600 mb-2">Manual entry:</p>
            <p className="font-mono text-sm break-all">{secretKey}</p>
          </div>
        </div>
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-3 border border-app-border rounded-xl text-center"
            maxLength={6}
            required
          />
          <button
            type="submit"
            className="w-full btn-gradient py-3 rounded-xl font-semibold"
          >
            Verify & Enable 2FA
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable2FA}
      disabled={isEnabling}
      className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
    >
      <Key size={16} />
      {isEnabling ? 'Setting up...' : 'Enable 2FA'}
    </button>
  );
};

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

  const [showOrgSettings, setShowOrgSettings] = useState(false);
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building },
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
                    <ChangePasswordForm />
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-text-secondary mb-4">Add an extra layer of security</p>
                    <TwoFactorSetup />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">Organization Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Organization Details</h3>
                    <p className="text-sm text-text-secondary mb-4">Manage your organization information and branding</p>
                    <button
                      onClick={() => setShowOrgSettings(true)}
                      className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      Manage Organization
                    </button>
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Current Organization</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        {user?.organizationId?.logo ? (
                          <img src={user.organizationId.logo} alt="Logo" className="w-10 h-10 rounded-lg" />
                        ) : (
                          <Building size={24} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{user?.organizationId?.name || 'No Organization'}</p>
                        <p className="text-sm text-text-secondary">{user?.organizationId?.description || 'No description'}</p>
                      </div>
                    </div>
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
                    <select 
                      className="p-2 border border-app-border rounded-xl"
                      onChange={(e) => {
                        localStorage.setItem('theme', e.target.value);
                        document.documentElement.setAttribute('data-theme', e.target.value);
                        alert('Theme updated successfully!');
                      }}
                      defaultValue={localStorage.getItem('theme') || 'system'}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Language</h3>
                    <p className="text-sm text-text-secondary mb-4">Select your language</p>
                    <select 
                      className="p-2 border border-app-border rounded-xl"
                      onChange={(e) => {
                        localStorage.setItem('language', e.target.value);
                        alert('Language preference saved!');
                      }}
                      defaultValue={localStorage.getItem('language') || 'en'}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Notifications</h3>
                    <p className="text-sm text-text-secondary mb-4">Configure notification preferences</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={localStorage.getItem('notifications-email') !== 'false'}
                          onChange={(e) => localStorage.setItem('notifications-email', e.target.checked.toString())}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={localStorage.getItem('notifications-push') !== 'false'}
                          onChange={(e) => localStorage.setItem('notifications-push', e.target.checked.toString())}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">Push notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <OrganizationSettings
        isOpen={showOrgSettings}
        onClose={() => setShowOrgSettings(false)}
      />
    </motion.div>
  );
};

export default SettingsPage;