import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, DollarSign, FileText, TrendingUp, Archive, Calendar, Wrench } from 'lucide-react';

interface PropertyQuickActionsProps {
  propertyId: string;
  property: any;
  tenants: any[];
  onRentIncrease: () => void;
  onCollectionSheet: () => void;
  onArchive: () => void;
}

const PropertyQuickActions: React.FC<PropertyQuickActionsProps> = ({
  propertyId,
  property,
  tenants,
  onRentIncrease,
  onCollectionSheet,
  onArchive
}) => {
  const activeTenants = tenants.filter(t => t.status === 'Active');
  const expiringLeases = tenants.filter(t => {
    if (!t.leaseEndDate) return false;
    const endDate = new Date(t.leaseEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {/* Tenant Management */}
        <Link 
          to={`/dashboard/tenants?propertyId=${propertyId}`}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>View Tenants</span>
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
          Add Tenant
        </button>

        {/* Financial Actions */}
        <Link 
          to={`/dashboard/payments?propertyId=${propertyId}`}
          className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
        >
          <DollarSign size={16} />
          View Payments
        </Link>

        <button
          onClick={onCollectionSheet}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          <FileText size={16} />
          Collection Sheet
        </button>

        <button
          onClick={onRentIncrease}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <TrendingUp size={16} />
          Increase Rent
        </button>

        {/* Lease Management */}
        {expiringLeases.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <Calendar size={16} />
              <span className="font-medium">Expiring Leases</span>
            </div>
            <p className="text-sm text-yellow-700 mb-2">
              {expiringLeases.length} lease{expiringLeases.length > 1 ? 's' : ''} expiring within 30 days
            </p>
            <Link
              to={`/dashboard/tenants?propertyId=${propertyId}&filter=expiring`}
              className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300 transition-colors"
            >
              Review Leases
            </Link>
          </div>
        )}

        {/* Maintenance */}
        <Link
          to={`/dashboard/maintenance?propertyId=${propertyId}`}
          className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <Wrench size={16} />
          Maintenance
        </Link>

        {/* Archive */}
        <button
          onClick={onArchive}
          className="w-full bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors flex items-center gap-2"
        >
          <Archive size={16} />
          Archive Property
        </button>
      </div>
    </div>
  );
};

export default PropertyQuickActions;