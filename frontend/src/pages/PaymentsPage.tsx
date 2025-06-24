import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import RecordPaymentModal from '../components/common/RecordPaymentModal';
import { Download } from 'lucide-react';

const fetchPayments = async () => {
    const { data } = await apiClient.get('/payments');
    return data.data;
};

const PaymentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: payments = [], isLoading, isError } = useQuery(['payments'], fetchPayments);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- NEW: Secure download handler ---
  const handleDownloadReceipt = async (paymentId: string) => {
    setDownloadingId(paymentId); // Set loading state for this specific button
    try {
      // Use apiClient to make an authorized request.
      // Tell it to expect a 'blob' (a file-like object) as the response.
      const response = await apiClient.get(`/receipts/payment/${paymentId}`, {
        responseType: 'blob',
      });

      // Create a temporary URL from the downloaded blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${paymentId}.pdf`); // Set the filename
      document.body.appendChild(link);
      
      // Programmatically click the link and then remove it
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to download receipt:", error);
      alert("Could not download receipt.");
    } finally {
      setDownloadingId(null); // Clear loading state
    }
  };

    const getStatusBadge = (status: string) => {
        const statusClasses: { [key: string]: string } = {
            Paid: 'bg-green-100 text-green-800',
            Pending: 'bg-yellow-100 text-yellow-800',
            Failed: 'bg-red-100 text-red-800',
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

  if (isLoading) return <div className="text-white text-center p-8">Loading...</div>;
  if (isError) return <div className="text-red-400 text-center p-8">Error loading payments.</div>;

  return (
    <div className="text-white">
      <RecordPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Payment History</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500">
          + Record Manual Payment
        </button>
      </div>
      <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 uppercase">Transaction ID</th>
                <th className="p-4 uppercase">Tenant</th>
                <th className="p-4 uppercase">Property</th>
                <th className="p-4 uppercase">Amount</th>
                <th className="p-4 uppercase">Date</th>
                <th className="p-4 uppercase">Status</th>
                <th className="p-4 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {payments.map((payment: any) => (
                <tr key={payment._id} className="hover:bg-slate-800">
                  <td className="p-4 text-slate-400 font-mono text-xs">{payment.transactionId || payment._id}</td>
                  <td className="p-4 font-bold text-white">{payment.tenantId?.name || 'N/A'}</td>
                  <td className="p-4 text-slate-300">{payment.propertyId?.name || 'N/A'}</td>
                  <td className="p-4 text-slate-300 font-semibold">${payment.amount.toFixed(2)}</td>
                  <td className="p-4 text-slate-300">{formatDate(payment.paymentDate)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                        onClick={() => handleDownloadReceipt(payment._id)}
                        disabled={downloadingId === payment._id}
                        className="font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 ml-auto disabled:opacity-50"
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
