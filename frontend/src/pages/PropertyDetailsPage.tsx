import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, DollarSign, Calendar, Edit, TrendingUp, X, Wrench, Trash2, Share2, BarChart3 } from 'lucide-react';
import RentIncreaseModal from '../components/common/RentIncreaseModal';
import EditPropertyModal from '../components/common/EditPropertyModal';
import DataPreviewSections from '../components/property/DataPreviewSections';
import UnitDataModal from '../components/property/UnitDataModal';

// Units & Tenants Component
const UnitsTenantsSection = ({ propertyId, property, tenants, onUnitDataClick }: { propertyId: string, property: any, tenants: any[], onUnitDataClick: (unitNumber: string) => void }) => {
  // Generate all units based on property numberOfUnits
  const allUnits = Array.from({ length: property.numberOfUnits || 1 }, (_, i) => {
    const unitNumber = (i + 1).toString();
    const tenant = tenants.find(t => t.unit === unitNumber);
    
    return {
      unitNumber,
      tenant,
      isOccupied: !!tenant,
      status: tenant ? tenant.status : 'Vacant'
    };
  });

  const occupiedUnits = allUnits.filter(unit => unit.isOccupied).length;
  const vacantUnits = allUnits.filter(unit => !unit.isOccupied).length;

  return (
    <div className="app-surface rounded-3xl p-8 border border-app-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Units & Tenants</h2>
          <p className="text-sm text-text-secondary">
            {occupiedUnits} Occupied • {vacantUnits} Vacant • {property.numberOfUnits} Total
          </p>
        </div>
        <Link 
          to={`/dashboard/tenants/add?propertyId=${propertyId}`}
          className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
        >
          Add Tenant
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allUnits.map((unit) => (
          <div
            key={unit.unitNumber}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              unit.isOccupied 
                ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100' 
                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => {
              window.location.href = `/dashboard/properties/${propertyId}/units/${unit.unitNumber}`;
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  unit.isOccupied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-400 text-white'
                }`}>
                  {unit.isOccupied ? <Users size={16} /> : <Users size={16} />}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Unit {unit.unitNumber}</h3>
                  <p className={`text-xs font-medium ${
                    unit.isOccupied ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {unit.isOccupied ? 'Occupied' : 'Vacant'}
                  </p>
                </div>
              </div>
              
              {unit.isOccupied && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  unit.tenant.status === 'Active' 
                    ? 'bg-green-100 text-green-800'
                    : unit.tenant.status === 'Late'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {unit.tenant.status}
                </span>
              )}
            </div>
            
            {unit.isOccupied ? (
              <div>
                <p className="font-medium text-text-primary mb-1">{unit.tenant.name}</p>
                <p className="text-sm text-text-secondary mb-2">{unit.tenant.email}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-text-secondary">Monthly Rent</span>
                  <span className="font-semibold text-text-primary">${unit.tenant.rentAmount || 0}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnitDataClick(unit.unitNumber);
                  }}
                  className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <BarChart3 size={14} />
                  View Unit Data
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 mb-2">Unit Available</p>
                <p className="text-xs text-blue-600 font-medium">Click to add tenant</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {allUnits.length === 0 && (
        <div className="text-center py-8">
          <Users size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-4">No units configured</p>
        </div>
      )}
    </div>
  );
};

// Property Stats Component
const PropertyStatsSection = ({ propertyId }: { propertyId: string }) => {
  const { data: propertyStats } = useQuery({
    queryKey: ['propertyStats', propertyId],
    queryFn: async () => {
      const [tenantsRes, paymentsRes, expensesRes, maintenanceRes] = await Promise.all([
        apiClient.get(`/tenants?propertyId=${propertyId}`),
        apiClient.get(`/payments?propertyId=${propertyId}`),
        apiClient.get(`/expenses?propertyId=${propertyId}`),
        apiClient.get(`/maintenance?propertyId=${propertyId}`)
      ]);
      
      const tenants = tenantsRes.data.data || [];
      const payments = paymentsRes.data.data || [];
      const expenses = expensesRes.data.data || [];
      const maintenance = maintenanceRes.data.data || [];
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyPayments = payments.filter((p: any) => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      
      const monthlyExpenses = expenses.filter((e: any) => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });
      
      const monthlyIncome = monthlyPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const monthlyExpenseTotal = monthlyExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const netCashFlow = monthlyIncome - monthlyExpenseTotal;
      
      const activeTenants = tenants.filter((t: any) => t.status === 'Active').length;
      const openMaintenance = maintenance.filter((m: any) => m.status === 'Open').length;
      const totalPayments = payments.length;
      const totalExpenses = expenses.length;
      
      return {
        tenants: {
          total: tenants.length,
          active: activeTenants,
          inactive: tenants.length - activeTenants
        },
        payments: {
          total: totalPayments,
          monthlyIncome,
          totalIncome: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
        },
        expenses: {
          total: totalExpenses,
          monthlyTotal: monthlyExpenseTotal,
          totalExpenses: expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
        },
        maintenance: {
          total: maintenance.length,
          open: openMaintenance,
          closed: maintenance.length - openMaintenance
        },
        cashFlow: {
          monthly: netCashFlow,
          yearly: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) - expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
        }
      };
    }
  });

  if (!propertyStats) {
    return (
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface rounded-3xl p-8 border border-app-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Property Statistics</h2>
        <div className="text-sm text-text-secondary">
          Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {/* Tenants */}
        <Link 
          to={`/dashboard/tenants?propertyId=${propertyId}`}
          className="bg-blue-50 p-6 rounded-2xl border border-blue-200 hover:bg-blue-100 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Tenants</p>
              <p className="text-2xl font-bold text-blue-800">{propertyStats.tenants.total}</p>
            </div>
          </div>
          <div className="text-xs text-blue-600">
            {propertyStats.tenants.active} Active • {propertyStats.tenants.inactive} Inactive
          </div>
        </Link>
        
        {/* Payments */}
        <Link 
          to={`/dashboard/payments?propertyId=${propertyId}`}
          className="bg-green-50 p-6 rounded-2xl border border-green-200 hover:bg-green-100 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Payments</p>
              <p className="text-2xl font-bold text-green-800">{propertyStats.payments.total}</p>
            </div>
          </div>
          <div className="text-xs text-green-600">
            ${propertyStats.payments.monthlyIncome.toFixed(0)} This Month
          </div>
        </Link>
        
        {/* Expenses */}
        <Link 
          to={`/dashboard/expenses?propertyId=${propertyId}`}
          className="bg-red-50 p-6 rounded-2xl border border-red-200 hover:bg-red-100 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Expenses</p>
              <p className="text-2xl font-bold text-red-800">{propertyStats.expenses.total}</p>
            </div>
          </div>
          <div className="text-xs text-red-600">
            ${propertyStats.expenses.monthlyTotal.toFixed(0)} This Month
          </div>
        </Link>
        
        {/* Maintenance */}
        <Link 
          to={`/dashboard/maintenance?propertyId=${propertyId}`}
          className="bg-orange-50 p-6 rounded-2xl border border-orange-200 hover:bg-orange-100 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Maintenance</p>
              <p className="text-2xl font-bold text-orange-800">{propertyStats.maintenance.total}</p>
            </div>
          </div>
          <div className="text-xs text-orange-600">
            {propertyStats.maintenance.open} Open • {propertyStats.maintenance.closed} Closed
          </div>
        </Link>
      </div>
      
      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border-2 ${
          propertyStats.cashFlow.monthly >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            propertyStats.cashFlow.monthly >= 0 ? 'text-green-800' : 'text-red-800'
          }`}>
            Monthly Cash Flow
          </h3>
          <p className={`text-3xl font-bold ${
            propertyStats.cashFlow.monthly >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${propertyStats.cashFlow.monthly.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Income: ${propertyStats.payments.monthlyIncome.toFixed(2)} - Expenses: ${propertyStats.expenses.monthlyTotal.toFixed(2)}
          </p>
        </div>
        
        <div className={`p-6 rounded-2xl border-2 ${
          propertyStats.cashFlow.yearly >= 0 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            propertyStats.cashFlow.yearly >= 0 ? 'text-blue-800' : 'text-red-800'
          }`}>
            Total Cash Flow
          </h3>
          <p className={`text-3xl font-bold ${
            propertyStats.cashFlow.yearly >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            ${propertyStats.cashFlow.yearly.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Total Income: ${propertyStats.payments.totalIncome.toFixed(2)} - Total Expenses: ${propertyStats.expenses.totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Rent Status Component
const RentStatusSection = ({ propertyId }: { propertyId: string }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: rentStatus } = useQuery({
    queryKey: ['rentStatus', propertyId, selectedYear],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}/rent-status/${selectedYear}`);
      return data.data;
    }
  });

  const { data: monthDetails } = useQuery({
    queryKey: ['monthDetails', propertyId, selectedMonth],
    queryFn: async () => {
      if (!selectedMonth) return null;
      const { data } = await apiClient.get(`/properties/${propertyId}/rent-details/${selectedMonth}`);
      return data.data;
    },
    enabled: !!selectedMonth
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  };

  return (
    <div className="app-surface rounded-3xl p-8 border border-app-border space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Rent Status Overview</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {getAvailableYears().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {rentStatus && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSelectedMonth('paid-summary');
                setShowDetails(true);
              }}
              className="bg-green-50 p-4 rounded-xl border border-green-200 hover:bg-green-100 transition-colors text-left"
            >
              <h3 className="font-semibold text-green-800">Paid This Year</h3>
              <p className="text-2xl font-bold text-green-600">${rentStatus.totalPaid?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-green-600">{rentStatus.paidCount || 0} tenants paid</p>
            </button>
            <button
              onClick={() => {
                setSelectedMonth('due-summary');
                setShowDetails(true);
              }}
              className="bg-red-50 p-4 rounded-xl border border-red-200 hover:bg-red-100 transition-colors text-left"
            >
              <h3 className="font-semibold text-red-800">Outstanding</h3>
              <p className="text-2xl font-bold text-red-600">${rentStatus.totalDue?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-red-600">{rentStatus.dueCount || 0} tenants owe</p>
            </button>
          </div>

          {/* Monthly Breakdown */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {months.map((month, index) => {
              const monthData = rentStatus.months?.[index] || { paid: 0, due: 0 };
              const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
              
              return (
                <button
                  key={month}
                  onClick={() => {
                    setSelectedMonth(monthKey);
                    setShowDetails(true);
                  }}
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <p className="font-medium text-sm">{month.slice(0, 3)}</p>
                  <p className="text-xs text-green-600">${monthData.paid?.toFixed(0) || '0'}</p>
                  <p className="text-xs text-red-600">${monthData.due?.toFixed(0) || '0'}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Month Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedMonth === 'paid-summary' ? 'All Paid Tenants' :
                 selectedMonth === 'due-summary' ? 'All Outstanding Tenants' :
                 `${months[parseInt(selectedMonth?.split('-')[1] || '1') - 1]} ${selectedYear} Details`}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Summary Views */}
              {selectedMonth === 'paid-summary' && rentStatus.paidTenantsList && (
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Tenants Who Paid ({rentStatus.paidTenantsList.length})</h4>
                  {rentStatus.paidTenantsList.map((tenant: any) => (
                    <Link
                      key={tenant._id}
                      to={`/dashboard/tenants/${tenant._id}`}
                      className="flex justify-between items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-600">Unit: {tenant.unit}</p>
                      </div>
                      <p className="font-semibold text-green-600">${tenant.rentAmount || 0}</p>
                    </Link>
                  ))}
                </div>
              )}
              
              {selectedMonth === 'due-summary' && rentStatus.dueTenantsList && (
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Tenants With Outstanding ({rentStatus.dueTenantsList.length})</h4>
                  {rentStatus.dueTenantsList.map((tenant: any) => (
                    <Link
                      key={tenant._id}
                      to={`/dashboard/tenants/${tenant._id}`}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-600">Unit: {tenant.unit}</p>
                      </div>
                      <p className="font-semibold text-red-600">${tenant.rentAmount || 0}</p>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Monthly Details */}
              {monthDetails && selectedMonth !== 'paid-summary' && selectedMonth !== 'due-summary' && (
                <>
                  {/* Paid Tenants */}
                  {monthDetails.paid?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">Paid ({monthDetails.paid.length})</h4>
                      {monthDetails.paid.map((payment: any) => (
                        <Link
                          key={payment._id}
                          to={`/dashboard/tenants/${payment.tenantId._id}`}
                          className="flex justify-between items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{payment.tenantId.name}</p>
                            <p className="text-sm text-gray-600">Unit: {payment.tenantId.unit}</p>
                          </div>
                          <p className="font-semibold text-green-600">${payment.amount}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Due Tenants */}
                  {monthDetails.due?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Outstanding ({monthDetails.due.length})</h4>
                      {monthDetails.due.map((tenant: any) => (
                        <Link
                          key={tenant._id}
                          to={`/dashboard/tenants/${tenant._id}`}
                          className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-sm text-gray-600">Unit: {tenant.unit}</p>
                          </div>
                          <p className="font-semibold text-red-600">${tenant.rentAmount || 0}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const fetchPropertyDetails = async (propertyId: string) => {
  const { data } = await apiClient.get(`/properties/${propertyId}`);
  return data.data;
};

const fetchPropertyTenants = async (propertyId: string) => {
  try {
    const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
    return data.data || [];
  } catch (error) {
    return [];
  }
};

const PropertyDetailsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const queryClient = useQueryClient();
  const [showRentIncrease, setShowRentIncrease] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUnitDataModal, setShowUnitDataModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  const handleUnitDataClick = (unitNumber: string) => {
    setSelectedUnit(unitNumber);
    setShowUnitDataModal(true);
  };
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchPropertyDetails(propertyId!),
    enabled: !!propertyId
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['propertyTenants', propertyId],
    queryFn: () => fetchPropertyTenants(propertyId!),
    enabled: !!propertyId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading property details...</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Property Not Found</h3>
        <p className="text-text-secondary mb-4">The property you're looking for doesn't exist.</p>
        <Link
          to="/dashboard/properties"
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/properties"
            className="p-2 rounded-xl hover:bg-app-bg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{property.name}</h1>
            <p className="text-text-secondary">Property Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-blue-600 transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${property.name}? This action cannot be undone.`)) {
                // Handle delete
                window.location.href = '/dashboard/properties';
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: property.name,
                  text: `Property: ${property.name}\nAddress: ${property.address?.formattedAddress || 'N/A'}\nUnits: ${property.numberOfUnits || 1}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Property link copied to clipboard!');
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-green-600 transition-colors"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image */}
          <div className="app-surface rounded-3xl overflow-hidden border border-app-border">
            <div className="h-64 bg-gradient-to-br from-brand-blue to-brand-orange relative">
              {property.imageUrl && property.imageUrl.trim() !== '' ? (
                <>
                  <img
                    src={property.imageUrl.startsWith('/') ? `${window.location.origin}${property.imageUrl}` : property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Property image failed to load:', property.imageUrl);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="fallback-icon hidden w-full h-full flex items-center justify-center absolute inset-0">
                    <Users size={48} className="text-white/80" />
                  </div>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-1 rounded">
                      {property.imageUrl}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users size={48} className="text-white/80" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  property.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Property Description</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI Generated</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {property.description || 'Generating description...'}
            </p>
          </div>

          {/* NEW: Data Preview Sections */}
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Property Data Overview</h2>
                <p className="text-sm text-text-secondary">
                  Recent activity and data across all property operations
                </p>
              </div>
            </div>
            <DataPreviewSections propertyId={propertyId!} property={property} tenants={tenants} />
          </div>

          {/* Property Statistics */}
          <PropertyStatsSection propertyId={propertyId!} />
          
          {/* Rent Status Overview */}
          <RentStatusSection propertyId={propertyId!} />

          {/* Units & Tenants List */}
          <UnitsTenantsSection propertyId={propertyId!} property={property} tenants={tenants} onUnitDataClick={handleUnitDataClick} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Property Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Address</p>
                  <p className="font-medium text-text-primary">
                    {property.address?.formattedAddress || 'Address not available'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Units</p>
                  <p className="font-medium text-text-primary">
                    {property.numberOfUnits} {property.numberOfUnits === 1 ? 'Unit' : 'Units'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Property Type</p>
                  <p className="font-medium text-text-primary">
                    {property.propertyType || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Created</p>
                  <p className="font-medium text-text-primary">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to={`/dashboard/tenants?propertyId=${propertyId}`}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors block text-center"
              >
                View Tenants ({tenants.length})
              </Link>
              <Link 
                to={`/dashboard/tenants/add?propertyId=${propertyId}`}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors block text-center"
              >
                Add Tenant
              </Link>
              <Link 
                to={`/dashboard/payments?propertyId=${propertyId}`}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors block text-center"
              >
                View Payments
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Archive ${property.name}? This will hide it from active listings.`)) {
                    // Handle archive
                    fetch(`/api/properties/${propertyId}/archive`, { method: 'PATCH' })
                      .then(() => window.location.reload());
                  }
                }}
                className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Archive Property
              </button>
              <button
                onClick={() => setShowRentIncrease(true)}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp size={16} />
                Increase Rent
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <RentIncreaseModal
        isOpen={showRentIncrease}
        onClose={() => setShowRentIncrease(false)}
        property={property}
        type="property"
      />
      
      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onPropertyUpdated={(updatedProperty) => {
          queryClient.setQueryData(['property', propertyId], updatedProperty);
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        }}
        property={property}
      />
      
      <UnitDataModal
        isOpen={showUnitDataModal}
        onClose={() => setShowUnitDataModal(false)}
        propertyId={propertyId!}
        unitNumber={selectedUnit}
        unitName={`Unit ${selectedUnit}`}
      />
    </motion.div>
  );
};

export default PropertyDetailsPage;