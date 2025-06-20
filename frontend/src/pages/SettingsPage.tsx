import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, Save, User as UserIcon } from 'lucide-react';

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [branding, setBranding] = useState({ companyName: '', companyLogoUrl: '', companyAddress: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const updateBrandingMutation = useMutation({
      mutationFn: (updatedBranding: any) => apiClient.put('/users/organization/branding', updatedBranding),
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Branding updated successfully!' });
        queryClient.invalidateQueries(['getMe']); 
      },
      onError: (err: any) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update branding.' })
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (formData: FormData) => apiClient.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (response) => {
      const newLogoUrl = response.data.imageUrl;
      setBranding(b => ({...b, companyLogoUrl: newLogoUrl }));
      updateBrandingMutation.mutate({ companyLogoUrl: newLogoUrl });
      setMessage({ type: 'success', text: 'Logo uploaded! Saving...' });
    },
    onError: (error: any) => setMessage({ type: 'error', text: error.response?.data?.message || 'Logo upload failed.' }),
  });

  useEffect(() => {
    if (user && user.organizationId?.branding) {
      setBranding(user.organizationId.branding);
    }
  }, [user]);

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => setBranding({ ...branding, [e.target.name]: e.target.value });
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      uploadLogoMutation.mutate(formData);
  };
  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    updateBrandingMutation.mutate(branding);
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
          
          <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Building /> Organization Branding</h2>
            <form onSubmit={handleUpdateBranding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-1">Company Name</label>
                <input type="text" name="companyName" value={branding.companyName} onChange={handleBrandingChange} className="w-full bg-light-bg p-2 rounded-md border border-border-color"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-1">Company Address</label>
                <input type="text" name="companyAddress" value={branding.companyAddress} onChange={handleBrandingChange} className="w-full bg-light-bg p-2 rounded-md border border-border-color"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-1">Company Logo</label>
                <div className="flex items-center gap-4 mt-2">
                    {branding.companyLogoUrl && <img src={branding.companyLogoUrl} alt="Logo" className="w-16 h-16 rounded-lg bg-gray-100 object-contain p-1 border border-border-color" />}
                    <input type="file" name="companyLogo" onChange={handleLogoUpload} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
                </div>
                 {uploadLogoMutation.isLoading && <p className="text-sm text-brand-orange mt-2">Uploading logo...</p>}
              </div>

              <div className="text-right pt-2">
                <button type="submit" disabled={updateBrandingMutation.isLoading} className="px-5 py-2.5 bg-brand-orange rounded-lg text-white font-semibold disabled:opacity-50 flex items-center gap-2 ml-auto">
                  <Save size={16} /> {updateBrandingMutation.isLoading ? 'Saving...' : 'Save Branding'}
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
