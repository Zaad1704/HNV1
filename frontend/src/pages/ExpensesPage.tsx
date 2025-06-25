// frontend/src/pages/ExpensesPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import LogExpenseModal from '../components/common/LogExpenseModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fetchExpenses = async (filters: any) => {
    const { data } = await apiClient.get('/expenses', { params: filters });
    return data.data;
};

const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filters] = useState({ propertyId: '', startDate: '', endDate: '' });

  const { data: expenses = [], isLoading, isError } = useQuery({ 
      queryKey: ['expenses', filters], 
      queryFn: () => fetchExpenses(filters) 
  });

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
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text dark:text-dark-text-dark">Manage Expenses</h1>
        <button onClick={() => setIsLogModalOpen(true)} className="btn-primary flex items-center space-x-2">
            <PlusCircle size={18} /><span>Log Expense</span>
        </button>
      </div>
      
       {isLoading ? <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading expenses...</div> : (
            <div className="bg-light-card rounded-3xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg/50 border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Description</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Date</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Category</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right dark:text-light-text-dark">Amount</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right dark:text-light-text-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                    {expenses.map((expense: any) => (
                        <tr key={expense._id} className="hover:bg-light-bg/50 dark:hover:bg-dark-bg/40">
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
    </motion.div>
  );
};

export default ExpensesPage;
