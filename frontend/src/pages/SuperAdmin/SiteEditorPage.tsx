// frontend/src/pages/SuperAdmin/SiteEditorPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2 } from 'lucide-react';

// This interface should match the backend model
interface ISiteSettings { /* ... */ }

const SiteEditorPage = () => {
  const [settings, setSettings] = useState<Partial<ISiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { /* ... fetchSettings logic remains the same ... */ }, []);

  const handleChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({ ...prev, [section]: { ...(prev[section] as object), [field]: value } }));
  };

  const handleArrayChange = (section: string, arrayName: string, index: number, field: string, value: string) => {
    setSettings(prev => {
      const newSection = { ...(prev[section] as object) };
      // @ts-ignore
      newSection[arrayName][index][field] = value;
      return { ...prev, [section]: newSection };
    });
  };

  const addArrayItem = (section: string, arrayName: string, newItem: object) => { /* ... */ };
  const removeArrayItem = (section: string, arrayName: string, index: number) => { /* ... */ };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setMessage('Uploading image...');
      const response = await apiClient.post('/upload/image', formData);
      handleChange(section, field, response.data.imageUrl);
      setMessage('Image uploaded successfully!');
    } catch (err) { setMessage('Error: Image upload failed.'); }
  };

  const handleSave = async () => { /* ... */ };
  
  const Input = ({ label, section, field }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input type="text" value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
    </div>
  );

  const ImageInput = ({ label, section, field }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <div className="flex items-center gap-4">
            <input type="text" value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
            <input type="file" id={`${section}-${field}`} onChange={e => handleFileUpload(e, section, field)} className="hidden"/>
            <label htmlFor={`${section}-${field}`} className="cursor-pointer bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg">Upload</label>
        </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 text-gray-800">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md sticky top-4 z-20">
            <h1 className="text-3xl font-bold">Site Content Editor</h1>
            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg">Save All Changes</button>
        </div>
        
        {/* About Page Section */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">About Page</h2>
            <Input label="Page Title" section="aboutPage" field="title"/>
            <Input label="Page Subtitle" section="aboutPage" field="subtitle"/>
            <ImageInput label="Background Image URL" section="aboutPage" field="backgroundImageUrl"/>
            <h3 className="text-lg font-semibold pt-2">Page Content</h3>
            <Input label="Mission Title" section="aboutPage" field="missionTitle"/>
            <textarea value={settings.aboutPage?.missionStatement || ''} onChange={e => handleChange('aboutPage', 'missionStatement', e.target.value)} className="w-full h-24 px-3 py-2 bg-gray-50 border rounded-lg"/>
            <Input label="Vision Title" section="aboutPage" field="visionTitle"/>
            <textarea value={settings.aboutPage?.visionStatement || ''} onChange={e => handleChange('aboutPage', 'visionStatement', e.target.value)} className="w-full h-24 px-3 py-2 bg-gray-50 border rounded-lg"/>
            <ImageInput label="Content Image URL" section="aboutPage" field="imageUrl"/>
        </div>
        
        {/* Add similar collapsible sections for Hero, Features, Pricing, Contact, and Footer */}
    </div>
  );
};

export default SiteEditorPage;
