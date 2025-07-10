import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, DollarSign, Calendar, Edit, TrendingUp, Trash2, Share2, FileText } from 'lucide-react';
import RentIncreaseModal from '../components/common/RentIncreaseModal';
import EditPropertyModal from '../components/common/EditPropertyModal';
import UnitsSection from '../components/property/UnitsSection';
import PropertyStatsSection from '../components/property/PropertyStatsSection';
import DataPreviewSections from '../components/property/DataPreviewSections';
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
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>('');



  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchPropertyDetails(propertyId!),
    enabled: !!propertyId
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['propertyTenants', propertyId],
    queryFn: () => fetchPropertyTenants(propertyId!),
    enabled: !!propertyId,
    refetchOnWindowFocus: true,
    staleTime: 30000 // 30 seconds
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
              try {
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
              } catch (error) {
                alert('Sharing not supported');
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
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI Generated</span>
                <button
                  onClick={async () => {
                    try {
                      const { data } = await apiClient.put(`/properties/${propertyId}/regenerate-description`);
                      queryClient.setQueryData(['property', propertyId], data.data);
                    } catch (error) {
                      console.error('Failed to regenerate description:', error);
                    }
                  }}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200 cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {property.description || 'Generating description...'}
            </p>
          </div>

          {/* Data Preview Sections - Moved from bottom */}
          <DataPreviewSections 
            propertyId={propertyId!} 
            property={property}
            tenants={tenants}
          />

          {/* Property Statistics */}
          <PropertyStatsSection propertyId={propertyId!} />
          
          {/* Units Section */}
          <UnitsSection 
            propertyId={propertyId!} 
            property={property}
            tenants={tenants}
            onAddTenant={(unitNumber) => {
              setSelectedUnit(unitNumber);
              setShowAddTenant(true);
            }}
            onDataUpdate={() => {
              // Refresh both tenants and units data when changes occur
              queryClient.invalidateQueries({ queryKey: ['propertyTenants', propertyId] });
              queryClient.invalidateQueries({ queryKey: ['propertyUnits', propertyId] });
            }}
          />




          



        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Overview - Moved from main content */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Property Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Address</p>
                  <p className="font-medium text-text-primary text-sm">
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
                    alert('Archive functionality coming soon');
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
        onPropertyUpdated={async (updatedProperty) => {
          queryClient.setQueryData(['property', propertyId], updatedProperty);
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          // Regenerate description after update
          try {
            const { data } = await apiClient.put(`/properties/${propertyId}/regenerate-description`);
            queryClient.setQueryData(['property', propertyId], data.data);
          } catch (error) {
            console.error('Failed to regenerate description after update:', error);
          }
        }}
        property={property}
      />
      

      
      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
        preSelectedProperty={propertyId}
      />
      
      {showAddTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Tenant to Unit {selectedUnit}</h3>
              <button onClick={() => setShowAddTenant(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-4">Redirecting to add tenant form...</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.location.href = `/dashboard/tenants/add?propertyId=${propertyId}&unit=${selectedUnit}`;
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Continue
              </button>
              <button
                onClick={() => setShowAddTenant(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PropertyDetailsPage;