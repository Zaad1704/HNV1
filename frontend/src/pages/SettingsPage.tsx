import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState({ 
      name: '', 
      address: { street: '', city: '', state: '', zipCode: '' } 
  });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const updateProfileMutation = useMutation(
    (updatedProfile: any) => apiClient.put('/users/updatedetails', updatedProfile), {
      onSuccess: (response) => {
        setUser(response.data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      },
      onError: (err: any) => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
      }
    }
  );

  const uploadIdMutation = useMutation(
    (formData: FormData) => apiClient.post('/upload/image', formData), {
      onSuccess: (response) => {
        updateProfileMutation.mutate({ governmentIdUrl: response.data.imageUrl });
        setMessage({ type: 'success', text: 'ID uploaded successfully! Saving...' });
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      uploadIdMutation.mutate(formData);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    updateProfileMutation.mutate(profile);
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => { /* ... */ };
  const manageBilling = () => { /* ... */ };
  const handleDataRequest = () => { /* ... */ };
  const handleAccountDeletion = () => { /* ... */ };

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-8">Profile & Settings</h1>
      {/* ... message display ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information Form */}
          <div className="bg-slate-800/70 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Name and Email fields */}
              <div>
                <label>Full Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/>
              </div>
              <div>
                <label>Email Address</label>
                <input type="email" value={user?.email || ''} disabled className="mt-1 w-full bg-slate-700 p-2 rounded-md cursor-not-allowed"/>
              </div>
              {/* Address Fields */}
              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <div className="space-y-4">
                    <div><label>Street</label><input type="text" name="street" value={profile.address.street} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div><label>City</label><input type="text" name="city" value={profile.address.city} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label>State</label><input type="text" name="state" value={profile.address.state} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                        <div><label>Zip Code</label><input type="text" name="zipCode" value={profile.address.zipCode} onChange={handleProfileChange} className="mt-1 w-full bg-slate-900 p-2 rounded-md"/></div>
                    </div>
                </div>
              </div>
              <div className="text-right pt-2">
                <button type="submit" disabled={updateProfileMutation.isLoading} className="px-5 py-2.5 bg-cyan-600 rounded-lg disabled:bg-slate-600">
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
          {/* ... Password Settings Form ... */}
        </div>
        <div className="lg:col-span-1 space-y-8">
            {/* ... Subscription and Danger Zone sections ... */}
            <div className="bg-slate-800/70 p-8 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">Identity Verification</h2>
                <div>
                    <label htmlFor="governmentId" className="block text-sm font-medium text-slate-400">Upload Government ID</label>
                    <input type="file" name="governmentId" id="governmentId" onChange={handleIdUpload} className="mt-1 w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600"/>
                    {uploadIdMutation.isLoading && <p className="text-sm text-amber-400 mt-2">Uploading...</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
