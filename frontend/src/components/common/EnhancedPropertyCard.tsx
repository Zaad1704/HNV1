import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Edit, Trash2, Share2, Eye, Users, DollarSign, AlertTriangle, Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';
import ShareButton from './ShareButton';

interface EnhancedPropertyCardProps {
  property: any;
  index: number;
  onEdit?: (property: any) => void;
  onDelete?: (propertyId: string) => void;
  onShare?: (property: any) => void;
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ 
  property, 
  index, 
  onEdit, 
  onDelete, 
  onShare 
}) => {
  // Fetch tenants for this property to calculate occupancy
  const { data: tenants = [] } = useQuery({
    queryKey: ['propertyTenants', property._id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/tenants?propertyId=${property._id}`);
        return data.data || [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 300000 // 5 minutes
  });

  // Calculate metrics
  const totalUnits = property.numberOfUnits || 1;
  const occupiedUnits = tenants.filter((t: any) => t.status === 'Active').length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const vacantUnits = totalUnits - occupiedUnits;
  const monthlyRevenue = tenants.reduce((sum: number, t: any) => sum + (t.rentAmount || 0), 0);
  const maintenanceIssues = 0; // TODO: Fetch from maintenance API
  const hasIssues = maintenanceIssues > 0;

  return (
    <UniversalCard delay={index * 0.1} gradient="blue">
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-brand-blue via-purple-600 to-brand-orange relative overflow-hidden rounded-2xl mb-4">
        {property.imageUrl && property.imageUrl.trim() !== '' ? (
          <img
            src={property.imageUrl.startsWith('/') ? `${window.location.origin}${property.imageUrl}` : property.imageUrl}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
            onError={(e) => {
              console.error('Image failed to load:', property.imageUrl);
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`fallback-icon w-full h-full flex items-center justify-center ${property.imageUrl && property.imageUrl.trim() !== '' ? 'hidden' : ''}`}>
          <Building2 size={32} className="text-white" />
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <UniversalStatusBadge 
            status={property.status} 
            variant={property.status === 'Active' ? 'success' : 'warning'}
          />
          {vacantUnits > 0 && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {vacantUnits} Vacant
            </span>
          )}
          {hasIssues && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Wrench size={10} />
              Issues
            </span>
          )}
        </div>
        
        {/* Occupancy Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-full p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Occupancy</span>
              <span>{occupancyRate}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  occupancyRate >= 80 ? 'bg-green-400' :
                  occupancyRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && property.imageUrl && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-1 rounded">
            {property.imageUrl}
          </div>
        )}
      </div>

      {/* Property Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-blue transition-colors">
            {property.name}
          </h3>
          <p className="text-sm text-text-secondary">{property.address?.formattedAddress}</p>
          <p className="text-xs text-text-muted mt-1">
            Last updated: {new Date(property.updatedAt || property.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Enhanced Property Metrics */}
        <div className="bg-app-bg/50 rounded-xl p-4 space-y-3">
          {/* Revenue Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-sm text-text-secondary">Monthly Revenue</span>
            </div>
            <span className="font-bold text-green-600">${monthlyRevenue.toLocaleString()}</span>
          </div>
          
          {/* Occupancy Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <span className="text-sm text-text-secondary">Occupancy</span>
            </div>
            <span className="font-semibold text-text-primary">{occupiedUnits}/{totalUnits} units</span>
          </div>
          
          {/* Property Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-purple-600" />
              <span className="text-sm text-text-secondary">Type</span>
            </div>
            <span className="font-semibold text-text-primary">{property.propertyType || 'Apartment'}</span>
          </div>
        </div>
        
        {/* Tenant Avatars */}
        {tenants.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Tenants:</span>
            <div className="flex -space-x-2">
              {tenants.slice(0, 3).map((tenant: any, idx: number) => (
                <div
                  key={tenant._id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  title={tenant.name}
                >
                  {tenant.name?.charAt(0).toUpperCase() || 'T'}
                </div>
              ))}
              {tenants.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                  +{tenants.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/dashboard/properties/${property._id}`}
            className="w-full gradient-dark-orange-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View Details
          </Link>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(property);
              }}
              className="bg-blue-100 text-blue-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
            >
              <Edit size={12} />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(property._id);
              }}
              className="bg-red-100 text-red-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <ShareButton
              data={{
                title: property.name,
                text: `Property: ${property.name}\nAddress: ${property.address?.formattedAddress || 'N/A'}\nUnits: ${property.numberOfUnits || 1}`,
                url: `${window.location.origin}/dashboard/properties/${property._id}`
              }}
              className="bg-green-100 text-green-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
            >
              <Share2 size={12} />
              Share
            </ShareButton>
          </div>
        </div>
      </div>
    </UniversalCard>
  );
};

export default EnhancedPropertyCard;