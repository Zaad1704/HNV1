import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { BarChart3, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface TenantAnalyticsProps {
  tenantId: string;
  tenant?: any;
}

const TenantAnalyticsDashboard: React.FC<TenantAnalyticsProps> = ({ tenantId, tenant }) => {
  const [timeRange, setTimeRange] = useState('12months');

  const { data: analytics } = useQuery({
    queryKey: ['tenantAnalytics', tenantId, timeRange],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}/analytics?range=${timeRange}`);
      return data.data;
    }
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['tenantPaymentHistory', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payments?tenantId=${tenantId}`);
      return data.data || [];
    }
  });

  const { data: maintenanceHistory } = useQuery({
    queryKey: ['tenantMaintenanceHistory', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/maintenance?tenantId=${tenantId}`);
      return data.data || [];
    }
  });

  // Calculate payment history chart data
  const getPaymentChartData = () => {
    if (!paymentHistory) return [];
    
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        payments: paymentHistory.filter((p: any) => {
          const paymentDate = new Date(p.paymentDate);
          return paymentDate.getMonth() === date.getMonth() && 
                 paymentDate.getFullYear() === date.getFullYear();
        }).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
      };
    }).reverse();
    
    return last12Months;
  };

  // Calculate maintenance trends
  const getMaintenanceTrends = () => {
    if (!maintenanceHistory) return { total: 0, open: 0, avgResolutionTime: 0 };
    
    const total = maintenanceHistory.length;
    const open = maintenanceHistory.filter((m: any) => m.status === 'Open').length;
    
    const resolved = maintenanceHistory.filter((m: any) => m.status === 'Closed' && m.resolvedAt);
    const avgResolutionTime = resolved.length > 0 
      ? resolved.reduce((sum: number, m: any) => {
          const created = new Date(m.createdAt);
          const resolved = new Date(m.resolvedAt);
          return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / resolved.length
      : 0;
    
    return { total, open, avgResolutionTime: Math.round(avgResolutionTime) };
  };

  // Calculate lease renewal prediction
  const getLeaseRenewalData = () => {
    if (!tenant?.leaseEndDate) return null;
    
    const daysUntilExpiry = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const paymentRate = paymentHistory ? 
      (paymentHistory.length / Math.max(1, Math.ceil((new Date().getTime() - new Date(tenant.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)))) * 100 : 0;
    
    const maintenanceScore = maintenanceHistory ? 
      Math.max(0, 100 - (maintenanceHistory.filter((m: any) => m.status === 'Open').length * 20)) : 100;
    
    const renewalScore = Math.round((paymentRate * 0.7) + (maintenanceScore * 0.3));
    
    return {
      daysUntilExpiry,
      renewalScore,
      recommendation: renewalScore >= 80 ? 'High' : renewalScore >= 60 ? 'Medium' : 'Low'
    };
  };

  const chartData = getPaymentChartData();
  const maintenanceTrends = getMaintenanceTrends();
  const leaseRenewalData = getLeaseRenewalData();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">Analytics Dashboard</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Payment History Chart */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary">Payment History</h4>
            <p className="text-sm text-text-secondary">Monthly payment trends</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {chartData.map((month, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium w-16">{month.month}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (month.payments / (tenant?.rentAmount || 1000)) * 100)}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-green-600 w-16 text-right">
                ${month.payments}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Trends */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary">Maintenance Trends</h4>
            <p className="text-sm text-text-secondary">Request patterns and resolution</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-2xl font-bold text-orange-600">{maintenanceTrends.total}</p>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-2xl font-bold text-red-600">{maintenanceTrends.open}</p>
            <p className="text-sm text-gray-600">Open Issues</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{maintenanceTrends.avgResolutionTime}</p>
            <p className="text-sm text-gray-600">Avg Days</p>
          </div>
        </div>
      </div>

      {/* Lease Renewal Tracking */}
      {leaseRenewalData && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">Lease Renewal Prediction</h4>
              <p className="text-sm text-text-secondary">AI-powered renewal likelihood</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-xl">
              <p className={`text-2xl font-bold ${
                leaseRenewalData.daysUntilExpiry <= 30 ? 'text-red-600' : 
                leaseRenewalData.daysUntilExpiry <= 90 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {leaseRenewalData.daysUntilExpiry}
              </p>
              <p className="text-sm text-gray-600">Days Until Expiry</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <p className={`text-2xl font-bold ${
                leaseRenewalData.renewalScore >= 80 ? 'text-green-600' :
                leaseRenewalData.renewalScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {leaseRenewalData.renewalScore}%
              </p>
              <p className="text-sm text-gray-600">Renewal Score</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                leaseRenewalData.recommendation === 'High' ? 'bg-green-100 text-green-800' :
                leaseRenewalData.recommendation === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {leaseRenewalData.recommendation === 'High' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {leaseRenewalData.recommendation}
              </div>
              <p className="text-sm text-gray-600 mt-2">Likelihood</p>
            </div>
          </div>
          
          {leaseRenewalData.daysUntilExpiry <= 60 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                <span className="font-medium text-yellow-800">Action Required</span>
              </div>
              <p className="text-sm text-yellow-700">
                Lease expires in {leaseRenewalData.daysUntilExpiry} days. 
                {leaseRenewalData.recommendation === 'High' 
                  ? ' Consider initiating renewal discussions.'
                  : leaseRenewalData.recommendation === 'Medium'
                  ? ' Review tenant performance before renewal.'
                  : ' Evaluate tenant relationship and consider alternatives.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Financial Performance Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary">Financial Performance</h4>
            <p className="text-sm text-text-secondary">Revenue and payment metrics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-xl font-bold text-green-600">
              ${paymentHistory?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-xl font-bold text-blue-600">
              {paymentHistory?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Payments Made</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-xl font-bold text-purple-600">
              {Math.round((paymentHistory?.length || 0) / Math.max(1, Math.ceil((new Date().getTime() - new Date(tenant?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30))) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Payment Rate</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-xl font-bold text-orange-600">
              ${tenant?.rentAmount || 0}
            </p>
            <p className="text-sm text-gray-600">Monthly Rent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAnalyticsDashboard;