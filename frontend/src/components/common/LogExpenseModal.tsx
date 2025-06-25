// frontend/src/components/common/LogExpenseModal.tsx
import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';

const fetchManagedAgents = async () => {
    const { data } = await apiClient.get('/users/my-agents'); // Assuming this endpoint exists for landlord's managed agents
    return data.data;
};

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const createExpense = async (formData: FormData) => {
    const { data } = await apiClient.post('/expenses', formData);
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
        queryClient.invalidateQueries({ queryKey: ['financialSummary']});
        onClose();
      },
      onError: (err: any) => setError(err.response?.data?.message || 'Failed to log expense.')
  });

  // Completed: handleChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Completed: handleFileChange
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setDocumentFile(e.target.files[0]);
    } else {
        setDocumentFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const submissionForm = new FormData();
    Object.entries(formData).forEach(([key, value]) => submissionForm.append(key, value));
    if (documentFile) {
        submissionForm.append('document', documentFile);
    }
    mutation.mutate(submissionForm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
          <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">Log New Expense</h2>
          <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark text-2xl transition-colors">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg transition-all duration-200">{error}</div>}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Description</label>
            <input type="text" name="description" id="description" required value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Amount ($)</label>
              <input type="number" name="amount" id="amount" required value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Date</label>
              <input type="date" name="date" id="date" required value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Category</label>
                <select name="category" id="category" required value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200">
                    <option>Repairs</option> <option>Utilities</option> <option>Management Fees</option>
                    <option>Insurance</option> <option>Taxes</option> <option value="Salary">Salary</option> <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Property</label>
                <select name="propertyId" id="propertyId" required value={formData.propertyId} onChange={handleChange} disabled={isLoadingProperties} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200">
                  <option value="">{isLoadingProperties ? 'Loading...' : 'Select Property'}</option>
                  {properties?.map((prop: any) => <option key={prop._id} value={prop._id}>{prop.name}</option>)}
                </select>
              </div>
          </div>

          {isSalary && user?.role === 'Landlord' && (
              <div>
                  <label htmlFor="paidToAgentId" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Paid To Agent</label>
                  <select name="paidToAgentId" id="paidToAgentId" value={formData.paidToAgentId} onChange={handleChange} disabled={isLoadingAgents} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200">
                      <option value="">{isLoadingAgents ? 'Loading Agents...' : 'Select Agent (Optional)'}</option>
                      {agents?.map((agent: any) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
                  </select>
              </div>
          )}

          <div>
              <label htmlFor="document" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Attach Document (Optional)</label>
              <input type="file" name="document" id="document" onChange={handleFileChange} className="mt-1 block w-full text-sm text-light-text dark:text-light-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-light-bg dark:file:bg-dark-bg file:text-light-text dark:file:text-light-text-dark hover:file:bg-border-color dark:hover:file:bg-border-color-dark transition-all duration-200"/>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-200">
                {mutation.isLoading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogExpenseModal;
