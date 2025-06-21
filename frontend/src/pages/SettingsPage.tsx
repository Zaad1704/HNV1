import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, Save, User as UserIcon, Palette, Globe, Sun, Moon, ChevronDown } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next'; // Necessary for useTranslation hook if used elsewhere, but main language state handled by useLang

const SettingsPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const queryClient = useQueryClient();

  const [branding, setBranding] = useState({ companyName: '', companyLogoUrl: '', companyAddress: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  // Removed isLangMenuOpen from SettingsPage state, as the language toggle is now a direct cycle button
  // const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Use useLang context for language state and toggling options
  const { lang, setLang, getNextToggleLanguage, currentLanguageName, toggleLanguages } = useLang();
  // Use useTheme context for theme state and toggling
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Ensure user and organization branding data is available before setting state
    if (user && user.organizationId && typeof user.organizationId === 'object' && 'branding' in user.organizationId) {
      setBranding(user.organizationId.branding);
    }
  }, [user]);

  // Handle changes to branding input fields
  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => setBranding({ ...branding, [e.target.name]: e.target.value });
  
  // Placeholder for logo upload logic (would typically involve a mutation to /upload/image)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      const mockImageUrl = URL.createObjectURL(file); // For temporary visual
      setBranding(prev => ({ ...prev, companyLogoUrl: mockImageUrl }));
      // In a real app: uploadMutation.mutate(file); then in onSuccess update the state with actual backend URL
  };

  // Handle saving branding changes (placeholder for backend API call)
  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
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
          
          {/* User Profile Information (Existing) */}
          <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><UserIcon /> Your Profile</h2>
            <p className="text-light-text mb-4">Name: {user?.name || 'N/A'}</p>
            <p className="text-light-text">Email: {user?.email || 'N/A'}</p>
            {/* Password change form or profile update form can be added here */}
          </div>

          {/* Localization Settings */}
          <div className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Globe /> Language Settings</h2>
            {/* Language Toggle for Settings */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-light-text">Current Language: {currentLanguageName}</span>
              {toggleLanguages.length > 1 && ( // Only show toggle button if there's more than one language option
                <button 
                  onClick={() => setLang(getNextToggleLanguage().code)} // Cycle to the next language in toggleLanguages
                  className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark transition-colors flex items-center gap-2"
                  title={`Switch to ${getNextToggleLanguage().name}`}
                >
                  <Globe size={16} /> Switch to {getNextToggleLanguage().name}
                </button>
              )}
              {toggleLanguages.length <= 1 && ( // Message if only one language is available
                <span className="text-sm text-gray-500">Only English available for your region.</span>
              )}
            </div>
            <p className="text-sm text-light-text mt-4">Select the language for the application interface.</p>
          </div>

          {/* Theming Settings */}
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

          {/* Organization Branding (Existing) */}
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
                    {branding.companyLogoUrl && <img src={branding.companyLogoUrl} alt="Logo" className="w-16 h-16 rounded-lg bg-gray-100 object-contain p-1 border border-border-color" />}
                    <input type="file" name="companyLogo" onChange={handleLogoUpload} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
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
