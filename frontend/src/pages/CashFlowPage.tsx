import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, DollarSign, ArrowRight, Edit, Trash2 } from 'lucide-react';
import RecordCashFlowModal from '../components/common/RecordCashFlowModal';
import RequestEditModal from '../components/common/RequestEditModal'; // <-- 1. Import the new modal
import { useAuthStore } from '../store/authStore'; // <-- 2. Import auth store to check user role

interface ICashFlowRecord {
    _id: string;
    fromUser: { _id: string; name: string; role: string; };
    toUser?: { _id: string; name: string; role: string; };
    amount: number;
    type: 'cash_handover' | 'bank_deposit';
    status: 'pending' | 'completed';
    transactionDate: string;
    description?: string;
    documentUrl?: string;
    recordedBy: { _id: string; name: string; };
}

const fetchCashFlowRecords = async (): Promise<ICashFlowRecord[]> => {
    const { data } = await apiClient.get('/cashflow');
    return data.data;
};

const CashFlowPage: React.FC = () => {
    const { user } = useAuthStore(); // Get the logged-in user
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    
    // --- 3. Add state for the new request modal ---
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [itemToRequest, setItemToRequest] = useState<ICashFlowRecord | null>(null);

    const { data: records = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['cashFlowRecords'],
        queryFn: fetchCashFlowRecords,
    });

    const handleRequestEdit = (record: ICashFlowRecord) => {
        setItemToRequest(record);
        setIsRequestModalOpen(true);
    };

    const getStatusBadge = (status: string) => { /* ... */ };
    const getTypeIcon = (type: string) => { /* ... */ };

    if (isLoading) return <div className="text-center p-8">Loading cash flow records...</div>;
    if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch cash flow records.</div>;

    return (
        <div className="text-dark-text">
            <RecordCashFlowModal
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                onRecordCreated={() => refetch()}
            />
            {/* --- 4. Render the new request modal --- */}
            {itemToRequest && (
                 <RequestEditModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    resourceId={itemToRequest._id}
                    resourceModel="CashFlow"
                    approverId={itemToRequest.toUser?._id} // Assuming the recipient is the approver
                    onSuccess={() => refetch()}
                />
            )}


            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                {/* ... Header and button remain the same */}
            </div>

            {records.length === 0 ? ( /* ... */ ) : (
                <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-border-color">
                                <tr>
                                    {/* ... other headers */}
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {records.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        {/* ... other table cells */}
                                        <td className="p-4 text-right space-x-2">
                                            {/* --- 5. Conditional logic for buttons --- */}
                                            {user?.role === 'Landlord' ? (
                                                <>
                                                    <button className="text-brand-primary hover:underline" title="Edit Record"><Edit size={16}/></button>
                                                    <button className="text-red-600 hover:underline" title="Delete Record"><Trash2 size={16}/></button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleRequestEdit(record)} className="text-amber-600 hover:underline" title="Request Permission to Edit">
                                                    <Edit size={16}/>
                                                </button>
                                            )}
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

export default CashFlowPage;
