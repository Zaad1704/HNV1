import React from 'react';
import { Link } from 'react-router-dom';
import { User, Edit, Trash2, DollarSign, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';

interface EnhancedTenantCardProps {
  tenant: any;
  index: number;
  onEdit?: (tenant: any) => void;
  onDelete?: (tenantId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (tenantId: string, selected: boolean) => void;
}

const EnhancedTenantCard: React.FC<EnhancedTenantCardProps> = ({
  tenant,
  index,
  onEdit,
  onDelete,
  showCheckbox = false,
  isSelected = false,
  onSelect
}) => {
  const getUnitDisplay = () => {
    if (tenant.unitNickname) {
      return `${tenant.unit} (${tenant.unitNickname})`;
    }
    return tenant.unit || 'N/A';
  };

  const getDaysUntilRent = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const diffTime = nextMonth.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <UniversalCard delay={index * 0.1} gradient="green" className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Tenant Avatar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
          {tenant.name?.charAt(0).toUpperCase() || 'T'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text-primary">{tenant.name}</h3>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MapPin size={14} />
            <span>Unit {getUnitDisplay()}</span>
          </div>
          {tenant.propertyName && (
            <p className="text-sm text-text-muted">{tenant.propertyName}</p>
          )}
        </div>
        <UniversalStatusBadge 
          status={tenant.status} 
          variant={tenant.status === 'Active' ? 'success' : 'warning'}
        />
      </div>

      {/* Tenant Info */}
      <div className="space-y-3">
        <div className="bg-app-bg/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-sm text-text-secondary">Rent</span>
            </div>
            <span className="font-bold text-green-600">${tenant.rentAmount?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-sm text-text-secondary">Due in</span>
            </div>
            <span className="font-semibold text-text-primary">{getDaysUntilRent()} days</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 text-sm">
          {tenant.email && (
            <div className="flex items-center gap-1 text-text-secondary">
              <Mail size={14} />
              <span className="truncate">{tenant.email}</span>
            </div>
          )}
          {tenant.phone && (
            <div className="flex items-center gap-1 text-text-secondary">
              <Phone size={14} />
              <span>{tenant.phone}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link
            to={`/dashboard/tenants/${tenant._id}`}
            className="w-full gradient-dark-green-blue text-white py-2 px-4 rounded-xl text-sm font-semibold transition-all hover:shadow-lg text-center block"
          >
            View Details
          </Link>
          
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-green-100 text-green-800 py-2 px-3 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors">
              <DollarSign size={12} className="mx-auto" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(tenant);
              }}
              className="bg-blue-100 text-blue-800 py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
            >
              <Edit size={12} className="mx-auto" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(tenant._id);
              }}
              className="bg-red-100 text-red-800 py-2 px-3 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
            >
              <Trash2 size={12} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </UniversalCard>
  );
};

export default EnhancedTenantCard;