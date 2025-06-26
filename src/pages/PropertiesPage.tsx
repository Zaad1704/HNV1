import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Building2, Plus, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react';
import AddPropertyModal from '../components/common/AddPropertyModal';
import { Link } from 'react-router-dom';

const fetchProperties = async () => {
  const { data } = await apiClient.get('/properties');
  return data.data;
};

const PropertiesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties
  });

  const handlePropertyAdded = (newProperty: any) => {
    queryClient.setQueryData(['properties'], (old: any) => [...(old || []), newProperty]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading properties...</span>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Properties</h1>
          <p className="text-text-secondary mt-1">Manage your property portfolio</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add Property
        </button>
      </div>

      {/* Properties Grid */}
      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any, index: number) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl overflow-hidden border border-app-border hover:shadow-app-lg transition-all duration-300 group"
            >
              {/* Property Image */}
              <div className="h-48 bg-gradient-to-br from-brand-blue to-brand-orange relative overflow-hidden">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={48} className="text-white/80" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    property.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {property.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <MapPin size={14} />
                    <span>{property.address?.formattedAddress || 'Address not available'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Users size={14} />
                    <span>{property.numberOfUnits} {property.numberOfUnits === 1 ? 'Unit' : 'Units'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/properties/${property._id}`}
                    className="flex-1 bg-app-bg hover:bg-app-border text-text-primary py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  <button className="flex-1 app-gradient text-white py-2 px-4 rounded-xl text-sm font-medium hover:shadow-app transition-all flex items-center justify-center gap-2">
                    <Edit size={14} />
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Building2 size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Properties Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Start building your property portfolio by adding your first property.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add Your First Property
          </button>
        </motion.div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />
    </motion.div>
  );
};

export default PropertiesPage;