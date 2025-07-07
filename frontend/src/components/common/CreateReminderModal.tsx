import React, { useState } from 'react';
import { X, Bell, Calendar, Users, Mail, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReminderCreated: (reminder: any) => void;
}

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({ isOpen, onClose, onReminderCreated }) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    type: 'rent_due',
    title: '',
    message: '',
    propertyId: '',
    tenantId: '',
    frequency: 'monthly',
    triggerDate: new Date().toISOString().split('T')[0],
    daysBeforeDue: 3,
    recipients: {
      tenants: true,
      landlords: false,
      agents: false
    },
    channels: {
      email: true,
      sms: false,
      whatsapp: false,
      inApp: true
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', formData.propertyId],
    queryFn: async () => {
      if (!formData.propertyId) return [];
      const { data } = await apiClient.get(`/tenants?propertyId=${formData.propertyId}`);
      return data.data || [];
    },
    enabled: !!formData.propertyId
  });

  const reminderTypes = [
    { value: 'rent_due', label: 'Rent Due Reminder' },
    { value: 'lease_expiry', label: 'Lease Expiry Notice' },
    { value: 'maintenance_due', label: 'Maintenance Due' },
    { value: 'inspection_due', label: 'Inspection Reminder' },
    { value: 'payment_overdue', label: 'Payment Overdue' },
    { value: 'custom', label: 'Custom Reminder' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const reminderData = {
        ...formData,
        organizationId: user?.organizationId,
        createdBy: user?._id,
        nextRunDate: new Date(formData.triggerDate),
        conditions: {
          daysBeforeDue: formData.daysBeforeDue
        }
      };
      
      const response = await apiClient.post('/reminders', reminderData);
      onReminderCreated(response.data.data);
      alert('Reminder created successfully!');
      onClose();
      
      // Reset form
      setFormData({
        type: 'rent_due',
        title: '',
        message: '',
        propertyId: '',
        tenantId: '',
        frequency: 'monthly',
        triggerDate: new Date().toISOString().split('T')[0],
        daysBeforeDue: 3,
        recipients: { tenants: true, landlords: false, agents: false },
        channels: { email: true, sms: false, whatsapp: false, inApp: true }
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-dark-orange-blue rounded-2xl flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create Reminder</h3>
              <p className="text-gray-600">Set up automated notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              >
                {reminderTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Title and Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              placeholder="Reminder title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              rows={4}
              placeholder="Reminder message content"
              required
            />
          </div>

          {/* Property and Tenant Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property (Optional)
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, tenantId: '' })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              >
                <option value="">All Properties</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant (Optional)
              </label>
              <select
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                disabled={!formData.propertyId}
              >
                <option value="">All Tenants</option>
                {tenants.map((tenant: any) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name} - Unit {tenant.unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.triggerDate}
                onChange={(e) => setFormData({ ...formData, triggerDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Before Due
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.daysBeforeDue}
                onChange={(e) => setFormData({ ...formData, daysBeforeDue: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recipients
            </label>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recipients.tenants}
                  onChange={(e) => setFormData({
                    ...formData,
                    recipients: { ...formData.recipients, tenants: e.target.checked }
                  })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <span className="text-sm">Tenants</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recipients.landlords}
                  onChange={(e) => setFormData({
                    ...formData,
                    recipients: { ...formData.recipients, landlords: e.target.checked }
                  })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <span className="text-sm">Landlords</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recipients.agents}
                  onChange={(e) => setFormData({
                    ...formData,
                    recipients: { ...formData.recipients, agents: e.target.checked }
                  })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <span className="text-sm">Agents</span>
              </label>
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notification Channels
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.channels.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    channels: { ...formData.channels, email: e.target.checked }
                  })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <Mail size={16} />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.channels.sms}
                  onChange={(e) => setFormData({
                    ...formData,
                    channels: { ...formData.channels, sms: e.target.checked }
                  })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <MessageSquare size={16} />
                <span className="text-sm">SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.channels.whatsapp}
                  onChange={(e) => setFormData({
                    ...formData,
                    channels: { ...formData.channels, whatsapp: e.target.checked }
                  })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <MessageSquare size={16} />
                <span className="text-sm">WhatsApp</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.channels.inApp}
                  onChange={(e) => setFormData({
                    ...formData,
                    channels: { ...formData.channels, inApp: e.target.checked }
                  })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <Bell size={16} />
                <span className="text-sm">In-App</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 btn-gradient text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-bold"
            >
              {isSubmitting ? 'Creating Reminder...' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReminderModal;