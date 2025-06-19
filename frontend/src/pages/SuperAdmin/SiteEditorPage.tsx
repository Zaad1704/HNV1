// frontend/src/pages/SuperAdmin/SiteEditorPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2 } from 'lucide-react';

// This interface should now match your updated backend model
interface SiteSettings {
  theme: { primaryColor: string; secondaryColor: string; };
  logos: { navbarLogoUrl: string; faviconUrl: string; };
  heroSection: { title: string; subtitle: string; ctaText: string; backgroundImageUrl: string };
  featuresSection: { title: string; subtitle: string; card1Title: string; card1Text: string; card2Title: string; card2Text: string; card3Title: string; card3Text: string; };
  pricingSection: { title: string; subtitle: string; };
  aboutSection: { title: string; subtitle: string; missionTitle: string; missionText: string; visionTitle: string; visionText: string; imageUrl: string; teamTitle: string; teamSubtitle: string; executives: { name: string; title: string; imageUrl: string }[] };
  contactSection: { title: string; subtitle: string; formTitle: string; addresses: { locationName: string; fullAddress: string }[] };
  ctaSection: { title: string; subtitle: string; buttonText: string; backgroundImageUrl: string; };
}

const SiteEditorPage = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/site-settings');
        const fetchedSettings = response.data.data || {};
        if (fetchedSettings.aboutSection && !fetchedSettings.aboutSection.executives) fetchedSettings.aboutSection.executives = [];
        if (fetchedSettings.contactSection && !fetchedSettings.contactSection.addresses) fetchedSettings.contactSection.addresses = [];
        setSettings(fetchedSettings);
      } catch (err) {
        setMessage('Error: Failed to fetch site settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Generic handler for nested state changes
  const handleChange = (section: keyof SiteSettings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), [field]: value },
    }));
  };

  const handleArrayChange = (section: keyof SiteSettings, arrayName: string, index: number, field: string, value: string) => {
      setSettings(prev => {
          const newSection = { ...prev[section] };
          // @ts-ignore
          newSection[arrayName][index][field] = value;
          return { ...prev, [section]: newSection };
      });
  };

  const addArrayItem = (section: keyof SiteSettings, arrayName: string, newItem: object) => {
      setSettings(prev => {
          const newSection = { ...prev[section] };
          // @ts-ignore
          if (!newSection[arrayName]) newSection[arrayName] = [];
          // @ts-ignore
          newSection[arrayName].push(newItem);
          return { ...prev, [section]: newSection };
      });
  };
  
  const removeArrayItem = (section: keyof SiteSettings, arrayName: string, index: number) => {
      setSettings(prev => {
          const newSection = { ...prev[section] };
          // @ts-ignore
          newSection[arrayName].splice(index, 1);
          return { ...prev, [section]: newSection };
      });
  };

  const handleSave = async () => {
    try {
      setMessage('Saving...');
      await apiClient.put('/site-settings', settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: Failed to save settings.');
    }
  };
  
  const InputField = ({ section, field, placeholder }: { section: keyof SiteSettings, field: string, placeholder: string }) => (
      <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{placeholder}</label>
          <input type="text" placeholder={placeholder} value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
      </div>
  );

  if (loading) return <div>Loading Site Editor...</div>;

  return (
    <div className="space-y-8 text-gray-800">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md sticky top-4 z-20">
            <h1 className="text-3xl font-bold">Landing Page Editor</h1>
            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all">Save All Changes</button>
        </div>
        {message && <div className="p-3 text-center bg-green-100 text-green-800 rounded-md sticky top-24 z-10">{message}</div>}

        {/* --- Branding Section --- */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Branding & Theme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField section="logos" field="navbarLogoUrl" placeholder="Navbar Logo URL" />
                <InputField section="logos" field="faviconUrl" placeholder="Favicon URL" />
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Primary Color</label>
                    <input type="color" value={settings.theme?.primaryColor || ''} onChange={e => handleChange('theme', 'primaryColor', e.target.value)} className="w-full h-10 p-1 bg-gray-50 border rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Secondary Color</label>
                    <input type="color" value={settings.theme?.secondaryColor || ''} onChange={e => handleChange('theme', 'secondaryColor', e.target.value)} className="w-full h-10 p-1 bg-gray-50 border rounded-lg"/>
                </div>
            </div>
        </div>
        
        {/* --- Hero Section --- */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Hero Section</h2>
            <InputField section="heroSection" field="title" placeholder="Title" />
            <InputField section="heroSection" field="subtitle" placeholder="Subtitle" />
            <InputField section="heroSection" field="ctaText" placeholder="Button Text" />
            <InputField section="heroSection" field="backgroundImageUrl" placeholder="Background Image URL" />
        </div>

        {/* All other sections here */}

        {/* --- Pricing Section --- */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Pricing Section</h2>
            <InputField section="pricingSection" field="title" placeholder="Title (e.g., 'Choose Your Plan')" />
            <InputField section="pricingSection" field="subtitle" placeholder="Subtitle" />
        </div>

    </div>
  );
};

export default SiteEditorPage;
