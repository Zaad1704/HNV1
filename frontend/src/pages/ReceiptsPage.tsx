import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Receipt, Download, Search, Calendar, Filter } from 'lucide-react';
import UniversalCard from '../components/common/UniversalCard';
import UniversalHeader from '../components/common/UniversalHeader';
import UniversalActionButton from '../components/common/UniversalActionButton';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import { useCrossData } from '../hooks/useCrossData';

const ReceiptsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const { stats } = useCrossData();

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
    <div className="space-y-8">
      <UniversalHeader
        title="Payment Receipts"
        subtitle={`View and manage all payment receipts (${receipts.length} total)`}
        icon={Receipt}
        stats={[
          { label: 'Total', value: receipts.length, color: 'blue' },
          { label: 'This Month', value: receipts.filter((r: any) => new Date(r.paymentDate).getMonth() === new Date().getMonth()).length, color: 'green' },
          { label: 'Generated', value: receipts.filter((r: any) => r.receiptNumber).length, color: 'purple' }
        ]}
      />

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search receipts by tenant, property, or receipt number..."
        showStatusFilter={false}
      />

      {receipts.length > 0 ? (
        <div className="universal-grid universal-grid-1">
          {receipts.map((receipt: any, index: number) => (
            <UniversalCard key={receipt._id} delay={index * 0.05} gradient="blue">
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
                  
                  <UniversalActionButton
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={() => handleDownloadReceipt(receipt._id)}
                  >
                    Download PDF
                  </UniversalActionButton>
                </div>
              </div>
              
              {receipt.handwrittenReceiptNumber && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-text-secondary">
                    Manual Receipt #: {receipt.handwrittenReceiptNumber}
                  </p>
                </div>
              )}
            </UniversalCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Receipt size={64} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            No Receipts Found
          </h3>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            No payment receipts match your current filters. Try adjusting your search criteria or generate new receipts from the payments section.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;