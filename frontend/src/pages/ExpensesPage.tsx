import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import LogExpenseModal from '../components/common/LogExpenseModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

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

  return (
    <div>
      <LogExpenseModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Expenses</h1>
        <button onClick={() => setIsLogModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-opacity-90 text-brand-dark font-bold rounded-lg shadow-md transition-colors">
            <PlusCircle size={18} /><span>Log Expense</span>
        </button>
      </div>
      
       {isLoading ? <div className="text-center p-8 text-dark-text">Loading expenses...</div> : (
            <div className="bg-light-card rounded-xl shadow-lg border border-border-color overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-dark-bg/50 border-b border-border-color">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Description</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Date</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Category</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Amount</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                    {expenses.map((expense: any) => (
                        <tr key={expense._id} className="hover:bg-dark-bg/40">
                            <td className="p-4 font-semibold text-dark-text">{expense.description}</td>
                            <td className="p-4 text-light-text">{expense.propertyId?.name || 'N/A'}</td>
                            <td className="p-4 text-light-text">{formatDate(expense.date)}</td>
                            <td className="p-4 text-light-text">{expense.category}</td>
                            <td className="p-4 text-right font-semibold text-red-400">-${expense.amount.toFixed(2)}</td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-gray-300 hover:bg-dark-bg rounded-md" title="Edit Expense"><Edit size={16}/></button>
                                    <button onClick={() => deleteMutation.mutate(expense._id)} className="p-2 text-red-400 hover:bg-dark-bg rounded-md" title="Delete Expense"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
       )}
    </div>
  );
};

export default ExpensesPage;
