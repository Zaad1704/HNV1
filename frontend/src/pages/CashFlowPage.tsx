// frontend/src/pages/CashFlowPage.tsx

import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';
import RecordCashFlowModal from '../components/common/RecordCashFlowModal'; // Import the new modal

// Define interface for CashFlow record
interface ICashFlowRecord {
    _id: string;
    fromUser: { _id: string; name: string; role: string; };
    toUser?: { _id: string; name: string; role: string; }; // Optional recipient
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: records = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['cashFlowRecords'],
        queryFn: fetchCashFlowRecords,
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-amber-100 text-amber-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'cash_handover': return <ArrowRight size={16} />;
            case 'bank_deposit': return <DollarSign size={16} />;
            default: return null;
        }
    };

    if (isLoading) return <div className="text-center p-8">Loading cash flow records...</div>;
    if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch cash flow records.</div>;

    return (
        <div className="text-dark-text">
            <RecordCashFlowModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRecordCreated={() => refetch()} // Refetch records on creation
            />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Cash Flow Records</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg shadow-md transition-colors"
                >
                    <PlusCircle size={18} />
                    <span>Record New Flow</span>
                </button>
            </div>

            {records.length === 0 ? (
                <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                    <h3 className="text-xl font-semibold text-dark-text">No Cash Flow Records Found</h3>
                    <p className="text-light-text mt-2 mb-4">Record your first cash handover or bank deposit.</p>
                </div>
            ) : (
                <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-border-color">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Date</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Type</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">From</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">To</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Document</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {records.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="p-4 text-light-text">{new Date(record.transactionDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-dark-text flex items-center gap-2">
                                            {getTypeIcon(record.type)} {record.type === 'cash_handover' ? 'Handover' : 'Deposit'}
                                        </td>
                                        <td className="p-4 font-semibold text-dark-text">${record.amount.toFixed(2)}</td>
                                        <td className="p-4 text-light-text">{record.fromUser?.name || 'N/A'}</td>
                                        <td className="p-4 text-light-text">{record.toUser?.name || (record.type === 'bank_deposit' ? 'Bank' : 'N/A')}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {record.documentUrl && (
                                                <a href={record.documentUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline text-sm">
                                                    View
                                                </a>
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
