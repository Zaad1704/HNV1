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
    mutationFn: (file: File) => { // Takes a File object
      const formData = new FormData();
      formData.append('image', file); // 'image' must match multer field name in backend
      return apiClient.post('/upload/image', formData);
    },
    onSuccess: (data) => {
      // This success is handled by handleFileUploadChange which uses the returned URL
      // setMessage('Image uploaded successfully!'); // Can show a transient success message here
    },
    onError: (err: any) => {
      setMessage(`Error uploading image: ${err.response?.data?.message || err.message}`);
    }
  });

  useEffect(() => {
    apiClient.get('/site-settings')
      .then(res => setSettings(res.data.data || {}))
      .catch(() => setMessage('Error: Failed to fetch settings.'))
      .finally(() => setLoading(false));
  }, []);

  // Generic handler for text input changes in nested settings objects or arrays
  const handleChange = (section, field, value, index = -1, subField = '') => {
      setSettings(prev => {
          const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy to ensure immutability
          if (index > -1) { // Handling arrays (e.g., features, executives, addresses, links)
              if (!newSettings[section]) newSettings[section] = {};
              if (!newSettings[section][field]) newSettings[section][field] = [];
              if (!newSettings[section][field][index]) newSettings[section][field][index] = {};
              newSettings[section][field][index][subField] = value;
          } else { // Handling direct fields within a section
              if (!newSettings[section]) newSettings[section] = {};
              newSettings[section][field] = value;
          }
          return newSettings;
      });
  };

  // Helper to add a new item to an array field (e.g., a new feature, executive)
  const handleAddItem = (section, field, defaultItem = {}) => {
      setSettings(prev => {
          const newSettings = JSON.parse(JSON.stringify(prev));
          if (!newSettings[section]) newSettings[section] = {};
          if (!newSettings[section][field]) newSettings[section][field] = [];
          newSettings[section][field].push(defaultItem);
          return newSettings;
      });
  };

  // Helper to remove an item from an array field
  const handleRemoveItem = (section, field, index) => {
      setSettings(prev => ({
          ...prev,
          [section]: { ...prev[section], [field]: (prev[section]?.[field] || []).filter((_, i) => i !== index) }
      }));
  };
  
  // Handles saving all changes to the backend
  const handleSave = async () => {
      setMessage('Saving...');
      try {
          await apiClient.put('/site-settings', settings);
          setMessage('Settings saved successfully!');
      } catch (err) {
          setMessage(`Error: Failed to save settings. ${err.response?.data?.message || ''}`);
      } finally {
          setTimeout(() => setMessage(''), 3000);
      }
  };

  // Generic file upload handler for image fields in settings sections
  const handleFileUploadChange = async (event: React.ChangeEvent<HTMLInputElement>, section: string, field: string, index: number = -1, subField: string = '') => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    try {
      const response = await uploadFileMutation.mutateAsync(file); // Await the mutation result
      const imageUrl = response.data.imageUrl; // Get the URL from the backend response
      
      // Update the settings state with the new image URL using the generic handleChange
      handleChange(section, field, imageUrl, index, subField);
      setMessage('Image uploaded and URL applied to field!');
    } catch (err) {
      // Error handled by mutation's onError
    }
  };

  // Reusable input components for text and textarea
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
  
  // Reusable component for image URL input + file upload
  const ImageUploader = ({ label, section, field, index = -1, subField = '' }) => {
    const currentImageUrl = index > -1 
        ? (settings[section]?.[field]?.[index]?.[subField] || '') 
        : (settings[section]?.[field] || '');

    return (
      <div>
        <label className="block text-sm font-medium text-light-text mb-1">{label}</label>
        <input 
          type="text" 
          value={currentImageUrl} 
          onChange={e => handleChange(section, field, e.target.value, index, subField)} 
          placeholder="Enter image URL or upload below" 
          className="w-full px-3 py-2 bg-brand-bg border border-border-color rounded-lg mb-2"
        />
        {currentImageUrl && <img src={currentImageUrl} alt="Preview" className="h-20 w-auto object-contain mb-2 border border-border-color rounded"/>}
        <input 
          type="file" 
          onChange={e => handleFileUploadChange(e, section, field, index, subField)} 
          className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200"
        />
      </div>
    );
  };


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
            <ImageUploader label="Navbar Logo URL" section="logos" field="navbarLogoUrl" />
            <ImageUploader label="Footer Logo URL" section="logos" field="footerLogoUrl" />
            <ImageUploader label="Favicon URL" section="logos" field="faviconUrl" />
        </AccordionSection>

        {/* NEW SECTION: Hero Section */}
        <AccordionSection title="Hero Section">
            <Input label="Title" section="heroSection" field="title" />
            <TextArea label="Subtitle" section="heroSection" field="subtitle" />
            <Input label="Call to Action Text" section="heroSection" field="ctaText" />
            <ImageUploader label="Background Image URL" section="heroSection" field="backgroundImageUrl" />
        </AccordionSection>

        {/* NEW SECTION: Features Page */}
        <AccordionSection title="Features Page">
            <Input label="Title" section="featuresPage" field="title" />
            <TextArea label="Subtitle" section="featuresPage" field="subtitle" />
            <ImageUploader label="Background Image URL" section="featuresPage" field="backgroundImageUrl" />
            <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Features List</h3>
                 {(settings.featuresPage?.features || []).map((feature, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md mb-2">
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Feature Icon Name (e.g., 'home', 'briefcase')</label>
                            <input value={feature.icon || ''} onChange={e => handleChange('featuresPage', 'features', e.target.value, index, 'icon')} placeholder="Icon Name" className="w-full bg-brand-bg border rounded p-2" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Feature Title</label>
                            <input value={feature.title || ''} onChange={e => handleChange('featuresPage', 'features', e.target.value, index, 'title')} placeholder="Title" className="w-full bg-brand-bg border rounded p-2" />
                         </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-light-text mb-1">Feature Text</label>
                            <textarea rows={2} value={feature.text || ''} onChange={e => handleChange('featuresPage', 'features', e.target.value, index, 'text')} placeholder="Description" className="w-full bg-brand-bg border rounded p-2"></textarea>
                         </div>
                         <button onClick={() => handleRemoveItem('featuresPage', 'features', index)} className="text-red-500 hover:text-red-700 p-2 md:col-span-2 flex justify-center items-center"><Trash2 size={18} /> Remove Feature</button>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('featuresPage', 'features', {icon: '', title: '', text: ''})} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Feature</button>
            </div>
        </AccordionSection>

        <AccordionSection title="About Page Section">
            <Input label="Title" section="aboutPage" field="title" />
            <TextArea label="Subtitle" section="aboutPage" field="subtitle" />
            <ImageUploader label="About Page Image URL" section="aboutPage" field="imageUrl" /> {/* For "Our Team Working" image */}
            <ImageUploader label="Background Image URL" section="aboutPage" field="backgroundImageUrl" />
            <Input label="Mission Title" section="aboutPage" field="missionTitle" />
            <TextArea label="Mission Statement" section="aboutPage" field="missionStatement" />
            <Input label="Vision Title" section="aboutPage" field="visionTitle" />
            <TextArea label="Vision Statement" section="aboutPage" field="visionStatement" />

            <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Executive Team</h3>
                 <Input label="Team Title" section="aboutPage" field="teamTitle" />
                 <TextArea label="Team Subtitle" section="aboutPage" field="teamSubtitle" />
                 {(settings.aboutPage?.executives || []).map((exec, index) => (
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
                            <ImageUploader label="Image URL" section="aboutPage" field="executives" index={index} subField="imageUrl" />
                         </div>
                         <button onClick={() => handleRemoveItem('aboutPage', 'executives', index)} className="text-red-500 hover:text-red-700 p-2 md:col-span-2 flex justify-center items-center"><Trash2 size={18} /> Remove Executive</button>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('aboutPage', 'executives', {name: '', title: '', imageUrl: ''})} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Executive</button>
            </div>
        </AccordionSection>

        {/* NEW SECTION: Pricing Section */}
        <AccordionSection title="Pricing Section">
            <Input label="Title" section="pricingSection" field="title" />
            <TextArea label="Subtitle" section="pricingSection" field="subtitle" />
            <ImageUploader label="Background Image URL" section="pricingSection" field="backgroundImageUrl" />
            <TextArea label="Disclaimer Text" section="pricingSection" field="disclaimer" />
        </AccordionSection>

        {/* NEW SECTION: Install App Section */}
        <AccordionSection title="Install App Section">
            <Input label="Title" section="installAppSection" field="title" />
            <TextArea label="Subtitle" section="installAppSection" field="subtitle" />
            <ImageUploader label="Background Image URL" section="installAppSection" field="backgroundImageUrl" />
        </AccordionSection>

        <AccordionSection title="Contact Page Section">
            <Input label="Title" section="contactPage" field="title" />
            <TextArea label="Subtitle" section="contactPage" field="subtitle" />
            <Input label="Form Title" section="contactPage" field="formTitle" />
            <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Corporate Addresses</h3>
                 {(settings.contactPage?.addresses || []).map((addr, index) => (
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
                 {(settings.footer?.quickLinks || []).map((link, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-2 rounded-md mb-2">
                         <input value={link.text || ''} onChange={e => handleChange('footer', 'quickLinks', e.target.value, index, 'text')} placeholder="Link Text" className="bg-brand-bg border rounded p-2" />
                         <input value={link.url || ''} onChange={e => handleChange('footer', 'quickLinks', e.target.value, index, 'url')} placeholder="URL (e.g., /about)" className="md:col-span-2 bg-brand-bg border rounded p-2" />
                         <button onClick={() => handleRemoveItem('footer', 'quickLinks', index)} className="text-red-500 hover:text-red-700 p-2 md:col-start-3"><Trash2 size={18} /></button>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('footer', 'quickLinks', { text: '', url: '' })} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Quick Link</button>
            </div>
             <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Legal Links</h3>
                 {(settings.footer?.legalLinks || []).map((link, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-2 rounded-md mb-2">
                         <input value={link.text || ''} onChange={e => handleChange('footer', 'legalLinks', e.target.value, index, 'text')} placeholder="Link Text" className="bg-brand-bg border rounded p-2" />
                         <input value={link.url || ''} onChange={e => handleChange('footer', 'legalLinks', e.target.value, index, 'url')} placeholder="URL (e.g., /privacy)" className="md:col-span-2 bg-brand-bg border rounded p-2" />
                         <button onClick={() => handleRemoveItem('footer', 'legalLinks', index)} className="text-red-500 hover:text-red-700 p-2 md:col-start-3"><Trash2 size={18} /></button>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('footer', 'legalLinks', { text: '', url: '' })} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Legal Link</button>
            </div>
            <div className="border-t pt-4 mt-4">
                 <h3 className="font-bold mb-2">Social Links</h3>
                 {(settings.footer?.socialLinks || []).map((link, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-2 rounded-md mb-2">
                         <input value={link.text || ''} onChange={e => handleChange('footer', 'socialLinks', e.target.value, index, 'text')} placeholder="Link Text (e.g., Facebook)" className="bg-brand-bg border rounded p-2" />
                         <input value={link.url || ''} onChange={e => handleChange('footer', 'socialLinks', e.target.value, index, 'url')} placeholder="URL" className="md:col-span-2 bg-brand-bg border rounded p-2" />
                         <button onClick={() => handleRemoveItem('footer', 'socialLinks', index)} className="text-red-500 hover:text-red-700 p-2 md:col-start-3"><Trash2 size={18} /></button>
                     </div>
                 ))}
                 <button onClick={() => handleAddItem('footer', 'socialLinks', { text: '', url: '' })} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Social Link</button>
            </div>
        </AccordionSection>

    </div>
  );
};

export default SiteEditorPage;
