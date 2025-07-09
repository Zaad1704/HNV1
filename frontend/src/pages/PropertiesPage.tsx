import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Building2, Plus, MapPin, Users, Edit, Trash2, Eye, Download, Mail, DollarSign, Archive, ArchiveRestore, EyeOff, Sparkles } from 'lucide-react';
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
import { useCrossData } from '../hooks/useCrossData';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDataExport } from '../hooks/useDataExport';
import { useAuthStore } from '../store/authStore';
import ExportModal from '../components/common/ExportModal';
import MessageButtons from '../components/common/MessageButtons';
import ShareButton from '../components/common/ShareButton';

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
  const queryClient = useQueryClient();
  const { exportProperties, isExporting } = useDataExport() || { exportProperties: () => {}, isExporting: false };

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    retry: 0,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Properties query error:', error);
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
      try {
        await apiClient.delete(`/properties/${propertyId}`);
        queryClient.setQueryData(['properties'], (old: any) => 
          (old || []).filter((p: any) => p._id !== propertyId)
        );
        alert('Property deleted successfully!');
      } catch (error: any) {
        alert(`Error: ${error.response?.data?.message || 'Failed to delete property'}`);
      }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">{t('property.loading_properties')}</span>
      </div>
    );
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
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkPayment(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
          >
            <DollarSign size={16} />
            Bulk Payment
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
      </div>

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
            <EnhancedPropertyCard
              key={property._id}
              property={property}
              index={index}
            />

            </motion.div>
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
      
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-16 h-16 gradient-dark-orange-blue rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
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