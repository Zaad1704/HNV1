import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Save, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { ISiteSettings } from '../../types/siteSettings';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="app-surface rounded-3xl p-6 border border-app-border">
    <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
    {children}
  </div>
);

const fetchSiteSettings = async (): Promise<ISiteSettings> => {
  const { data } = await apiClient.get('/site-settings');
  return data.data || {};
};

const updateSiteSettings = async (settings: Partial<ISiteSettings>) => {
  const { data } = await apiClient.put('/site-settings', settings);
  return data.data;
};

const SiteEditorPage = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Partial<ISiteSettings>>({});

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings,
    onSuccess: (data) => setSettings(data)
  });

  const updateMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['siteSettings']);
      alert('Settings updated successfully!');
    },
    onError: (error: any) => {
      alert(`Failed to update settings: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleInputChange = (section: keyof ISiteSettings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: keyof ISiteSettings, field: string) => {
    // Handle array changes for complex fields
    console.log('Array change:', section, field);
  };

  const handleArrayItemChange = (section: keyof ISiteSettings, field: string, index: number) => {
    // Handle individual array item changes
    const currentArray = (settings[section] as any)?.[field] || [];
    const newArray = [...currentArray];
    // Update specific index
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: newArray
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading settings...</span>
      </div>
    );
  }

  const InputField: React.FC<{ label: string; section: keyof ISiteSettings; field: string }> = ({ 
    label, 
    section, 
    field 
  }) => (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <input
        type="text"
        value={(settings[section] as any)?.[field] || ''}
        onChange={(e) => handleInputChange(section, field, e.target.value)}
        className="w-full"
      />
    </div>
  );

  const TextAreaField: React.FC<{ label: string; section: keyof ISiteSettings; field: string }> = ({ 
    label, 
    section, 
    field 
  }) => (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <textarea
        value={(settings[section] as any)?.[field] || ''}
        onChange={(e) => handleInputChange(section, field, e.target.value)}
        rows={3}
        className="w-full"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Site Editor</h1>
          <p className="text-text-secondary mt-1">Customize your site settings and content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 app-gradient rounded-xl flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Section title="Company Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Company Name" section="logos" field="companyName" />
            <InputField label="Favicon URL" section="logos" field="faviconUrl" />
            <InputField label="Footer Logo URL" section="logos" field="footerLogoUrl" />
          </div>
        </Section>

        <Section title="Hero Section">
          <div className="space-y-4">
            <InputField label="Hero Title" section="heroSection" field="title" />
            <TextAreaField label="Hero Subtitle" section="heroSection" field="subtitle" />
            <InputField label="CTA Button Text" section="heroSection" field="ctaText" />
          </div>
        </Section>

        <Section title="Footer Settings">
          <div className="space-y-4">
            <TextAreaField label="Footer Description" section="footer" field="description" />
            <InputField label="Copyright Text" section="footer" field="copyrightText" />
          </div>
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="btn-gradient px-8 py-3 rounded-2xl flex items-center gap-2 font-semibold disabled:opacity-50"
          >
            {updateMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {updateMutation.isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SiteEditorPage;