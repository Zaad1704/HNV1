import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import LazyLoader from '../components/common/LazyLoader';
import SkeletonLoader from '../components/common/SkeletonLoader';
import SwipeableCard from '../components/mobile/SwipeableCard';
import { useBackgroundRefresh } from '../hooks/useBackgroundRefresh';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Phone, MapPin, Calendar, DollarSign, Download, FileText, Search, Filter, Archive, ArchiveRestore, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import ExportModal from '../components/common/ExportModal';
import MonthlyCollectionSheet from '../components/common/MonthlyCollectionSheet';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import MessageButtons from '../components/common/MessageButtons';
import ShareButton from '../components/common/ShareButton';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import ComprehensiveTenantModal from '../components/common/ComprehensiveTenantModal';
import EnhancedTenantCard from '../components/common/EnhancedTenantCard';
import UniversalHeader from '../components/common/UniversalHeader';
import UniversalCard from '../components/common/UniversalCard';
import TenantInsightsPanel from '../components/tenant/TenantInsightsPanel';
import TenantSmartFilters from '../components/tenant/TenantSmartFilters';
import TenantPredictiveSearch from '../components/tenant/TenantPredictiveSearch';
import TenantAdvancedSearch from '../components/tenant/TenantAdvancedSearch';
import TenantBulkActions from '../components/tenant/TenantBulkActions';
import TenantAutomationRules from '../components/tenant/TenantAutomationRules';
import TenantWorkflowManager from '../components/tenant/TenantWorkflowManager';
import { useCrossData } from '../hooks/useCrossData';
import { useDataExport } from '../hooks/useDataExport';
import { useQueryClient } from '@tanstack/react-query';
import { deleteTenant, confirmDelete, handleDeleteError, handleDeleteSuccess } from '../utils/deleteHelpers';
import AddTenantDebug from '../components/debug/AddTenantDebug';

const fetchTenants = async (propertyId?: string) => {
  try {
    const url = propertyId ? `/tenants?propertyId=${propertyId}` : '/tenants';
    const { data } = await apiClient.get(url);
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return [];
  }
};

const TenantsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const unitParam = searchParams.get('unit');
  const { stats } = useCrossData() || {};
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [showUniversalExport, setShowUniversalExport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Auto-open modal if propertyId or unit is in URL
  React.useEffect(() => {
    if (propertyId || unitParam) {
      setShowAddModal(true);
    }
  }, [propertyId, unitParam]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showLateOnly, setShowLateOnly] = useState(false);
  const [showExpiringLeases, setShowExpiringLeases] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [smartFilters, setSmartFilters] = useState<any>({});
  const [advancedSearchCriteria, setAdvancedSearchCriteria] = useState<any>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const { exportTenants, isExporting } = useDataExport() || { exportTenants: () => {}, isExporting: false };

  const handleTenantAdded = async (newTenant: any) => {
    console.log('🔍 Tenant added callback called:', newTenant);
    try {
      if (newTenant) {
        queryClient.setQueryData(['tenants'], (old: any) => [...(old || []), newTenant]);
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
        queryClient.invalidateQueries({ queryKey: ['crossData'] });
        console.log('✅ Tenant data updated');
      }
      setShowAddModal(false);
      console.log('✅ Modal closed after tenant added');
    } catch (error) {
      console.error('❌ Error handling tenant added:', error);
      setShowAddModal(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (confirmDelete(tenantName, 'tenant')) {
      try {
        await deleteTenant(tenantId);
        queryClient.setQueryData(['tenants'], (old: any) => 
          (old || []).filter((t: any) => t._id !== tenantId)
        );
        handleDeleteSuccess('tenant');
      } catch (error: any) {
        handleDeleteError(error, 'tenant');
      }
    }
  };
  
  const handleArchiveTenant = async (tenantId: string, tenantName: string, currentStatus: string) => {
    const isArchiving = currentStatus !== 'Archived';
    const action = isArchiving ? 'archive' : 'restore';
    
    if (confirm(`Are you sure you want to ${action} ${tenantName}?`)) {
      try {
        await apiClient.put(`/tenants/${tenantId}`, {
          status: isArchiving ? 'Archived' : 'Active'
        });
        
        queryClient.setQueryData(['tenants'], (old: any) => 
          (old || []).map((t: any) => 
            t._id === tenantId 
              ? { ...t, status: isArchiving ? 'Archived' : 'Active' }
              : t
          )
        );
        
        alert(`Tenant ${action}d successfully!`);
      } catch (error: any) {
        alert(`Failed to ${action} tenant: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  };

  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['tenants', propertyId],
    queryFn: () => fetchTenants(propertyId || undefined),
    retry: 0,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Tenants query error:', error);
    }
  });

  // Fetch properties for filtering
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/properties');
        return data.data || [];
      } catch (error) {
        return [];
      }
    }
  });

  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    
    let filtered = tenants.filter((tenant: any) => {
      if (!tenant) return false;
      
      // Archive filter
      const isArchived = tenant.status === 'Archived';
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;
      
      // Quick filters
      if (showLateOnly && tenant.status !== 'Late') return false;
      if (showExpiringLeases) {
        if (!tenant.leaseEndDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry > 30) return false;
      }
      if (selectedProperty && tenant.propertyId?._id !== selectedProperty) return false;
      
      // Smart filters
      if (smartFilters.paymentStatus?.length > 0) {
        const tenantPaymentStatus = tenant.status === 'Active' ? 'current' : 
                                   tenant.status === 'Late' ? 'late' : 'partial';
        if (!smartFilters.paymentStatus.includes(tenantPaymentStatus)) return false;
      }
      
      if (smartFilters.property?.length > 0) {
        if (!smartFilters.property.includes(tenant.propertyId?.name)) return false;
      }
      
      // Advanced search criteria
      if (advancedSearchCriteria.query) {
        const query = advancedSearchCriteria.query.toLowerCase();
        const matches = (tenant.name?.toLowerCase().includes(query)) ||
                       (tenant.email?.toLowerCase().includes(query)) ||
                       (tenant.phone?.includes(query)) ||
                       (tenant.unit?.toLowerCase().includes(query)) ||
                       (tenant.propertyId?.name?.toLowerCase().includes(query));
        if (!matches) return false;
      }
      
      if (advancedSearchCriteria.rentRange) {
        const rent = tenant.rentAmount || 0;
        if (rent < advancedSearchCriteria.rentRange.min || rent > advancedSearchCriteria.rentRange.max) return false;
      }
      
      // Legacy filters
      const matchesUniversalSearch = !searchFilters.query || 
        (tenant.name && tenant.name.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (tenant.email && tenant.email.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (tenant.unit && tenant.unit.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (tenant.propertyId?.name && tenant.propertyId.name.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      const matchesSearch = !searchQuery || 
        (tenant.name && tenant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.email && tenant.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.unit && tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = (!filters.status || tenant.status === filters.status) &&
                           (!searchFilters.status || tenant.status === searchFilters.status);
      const matchesProperty = !filters.property || tenant.propertyId?._id === filters.property;
      
      return matchesUniversalSearch && matchesSearch && matchesStatus && matchesProperty;
    });
    
    // Apply sorting from advanced search
    if (advancedSearchCriteria.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (advancedSearchCriteria.sortBy) {
          case 'name':
            aValue = a.name || '';
            bValue = b.name || '';
            break;
          case 'rentAmount':
            aValue = a.rentAmount || 0;
            bValue = b.rentAmount || 0;
            break;
          case 'leaseStartDate':
            aValue = new Date(a.leaseStartDate || 0);
            bValue = new Date(b.leaseStartDate || 0);
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          default:
            aValue = a.name || '';
            bValue = b.name || '';
        }
        
        if (advancedSearchCriteria.sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    return filtered;
  }, [tenants, searchQuery, filters, searchFilters, showArchived, showLateOnly, showExpiringLeases, selectedProperty, smartFilters, advancedSearchCriteria]);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Late', label: 'Late' }
      ]
    },
    {
      key: 'property',
      label: 'Property',
      type: 'select' as const,
      options: properties.map((p: any) => ({ value: p._id, label: p.name }))
    }
  ];

  const bulkActions = [
    {
      key: 'export',
      label: 'Export',
      icon: Download,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: async (ids: string[]) => {
        await exportTenants({ format: 'xlsx', filters: { ids } });
      }
    },
    {
      key: 'contact',
      label: 'Send Notice',
      icon: Mail,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: (ids: string[]) => {

      }
    }
  ];

  // Background refresh
  useBackgroundRefresh([['tenants']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={6} />;
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
    <div className="space-y-8">
      <UniversalHeader
        title="Tenants"
        subtitle={propertyId ? 'Tenants for selected property' : 'Manage your tenant relationships'}
        icon={Users}
        stats={[
          { label: 'Total', value: stats?.totalTenants || 0, color: 'blue' },
          { label: 'Active', value: filteredTenants.filter(t => t.status !== 'Archived').length, color: 'green' },
          { label: 'Late', value: tenants.filter(t => t.status === 'Late').length, color: 'red' },
          { label: 'Archived', value: tenants.filter(t => t.status === 'Archived').length, color: 'yellow' }
        ]}
        actions={
          <div className="flex gap-3">
          <button
            onClick={() => {
              setShowBulkMode(!showBulkMode);
              if (showBulkMode) {
                setSelectedTenants([]);
              }
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              showBulkMode 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Eye size={16} />
            {showBulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
          </button>
          <button
            onClick={() => setShowQuickPayment(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
          >
            <DollarSign size={16} />
            Quick Payment
          </button>
          <button
            onClick={() => setShowCollectionSheet(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center gap-2"
          >
            <FileText size={16} />
            Collection Sheet
          </button>
          <button
            onClick={() => setShowUniversalExport(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddModal(true);
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
          >
            Add Tenant
          </button>
          </div>
        }
      />

      {/* Enhanced Smart Filter Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Filter size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Smart Filters</h3>
            <p className="text-sm text-text-secondary">Filter tenants by status, lease expiry, and property</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setShowLateOnly(!showLateOnly)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
              showLateOnly 
                ? 'bg-red-500 text-white shadow-lg scale-105' 
                : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
            }`}
          >
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">{showLateOnly ? 'All Tenants' : 'Late Payments'}</span>
          </button>
          
          <button
            onClick={() => setShowExpiringLeases(!showExpiringLeases)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
              showExpiringLeases 
                ? 'bg-orange-500 text-white shadow-lg scale-105' 
                : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            <Calendar size={16} />
            <span className="text-sm font-medium">{showExpiringLeases ? 'All Leases' : 'Expiring Soon'}</span>
          </button>
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
              showArchived 
                ? 'bg-gray-500 text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            <span className="text-sm font-medium">{showArchived ? 'Active Only' : 'Show Archived'}</span>
          </button>
          
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
          >
            <option value="">All Properties ({properties.length})</option>
            {properties.map((property: any) => (
              <option key={property._id} value={property._id}>
                {property.name} ({tenants.filter((t: any) => t.propertyId?._id === property._id).length})
              </option>
            ))}
          </select>
        </div>
        
        {/* Active Filters Display */}
        {(showLateOnly || showExpiringLeases || showArchived || selectedProperty) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-text-secondary">Active filters:</span>
            {showLateOnly && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                Late Payments
                <button onClick={() => setShowLateOnly(false)} className="ml-1 hover:bg-red-200 rounded-full p-0.5">
                  ×
                </button>
              </span>
            )}
            {showExpiringLeases && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1">
                Expiring Leases
                <button onClick={() => setShowExpiringLeases(false)} className="ml-1 hover:bg-orange-200 rounded-full p-0.5">
                  ×
                </button>
              </span>
            )}
            {showArchived && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center gap-1">
                Archived
                <button onClick={() => setShowArchived(false)} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  ×
                </button>
              </span>
            )}
            {selectedProperty && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
                {properties.find((p: any) => p._id === selectedProperty)?.name}
                <button onClick={() => setSelectedProperty('')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setShowLateOnly(false);
                setShowExpiringLeases(false);
                setShowArchived(false);
                setSelectedProperty('');
              }}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Tenant Insights Panel */}
      {filteredTenants.length > 0 && (
        <TenantInsightsPanel tenants={filteredTenants} />
      )}

      {/* Predictive Search */}
      <TenantPredictiveSearch
        tenants={tenants}
        onTenantSelect={(tenant) => {
          window.location.href = `/dashboard/tenants/${tenant._id}`;
        }}
      />

      {/* Smart Filters */}
      <TenantSmartFilters
        tenants={tenants}
        onFiltersChange={setSmartFilters}
        activeFilters={smartFilters}
      />

      {/* Advanced Search Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            showAdvancedSearch
              ? 'bg-purple-500 text-white'
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
          }`}
        >
          <Search size={16} />
          {showAdvancedSearch ? 'Hide Advanced Search' : 'Advanced Search'}
        </button>
      </div>

      {/* Advanced Search */}
      {showAdvancedSearch && (
        <TenantAdvancedSearch
          onSearch={setAdvancedSearchCriteria}
          tenants={tenants}
        />
      )}

      {filteredTenants && filteredTenants.length > 0 ? (
        <div className="universal-grid universal-grid-3">
          {filteredTenants.map((tenant: any, index: number) => (
            <LazyLoader key={tenant._id}>
              <div className="md:hidden">
                <SwipeableCard
                  onEdit={() => console.log('Edit tenant', tenant._id)}
                  onDelete={() => handleDeleteTenant(tenant._id, tenant.name)}
                  onView={() => window.open(`/dashboard/tenants/${tenant._id}`, '_blank')}
                >
                  <UniversalCard delay={index * 0.1} gradient="green">
                    <EnhancedTenantCard 
                      tenant={tenant} 
                      index={index}
                      onEdit={(t) => console.log('Edit tenant', t._id)}
                      onDelete={() => handleDeleteTenant(tenant._id, tenant.name)}
                      showCheckbox={showBulkMode}
                      isSelected={selectedTenants.includes(tenant._id)}
                      onSelect={(tenantId, selected) => {
                        if (selected) {
                          setSelectedTenants(prev => [...prev, tenantId]);
                        } else {
                          setSelectedTenants(prev => prev.filter(id => id !== tenantId));
                        }
                      }}
                    />
                  </UniversalCard>
                </SwipeableCard>
              </div>
              <div className="hidden md:block">
                <UniversalCard delay={index * 0.1} gradient="green">
                  <EnhancedTenantCard 
                    tenant={tenant} 
                    index={index}
                    onEdit={(t) => console.log('Edit tenant', t._id)}
                    onDelete={() => handleDeleteTenant(tenant._id, tenant.name)}
                    showCheckbox={showBulkMode}
                    isSelected={selectedTenants.includes(tenant._id)}
                    onSelect={(tenantId, selected) => {
                      if (selected) {
                        setSelectedTenants(prev => [...prev, tenantId]);
                      } else {
                        setSelectedTenants(prev => prev.filter(id => id !== tenantId));
                      }
                    }}
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
              <Users size={64} className="text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
            No Tenants Found
          </h3>
          <p className="text-text-secondary mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            Start by adding your first tenant to begin managing your rental properties.
          </p>
        </div>
      )}



      {/* Enhanced Bulk Actions */}
      {selectedTenants.length > 0 && (
        <TenantBulkActions
          selectedTenants={selectedTenants}
          tenants={tenants}
          onAction={async (action, data) => {
            console.log('Bulk action:', action, data);
            // Handle bulk actions here
            switch (action) {
              case 'rent_increase':
                alert(`Rent increase applied to ${data.tenantIds.length} tenants`);
                break;
              case 'lease_renewal':
                alert(`Lease renewal notices sent to ${data.tenantIds.length} tenants`);
                break;
              case 'payment_reminder':
                alert(`Payment reminders sent to ${data.tenantIds.length} tenants`);
                break;
              default:
                console.log('Unhandled action:', action);
            }
          }}
          onClearSelection={() => setSelectedTenants([])}
        />
      )}

      {/* Automation Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAutomation(!showAutomation)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            showAutomation
              ? 'bg-purple-500 text-white'
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
          }`}
        >
          <span>{showAutomation ? 'Hide Automation' : 'Show Automation'}</span>
        </button>
      </div>

      {/* Automation Components */}
      {showAutomation && (
        <div className="space-y-6">
          <TenantAutomationRules
            tenants={tenants}
            onRuleCreate={(rule) => {
              console.log('Create rule:', rule);
              alert('Automation rule created successfully!');
            }}
            onRuleUpdate={(id, rule) => {
              console.log('Update rule:', id, rule);
              alert('Automation rule updated successfully!');
            }}
            onRuleDelete={(id) => {
              console.log('Delete rule:', id);
              alert('Automation rule deleted successfully!');
            }}
          />
          
          <TenantWorkflowManager
            tenants={tenants}
            onWorkflowCreate={(workflow) => {
              console.log('Create workflow:', workflow);
              alert('Workflow created successfully!');
            }}
            onWorkflowUpdate={(id, workflow) => {
              console.log('Update workflow:', id, workflow);
              alert('Workflow updated successfully!');
            }}
          />
        </div>
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        section="tenants"
        title="Tenants"
      />

      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
      />

      <QuickPaymentModal
        isOpen={showQuickPayment}
        onClose={() => setShowQuickPayment(false)}
      />
      
      <UniversalExport
        isOpen={showUniversalExport}
        onClose={() => setShowUniversalExport(false)}
        data={filteredTenants}
        filename="tenants"
        filters={searchFilters}
        title="Export Tenants"
      />

      {showAddModal && (
        <ComprehensiveTenantModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onTenantAdded={handleTenantAdded}
        />
      )}
      
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-16 h-16 bg-blue-500 rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>
      
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-orange/5 to-brand-blue/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Debug Component - Remove in production */}
      {process.env.NODE_ENV === 'development' && <AddTenantDebug />}
    </div>
  );
};

export default TenantsPage;