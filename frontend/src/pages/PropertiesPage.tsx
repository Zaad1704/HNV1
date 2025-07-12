import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import UniversalGlobalSearch from '../components/common/UniversalGlobalSearch';
import SmartSuggestions from '../components/common/SmartSuggestions';
import { useWorkflowTriggers } from '../hooks/useWorkflowTriggers';
import LazyLoader from '../components/common/LazyLoader';
import SkeletonLoader from '../components/common/SkeletonLoader';
import SwipeableCard from '../components/mobile/SwipeableCard';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
import { useBackgroundRefresh } from '../hooks/useBackgroundRefresh';
import { Building2, Plus, MapPin, Users, Edit, Trash2, Eye, Download, Mail, DollarSign, Archive, ArchiveRestore, EyeOff, Sparkles, Search, CheckSquare, Square, Calendar } from 'lucide-react';
import AddPropertyModal from '../components/common/AddPropertyModal';
import EditPropertyModal from '../components/common/EditPropertyModal';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import BulkPaymentModal from '../components/common/BulkPaymentModal';
import ActionButtons from '../components/common/ActionButtons';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import EnhancedPropertyCard from '../components/common/EnhancedPropertyCard';
import UniversalHeader from '../components/common/UniversalHeader';
import UniversalCard from '../components/common/UniversalCard';
import { useCrossData } from '../hooks/useCrossData';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDataExport } from '../hooks/useDataExport';
import { useAuthStore } from '../store/authStore';
import ExportModal from '../components/common/ExportModal';
import MessageButtons from '../components/common/MessageButtons';
import ShareButton from '../components/common/ShareButton';
import BulkLeaseActions from '../components/property/BulkLeaseActions';

const fetchProperties = async () => {
  try {
    const { data } = await apiClient.get('/properties');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    // Don't throw error to prevent query failures from causing redirects
    return [];
  }
};

const PropertiesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkPayment, setShowBulkPayment] = useState(false);
  const [showUniversalExport, setShowUniversalExport] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showVacant, setShowVacant] = useState(false);
  const [showBulkLeaseActions, setShowBulkLeaseActions] = useState(false);
  
  // Check URL params for filters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('filter') === 'vacant') {
      setShowVacant(true);
    }
  }, []);
  const queryClient = useQueryClient();
  const { exportProperties, isExporting } = useDataExport() || { exportProperties: () => {}, isExporting: false };
  const { triggerPaymentWorkflow } = useWorkflowTriggers();

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    retry: 0,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Properties query error:', error);
    }
  });
  
  // Fetch tenants data for vacancy check
  const { data: allTenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/tenants');
        return data.data || [];
      } catch (error) {
        return [];
      }
    }
  });

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    let filtered = properties.filter((property: any) => {
      if (!property) return false;
      
      // Archive filter
      const isArchived = property.status === 'Archived';
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;
      
      // Vacant filter
      if (showVacant) {
        const propertyTenants = allTenants.filter((t: any) => t.propertyId === property._id && t.status === 'Active');
        const isVacant = propertyTenants.length === 0 || propertyTenants.length < (property.numberOfUnits || 1);
        if (!isVacant) return false;
      }
      
      // Universal search
      const matchesUniversalSearch = !searchFilters.query || 
        (property.name && property.name.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (property.address?.formattedAddress && property.address.formattedAddress.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      // Legacy search
      const matchesSearch = !searchQuery || 
        (property.name && property.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (property.address?.city && property.address.city.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = (!filters.status || property.status === filters.status) &&
                           (!searchFilters.status || property.status === searchFilters.status);
      
      const matchesUnits = !filters.units || 
        (filters.units === 'single' && property.numberOfUnits === 1) ||
        (filters.units === 'multiple' && property.numberOfUnits > 1);
      
      return matchesUniversalSearch && matchesSearch && matchesStatus && matchesUnits;
    });

    // Apply date filtering
    if (searchFilters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (searchFilters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          if (searchFilters.startDate) startDate = new Date(searchFilters.startDate);
          break;
      }
      
      filtered = filtered.filter(property => {
        const propertyDate = new Date(property.createdAt || property.updatedAt || Date.now());
        return propertyDate >= startDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (searchFilters.sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = new Date(a.createdAt || a.updatedAt || 0);
          bValue = new Date(b.createdAt || b.updatedAt || 0);
      }
      
      if (searchFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [properties, searchQuery, filters, searchFilters, showArchived]);

  const handleUniversalSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'Active', label: t('property.active') },
        { value: 'Inactive', label: t('property.inactive') }
      ]
    },
    {
      key: 'units',
      label: 'Unit Type',
      type: 'select' as const,
      options: [
        { value: 'single', label: 'Single Unit' },
        { value: 'multiple', label: 'Multiple Units' }
      ]
    }
  ];

  const bulkActions = [
    {
      key: 'bulkPayment',
      label: 'Bulk Payment',
      icon: DollarSign,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: async (ids: string[]) => {
        setShowBulkPayment(true);
      }
    },
    {
      key: 'bulkLeaseRenewal',
      label: 'Renew Leases',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600 text-white',
      action: async (ids: string[]) => {
        const months = prompt('Enter lease extension months:', '12');
        if (months && !isNaN(Number(months))) {
          try {
            await Promise.all(ids.map(async (propertyId) => {
              const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
              const tenants = data.data || [];
              return Promise.all(tenants.map((tenant: any) => {
                const currentEndDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : new Date();
                const newEndDate = new Date(currentEndDate);
                newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));
                return apiClient.put(`/tenants/${tenant._id}`, {
                  leaseEndDate: newEndDate.toISOString().split('T')[0]
                });
              }));
            }));
            alert(`Leases renewed for ${ids.length} properties!`);
          } catch (error) {
            alert('Failed to renew some leases');
          }
        }
      }
    },
    {
      key: 'bulkLeaseTermination',
      label: 'Terminate Leases',
      icon: Calendar,
      color: 'bg-red-500 hover:bg-red-600 text-white',
      action: async (ids: string[]) => {
        if (confirm('Terminate all leases for selected properties?')) {
          try {
            await Promise.all(ids.map(async (propertyId) => {
              const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
              const tenants = data.data || [];
              return Promise.all(tenants.map((tenant: any) => 
                apiClient.put(`/tenants/${tenant._id}`, { status: 'Inactive' })
              ));
            }));
            alert(`Leases terminated for ${ids.length} properties!`);
          } catch (error) {
            alert('Failed to terminate some leases');
          }
        }
      }
    },
    {
      key: 'bulkRentIncrease',
      label: 'Rent Increase',
      icon: DollarSign,
      color: 'bg-orange-500 hover:bg-orange-600 text-white',
      action: async (ids: string[]) => {
        const percentage = prompt('Enter rent increase percentage:', '5');
        if (percentage && !isNaN(Number(percentage))) {
          try {
            await Promise.all(ids.map(async (propertyId) => {
              const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
              const tenants = data.data || [];
              return Promise.all(tenants.map((tenant: any) => {
                const newRent = tenant.rentAmount * (1 + Number(percentage) / 100);
                return apiClient.put(`/tenants/${tenant._id}`, { rentAmount: newRent });
              }));
            }));
            alert(`Rent increased by ${percentage}% for ${ids.length} properties!`);
          } catch (error) {
            alert('Failed to increase rent for some properties');
          }
        }
      }
    },
    {
      key: 'export',
      label: 'Export Selected',
      icon: Download,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: async (ids: string[]) => {
        const selectedData = filteredProperties.filter((p: any) => ids.includes(p._id));
        setShowUniversalExport(true);
      }
    },
    {
      key: 'exportWithTenants',
      label: 'Export with Tenants',
      icon: Download,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: async (ids: string[]) => {
        // Export properties with their tenant data
        const propertiesWithTenants = await Promise.all(
          ids.map(async (propertyId) => {
            const property = filteredProperties.find((p: any) => p._id === propertyId);
            try {
              const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
              return {
                ...property,
                tenants: data.data || [],
                tenantCount: (data.data || []).length,
                totalRent: (data.data || []).reduce((sum: number, t: any) => sum + (t.rentAmount || 0), 0)
              };
            } catch (error) {
              return { ...property, tenants: [], tenantCount: 0, totalRent: 0 };
            }
          })
        );
        
        // Flatten data for export
        const exportData = propertiesWithTenants.flatMap(property => 
          property.tenants.length > 0 
            ? property.tenants.map((tenant: any) => ({
                propertyName: property.name,
                propertyAddress: property.address?.formattedAddress,
                propertyStatus: property.status,
                tenantName: tenant.name,
                tenantEmail: tenant.email,
                tenantUnit: tenant.unit,
                tenantStatus: tenant.status,
                rentAmount: tenant.rentAmount || 0
              }))
            : [{
                propertyName: property.name,
                propertyAddress: property.address?.formattedAddress,
                propertyStatus: property.status,
                tenantName: 'No tenants',
                tenantEmail: '',
                tenantUnit: '',
                tenantStatus: '',
                rentAmount: 0
              }]
        );
        
        // Create temporary export modal with property-tenant data
        const exportModal = document.createElement('div');
        document.body.appendChild(exportModal);
        
        // Simple CSV export for now
        const headers = Object.keys(exportData[0] || {});
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => {
              const value = row[header];
              return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
            }).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `properties-with-tenants-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert('Properties with tenants exported successfully!');
      }
    },
    {
      key: 'contact',
      label: 'Contact Tenants',
      icon: Mail,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: (ids: string[]) => {

      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: 'bg-red-500 hover:bg-red-600 text-white',
      action: (ids: string[]) => {
        if (confirm('Delete selected properties?')) {

        }
      }
    }
  ];

  const handlePropertyAdded = (newProperty: any) => {
    queryClient.setQueryData(['properties'], (old: any) => [...(old || []), newProperty]);
  };

  const handlePropertyUpdated = (updatedProperty: any) => {
    queryClient.setQueryData(['properties'], (old: any) => 
      (old || []).map((p: any) => p._id === updatedProperty._id ? updatedProperty : p)
    );
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowEditModal(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      // Optimistic update
      removeOptimistic(propertyId);
      try {
        await apiClient.delete(`/properties/${propertyId}`);
        alert('Property deleted successfully!');
      } catch (error: any) {
        // Revert on error
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        alert(`Error: ${error.response?.data?.message || 'Failed to delete property'}`);
      }
    }
  };
  
  const handlePropertySelect = (propertyId: string, selected: boolean) => {
    if (selected) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };
  
  const handleArchiveProperty = async (propertyId: string, propertyName: string, currentStatus: string) => {
    const isArchiving = currentStatus !== 'Archived';
    const action = isArchiving ? 'archive' : 'restore';
    
    if (confirm(`Are you sure you want to ${action} ${propertyName}?`)) {
      try {
        await apiClient.put(`/properties/${propertyId}`, {
          status: isArchiving ? 'Archived' : 'Active'
        });
        
        queryClient.setQueryData(['properties'], (old: any) => 
          (old || []).map((p: any) => 
            p._id === propertyId 
              ? { ...p, status: isArchiving ? 'Archived' : 'Active' }
              : p
          )
        );
        
        alert(`Property ${action}d successfully!`);
      } catch (error: any) {
        alert(`Failed to ${action} property: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  };

  // Background refresh
  useBackgroundRefresh([['properties']], 60000);

  // Optimistic updates
  const { addOptimistic, updateOptimistic, removeOptimistic } = useOptimisticUpdate(['properties'], properties);

  if (isLoading) {
    return <SkeletonLoader type="card" count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Unable to Load Properties</h2>
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
    <div className="space-y-8">
      {/* Header */}
      <UniversalHeader
        title={t('dashboard.properties')}
        subtitle={`${t('property.manage_portfolio')} (${filteredProperties.length} properties)`}
        icon={Building2}
        stats={[
          { label: 'Total', value: stats?.totalProperties || 0, color: 'blue' },
          { label: 'Active', value: properties.filter(p => p.status !== 'Archived').length, color: 'green' },
          { label: 'Occupancy', value: `${stats?.occupancyRate || 0}%`, color: 'purple' },
          { label: 'Archived', value: properties.filter(p => p.status === 'Archived').length, color: 'yellow' }
        ]}
        actions={
          <div className="flex gap-3">
          <button
            onClick={() => setShowBulkPayment(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
          >
            <DollarSign size={16} />
            Bulk Payment
          </button>
          <button
            onClick={() => setShowBulkLeaseActions(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center gap-2"
          >
            <Calendar size={16} />
            Bulk Lease Actions
          </button>
          <button
            onClick={() => setShowUniversalExport(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="group btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 touch-feedback"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={14} className="text-white" />
            </div>
            {t('property.add_property')}
          </button>
          </div>
        }
      />

      {/* Mobile-Optimized Filter Buttons */}
      <div className="universal-mobile-filter-bar">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 universal-gradient-property rounded-xl flex items-center justify-center">
            <Filter size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Smart Filters</h3>
            <p className="text-sm text-text-secondary">Filter properties by status, occupancy, and type</p>
          </div>
        </div>
        
        <div className="universal-mobile-filter-grid">
          <button
            onClick={() => {
              setShowBulkMode(!showBulkMode);
              if (showBulkMode) {
                setSelectedProperties([]);
              }
            }}
            className={`${
              showBulkMode 
                ? 'universal-mobile-filter-btn-active bg-blue-500' 
                : 'universal-mobile-filter-btn-inactive border-blue-200 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {showBulkMode ? <CheckSquare size={16} /> : <Square size={16} />}
            <span className="text-sm font-medium">{showBulkMode ? 'Exit Bulk' : 'Bulk Select'}</span>
          </button>
          <button
            onClick={() => setShowGlobalSearch(true)}
            className="universal-mobile-filter-btn-inactive border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Search size={16} />
            <span className="text-sm font-medium hidden md:inline">Global Search</span>
            <span className="text-sm font-medium md:hidden">Search</span>
          </button>
          <button
            onClick={() => setShowVacant(!showVacant)}
            className={`${
              showVacant 
                ? 'universal-mobile-filter-btn-active bg-orange-500' 
                : 'universal-mobile-filter-btn-inactive border-orange-200 text-orange-600 hover:bg-orange-50'
            }`}
          >
            <EyeOff size={16} />
            <span className="text-sm font-medium">{showVacant ? 'Show All' : 'Vacant Only'}</span>
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`${
              showArchived 
                ? 'universal-mobile-filter-btn-active bg-gray-500' 
                : 'universal-mobile-filter-btn-inactive border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            <span className="text-sm font-medium">{showArchived ? 'Active Only' : 'Show Archived'}</span>
          </button>
        </div>
      </div>

      {/* Smart Suggestions */}
      <SmartSuggestions />

      {/* Universal Search */}
      <UniversalSearch
        onSearch={handleUniversalSearch}
        placeholder="Search properties by name or address..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Under Renovation', label: 'Under Renovation' },
          { value: 'Archived', label: 'Archived' }
        ]}
      />
      
      {/* Legacy Search & Filter */}
      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        filters={filters}
        placeholder="Additional filters..."
        filterOptions={filterOptions}
      />

      {/* Properties Grid */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="universal-grid universal-grid-3">
          {filteredProperties.map((property: any, index: number) => (
            <LazyLoader key={property._id}>
              <div className="md:hidden">
                <SwipeableCard
                  onEdit={() => handleEditProperty(property)}
                  onDelete={() => handleDeleteProperty(property._id)}
                  onView={() => window.open(`/dashboard/properties/${property._id}`, '_blank')}
                >
                  <UniversalCard delay={index * 0.1} gradient="blue" section="property">
                    <EnhancedPropertyCard 
                      property={property} 
                      index={index}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      showCheckbox={showBulkMode}
                      isSelected={selectedProperties.includes(property._id)}
                      onSelect={handlePropertySelect}
                    />
                  </UniversalCard>
                </SwipeableCard>
              </div>
              <div className="hidden md:block">
                <UniversalCard delay={index * 0.1} gradient="blue">
                  <EnhancedPropertyCard 
                    property={property} 
                    index={index}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                    showCheckbox={showBulkMode}
                    isSelected={selectedProperties.includes(property._id)}
                    onSelect={handlePropertySelect}
                  />
                </UniversalCard>
              </div>
            </LazyLoader>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="relative">
            <div className="w-32 h-32 gradient-dark-orange-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Building2 size={64} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles size={16} className="text-yellow-900" />
            </div>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
            {showArchived ? 'No Archived Properties' : t('property.no_properties_yet')}
          </h3>
          <p className="text-text-secondary mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            {showArchived 
              ? 'No properties have been archived yet. Archived properties are those no longer in active use.'
              : 'Start building your property portfolio by adding your first property. Manage tenants, payments, and maintenance all in one place.'
            }
          </p>
          {!showArchived && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="group relative btn-gradient px-10 py-5 rounded-3xl font-bold text-lg flex items-center gap-3 mx-auto shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus size={16} className="text-white" />
              </div>
              {t('property.add_first_property')}
            </button>
          )}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProperty(null);
        }}
        onPropertyUpdated={handlePropertyUpdated}
        property={editingProperty}
      />

      <BulkActions
        selectedItems={selectedProperties}
        totalItems={filteredProperties?.length || 0}
        onSelectAll={() => setSelectedProperties(filteredProperties?.map((p: any) => p._id) || [])}
        onClearSelection={() => setSelectedProperties([])}
        actions={bulkActions}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        section="properties"
        title="Properties"
      />

      <BulkPaymentModal
        isOpen={showBulkPayment}
        onClose={() => setShowBulkPayment(false)}
      />
      
      <UniversalExport
        isOpen={showUniversalExport}
        onClose={() => setShowUniversalExport(false)}
        data={filteredProperties}
        filename="properties"
        filters={searchFilters}
        title="Properties Report"
        organizationName={user?.organization?.name || user?.name + "'s Organization" || "Your Organization"}
      />

      {/* Global Search Modal */}
      <UniversalGlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
      
      <BulkLeaseActions
        isOpen={showBulkLeaseActions}
        onClose={() => setShowBulkLeaseActions(false)}
        selectedProperties={filteredProperties.filter(p => selectedProperties.includes(p._id))}
        onAction={async (action, data) => {
          try {
            if (action === 'bulk_renewal') {
              // Handle bulk lease renewal
              await Promise.all(data.properties.map(async (propertyId: string) => {
                const { data: tenantsData } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
                const tenants = tenantsData.data || [];
                return Promise.all(tenants.map((tenant: any) => {
                  const currentEndDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : new Date();
                  const newEndDate = new Date(data.startDate || currentEndDate);
                  newEndDate.setMonth(newEndDate.getMonth() + parseInt(data.duration));
                  const rentIncrease = parseFloat(data.rentIncrease) / 100;
                  const newRent = tenant.rentAmount * (1 + rentIncrease);
                  return apiClient.put(`/tenants/${tenant._id}`, {
                    leaseEndDate: newEndDate.toISOString().split('T')[0],
                    rentAmount: newRent
                  });
                }));
              }));
              alert(`Leases renewed for ${data.properties.length} properties!`);
            } else if (action === 'bulk_increase') {
              // Handle bulk rent increase
              await Promise.all(data.properties.map(async (propertyId: string) => {
                const { data: tenantsData } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
                const tenants = tenantsData.data || [];
                return Promise.all(tenants.map((tenant: any) => {
                  const increase = parseFloat(data.percentage) / 100;
                  const newRent = tenant.rentAmount * (1 + increase);
                  return apiClient.put(`/tenants/${tenant._id}`, {
                    rentAmount: newRent,
                    rentIncreaseDate: data.effectiveDate
                  });
                }));
              }));
              alert(`Rent increased by ${data.percentage}% for ${data.properties.length} properties!`);
            } else if (action === 'bulk_termination') {
              // Handle bulk lease termination
              await Promise.all(data.properties.map(async (propertyId: string) => {
                const { data: tenantsData } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
                const tenants = tenantsData.data || [];
                return Promise.all(tenants.map((tenant: any) => 
                  apiClient.put(`/tenants/${tenant._id}`, {
                    status: 'Inactive',
                    leaseEndDate: data.terminationDate
                  })
                ));
              }));
              alert(`Leases terminated for ${data.properties.length} properties!`);
            }
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setShowBulkLeaseActions(false);
          } catch (error) {
            alert('Failed to complete bulk lease action');
          }
        }}
      />
      
      {/* Universal Mobile FAB */}
      <div className="universal-mobile-fab-property">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-full flex items-center justify-center group"
        >
          <Plus size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-orange/5 to-brand-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/3 to-pink-500/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PropertiesPage;