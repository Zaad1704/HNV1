import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ISiteSettings } from '../../../../backend/models/SiteSettings';
import { useMutation } from '@tanstack/react-query';

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

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append('image', file);
            return apiClient.post('/upload/image', formData);
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

    const handleChange = (section, field, value, index = -1, subField = '') => {
        setSettings(prev => {
            const newSettings = JSON.parse(JSON.stringify(prev));
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
            [section]: { ...prev[section], [field]: (prev[section]?.[field] || []).filter((_, i) => i !== index) }
        }));
    };
  
    const handleSave = async () => {
        setMessage('Saving...');
        try {
            await apiClient.put('/site-settings', settings);
            setMessage('Settings saved successfully!');
        } catch (err: any) {
            setMessage(`Error: Failed to save settings. ${err.response?.data?.message || ''}`);
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleFileUploadChange = async (event: React.ChangeEvent<HTMLInputElement>, section: string, field: string, index: number = -1, subField: string = '') => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        try {
            const response = await uploadFileMutation.mutateAsync(file);
            const imageUrl = response.data.imageUrl;
            handleChange(section, field, imageUrl, index, subField);
            setMessage('Image uploaded and URL applied!');
        } catch (err) {
            // Error is handled by the mutation's onError callback
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
  
    const ImageUploader = ({ label, section, field, index = -1, subField = '' }) => {
        const currentImageUrl = index > -1 
            ? (settings[section]?.[field]?.[index]?.[subField] || '') 
            : (settings[section]?.[field] || '');
        return (
            <div>
                <label className="block text-sm font-medium text-light-text mb-1">{label}</label>
                <input type="text" value={currentImageUrl} onChange={e => handleChange(section, field, e.target.value, index, subField)} placeholder="Enter image URL or upload below" className="w-full px-3 py-2 bg-brand-bg border border-border-color rounded-lg mb-2" />
                {currentImageUrl && <img src={currentImageUrl} alt="Preview" className="h-20 w-auto object-contain mb-2 border border-border-color rounded"/>}
                <input type="file" onChange={e => handleFileUploadChange(e, section, field, index, subField)} className="w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-light-text hover:file:bg-gray-200" />
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

            <AccordionSection title="Hero Section">
                <Input label="Title" section="heroSection" field="title" />
                <TextArea label="Subtitle" section="heroSection" field="subtitle" />
                <Input label="Call to Action Text" section="heroSection" field="ctaText" />
                <ImageUploader label="Background Image URL" section="heroSection" field="backgroundImageUrl" />
            </AccordionSection>

            <AccordionSection title="Features Page">
                <Input label="Title" section="featuresPage" field="title" />
                <TextArea label="Subtitle" section="featuresPage" field="subtitle" />
                <ImageUploader label="Background Image URL" section="featuresPage" field="backgroundImageUrl" />
                <div className="border-t pt-4 mt-4">
                     <h3 className="font-bold mb-2">Features List</h3>
                     {(settings.featuresPage?.features || []).map((feature, index) => (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md mb-2">
                             <div>
                                <label className="block text-sm font-medium text-light-text mb-1">Feature Icon Name</label>
                                <input value={feature.icon || ''} onChange={e => handleChange('featuresPage', 'features', e.target.value, index, 'icon')} placeholder="Icon Name (e.g., 'home')" className="w-full bg-brand-bg border rounded p-2" />
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
            
            <AccordionSection title="Services Section">
                <Input label="Title" section="servicesSection" field="title" />
                <TextArea label="Subtitle" section="servicesSection" field="subtitle" />
                <div className="border-t pt-4 mt-4">
                     <h3 className="font-bold mb-2">Services List</h3>
                     {(settings.servicesSection?.services || []).map((service, index) => (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md mb-2">
                             <div><label className="block text-sm font-medium text-light-text mb-1">Service Icon Name</label><input value={service.icon || ''} onChange={e => handleChange('servicesSection', 'services', e.target.value, index, 'icon')} placeholder="Icon Name" className="w-full bg-brand-bg border rounded p-2" /></div>
                             <div><label className="block text-sm font-medium text-light-text mb-1">Service Title</label><input value={service.title || ''} onChange={e => handleChange('servicesSection', 'services', e.target.value, index, 'title')} placeholder="Title" className="w-full bg-brand-bg border rounded p-2" /></div>
                             <div className="md:col-span-2"><label className="block text-sm font-medium text-light-text mb-1">Service Text</label><textarea rows={2} value={service.text || ''} onChange={e => handleChange('servicesSection', 'services', e.target.value, index, 'text')} placeholder="Description" className="w-full bg-brand-bg border rounded p-2"></textarea></div>
                             <button onClick={() => handleRemoveItem('servicesSection', 'services', index)} className="text-red-500 p-2 md:col-span-2 flex justify-center"><Trash2 size={18} /> Remove Service</button>
                         </div>
                     ))}
                     <button onClick={() => handleAddItem('servicesSection', 'services', {icon: '', title: '', text: ''})} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Service</button>
                </div>
            </AccordionSection>

            <AccordionSection title="About Page & Leadership Section">
                <Input label="About Page Title" section="aboutPage" field="title" />
                <TextArea label="About Page Subtitle" section="aboutPage" field="subtitle" />
                <ImageUploader label="About Page Main Image" section="aboutPage" field="imageUrl" />
                <Input label="Mission Title" section="aboutPage" field="missionTitle" />
                <TextArea label="Mission Statement" section="aboutPage" field="missionStatement" />
                <Input label="Vision Title" section="aboutPage" field="visionTitle" />
                <TextArea label="Vision Statement" section="aboutPage" field="visionStatement" />
                <hr className="my-4"/>
                <Input label="Leadership Section Title" section="leadershipSection" field="title" />
                <TextArea label="Leadership Section Subtitle" section="leadershipSection" field="subtitle" />
                <div className="border-t pt-4 mt-4">
                     <h3 className="font-bold mb-2">Executive Team</h3>
                     {(settings.aboutPage?.executives || []).map((exec, index) => (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md mb-2">
                             <div><label className="block text-sm font-medium text-light-text mb-1">Name</label><input value={exec.name || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'name')} placeholder="Executive Name" className="w-full bg-brand-bg border rounded p-2" /></div>
                             <div><label className="block text-sm font-medium text-light-text mb-1">Title</label><input value={exec.title || ''} onChange={e => handleChange('aboutPage', 'executives', e.target.value, index, 'title')} placeholder="Position Title" className="w-full bg-brand-bg border rounded p-2" /></div>
                             <div className="md:col-span-2"><ImageUploader label="Image URL" section="aboutPage" field="executives" index={index} subField="imageUrl" /></div>
                             <button onClick={() => handleRemoveItem('aboutPage', 'executives', index)} className="text-red-500 p-2 md:col-span-2 flex justify-center"><Trash2 size={18} /> Remove Executive</button>
                         </div>
                     ))}
                     <button onClick={() => handleAddItem('aboutPage', 'executives', {name: '', title: '', imageUrl: ''})} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Executive</button>
                </div>
            </AccordionSection>

            <AccordionSection title="Install App Section">
                <Input label="Title" section="installAppSection" field="title" />
                <TextArea label="Subtitle" section="installAppSection" field="subtitle" />
                <ImageUploader label="Background Image URL" section="installAppSection" field="backgroundImageUrl" />
            </AccordionSection>
        </div>
    );
};

export default SiteEditorPage;
