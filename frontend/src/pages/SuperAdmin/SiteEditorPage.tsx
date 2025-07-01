import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Eye, Globe } from 'lucide-react';

const SiteEditorPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'hero', label: 'Hero Section', icon: Globe },
    { id: 'features', label: 'Features', icon: Eye }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Site Editor</h1>
          <p className="text-text-secondary mt-1">Customize your platform's appearance and content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="font-semibold text-text-primary mb-4">Settings</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'hover:bg-app-bg text-text-secondary'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      defaultValue="HNV Property Management"
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      defaultValue="support@hnvpm.com"
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Site Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Professional Property Management Solutions"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Hero Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    defaultValue="The All-in-One Platform for Modern Property Management"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Streamline your property management with our comprehensive solution"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    defaultValue="Start Your Free Trial"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Features Section</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-app-border rounded-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Feature {i} Title
                          </label>
                          <input
                            type="text"
                            defaultValue={`Feature ${i}`}
                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Feature {i} Description
                          </label>
                          <textarea
                            rows={2}
                            defaultValue={`Description for feature ${i}`}
                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteEditorPage;