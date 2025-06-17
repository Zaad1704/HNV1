import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation } from '@tanstack/react-query';

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();

  const [profile, setProfile] = useState({ 
      name: '', 
      address: { street: '', city: '', state: '', zipCode: '' } 
  });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Mutation for ID upload
  const uploadIdMutation = useMutation(
    (formData: FormData) => apiClient.post('/upload/image', formData), {
      onSuccess: (response) => {
        // After getting the URL, save it to the user profile
        return apiClient.put('/users/updatedetails', { governmentIdUrl: response.data.imageUrl });
      },
      onError: (error: any) => {
        setMessage({ type: 'error', text: error.response?.data?.message || 'ID upload failed.' });
      },
    }
  );

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        address: user.address || { street: '', city: '', state: '', zipCode: '' },
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'zipCode'].includes(name)) {
        setProfile(p => ({ ...p, address: { ...p.address, [name]: value } }));
    } else {
        setProfile(p => ({ ...p, [name]: value }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };
  
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      uploadIdMutation.mutate(formData);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await apiClient.put('/users/updatedetails', profile);
      setUser(response.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
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
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPassword({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
        setLoadingPassword(false);
    }
  };
  
  const manageBilling = () => alert('This would redirect to a secure billing portal.');
  const handleDataRequest = () => alert('A request to download your data has been submitted.');
  const handleAccountDeletion = () => {
      if(window.confirm('Are you sure you want to request account deletion?')) {
          alert('Your account deletion request has been submitted.');
      }
  };

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
          <div className="bg-slate-800/70 p-8 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-400">Full Name</label>
                    <input type="text" name="name" id="name" value={profile.name} onChange={handleProfileChange} className="mt-1 block w-full px-4 py-2 bg-slate-900 border-slate-600 rounded-lg"/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-400">Email Address</label>
                    <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full px-4 py-2 bg-slate-700 border-slate-600 rounded-lg cursor-not-allowed"/>
                </div>
                <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
                    <div className="space-y-4">
                        <div><label htmlFor="street" className="text-sm">Street</label><input type="text" name="street" value={profile.address.street} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div><label htmlFor="city" className="text-sm">City</label><input type="text" name="city" value={profile.address.city} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                            <div><label htmlFor="state" className="text-sm">State</label><input type="text" name="state" value={profile.address.state} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                            <div><label htmlFor="zipCode" className="text-sm">Zip Code</label><input type="text" name="zipCode" value={profile.address.zipCode} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        </div>
                    </div>
                </div>
                <div className="text-right pt-2"><button type="submit" disabled={loadingProfile} className="px-5 py-2.5 bg-cyan-600 font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">{loadingProfile ? 'Saving...' : 'Save Profile'}</button></div>
            </form>
          </div>

          {/* Password Settings */}
          <div className="bg-slate-800/70 p-8 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div><label htmlFor="currentPassword">Current Password</label><input type="password" name="currentPassword" id="currentPassword" value={password.currentPassword} onChange={handlePasswordChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
              <div><label htmlFor="newPassword">New Password</label><input type="password" name="newPassword" id="newPassword" value={password.newPassword} onChange={handlePasswordChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
              <div><label htmlFor="confirm">Confirm New Password</label><input type="password" name="confirm" id="confirm" value={password.confirm} onChange={handlePasswordChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
              <div className="text-right pt-2"><button type="submit" disabled={loadingPassword} className="px-5 py-2.5 bg-cyan-600 font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">{loadingPassword ? 'Updating...' : 'Update Password'}</button></div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
            {/* Subscription */}
            <div className="bg-slate-800/70 p-8 rounded-2xl shadow-lg border border-slate-700">
                 <h2 className="text-xl font-bold text-white mb-4">Subscription</h2>
                 <div className="bg-slate-700/50 border-l-4 border-pink-500 p-4 rounded-r-lg"><p className="font-bold">Current Plan: Agent Pro</p><p className="text-sm text-slate-400">Renews on July 1, 2025.</p></div>
                 <button onClick={manageBilling} className="w-full mt-6 px-5 py-3 bg-slate-700 font-semibold rounded-lg hover:bg-slate-600">Manage Billing</button>
            </div>
             {/* Identity Verification */}
            <div className="bg-slate-800/70 p-8 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Identity Verification</h2>
                <div>
                    <label htmlFor="governmentId" className="block text-sm font-medium text-slate-400">Upload Government ID</label>
                    <input type="file" name="governmentId" id="governmentId" onChange={handleIdUpload} className="mt-1 w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600"/>
                    {uploadIdMutation.isLoading && <p className="text-sm text-amber-400 mt-2">Uploading ID...</p>}
                </div>
           </div>
            {/* Danger Zone */}
            <div className="bg-red-900/50 p-8 rounded-2xl shadow-lg border border-red-700">
                 <h2 className="text-xl font-bold text-red-300 mb-4">Danger Zone</h2>
                 <p className="text-sm text-slate-400 mb-4">Request a download of all your data or permanently delete your account.</p>
                 <div className="space-y-3">
                    <button onClick={handleDataRequest} className="w-full px-5 py-3 bg-amber-600 font-semibold rounded-lg hover:bg-amber-500">Download My Data</button>
                    <button onClick={handleAccountDeletion} className="w-full px-5 py-3 bg-red-800 font-semibold rounded-lg hover:bg-red-700">Delete My Account</button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
