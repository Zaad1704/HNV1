import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import ExportModal from '../components/common/ExportModal';
import { CheckCircle, CreditCard, Settings, Trash2, Download, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDataExport } from '../hooks/useDataExport';

const fetchBillingInfo = async () => {
  try {
    const { data } = await apiClient.get("/billing");
    return data.data || null;
  } catch (error) {
    console.error('Billing info error:', error);
    return null;
  }
};

const fetchBillingHistory = async () => {
  try {
    const { data } = await apiClient.get("/billing/history");
    return data.data || [];
  } catch (error) {
    console.error('Billing history error:', error);
    return [];
  }
};

const BillingPage: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const { exportData } = useDataExport();

  const { data: billingInfo, isLoading, isError, error } = useQuery({
      queryKey: ['billingInfo'],
      queryFn: fetchBillingInfo,
      retry: 1,
      staleTime: 30000
  });

  const { data: billingHistory = [] } = useQuery({
      queryKey: ['billingHistory'],
      queryFn: fetchBillingHistory,
      enabled: showHistory,
      retry: 1,
      staleTime: 30000
  });

  const filteredHistory = useMemo(() => {
    if (!billingHistory) return [];
    
    return billingHistory.filter((item: any) => {
      const matchesSearch = !searchQuery || 
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.amount?.toString().includes(searchQuery);
      
      const matchesStatus = !filters.status || item.status === filters.status;
      
      return matchesSearch && matchesStatus;
    });
  }, [billingHistory, searchQuery, filters]);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' }
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
        await exportData('billing', 'billing-history', { format: 'xlsx', filters: { ids } });
      }
    }
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusChip = (status?: string) => {
      if (!status) return null;
      const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full capitalize';
      const statusMap = {
          active: `${baseClasses} bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300`,
          trialing: `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300`,
          canceled: `${baseClasses} bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400`,
          past_due: `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300`,
      };
      return statusMap[status as keyof typeof statusMap] || `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300`;
  };

  if (isLoading) return <div className="text-center p-8 text-dark-text">Loading Billing Information...</div>;
  
  if (isError) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">Error loading billing information</div>
        <div className="text-sm text-gray-500 mb-4">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </div>
        <Link to="/pricing" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          View Plans
        </Link>
      </div>
    );
  }

  if (!billingInfo || !billingInfo.planId) {
    return (
        <div className="text-center bg-light-card p-8 rounded-xl border border-border-color">
            <h2 className="text-2xl font-bold text-dark-text">No Active Subscription Found</h2>
            <p className="mt-2 text-light-text">Please subscribe to a plan to unlock all features.</p>
            <Link to="/pricing" className="mt-4 inline-block px-6 py-3 bg-brand-primary text-brand-dark font-bold rounded-lg hover:bg-opacity-90">
                View Plans
            </Link>
        </div>
    );
  }

  return (
    <div className="text-dark-text">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-text-secondary mt-1">Manage your subscription and billing history</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export History
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
          >
            <History size={16} />
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="mb-8">
          <SearchFilter
            onSearch={setSearchQuery}
            onFilter={setFilters}
            filters={filters}
            placeholder="Search billing history..."
            filterOptions={filterOptions}
          />
          
          <div className="bg-light-card rounded-xl shadow-lg border border-border-color overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-light-bg/50 border-b border-border-color">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Select</th>
                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Date</th>
                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Description</th>
                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Amount</th>
                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item: any) => (
                      <tr key={item._id} className="hover:bg-light-bg/50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedHistory.includes(item._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedHistory(prev => [...prev, item._id]);
                              } else {
                                setSelectedHistory(prev => prev.filter(id => id !== item._id));
                              }
                            }}
                            className="w-4 h-4 rounded border-2"
                          />
                        </td>
                        <td className="p-4 text-light-text">{formatDate(item.date)}</td>
                        <td className="p-4 font-semibold text-dark-text">{item.description}</td>
                        <td className="p-4 font-semibold text-dark-text">${(item.amount / 100).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={getStatusChip(item.status)}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-light-text">No billing history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <BulkActions
            selectedItems={selectedHistory}
            totalItems={filteredHistory?.length || 0}
            onSelectAll={() => setSelectedHistory(filteredHistory?.map((h: any) => h._id) || [])}
            onClearSelection={() => setSelectedHistory([])}
            actions={bulkActions}
          />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-light-card p-8 rounded-xl shadow-lg border border-border-color">
          <h2 className="text-2xl font-bold text-dark-text mb-1">Your Current Plan</h2>
          <p className="text-light-text mb-6">Manage your subscription and view plan details.</p>
          <div className="bg-dark-bg/50 p-6 rounded-lg border border-border-color">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-extrabold text-brand-primary">{billingInfo.planId.name}</h3>
                <p className="text-lg font-mono mt-1 text-light-text">
                  ${(billingInfo.planId.price / 100).toFixed(2)} / {billingInfo.planId.duration}
                </p>
              </div>
              {getStatusChip(billingInfo.status)}
            </div>
            <div className="border-t border-border-color my-6"></div>
            <h4 className="font-semibold text-dark-text mb-3">Plan Features:</h4>
            <ul className="space-y-3 text-light-text">
              {(billingInfo.planId.features || []).map((feature: string) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-light-card p-6 rounded-xl border border-border-color">
            <p className="text-sm text-light-text">Your subscription is currently {billingInfo.status}.</p>
            <p className="font-semibold text-dark-text mt-1">
              {billingInfo.status === 'trialing' ? 'Your trial expires on:' : 'Your plan renews on:'}
            </p>
            <p className="text-2xl font-bold font-mono text-brand-primary">
              {formatDate(billingInfo.status === 'trialing' ? billingInfo.trialExpiresAt : billingInfo.currentPeriodEndsAt)}
            </p>
          </div>
          
          <div className="bg-light-card p-6 rounded-xl border border-border-color">
            <h3 className="font-semibold text-dark-text mb-4 flex items-center gap-2">
              <Settings size={20} />
              Manage Subscription
            </h3>
            <div className="space-y-3">
              <Link 
                to="/pricing" 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CreditCard size={16} />
                Change Plan
              </Link>
              
              {billingInfo.status === 'active' && (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  Pause Subscription
                </button>
              )}
              
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 size={16} />
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        section="billing"
        title="Billing History"
      />
    </div>
  );
};

export default BillingPage;
