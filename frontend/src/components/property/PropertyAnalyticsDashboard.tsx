import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Wrench, Calendar } from 'lucide-react';

interface PropertyAnalyticsDashboardProps {
  propertyId: string;
  property: any;
  tenants: any[];
  payments: any[];
  expenses: any[];
  maintenanceRequests: any[];
}

const PropertyAnalyticsDashboard: React.FC<PropertyAnalyticsDashboardProps> = ({
  propertyId,
  property,
  tenants,
  payments,
  expenses,
  maintenanceRequests
}) => {
  // Calculate analytics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const thisMonthPayments = payments.filter(p => {
    const date = new Date(p.paymentDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const lastMonthPayments = payments.filter(p => {
    const date = new Date(p.paymentDate);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  const thisMonthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const thisMonthExpenseTotal = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netIncome = thisMonthRevenue - thisMonthExpenseTotal;

  const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  const occupancyRate = property.numberOfUnits > 0 ? (tenants.filter(t => t.status === 'Active').length / property.numberOfUnits) * 100 : 0;

  // Tenant turnover (simplified)
  const inactiveTenants = tenants.filter(t => t.status === 'Inactive').length;
  const turnoverRate = tenants.length > 0 ? (inactiveTenants / tenants.length) * 100 : 0;

  // Maintenance cost analysis
  const maintenanceCosts = maintenanceRequests.reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <div className="app-surface rounded-3xl p-8 border border-app-border">
      <h2 className="text-xl font-bold text-text-primary mb-6">Property Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Trend */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-white" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              revenueGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {revenueGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            ${thisMonthRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Monthly Revenue</div>
          <div className="text-xs text-green-600 mt-2">
            vs ${lastMonthRevenue.toLocaleString()} last month
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              occupancyRate >= 90 ? 'bg-green-100 text-green-800' :
              occupancyRate >= 70 ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {occupancyRate >= 90 ? 'Excellent' : occupancyRate >= 70 ? 'Good' : 'Needs Attention'}
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {occupancyRate.toFixed(1)}%
          </div>
          <div className="text-sm text-blue-700">Occupancy Rate</div>
          <div className="text-xs text-blue-600 mt-2">
            {tenants.filter(t => t.status === 'Active').length} of {property.numberOfUnits} units
          </div>
        </div>

        {/* Net Income */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              netIncome >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {netIncome >= 0 ? 'Profit' : 'Loss'}
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${
            netIncome >= 0 ? 'text-purple-600' : 'text-red-600'
          }`}>
            ${Math.abs(netIncome).toLocaleString()}
          </div>
          <div className="text-sm text-purple-700">Net Income</div>
          <div className="text-xs text-purple-600 mt-2">
            Revenue: ${thisMonthRevenue.toLocaleString()} - Expenses: ${thisMonthExpenseTotal.toLocaleString()}
          </div>
        </div>

        {/* Maintenance Cost */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Wrench size={24} className="text-white" />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              maintenanceRequests.filter(m => m.status === 'Open').length === 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {maintenanceRequests.filter(m => m.status === 'Open').length} Open
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-1">
            ${maintenanceCosts.toLocaleString()}
          </div>
          <div className="text-sm text-orange-700">Maintenance Costs</div>
          <div className="text-xs text-orange-600 mt-2">
            {maintenanceRequests.length} total requests
          </div>
        </div>
      </div>

      {/* Tenant Turnover & Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tenant Turnover Rate</span>
              <span className="font-medium text-gray-900">{turnoverRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Rent per Unit</span>
              <span className="font-medium text-gray-900">
                ${tenants.length > 0 ? (tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0) / tenants.length).toFixed(0) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Maintenance per Unit</span>
              <span className="font-medium text-gray-900">
                ${property.numberOfUnits > 0 ? (maintenanceCosts / property.numberOfUnits).toFixed(0) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Insights</h3>
          <div className="space-y-2">
            {occupancyRate === 100 && (
              <div className="text-sm text-green-600">🎉 Fully occupied property!</div>
            )}
            {revenueGrowth > 10 && (
              <div className="text-sm text-green-600">📈 Strong revenue growth this month</div>
            )}
            {maintenanceRequests.filter(m => m.status === 'Open').length > 3 && (
              <div className="text-sm text-orange-600">⚠️ Multiple open maintenance requests</div>
            )}
            {netIncome < 0 && (
              <div className="text-sm text-red-600">📉 Operating at a loss this month</div>
            )}
            {turnoverRate > 20 && (
              <div className="text-sm text-yellow-600">🔄 High tenant turnover rate</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalyticsDashboard;