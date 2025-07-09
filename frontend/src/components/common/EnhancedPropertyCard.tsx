import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, DollarSign, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';
import { useCrossData } from '../../hooks/useCrossData';

interface EnhancedPropertyCardProps {
  property: any;
  index: number;
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ property, index }) => {
  const { tenants, payments, expenses, maintenance } = useCrossData();

  // Calculate property-specific stats
  const propertyTenants = tenants?.filter((t: any) => t.propertyId === property._id) || [];
  const propertyPayments = payments?.filter((p: any) => p.propertyId === property._id) || [];
  const propertyExpenses = expenses?.filter((e: any) => e.propertyId === property._id) || [];
  const propertyMaintenance = maintenance?.filter((m: any) => m.propertyId === property._id) || [];

  const occupiedUnits = propertyTenants.filter((t: any) => t.status === 'Active').length;
  const totalUnits = property.numberOfUnits || 1;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  
  const monthlyIncome = propertyPayments
    .filter((p: any) => new Date(p.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
  const monthlyExpenses = propertyExpenses
    .filter((e: any) => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    
  const openMaintenance = propertyMaintenance.filter((m: any) => m.status === 'Open').length;
  const netCashFlow = monthlyIncome - monthlyExpenses;

  return (
    <UniversalCard delay={index * 0.1} gradient="blue">
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-brand-blue via-purple-600 to-brand-orange relative overflow-hidden rounded-2xl mb-4">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${property.imageUrl ? 'hidden' : ''}`}>
          <Building2 size={32} className="text-white" />
        </div>
        <div className="absolute top-4 right-4">
          <UniversalStatusBadge 
            status={property.status} 
            variant={property.status === 'Active' ? 'success' : 'warning'}
          />
        </div>
      </div>

      {/* Property Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-blue transition-colors">
            {property.name}
          </h3>
          <p className="text-sm text-text-secondary">{property.address?.formattedAddress}</p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-app-bg/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-blue-600" />
              <span className="text-xs text-text-secondary">Occupancy</span>
            </div>
            <p className="font-bold text-text-primary">{occupiedUnits}/{totalUnits}</p>
            <p className="text-xs text-blue-600">{occupancyRate}%</p>
          </div>
          
          <div className="bg-app-bg/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-green-600" />
              <span className="text-xs text-text-secondary">Monthly</span>
            </div>
            <p className="font-bold text-green-600">${monthlyIncome}</p>
            <p className="text-xs text-text-secondary">Income</p>
          </div>
          
          <div className="bg-app-bg/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className={netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'} />
              <span className="text-xs text-text-secondary">Cash Flow</span>
            </div>
            <p className={`font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netCashFlow}
            </p>
          </div>
          
          <div className="bg-app-bg/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={14} className="text-orange-600" />
              <span className="text-xs text-text-secondary">Maintenance</span>
            </div>
            <p className="font-bold text-orange-600">{openMaintenance}</p>
            <p className="text-xs text-text-secondary">Open</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            to={`/dashboard/properties/${property._id}`}
            className="w-full gradient-dark-orange-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform"
          >
            View Details
          </Link>
          
          <div className="grid grid-cols-3 gap-2">
            <Link
              to={`/dashboard/tenants?propertyId=${property._id}`}
              className="bg-blue-100 text-blue-800 py-2 px-3 rounded-xl text-xs font-medium text-center hover:bg-blue-200 transition-colors"
            >
              Tenants ({propertyTenants.length})
            </Link>
            <Link
              to={`/dashboard/payments?propertyId=${property._id}`}
              className="bg-green-100 text-green-800 py-2 px-3 rounded-xl text-xs font-medium text-center hover:bg-green-200 transition-colors"
            >
              Payments
            </Link>
            <Link
              to={`/dashboard/expenses?propertyId=${property._id}`}
              className="bg-red-100 text-red-800 py-2 px-3 rounded-xl text-xs font-medium text-center hover:bg-red-200 transition-colors"
            >
              Expenses
            </Link>
          </div>
        </div>
      </div>
    </UniversalCard>
  );
};

export default EnhancedPropertyCard;