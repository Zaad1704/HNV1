// frontend/src/pages/CashFlowPage.tsx
import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, DollarSign, ArrowRight, Edit, Trash2 } from 'lucide-react';
import RecordCashFlowModal from '../components/common/RecordCashFlowModal';
import RequestEditModal from '../components/common/RequestEditModal';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

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
    const { data } = await apiClient.get('/api/cashflow');
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
        <motion.div 
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
            className="text-dark-text dark:text-dark-text-dark"
        >
            <RecordCashFlowModal
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
            />
            {itemToRequest && (
                 <RequestEditModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    resourceId={itemToRequest._id}
                    resourceModel="CashFlow"
                    approverId={itemToRequest.toUser?._id}
                    onSuccess={() => refetch()}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-text dark:text-dark-text-dark">Cash Flow Management</h1>
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
                <div className="text-center py-16 bg-light-card rounded-3xl border-2 border-dashed border-border-color dark:bg-dark-card dark:border-border-color-dark">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark">No Cash Flow Records Found</h3>
                    <p className="text-light-text mt-2 dark:text-light-text-dark">No cash flow transactions have been recorded yet.</p>
                </div>
            ) : (
                <div className="bg-light-card rounded-3xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg/50 border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Date</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Type</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">From</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">To</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Status</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase text-right dark:text-light-text-dark">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                                {records.map((record) => (
                                    <tr key={record._id} className="hover:bg-light-bg/50 transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                        <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">{new Date(record.transactionDate).toLocaleDateString()}</td>
                                        <td className="p-4 flex items-center gap-2 text-light-text dark:text-light-text-dark capitalize">
                                            {getTypeIcon(record.type)} <span className="capitalize">{record.type.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="p-4 text-light-text dark:text-light-text-dark">{record.fromUser.name}</td>
                                        <td className="p-4 text-light-text dark:text-light-text-dark">{record.toUser?.name || 'Bank'}</td>
                                        <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">
                                            <DollarSign size={14} className="inline-block mr-1 text-green-400" />
                                            {record.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {user?.role === 'Landlord' ? (
                                                <>
                                                    <button className="text-brand-primary hover:underline p-2 transition-colors duration-150" title="Edit Record"><Edit size={16}/></button>
                                                    <button className="text-red-500 hover:underline p-2 transition-colors duration-150" title="Delete Record"><Trash2 size={16}/></button>
                                                </>
                                            ) : ( user?.role === 'Agent' && record.fromUser._id === user?._id &&
                                                <button onClick={() => handleRequestEdit(record)} className="text-brand-secondary hover:underline p-2 transition-colors duration-150" title="Request Permission to Edit">
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
        </motion.div>
    );
};

export default CashFlowPage;
