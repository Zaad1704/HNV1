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
    
    return tenants.filter((tenant: any) => {
      if (!tenant) return false;
      
      // Archive filter
      const isArchived = tenant.status === 'Archived';
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;
      
      // Late payment filter
      if (showLateOnly && tenant.status !== 'Late') return false;
      
      // Expiring lease filter
      if (showExpiringLeases) {
        if (!tenant.leaseEndDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry > 30) return false;
      }
      
      // Property filter
      if (selectedProperty && tenant.propertyId?._id !== selectedProperty) return false;
      
      // Universal search
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
  }, [tenants, searchQuery, filters, searchFilters, showArchived, showLateOnly, showExpiringLeases, selectedProperty]);

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
            onClick={() => {
              console.log('🔍 Add Tenant button clicked');
              try {
                console.log('🔍 Setting modal to true');
                setShowAddModal(true);
                console.log('✅ Modal state set successfully');
              } catch (error) {
                console.error('❌ Error opening add tenant modal:', error);
                alert('Error opening modal: ' + error.message);
              }
            }}
            className="group btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={14} className="text-white" />
            </div>
            Add Tenant
          </button>
          </div>
        }
      />

      {/* Advanced Filter Buttons */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setShowLateOnly(!showLateOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            showLateOnly 
              ? 'bg-red-500 text-white' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <AlertTriangle size={16} />
          {showLateOnly ? 'Show All' : 'Late Payments Only'}
        </button>
        
        <button
          onClick={() => setShowExpiringLeases(!showExpiringLeases)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            showExpiringLeases 
              ? 'bg-orange-500 text-white' 
              : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
          }`}
        >
          <Calendar size={16} />
          {showExpiringLeases ? 'Show All' : 'Expiring Leases'}
        </button>
        
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            showArchived 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          {showArchived ? 'Show Active' : 'Show Archived'}
        </button>
        
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Properties ({properties.length})</option>
          {properties.map((property: any) => (
            <option key={property._id} value={property._id}>
              {property.name} ({tenants.filter((t: any) => t.propertyId?._id === property._id).length} tenants)
            </option>
          ))}
        </select>
      </div>

      {/* Universal Search */}
      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search tenants by name, email, unit, or property..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Late', label: 'Late Payment' },
          { value: 'Archived', label: 'Archived' }
        ]}
      />

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
                    <EnhancedTenantCard tenant={tenant} index={index} />
                  </UniversalCard>
                </SwipeableCard>
              </div>
              <div className="hidden md:block">
                <UniversalCard delay={index * 0.1} gradient="green">
                  <EnhancedTenantCard tenant={tenant} index={index} />
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



      <BulkActions
        selectedItems={selectedTenants}
        totalItems={filteredTenants?.length || 0}
        onSelectAll={() => setSelectedTenants(filteredTenants?.map((t: any) => t._id) || [])}
        onClearSelection={() => setSelectedTenants([])}
        actions={bulkActions}
      />

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
          onClose={() => {
            console.log('🔍 Modal closing');
            setShowAddModal(false);
            // Clear URL params when closing modal
            if (propertyId || unitParam) {
              try {
                const url = new URL(window.location.href);
                url.searchParams.delete('propertyId');
                url.searchParams.delete('unit');
                window.history.replaceState({}, '', url.toString());
                console.log('✅ URL params cleared');
              } catch (error) {
                console.error('❌ Error clearing URL params:', error);
              }
            }
          }}
          onTenantAdded={handleTenantAdded}
        />
      )}
      
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => {
            try {
              setShowAddModal(true);
            } catch (error) {
              console.error('Error opening add tenant modal:', error);
            }
          }}
          className="w-16 h-16 gradient-dark-orange-blue rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
        >
          <Plus size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
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