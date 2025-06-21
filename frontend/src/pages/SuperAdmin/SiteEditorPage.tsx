// frontend/src/pages/SuperAdmin/SiteEditorPage.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ISiteSettings } from '../../../../backend/models/SiteSettings'; // Assuming shared type
import { useMutation } from '@tanstack/react-query'; // Import useMutation

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

  // Mutation for file uploads
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiClient.post('/upload/image', formData);
    },
    onSuccess: (data) => {
      // Data contains { imageUrl: '/uploads/filename.jpg' }
      setMessage('Image uploaded successfully!');
      // This is a generic success. The specific field update happens in handleFileUploadChange
    },
    onError: (err) => {
      setMessage(`Error uploading image: ${err.response?.data?.message || err.message}`);
    }
  });

  useEffect(() => {
    apiClient.get('/site-settings')
      .then(res => setSettings(res.data.data || {}))
      .catch(() => setMessage('Error: Failed to fetch settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (section, field, value, index = -1, subField = '') => {
      setSettings(prev => {
          const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy
          if (index > -1) { // Handling arrays like executives or addresses
              if (!newSettings[section]) newSettings[section] = {};
              if (!newSettings[section][field]) newSettings[section][field] = [];
              if (!newSettings[section][field][index]) newSettings[section][field][index] = {};
              newSettings[section][field][index][subField] = value;
          } else { // Handling direct fields
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

  // Generic file upload handler for image fields in settings
  const handleFileUploadChange = async (event: React.ChangeEvent<HTMLInputElement>, section: string, field: string, index: number = -1, subField: string = '') => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    try {
      const response = await uploadFileMutation.mutateAsync(file); // Use mutateAsync to await the result
      const imageUrl = response.data.imageUrl; // Get the URL from the backend response
      
      // Update the settings state with the new image URL
      handleChange(section, field, imageUrl, index, subField);
      setMessage('Image uploaded and URL applied!');
    } catch (err) {
      // Error handled by mutation's onError
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

        <AccordionSection title="Logos & Branding">
            <Input label="Company Name" section="logos" field="companyName" />
            <div>
                <label className="block text-sm font-medium text-light-text mb-1">Navbar Logo URL</label>
                <input type="text" value={settings.logos?.navbarLogoUrl || ''} onChange={e => handleChange('logos', 'navbarLogoUrl', e.target.value)} className="w-full px-3 py-2 bg-brand-bg border border-border-color rounded-lg mb-2"/>
                {settings.logos?.navbarLogoUrl && <img src={settings.logos.navbarLogoUrl} alt="Navbar Logo Preview" className="h-16 w-auto object-contain mb-2"/>}
                <input type="file" onChange={e => handleFileUploadChange(e, 'logos', 'navbarLogoUrl')} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-light-text mb-1">Footer Logo URL</label>
                <input type="text" value={settings.logos?.footerLogoUrl || ''} onChange={e => handleChange('logos', 'footerLogoUrl', e.target.value)} className="w-full px-3 py-2 bg-brand-bg border border-border-color rounded-lg mb-2"/>
                {settings.logos?.footerLogoUrl && <img src={settings.logos.footerLogoUrl} alt="Footer Logo Preview" className="h-16 w-auto object-contain mb-2"/>}
                <input type="file" onChange={e => handleFileUploadChange(e, 'logos', 'footerLogoUrl')} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-light-text mb-1">Favicon URL</label>
                <input type="text" value={settings.logos?.faviconUrl || ''} onChange={e => handleChange('logos', 'faviconUrl', e.target.value)} className="w-full px-3 py-2 bg-brand-bg border border-border-color rounded-lg mb-2"/>
                {settings.logos?.faviconUrl && <img src={settings.logos.faviconUrl} alt="Favicon Preview" className="h-8 w-auto object-contain mb-2"/>}
                <input type="file" onChange={e => handleFileUploadChange(e, 'logos', 'faviconUrl')} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
            </div>
        </AccordionSection>

        <AccordionSection title="About Page Section">
            <Input label="Title" section="aboutPage" field="title" />
            <TextArea label="Subtitle" section="aboutPage" field="subtitle" />
            <Input label="Mission Title" section="aboutPage" field="missionTitle" />
            <TextArea label="Mission Statement" section="aboutPage" field="missionStatement" />
            <Input label="Vision Title" section="aboutPage" field="visionTitle" />
            <TextArea label="Vision Statement" section="aboutPage" field="visionStatement" />

            <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Executive Team</h3>
                 {settings.aboutPage?.executives?.map((exec, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md mb-2">
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Name</label>
                            <input value={exec.name || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'name')} placeholder="Executive Name" className="w-full bg-brand-bg border rounded p-2" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Title</label>
                            <input value={exec.title || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'title')} placeholder="Position Title" className="w-full bg-brand-bg border rounded p-2" />
                         </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-light-text mb-1">Image URL</label>
                            <input value={exec.imageUrl || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'imageUrl')} placeholder="Image URL" className="w-full bg-brand-bg border rounded p-2 mb-2" />
                            {exec.imageUrl && <img src={exec.imageUrl} alt="Executive Preview" className="h-20 w-auto object-cover mb-2"/>}
                            <input type="file" onChange={e => handleFileUploadChange(e, 'aboutPage', 'executives', index, 'imageUrl')} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"/>
                         </div>
                         <button onClick={() => handleRemoveItem('aboutPage', 'executives', index)} className="text-red-500 hover:text-red-700 p-2 md:col-span-2 flex justify-center items-center"><Trash2 size={18} /> Remove Executive</button>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('aboutPage', 'executives', {name: '', title: '', imageUrl: ''})} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Executive</button>
            </div>
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
