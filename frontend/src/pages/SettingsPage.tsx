import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Ensure useMutation is imported
import { Building, Save, User as UserIcon, Palette, Globe, Sun, Moon, ChevronDown } from 'lucide-react'; // Ensure all icons are imported
import { useLang } from '../contexts/LanguageContext'; // Ensure useLang is imported
import { useTheme } from '../contexts/ThemeContext'; // Ensure useTheme is imported
import { useTranslation } from 'react-i18next'; // Ensure useTranslation is imported

const SettingsPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const queryClient = useQueryClient();

  const [branding, setBranding] = useState({ companyName: '', companyLogoUrl: '', companyAddress: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); // State for language mini-dropdown (used in complex toggle)

  const { lang, setLang, getNextToggleLanguage, currentLanguageName, toggleLanguages } = useLang();
  const { theme, toggleTheme } = useTheme();

  // Mutation for uploading logo file
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('image', file); // 'image' must match multer field name in backend
      return apiClient.post('/upload/image', formData);
    },
    onSuccess: (response) => {
      // On successful upload, update the branding state with the new URL
      setBranding(prev => ({ ...prev, companyLogoUrl: response.data.imageUrl }));
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload logo.' });
    }
  });

  const handleLanguageChange = (newLangCode: string) => {
    setLang(newLangCode); // Update context and local storage
    setIsLangMenuOpen(false); // Close menu after selection
  };

  useEffect(() => {
    // Ensure user and organization branding data is available before setting state
    if (user && user.organizationId && typeof user.organizationId === 'object' && 'branding' in user.organizationId) {
      setBranding(user.organizationId.branding);
    }
  }, [user]);

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => setBranding({ ...branding, [e.target.name]: e.target.value });
  
  // CORRECTED: handleLogoUpload to use the mutation
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) {
          setMessage({ type: 'error', text: 'No file selected for upload.' });
          return;
      }
      uploadLogoMutation.mutate(e.target.files[0]); // Call the mutation with the file
  };

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    // This is where you would call a mutation to save the *branding details* to the backend
    // For example: saveBrandingMutation.mutate(branding);
    console.log("Saving branding:", branding);
    setMessage({ type: 'success', text: 'Branding changes saved (frontend only for now)!' });
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
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><UserIcon /> Your Profile</h2>
            <p className="text-light-text mb-4">Name: {user?.name || 'N/A'}</p>
            <p className="text-light-text">Email: {user?.email || 'N/A'}</p>
          </div>

          <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Globe /> Language Settings</h2>
            {/* Language Toggle for Settings */}
            <div className="relative"> {/* Added relative for positioning */}
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} // Toggle visibility of mini-dropdown
                className="flex items-center gap-2 px-4 py-2 bg-brand-bg border border-border-color rounded-lg text-dark-text font-semibold hover:bg-gray-100 transition-colors"
                title={`Current Language: ${currentLanguageName}`}
              >
                {currentLanguageName} <ChevronDown size={16} />
              </button>
              {isLangMenuOpen && (
                <div className="absolute left-0 mt-2 w-36 bg-light-card border border-border-color rounded-md shadow-lg z-20">
                  {toggleLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${lang === l.code ? 'bg-gray-50 text-brand-primary' : 'text-dark-text hover:bg-gray-50'}`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-light-text mt-4">Select the language for the application interface.</p>
          </div>

          <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Palette /> Theme Settings</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-light-text">Current Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
              <button 
                onClick={toggleTheme}
                className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark transition-colors flex items-center gap-2"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} Toggle Theme
              </button>
            </div>
             <p className="text-xs text-light-text mt-2">Your device's default theme (light/dark) is detected on load.</p>
          </div>

          <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Building /> Organization Branding</h2>
            <form onSubmit={handleUpdateBranding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-1">Company Name</label>
                <input type="text" name="companyName" value={branding.companyName} onChange={handleBrandingChange} className="w-full bg-brand-bg p-3 rounded-md border border-border-color"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-1">Company Address</label>
                <input type="text" name="companyAddress" value={branding.companyAddress} onChange={handleBrandingChange} className="w-full bg-brand-bg p-3 rounded-md border border-border-color"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-1">Company Logo</label>
                <div className="flex items-center gap-4 mt-2">
                    {/* Display current logo preview */}
                    {branding.companyLogoUrl && <img src={branding.companyLogoUrl} alt="Logo Preview" className="w-16 h-16 rounded-lg bg-gray-100 object-contain p-1 border border-border-color" />}
                    {/* File input for new logo upload */}
                    <input type="file" name="companyLogoFile" onChange={handleLogoUpload} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
                </div>
              </div>

              <div className="text-right pt-4">
                <button type="submit" className="px-6 py-2.5 bg-brand-primary rounded-lg text-white font-semibold shadow-md hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto">
                  <Save size={16} /> Save Branding
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
