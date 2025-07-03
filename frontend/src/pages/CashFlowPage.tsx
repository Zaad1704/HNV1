// frontend/src/pages/CashFlowPage.tsx
import React, { useState, useMemo } from 'react';
import apiClient from '../api/client';
import { useQuery } from '@tanstack/react-query';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import ExportModal from '../components/common/ExportModal';
import { PlusCircle, DollarSign, ArrowRight, Edit, Trash2, Download } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDataExport } from '../hooks/useDataExport';

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
    try {
        const { data } = await apiClient.get('/cashflow');
        return data.data || [];
    } catch (error) {
        console.error('Failed to fetch cash flow records:', error);
        throw error;
    }
};

const CashFlowPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [itemToRequest, setItemToRequest] = useState<ICashFlowRecord | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<any>({});
    const [showExportModal, setShowExportModal] = useState(false);
    const { exportData } = useDataExport();

    const { data: records = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['cashFlowRecords'],
        queryFn: fetchCashFlowRecords,
        retry: 1
    });

    const filteredRecords = useMemo(() => {
        if (!records) return [];
        
        return records.filter((record: ICashFlowRecord) => {
            const matchesSearch = !searchQuery || 
                record.fromUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.toUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.type?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = !filters.status || record.status === filters.status;
            const matchesType = !filters.type || record.type === filters.type;
            
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [records, searchQuery, filters]);

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' }
            ]
        },
        {
            key: 'type',
            label: 'Type',
            type: 'select' as const,
            options: [
                { value: 'cash_handover', label: 'Cash Handover' },
                { value: 'bank_deposit', label: 'Bank Deposit' }
            ]
        }
    ];

    const bulkActions = [
        {
            key: 'export',
            label: 'Export',
            icon: Download,
            color: 'bg-blue-500 hover:bg-blue-600 text-white',
            action: async (ids: string[]) => {
                await exportData('cashflow', 'cashflow-records', { format: 'xlsx', filters: { ids } });
            }
        }
    ];

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

    if (isLoading) {
        return <div className="text-center p-8 text-text-primary">Loading cash flow records...</div>;
    }
    
    if (isError) {
        return (
            <div className="text-center p-8">
                <div className="text-red-500 mb-4">Failed to fetch cash flow records.</div>
                <div className="text-sm text-gray-500">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                </div>
                <button 
                    onClick={() => refetch()} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    try {
        return (
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Cash Flow Management</h1>
                        <p className="text-text-secondary mt-1">Track cash transactions and deposits</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export
                        </button>
                        {user?.role === 'Agent' && (
                          <button
                              onClick={() => setIsRecordModalOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                          >
                              <PlusCircle size={18} />
                              <span>Record Transaction</span>
                          </button>
                        )}
                    </div>
                </div>

                <SearchFilter
                    onSearch={setSearchQuery}
                    onFilter={setFilters}
                    filters={filters}
                    placeholder="Search cash flow records..."
                    filterOptions={filterOptions}
                />

            {!filteredRecords || filteredRecords.length === 0 ? (
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
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Select</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Type</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">From</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">To</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredRecords && filteredRecords.map((record) => record && (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRecords.includes(record._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRecords(prev => [...prev, record._id]);
                                                    } else {
                                                        setSelectedRecords(prev => prev.filter(id => id !== record._id));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-2"
                                            />
                                        </td>
                                        <td className="p-4 font-semibold">{record.transactionDate ? new Date(record.transactionDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-4 flex items-center gap-2 capitalize">
                                            {getTypeIcon(record.type)} <span className="capitalize">{record.type?.replace(/_/g, ' ') || 'Unknown'}</span>
                                        </td>
                                        <td className="p-4">{record.fromUser?.name || 'Unknown'}</td>
                                        <td className="p-4">{record.toUser?.name || 'Bank'}</td>
                                        <td className="p-4 font-semibold">
                                            <DollarSign size={14} className="inline-block mr-1 text-green-500" />
                                            {record.amount?.toFixed(2) || '0.00'}
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

            <BulkActions
                selectedItems={selectedRecords}
                totalItems={filteredRecords?.length || 0}
                onSelectAll={() => setSelectedRecords(filteredRecords?.map((r: ICashFlowRecord) => r._id) || [])}
                onClearSelection={() => setSelectedRecords([])}
                actions={bulkActions}
            />

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                section="cashflow"
                title="Cash Flow Records"
            />
            </div>
        );
    } catch (renderError) {
        console.error('Cash flow page render error:', renderError);
        return (
            <div className="p-6">
                <div className="text-center py-16 bg-red-50 rounded-3xl border-2 border-red-200">
                    <h3 className="text-xl font-semibold text-red-600">Cash Flow Page Error</h3>
                    <p className="text-red-500 mt-2">An error occurred while loading the cash flow page.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
};

export default CashFlowPage;
