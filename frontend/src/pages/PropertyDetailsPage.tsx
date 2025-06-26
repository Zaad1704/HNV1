import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, DollarSign, Calendar } from 'lucide-react';

interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  unit: string;
  rentAmount: number;
  leaseStartDate: string;
  leaseEndDate: string;
  status: string;
}

interface Property {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    formattedAddress: string;
  };
  numberOfUnits: number;
  imageUrl?: string;
  tenants: Tenant[];
}

const fetchPropertyDetails = async (propertyId: string): Promise<Property> => {
  const { data } = await apiClient.get(`/properties/${propertyId}`);
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
        <Building2 size={48} className="mx-auto text-text-muted mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">Property Not Found</h3>
        <p className="text-text-secondary">The property you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Property Header */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-primary mb-4">{property.name}</h1>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-text-muted" />
                <span className="text-text-secondary">
                  {property.address.formattedAddress}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-text-muted" />
                <span className="text-text-secondary">
                  {property.numberOfUnits} {property.numberOfUnits === 1 ? 'Unit' : 'Units'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Users size={20} className="text-text-muted" />
                <span className="text-text-secondary">
                  {property.tenants?.length || 0} Active Tenants
                </span>
              </div>
            </div>
          </div>
          
          {property.imageUrl && (
            <div className="w-full lg:w-80 h-64 rounded-2xl overflow-hidden">
              <img
                src={property.imageUrl}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tenants List */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Tenants</h2>
        
        {property.tenants && property.tenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {property.tenants.map((tenant: Tenant) => (
              <div key={tenant._id} className="bg-app-bg rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{tenant.name}</h3>
                    <p className="text-sm text-text-secondary">Unit {tenant.unit}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-text-muted" />
                    <span className="text-text-secondary">
                      ${tenant.rentAmount?.toLocaleString()}/month
                    </span>
                  </div>
                  
                  {tenant.leaseEndDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-text-muted" />
                      <span className="text-text-secondary">
                        Lease ends: {new Date(tenant.leaseEndDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Tenants</h3>
            <p className="text-text-secondary">This property doesn't have any tenants yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyDetailsPage;