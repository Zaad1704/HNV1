import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

const AdminProfilePage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }));

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
      // In a real app, you might want to refresh the user data in the store here
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
      await apiClient.put('/users/updatepassword', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully! Your token has been refreshed. You may need to log in again with your new password on your next session.' });
      setPassword({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="text-gray-800">
      <h1 className="text-3xl font-bold mb-8">Admin Profile & Settings</h1>
      
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" id="name" value={profile.name} onChange={handleProfileChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full px-4 py-2 bg-gray-200 border-gray-300 rounded-lg cursor-not-allowed text-gray-500"/>
            </div>
            <div className="text-right pt-2">
              <button type="submit" disabled={loadingProfile} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
                {loadingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
             <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" name="currentPassword" id="currentPassword" value={password.currentPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" name="newPassword" id="newPassword" value={password.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" name="confirm" id="confirm" value={password.confirm} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
              </div>
            <div className="text-right pt-2">
              <button type="submit" disabled={loadingPassword} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
