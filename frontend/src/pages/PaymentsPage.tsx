import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import RecordPaymentModal from '../components/common/RecordPaymentModal';
import { Download, PlusCircle } from 'lucide-react';

const fetchPayments = async () => {
    const { data } = await apiClient.get('/payments');
    return data.data;
};

const PaymentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: payments = [], isLoading, isError } = useQuery({ queryKey:['payments'], queryFn: fetchPayments });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  if (isLoading) return <div className="text-dark-text text-center p-8">Loading...</div>;
  if (isError) return <div className="text-red-400 text-center p-8">Error loading payments.</div>;

  return (
    <div className="text-dark-text dark:text-dark-text-dark">
      <RecordPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary shadow-md">
          <PlusCircle size={18} />
          Record Manual Payment
        </button>
      </div>
      <div className="bg-light-card rounded-2xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-light-bg border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
              <tr>
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
              {payments.map((payment: any) => (
                <tr key={payment._id} className="hover:bg-light-bg dark:hover:bg-dark-bg/40">
                  <td className="p-4 text-light-text dark:text-light-text-dark font-mono text-xs">{payment.transactionId || payment._id}</td>
                  <td className="p-4 font-bold text-dark-text dark:text-dark-text-dark">{payment.tenantId?.name || 'N/A'}</td>
                  <td className="p-4 text-light-text dark:text-light-text-dark">{payment.propertyId?.name || 'N/A'}</td>
                  <td className="p-4 text-dark-text font-semibold dark:text-dark-text-dark">${payment.amount.toFixed(2)}</td>
                  <td className="p-4 text-light-text dark:text-light-text-dark">{formatDate(payment.paymentDate)}</td>
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
    </div>
  );
};

export default PaymentsPage;
