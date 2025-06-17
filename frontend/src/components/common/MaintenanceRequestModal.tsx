import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

const createRequest = async (newRequest: { category: string; description: string; }) => {
    const { data } = await apiClient.post('/maintenance-requests', newRequest);
    return data.data;
};

const MaintenanceRequestModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation(createRequest, {
    onSuccess: () => {
      // Could invalidate a query for requests here if we were displaying them
      alert('Your request has been submitted successfully!');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit request.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ category, description });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">New Maintenance Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white">
                <option>General</option><option>Plumbing</option><option>Electrical</option><option>Appliances</option><option>Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Describe the Issue</label>
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-900 border-slate-600 rounded-md text-white" />
          </div>
            
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">
                {mutation.isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRequestModal;
