import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, Image as ImageIcon, Save } from 'lucide-react';

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState({ 
      name: '', 
      address: { street: '', city: '', state: '', zipCode: '' } 
  });
  
  // --- NEW: State for branding form ---
  const [branding, setBranding] = useState({
      companyName: '',
      companyLogoUrl: '',
      companyAddress: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  
  // --- NEW: Mutation for updating branding ---
  const updateBrandingMutation = useMutation({
      mutationFn: (updatedBranding: any) => apiClient.put('/users/organization/branding', updatedBranding),
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Branding updated successfully!' });
        // Refresh user data to get the latest branding info
        queryClient.invalidateQueries(['getMe']); 
      },
      onError: (err: any) => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update branding.' });
      }
  });

  // --- NEW: Mutation for uploading the logo ---
  const uploadLogoMutation = useMutation({
    mutationFn: (formData: FormData) => apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (response) => {
      // Once logo is uploaded, update the branding state and then save it
      const newLogoUrl = response.data.imageUrl;
      setBranding(b => ({...b, companyLogoUrl: newLogoUrl }));
      updateBrandingMutation.mutate({ companyLogoUrl: newLogoUrl });
      setMessage({ type: 'success', text: 'Logo uploaded! Saving...' });
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Logo upload failed.' });
    },
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        address: user.address || { street: '', city: '', state: '', zipCode: '' },
      });
      // --- NEW: Populate branding form from user data ---
      if (user.organizationId?.branding) {
        setBranding({
            companyName: user.organizationId.branding.companyName || '',
            companyLogoUrl: user.organizationId.branding.companyLogoUrl || '',
            companyAddress: user.organizationId.branding.companyAddress || '',
        });
      }
    }
  }, [user]);

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBranding({ ...branding, [e.target.name]: e.target.value });
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      uploadLogoMutation.mutate(formData);
  };

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    updateBrandingMutation.mutate(branding);
  };

  // ... (keep your existing profile update logic: handleProfileChange, handleUpdateProfile, etc.)

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-8">Profile & Settings</h1>
      {message.text && (
        <div className={`p-3 rounded-lg mb-6 text-center text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {message.text}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          {/* --- NEW: Organization Branding Form --- */}
          <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Building /> Organization Branding</h2>
            <form onSubmit={handleUpdateBranding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Company Name</label>
                <input type="text" name="companyName" value={branding.companyName} onChange={handleBrandingChange} className="w-full bg-slate-900 p-2 rounded-md border border-slate-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Company Address</label>
                <input type="text" name="companyAddress" value={branding.companyAddress} onChange={handleBrandingChange} className="w-full bg-slate-900 p-2 rounded-md border border-slate-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Company Logo</label>
                <div className="flex items-center gap-4 mt-2">
                    {branding.companyLogoUrl && <img src={branding.companyLogoUrl} alt="Company Logo" className="w-16 h-16 rounded-lg bg-slate-700 object-contain p-1" />}
                    <input type="file" name="companyLogo" onChange={handleLogoUpload} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600"/>
                </div>
                 {uploadLogoMutation.isLoading && <p className="text-sm text-amber-400 mt-2">Uploading logo...</p>}
              </div>

              <div className="text-right pt-2">
                <button type="submit" disabled={updateBrandingMutation.isLoading} className="px-5 py-2.5 bg-cyan-600 rounded-lg disabled:bg-slate-600 flex items-center gap-2 ml-auto">
                  <Save size={16} /> {updateBrandingMutation.isLoading ? 'Saving...' : 'Save Branding'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Profile Information Form can go here */}
          {/* <div className="bg-slate-800/70 p-8 rounded-2xl"> ... </div> */}

        </div>
        <div className="lg:col-span-1 space-y-8">
            {/* Other settings cards can go here */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
