import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

// NOTE: In a real app, you would define this interface in a shared types folder.
interface SiteSettings {
  theme: { primaryColor: string; secondaryColor: string; };
  logos: { navbarLogoUrl: string; faviconUrl: string; };
  heroSection: { title: string; subtitle: string; ctaText: string; backgroundImageUrl: string };
  featuresSection: { title: string; subtitle: string; card1Title: string; card1Text: string; card2Title: string; card2Text: string; card3Title: string; card3Text: string; };
  aboutSection: { title: string; subtitle: string; missionTitle: string; missionText: string; visionTitle: string; visionText: string; imageUrl: string; };
  ctaSection: { title: string; subtitle: string; buttonText: string; backgroundImageUrl: string; };
}

const SiteEditorPage = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch current settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/site-settings');
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
          // This endpoint needs to be created on the backend for Super Admins
          const response = await apiClient.post('/super-admin/upload-image', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          handleChange(section, field, response.data.imageUrl);
          setMessage('Image uploaded successfully!');
      } catch (err) {
          setMessage('Error: Image upload failed.');
      }
  };

  const handleSave = async () => {
    setMessage('Saving...');
    try {
      await apiClient.put('/site-settings', settings);
      setMessage('Settings saved successfully!');
       setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
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
      {message && <div className="p-3 text-center bg-gray-100 rounded-md sticky top-20 z-10">{message}</div>}

      {/* --- Theme & Logos Section --- */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Theme & Logos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                <input type="text" value={settings.theme?.primaryColor || ''} onChange={(e) => handleChange('theme', 'primaryColor', e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                <input type="text" value={settings.theme?.secondaryColor || ''} onChange={(e) => handleChange('theme', 'secondaryColor', e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navbar Logo</label>
                <input type="file" onChange={(e) => handleFileUpload(e, 'logos', 'navbarLogoUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"/>
                {settings.logos?.navbarLogoUrl && <img src={settings.logos.navbarLogoUrl} alt="Navbar Logo Preview" className="mt-2 rounded-lg max-h-16 bg-gray-200 p-2"/>}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
          <input type="text" value={settings.heroSection?.ctaText || ''} onChange={(e) => handleChange('heroSection', 'ctaText', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'heroSection', 'backgroundImageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"/>
          {settings.heroSection?.backgroundImageUrl && <img src={settings.heroSection.backgroundImageUrl} alt="Hero background preview" className="mt-2 rounded-lg max-h-40"/>}
        </div>
      </div>
      
      {/* --- NEW: Features Section Editor --- */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Features Section</h2>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
            <input type="text" value={settings.featuresSection?.title || ''} onChange={(e) => handleChange('featuresSection', 'title', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <textarea rows={2} value={settings.featuresSection?.subtitle || ''} onChange={(e) => handleChange('featuresSection', 'subtitle', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
        </div>
        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
                <input type="text" placeholder="Card 1 Title" value={settings.featuresSection?.card1Title || ''} onChange={(e) => handleChange('featuresSection', 'card1Title', e.target.value)} className="w-full px-3 py-2 mb-2 bg-gray-50 border rounded-lg"/>
                <textarea placeholder="Card 1 Text" value={settings.featuresSection?.card1Text || ''} onChange={(e) => handleChange('featuresSection', 'card1Text', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
            </div>
             <div>
                <input type="text" placeholder="Card 2 Title" value={settings.featuresSection?.card2Title || ''} onChange={(e) => handleChange('featuresSection', 'card2Title', e.target.value)} className="w-full px-3 py-2 mb-2 bg-gray-50 border rounded-lg"/>
                <textarea placeholder="Card 2 Text" value={settings.featuresSection?.card2Text || ''} onChange={(e) => handleChange('featuresSection', 'card2Text', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
            </div>
             <div>
                <input type="text" placeholder="Card 3 Title" value={settings.featuresSection?.card3Title || ''} onChange={(e) => handleChange('featuresSection', 'card3Title', e.target.value)} className="w-full px-3 py-2 mb-2 bg-gray-50 border rounded-lg"/>
                <textarea placeholder="Card 3 Text" value={settings.featuresSection?.card3Text || ''} onChange={(e) => handleChange('featuresSection', 'card3Text', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
            </div>
        </div>
      </div>

      {/* --- NEW: About Section Editor --- */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">About Section</h2>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={settings.aboutSection?.title || ''} onChange={(e) => handleChange('aboutSection', 'title', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission Title</label>
            <input type="text" value={settings.aboutSection?.missionTitle || ''} onChange={(e) => handleChange('aboutSection', 'missionTitle', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
        </div>
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission Text</label>
            <textarea rows={2} value={settings.aboutSection?.missionText || ''} onChange={(e) => handleChange('aboutSection', 'missionText', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'aboutSection', 'imageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"/>
          {settings.aboutSection?.imageUrl && <img src={settings.aboutSection.imageUrl} alt="About Section Preview" className="mt-2 rounded-lg max-h-40"/>}
        </div>
      </div>

    </div>
  );
};

export default SiteEditorPage;
