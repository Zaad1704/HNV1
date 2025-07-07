import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import apiClient from '../api/client';

const EditPropertyPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    numberOfUnits: 1,
    status: 'Active',
    description: ''
  });

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}`);
      return data.data;
    },
    onSuccess: (data) => {
      setFormData({
        name: data.name || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          zipCode: data.address?.zipCode || ''
        },
        numberOfUnits: data.numberOfUnits || 1,
        status: data.status || 'Active',
        description: data.description || ''
      });
    },
    enabled: !!propertyId
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put(`/properties/${propertyId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert('Property updated successfully!');
      navigate(`/dashboard/properties/${propertyId}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update property');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading property...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link
          to={`/dashboard/properties/${propertyId}`}
          className="p-2 rounded-xl hover:bg-app-bg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Edit Property</h1>
          <p className="text-text-secondary">Update property information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="app-surface rounded-3xl p-8 border border-app-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Property Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Number of Units *
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfUnits}
              onChange={(e) => setFormData({ ...formData, numberOfUnits: parseInt(e.target.value) })}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, city: e.target.value }
              })}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              State *
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, state: e.target.value }
              })}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, zipCode: e.target.value }
              })}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Renovation">Under Renovation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            placeholder="Property description..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to={`/dashboard/properties/${propertyId}`}
            className="px-6 py-3 border border-app-border rounded-xl font-medium text-text-secondary hover:bg-app-bg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="btn-gradient px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditPropertyPage;