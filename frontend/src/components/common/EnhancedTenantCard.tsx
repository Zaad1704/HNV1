import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Wrench, TrendingUp, TrendingDown } from 'lucide-react';
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

  // Lease expiration warning
  const getLeaseWarning = () => {
    if (!tenant.leaseEndDate) return null;
    const daysUntilExpiry = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) return { days: daysUntilExpiry, urgent: daysUntilExpiry <= 7 };
    if (daysUntilExpiry <= 0) return { days: Math.abs(daysUntilExpiry), expired: true };
    return null;
  };

  const leaseWarning = getLeaseWarning();

  // Payment trend (last 3 months)
  const getPaymentTrend = () => {
    const last3Months = tenantPayments.slice(-3);
    if (last3Months.length < 2) return null;
    const recent = last3Months[last3Months.length - 1]?.amount || 0;
    const previous = last3Months[last3Months.length - 2]?.amount || 0;
    return recent > previous ? 'up' : recent < previous ? 'down' : 'stable';
  };

  const paymentTrend = getPaymentTrend();

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

      {/* Lease Expiration Warning */}
      {leaseWarning && (
        <div className={`p-3 rounded-xl mb-4 border-2 ${
          leaseWarning.expired 
            ? 'bg-red-50 border-red-200 text-red-800'
            : leaseWarning.urgent 
            ? 'bg-orange-50 border-orange-200 text-orange-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">
              {leaseWarning.expired 
                ? `Lease expired ${leaseWarning.days} days ago`
                : `Lease expires in ${leaseWarning.days} days`
              }
            </span>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  <p className="text-sm opacity-90">Monthly Rent</p>
                  {paymentTrend && (
                    <div className={`flex items-center gap-1 ${
                      paymentTrend === 'up' ? 'text-green-300' : 
                      paymentTrend === 'down' ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {paymentTrend === 'up' ? <TrendingUp size={12} /> : 
                       paymentTrend === 'down' ? <TrendingDown size={12} /> : null}
                    </div>
                  )}
                </div>
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

      {/* Enhanced Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-app-bg/50 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={12} className="text-green-600" />
            <span className="text-xs text-text-secondary">Paid</span>
          </div>
          <p className="font-bold text-green-600 text-sm">${totalPaid}</p>
        </div>
        
        <div className={`bg-app-bg/50 rounded-xl p-3 ${
          openMaintenanceRequests > 0 ? 'ring-2 ring-orange-200' : ''
        }`}>
          <div className="flex items-center gap-1 mb-1">
            <Wrench size={12} className="text-orange-600" />
            <span className="text-xs text-text-secondary">Issues</span>
          </div>
          <p className={`font-bold text-sm ${
            openMaintenanceRequests > 0 ? 'text-orange-600' : 'text-gray-600'
          }`}>{openMaintenanceRequests}</p>
        </div>

        <div className="bg-app-bg/50 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <Calendar size={12} className="text-blue-600" />
            <span className="text-xs text-text-secondary">Months</span>
          </div>
          <p className="font-bold text-blue-600 text-sm">{tenantPayments.length}</p>
        </div>
      </div>

      {/* Payment Performance Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-text-secondary">Payment Rate</span>
          <span className="text-xs font-medium">{Math.round((tenantPayments.length / Math.max(1, Math.ceil((new Date().getTime() - new Date(tenant.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)))) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              (tenantPayments.length / Math.max(1, Math.ceil((new Date().getTime() - new Date(tenant.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)))) >= 0.8 
                ? 'bg-green-500' 
                : (tenantPayments.length / Math.max(1, Math.ceil((new Date().getTime() - new Date(tenant.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)))) >= 0.6 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, (tenantPayments.length / Math.max(1, Math.ceil((new Date().getTime() - new Date(tenant.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)))) * 100)}%` }}
          ></div>
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
            className={`py-2 px-3 rounded-xl text-xs font-medium text-center transition-colors ${
              currentMonthPayment 
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-red-100 text-red-800 hover:bg-red-200 ring-2 ring-red-200'
            }`}
          >
            Payments ({tenantPayments.length})
            {!currentMonthPayment && <span className="block text-xs">Due Now</span>}
          </Link>
          <Link
            to={`/dashboard/maintenance?tenantId=${tenant._id}`}
            className={`py-2 px-3 rounded-xl text-xs font-medium text-center transition-colors ${
              openMaintenanceRequests > 0
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 ring-2 ring-orange-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Issues ({openMaintenanceRequests})
            {openMaintenanceRequests > 0 && <span className="block text-xs">Open</span>}
          </Link>
        </div>
      </div>
    </UniversalCard>
  );
};

export default EnhancedTenantCard;