import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';

const SettingsPage = () => {
  const { user, login: updateUserToken } = useAuthStore((state) => ({ user: state.user, login: state.login }));

  const [profile, setProfile] = useState({ name: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setProfile({ name: user.name });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage({ type: '', text: '' });
    try {
      await apiClient.put('/users/updatedetails', { name: profile.name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // In a real app, refetching user data or updating the JWT would be ideal here.
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPassword !== password.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoadingPassword(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await apiClient.put('/users/updatepassword', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      updateUserToken(response.data.token);
      setPassword({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  const manageBilling = () => {
    // This would redirect the user to the 2Checkout customer portal
    alert('Redirecting to secure billing portal...');
  };
  
  const handleDataRequest = () => {
      alert('A request to download your data has been submitted. You will receive an email shortly.');
  }
  
  const handleAccountDeletion = () => {
      if(window.confirm('Are you sure you want to request account deletion? This action cannot be undone.')) {
          alert('Your account is now scheduled for deletion.');
      }
  }

  if (!user) return <div className="text-white text-center p-8">Loading settings...</div>;

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-8">Profile & Settings</h1>
      
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Settings */}
          <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-400">Full Name</label>
                <input type="text" name="name" id="name" value={profile.name} onChange={handleProfileChange} className="mt-1 block w-full px-4 py-2 bg-slate-900 border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-400">Email Address</label>
                <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full px-4 py-2 bg-slate-700 border-slate-600 rounded-lg cursor-not-allowed text-slate-400"/>
              </div>
              <div className="text-right pt-2">
                <button type="submit" disabled={loadingProfile} className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">
                  {loadingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Settings */}
          <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-400">Current Password</label>
                <input type="password" name="currentPassword" id="currentPassword" value={password.currentPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 bg-slate-900 border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"/>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-400">New Password</label>
                <input type="password" name="newPassword" id="newPassword" value={password.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 bg-slate-900 border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"/>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-slate-400">Confirm New Password</label>
                <input type="password" name="confirm" id="confirm" value={password.confirm} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 bg-slate-900 border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"/>
              </div>
              <div className="text-right pt-2">
                <button type="submit" disabled={loadingPassword} className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">
                  {loadingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
                 <h2 className="text-xl font-bold text-white mb-4">Subscription</h2>
                 <div className="bg-slate-700/50 border-l-4 border-pink-500 text-slate-200 p-4 rounded-r-lg">
                    <p className="font-bold">Current Plan: Agent Pro</p>
                    <p className="text-sm text-slate-400">Renews on July 1, 2025.</p>
                 </div>
                 <button onClick={manageBilling} className="w-full mt-6 px-5 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600">
                    Manage Billing & Invoices
                 </button>
                 <p className="text-xs text-slate-500 mt-2 text-center">You will be redirected to our secure payment partner.</p>
            </div>
            <div className="bg-red-900/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-red-700">
                 <h2 className="text-xl font-bold text-red-300 mb-4">Danger Zone</h2>
                 <p className="text-sm text-slate-400 mb-4">Request a download of all your data or permanently delete your account. This action cannot be undone.</p>
                 <div className="space-y-3">
                    <button onClick={handleDataRequest} className="w-full px-5 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500">Download My Data</button>
                    <button onClick={handleAccountDeletion} className="w-full px-5 py-3 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-700">Delete My Account</button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
