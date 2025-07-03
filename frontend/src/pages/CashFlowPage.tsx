// frontend/src/pages/CashFlowPage.tsx
import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, DollarSign, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ICashFlowRecord {
    _id: string;
    fromUser: { _id: string; name: string; role: string; };
    toUser?: { _id: string; name: string; role: string; };
    amount: number;
    type: 'cash_handover' | 'bank_deposit';
    status: 'pending' | 'completed';
    transactionDate: string;
    recordedBy: { _id: string; name: string; };
}

const fetchCashFlowRecords = async (): Promise<ICashFlowRecord[]> => {
    const { data } = await apiClient.get('/cashflow');
    return data.data;
};

const CashFlowPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
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
        const map = {
            'pending': 'bg-yellow-500/20 text-yellow-300',
            'completed': 'bg-green-500/20 text-green-300',
        };
        return map[status as keyof typeof map] || 'bg-light-text/20 text-light-text';
    };

    const getTypeIcon = (type: string) => {
        if (type === 'cash_handover') return <ArrowRight size={16} className="text-brand-primary" />;
        if (type === 'bank_deposit') return <DollarSign size={16} className="text-brand-teal" />;
        return null;
    };
    
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading cash flow records...</div>;
    if (isError) return <div className="text-center p-8 text-red-400 dark:text-red-400">Failed to fetch cash flow records.</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Cash Flow Management</h1>
                {user?.role === 'Agent' && (
                  <button
                      onClick={() => setIsRecordModalOpen(true)}
                      className="btn-primary flex items-center space-x-2"
                  >
                      <PlusCircle size={18} />
                      <span>Record Transaction</span>
                  </button>
                )}
            </div>

            {records.length === 0 ? (
                <div className="text-center py-16 bg-gray-100 rounded-3xl border-2 border-dashed">
                    <h3 className="text-xl font-semibold">No Cash Flow Records Found</h3>
                    <p className="text-gray-600 mt-2">No cash flow transactions have been recorded yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Type</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">From</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">To</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {records.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold">{new Date(record.transactionDate).toLocaleDateString()}</td>
                                        <td className="p-4 flex items-center gap-2 capitalize">
                                            {getTypeIcon(record.type)} <span className="capitalize">{record.type.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="p-4">{record.fromUser.name}</td>
                                        <td className="p-4">{record.toUser?.name || 'Bank'}</td>
                                        <td className="p-4 font-semibold">
                                            <DollarSign size={14} className="inline-block mr-1 text-green-400" />
                                            {record.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(record.status)}`}>
                                                {record.status}
                                            </span>
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

    );
};

export default CashFlowPage;
