import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Phone, MapPin, Calendar, DollarSign, Download, FileText, Search, Filter } from 'lucide-react';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import ExportModal from '../components/common/ExportModal';
import MonthlyCollectionSheet from '../components/common/MonthlyCollectionSheet';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import MessageButtons from '../components/common/MessageButtons';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import AddTenantModal from '../components/common/AddTenantModal';
import { useDataExport } from '../hooks/useDataExport';
import { useQueryClient } from '@tanstack/react-query';
import { deleteTenant, confirmDelete, handleDeleteError, handleDeleteSuccess } from '../utils/deleteHelpers';

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
  const queryClient = useQueryClient();
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

  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
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
      
      const matchesSearch = !searchQuery || 
        (tenant.name && tenant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.email && tenant.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.unit && tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = !filters.status || tenant.status === filters.status;
      const matchesProperty = !filters.property || tenant.propertyId?._id === filters.property;
      
      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [tenants, searchQuery, filters]);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tenants</h1>
          <p className="text-text-secondary mt-1">Manage your tenant relationships</p>
        </div>
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
            className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
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
          { value: 'Late', label: 'Late Payment' }
        ]}
      />

      {filteredTenants && filteredTenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant: any, index: number) => (
            <motion.div
              key={tenant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all duration-300 relative"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 right-4">
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
                  className="w-4 h-4 rounded border-2"
                />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                  {tenant.name ? tenant.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{tenant.name || 'Unknown'}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Mail size={14} />
                  <span>{tenant.email || 'No email'}</span>
                </div>
                {tenant.phone && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Phone size={14} />
                    <span>{tenant.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <MapPin size={14} />
                  <span>Unit {tenant.unit || 'N/A'} • {tenant.propertyId?.name || 'No property'}</span>
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
                <button 
                  onClick={() => handleDeleteTenant(tenant._id, tenant.name)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  Delete
                </button>
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

      <AddTenantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTenantAdded={handleTenantAdded}
      />
    </motion.div>
  );
};

export default TenantsPage;