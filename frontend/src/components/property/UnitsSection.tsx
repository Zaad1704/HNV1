import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Home, User, DollarSign, Plus } from 'lucide-react';

interface UnitsSectionProps {
  propertyId: string;
  onAddTenant?: (unitNumber: string) => void;
}

const fetchPropertyUnits = async (propertyId: string) => {
  const { data } = await apiClient.get(`/properties/${propertyId}/units`);
  return data.data || [];
};

const UnitsSection: React.FC<UnitsSectionProps> = ({ propertyId, onAddTenant }) => {
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['propertyUnits', propertyId],
    queryFn: () => fetchPropertyUnits(propertyId),
    enabled: !!propertyId
  });

  if (isLoading) {
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
        <h2 className="text-xl font-bold text-text-primary">Units ({units.length})</h2>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="text-green-600">{units.filter((u: any) => !u.isOccupied).length} vacant</span>
          <span>•</span>
          <span className="text-red-600">{units.filter((u: any) => u.isOccupied).length} occupied</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit: any) => (
          <div
            key={unit.unitNumber}
            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Home size={16} className="text-text-muted" />
                <span className="font-medium text-text-primary">Unit {unit.unitNumber}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                unit.isOccupied 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {unit.isOccupied ? 'Occupied' : 'Vacant'}
              </span>
            </div>
            
            <div className="space-y-2">
              {unit.isOccupied && unit.tenantName && (
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-text-muted" />
                  <span className="text-text-secondary">{unit.tenantName}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={14} className="text-text-muted" />
                <span className="text-text-secondary">
                  {unit.rentAmount > 0 ? `$${unit.rentAmount}/month` : 'No rent set'}
                </span>
              </div>
            </div>
            
            {!unit.isOccupied ? (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onAddTenant?.(unit.unitNumber)}
                  className="w-full flex items-center justify-center gap-2 text-xs text-blue-600 hover:text-blue-800 py-2 px-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus size={12} />
                  <span>Add Tenant</span>
                </button>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link
                  to={`/dashboard/properties/${propertyId}/units/${unit.unitNumber}`}
                  className="w-full flex items-center justify-center gap-2 text-xs text-green-600 hover:text-green-800 py-2 px-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <User size={12} />
                  <span>View Unit Details</span>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitsSection;