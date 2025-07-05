import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Building2, Plus, MapPin, Users, Edit, Trash2, Eye, Download, Mail, DollarSign } from 'lucide-react';
import AddPropertyModal from '../components/common/AddPropertyModal';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import BulkPaymentModal from '../components/common/BulkPaymentModal';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDataExport } from '../hooks/useDataExport';
import ExportModal from '../components/common/ExportModal';

const fetchProperties = async () => {
  try {
    const { data } = await apiClient.get('/properties');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }
};

const PropertiesPage = () => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkPayment, setShowBulkPayment] = useState(false);
  const queryClient = useQueryClient();
  const { exportProperties, isExporting } = useDataExport() || { exportProperties: () => {}, isExporting: false };

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Properties query error:', error);
    }
  });

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    return properties.filter((property: any) => {
      if (!property) return false;
      
      const matchesSearch = !searchQuery || 
        (property.name && property.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (property.address?.city && property.address.city.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = !filters.status || property.status === filters.status;
      const matchesUnits = !filters.units || 
        (filters.units === 'single' && property.numberOfUnits === 1) ||
        (filters.units === 'multiple' && property.numberOfUnits > 1);
      
      return matchesSearch && matchesStatus && matchesUnits;
    });
  }, [properties, searchQuery, filters]);

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
      label: 'Export',
      icon: Download,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: async (ids: string[]) => {
        await exportProperties({ format: 'xlsx', filters: { ids } });
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('dashboard.properties')}</h1>
          <p className="text-text-secondary mt-1">{t('property.manage_portfolio')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkPayment(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
          >
            <DollarSign size={16} />
            Bulk Payment
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold touch-feedback"
          >
            <Plus size={20} />
            {t('property.add_property')}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        filters={filters}
        placeholder="Search properties..."
        filterOptions={filterOptions}
      />

      {/* Properties Grid */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property: any, index: number) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl overflow-hidden border border-app-border hover:shadow-app-lg transition-all duration-300 group relative"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProperties(prev => [...prev, property._id]);
                    } else {
                      setSelectedProperties(prev => prev.filter(id => id !== property._id));
                    }
                  }}
                  className="w-5 h-5 rounded border-2 border-white bg-white/90 backdrop-blur-sm"
                />
              </div>
              {/* Property Image */}
              <div className="h-48 bg-gradient-to-br from-brand-blue to-brand-orange relative overflow-hidden">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={48} className="text-white/80" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    property.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {property.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <MapPin size={14} />
                    <span>{property.address?.formattedAddress || 'Address not available'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Users size={14} />
                    <span>{property.numberOfUnits} {property.numberOfUnits === 1 ? t('property.unit') : t('property.units')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/properties/${property._id}`}
                    className="flex-1 bg-app-bg hover:bg-app-border text-text-primary py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    {t('property.view')}
                  </Link>
                  <button className="flex-1 app-gradient text-white py-2 px-4 rounded-xl text-sm font-medium hover:shadow-app transition-all flex items-center justify-center gap-2">
                    <Edit size={14} />
                    {t('property.edit')}
                  </button>
                </div>
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
            <Building2 size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">{t('property.no_properties_yet')}</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            {t('property.manage_portfolio')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            {t('property.add_first_property')}
          </button>
        </motion.div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPropertyAdded={handlePropertyAdded}
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
    </motion.div>
  );
};

export default PropertiesPage;