// frontend/src/pages/PaymentsPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import RecordPaymentModal from '../components/common/RecordPaymentModal';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import ExportModal from '../components/common/ExportModal';
import { Download, PlusCircle, FileText, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDataExport } from '../hooks/useDataExport';

const fetchPayments = async () => {
    try {
        const { data } = await apiClient.get('/payments');
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch payments');
        }
        return data.data || [];
    } catch (error: any) {
        console.error('Failed to fetch payments:', error);
        throw error; // Let React Query handle the error
    }
};

const PaymentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { exportPayments, isExporting } = useDataExport();
  
  const { data: payments = [], isLoading, isError, error, refetch } = useQuery({ 
    queryKey:['payments'], 
    queryFn: fetchPayments,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    return payments.filter((payment: any) => {
      if (!payment) return false;
      
      const matchesSearch = !searchQuery || 
        (payment.tenantId?.name && payment.tenantId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.propertyId?.name && payment.propertyId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = !filters.status || payment.status === filters.status;
      const matchesDateRange = !filters.dateRange || (
        payment.paymentDate &&
        new Date(payment.paymentDate) >= new Date(filters.dateRange.start) &&
        new Date(payment.paymentDate) <= new Date(filters.dateRange.end)
      );
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [payments, searchQuery, filters]);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Failed', label: 'Failed' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange' as const
    }
  ];

  const bulkActions = [
    {
      key: 'export',
      label: 'Export',
      icon: Download,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: async (ids: string[]) => {
        await exportPayments({ format: 'xlsx', filters: { ids } });
      }
    },
    {
      key: 'receipt',
      label: 'Download Receipts',
      icon: FileText,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: (ids: string[]) => {
        ids.forEach(id => handleDownloadReceipt(id));
      }
    }
  ];

  const handleDownloadReceipt = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      const response = await apiClient.get(`/receipts/payment/${paymentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt:", error);
      alert("Could not download receipt.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
        Paid: 'bg-green-500/20 text-green-300',
        Pending: 'bg-yellow-500/20 text-yellow-300',
        Failed: 'bg-red-500/20 text-red-400',
    };
    return statusClasses[status] || 'bg-gray-500/20 text-gray-300';
  };

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
      });
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  if (isLoading) return <div className="text-text-primary text-center p-8">Loading payments...</div>;
  
  if (isError) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">Failed to load payments</div>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.4 }}
        className="text-dark-text dark:text-dark-text-dark"
    >
      <RecordPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-text-secondary mt-1">Track and manage all payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        filters={filters}
        placeholder="Search payments..."
        filterOptions={filterOptions}
      />
      <div className="bg-light-card rounded-3xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-light-bg/50 border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
              <tr>
                <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Select</th>
                <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Transaction ID</th>
                <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Tenant</th>
                <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Property</th>
                <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Amount</th>
                <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Date</th>
                <th className="p-4 uppercase text-sm font-semibold text-light-text dark:text-light-text-dark">Status</th>
                <th className="p-4 uppercase text-sm font-semibold text-light-text text-right dark:text-light-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
              {filteredPayments.map((payment: any) => (
                <tr key={payment._id} className="hover:bg-light-bg/50 dark:hover:bg-dark-bg/40 relative">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments(prev => [...prev, payment._id]);
                        } else {
                          setSelectedPayments(prev => prev.filter(id => id !== payment._id));
                        }
                      }}
                      className="w-4 h-4 rounded border-2"
                    />
                  </td>
                  <td className="p-4 text-light-text dark:text-light-text-dark font-mono text-xs">{payment.transactionId || payment._id}</td>
                  <td className="p-4 font-bold text-dark-text dark:text-dark-text-dark">{payment.tenantId?.name || 'N/A'}</td>
                  <td className="p-4 text-light-text dark:text-light-text-dark">{payment.propertyId?.name || 'N/A'}</td>
                  <td className="p-4 text-text-primary font-semibold">${(payment.amount || 0).toFixed(2)}</td>
                  <td className="p-4 text-text-secondary">{payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                        onClick={() => handleDownloadReceipt(payment._id)}
                        disabled={downloadingId === payment._id}
                        className="font-medium text-brand-primary hover:text-brand-secondary flex items-center gap-1 ml-auto disabled:opacity-50"
                        title="Download PDF Receipt"
                    >
                        {downloadingId === payment._id ? '...' : <Download size={16}/>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BulkActions
        selectedItems={selectedPayments}
        totalItems={filteredPayments?.length || 0}
        onSelectAll={() => setSelectedPayments(filteredPayments?.map((p: any) => p._id) || [])}
        onClearSelection={() => setSelectedPayments([])}
        actions={bulkActions}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        section="payments"
        title="Payments"
      />
    </motion.div>
  );
};

export default PaymentsPage;
