import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ArrowUp, ArrowDown, Plus, Download, Sparkles, BarChart3, PieChart } from 'lucide-react';
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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              Cash Flow
            </span>
            <Sparkles size={28} className="text-brand-orange animate-pulse" />
          </h1>
          <p className="text-text-secondary mt-2">
            Track income, expenses, and financial performance
          </p>
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
            className="group btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={14} className="text-white" />
            </div>
            Add Record
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group app-surface rounded-3xl p-6 border border-app-border hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <ArrowUp size={24} className="text-white" />
              </div>
              <span className="text-green-500 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">Income</span>
            </div>
            <h3 className="text-3xl font-bold text-text-primary group-hover:text-green-600 transition-colors">
              {currency}{cashFlow?.income?.toLocaleString() || '0'}
            </h3>
            <p className="text-text-secondary text-sm mt-2">Total income this month</p>
          </div>
        </div>

        <div className="group app-surface rounded-3xl p-6 border border-app-border hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-500/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <ArrowDown size={24} className="text-white" />
              </div>
              <span className="text-red-500 text-sm font-semibold bg-red-100 px-3 py-1 rounded-full">Expenses</span>
            </div>
            <h3 className="text-3xl font-bold text-text-primary group-hover:text-red-600 transition-colors">
              {currency}{cashFlow?.expenses?.toLocaleString() || '0'}
            </h3>
            <p className="text-text-secondary text-sm mt-2">Total expenses this month</p>
          </div>
        </div>

        <div className={`group app-surface rounded-3xl p-6 border border-app-border hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden ${
          (cashFlow?.netFlow || 0) >= 0 
            ? 'hover:shadow-green-500/10 hover:border-green-500/30' 
            : 'hover:shadow-red-500/10 hover:border-red-500/30'
        }`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ${
            (cashFlow?.netFlow || 0) >= 0 
              ? 'bg-gradient-to-br from-green-500/5 to-emerald-500/5' 
              : 'bg-gradient-to-br from-red-500/5 to-rose-500/5'
          }`}></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${
                (cashFlow?.netFlow || 0) >= 0 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              }`}>
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                (cashFlow?.netFlow || 0) >= 0 
                  ? 'text-green-500 bg-green-100' 
                  : 'text-red-500 bg-red-100'
              }`}>
                Net Flow
              </span>
            </div>
            <h3 className={`text-3xl font-bold transition-colors ${
              (cashFlow?.netFlow || 0) >= 0 
                ? 'text-green-500 group-hover:text-green-600' 
                : 'text-red-500 group-hover:text-red-600'
            }`}>
              {currency}{cashFlow?.netFlow?.toLocaleString() || '0'}
            </h3>
            <p className="text-text-secondary text-sm mt-2">Net cash flow this month</p>
          </div>
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