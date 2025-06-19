import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';

// We can reuse the managed agents fetcher from the UsersPage
const fetchManagedAgents = async () => {
    const { data } = await apiClient.get("/users/my-agents");
    return data.data;
};
const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

// The mutation function now needs to handle FormData for file uploads
const createExpense = async (formData: FormData) => {
    const { data } = await apiClient.post('/expenses', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data.data;
};

const LogExpenseModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    description: '', amount: '', category: 'Repairs', date: new Date().toISOString().split('T')[0], propertyId: '', paidToAgentId: ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const isSalary = formData.category === 'Salary';

  const { data: properties, isLoading: isLoadingProperties } = useQuery({ queryKey: ['propertiesForExpense'], queryFn: fetchProperties, enabled: isOpen });
  const { data: agents, isLoading: isLoadingAgents } = useQuery({ queryKey: ['managedAgentsForExpense'], queryFn: fetchManagedAgents, enabled: isOpen && user?.role === 'Landlord' });

  const mutation = useMutation({
      mutationFn: createExpense,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['expenses']});
        queryClient.invalidateQueries({ queryKey: ['financialSummary']}); // Also refetch dashboard stats
        onClose();
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to log expense.');
      }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files) {
          setDocumentFile(e.target.files[0]);
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const submissionForm = new FormData();
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
        submissionForm.append(key, value);
    });
    // Append the file if it exists
    if (documentFile) {
        submissionForm.append('document', documentFile);
    }
    
    mutation.mutate(submissionForm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Log New Expense</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
            <input type="text" name="description" id="description" required value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Amount ($)</label>
              <input type="number" name="amount" id="amount" required value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-300">Date</label>
              <input type="date" name="date" id="date" required value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white"/>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
                <select name="category" id="category" required value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white">
                    <option>Repairs</option>
                    <option>Utilities</option>
                    <option>Management Fees</option>
                    <option>Insurance</option>
                    <option>Taxes</option>
                    <option value="Salary">Salary</option> {/* NEW */}
                    <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-slate-300">Property</label>
                <select name="propertyId" id="propertyId" required value={formData.propertyId} onChange={handleChange} disabled={isLoadingProperties} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white">
                  <option value="">{isLoadingProperties ? 'Loading...' : 'Select Property'}</option>
                  {properties?.map((prop: any) => <option key={prop._id} value={prop._id}>{prop.name}</option>)}
                </select>
              </div>
          </div>
          
          {isSalary && user?.role === 'Landlord' && (
            <div>
              <label htmlFor="paidToAgentId" className="block text-sm font-medium text-slate-300">Pay Salary To</label>
              <select name="paidToAgentId" id="paidToAgentId" required={isSalary} value={formData.paidToAgentId} onChange={handleChange} disabled={isLoadingAgents} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white">
                  <option value="">{isLoadingAgents ? 'Loading...' : 'Select Agent/Manager'}</option>
                  {agents?.map((agent: any) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
              </select>
            </div>
          )}

          <div>
              <label htmlFor="document" className="block text-sm font-medium text-slate-300">Attach Document (Optional)</label>
              <input type="file" name="document" id="document" onChange={handleFileChange} className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600"/>
          </div>
            
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">
                {mutation.isPending ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogExpenseModal;
