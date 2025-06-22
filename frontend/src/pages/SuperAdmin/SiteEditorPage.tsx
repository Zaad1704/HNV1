import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ISiteSettings } from '../../../../backend/models/SiteSettings';
import { useMutation } from '@tanstack/react-query';

// AccordionSection and other helpers remain the same...
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

    // --- All existing hooks and handlers (uploadFileMutation, handleChange, etc.) remain the same ---

    useEffect(() => {
        apiClient.get('/site-settings')
          .then(res => setSettings(res.data.data || {}))
          .catch(() => setMessage('Error: Failed to fetch settings.'))
          .finally(() => setLoading(false));
    }, []);

    // Generic handler for text input changes
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
    
    // Generic handlers for adding/removing items from arrays
    const handleAddItem = (section, field, defaultItem = {}) => { /* ... */ };
    const handleRemoveItem = (section, field, index) => { /* ... */ };
    const handleSave = async () => { /* ... */ };
    const handleFileUploadChange = async (event: React.ChangeEvent<HTMLInputElement>, section: string, field: string, index: number = -1, subField: string = '') => { /* ... */ };
    
    // Reusable input components
    const Input = ({ label, section, field }) => ( /* ... */ );
    const TextArea = ({ label, section, field }) => ( /* ... */ );
    const ImageUploader = ({ label, section, field, index = -1, subField = '' }) => { /* ... */ };

    if (loading) return <div>Loading Site Editor...</div>;

    return (
        <div className="space-y-6 text-dark-text">
            {/* Header and message bar remain the same */}
            <div className="flex justify-between items-center bg-light-card p-4 rounded-xl shadow-md sticky top-4 z-20 border border-border-color">
                <h1 className="text-2xl font-bold">Site Content Editor</h1>
                <button onClick={handleSave} className="px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark">
                    Save All Changes
                </button>
            </div>
            {message && <div className={`p-3 text-center rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

            {/* Existing Accordions */}
            <AccordionSection title="Logos & Branding">
                {/* ... fields ... */}
            </AccordionSection>
            <AccordionSection title="Hero Section">
                {/* ... fields ... */}
            </AccordionSection>
            <AccordionSection title="Features Page">
                {/* ... fields ... */}
            </AccordionSection>

            {/* --- NEW SERVICES SECTION --- */}
            <AccordionSection title="Services Section">
                <Input label="Title" section="servicesSection" field="title" />
                <TextArea label="Subtitle" section="servicesSection" field="subtitle" />
                <div className="border-t pt-4 mt-4">
                     <h3 className="font-bold mb-2">Services List</h3>
                     {(settings.servicesSection?.services || []).map((service, index) => (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md mb-2">
                             <div>
                                <label className="block text-sm font-medium text-light-text mb-1">Service Icon Name (e.g., 'home', 'users')</label>
                                <input value={service.icon || ''} onChange={e => handleChange('servicesSection', 'services', e.target.value, index, 'icon')} placeholder="Icon Name" className="w-full bg-brand-bg border rounded p-2" />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-light-text mb-1">Service Title</label>
                                <input value={service.title || ''} onChange={e => handleChange('servicesSection', 'services', e.target.value, index, 'title')} placeholder="Title" className="w-full bg-brand-bg border rounded p-2" />
                             </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-light-text mb-1">Service Text</label>
                                <textarea rows={2} value={service.text || ''} onChange={e => handleChange('servicesSection', 'services', e.target.value, index, 'text')} placeholder="Description" className="w-full bg-brand-bg border rounded p-2"></textarea>
                             </div>
                             <button onClick={() => handleRemoveItem('servicesSection', 'services', index)} className="text-red-500 hover:text-red-700 p-2 md:col-span-2 flex justify-center items-center"><Trash2 size={18} /> Remove Service</button>
                         </div>
                     ))}
                     <button onClick={() => handleAddItem('servicesSection', 'services', {icon: '', title: '', text: ''})} className="text-sm flex items-center gap-1 text-brand-primary font-semibold"><PlusCircle size={16}/> Add Service</button>
                </div>
            </AccordionSection>

            <AccordionSection title="About Page Section">
                {/* ... existing fields ... */}
            </AccordionSection>

            {/* --- NEW LEADERSHIP SECTION --- */}
            <AccordionSection title="Leadership Section">
                <Input label="Title" section="leadershipSection" field="title" />
                <TextArea label="Subtitle" section="leadershipSection" field="subtitle" />
            </AccordionSection>

            <AccordionSection title="Pricing Section">
                {/* ... existing fields ... */}
            </AccordionSection>

            {/* --- NEW INSTALL APP SECTION --- */}
            <AccordionSection title="Install App Section">
                <Input label="Title" section="installAppSection" field="title" />
                <TextArea label="Subtitle" section="installAppSection" field="subtitle" />
                <ImageUploader label="Background Image URL" section="installAppSection" field="backgroundImageUrl" />
            </AccordionSection>
            
            <AccordionSection title="Contact Page Section">
                {/* ... existing fields ... */}
            </AccordionSection>
            <AccordionSection title="Footer">
                {/* ... existing fields ... */}
            </AccordionSection>
        </div>
    );
};

export default SiteEditorPage;
