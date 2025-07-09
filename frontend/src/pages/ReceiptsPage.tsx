import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Receipt, Download, Eye, Search, Calendar, Filter } from 'lucide-react';

const ReceiptsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['receipts', searchQuery, dateFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (dateFilter !== 'all') params.append('date', dateFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const { data } = await apiClient.get(`/receipts?${params.toString()}`);
      return data.data || [];
    }
  });

  const handleDownloadReceipt = async (receiptId: string) => {
    try {
      const response = await apiClient.get(`/receipts/${receiptId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download receipt');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading receipts...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Receipt size={32} className="text-blue-600" />
            Payment Receipts
          </h1>
          <p className="text-text-secondary mt-2">
            View and manage all payment receipts ({receipts.length} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      {receipts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {receipts.map((receipt: any) => (
            <motion.div
              key={receipt._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Receipt size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      Receipt #{receipt.receiptNumber}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {receipt.tenantName} - {receipt.propertyName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(receipt.paymentDate).toLocaleDateString()} • Unit: {receipt.unitNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      ${receipt.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {receipt.rentMonth || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(receipt._id)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {receipt.handwrittenReceiptNumber && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-text-secondary">
                    Manual Receipt #: {receipt.handwrittenReceiptNumber}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Receipt size={64} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            No Receipts Found
          </h3>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            No payment receipts match your current filters. Try adjusting your search criteria or generate new receipts from the payments section.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReceiptsPage;