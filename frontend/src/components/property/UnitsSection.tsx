import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, DollarSign, Plus, Edit3, Grid3X3, List, Wrench, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import UnitNicknameModal from './UnitNicknameModal';

interface UnitsSectionProps {
  propertyId: string;
  property?: any;
  tenants?: any[];
  onAddTenant?: (unitNumber: string) => void;
  onDataUpdate?: () => void;
}



const UnitsSection: React.FC<UnitsSectionProps> = ({ propertyId, property, tenants = [], onAddTenant, onDataUpdate }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUnitModal, setShowUnitModal] = useState(false);
  
  // Fetch units with nicknames
  const { data: units = [] } = useQuery({
    queryKey: ['propertyUnits', propertyId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/units/property/${propertyId}`);
        return data.data || [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!propertyId
  });
  
  // Combine units data with tenant information
  const unitsData = React.useMemo(() => {
    if (units.length > 0) {
      return units.map((unit: any) => {
        const tenant = tenants.find(t => t.unit === unit.unitNumber && t.status === 'Active');
        return {
          ...unit,
          isOccupied: !!tenant,
          tenantName: tenant?.name || null,
          tenantId: tenant?._id || null,
          rentAmount: tenant?.rentAmount || unit.rentAmount || 0,
          displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber
        };
      });
    }
    
    // Fallback to property numberOfUnits if no units found
    if (!property?.numberOfUnits) return [];
    
    return Array.from({ length: property.numberOfUnits }, (_, i) => {
      const unitNumber = (i + 1).toString();
      const tenant = tenants.find(t => t.unit === unitNumber && t.status === 'Active');
      
      return {
        unitNumber,
        isOccupied: !!tenant,
        tenantName: tenant?.name || null,
        tenantId: tenant?._id || null,
        rentAmount: tenant?.rentAmount || property.rentAmount || 0,
        displayName: unitNumber,
        status: tenant ? 'Occupied' : 'Available'
      };
    });
  }, [units, tenants, property?.numberOfUnits]);

  if (!property || !tenants) {
    return (
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
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
              {unitsData.filter((u: any) => !u.isOccupied).length} Available
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {unitsData.filter((u: any) => u.isOccupied).length} Occupied
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              {unitsData.filter((u: any) => u.status === 'Maintenance').length} Maintenance
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUnitModal(true)}
            className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
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
      
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
        {unitsData.map((unit: any) => (
          <div
            key={unit.unitNumber}
            className={`border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all ${
              viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center justify-between'
            } ${
              unit.status === 'Maintenance' ? 'border-yellow-300 bg-yellow-50' : ''
            }`}
          >
            <div className={`flex items-center ${viewMode === 'grid' ? 'justify-between mb-3' : 'gap-4'}`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  unit.isOccupied ? 'bg-red-100' : 
                  unit.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  {unit.status === 'Maintenance' ? (
                    <Wrench size={16} className="text-yellow-600" />
                  ) : (
                    <Home size={16} className={unit.isOccupied ? 'text-red-600' : 'text-green-600'} />
                  )}
                </div>
                <div>
                  <span className="font-medium text-text-primary">Unit {unit.displayName}</span>
                  {unit.alternativeName && (
                    <p className="text-xs text-text-muted">{unit.alternativeName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  unit.isOccupied ? 'bg-red-100 text-red-800' : 
                  unit.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {unit.status || (unit.isOccupied ? 'Occupied' : 'Available')}
                </span>
                {unit.status === 'Maintenance' && (
                  <AlertTriangle size={14} className="text-yellow-600" />
                )}
              </div>
            </div>
            
            {viewMode === 'grid' && (
              <div className="space-y-2">
                {unit.isOccupied && unit.tenantName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-text-muted" />
                    {unit.tenantId ? (
                      <Link 
                        to={`/dashboard/tenants/${unit.tenantId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {unit.tenantName}
                      </Link>
                    ) : (
                      <span className="text-text-secondary">{unit.tenantName}</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={14} className="text-text-muted" />
                  <span className="text-text-secondary font-medium">
                    {unit.rentAmount > 0 ? `$${unit.rentAmount}/month` : 'No rent set'}
                  </span>
                </div>
                
                {unit.size && (
                  <div className="flex items-center gap-2 text-sm">
                    <Home size={14} className="text-text-muted" />
                    <span className="text-text-secondary">{unit.size} sq ft</span>
                  </div>
                )}
              </div>
            )}
            
            {viewMode === 'list' && (
              <div className="flex items-center gap-6 text-sm">
                {unit.tenantName && (
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-text-muted" />
                    <span className="text-text-secondary">{unit.tenantName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-text-muted" />
                  <span className="text-text-secondary font-medium">
                    ${unit.rentAmount || 0}/month
                  </span>
                </div>
              </div>
            )}
            
            {viewMode === 'grid' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {!unit.isOccupied ? (
                  <button
                    onClick={() => {
                      onAddTenant?.(unit.unitNumber);
                      setTimeout(() => onDataUpdate?.(), 1000);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs text-blue-600 hover:text-blue-800 py-2 px-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={12} />
                    <span>Add Tenant</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    {unit.tenantId && (
                      <Link
                        to={`/dashboard/tenants/${unit.tenantId}`}
                        className="flex-1 flex items-center justify-center gap-2 text-xs text-green-600 hover:text-green-800 py-2 px-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <User size={12} />
                        <span>View</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        // Quick actions for occupied units
                        alert('Quick actions coming soon!');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-xs text-purple-600 hover:text-purple-800 py-2 px-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <DollarSign size={12} />
                      <span>Pay</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {viewMode === 'list' && (
              <div className="flex items-center gap-2">
                {!unit.isOccupied ? (
                  <button
                    onClick={() => onAddTenant?.(unit.unitNumber)}
                    className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                  >
                    Add Tenant
                  </button>
                ) : (
                  unit.tenantId && (
                    <Link
                      to={`/dashboard/tenants/${unit.tenantId}`}
                      className="px-3 py-1 text-xs text-green-600 hover:text-green-800 bg-green-50 rounded hover:bg-green-100 transition-colors"
                    >
                      View Tenant
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <UnitNicknameModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        propertyId={propertyId}
        propertyName={property?.name || 'Property'}
      />
    </div>
  );
};

export default UnitsSection;