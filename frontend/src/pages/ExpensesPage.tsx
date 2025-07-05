import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Calendar, Tag, Building, Download } from 'lucide-react';
import apiClient from '../api/client';
import { useCurrency } from '../contexts/CurrencyContext';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import AddExpenseModal from '../components/common/AddExpenseModal';
import MessageButtons from '../components/common/MessageButtons';
import { useQueryClient } from '@tanstack/react-query';
import { deleteExpense, confirmDelete, handleDeleteError, handleDeleteSuccess } from '../utils/deleteHelpers';

const fetchExpenses = async () => {
  try {
    const { data } = await apiClient.get('/expenses');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return [];
  }
};

const ExpensesPage = () => {
  const queryClient = useQueryClient();
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
  
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
    retry: 0
  });

  const handleExpenseAdded = (newExpense: any) => {
    queryClient.setQueryData(['expenses'], (old: any) => [...(old || []), newExpense]);
  };

  const handleDeleteExpense = async (expenseId: string, description: string) => {
    if (confirmDelete(description, 'expense')) {
      try {
        await deleteExpense(expenseId);
        queryClient.setQueryData(['expenses'], (old: any) => 
          (old || []).filter((e: any) => e._id !== expenseId)
        );
        handleDeleteSuccess('expense');
      } catch (error: any) {
        handleDeleteError(error, 'expense');
      }
    }
  };

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (searchFilters.query) {
      filtered = filtered.filter(expense => 
        expense.description?.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchFilters.query.toLowerCase())
      );
    }

    if (searchFilters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (searchFilters.dateRange) {
        case 'today': startDate.setHours(0, 0, 0, 0); break;
        case 'week': startDate.setDate(now.getDate() - 7); break;
        case 'month': startDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
        case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
        case 'custom': if (searchFilters.startDate) startDate = new Date(searchFilters.startDate); break;
      }
      
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate >= startDate;
      });
    }

    filtered.sort((a, b) => {
      const aValue = searchFilters.sortBy === 'amount' ? a.amount : new Date(a.date || a.createdAt);
      const bValue = searchFilters.sortBy === 'amount' ? b.amount : new Date(b.date || b.createdAt);
      return searchFilters.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [expenses, searchFilters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading expenses...</span>
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
          <h1 className="text-3xl font-bold text-text-primary">Expenses</h1>
          <p className="text-text-secondary mt-1">Track property expenses and costs ({filteredExpenses.length} expenses)</p>
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
            Add Expense
          </button>
        </div>
      </div>

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search expenses by description or category..."
        showStatusFilter={false}
      />

      {filteredExpenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses.map((expense: any, index: number) => (
            <motion.div
              key={expense._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {expense.category || 'Expense'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {currency}{expense.amount?.toLocaleString() || '0'}
              </h3>
              
              <p className="text-text-primary font-medium mb-3">
                {expense.description || 'No description'}
              </p>
              
              <div className="space-y-2 text-sm text-text-secondary mb-4">
                <div className="flex items-center gap-2">
                  <Building size={14} />
                  <span>{expense.propertyId?.name || 'General'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDeleteExpense(expense._id, expense.description)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  Delete
                </button>
                <MessageButtons
                  phone={expense.vendorPhone}
                  email={expense.vendorEmail}
                  name={expense.vendorName || 'Vendor'}
                  customMessage={`Expense record: ${expense.description} - ${currency}${expense.amount}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <DollarSign size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Expenses Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Start tracking expenses by adding your first expense.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add First Expense
          </button>
        </div>
      )}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={filteredExpenses}
        filename="expenses"
        filters={searchFilters}
        title="Export Expenses"
      />

      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </motion.div>
  );
};

export default ExpensesPage;