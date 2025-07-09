import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, DollarSign, Wrench, Bell, FileText, Calendar } from 'lucide-react';

const UnitDetailsPage = () => {
  const { propertyId, unitNumber } = useParams<{ propertyId: string; unitNumber: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: unitData, isLoading } = useQuery({
    queryKey: ['unitDetails', propertyId, unitNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}/units/${unitNumber}`);
      return data.data;
    },
    enabled: !!propertyId && !!unitNumber
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading unit details...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'tenants', label: 'Tenants History', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'receipts', label: 'Receipts', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: FileText },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'approvals', label: 'Approvals', icon: Calendar }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/dashboard/properties/${propertyId}`}
            className="p-2 rounded-xl hover:bg-app-bg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Unit {unitNumber}</h1>
            <p className="text-text-secondary">{unitData?.property?.name || 'Property'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-app-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <UnitOverview unitData={unitData} />
        )}
        {activeTab === 'tenants' && (
          <UnitTenants propertyId={propertyId!} unitNumber={unitNumber!} />
        )}
        {activeTab === 'payments' && (
          <UnitPayments propertyId={propertyId!} unitNumber={unitNumber!} />
        )}
        {activeTab === 'receipts' && (
          <UnitReceipts propertyId={propertyId!} unitNumber={unitNumber!} />
        )}
        {activeTab === 'expenses' && (
          <UnitExpenses propertyId={propertyId!} unitNumber={unitNumber!} />
        )}
        {activeTab === 'maintenance' && (
          <UnitMaintenance propertyId={propertyId!} unitNumber={unitNumber!} />
        )}
        {activeTab === 'reminders' && (
          <UnitReminders propertyId={propertyId!} unitNumber={unitNumber!} />
        )}
        {activeTab === 'approvals' && (
          <UnitApprovals propertyId={propertyId!} unitNumber={unitNumber!} />
        )}
      </div>
    </motion.div>
  );
};

// Overview Component
const UnitOverview = ({ unitData }: { unitData: any }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h3 className="text-lg font-bold mb-4">Current Status</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            unitData?.currentTenant ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {unitData?.currentTenant ? 'Occupied' : 'Vacant'}
          </span>
        </div>
        {unitData?.currentTenant && (
          <>
            <div className="flex justify-between">
              <span>Tenant:</span>
              <span>{unitData.currentTenant.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Rent:</span>
              <span>${unitData.currentTenant.rentAmount || 0}</span>
            </div>
          </>
        )}
      </div>
    </div>
    
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Total Tenants:</span>
          <span>{unitData?.totalTenants || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Payments:</span>
          <span>${unitData?.totalPayments || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Expenses:</span>
          <span>${unitData?.totalExpenses || 0}</span>
        </div>
      </div>
    </div>
  </div>
);

// Other tab components (simplified)
const UnitTenants = ({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) => {
  const { data: tenants = [] } = useQuery({
    queryKey: ['unitTenants', propertyId, unitNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}/units/${unitNumber}/tenants`);
      return data.data || [];
    }
  });

  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h3 className="text-lg font-bold mb-4">Tenants History</h3>
      <div className="space-y-4">
        {tenants.map((tenant: any) => (
          <Link
            key={tenant._id}
            to={`/dashboard/tenants/${tenant._id}`}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <p className="font-medium">{tenant.name}</p>
              <p className="text-sm text-gray-600">{tenant.email}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${tenant.rentAmount || 0}</p>
              <p className="text-sm text-gray-600">{tenant.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const UnitPayments = ({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) => {
  const { data: payments = [] } = useQuery({
    queryKey: ['unitPayments', propertyId, unitNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}/units/${unitNumber}/payments`);
      return data.data || [];
    }
  });

  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h3 className="text-lg font-bold mb-4">Payment History</h3>
      <div className="space-y-4">
        {payments.map((payment: any) => (
          <div key={payment._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">${payment.amount}</p>
              <p className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</p>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${
              payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {payment.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const UnitReceipts = ({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) => {
  const { data: receipts = [] } = useQuery({
    queryKey: ['unitReceipts', propertyId, unitNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}/units/${unitNumber}/receipts`);
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

  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h3 className="text-lg font-bold mb-4">Unit Receipts</h3>
      <div className="space-y-4">
        {receipts.map((receipt: any) => (
          <div key={receipt._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Receipt #{receipt.receiptNumber}</p>
              <p className="text-sm text-gray-600">{new Date(receipt.paymentDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">{receipt.tenantName}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-green-600">${receipt.amount}</span>
              <button
                onClick={() => handleDownloadReceipt(receipt._id)}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                title="Download PDF"
              >
                📄
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UnitExpenses = ({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) => (
  <div className="app-surface rounded-3xl p-6 border border-app-border">
    <h3 className="text-lg font-bold mb-4">Unit Expenses</h3>
    <p className="text-gray-600">Expense history for this unit will be displayed here.</p>
  </div>
);

const UnitMaintenance = ({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) => (
  <div className="app-surface rounded-3xl p-6 border border-app-border">
    <h3 className="text-lg font-bold mb-4">Maintenance History</h3>
    <p className="text-gray-600">Maintenance records for this unit will be displayed here.</p>
  </div>
);

const UnitReminders = ({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) => (
  <div className="app-surface rounded-3xl p-6 border border-app-border">
    <h3 className="text-lg font-bold mb-4">Unit Reminders</h3>
    <p className="text-gray-600">Reminders related to this unit will be displayed here.</p>
  </div>
);

const UnitApprovals = ({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) => (
  <div className="app-surface rounded-3xl p-6 border border-app-border">
    <h3 className="text-lg font-bold mb-4">Approval History</h3>
    <p className="text-gray-600">Approval requests for this unit will be displayed here.</p>
  </div>
);

export default UnitDetailsPage;