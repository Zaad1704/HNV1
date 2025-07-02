import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

const fetchTenants = async () => {
  try {
    const { data } = await apiClient.get('/tenants');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return [];
  }
};

const TenantsPage = () => {
  const { data: tenants, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
    retry: 3,
    retryDelay: 1000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading tenants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Unable to Load Tenants</h2>
        <p className="text-text-secondary mb-4">We're having trouble connecting to our servers.</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tenants</h1>
          <p className="text-text-secondary mt-1">Manage your tenant relationships</p>
        </div>
        <button className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold">
          <Plus size={20} />
          Add Tenant
        </button>
      </div>

      {tenants && tenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant: any, index: number) => (
            <motion.div
              key={tenant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{tenant.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Mail size={14} />
                  <span>{tenant.email}</span>
                </div>
                {tenant.phone && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Phone size={14} />
                    <span>{tenant.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <MapPin size={14} />
                  <span>Unit {tenant.unit} • {tenant.propertyId?.name}</span>
                </div>
                {tenant.rentAmount && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <DollarSign size={14} />
                    <span>${tenant.rentAmount}/month</span>
                  </div>
                )}
                {tenant.leaseEndDate && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar size={14} />
                    <span>Lease ends: {new Date(tenant.leaseEndDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-app-bg hover:bg-app-border text-text-primary py-2 px-4 rounded-xl text-sm font-medium transition-colors">
                  View Details
                </button>
                <button className="flex-1 app-gradient text-white py-2 px-4 rounded-xl text-sm font-medium hover:shadow-app transition-all">
                  Contact
                </button>
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
            <Users size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Tenants Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Start managing your tenants by adding your first tenant.
          </p>
          <button className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto">
            <Plus size={20} />
            Add Your First Tenant
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TenantsPage;