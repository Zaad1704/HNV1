import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import LogExpenseModal from '../components/common/LogExpenseModal';
import { Plus, Tag, Calendar, Building, DollarSign, Share2, Download, Check } from 'lucide-react';

const fetchExpenses = async () => {
    const { data } = await apiClient.get('/expenses');
    return data.data;
};

const createShareLinkMutationFn = (expenseId: string) => {
    return apiClient.post(`/share/expense-document/${expenseId}`);
};

const ExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: expenses = [], isLoading, isError } = useQuery({
      queryKey: ['expenses'], 
      queryFn: fetchExpenses
  });
  
  // State to give user feedback on which link was copied
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const shareMutation = useMutation({
      mutationFn: createShareLinkMutationFn,
      onSuccess: (response) => {
          const shareUrl = response.data.shareUrl;
          navigator.clipboard.writeText(shareUrl).then(() => {
              console.log('Share link copied to clipboard:', shareUrl);
              // Give user feedback
              setCopiedLinkId(response.data.expenseId); // We need to know which link was copied
              setTimeout(() => setCopiedLinkId(null), 2000); // Reset after 2 seconds
          }).catch(err => {
              console.error('Failed to copy link: ', err);
              alert('Failed to copy link to clipboard.');
          });
      },
      onError: (error: any) => {
          alert(error.response?.data?.message || 'Could not create share link.');
      }
  });

  const handleShare = (expenseId: string) => {
      // Pass the expenseId to the mutation
      shareMutation.mutate(expenseId);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
        case 'Repairs': return <Tag className="w-4 h-4 text-yellow-400" />;
        case 'Utilities': return <Tag className="w-4 h-4 text-blue-400" />;
        case 'Salary': return <DollarSign className="w-4 h-4 text-green-400" />;
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
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Property / Paid To</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Category</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase text-right">Amount</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {expenses.map((expense: any) => (
                  <tr key={expense._id} className="hover:bg-slate-800">
                    <td className="p-4 font-bold text-white">{expense.description}</td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2"><Building size={16}/> {expense.propertyId?.name || 'N/A'}</div>
                      {expense.paidToAgentId && <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 pl-1">↳ Salary for {expense.paidToAgentId.name}</div>}
                    </td>
                    <td className="p-4 text-slate-300 flex items-center gap-2"><Calendar size={16}/> {formatDate(expense.date)}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        {getCategoryIcon(expense.category)} {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-lg text-red-400">
                      -${expense.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      {expense.documentUrl && (
                        <div className="flex items-center justify-center gap-2">
                            <a href={import.meta.env.VITE_API_URL + expense.documentUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300" title="Download Document">
                                <Download size={18} />
                            </a>
                            <button onClick={() => handleShare(expense._id)} disabled={shareMutation.isPending} className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-500" title="Copy Share Link">
                                {copiedLinkId === expense._id ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
                            </button>
                        </div>
                      )}
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
