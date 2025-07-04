import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ArrowUp, ArrowDown, Plus, Download } from 'lucide-react';
import apiClient from '../api/client';
import { useCurrency } from '../contexts/CurrencyContext';
import AddCashFlowModal from '../components/common/AddCashFlowModal';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import MessageButtons from '../components/common/MessageButtons';

const fetchCashFlow = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/cashflow');
    return data.data || { income: 0, expenses: 0, netFlow: 0, monthlyData: [] };
  } catch (error) {
    console.error('Failed to fetch cash flow:', error);
    return { income: 0, expenses: 0, netFlow: 0, monthlyData: [] };
  }
};

const CashFlowPage = () => {
  const { currency } = useCurrency();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: cashFlow, isLoading } = useQuery({
    queryKey: ['cashFlow'],
    queryFn: fetchCashFlow,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading cash flow...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Cash Flow</h1>
          <p className="text-text-secondary mt-1">Track income and expenses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            Add Record
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <ArrowUp size={24} className="text-white" />
            </div>
            <span className="text-green-500 text-sm font-medium">Income</span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            {currency}{cashFlow?.income?.toLocaleString() || '0'}
          </h3>
          <p className="text-text-secondary text-sm mt-1">Total income this month</p>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <ArrowDown size={24} className="text-white" />
            </div>
            <span className="text-red-500 text-sm font-medium">Expenses</span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            {currency}{cashFlow?.expenses?.toLocaleString() || '0'}
          </h3>
          <p className="text-text-secondary text-sm mt-1">Total expenses this month</p>
        </div>

        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              (cashFlow?.netFlow || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className={`text-sm font-medium ${
              (cashFlow?.netFlow || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              Net Flow
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${
            (cashFlow?.netFlow || 0) >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {currency}{cashFlow?.netFlow?.toLocaleString() || '0'}
          </h3>
          <p className="text-text-secondary text-sm mt-1">Net cash flow this month</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Monthly Breakdown</h2>
        {cashFlow?.monthlyData?.length > 0 ? (
          <div className="space-y-4">
            {cashFlow.monthlyData.map((month: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                <div>
                  <p className="font-medium text-text-primary">{month.month}</p>
                  <p className="text-sm text-text-secondary">Net: {currency}{month.net?.toLocaleString() || '0'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-green-500">+{currency}{month.income?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-red-500">-{currency}{month.expenses?.toLocaleString() || '0'}</p>
                  </div>
                  <MessageButtons
                    email="finance@company.com"
                    name="Finance Team"
                    customMessage={`Cash flow report for ${month.month}: Net ${currency}${month.net?.toLocaleString() || '0'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary">No cash flow data available yet.</p>
            <p className="text-text-secondary text-sm mt-1">Data will appear as you record payments and expenses.</p>
          </div>
        )}
      </div>
      
      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search cash flow records..."
        showStatusFilter={false}
      />
      
      <AddCashFlowModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={cashFlow?.monthlyData || []}
        filename="cashflow"
        filters={searchFilters}
        title="Export Cash Flow"
      />
    </motion.div>
  );
};

export default CashFlowPage;