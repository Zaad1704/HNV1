// frontend/src/pages/ExpensesPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import LogExpenseModal from '../components/common/LogExpenseModal';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import ExportModal from '../components/common/ExportModal';
import { PlusCircle, Edit, Trash2, Download, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDataExport } from '../hooks/useDataExport';

const fetchExpenses = async (filters: any) => {
    const { data } = await apiClient.get('/expenses', { params: filters });
    return data.data;
};

const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const { exportExpenses } = useDataExport();

  const { data: expenses = [], isLoading, isError } = useQuery({ 
      queryKey: ['expenses'], 
      queryFn: () => fetchExpenses({})
  });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter((expense: any) => {
      const matchesSearch = !searchQuery || 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.propertyId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !filters.category || expense.category === filters.category;
      
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, filters]);

  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Utilities', label: 'Utilities' },
        { value: 'Insurance', label: 'Insurance' },
        { value: 'Other', label: 'Other' }
      ]
    }
  ];

  const bulkActions = [
    {
      key: 'export',
      label: 'Export',
      icon: Download,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: async (ids: string[]) => {
        await exportExpenses({ format: 'xlsx', filters: { ids } });
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: 'bg-red-500 hover:bg-red-600 text-white',
      action: (ids: string[]) => {
        if (confirm('Delete selected expenses?')) {
          ids.forEach(id => deleteMutation.mutate(id));
        }
      }
    }
  ];

  const deleteMutation = useMutation({
      mutationFn: (expenseId: string) => apiClient.delete(`/expenses/${expenseId}`),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
      onError: (err: any) => alert(err.response?.data?.message || 'Delete failed.'),
  });

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.4 }}
        className="text-dark-text dark:text-dark-text-dark"
    >
      <LogExpenseModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-text dark:text-dark-text-dark">Manage Expenses</h1>
          <p className="text-text-secondary mt-1">Track and manage property expenses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button onClick={() => setIsLogModalOpen(true)} className="btn-primary flex items-center space-x-2">
            <PlusCircle size={18} /><span>Log Expense</span>
          </button>
        </div>
      </div>

      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        filters={filters}
        placeholder="Search expenses..."
        filterOptions={filterOptions}
      />
      
       {isLoading ? <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading expenses...</div> : (
            <div className="bg-light-card rounded-3xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg/50 border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Select</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Description</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Date</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Category</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right dark:text-light-text-dark">Amount</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right dark:text-light-text-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                    {filteredExpenses.map((expense: any) => (
                        <tr key={expense._id} className="hover:bg-light-bg/50 dark:hover:bg-dark-bg/40">
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={selectedExpenses.includes(expense._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedExpenses(prev => [...prev, expense._id]);
                                  } else {
                                    setSelectedExpenses(prev => prev.filter(id => id !== expense._id));
                                  }
                                }}
                                className="w-4 h-4 rounded border-2"
                              />
                            </td>
                            <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">{expense.description}</td>
                            <td className="p-4 text-light-text dark:text-light-text-dark">{expense.propertyId?.name || 'N/A'}</td>
                            <td className="p-4 text-light-text dark:text-light-text-dark">{formatDate(expense.date)}</td>
                            <td className="p-4 text-light-text dark:text-light-text-dark">{expense.category}</td>
                            <td className="p-4 text-right font-semibold text-red-500">-${expense.amount.toFixed(2)}</td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-light-text dark:text-light-text-dark hover:bg-light-bg dark:hover:bg-dark-bg rounded-md" title="Edit Expense"><Edit size={16}/></button>
                                    <button onClick={() => deleteMutation.mutate(expense._id)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" title="Delete Expense"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
       )}

      <BulkActions
        selectedItems={selectedExpenses}
        totalItems={filteredExpenses?.length || 0}
        onSelectAll={() => setSelectedExpenses(filteredExpenses?.map((e: any) => e._id) || [])}
        onClearSelection={() => setSelectedExpenses([])}
        actions={bulkActions}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        section="expenses"
        title="Expenses"
      />
    </motion.div>
  );
};

export default ExpensesPage;
