import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2 } from 'lucide-react'; // Import icons

// NOTE: In a real app, you would define this interface in a shared types folder.
interface SiteSettings {
  theme: { primaryColor: string; secondaryColor: string; };
  logos: { navbarLogoUrl: string; faviconUrl: string; };
  heroSection: { title: string; subtitle: string; ctaText: string; backgroundImageUrl: string };
  featuresSection: { title: string; subtitle: string; card1Title: string; card1Text: string; card2Title: string; card2Text: string; card3Title: string; card3Text: string; };
  // MODIFIED aboutSection to include new fields
  aboutSection: { title: string; subtitle: string; missionTitle: string; missionText: string; visionTitle: string; visionText: string; imageUrl: string; teamTitle: string; teamSubtitle: string; executives: { name: string; title: string; imageUrl: string }[] };
  // MODIFIED contactSection to include new fields
  contactSection: { title: string; subtitle: string; formTitle: string; addresses: { locationName: string; fullAddress: string }[] };
  ctaSection: { title: string; subtitle: string; buttonText: string; backgroundImageUrl: string; };
}

const SiteEditorPage = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/site-settings');
        // Ensure arrays are not undefined
        const fetchedSettings = response.data.data || {};
        if (!fetchedSettings.aboutSection.executives) fetchedSettings.aboutSection.executives = [];
        if (!fetchedSettings.contactSection.addresses) fetchedSettings.contactSection.addresses = [];
        setSettings(fetchedSettings);
      } catch (err) {
        setMessage('Error: Failed to fetch site settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

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


  const handleChange = (section: keyof SiteSettings, field: string, value: string) => {
      // ... (existing handleChange function)
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: keyof SiteSettings, field: string, index?: number, arrayName?: string) => {
      // ... (existing handleFileUpload logic needs slight modification to handle arrays)
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      try {
          setMessage('Uploading image...');
          const response = await apiClient.post('/super-admin/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
          if (arrayName !== undefined && index !== undefined) {
              handleArrayChange(section, arrayName, index, field, response.data.imageUrl);
          } else {
              handleChange(section, field, response.data.imageUrl);
          }
          setMessage('Image uploaded successfully!');
      } catch (err) {
          setMessage('Error: Image upload failed.');
      }
  };

  const handleSave = async () => {
      // ... (existing handleSave function)
  };

  if (loading) return <div>Loading Site Editor...</div>;

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Landing Page Site Editor</h1>
            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Save All Changes</button>
        </div>
        {message && <div className="p-3 text-center bg-gray-100 rounded-md sticky top-20 z-10">{message}</div>}

        {/* ... (Keep existing sections: Theme, Hero, Features) ... */}

        {/* --- MODIFIED About Section Editor --- */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">About Section & Leadership</h2>
            {/* ... inputs for title, mission, vision, etc. */}
            <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Leadership Team</h3>
            <div className="space-y-4">
            {settings.aboutSection?.executives?.map((exec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <input type="text" placeholder="Name" value={exec.name} onChange={e => handleArrayChange('aboutSection', 'executives', index, 'name', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    <input type="text" placeholder="Title" value={exec.title} onChange={e => handleArrayChange('aboutSection', 'executives', index, 'title', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    <div className="flex items-center gap-2">
                         <input type="file" onChange={e => handleFileUpload(e, 'aboutSection', 'imageUrl', index, 'executives')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"/>
                         <button onClick={() => removeArrayItem('aboutSection', 'executives', index)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                    </div>
                </div>
            ))}
            </div>
            <button onClick={() => addArrayItem('aboutSection', 'executives', { name: '', title: '', imageUrl: '' })} className="flex items-center gap-2 text-indigo-600 font-semibold"><PlusCircle size={18}/> Add Executive</button>
        </div>

        {/* --- MODIFIED Contact Section Editor --- */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Contact Section & Addresses</h2>
             {/* ... inputs for title, subtitle, formTitle, etc. */}
            <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Corporate Addresses</h3>
            <div className="space-y-4">
            {settings.contactSection?.addresses?.map((addr, index) => (
                 <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <input type="text" placeholder="Location Name (e.g., Headquarters)" value={addr.locationName} onChange={e => handleArrayChange('contactSection', 'addresses', index, 'locationName', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    <input type="text" placeholder="Full Address" value={addr.fullAddress} onChange={e => handleArrayChange('contactSection', 'addresses', index, 'fullAddress', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg md:col-span-2"/>
                    <button onClick={() => removeArrayItem('contactSection', 'addresses', index)} className="text-red-500 hover:text-red-700 ml-auto"><Trash2 size={18}/></button>
                </div>
            ))}
            </div>
            <button onClick={() => addArrayItem('contactSection', 'addresses', { locationName: '', fullAddress: '' })} className="flex items-center gap-2 text-indigo-600 font-semibold"><PlusCircle size={18}/> Add Address</button>
        </div>

    </div>
  );
};

export default SiteEditorPage;
