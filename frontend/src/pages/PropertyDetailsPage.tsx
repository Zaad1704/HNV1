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
import PropertyQuickActions from '../components/property/PropertyQuickActions';
import MonthlyCollectionSheet from '../components/common/MonthlyCollectionSheet';
import PropertyAnalyticsDashboard from '../components/property/PropertyAnalyticsDashboard';
import EnhancedUnitsGrid from '../components/property/EnhancedUnitsGrid';
import EnhancedPropertyQuickActions from '../components/property/EnhancedPropertyQuickActions';
import RelatedDataSections from '../components/property/RelatedDataSections';
import RentIncreaseModal from '../components/property/RentIncreaseModal';

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

  // Fetch units for this property
  const { data: units = [] } = useQuery({
    queryKey: ['propertyUnits', propertyId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/units/property/${propertyId}`);
        return data.data || [];
      } catch (error) {
        return [];
      }
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
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <Link 
            to="/dashboard/properties"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div className="flex-1 mx-4">
            <h1 className="text-lg font-bold text-gray-900 truncate">{property.name}</h1>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-8">
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
                <span>{property.address?.street || property.address?.formattedAddress || 'No address'}</span>
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

        {/* Mobile Address */}
        <div className="lg:hidden mb-4 px-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} />
            <span className="text-sm">{property.address?.street || property.address?.formattedAddress || 'No address'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-8 order-2 lg:order-1">
            {/* Property Analytics Dashboard */}
            <PropertyAnalyticsDashboard
              propertyId={propertyId!}
              property={property}
              tenants={tenants}
              payments={payments}
              expenses={expenses}
              maintenanceRequests={maintenanceRequests}
            />

            {/* Related Data Sections with Unit-Centric Filtering */}
            <RelatedDataSections
              propertyId={propertyId!}
              property={property}
              tenants={tenants}
              payments={payments}
              expenses={expenses}
              maintenanceRequests={maintenanceRequests}
            />

            {/* Enhanced Units Grid */}
            <div data-section="units">
            <EnhancedUnitsGrid
              propertyId={propertyId!}
              property={property}
              tenants={tenants}
              units={units}
              onAddTenant={handleAddTenant}
              onEditNicknames={() => {
                // Open the enhanced unit nickname modal
                const unitsGrid = document.querySelector('[data-units-grid]');
                if (unitsGrid) {
                  // Trigger the manage units modal from the units grid
                  const manageButton = unitsGrid.querySelector('[data-manage-units-btn]') as HTMLButtonElement;
                  if (manageButton) {
                    manageButton.click();
                  }
                }
              }}
            />
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="order-1 lg:order-2">
            <EnhancedPropertyQuickActions
              propertyId={propertyId!}
              property={property}
              tenants={tenants}
              onRentIncrease={() => setShowRentIncrease(true)}
              onCollectionSheet={() => setShowCollectionSheet(true)}
              onArchive={() => {
                if (confirm(`Archive ${property.name}? This will hide it from active listings.`)) {
                  alert('Archive functionality coming soon');
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        property={property}
        onPropertyUpdated={handleDataUpdate}
      />

      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
        propertyId={propertyId!}
        propertyName={property.name}
        tenants={activeTenants}
      />

      <RentIncreaseModal
        isOpen={showRentIncrease}
        onClose={() => setShowRentIncrease(false)}
        property={property}
        tenants={activeTenants}
        onSuccess={handleDataUpdate}
      />
    </div>
  );
};

export default PropertyDetailsPage;