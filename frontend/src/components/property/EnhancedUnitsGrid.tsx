import React, { useState } from 'react';
import { Home, User, DollarSign, Plus, Edit3, Grid3X3, List, Wrench, Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import UnitDataModal from './UnitDataModal';
import EnhancedUnitNicknameModal from './EnhancedUnitNicknameModal';
import UnitQuickActions from './UnitQuickActions';
import TenantAvatar from '../common/TenantAvatar';

interface EnhancedUnitsGridProps {
  propertyId: string;
  property: any;
  tenants: any[];
  units: any[];
  onAddTenant: (unitNumber: string) => void;
  onEditNicknames: () => void;
}

const EnhancedUnitsGrid: React.FC<EnhancedUnitsGridProps> = ({
  propertyId,
  property,
  tenants,
  units,
  onAddTenant,
  onEditNicknames
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showEnhancedNicknameModal, setShowEnhancedNicknameModal] = useState(false);

  // Combine units data with tenant information
  const unitsData = React.useMemo(() => {
    if (units.length > 0) {
      return units.map((unit: any) => {
        const tenant = tenants.find(t => t.unit === unit.unitNumber && t.status === 'Active');
        return {
          ...unit,
          isOccupied: !!tenant,
          tenant: tenant || null,
          tenantName: tenant?.name || null,
          tenantId: tenant?._id || null,
          rentAmount: tenant?.rentAmount || unit.rentAmount || 0,
          displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber,
          leaseEndDate: tenant?.leaseEndDate,
          paymentStatus: tenant?.paymentStatus || 'current',
          maintenanceIssues: 0 // TODO: Get from maintenance data
        };
      });
    }
    
    // Fallback to property numberOfUnits
    if (!property?.numberOfUnits) return [];
    
    return Array.from({ length: property.numberOfUnits }, (_, i) => {
      const unitNumber = (i + 1).toString();
      const tenant = tenants.find(t => t.unit === unitNumber && t.status === 'Active');
      
      return {
        unitNumber,
        isOccupied: !!tenant,
        tenant: tenant || null,
        tenantName: tenant?.name || null,
        tenantId: tenant?._id || null,
        rentAmount: tenant?.rentAmount || 0,
        displayName: unitNumber,
        leaseEndDate: tenant?.leaseEndDate,
        paymentStatus: tenant?.paymentStatus || 'current',
        maintenanceIssues: 0
      };
    });
  }, [units, tenants, property?.numberOfUnits]);

  const handleUnitClick = (unit: any) => {
    setSelectedUnit(unit.unitNumber);
    setShowUnitModal(true);
  };

  const getStatusColor = (unit: any) => {
    if (!unit.isOccupied) return 'bg-green-100 text-green-800 border-green-200';
    if (unit.paymentStatus === 'late') return 'bg-red-100 text-red-800 border-red-200';
    if (unit.maintenanceIssues > 0) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusText = (unit: any) => {
    if (!unit.isOccupied) return 'Vacant';
    if (unit.paymentStatus === 'late') return 'Late Payment';
    if (unit.maintenanceIssues > 0) return 'Maintenance';
    return 'Occupied';
  };

  if (viewMode === 'list') {
    return (
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Unit-Wise Breakdown ({unitsData.length})</h2>
            <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {unitsData.filter(u => !u.isOccupied).length} Available
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {unitsData.filter(u => u.isOccupied).length} Occupied
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEnhancedNicknameModal(true)}
              className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
            >
              <Edit3 size={14} />
              Manage Units
            </button>
            <button
              onClick={onEditNicknames}
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
            >
              <Edit3 size={14} />
              Edit Nicknames
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="space-y-3">
          {unitsData.map((unit: any) => (
            <div
              key={unit.unitNumber}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleUnitClick(unit)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {unit.unitNumber}
                </div>
                <div>
                  <div className="font-medium text-text-primary">Unit {unit.displayName}</div>
                  {unit.isOccupied && unit.tenantName && (
                    <div className="text-sm text-text-secondary">{unit.tenantName}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-text-primary">
                    {unit.rentAmount > 0 ? `$${unit.rentAmount}/month` : 'No rent set'}
                  </div>
                  {unit.leaseEndDate && (
                    <div className="text-xs text-text-muted">
                      Lease ends: {new Date(unit.leaseEndDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(unit)}`}>
                  {getStatusText(unit)}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (unit.isOccupied && unit.tenantId) {
                      window.location.href = `/dashboard/tenants/${unit.tenantId}`;
                    } else {
                      onAddTenant(unit.unitNumber);
                    }
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {unit.isOccupied ? <Eye size={16} /> : <Plus size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <UnitDataModal
          isOpen={showUnitModal}
          onClose={() => setShowUnitModal(false)}
          propertyId={propertyId}
          unitNumber={selectedUnit || ''}
          unitName={unitsData.find(u => u.unitNumber === selectedUnit)?.displayName}
        />
        
        <EnhancedUnitNicknameModal
          isOpen={showEnhancedNicknameModal}
          onClose={() => setShowEnhancedNicknameModal(false)}
          propertyId={propertyId}
          propertyName={property?.name || 'Property'}
        />
      </div>
    );
  }

  return (
    <div className="app-surface rounded-3xl p-8 border border-app-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Unit-Wise Breakdown ({unitsData.length})</h2>
          <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {unitsData.filter(u => !u.isOccupied).length} Available
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {unitsData.filter(u => u.isOccupied).length} Occupied
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnhancedNicknameModal(true)}
            className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Edit3 size={14} />
            Manage Units
          </button>
          <button
            onClick={onEditNicknames}
            className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Edit3 size={14} />
            Edit Nicknames
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Grid View */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {unitsData.map((unit: any) => (
          <div
            key={unit.unitNumber}
            className={`relative p-4 border-2 rounded-2xl hover:shadow-lg transition-all cursor-pointer ${getStatusColor(unit)}`}
            onClick={() => handleUnitClick(unit)}
          >
            {/* Unit Number */}
            <div className="text-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-2">
                {unit.unitNumber}
              </div>
              <div className="font-medium text-sm">
                {unit.nickname ? (
                  <div>
                    <div className="font-bold">{unit.unitNumber}</div>
                    <div className="text-xs text-gray-600">({unit.nickname})</div>
                  </div>
                ) : (
                  `Unit ${unit.unitNumber}`
                )}
              </div>
            </div>

            {/* Tenant Info */}
            {unit.isOccupied && unit.tenantName ? (
              <div className="text-center mb-3">
                <TenantAvatar 
                  tenant={unit.tenant} 
                  size="md" 
                  className="mx-auto mb-1" 
                />
                <div className="text-xs font-medium truncate">{unit.tenantName}</div>
                <div className="text-xs text-gray-600">${unit.rentAmount}/mo</div>
              </div>
            ) : (
              <div className="text-center mb-3">
                <TenantAvatar 
                  tenant={undefined} 
                  size="md" 
                  className="mx-auto mb-1" 
                />
                <div className="text-xs text-gray-600">Available</div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex justify-center gap-1 mb-2">
              {unit.paymentStatus === 'late' && (
                <div className="w-2 h-2 bg-red-500 rounded-full" title="Late Payment"></div>
              )}
              {unit.maintenanceIssues > 0 && (
                <div className="w-2 h-2 bg-orange-500 rounded-full" title="Maintenance Issues"></div>
              )}
              {unit.leaseEndDate && new Date(unit.leaseEndDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Lease Expiring Soon"></div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (unit.isOccupied && unit.tenantId) {
                  window.location.href = `/dashboard/tenants/${unit.tenantId}`;
                } else {
                  onAddTenant(unit.unitNumber);
                }
              }}
              className="w-full py-1 px-2 bg-white/80 hover:bg-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              {unit.isOccupied ? (
                <>
                  <Eye size={10} />
                  View
                </>
              ) : (
                <>
                  <Plus size={10} />
                  Add Tenant
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <UnitDataModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        propertyId={propertyId}
        unitNumber={selectedUnit || ''}
        unitName={unitsData.find(u => u.unitNumber === selectedUnit)?.displayName}
      />
      
      <EnhancedUnitNicknameModal
        isOpen={showEnhancedNicknameModal}
        onClose={() => setShowEnhancedNicknameModal(false)}
        propertyId={propertyId}
        propertyName={property?.name || 'Property'}
      />
    </div>
  );
};

export default EnhancedUnitsGrid;