import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import LazyLoader from '../components/common/LazyLoader';
import SkeletonLoader from '../components/common/SkeletonLoader';
import SwipeableCard from '../components/mobile/SwipeableCard';
import Phase3MobileHeader from '../components/mobile/Phase3MobileHeader';
import Phase3TabFilters, { getTenantFilterTabs } from '../components/mobile/Phase3TabFilters';
import Phase3SwipeableCard from '../components/mobile/Phase3SwipeableCard';
import Phase3BottomSheet from '../components/mobile/Phase3BottomSheet';
import Phase3RightSidebar, { createSmartFiltersSection, createAIInsightsSection } from '../components/mobile/Phase3RightSidebar';
import { useBackgroundRefresh } from '../hooks/useBackgroundRefresh';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Phone, MapPin, Calendar, DollarSign, Download, FileText, Search, Filter, Archive, ArchiveRestore, Eye, EyeOff, AlertTriangle, Sparkles, CheckSquare, Square } from 'lucide-react';
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showMobileInsights, setShowMobileInsights] = useState(false);
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
      {/* Desktop Header - unchanged */}
      <div className="hidden md:block">
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
      </div>

      {/* Phase 3 Mobile Header */}
      <div className="md:hidden">
        <Phase3MobileHeader
          title="Tenants"
          count={filteredTenants.length}
          stats={[
            { label: 'Active', value: filteredTenants.filter(t => t.status !== 'Archived').length, color: 'green' },
            { label: 'Late', value: tenants.filter(t => t.status === 'Late').length, color: 'red' }
          ]}
          onExport={() => setShowUniversalExport(true)}
          onQuickAction={() => setShowQuickPayment(true)}
          onFilter={() => setShowMobileFilters(!showMobileFilters)}
          showFilters={showMobileFilters}
          activeFiltersCount={[showLateOnly, showExpiringLeases, showArchived, showBulkMode, selectedProperty].filter(Boolean).length}
        />
      </div>

      {/* Phase 3 Mobile Tab Filters */}
      <div className="md:hidden">
        <Phase3TabFilters
          tabs={getTenantFilterTabs(
            showLateOnly,
            showExpiringLeases,
            showArchived,
            showBulkMode,
            tenants.filter(t => t.status === 'Late').length,
            tenants.filter(t => {
              if (!t.leaseEndDate) return false;
              const daysUntilExpiry = Math.ceil((new Date(t.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            }).length,
            tenants.filter(t => t.status === 'Archived').length
          )}
          onTabClick={(key) => {
            switch (key) {
              case 'all':
                setShowLateOnly(false);
                setShowExpiringLeases(false);
                setShowArchived(false);
                setShowBulkMode(false);
                setSelectedTenants([]);
                break;
              case 'late':
                setShowLateOnly(!showLateOnly);
                setShowExpiringLeases(false);
                setShowArchived(false);
                break;
              case 'expiring':
                setShowExpiringLeases(!showExpiringLeases);
                setShowLateOnly(false);
                setShowArchived(false);
                break;
              case 'archived':
                setShowArchived(!showArchived);
                setShowLateOnly(false);
                setShowExpiringLeases(false);
                break;
              case 'bulk':
                setShowBulkMode(!showBulkMode);
                if (showBulkMode) setSelectedTenants([]);
                break;
            }
          }}
        />
      </div>



      {/* Desktop Layout with Right Sidebar */}
      <div className="hidden md:block">
        <div className="phase3-desktop-layout">
          {/* Main Content Area */}
          <div className="phase3-main-content space-y-6">

            {/* Desktop Only - Predictive Search and Advanced Search */}
            <div className="space-y-6">
              <TenantPredictiveSearch
                tenants={tenants}
                onTenantSelect={(tenant) => {
                  window.location.href = `/dashboard/tenants/${tenant._id}`;
                }}
              />

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

              {showAdvancedSearch && (
                <TenantAdvancedSearch
                  onSearch={setAdvancedSearchCriteria}
                  tenants={tenants}
                />
              )}
            </div>

            {/* Tenants Grid */}
            {filteredTenants && filteredTenants.length > 0 ? (
              <div className="phase3-card-grid">
                {filteredTenants.map((tenant: any, index: number) => (
                  <LazyLoader key={tenant._id}>
                    <div className="phase3-card-wider">
                      <UniversalCard delay={index * 0.1} gradient="green" section="tenant">
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
          </div>
          
          {/* Phase 3 Right Sidebar */}
          <Phase3RightSidebar
            sections={[
              createSmartFiltersSection(
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowLateOnly(!showLateOnly)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        showLateOnly 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                      }`}
                    >
                      <AlertTriangle size={14} />
                      {showLateOnly ? 'All Tenants' : 'Late Payments'}
                    </button>
                    
                    <button
                      onClick={() => setShowExpiringLeases(!showExpiringLeases)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        showExpiringLeases 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      <Calendar size={14} />
                      {showExpiringLeases ? 'All Leases' : 'Expiring Soon'}
                    </button>
                    
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        showArchived 
                          ? 'bg-gray-500 text-white' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {showArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                      {showArchived ? 'Active Only' : 'Show Archived'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowBulkMode(!showBulkMode);
                        if (showBulkMode) setSelectedTenants([]);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        showBulkMode 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {showBulkMode ? <CheckSquare size={14} /> : <Square size={14} />}
                      {showBulkMode ? 'Exit Bulk' : 'Bulk Select'}
                    </button>
                  </div>
                  
                  {properties.length > 0 && (
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Properties ({properties.length})</option>
                      {properties.map((property: any) => (
                        <option key={property._id} value={property._id}>
                          {property.name} ({tenants.filter((t: any) => t.propertyId?._id === property._id).length})
                        </option>
                      ))}
                    </select>
                  )}
                </div>,
                true
              ),
              createAIInsightsSection(
                filteredTenants.length > 0 ? (
                  <TenantInsightsPanel tenants={filteredTenants} className="border-0 bg-transparent p-0" />
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Add tenants to see AI insights
                  </div>
                ),
                false
              )
            ]}
          />
        </div>
      </div>



      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Mobile Collapsible Insights */}
        {filteredTenants.length > 0 && (
          <div className="px-4">
            <div className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileInsights(!showMobileInsights)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">AI Insights</div>
                    <div className="text-xs text-gray-600">Portfolio analysis</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${showMobileInsights ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showMobileInsights && (
                <div className="border-t border-gray-200">
                  <TenantInsightsPanel tenants={filteredTenants} className="border-0 bg-transparent" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tenants Grid */}
        {filteredTenants && filteredTenants.length > 0 ? (
          <div className="phase3-card-grid px-4">
            {filteredTenants.map((tenant: any, index: number) => (
              <LazyLoader key={tenant._id}>
                <Phase3SwipeableCard
                  onEdit={() => console.log('Edit tenant', tenant._id)}
                  onDelete={() => handleDeleteTenant(tenant._id, tenant.name)}
                  onView={() => window.open(`/dashboard/tenants/${tenant._id}`, '_blank')}
                >
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
                </Phase3SwipeableCard>
              </LazyLoader>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="relative">
              <div className="w-32 h-32 gradient-dark-orange-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Users size={64} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
              No Tenants Found
            </h3>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto leading-relaxed">
              Start by adding your first tenant to begin managing your rental properties.
            </p>
          </div>
        )}
      </div>

      {/* Desktop Only - Bulk Actions and Automation */}
      <div className="hidden md:block space-y-8">
        {selectedTenants.length > 0 && (
          <TenantBulkActions
            selectedTenants={selectedTenants}
            tenants={tenants}
            onAction={async (action, data) => {
              console.log('Bulk action:', action, data);
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
      </div>

      {/* Mobile Bulk Actions Bottom Sheet */}
      {selectedTenants.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">{selectedTenants.length} selected</span>
            <button
              onClick={() => setSelectedTenants([])}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUniversalExport(true)}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Export
            </button>
            <button
              onClick={() => alert('Send notice to selected tenants')}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Message
            </button>
          </div>
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
      
      {/* Phase 3 Mobile FAB */}
      <div className={`phase3-mobile-fab-tenant ${
        selectedTenants.length > 0 ? 'bottom-24' : 'bottom-6'
      }`}>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-full flex items-center justify-center group"
          aria-label="Add Tenant"
        >
          <Plus size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Mobile Bottom Sheet for Actions */}
      <Phase3BottomSheet
        isOpen={showMobileActions}
        onClose={() => setShowMobileActions(false)}
        title="Quick Actions"
        height="auto"
      >
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowQuickPayment(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-primary w-full"
          >
            <DollarSign size={20} />
            <span className="ml-2">Quick Payment</span>
          </button>
          
          <button
            onClick={() => {
              setShowCollectionSheet(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-secondary w-full"
          >
            <FileText size={20} />
            <span className="ml-2">Collection Sheet</span>
          </button>
          
          <button
            onClick={() => {
              setShowUniversalExport(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-secondary w-full"
          >
            <Download size={20} />
            <span className="ml-2">Export Tenants</span>
          </button>
        </div>
      </Phase3BottomSheet>
      
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