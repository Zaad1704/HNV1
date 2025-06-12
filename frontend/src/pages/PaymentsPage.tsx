import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.get('/payments');
        setPayments(response.data.data);
      } catch (err) {
        setError('Failed to fetch payment records.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

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

  if (loading) return <div className="text-white text-center p-8">Loading payment records...</div>;
  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Payment History</h1>
        {/* In a future update, a "Record Manual Payment" button could be added here */}
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
                payments.map((payment) => (
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
