import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Plus, DollarSign, FileText, TrendingUp, Archive, 
  Calendar, Mail, Download, Settings, Wrench, Bell 
} from 'lucide-react';
import BulkCommunicationModal from './BulkCommunicationModal';
import PropertyReportModal from './PropertyReportModal';

interface EnhancedPropertyQuickActionsProps {
  propertyId: string;
  property: any;
  tenants: any[];
  onRentIncrease: () => void;
  onCollectionSheet: () => void;
  onArchive: () => void;
}

const EnhancedPropertyQuickActions: React.FC<EnhancedPropertyQuickActionsProps> = ({
  propertyId,
  property,
  tenants,
  onRentIncrease,
  onCollectionSheet,
  onArchive
}) => {
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const activeTenants = tenants.filter(t => t.status === 'Active');
  const expiringLeases = tenants.filter(t => {
    if (!t.leaseEndDate) return false;
    const endDate = new Date(t.leaseEndDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return endDate <= threeMonthsFromNow;
  });

  const hasVacantUnits = activeTenants.length < (property.numberOfUnits || 1);
  const hasExpiringLeases = expiringLeases.length > 0;

  return (
    <div className="space-y-6">
      {/* Property Overview Card */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h3 className="text-lg font-bold text-text-primary mb-4">Property Overview</h3>
        
        {/* Property Image */}
        {property.imageUrl && (
          <div className="mb-4">
            <img
              src={property.imageUrl.startsWith('/') ? `${window.location.origin}${property.imageUrl}` : property.imageUrl}
              alt={property.name}
              className="w-full h-48 object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Type</span>
            <span className="font-medium text-text-primary">{property.propertyType || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Units</span>
            <span className="font-medium text-text-primary">{property.numberOfUnits}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Occupancy</span>
            <span className="font-medium text-text-primary">
              {activeTenants.length}/{property.numberOfUnits} 
              ({Math.round((activeTenants.length / (property.numberOfUnits || 1)) * 100)}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Monthly Revenue</span>
            <span className="font-medium text-green-600">
              ${activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Contextual Alerts */}
      {(hasVacantUnits || hasExpiringLeases) && (
        <div className="app-surface rounded-3xl p-6 border border-orange-200 bg-orange-50">
          <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
            <Bell size={20} />
            Attention Required
          </h3>
          <div className="space-y-2">
            {hasVacantUnits && (
              <div className="text-sm text-orange-800">
                🏠 {(property.numberOfUnits || 1) - activeTenants.length} vacant unit(s) available
              </div>
            )}
            {hasExpiringLeases && (
              <div className="text-sm text-orange-800">
                📅 {expiringLeases.length} lease(s) expiring within 3 months
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Actions */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link 
            to={`/dashboard/tenants?propertyId=${propertyId}`}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>View All Tenants</span>
            </div>
            <span className="bg-blue-400 px-2 py-1 rounded-full text-xs">
              {activeTenants.length}
            </span>
          </Link>

          <button 
            onClick={() => window.location.href = `/dashboard/tenants/add?propertyId=${propertyId}`}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Tenant
          </button>

          <Link 
            to={`/dashboard/payments?propertyId=${propertyId}`}
            className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <DollarSign size={16} />
            View Payments
          </Link>
        </div>
      </div>

      {/* Property Management Actions */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h3 className="text-lg font-bold text-text-primary mb-4">Property Management</h3>
        <div className="space-y-3">
          <button
            onClick={onCollectionSheet}
            className="w-full bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
          >
            <FileText size={16} />
            Monthly Collection Sheet
          </button>

          {hasExpiringLeases && (
            <button
              onClick={() => alert('Bulk lease renewal for expiring leases coming soon!')}
              className="w-full bg-yellow-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <Calendar size={16} />
              Renew Expiring Leases ({expiringLeases.length})
            </button>
          )}

          <button
            onClick={onRentIncrease}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <TrendingUp size={16} />
            Apply Rent Increase
          </button>

          <Link
            to={`/dashboard/maintenance?propertyId=${propertyId}`}
            className="w-full bg-amber-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <Wrench size={16} />
            Schedule Maintenance
          </Link>
        </div>
      </div>

      {/* Communication & Reports */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h3 className="text-lg font-bold text-text-primary mb-4">Communication & Reports</h3>
        <div className="space-y-3">
          <button
            onClick={() => setShowCommunicationModal(true)}
            className="w-full bg-teal-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <Mail size={16} />
            Message All Tenants
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full bg-cyan-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-cyan-600 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Generate Property Report
          </button>

          <Link
            to={`/dashboard/properties/${propertyId}/settings`}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <Settings size={16} />
            Property Settings
          </Link>
        </div>
      </div>

      {/* Archive Action */}
      <div className="app-surface rounded-3xl p-6 border border-red-200 bg-red-50">
        <button
          onClick={onArchive}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Archive size={16} />
          Archive Property
        </button>
        <p className="text-xs text-red-600 mt-2 text-center">
          This will hide the property from active listings
        </p>
      </div>

      {/* Modals */}
      <BulkCommunicationModal
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        tenants={tenants.filter(t => t.status === 'Active')}
        propertyName={property.name}
      />

      <PropertyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        property={property}
        tenants={tenants}
      />
    </div>
  );
};

export default EnhancedPropertyQuickActions;