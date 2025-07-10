import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, DollarSign, Calendar, MapPin, Phone, Mail, FileText, Wrench, AlertTriangle, Download, Edit } from 'lucide-react';
import UniversalCard from '../components/common/UniversalCard';
import UniversalHeader from '../components/common/UniversalHeader';
import UniversalStatusBadge from '../components/common/UniversalStatusBadge';
import UniversalActionButton from '../components/common/UniversalActionButton';

import TenantAnalyticsDashboard from '../components/tenant/TenantAnalyticsDashboard';

const TenantDetailsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}`);
      return data.data;
    },
    enabled: !!tenantId
  });

  const { data: relatedData } = useQuery({
    queryKey: ['tenantRelatedData', tenantId],
    queryFn: async () => {
      const [payments, expenses, maintenance, approvals] = await Promise.all([
        apiClient.get(`/payments?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/expenses?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/maintenance?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/approvals?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } }))
      ]);

      return {
        payments: payments.data.data || [],
        expenses: expenses.data.data || [],
        maintenance: maintenance.data.data || [],
        approvals: approvals.data.data || []
      };
    },
    enabled: !!tenantId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading tenant details...</span>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Tenant Not Found</h3>
        <Link to="/dashboard/tenants" className="btn-gradient px-6 py-3 rounded-2xl font-semibold">
          Back to Tenants
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'payments', label: 'Payment History', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'analytics', label: 'Analytics', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const payments = relatedData?.payments || [];
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const currentMonthPayment = payments.find((p: any) => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const outstandingAmount = currentMonthPayment ? 0 : (tenant.rentAmount || 0);
  const monthsPaid = payments.length;
  const leaseStartDate = tenant.createdAt ? new Date(tenant.createdAt) : null;
  const monthsSinceStart = leaseStartDate ? 
    (currentYear - leaseStartDate.getFullYear()) * 12 + (currentMonth - leaseStartDate.getMonth()) + 1 : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/tenants" className="p-2 rounded-xl hover:bg-app-bg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{tenant.name}</h1>
            <p className="text-text-secondary">Tenant Details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <UniversalActionButton variant="success" size="sm" icon={Download}>
            Download PDF
          </UniversalActionButton>
          <UniversalActionButton variant="primary" icon={Edit}>
            Edit Tenant
          </UniversalActionButton>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Lease Information */}
              <UniversalCard gradient="blue">
                <h3 className="text-lg font-bold mb-4">Lease Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Property</p>
                    <p className="font-medium">{tenant.propertyId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Unit</p>
                    <p className="font-medium">Unit {tenant.unit || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Monthly Rent</p>
                    <p className="font-medium text-green-600">${tenant.rentAmount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Lease Start</p>
                    <p className="font-medium">{leaseStartDate?.toLocaleDateString() || 'N/A'}</p>
                  </div>
                  {tenant.leaseEndDate && (
                    <>
                      <div>
                        <p className="text-sm text-text-secondary">Lease End</p>
                        <p className="font-medium">{new Date(tenant.leaseEndDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Days Remaining</p>
                        <p className="font-medium text-orange-600">
                          {Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </UniversalCard>

              {/* Payment Summary */}
              <UniversalCard gradient="green">
                <h3 className="text-lg font-bold mb-4">Payment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">{monthsPaid}</p>
                    <p className="text-sm text-green-800">Months Paid</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{monthsSinceStart - monthsPaid}</p>
                    <p className="text-sm text-blue-800">Months Due</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">${totalPaid}</p>
                    <p className="text-sm text-purple-800">Total Paid</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-2xl font-bold text-red-600">${outstandingAmount}</p>
                    <p className="text-sm text-red-800">Outstanding</p>
                  </div>
                </div>
              </UniversalCard>


            </div>
          )}

          {activeTab === 'payments' && (
            <UniversalCard gradient="green">
              <h3 className="text-lg font-bold mb-4">Payment History</h3>
              <div className="space-y-3">
                {payments.map((payment: any) => (
                  <div key={payment._id} className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                    <div>
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-sm text-text-secondary">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <UniversalStatusBadge 
                      status={payment.status} 
                      variant={payment.status === 'Paid' ? 'success' : 'warning'}
                    />
                  </div>
                ))}
              </div>
            </UniversalCard>
          )}

          {activeTab === 'maintenance' && (
            <UniversalCard gradient="orange">
              <h3 className="text-lg font-bold mb-4">Maintenance Requests</h3>
              <div className="space-y-3">
                {relatedData?.maintenance?.map((request: any) => (
                  <div key={request._id} className="p-4 bg-app-bg rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{request.description}</h4>
                      <UniversalStatusBadge 
                        status={request.status}
                        variant={request.status === 'Open' ? 'warning' : 'success'}
                      />
                    </div>
                    <p className="text-sm text-text-secondary">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </UniversalCard>
          )}

          {activeTab === 'analytics' && (
            <UniversalCard gradient="purple">
              <TenantAnalyticsDashboard tenantId={tenantId!} tenant={tenant} />
            </UniversalCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tenant Info */}
          <UniversalCard gradient="blue">
            <div className="text-center mb-4">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                {tenant.imageUrl || tenant.tenantImage ? (
                  <img 
                    src={tenant.imageUrl || tenant.tenantImage} 
                    alt={tenant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.fallback-text');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`fallback-text text-white font-bold text-2xl ${tenant.imageUrl || tenant.tenantImage ? 'hidden' : ''}`}>
                  {tenant.name?.charAt(0).toUpperCase() || 'T'}
                </div>
              </div>
              <h3 className="text-lg font-bold">{tenant.name}</h3>
              <UniversalStatusBadge 
                status={tenant.status} 
                variant={tenant.status === 'Active' ? 'success' : 'warning'}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-text-muted" />
                <span className="text-sm">{tenant.email}</span>
              </div>
              {tenant.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-text-muted" />
                  <span className="text-sm">{tenant.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-text-muted" />
                <span className="text-sm">Unit {tenant.unit}</span>
              </div>
            </div>
          </UniversalCard>

          {/* Quick Actions */}
          <UniversalCard gradient="purple">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to={`/dashboard/payments?tenantId=${tenant._id}`}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors block text-center"
              >
                View Payments ({payments.length})
              </Link>
              <Link 
                to={`/dashboard/maintenance?tenantId=${tenant._id}`}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors block text-center"
              >
                Maintenance ({relatedData?.maintenance?.length || 0})
              </Link>
              <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                Send Message
              </button>
            </div>
          </UniversalCard>
        </div>
      </div>
    </motion.div>
  );
};

export default TenantDetailsPage;