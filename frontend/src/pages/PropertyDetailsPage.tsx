import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, DollarSign, Calendar, Edit, TrendingUp, X, Wrench, Trash2, Share2, BarChart3 } from 'lucide-react';
import RentIncreaseModal from '../components/common/RentIncreaseModal';
import EditPropertyModal from '../components/common/EditPropertyModal';


import MonthlyCollectionSheet from '../components/common/MonthlyCollectionSheet';







const fetchPropertyDetails = async (propertyId: string) => {
  const { data } = await apiClient.get(`/properties/${propertyId}`);
  return data.data;
};

const fetchPropertyTenants = async (propertyId: string) => {
  try {
    const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
    return data.data || [];
  } catch (error) {
    return [];
  }
};

const PropertyDetailsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const queryClient = useQueryClient();
  const [showRentIncrease, setShowRentIncrease] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showCollectionSheet, setShowCollectionSheet] = useState(false);



  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchPropertyDetails(propertyId!),
    enabled: !!propertyId
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['propertyTenants', propertyId],
    queryFn: () => fetchPropertyTenants(propertyId!),
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-blue-600 transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${property.name}? This action cannot be undone.`)) {
                // Handle delete
                window.location.href = '/dashboard/properties';
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: property.name,
                  text: `Property: ${property.name}\nAddress: ${property.address?.formattedAddress || 'N/A'}\nUnits: ${property.numberOfUnits || 1}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Property link copied to clipboard!');
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-green-600 transition-colors"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image */}
          <div className="app-surface rounded-3xl overflow-hidden border border-app-border">
            <div className="h-64 bg-gradient-to-br from-brand-blue to-brand-orange relative">
              {property.imageUrl && property.imageUrl.trim() !== '' ? (
                <>
                  <img
                    src={property.imageUrl.startsWith('/') ? `${window.location.origin}${property.imageUrl}` : property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Property image failed to load:', property.imageUrl);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="fallback-icon hidden w-full h-full flex items-center justify-center absolute inset-0">
                    <Users size={48} className="text-white/80" />
                  </div>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-1 rounded">
                      {property.imageUrl}
                    </div>
                  )}
                </>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Property Description</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI Generated</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {property.description || 'Generating description...'}
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
              <Link 
                to={`/dashboard/tenants?propertyId=${propertyId}`}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors block text-center"
              >
                View Tenants ({tenants.length})
              </Link>
              <button 
                onClick={() => window.location.href = `/dashboard/tenants/add?propertyId=${propertyId}`}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                Add Tenant
              </button>
              <Link 
                to={`/dashboard/payments?propertyId=${propertyId}`}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors block text-center"
              >
                View Payments
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Archive ${property.name}? This will hide it from active listings.`)) {
                    // Handle archive
                    fetch(`/api/properties/${propertyId}/archive`, { method: 'PATCH' })
                      .then(() => window.location.reload());
                  }
                }}
                className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Archive Property
              </button>
              <button
                onClick={() => setShowCollectionSheet(true)}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Collection Sheet
              </button>
              <button
                onClick={() => setShowRentIncrease(true)}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp size={16} />
                Increase Rent
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <RentIncreaseModal
        isOpen={showRentIncrease}
        onClose={() => setShowRentIncrease(false)}
        property={property}
        type="property"
      />
      
      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onPropertyUpdated={(updatedProperty) => {
          queryClient.setQueryData(['property', propertyId], updatedProperty);
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        }}
        property={property}
      />
      

      
      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
        preSelectedProperty={propertyId}
      />
    </motion.div>
  );
};

export default PropertyDetailsPage;