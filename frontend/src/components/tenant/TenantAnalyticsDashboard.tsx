import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import apiClient from '../../api/client';

interface TenantAnalyticsDashboardProps {
  tenantId: string;
  className?: string;
}

const TenantAnalyticsDashboard: React.FC<TenantAnalyticsDashboardProps> = ({ tenantId, className = '' }) => {
  const { data: analytics } = useQuery({
    queryKey: ['tenantAnalytics', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}/analytics`);
      return data.data;
    },
    staleTime: 300000
  });

  const { data: stats } = useQuery({
    queryKey: ['tenantStats', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}/stats`);
      return data.data;
    },
    staleTime: 300000
  });

  if (!analytics || !stats) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const paymentScore = Math.round((stats.payments.paymentRate || 0));
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Financial Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Financial Overview</h3>
            <p className="text-sm text-gray-600">Payment history and trends</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-green-600">${stats.payments.totalAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Paid</div>
            <div className="text-xs text-gray-500">{stats.payments.total} payments</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">${stats.payments.monthlyPaid.toLocaleString()}</div>
            <div className="text-sm text-gray-600">This Month</div>
            <div className="text-xs text-gray-500">Current period</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className={`text-2xl font-bold ${stats.payments.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${stats.payments.outstanding.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Outstanding</div>
            <div className="text-xs text-gray-500">Current balance</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className={`text-2xl font-bold text-${getScoreColor(paymentScore)}-600`}>
              {paymentScore}%
            </div>
            <div className="text-sm text-gray-600">Payment Score</div>
            <div className="text-xs text-gray-500">Punctuality rate</div>
          </div>
        </div>
      </div>

      {/* Payment Timeline */}
      {analytics.monthlyPayments && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">Payment Timeline</h3>
          </div>
          
          <div className="flex items-end gap-2 h-32">
            {analytics.monthlyPayments.map((month: any, index: number) => {
              const maxAmount = Math.max(...analytics.monthlyPayments.map((m: any) => m.payments));
              const height = maxAmount > 0 ? (month.payments / maxAmount) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-purple-600"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '2px' }}
                    title={`${month.month}: $${month.payments}`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                    {month.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Behavioral Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={20} className="text-green-600" />
            <h3 className="font-bold text-lg text-gray-900">Payment Behavior</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On-time Payments</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${paymentScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{paymentScore}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Days Late</span>
              <span className="text-sm font-medium">
                {stats.payments.total > 0 ? Math.round((stats.lease.monthsSinceStart - stats.payments.total) * 30 / stats.payments.total) : 0} days
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Communication</span>
              <div className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm font-medium">Responsive</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} className="text-purple-600" />
            <h3 className="font-bold text-lg text-gray-900">Lease Insights</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tenure</span>
              <span className="text-sm font-medium">{stats.lease.monthsSinceStart} months</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Renewal Probability</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(paymentScore + 10, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.min(paymentScore + 10, 100)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance Requests</span>
              <span className="text-sm font-medium">{stats.maintenance.total} total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-orange-600" />
          <h3 className="font-bold text-lg text-gray-900">Risk Assessment</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${paymentScore >= 80 ? 'text-green-600' : paymentScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {paymentScore >= 80 ? 'Low' : paymentScore >= 60 ? 'Medium' : 'High'}
              </div>
              <div className="text-sm text-gray-600">Payment Risk</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.maintenance.open === 0 ? 'Low' : stats.maintenance.open <= 2 ? 'Medium' : 'High'}
              </div>
              <div className="text-sm text-gray-600">Maintenance Risk</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.lease.monthsSinceStart >= 12 ? 'Low' : 'Medium'}
              </div>
              <div className="text-sm text-gray-600">Turnover Risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAnalyticsDashboard;