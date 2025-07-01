import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, DollarSign, Calendar, Edit } from 'lucide-react';

const fetchPropertyDetails = async (propertyId: string) => {
  const { data } = await apiClient.get(`/api/properties/${propertyId}`);
  return data.data;
};

const PropertyDetailsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchPropertyDetails(propertyId!),
    enabled: !!propertyId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading property details...</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Property Not Found</h3>
        <p className="text-text-secondary mb-4">The property you're looking for doesn't exist.</p>
        <Link
          to="/dashboard/properties"
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/properties"
            className="p-2 rounded-xl hover:bg-app-bg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{property.name}</h1>
            <p className="text-text-secondary">Property Details</p>
          </div>
        </div>
        <button className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold">
          <Edit size={20} />
          Edit Property
        </button>
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image */}
          <div className="app-surface rounded-3xl overflow-hidden border border-app-border">
            <div className="h-64 bg-gradient-to-br from-brand-blue to-brand-orange relative">
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users size={48} className="text-white/80" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  property.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            <h2 className="text-xl font-bold text-text-primary mb-4">Description</h2>
            <p className="text-text-secondary">
              {property.description || 'No description available for this property.'}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Property Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Address</p>
                  <p className="font-medium text-text-primary">
                    {property.address?.formattedAddress || 'Address not available'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Units</p>
                  <p className="font-medium text-text-primary">
                    {property.numberOfUnits} {property.numberOfUnits === 1 ? 'Unit' : 'Units'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Property Type</p>
                  <p className="font-medium text-text-primary">
                    {property.propertyType || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Created</p>
                  <p className="font-medium text-text-primary">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                View Tenants
              </button>
              <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors">
                Add Tenant
              </button>
              <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors">
                View Payments
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyDetailsPage;