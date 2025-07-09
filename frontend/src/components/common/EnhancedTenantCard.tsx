import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';
import { useCrossData } from '../../hooks/useCrossData';

interface EnhancedTenantCardProps {
  tenant: any;
  index: number;
}

const EnhancedTenantCard: React.FC<EnhancedTenantCardProps> = ({ tenant, index }) => {
  const { payments, maintenance } = useCrossData();

  // Calculate tenant-specific stats
  const tenantPayments = payments?.filter((p: any) => p.tenantId === tenant._id) || [];
  const tenantMaintenance = maintenance?.filter((m: any) => m.requestedBy === tenant._id) || [];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthPayment = tenantPayments.find((p: any) => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });

  const outstandingAmount = currentMonthPayment ? 0 : (tenant.rentAmount || 0);
  const totalPaid = tenantPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const openMaintenanceRequests = tenantMaintenance.filter((m: any) => m.status === 'Open').length;
  const lastPaymentDate = tenantPayments.length > 0 ? 
    new Date(Math.max(...tenantPayments.map((p: any) => new Date(p.paymentDate).getTime()))) : null;

  const getPaymentStatus = () => {
    if (currentMonthPayment) return { status: 'Paid', variant: 'success' as const, icon: CheckCircle };
    if (outstandingAmount > 0) return { status: 'Outstanding', variant: 'warning' as const, icon: AlertTriangle };
    return { status: 'Current', variant: 'info' as const, icon: Clock };
  };

  const paymentStatus = getPaymentStatus();

  return (
    <UniversalCard delay={index * 0.1} gradient="green">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 gradient-dark-orange-blue rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {tenant.name ? tenant.name.charAt(0).toUpperCase() : 'T'}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-text-primary group-hover:text-brand-blue transition-colors">
            {tenant.name || 'Unknown'}
          </h3>
          <UniversalStatusBadge 
            status={tenant.status || 'Unknown'} 
            variant={tenant.status === 'Active' ? 'success' : tenant.status === 'Late' ? 'error' : 'warning'}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-app-bg/50 rounded-2xl p-4 space-y-2 mb-4">
        <p className="text-sm text-text-primary font-medium">{tenant.email || 'No email'}</p>
        {tenant.phone && <p className="text-sm text-text-secondary">{tenant.phone}</p>}
        <p className="text-sm text-text-secondary">
          Unit {tenant.unit || 'N/A'} • {tenant.propertyId?.name || 'No property'}
        </p>
      </div>

      {/* Payment Status */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
          <div className="flex items-center gap-2">
            <paymentStatus.icon size={16} className={
              paymentStatus.variant === 'success' ? 'text-green-600' :
              paymentStatus.variant === 'warning' ? 'text-yellow-600' : 'text-blue-600'
            } />
            <span className="text-sm font-medium">This Month</span>
          </div>
          <UniversalStatusBadge 
            status={paymentStatus.status}
            variant={paymentStatus.variant}
            size="sm"
          />
        </div>

        {tenant.rentAmount && (
          <div className="bg-gradient-to-r from-brand-blue via-purple-600 to-brand-orange p-4 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Monthly Rent</p>
                <p className="text-2xl font-bold">${tenant.rentAmount}</p>
              </div>
              {outstandingAmount > 0 && (
                <div className="text-right">
                  <p className="text-sm opacity-90">Outstanding</p>
                  <p className="text-lg font-bold text-yellow-300">${outstandingAmount}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-app-bg/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-xs text-text-secondary">Total Paid</span>
          </div>
          <p className="font-bold text-green-600">${totalPaid}</p>
        </div>
        
        <div className="bg-app-bg/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-orange-600" />
            <span className="text-xs text-text-secondary">Maintenance</span>
          </div>
          <p className="font-bold text-orange-600">{openMaintenanceRequests}</p>
        </div>
      </div>

      {lastPaymentDate && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mb-4">
          <Calendar size={14} className="text-blue-600" />
          <span className="text-sm text-blue-800">
            Last payment: {lastPaymentDate.toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <Link 
          to={`/dashboard/tenants/${tenant._id}`}
          className="w-full gradient-dark-orange-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform"
        >
          View Details
        </Link>
        
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/dashboard/payments?tenantId=${tenant._id}`}
            className="bg-green-100 text-green-800 py-2 px-3 rounded-xl text-xs font-medium text-center hover:bg-green-200 transition-colors"
          >
            Payments ({tenantPayments.length})
          </Link>
          <Link
            to={`/dashboard/maintenance?tenantId=${tenant._id}`}
            className="bg-orange-100 text-orange-800 py-2 px-3 rounded-xl text-xs font-medium text-center hover:bg-orange-200 transition-colors"
          >
            Requests ({tenantMaintenance.length})
          </Link>
        </div>
      </div>
    </UniversalCard>
  );
};

export default EnhancedTenantCard;