import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, User, DollarSign, Calendar } from 'lucide-react';

const fetchUnitDetails = async (propertyId: string, unitNumber: string) => {
  const { data } = await apiClient.get(`/properties/${propertyId}/units`);
  const unit = data.data.find((u: any) => u.unitNumber === unitNumber);
  if (!unit) throw new Error('Unit not found');
  return unit;
};

const fetchProperty = async (propertyId: string) => {
  const { data } = await apiClient.get(`/properties/${propertyId}`);
  return data.data;
};

const UnitDetailsPage = () => {
  const { propertyId, unitNumber } = useParams<{ propertyId: string; unitNumber: string }>();

  const { data: unit, isLoading: unitLoading } = useQuery({
    queryKey: ['unit', propertyId, unitNumber],
    queryFn: () => fetchUnitDetails(propertyId!, unitNumber!),
    enabled: !!propertyId && !!unitNumber
  });

  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchProperty(propertyId!),
    enabled: !!propertyId
  });

  if (unitLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading unit details...</span>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Unit Not Found</h3>
        <p className="text-text-secondary mb-4">The unit you're looking for doesn't exist.</p>
        <Link
          to={`/dashboard/properties/${propertyId}`}
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Property
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
            to={`/dashboard/properties/${propertyId}`}
            className="p-2 rounded-xl hover:bg-app-bg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Unit {unit.unitNumber}
            </h1>
            <p className="text-text-secondary">
              {property?.name || 'Property Details'}
            </p>
          </div>
        </div>
      </div>

      {/* Unit Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Info */}
        <div className="space-y-6">
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            <h2 className="text-xl font-bold text-text-primary mb-6">Unit Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Home size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Unit Number</p>
                  <p className="font-medium text-text-primary">{unit.unitNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Current Rent</p>
                  <p className="font-medium text-text-primary">
                    ${unit.rentAmount || 0}/month
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Status</p>
                  <p className={`font-medium ${unit.isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                    {unit.isOccupied ? 'Occupied' : 'Vacant'}
                  </p>
                </div>
              </div>

              {unit.tenantName && (
                <div className="flex items-center gap-3">
                  <User size={16} className="text-text-muted" />
                  <div>
                    <p className="text-sm text-text-secondary">Current Tenant</p>
                    <Link 
                      to={`/dashboard/tenants/${unit.tenantId}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {unit.tenantName}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {!unit.isOccupied ? (
                <Link 
                  to={`/dashboard/tenants/add?propertyId=${propertyId}&unit=${unit.unitNumber}`}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors block text-center"
                >
                  Add Tenant to Unit
                </Link>
              ) : (
                <Link 
                  to={`/dashboard/tenants/${unit.tenantId}`}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors block text-center"
                >
                  View Tenant Details
                </Link>
              )}
              
              <Link 
                to={`/dashboard/payments?propertyId=${propertyId}&unit=${unit.unitNumber}`}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors block text-center"
              >
                View Unit Payments
              </Link>
              
              <button
                onClick={() => alert('Maintenance request feature coming soon')}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                Report Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UnitDetailsPage;