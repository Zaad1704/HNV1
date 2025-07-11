import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Home, 
  Users, 
  DollarSign, 
  Calendar,
  FileText,
  TrendingUp,
  Plus
} from 'lucide-react';
import apiClient from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EditPropertyModal from '../components/common/EditPropertyModal';
import UnitsSection from '../components/property/UnitsSection';
import PropertyStatsSection from '../components/property/PropertyStatsSection';
import DataPreviewSections from '../components/property/DataPreviewSections';
import MonthlyCollectionSheet from '../components/common/MonthlyCollectionSheet';

const PropertyDetailsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showRentIncrease, setShowRentIncrease] = useState(false);

  // Fetch property details
  const { data: property, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}`);
      return data.data;
    },
    enabled: !!propertyId
  });

  // Fetch tenants for this property
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['propertyTenants', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId
  });

  // Fetch payments for this property
  const { data: payments = [] } = useQuery({
    queryKey: ['propertyPayments', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payments?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId
  });

  // Fetch expenses for this property
  const { data: expenses = [] } = useQuery({
    queryKey: ['propertyExpenses', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/expenses?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId
  });

  // Fetch maintenance requests for this property
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['propertyMaintenance', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/maintenance?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId
  });

  const handleDataUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyTenants', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyPayments', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyExpenses', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyMaintenance', propertyId] });
  };

  const handleAddTenant = (unitNumber?: string) => {
    const url = unitNumber 
      ? `/dashboard/tenants/add?propertyId=${propertyId}&unit=${unitNumber}`
      : `/dashboard/tenants/add?propertyId=${propertyId}`;
    navigate(url);
  };

  if (propertyLoading || tenantsLoading) {
    return <LoadingSpinner />;
  }

  if (propertyError || !property) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Property not found</h2>
          <p className="text-text-secondary mb-4">The property you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-800">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const activeTenants = tenants.filter((t: any) => t.status === 'Active');
  const totalRent = activeTenants.reduce((sum: number, tenant: any) => sum + (tenant.rentAmount || 0), 0);
  const occupancyRate = property.numberOfUnits > 0 ? (activeTenants.length / property.numberOfUnits) * 100 : 0;

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard/properties"
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-text-muted" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{property.name}</h1>
              <div className="flex items-center gap-2 text-text-secondary mt-1">
                <MapPin size={16} />
                <span>{property.address}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Edit Property
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Property Stats */}
            <PropertyStatsSection 
              property={property}
              tenants={tenants}
              payments={payments}
              expenses={expenses}
              maintenanceRequests={maintenanceRequests}
            />

            {/* Units Section */}
            <UnitsSection
              propertyId={propertyId!}
              property={property}
              tenants={tenants}
              onAddTenant={handleAddTenant}
              onDataUpdate={handleDataUpdate}
            />

            {/* Data Preview Sections */}
            <DataPreviewSections
              propertyId={propertyId!}
              tenants={tenants}
              payments={payments}
              expenses={expenses}
              maintenanceRequests={maintenanceRequests}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Info */}
            <div className="app-surface rounded-3xl p-6 border border-app-border">
              <h3 className="text-lg font-bold text-text-primary mb-4">Property Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Type</span>
                  <span className="font-medium text-text-primary">{property.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Units</span>
                  <span className="font-medium text-text-primary">{property.numberOfUnits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Occupancy</span>
                  <span className="font-medium text-text-primary">{occupancyRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Monthly Rent</span>
                  <span className="font-medium text-text-primary">${totalRent.toLocaleString()}</span>
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
      </div>

      {/* Modals */}
      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        property={property}
        onUpdate={handleDataUpdate}
      />

      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
        propertyId={propertyId!}
        propertyName={property.name}
        tenants={activeTenants}
      />

      {showRentIncrease && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Rent Increase</h3>
            <p className="text-gray-600 mb-4">
              Rent increase functionality is coming soon. This will allow you to:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Set new rent amounts for all units</li>
              <li>Schedule increases for future dates</li>
              <li>Generate tenant notifications</li>
              <li>Track increase history</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRentIncrease(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;