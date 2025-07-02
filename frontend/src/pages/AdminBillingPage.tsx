import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, CreditCard, Calendar, Download, Filter, Search, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import apiClient from '../api/client';

interface BillingData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  recentTransactions: Transaction[];
  revenueChart: ChartData[];
}

interface Transaction {
  _id: string;
  organizationName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  planName: string;
}

interface ChartData {
  month: string;
  revenue: number;
  subscriptions: number;
}

const fetchBillingData = async (): Promise<BillingData> => {
  try {
    const { data } = await apiClient.get('/super-admin/billing');
    return data.data;
  } catch (error) {
    console.error('Failed to fetch billing data:', error);
    throw error;
  }
};

const AdminBillingPage = () => {
  const [timeRange, setTimeRange] = useState('12months');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: billingData, isLoading, error } = useQuery({
    queryKey: ['adminBilling', timeRange],
    queryFn: fetchBillingData,
    retry: 3,
    retryDelay: 1000
  });

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Billing Data Error</h2>
        <p className="text-text-secondary mb-4">Failed to load billing information. Please try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const data = billingData || {
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    recentTransactions: [],
    revenueChart: []
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = data.recentTransactions.filter(transaction => {
    const matchesSearch = transaction.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="text-center p-8 text-text-secondary">Loading billing data...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Billing & Revenue</h1>
          <p className="text-text-secondary mt-1">Monitor platform revenue and subscriptions</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-app-border rounded-xl bg-app-surface text-text-primary"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
          <button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-text-primary">
                ${data.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-text-secondary">vs last month</span>
          </div>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-text-primary">
                ${data.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-green-600 font-medium">+8.2%</span>
            <span className="text-text-secondary">vs last month</span>
          </div>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active Subscriptions</p>
              <p className="text-3xl font-bold text-text-primary">
                {data.activeSubscriptions}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <CreditCard size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-green-600 font-medium">+15</span>
            <span className="text-text-secondary">new this month</span>
          </div>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Churn Rate</p>
              <p className="text-3xl font-bold text-text-primary">
                {data.churnRate}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">-0.5%</span>
            <span className="text-text-secondary">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="app-surface rounded-3xl p-8 border border-app-border">
          <h3 className="text-xl font-bold text-text-primary mb-6">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--app-surface)', 
                  border: '1px solid var(--app-border)',
                  borderRadius: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="app-surface rounded-3xl p-8 border border-app-border">
          <h3 className="text-xl font-bold text-text-primary mb-6">Subscription Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--app-surface)', 
                  border: '1px solid var(--app-border)',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="subscriptions" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary">Recent Transactions</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-app-border rounded-xl bg-app-surface text-text-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-app-border rounded-xl bg-app-surface text-text-primary"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-app-border">
              <tr>
                <th className="text-left py-3 font-semibold text-text-secondary">Organization</th>
                <th className="text-left py-3 font-semibold text-text-secondary">Plan</th>
                <th className="text-left py-3 font-semibold text-text-secondary">Amount</th>
                <th className="text-left py-3 font-semibold text-text-secondary">Status</th>
                <th className="text-left py-3 font-semibold text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-app-bg transition-colors">
                  <td className="py-4 font-medium text-text-primary">
                    {transaction.organizationName}
                  </td>
                  <td className="py-4 text-text-secondary">
                    {transaction.planName}
                  </td>
                  <td className="py-4 font-semibold text-text-primary">
                    ${(transaction.amount / 100).toFixed(2)}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 text-text-secondary">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminBillingPage;