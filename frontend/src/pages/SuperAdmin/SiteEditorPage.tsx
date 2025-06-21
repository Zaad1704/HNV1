import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ISiteSettings } from '../../../../backend/models/SiteSettings'; // Assuming shared type

const AccordionSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-light-card rounded-xl shadow-sm border border-border-color">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-6 text-left">
                <h2 className="text-xl font-bold text-dark-text">{title}</h2>
                {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            {isOpen && <div className="p-6 border-t border-border-color space-y-6">{children}</div>}
        </div>
    );
};

const SiteEditorPage = () => {
  const [settings, setSettings] = useState<Partial<ISiteSettings>>({} as ISiteSettings);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiClient.get('/site-settings')
      .then(res => setSettings(res.data.data || {}))
      .catch(() => setMessage('Error: Failed to fetch settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (section, field, value, index = -1, subField = '') => {
      setSettings(prev => {
          const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy
          if (index > -1) {
              if (!newSettings[section]) newSettings[section] = {};
              if (!newSettings[section][field]) newSettings[section][field] = [];
              if (!newSettings[section][field][index]) newSettings[section][field][index] = {};
              newSettings[section][field][index][subField] = value;
          } else {
              if (!newSettings[section]) newSettings[section] = {};
              newSettings[section][field] = value;
          }
          return newSettings;
      });
  };

  const handleAddItem = (section, field, defaultItem = {}) => {
      setSettings(prev => {
          const newSettings = JSON.parse(JSON.stringify(prev));
          if (!newSettings[section]) newSettings[section] = {};
          if (!newSettings[section][field]) newSettings[section][field] = [];
          newSettings[section][field].push(defaultItem);
          return newSettings;
      });
  };

  const handleRemoveItem = (section, field, index) => {
      setSettings(prev => ({
          ...prev,
          [section]: { ...prev[section], [field]: prev[section][field].filter((_, i) => i !== index) }
      }));
  };
  
  const handleSave = async () => {
      setMessage('Saving...');
      try {
          await apiClient.put('/site-settings', settings);
          setMessage('Settings saved successfully!');
      } catch (err) {
          setMessage('Error: Failed to save settings.');
      } finally {
          setTimeout(() => setMessage(''), 3000);
      }
  };

  const Input = ({ label, section, field }) => (
    <div>
        <label className="block text-sm font-medium text-light-text mb-1">{label}</label>
        <input type="text" value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-brand-bg border border-border-color rounded-lg"/>
    </div>
  );

  const TextArea = ({ label, section, field }) => (
    <div>
        <label className="block text-sm font-medium text-light-text mb-1">{label}</label>
        <textarea rows={3} value={settings[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} className="w-full px-3 py-2 bg-brand-bg border border-border-color rounded-lg"/>
    </div>
  );
  
  if (loading) return <div>Loading Site Editor...</div>;

  return (
    <div className="space-y-6 text-dark-text">
        <div className="flex justify-between items-center bg-light-card p-4 rounded-xl shadow-md sticky top-4 z-20 border border-border-color">
            <h1 className="text-2xl font-bold">Site Content Editor</h1>
            <button onClick={handleSave} className="px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark">
                Save All Changes
            </button>
        </div>
        {message && <div className={`p-3 text-center rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

        <AccordionSection title="About Page Section">
            <Input label="Title" section="aboutPage" field="title" />
            <TextArea label="Subtitle" section="aboutPage" field="subtitle" />
            <Input label="Mission Title" section="aboutPage" field="missionTitle" />
            <TextArea label="Mission Statement" section="aboutPage" field="missionStatement" />
            <Input label="Vision Title" section="aboutPage" field="visionTitle" />
            <TextArea label="Vision Statement" section="aboutPage" field="visionStatement" />
        </AccordionSection>

        <AccordionSection title="Contact Page Section">
            <Input label="Title" section="contactPage" field="title" />
            <TextArea label="Subtitle" section="contactPage" field="subtitle" />
            <Input label="Form Title" section="contactPage" field="formTitle" />
            <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Corporate Addresses</h3>
                 {settings.contactPage?.addresses?.map((addr, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md mb-2">
                         <input value={addr.locationName || ''} onChange={e => handleChange('contactPage', 'addresses', e.target.value, index, 'locationName')} placeholder="Location Name (e.g., HQ)" className="bg-brand-bg border rounded p-2" />
                         <input value={addr.fullAddress || ''} onChange={e => handleChange('contactPage', 'addresses', e.target.value, index, 'fullAddress')} placeholder="Full Address" className="bg-brand-bg border rounded p-2" />
                         <input value={addr.phone || ''} onChange={e => handleChange('contactPage', 'addresses', e.target.value, index, 'phone')} placeholder="Phone Number" className="bg-brand-bg border rounded p-2" />
                         <div className="flex items-center gap-2">
                           <input value={addr.email || ''} onChange={e => handleChange('contactPage', 'addresses', e.target.value, index, 'email')} placeholder="Email Address" className="w-full bg-brand-bg border rounded p-2" />
                           <button onClick={() => handleRemoveItem('contactPage', 'addresses', index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                         </div>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('contactPage', 'addresses', {locationName: '', fullAddress: '', phone: '', email: ''})} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Address</button>
            </div>
        </AccordionSection>

        <AccordionSection title="Footer">
            <TextArea label="Footer Description" section="footer" field="description" />
            <Input label="Copyright Text" section="footer" field="copyrightText" />
            
             <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Quick Links</h3>
                 {settings.footer?.quickLinks?.map((link, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-2 rounded-md mb-2">
                         <input value={link.text || ''} onChange={e => handleChange('footer', 'quickLinks', e.target.value, index, 'text')} placeholder="Link Text" className="bg-brand-bg border rounded p-2" />
                         <input value={link.url || ''} onChange={e => handleChange('footer', 'quickLinks', e.target.value, index, 'url')} placeholder="URL (e.g., /about)" className="md:col-span-2 bg-brand-bg border rounded p-2" />
                         <button onClick={() => handleRemoveItem('footer', 'quickLinks', index)} className="text-red-500 hover:text-red-700 p-2 md:col-start-3"><Trash2 size={18} /></button>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('footer', 'quickLinks', { text: '', url: '' })} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Quick Link</button>
            </div>
        </AccordionSection>

    </div>
  );
};

export default SiteEditorPage;
