import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Settings, Save, Archive, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PropertySettingsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoRentReminders: true,
    reminderDaysBefore: 5,
    lateFeeDays: 5,
    lateFeeAmount: 50,
    allowOnlinePayments: true,
    requireLeaseDocuments: true,
    autoArchiveAfterDays: 365,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}`);
      return data.data;
    },
    enabled: !!propertyId
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(`Are you sure you want to archive ${property?.name}? This will hide it from active listings but preserve all data.`)) {
      return;
    }

    try {
      await apiClient.put(`/properties/${propertyId}`, { status: 'Archived' });
      alert('Property archived successfully!');
      window.location.href = '/dashboard/properties';
    } catch (error) {
      alert('Failed to archive property');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Property not found</h2>
          <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-800">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to={`/dashboard/properties/${propertyId}`}
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-text-muted" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Property Settings</h1>
              <p className="text-text-secondary">{property.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Rent & Payment Settings */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Settings size={20} />
              Rent & Payment Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-text-primary">Auto Rent Reminders</label>
                  <p className="text-sm text-text-secondary">Automatically send rent reminders to tenants</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRentReminders}
                    onChange={(e) => setSettings({ ...settings, autoRentReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Reminder Days Before Due
                  </label>
                  <input
                    type="number"
                    value={settings.reminderDaysBefore}
                    onChange={(e) => setSettings({ ...settings, reminderDaysBefore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Late Fee Days
                  </label>
                  <input
                    type="number"
                    value={settings.lateFeeDays}
                    onChange={(e) => setSettings({ ...settings, lateFeeDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Late Fee Amount ($)
                </label>
                <input
                  type="number"
                  value={settings.lateFeeAmount}
                  onChange={(e) => setSettings({ ...settings, lateFeeAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tenant Management Settings */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h2 className="text-lg font-bold text-text-primary mb-4">Tenant Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-text-primary">Allow Online Payments</label>
                  <p className="text-sm text-text-secondary">Enable tenants to pay rent online</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowOnlinePayments}
                    onChange={(e) => setSettings({ ...settings, allowOnlinePayments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-text-primary">Require Lease Documents</label>
                  <p className="text-sm text-text-secondary">Require signed lease documents for new tenants</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireLeaseDocuments}
                    onChange={(e) => setSettings({ ...settings, requireLeaseDocuments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h2 className="text-lg font-bold text-text-primary mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(settings.notificationPreferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-text-primary capitalize">{key} Notifications</label>
                    <p className="text-sm text-text-secondary">Receive notifications via {key}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationPreferences: {
                          ...settings.notificationPreferences,
                          [key]: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="app-surface rounded-3xl p-6 border border-red-200 bg-red-50">
            <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-900">Archive Property</h3>
                <p className="text-sm text-red-700 mb-3">
                  Archive this property to hide it from active listings. All data will be preserved and can be restored later.
                </p>
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Archive size={16} />
                  Archive Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySettingsPage;