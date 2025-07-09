import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Phone, MapPin, Calendar, DollarSign, Download, FileText, Search, Filter, Archive, ArchiveRestore, Eye, EyeOff } from 'lucide-react';
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
import { useCrossData } from '../hooks/useCrossData';
import { useDataExport } from '../hooks/useDataExport';
import { useQueryClient } from '@tanstack/react-query';
import { deleteTenant, confirmDelete, handleDeleteError, handleDeleteSuccess } from '../utils/deleteHelpers';

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
  const { stats } = useCrossData();
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [showUniversalExport, setShowUniversalExport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showArchived, setShowArchived] = useState(false);
  const { exportTenants, isExporting } = useDataExport() || { exportTenants: () => {}, isExporting: false };

  const handleTenantAdded = (newTenant: any) => {
    queryClient.setQueryData(['tenants'], (old: any) => [...(old || []), newTenant]);
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

  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    
    return tenants.filter((tenant: any) => {
      if (!tenant) return false;
      
      // Archive filter
      const isArchived = tenant.status === 'Archived';
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;
      
      const matchesSearch = !searchQuery || 
        (tenant.name && tenant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.email && tenant.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.unit && tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = !filters.status || tenant.status === filters.status;
      const matchesProperty = !filters.property || tenant.propertyId?._id === filters.property;
      
      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [tenants, searchQuery, filters, showArchived]);

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
            onClick={() => setShowAddModal(true)}
            className="group btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={14} className="text-white" />
            </div>
            Add Tenant
          </button>
        </div>
      </div>

      {/* Universal Search */}
      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search tenants by name, email, or property..."
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
            <EnhancedTenantCard
              key={tenant._id}
              tenant={tenant}
              index={index}
            />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              
              {/* Selection Checkbox */}
              <div className="absolute top-4 right-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedTenants.includes(tenant._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTenants(prev => [...prev, tenant._id]);
                    } else {
                      setSelectedTenants(prev => prev.filter(id => id !== tenant._id));
                    }
                  }}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-brand-blue focus:ring-brand-blue transition-colors"
                />
              </div>
              
              {/* Header */}
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 gradient-dark-orange-blue rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {tenant.name ? tenant.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-brand-blue transition-colors">
                      {tenant.name || 'Unknown'}
                    </h3>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      tenant.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : tenant.status === 'Archived'
                        ? 'bg-gray-100 text-gray-800'
                        : tenant.status === 'Late'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status === 'Archived' && <Archive size={10} className="mr-1" />}
                      {tenant.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="relative z-10 space-y-4 mb-6">
                <div className="bg-app-bg/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail size={14} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-text-primary font-medium truncate">{tenant.email || 'No email'}</span>
                  </div>
                  {tenant.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone size={14} className="text-green-600" />
                      </div>
                      <span className="text-sm text-text-primary font-medium">{tenant.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm text-text-primary font-medium truncate">
                      Unit {tenant.unit || 'N/A'} • {tenant.propertyId?.name || 'No property'}
                    </span>
                  </div>
                </div>
                
                {/* Rent Amount Highlight */}
                {tenant.rentAmount && (
                  <div className="bg-gradient-to-r from-brand-blue via-purple-600 to-brand-orange p-4 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <DollarSign size={14} />
                        </div>
                        <span className="text-sm font-medium">Monthly Rent</span>
                      </div>
                      <span className="text-xl font-bold group-hover:scale-110 transition-transform duration-300">${tenant.rentAmount}</span>
                    </div>
                  </div>
                )}
                
                {tenant.leaseEndDate && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                    <Calendar size={14} className="text-yellow-600" />
                    <span className="text-sm text-yellow-800 font-medium">
                      Lease ends: {new Date(tenant.leaseEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="relative z-10 flex flex-col gap-3">
                <Link 
                  to={`/dashboard/tenants/${tenant._id}`}
                  className="w-full gradient-dark-orange-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center group-hover:scale-105 transform hover:shadow-brand-blue/25 relative overflow-hidden"
                >
                  <span className="relative z-10">View Details</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleArchiveTenant(tenant._id, tenant.name, tenant.status)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                      tenant.status === 'Archived'
                        ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                        : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200'
                    }`}
                  >
                    {tenant.status === 'Archived' ? (
                      <><ArchiveRestore size={12} className="inline mr-1" />Restore</>
                    ) : (
                      <><Archive size={12} className="inline mr-1" />Archive</>
                    )}
                  </button>
                  {tenant.status !== 'Archived' && (
                    <div className="flex gap-1 flex-1">
                      <MessageButtons
                        phone={tenant.phone}
                        email={tenant.email}
                        name={tenant.name}
                        messageType="rentReminder"
                        additionalData={{
                          amount: tenant.rentAmount,
                          dueDate: new Date().toLocaleDateString()
                        }}
                      />
                      <ShareButton
                        title={`Tenant: ${tenant.name}`}
                        text={`Tenant information for ${tenant.name} at ${tenant.propertyId?.name || 'Property'}`}
                        type="tenant"
                        data={tenant}
                        className="ml-1"
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => handleDeleteTenant(tenant._id, tenant.name)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-2 rounded-xl text-xs font-medium transition-colors border border-red-200"
                    title="Delete Permanently"
                  >
                    🗑️
                  </button>
                </div>
              </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="relative">
            <div className="w-32 h-32 gradient-dark-orange-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Users size={64} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-yellow-900">!</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
            {showArchived ? 'No Archived Tenants' : 'No Active Tenants'}
          </h3>
          <p className="text-text-secondary mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            {showArchived 
              ? 'No tenants have been archived yet. Archived tenants are those who have left the property.'
              : 'Start building your tenant community by adding your first tenant. Manage leases, payments, and communications all in one place.'
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
              Add Your First Tenant
            </button>
          )}
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

      <ComprehensiveTenantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTenantAdded={handleTenantAdded}
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
      </div>
    </motion.div>
  );
};

export default TenantsPage;