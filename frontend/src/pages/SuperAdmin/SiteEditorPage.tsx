import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client'; // apiClient should be configured to handle API calls

// NOTE: In a real app, you would define this interface in a shared types folder.
interface SiteSettings {
  theme: { primaryColor: string; secondaryColor: string; };
  logos: { navbarLogoUrl: string; };
  heroSection: { title: string; subtitle: string; ctaText: string; backgroundImageUrl: string };
  // Add other sections here
}

const SiteEditorPage = () => {
  // Use a single state object for all settings
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch current settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // A developer needs to create this GET endpoint on the backend
        const response = await apiClient.get('/super-admin/site-settings');
        setSettings(response.data.data || {});
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
      [section]: {
        // @ts-ignore
        ...prev[section],
        [field]: value,
      },
    }));
  };
  
  // Handler for file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: keyof SiteSettings, field: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
          setMessage('Uploading image...');
          // A developer needs to create this file upload endpoint
          const response = await apiClient.post('/super-admin/upload-image', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          handleChange(section, field, response.data.imageUrl); // Update state with new URL
          setMessage('Image uploaded successfully!');
      } catch (err) {
          setMessage('Error: Image upload failed.');
      }
  };

  const handleSave = async () => {
    setMessage('Saving...');
    try {
      // A developer needs to create this PUT endpoint on the backend
      await apiClient.put('/super-admin/site-settings', settings);
      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage('Error: Failed to save settings.');
    }
  };
  
  if (loading) return <div>Loading Site Editor...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Landing Page Site Editor</h1>
        <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
          Save All Changes
        </button>
      </div>
      {message && <div className="p-3 text-center bg-gray-100 rounded-md">{message}</div>}

      {/* --- Theme & Colors Section --- */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Theme & Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={settings.theme?.primaryColor || ''} onChange={(e) => handleChange('theme', 'primaryColor', e.target.value)} className="w-10 h-10"/>
                    <input type="text" value={settings.theme?.primaryColor || ''} onChange={(e) => handleChange('theme', 'primaryColor', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                 <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={settings.theme?.secondaryColor || ''} onChange={(e) => handleChange('theme', 'secondaryColor', e.target.value)} className="w-10 h-10"/>
                    <input type="text" value={settings.theme?.secondaryColor || ''} onChange={(e) => handleChange('theme', 'secondaryColor', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
                </div>
            </div>
        </div>
      </div>

      {/* --- Hero Section Editor --- */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Hero Section</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" value={settings.heroSection?.title || ''} onChange={(e) => handleChange('heroSection', 'title', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea rows={2} value={settings.heroSection?.subtitle || ''} onChange={(e) => handleChange('heroSection', 'subtitle', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'heroSection', 'backgroundImageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          {settings.heroSection?.backgroundImageUrl && <img src={settings.heroSection.backgroundImageUrl} alt="Hero background preview" className="mt-2 rounded-lg max-h-40"/>}
        </div>
      </div>
       {/* A developer would add more sections here (Features, About, etc.) following the same pattern */}
    </div>
  );
};

export default SiteEditorPage;
