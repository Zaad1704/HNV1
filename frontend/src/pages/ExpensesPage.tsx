import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import LogExpenseModal from '../components/common/LogExpenseModal';
// Import an EditExpenseModal (you would create this similar to other edit modals)
// import EditExpenseModal from '../components/common/EditExpenseModal'; 
import { Plus, Tag, Calendar, Building, DollarSign, Download, Edit, Trash2, Filter } from 'lucide-react';

// Updated fetch function to accept filters
const fetchExpenses = async (filters: any) => {
    const { data } = await apiClient.get('/expenses', { params: filters });
    return data.data;
};

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  // State for edit modal would be added here
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [selectedExpense, setSelectedExpense] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({ propertyId: '', startDate: '', endDate: '' });

  // Pass filters to useQuery; it will refetch when filters change
  const { data: expenses = [], isLoading, isError } = useQuery({ 
      queryKey: ['expenses', filters], 
      queryFn: () => fetchExpenses(filters) 
  });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });

  const deleteMutation = useMutation({
      mutationFn: (expenseId: string) => apiClient.delete(`/expenses/${expenseId}`),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
      },
      onError: (err: any) => alert(err.response?.data?.message || 'Delete failed.'),
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExport = async () => {
    // Logic to call the export endpoint with current filters
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div>
      <LogExpenseModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      {/* <EditExpenseModal isOpen={isEditModalOpen} ... /> */}
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Expenses</h1>
        <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold"><Download size={18}/> Export CSV</button>
            <button onClick={() => setIsLogModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg"><Plus size={18} /><span>Log Expense</span></button>
        </div>
      </div>
      
      {/* --- NEW: Filters UI --- */}
      <div className="p-4 bg-light-card rounded-xl border border-border-color mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
              <label className="text-sm font-medium text-light-text">Property</label>
              <select name="propertyId" value={filters.propertyId} onChange={handleFilterChange} className="w-full mt-1 p-2 border rounded-md bg-light-bg">
                  <option value="">All Properties</option>
                  {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
          </div>
          <div>
              <label className="text-sm font-medium text-light-text">Start Date</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full mt-1 p-2 border rounded-md bg-light-bg"/>
          </div>
          <div>
              <label className="text-sm font-medium text-light-text">End Date</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full mt-1 p-2 border rounded-md bg-light-bg"/>
          </div>
      </div>

       {isLoading ? <div className="text-center p-8">Loading expenses...</div> : (
            <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    {/* ... table head ... */}
                    <tbody className="divide-y divide-border-color">
                    {expenses.map((expense: any) => (
                        <tr key={expense._id} className="hover:bg-gray-50">
                            <td className="p-4 font-semibold text-dark-text">{expense.description}</td>
                            <td className="p-4 text-light-text">{expense.propertyId?.name || 'N/A'}</td>
                            <td className="p-4 text-light-text">{formatDate(expense.date)}</td>
                            <td className="p-4 text-light-text">{expense.category}</td>
                            <td className="p-4 text-right font-semibold text-red-600">-${expense.amount.toFixed(2)}</td>
                            <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => { /* Open Edit Modal */ }} className="p-2 hover:bg-gray-100 rounded-md" title="Edit Expense"><Edit size={16}/></button>
                                    <button onClick={() => deleteMutation.mutate(expense._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Delete Expense"><Trash2 size={16}/></button>
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
