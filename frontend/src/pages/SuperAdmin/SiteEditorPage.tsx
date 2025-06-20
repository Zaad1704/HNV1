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

  const handleChange = (section, field, value, index = -1, subField = '') => {
      setSettings(prev => {
          const newSettings = { ...prev };
          if (index > -1) { // Handle arrays
              newSettings[section][field][index][subField] = value;
          } else {
            newSettings[section] = { ...(newSettings[section] || {}), [field]: value };
          }
          return newSettings;
      });
  };

  const handleFileUpload = async (e, section, field, index = -1, subField = '') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
        setMessage('Uploading image...');
        const response = await apiClient.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (index > -1) {
            handleChange(section, field, response.data.imageUrl, index, subField);
        } else {
            handleChange(section, field, response.data.imageUrl);
        }
        setMessage('Image uploaded successfully!');
    } catch (err) {
        setMessage('Error: Image upload failed.');
    }
  };

  const handleAddItem = (section, field) => {
    setSettings(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: [...(prev[section]?.[field] || []), {}]
        }
    }));
  };

  const handleRemoveItem = (section, field, index) => {
    setSettings(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: prev[section][field].filter((_, i) => i !== index)
        }
    }));
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

        <AccordionSection title="Logos & Company Name">
            <Input label="Company Name" section="logos" field="companyName"/>
            <ImageInput label="Navbar Logo URL" section="logos" field="navbarLogoUrl"/>
            <ImageInput label="Footer Logo URL" section="logos" field="footerLogoUrl"/>
            <ImageInput label="Favicon URL" section="logos" field="faviconUrl"/>
        </AccordionSection>

        <AccordionSection title="Hero Section">
            <Input label="Title" section="heroSection" field="title"/>
            <TextArea label="Subtitle" section="heroSection" field="subtitle"/>
            <Input label="Button Text (CTA)" section="heroSection" field="ctaText"/>
            <ImageInput label="Background Image URL" section="heroSection" field="backgroundImageUrl"/>
        </AccordionSection>

        <AccordionSection title="About Page Section">
            <Input label="Title" section="aboutPage" field="title" />
            <TextArea label="Subtitle" section="aboutPage" field="subtitle" />
            <Input label="Mission Title" section="aboutPage" field="missionTitle" />
            <TextArea label="Mission Statement" section="aboutPage" field="missionStatement" />
            <Input label="Vision Title" section="aboutPage" field="visionTitle" />
            <TextArea label="Vision Statement" section="aboutPage" field="visionStatement" />
            <Input label="Team Section Title" section="aboutPage" field="teamTitle" />
            <TextArea label="Team Section Subtitle" section="aboutPage" field="teamSubtitle" />
            <ImageInput label="Content Image URL" section="aboutPage" field="imageUrl" />
            <ImageInput label="Background Image URL" section="aboutPage" field="backgroundImageUrl" />
             {/* Executives */}
             <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Executive Team</h3>
                 {settings.aboutPage?.executives?.map((exec, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 border p-2 rounded-md mb-2">
                         <input value={exec.name || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'name')} placeholder="Name" className="bg-gray-50 border rounded p-2" />
                         <input value={exec.title || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'title')} placeholder="Title" className="bg-gray-50 border rounded p-2" />
                         <div className="md:col-span-2 flex items-center gap-2">
                             <input value={exec.imageUrl || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'imageUrl')} placeholder="Image URL" className="w-full bg-gray-50 border rounded p-2" />
                             <button onClick={() => handleRemoveItem('aboutPage', 'executives', index)} className="text-red-500"><Trash2 size={18} /></button>
                         </div>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('aboutPage', 'executives')} className="text-sm flex items-center gap-1 text-blue-600 font-semibold"><PlusCircle size={16}/> Add Executive</button>
            </div>
        </AccordionSection>
    </div>
  );
};

export default SiteEditorPage;
