import React from 'react';
import { Link } from 'react-router-dom';
import { User, Edit, Trash2, DollarSign, Calendar, MapPin, Phone, Mail, Building2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';

interface EnhancedTenantCardProps {
  tenant: any;
  property?: any;
  index: number;
  onEdit?: (tenant: any) => void;
  onDelete?: (tenantId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (tenantId: string, selected: boolean) => void;
}

const EnhancedTenantCard: React.FC<EnhancedTenantCardProps> = ({
  tenant,
  property,
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

  const getPaymentStatus = () => {
    if (tenant.paymentStatus === 'late') return { color: 'red', text: 'Late Payment', icon: AlertTriangle };
    if (tenant.paymentStatus === 'pending') return { color: 'yellow', text: 'Payment Due', icon: Clock };
    return { color: 'green', text: 'Current', icon: CheckCircle };
  };

  const getLeaseStatus = () => {
    if (!tenant.leaseEndDate) return null;
    const endDate = new Date(tenant.leaseEndDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { color: 'red', text: 'Expired', urgent: true };
    if (daysUntilExpiry <= 30) return { color: 'orange', text: 'Expiring Soon', urgent: true };
    if (daysUntilExpiry <= 90) return { color: 'yellow', text: 'Renewal Due', urgent: false };
    return null;
  };

  const paymentStatus = getPaymentStatus();
  const leaseStatus = getLeaseStatus();

  return (
    <UniversalCard delay={index * 0.1} gradient="green" className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Status Indicators */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <UniversalStatusBadge 
          status={tenant.status} 
          variant={tenant.status === 'Active' ? 'success' : 'warning'}
        />
        {paymentStatus.color === 'red' && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <paymentStatus.icon size={10} />
            Late
          </span>
        )}
        {leaseStatus?.urgent && (
          <span className={`bg-${leaseStatus.color}-100 text-${leaseStatus.color}-800 px-2 py-1 rounded-full text-xs font-medium`}>
            {leaseStatus.text}
          </span>
        )}
      </div>

      {/* Property Thumbnail */}
      {property && (
        <div className="mb-4">
          <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl relative overflow-hidden">
            {property.imageUrl ? (
              <img
                src={property.imageUrl.startsWith('/') ? `${window.location.origin}${property.imageUrl}` : property.imageUrl}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 size={24} className="text-white" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
              <div className="text-white text-xs font-medium">{property.name}</div>
              <div className="text-white/80 text-xs">Unit {getUnitDisplay()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
          {tenant.name?.charAt(0).toUpperCase() || 'T'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text-primary">{tenant.name}</h3>
          {!property && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin size={14} />
              <span>Unit {getUnitDisplay()}</span>
            </div>
          )}
          {!property && tenant.propertyName && (
            <p className="text-sm text-text-muted">{tenant.propertyName}</p>
          )}
        </div>
      </div>

      {/* Enhanced Tenant Info */}
      <div className="space-y-3">
        <div className="bg-app-bg/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className={`text-${paymentStatus.color}-600`} />
              <span className="text-sm text-text-secondary">Monthly Rent</span>
            </div>
            <span className={`font-bold text-${paymentStatus.color}-600`}>${tenant.rentAmount?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <paymentStatus.icon size={16} className={`text-${paymentStatus.color}-600`} />
              <span className="text-sm text-text-secondary">Payment Status</span>
            </div>
            <span className={`font-semibold text-${paymentStatus.color}-600`}>{paymentStatus.text}</span>
          </div>
          
          {tenant.leaseEndDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm text-text-secondary">Lease Ends</span>
              </div>
              <span className="font-semibold text-text-primary">
                {new Date(tenant.leaseEndDate).toLocaleDateString()}
              </span>
            </div>
          )}
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