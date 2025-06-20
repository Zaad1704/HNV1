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
  
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const shareMutation = useMutation({
      mutationFn: createShareLinkMutationFn,
      onSuccess: (response) => {
          const shareUrl = response.data.shareUrl;
          navigator.clipboard.writeText(shareUrl).then(() => {
              setCopiedLinkId(response.data.expenseId);
              setTimeout(() => setCopiedLinkId(null), 2000);
          });
      },
      onError: (error: any) => alert(error.response?.data?.message || 'Could not create share link.')
  });

  const handleShare = (expenseId: string) => shareMutation.mutate(expenseId);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const getCategoryIcon = (category: string) => { /* ... same as before ... */ };

  const DesktopView = () => (
    <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border-color">
              <tr>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Description</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Property / Paid To</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Date</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Category</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Amount</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {expenses.map((expense: any) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-dark-text">{expense.description}</td>
                    <td className="p-4 text-light-text">
                      <div>{expense.propertyId?.name || 'N/A'}</div>
                      {expense.paidToAgentId && <div className="text-xs text-gray-400 mt-1">↳ for {expense.paidToAgentId.name}</div>}
                    </td>
                    <td className="p-4 text-light-text">{formatDate(expense.date)}</td>
                    <td className="p-4"><span className="flex items-center gap-2 text-sm text-light-text">{getCategoryIcon(expense.category)} {expense.category}</span></td>
                    <td className="p-4 text-right font-semibold text-red-600">-${expense.amount.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      {expense.documentUrl && (
                        <div className="flex items-center justify-center gap-3">
                            <a href={import.meta.env.VITE_API_URL + expense.documentUrl} target="_blank" rel="noopener noreferrer" className="text-light-text hover:text-brand-orange" title="Download"><Download size={18} /></a>
                            <button onClick={() => handleShare(expense._id)} disabled={shareMutation.isLoading} className="text-light-text hover:text-brand-orange disabled:text-gray-300" title="Copy Share Link">
                                {copiedLinkId === expense._id ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
                            </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
  );

  const MobileView = () => (
    <div className="space-y-4">
        {expenses.map((expense: any) => (
            <div key={expense._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-dark-text flex-1 pr-2">{expense.description}</h3>
                    <p className="font-semibold text-red-600 whitespace-nowrap">-${expense.amount.toFixed(2)}</p>
                </div>
                <div className="text-sm text-light-text mt-2 space-y-1">
                    <p className="flex items-center gap-2"><Building size={14} /> {expense.propertyId?.name || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Calendar size={14} /> {formatDate(expense.date)}</p>
                    <p className="flex items-center gap-2">{getCategoryIcon(expense.category)} {expense.category}</p>
                </div>
            </div>
        ))}
    </div>
  );

  if (isLoading) return <div className="text-center p-8">Loading expenses...</div>;
  if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch expenses.</div>;

  return (
    <div>
      <LogExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Expenses</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-brand-orange hover:opacity-90 text-white font-bold rounded-lg shadow-sm">
          <Plus size={18} /><span>Log Expense</span>
        </button>
      </div>
      
      <div className="hidden md:block"><DesktopView /></div>
      <div className="block md:hidden"><MobileView /></div>
    </div>
  );
};

export default ExpensesPage;
