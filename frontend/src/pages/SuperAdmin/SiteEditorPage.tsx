// frontend/src/pages/SuperAdmin/SiteEditorPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ISiteSettings } from '../../../../backend/models/SiteSettings'; 

const AccordionSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white rounded-xl shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left"
            >
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            {isOpen && (
                <div className="p-6 border-t border-gray-200 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
};


const SiteEditorPage = () => {
  const [settings, setSettings] = useState<Partial<ISiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/site-settings');
        setSettings(response.data.data || {});
      } catch (err) {
        setMessage('Error: Failed to fetch site settings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const handleFileUpload = async (e, section, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
        setMessage('Uploading image...');
        const response = await apiClient.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        handleChange(section, field, response.data.imageUrl);
        setMessage('Image uploaded successfully!');
    } catch (err) {
        setMessage('Error: Image upload failed.');
    }
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

  const Input = ({ label, section, field }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input type="text" value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
    </div>
  );

  const TextArea = ({ label, section, field }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea rows={3} value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
    </div>
  );

  const ImageInput = ({ label, section, field }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <div className="flex items-center gap-4">
            <input type="text" value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
            <label htmlFor={`${section}-${field}-file`} className="cursor-pointer bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg whitespace-nowrap">Upload</label>
            <input type="file" id={`${section}-${field}-file`} onChange={e => handleFileUpload(e, section, field)} className="hidden"/>
        </div>
    </div>
  );

  if (loading) return <div>Loading Site Editor...</div>;
  if (message.startsWith('Error')) return <div className="text-red-500 p-4">{message}</div>;

  return (
    <div className="space-y-6 text-gray-800">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md sticky top-4 z-20">
            <h1 className="text-2xl font-bold">Site Content Editor</h1>
            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                Save All Changes
            </button>
        </div>
        {message && <div className="p-3 text-center bg-green-100 text-green-800 rounded-md">{message}</div>}

        <AccordionSection title="Hero Section">
            <Input label="Title" section="heroSection" field="title"/>
            <TextArea label="Subtitle" section="heroSection" field="subtitle"/>
            <Input label="Button Text (CTA)" section="heroSection" field="ctaText"/>
            <ImageInput label="Background Image URL" section="heroSection" field="backgroundImageUrl"/>
        </AccordionSection>

        <AccordionSection title="Features Section">
            <Input label="Page Title" section="featuresPage" field="title" />
            <TextArea label="Page Subtitle" section="featuresPage" field="subtitle" />
            <ImageInput label="Background Image URL" section="featuresPage" field="backgroundImageUrl" />
        </AccordionSection>
    </div>
  );
};

export default SiteEditorPage;
