import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import LogExpenseModal from '../components/common/LogExpenseModal'; // We'll use the existing modal
import { Plus, Tag, Calendar, Building, DollarSign } from 'lucide-react';

// This function will be used by React Query to fetch expenses
const fetchExpenses = async () => {
    const { data } = await apiClient.get('/expenses');
    return data.data;
};

const ExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: expenses = [], isLoading, isError } = useQuery({
      queryKey: ['expenses'], 
      queryFn: fetchExpenses
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getCategoryIcon = (category: string) => {
    // You can expand this with more icons
    switch(category) {
        case 'Repairs': return <Tag className="w-4 h-4 text-yellow-400" />;
        case 'Utilities': return <Tag className="w-4 h-4 text-blue-400" />;
        default: return <Tag className="w-4 h-4 text-slate-400" />;
    }
  }

  if (isLoading) return <div className="text-white text-center p-8">Loading expenses...</div>;
  if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch expenses.</div>;

  return (
    <div className="text-white">
      <LogExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Manage Expenses</h1>
        <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg"
            >
              <Plus size={20} />
              <span>Log Expense</span>
            </button>
        </div>
      </div>

      <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Description</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Property</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Category</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {expenses.map((expense: any) => (
                  <tr key={expense._id} className="hover:bg-slate-800">
                    <td className="p-4 font-bold text-white">{expense.description}</td>
                    <td className="p-4 text-slate-300 flex items-center gap-2"><Building size={16}/> {expense.propertyId?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-300 flex items-center gap-2"><Calendar size={16}/> {formatDate(expense.date)}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        {getCategoryIcon(expense.category)} {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-lg text-red-400">
                      -${expense.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
              <div className="text-center p-8 text-slate-400">
                  No expenses have been logged yet.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
