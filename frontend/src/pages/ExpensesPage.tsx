// frontend/src/pages/ExpensesPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import LogExpenseModal from '../components/common/LogExpenseModal';
import { Plus, Tag, Calendar, Building, DollarSign, Share2, Download, Check } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize'; // Import useWindowSize

const fetchExpenses = async () => {
    const { data } = await apiClient.get('/expenses');
    return data.data;
};

const createShareLinkMutationFn = (expenseId: string) => {
    return apiClient.post(`/share/expense-document/${expenseId}`);
};

const ExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: expenses = [], isLoading, isError } = useQuery({ queryKey: ['expenses'], queryFn: fetchExpenses });
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const { width } = useWindowSize(); // Get window width

  const shareMutation = useMutation({
      mutationFn: createShareLinkMutationFn,
      onSuccess: (response, expenseId) => {
          const shareUrl = response.data.shareUrl;
          navigator.clipboard.writeText(shareUrl).then(() => {
              setCopiedLinkId(expenseId);
              setTimeout(() => setCopiedLinkId(null), 2000);
          });
      },
      onError: (error: any) => alert(error.response?.data?.message || 'Could not create share link.')
  });

  const handleShare = (expenseId: string) => shareMutation.mutate(expenseId);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  
  const getCategoryIcon = (category: string) => {
      const iconMap: { [key: string]: React.ReactNode } = { // Explicitly type iconMap
          'Repairs': <Tag size={16} />,
          'Utilities': <Tag size={16} />,
          'Management Fees': <Tag size={16} />,
          'Insurance': <Tag size={16} />,
          'Taxes': <Tag size={16} />,
          'Salary': <DollarSign size={16} />,
          'Other': <Tag size={16} />,
      };
      return iconMap[category] || <Tag size={16}/>;
  }

  // Desktop Table View Component
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
                        <div className="flex items-center justify-center gap-4">
                            <a href={`${import.meta.env.VITE_API_URL}${expense.documentUrl}`} target="_blank" rel="noopener noreferrer" className="text-light-text hover:text-brand-primary" title="Download Document"><Download size={18} /></a>
                            <button onClick={() => handleShare(expense._id)} disabled={shareMutation.isPending} className="text-light-text hover:text-brand-primary disabled:text-gray-300" title="Copy Share Link">
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

  // Mobile Card View Component
  const MobileView = () => (
    <div className="grid grid-cols-1 gap-4">
        {expenses.map((expense: any) => (
            <div key={expense._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm">
                <h3 className="font-bold text-dark-text text-lg mb-2">{expense.description}</h3>
                <p className="text-light-text text-sm flex items-center gap-2 mb-1">
                    <Building size={14}/> Property: {expense.propertyId?.name || 'N/A'}
                    {expense.paidToAgentId && <span className="text-xs text-gray-400"> (for {expense.paidToAgentId.name})</span>}
                </p>
                <p className="text-light-text text-sm flex items-center gap-2 mb-1">
                    <Calendar size={14}/> Date: {formatDate(expense.date)}
                </p>
                <p className="text-light-text text-sm flex items-center gap-2 mb-1">
                    {getCategoryIcon(expense.category)} Category: {expense.category}
                </p>
                <p className="text-red-600 text-lg font-semibold flex items-center gap-2">
                    <DollarSign size={16}/> Amount: -${expense.amount.toFixed(2)}
                </p>
                
                {expense.documentUrl && (
                    <div className="flex justify-end items-center gap-4 mt-4 border-t border-border-color pt-3">
                        <a href={`${import.meta.env.VITE_API_URL}${expense.documentUrl}`} target="_blank" rel="noopener noreferrer" className="text-light-text hover:text-brand-primary flex items-center gap-1" title="Download Document">
                            <Download size={18} /> Document
                        </a>
                        <button onClick={() => handleShare(expense._id)} disabled={shareMutation.isPending} className="text-light-text hover:text-brand-primary disabled:text-gray-300 flex items-center gap-1" title="Copy Share Link">
                            {copiedLinkId === expense._id ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />} Copy Link
                        </button>
                    </div>
                )}
            </div>
        ))}
    </div>
  );

  if (isLoading) return <div className="text-center p-8">Loading expenses...</div>;
  if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch expenses.</div>;

  return (
    <div>
      <LogExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Expenses</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg shadow-md transition-colors">
          <Plus size={18} /><span>Log Expense</span>
        </button>
      </div>
      
       {expenses.length === 0 ? (
            <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                <h3 className="text-xl font-semibold text-dark-text">No Expenses Recorded</h3>
                <p className="text-light-text mt-2 mb-4">Log your first expense to start tracking.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-brand-primary hover:underline">
                    + Log Your First Expense
                </button>
            </div>
       ) : (
            // Conditionally render DesktopView or MobileView based on screen width
            width < 768 ? <MobileView /> : <DesktopView />
       )}
    </div>
  );
};

export default ExpensesPage;
