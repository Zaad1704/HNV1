import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import RecordPaymentModal from '../components/common/RecordPaymentModal';

// Data fetching function for React Query
const fetchPayments = async () => {
    const { data } = await apiClient.get('/payments');
    return data.data;
};

const PaymentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use React Query to fetch data, which handles loading and error states automatically
  const { data: payments = [], isLoading, isError } = useQuery(['payments'], fetchPayments);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/20 text-green-400';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };

  if (isLoading) return <div className="text-white text-center p-8">Loading payment records...</div>;
  if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch payment records.</div>;

  return (
    <div className="text-white">
      {/* Render the modal, its visibility is controlled by isModalOpen state */}
      <RecordPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Payment History</h1>
        {/* This button now opens the modal */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 shadow-lg hover:shadow-cyan-400/50 transition-all"
        >
          + Record Manual Payment
        </button>
      </div>

      <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Transaction ID</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Tenant</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Property</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Amount</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {payments.length > 0 ? (
                payments.map((payment: any) => (
                  <tr key={payment._id} className="hover:bg-slate-800 transition-colors">
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
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-400">No payment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
