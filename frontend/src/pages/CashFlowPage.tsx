// frontend/src/pages/CashFlowPage.tsx

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'cash_handover': return <ArrowRight size={16} className="text-purple-600" />;
            case 'bank_deposit': return <DollarSign size={16} className="text-blue-600" />;
            default: return null;
        }
    };

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
                <h1 className="text-3xl font-bold text-dark-text">Cash Flow Management</h1>
                <button
                    onClick={() => setIsRecordModalOpen(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg shadow-md transition-colors"
                >
                    <PlusCircle size={18} />
                    <span>Record New Transaction</span>
                </button>
            </div>

            {/* Corrected conditional rendering block */}
            {records.length === 0 ? (
                <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                    <h3 className="text-xl font-semibold text-dark-text">No Cash Flow Records Found</h3>
                    <p className="text-light-text mt-2">
                        You haven't recorded any cash flow transactions yet.
                    </p>
                    <button onClick={() => setIsRecordModalOpen(true)} className="mt-4 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg flex items-center mx-auto">
                        <PlusCircle size={18} className="mr-2" /> Record First Transaction
                    </button>
                </div>
            ) : (
                <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-border-color">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Date</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Type</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">From</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">To</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {records.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-dark-text">{new Date(record.transactionDate).toLocaleDateString()}</td>
                                        <td className="p-4 flex items-center gap-2 text-light-text">
                                            {getTypeIcon(record.type)} <span className="capitalize">{record.type.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="p-4 text-light-text">{record.fromUser.name}</td>
                                        <td className="p-4 text-light-text">{record.toUser?.name || 'Bank'}</td>
                                        <td className="p-4 font-semibold text-dark-text">
                                            <DollarSign size={14} className="inline-block mr-1 text-green-600" />
                                            {record.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
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
