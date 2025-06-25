// frontend/src/components/common/RecordCashFlowModal.tsx

import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UploadCloud } from 'lucide-react';
import { useAuthStore } from '../../store/authStore'; // To get user info (e.g., if needed to filter recipients)

// Define interfaces for data
interface UserOption {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface CashFlowFormData {
    toUser: string;
    amount: string;
    type: 'cash_handover' | 'bank_deposit';
    transactionDate: string;
    description: string;
    status: 'pending' | 'completed';
}

interface RecordCashFlowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecordCreated: () => void; // Callback to refetch list after creation
}

const fetchLandlords = async (): Promise<UserOption[]> => {
    // Assuming an endpoint to fetch landlords within the organization
    // This might be /users/organization and then filter by role, or a specific endpoint
    const { data } = await apiClient.get('/users/organization'); // Or a more specific endpoint for landlords
    return data.data.filter((user: UserOption) => user.role === 'Landlord');
};

const createCashFlowRecord = async (formData: FormData) => {
    const { data } = await apiClient.post('/cashflow', formData);
    return data.data;
};

const RecordCashFlowModal: React.FC<RecordCashFlowModalProps> = ({ isOpen, onClose, onRecordCreated }) => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CashFlowFormData>({
        toUser: '', // Recipient user ID (Landlord)
        amount: '',
        type: 'cash_handover', // Default to cash handover
        transactionDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        description: '',
        status: 'pending',
    });
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch landlords for the 'toUser' dropdown if type is cash_handover
    const { data: landlords, isLoading: isLoadingLandlords } = useQuery({
        queryKey: ['landlordsForCashFlow'],
        queryFn: fetchLandlords,
        enabled: isOpen && formData.type === 'cash_handover', // Only fetch if modal open and type is handover
    });

    const mutation = useMutation({
        mutationFn: createCashFlowRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashFlowRecords'] }); // Invalidate the records query
            onRecordCreated(); // Trigger parent's callback
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to record cash flow.');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDocumentFile(e.target.files[0]);
        } else {
            setDocumentFile(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const submissionForm = new FormData();
        submissionForm.append('amount', formData.amount);
        submissionForm.append('type', formData.type);
        submissionForm.append('transactionDate', formData.transactionDate);
        submissionForm.append('description', formData.description);
        submissionForm.append('status', formData.status);

        if (formData.type === 'cash_handover' && formData.toUser) {
            submissionForm.append('toUser', formData.toUser);
        } else if (formData.type === 'cash_handover' && !formData.toUser) {
            setError('Please select a recipient for cash handover.');
            return;
        }

        if (documentFile) {
            submissionForm.append('document', documentFile); // 'document' must match Multer field name in backend route
        }

        mutation.mutate(submissionForm);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-light-card rounded-xl shadow-xl w-full max-w-lg border border-border-color dark:bg-dark-card dark:border-border-color-dark transform scale-100 opacity-100 transition-all duration-300">
                <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">Record Cash Flow</h2>
                    <button onClick={onClose} className="text-light-text hover:text-dark-text text-2xl transition-colors dark:text-light-text-dark dark:hover:text-dark-text-dark">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                    {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}

                    {/* Type of Transaction */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Transaction Type</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all" required>
                            <option value="cash_handover">Cash Handover to Landlord</option>
                            <option value="bank_deposit">Bank Deposit</option>
                        </select>
                    </div>

                    {/* Recipient for Cash Handover */}
                    {formData.type === 'cash_handover' && (
                        <div>
                            <label htmlFor="toUser" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Recipient (Landlord)</label>
                            <select name="toUser" id="toUser" value={formData.toUser} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all" required={formData.type === 'cash_handover'}>
                                <option value="">{isLoadingLandlords ? 'Loading Landlords...' : 'Select Landlord'}</option>
                                {landlords?.map((landlord) => (
                                    <option key={landlord._id} value={landlord._id}>{landlord.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Amount ($)</label>
                        <input type="number" step="0.01" name="amount" id="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all" required/>
                    </div>

                    {/* Transaction Date */}
                    <div>
                        <label htmlFor="transactionDate" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Transaction Date</label>
                        <input type="date" name="transactionDate" id="transactionDate" value={formData.transactionDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all" required/>
                    </div>

                    {/* Description (Optional) */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Description (Optional)</label>
                        <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all"></textarea>
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Status</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg border-border-color rounded-md text-dark-text dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all" required>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Document Upload */}
                    <div>
                        <label htmlFor="document" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Attach Document/Proof (Optional)</label>
                        <input type="file" name="document" id="document" onChange={handleFileChange} className="mt-1 block w-full text-sm text-light-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-light-bg file:text-light-text hover:file:bg-border-color transition-all dark:file:bg-dark-bg dark:file:text-light-text-dark dark:hover:file:bg-border-color-dark"/>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-light-bg text-dark-text font-semibold rounded-lg hover:bg-border-color transition-colors duration-150 dark:bg-dark-bg dark:text-dark-text-dark dark:hover:bg-border-color-dark">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200">
                            <UploadCloud size={16} /> {mutation.isLoading ? 'Recording...' : 'Record Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordCashFlowModal;
