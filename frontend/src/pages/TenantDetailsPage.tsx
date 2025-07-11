import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, DollarSign, Calendar, MapPin, Phone, Mail, FileText, Wrench, AlertTriangle, Download, Edit, Trash2, Archive, ArchiveRestore, User } from 'lucide-react';
import UniversalCard from '../components/common/UniversalCard';
import UniversalHeader from '../components/common/UniversalHeader';
import UniversalStatusBadge from '../components/common/UniversalStatusBadge';
import UniversalActionButton from '../components/common/UniversalActionButton';

import TenantAnalyticsDashboard from '../components/tenant/TenantAnalyticsDashboard';
import EditTenantModal from '../components/common/EditTenantModal';
import QuickPaymentModal from '../components/common/QuickPaymentModal';

const TenantDetailsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'normal' | 'overdue'>('normal');

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
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'personal', label: 'Personal Details', icon: User }
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
  
  // Calculate overdue payments
  const monthsOverdue = Math.max(0, monthsSinceStart - monthsPaid);
  const overdueAmount = monthsOverdue * (tenant.rentAmount || 0);
  const hasOverdue = monthsOverdue > 0;

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
          <button
            onClick={async () => {
              try {
                const response = await apiClient.post(`/tenants/${tenantId}/download-pdf`, {}, { responseType: 'blob' });
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${tenant.name}-details.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                alert('Failed to download PDF');
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-green-600 transition-colors"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-blue-600 transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={async () => {
              const isCurrentlyArchived = tenant.status === 'Archived';
              const action = isCurrentlyArchived ? 'restore' : 'archive';
              const confirmMessage = isCurrentlyArchived 
                ? `Restore ${tenant.name}? This will make them active again.`
                : `Archive ${tenant.name}? This will hide them from active listings.`;
              
              if (confirm(confirmMessage)) {
                try {
                  await apiClient.put(`/tenants/${tenantId}`, {
                    status: isCurrentlyArchived ? 'Active' : 'Archived'
                  });
                  alert(`Tenant ${action}d successfully!`);
                  // Refresh the page to show updated status
                  window.location.reload();
                } catch (error: any) {
                  alert(`Failed to ${action} tenant: ${error.response?.data?.message || 'Unknown error'}`);
                }
              }
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors ${
              tenant.status === 'Archived' 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {tenant.status === 'Archived' ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            {tenant.status === 'Archived' ? 'Restore' : 'Archive'}
          </button>
          <button
            onClick={async () => {
              if (confirm(`Delete ${tenant.name}? This action cannot be undone and will remove all associated data.`)) {
                try {
                  await apiClient.delete(`/tenants/${tenantId}`);
                  alert('Tenant deleted successfully!');
                  // Navigate back to tenants page
                  window.location.href = '/dashboard/tenants';
                } catch (error: any) {
                  alert(`Failed to delete tenant: ${error.response?.data?.message || 'Unknown error'}`);
                }
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
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
                    <p className="font-medium">{tenant.propertyId?.name || tenant.property?.name || 'N/A'}</p>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Maintenance Requests ({relatedData?.maintenance?.length || 0})</h3>
                <div className="flex gap-2">
                  <Link 
                    to={`/dashboard/maintenance?tenantId=${tenantId}`}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    View All Issues
                  </Link>
                  <button
                    onClick={async () => {
                      const description = prompt('Describe the maintenance issue:');
                      if (description) {
                        const priority = prompt('Priority (Low/Medium/High):', 'Medium');
                        const category = prompt('Category (optional):');
                        try {
                          await apiClient.post('/maintenance', {
                            tenantId: tenant._id,
                            propertyId: tenant.propertyId?._id || tenant.propertyId,
                            description,
                            priority: priority || 'Medium',
                            category
                          });
                          alert('Maintenance request created successfully!');
                          window.location.reload();
                        } catch (error: any) {
                          alert(`Failed to create request: ${error.response?.data?.message || 'Unknown error'}`);
                        }
                      }
                    }}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    New Request
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {relatedData?.maintenance?.length > 0 ? (
                  relatedData.maintenance.map((request: any) => (
                    <div key={request._id} className="p-4 bg-app-bg rounded-xl border-l-4 border-orange-500">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg mb-1">{request.description}</h4>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              request.priority === 'High' ? 'bg-red-100 text-red-800' :
                              request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {request.priority} Priority
                            </span>
                            {request.category && <span>Category: {request.category}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <UniversalStatusBadge 
                            status={request.status}
                            variant={
                              request.status === 'Completed' ? 'success' :
                              request.status === 'In Progress' ? 'warning' :
                              request.status === 'Cancelled' ? 'error' : 'info'
                            }
                          />
                          <button
                            onClick={async () => {
                              const newStatus = prompt('Update status (Open/In Progress/Completed/Cancelled):', request.status);
                              if (newStatus && ['Open', 'In Progress', 'Completed', 'Cancelled'].includes(newStatus)) {
                                try {
                                  await apiClient.put(`/maintenance/${request._id}`, { status: newStatus });
                                  alert('Status updated successfully!');
                                  window.location.reload();
                                } catch (error: any) {
                                  alert(`Failed to update: ${error.response?.data?.message || 'Unknown error'}`);
                                }
                              }
                            }}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                      {request.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Notes:</strong> {request.notes}
                        </div>
                      )}
                      {(request.estimatedCost || request.actualCost) && (
                        <div className="mt-2 flex gap-4 text-sm">
                          {request.estimatedCost && <span>Estimated: ${request.estimatedCost}</span>}
                          {request.actualCost && <span>Actual: ${request.actualCost}</span>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">No Maintenance Requests</h4>
                    <p className="text-gray-500 mb-4">This tenant has no maintenance requests yet.</p>
                    <button
                      onClick={async () => {
                        const description = prompt('Describe the maintenance issue:');
                        if (description) {
                          try {
                            await apiClient.post('/maintenance', {
                              tenantId: tenant._id,
                              propertyId: tenant.propertyId?._id || tenant.propertyId,
                              description,
                              priority: 'Medium'
                            });
                            alert('Maintenance request created successfully!');
                            window.location.reload();
                          } catch (error: any) {
                            alert(`Failed to create request: ${error.response?.data?.message || 'Unknown error'}`);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Create First Request
                    </button>
                  </div>
                )}
              </div>
            </UniversalCard>
          )}

          {activeTab === 'analytics' && (
            <UniversalCard gradient="purple">
              <TenantAnalyticsDashboard tenantId={tenantId!} tenant={tenant} />
            </UniversalCard>
          )}

          {activeTab === 'documents' && (
            <UniversalCard gradient="blue">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Documents & Images</h3>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const description = prompt('Enter document description:');
                        if (description) {
                          try {
                            const formData = new FormData();
                            formData.append('document', file);
                            formData.append('description', description);
                            formData.append('tenantId', tenant._id);
                            
                            await apiClient.post('/upload/document', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            alert('Document uploaded successfully!');
                            window.location.reload();
                          } catch (error: any) {
                            alert(`Failed to upload document: ${error.response?.data?.message || 'Unknown error'}`);
                          }
                        }
                      }
                    }}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 text-sm"
                  >
                    Upload Document
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const description = prompt('Enter image description:');
                        if (description) {
                          try {
                            const formData = new FormData();
                            formData.append('image', file);
                            formData.append('description', description);
                            formData.append('tenantId', tenant._id);
                            
                            await apiClient.post('/upload/tenant-image', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            alert('Image uploaded successfully!');
                            window.location.reload();
                          } catch (error: any) {
                            alert(`Failed to upload image: ${error.response?.data?.message || 'Unknown error'}`);
                          }
                        }
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-3 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 text-sm"
                  >
                    Upload Image
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tenant Photo */}
                {(tenant.tenantImage || tenant.imageUrl) && (
                  <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={tenant.tenantImage || tenant.imageUrl} 
                        alt="Tenant Photo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Tenant Photo</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(tenant.tenantImage || tenant.imageUrl, '_blank')}
                        className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Full Size
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tenant.tenantImage || tenant.imageUrl;
                          link.download = `${tenant.name}-photo.jpg`;
                          link.click();
                        }}
                        className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Government ID Front */}
                {tenant.govtIdFront && (
                  <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="aspect-[3/2] mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={tenant.govtIdFront} 
                        alt="Government ID Front" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Government ID (Front)</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(tenant.govtIdFront, '_blank')}
                        className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Full Size
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tenant.govtIdFront;
                          link.download = `${tenant.name}-id-front.jpg`;
                          link.click();
                        }}
                        className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Government ID Back */}
                {tenant.govtIdBack && (
                  <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="aspect-[3/2] mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={tenant.govtIdBack} 
                        alt="Government ID Back" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Government ID (Back)</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(tenant.govtIdBack, '_blank')}
                        className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Full Size
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tenant.govtIdBack;
                          link.download = `${tenant.name}-id-back.jpg`;
                          link.click();
                        }}
                        className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Additional Adult Images */}
                {tenant.additionalAdults && tenant.additionalAdults.length > 0 && tenant.additionalAdults.map((adult: any, index: number) => (
                  adult.image && (
                    <div key={`adult-${index}`} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={adult.image} 
                          alt={`${adult.name || `Adult ${index + 1}`} Photo`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">{adult.name || `Adult ${index + 1}`} Photo</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(adult.image, '_blank')}
                          className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          View Full Size
                        </button>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = adult.image;
                            link.download = `${adult.name || `adult-${index + 1}`}-photo.jpg`;
                            link.click();
                          }}
                          className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
              
              {/* Uploaded Documents Section */}
              {tenant.documents && tenant.documents.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenant.documents.map((doc: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium">{doc.description}</p>
                            <p className="text-sm text-gray-500">{doc.filename}</p>
                          </div>
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Uploaded Images Section */}
              {tenant.uploadedImages && tenant.uploadedImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Uploaded Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenant.uploadedImages.map((img: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <img src={img.url} alt={img.description} className="w-full h-32 object-cover rounded mb-2" />
                        <p className="text-sm font-medium">{img.description}</p>
                        <button
                          onClick={() => window.open(img.url, '_blank')}
                          className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          View Full Size
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Documents Message */}
              {!tenant.tenantImage && !tenant.imageUrl && !tenant.govtIdFront && !tenant.govtIdBack && 
               (!tenant.additionalAdults || tenant.additionalAdults.length === 0 || !tenant.additionalAdults.some((adult: any) => adult.image)) &&
               (!tenant.documents || tenant.documents.length === 0) && (!tenant.uploadedImages || tenant.uploadedImages.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
                  <p className="text-gray-500 mb-4">Use the upload buttons above to add documents and images.</p>
                </div>
              )}
            </UniversalCard>
          )}

          {activeTab === 'personal' && (
            <UniversalCard gradient="green">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Complete Personal Details</h3>
                <button
                  onClick={async () => {
                    try {
                      const response = await apiClient.post(`/tenants/${tenantId}/personal-details-pdf`, {}, { responseType: 'blob' });
                      const blob = new Blob([response.data], { type: 'application/pdf' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${tenant.name}-complete-personal-details.pdf`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      alert('Failed to download personal details PDF');
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Download size={16} />
                  Download Complete PDF
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Photos Section */}
                <div>
                  <h4 className="font-semibold mb-4 text-lg border-b pb-2">Photos & Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Main Tenant Photo */}
                    {(tenant.tenantImage || tenant.imageUrl) && (
                      <div className="text-center">
                        <img 
                          src={tenant.tenantImage || tenant.imageUrl} 
                          alt="Tenant Photo" 
                          className="w-32 h-32 object-cover rounded-lg mx-auto mb-2 border-2 border-gray-200"
                        />
                        <p className="text-sm font-medium">Main Tenant Photo</p>
                      </div>
                    )}
                    
                    {/* Government IDs */}
                    {tenant.govtIdFront && (
                      <div className="text-center">
                        <img 
                          src={tenant.govtIdFront} 
                          alt="ID Front" 
                          className="w-32 h-20 object-cover rounded-lg mx-auto mb-2 border-2 border-gray-200"
                        />
                        <p className="text-sm font-medium">Government ID (Front)</p>
                      </div>
                    )}
                    
                    {tenant.govtIdBack && (
                      <div className="text-center">
                        <img 
                          src={tenant.govtIdBack} 
                          alt="ID Back" 
                          className="w-32 h-20 object-cover rounded-lg mx-auto mb-2 border-2 border-gray-200"
                        />
                        <p className="text-sm font-medium">Government ID (Back)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-gray-600">Full Name:</span> <span className="font-medium">{tenant.name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Email:</span> <span className="font-medium">{tenant.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Phone:</span> <span className="font-medium">{tenant.phone}</span></div>
                      {tenant.whatsappNumber && <div className="flex justify-between"><span className="text-gray-600">WhatsApp:</span> <span className="font-medium">{tenant.whatsappNumber}</span></div>}
                      <div className="flex justify-between"><span className="text-gray-600">Status:</span> <span className={`font-medium ${tenant.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{tenant.status}</span></div>
                      {tenant.numberOfOccupants && <div className="flex justify-between"><span className="text-gray-600">Occupants:</span> <span className="font-medium">{tenant.numberOfOccupants}</span></div>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Property Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-gray-600">Property:</span> <span className="font-medium">{tenant.propertyId?.name || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Unit:</span> <span className="font-medium">{tenant.unit}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Monthly Rent:</span> <span className="font-medium text-green-600">${tenant.rentAmount || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Security Deposit:</span> <span className="font-medium">${tenant.securityDeposit || 0}</span></div>
                      {tenant.leaseStartDate && <div className="flex justify-between"><span className="text-gray-600">Lease Start:</span> <span className="font-medium">{new Date(tenant.leaseStartDate).toLocaleDateString()}</span></div>}
                      {tenant.leaseEndDate && <div className="flex justify-between"><span className="text-gray-600">Lease End:</span> <span className="font-medium">{new Date(tenant.leaseEndDate).toLocaleDateString()}</span></div>}
                    </div>
                  </div>
                </div>
                
                {/* Family & Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Family Details</h4>
                    <div className="space-y-3">
                      {tenant.fatherName && <div className="flex justify-between"><span className="text-gray-600">Father's Name:</span> <span className="font-medium">{tenant.fatherName}</span></div>}
                      {tenant.motherName && <div className="flex justify-between"><span className="text-gray-600">Mother's Name:</span> <span className="font-medium">{tenant.motherName}</span></div>}
                      {tenant.govtIdNumber && <div className="flex justify-between"><span className="text-gray-600">Government ID:</span> <span className="font-medium">{tenant.govtIdNumber}</span></div>}
                      {tenant.occupation && <div className="flex justify-between"><span className="text-gray-600">Occupation:</span> <span className="font-medium">{tenant.occupation}</span></div>}
                      {tenant.monthlyIncome && <div className="flex justify-between"><span className="text-gray-600">Monthly Income:</span> <span className="font-medium text-green-600">${tenant.monthlyIncome}</span></div>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Contact & Emergency</h4>
                    <div className="space-y-3">
                      {tenant.emergencyContact?.name && <div className="flex justify-between"><span className="text-gray-600">Emergency Contact:</span> <span className="font-medium">{tenant.emergencyContact.name}</span></div>}
                      {tenant.emergencyContact?.phone && <div className="flex justify-between"><span className="text-gray-600">Emergency Phone:</span> <span className="font-medium">{tenant.emergencyContact.phone}</span></div>}
                      {tenant.emergencyContact?.relation && <div className="flex justify-between"><span className="text-gray-600">Relation:</span> <span className="font-medium">{tenant.emergencyContact.relation}</span></div>}
                      {tenant.reference?.name && <div className="flex justify-between"><span className="text-gray-600">Reference:</span> <span className="font-medium">{tenant.reference.name}</span></div>}
                      {tenant.reference?.phone && <div className="flex justify-between"><span className="text-gray-600">Reference Phone:</span> <span className="font-medium">{tenant.reference.phone}</span></div>}
                    </div>
                  </div>
                </div>
                
                {/* Addresses */}
                <div>
                  <h4 className="font-semibold mb-3 text-lg border-b pb-2">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tenant.presentAddress && (
                      <div>
                        <span className="text-gray-600 font-medium">Present Address:</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.presentAddress}</p>
                      </div>
                    )}
                    {tenant.permanentAddress && (
                      <div>
                        <span className="text-gray-600 font-medium">Permanent Address:</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.permanentAddress}</p>
                      </div>
                    )}
                    {tenant.previousAddress && (
                      <div>
                        <span className="text-gray-600 font-medium">Previous Address:</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.previousAddress}</p>
                      </div>
                    )}
                    {tenant.reasonForMoving && (
                      <div>
                        <span className="text-gray-600 font-medium">Reason for Moving:</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.reasonForMoving}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional Information */}
                {(tenant.vehicleDetails || tenant.petDetails || tenant.specialInstructions) && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tenant.vehicleDetails && (
                        <div>
                          <span className="text-gray-600 font-medium">Vehicle Details:</span>
                          <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.vehicleDetails}</p>
                        </div>
                      )}
                      {tenant.petDetails && (
                        <div>
                          <span className="text-gray-600 font-medium">Pet Details:</span>
                          <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.petDetails}</p>
                        </div>
                      )}
                    </div>
                    {tenant.specialInstructions && (
                      <div className="mt-4">
                        <span className="text-gray-600 font-medium">Special Instructions:</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Additional Adults */}
                {tenant.additionalAdults && tenant.additionalAdults.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Additional Adults ({tenant.additionalAdults.length})</h4>
                    <div className="space-y-4">
                      {tenant.additionalAdults.map((adult: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            {(adult.imageUrl || adult.image) && (
                              <img 
                                src={adult.imageUrl || adult.image} 
                                alt={`${adult.name || `Adult ${index + 1}`}`} 
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                              />
                            )}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                {adult.name && <div className="flex justify-between"><span className="text-gray-600">Name:</span> <span className="font-medium">{adult.name}</span></div>}
                                {adult.phone && <div className="flex justify-between"><span className="text-gray-600">Phone:</span> <span className="font-medium">{adult.phone}</span></div>}
                                {adult.relation && <div className="flex justify-between"><span className="text-gray-600">Relation:</span> <span className="font-medium">{adult.relation}</span></div>}
                              </div>
                              <div className="space-y-2">
                                {adult.govtIdNumber && <div className="flex justify-between"><span className="text-gray-600">ID Number:</span> <span className="font-medium">{adult.govtIdNumber}</span></div>}
                                {adult.fatherName && <div className="flex justify-between"><span className="text-gray-600">Father's Name:</span> <span className="font-medium">{adult.fatherName}</span></div>}
                                {adult.motherName && <div className="flex justify-between"><span className="text-gray-600">Mother's Name:</span> <span className="font-medium">{adult.motherName}</span></div>}
                              </div>
                            </div>
                          </div>
                          {adult.permanentAddress && (
                            <div className="mt-3">
                              <span className="text-gray-600 font-medium">Address:</span>
                              <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{adult.permanentAddress}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </UniversalCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tenant Info */}
          <UniversalCard gradient="blue">
            <div className="text-center mb-4">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative">
                {(tenant.tenantImage || tenant.imageUrl) ? (
                  <img 
                    src={tenant.tenantImage || tenant.imageUrl}
                    alt={tenant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.fallback-text');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`fallback-text text-white font-bold text-2xl absolute inset-0 flex items-center justify-center ${(tenant.tenantImage || tenant.imageUrl) ? 'hidden' : ''}`}>
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
              <button
                onClick={() => {
                  setPaymentType('normal');
                  setShowQuickPayment(true);
                }}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                Quick Payment
              </button>
              
              {hasOverdue ? (
                <button
                  onClick={() => {
                    setPaymentType('overdue');
                    setShowQuickPayment(true);
                  }}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Overdue Payment
                  <div className="text-xs mt-1">
                    ${overdueAmount} ({monthsOverdue} months)
                  </div>
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-xl font-medium text-center">
                  No Overdue Payments
                </div>
              )}
              <Link 
                to={`/dashboard/payments?tenantId=${tenant._id}`}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors block text-center"
              >
                View Payments ({payments.length})
              </Link>
              <button
                onClick={async () => {
                  const description = prompt('Describe the maintenance issue:');
                  if (description) {
                    const priority = prompt('Priority (Low/Medium/High):', 'Medium');
                    try {
                      await apiClient.post('/maintenance', {
                        tenantId: tenant._id,
                        propertyId: tenant.propertyId?._id || tenant.propertyId,
                        description,
                        priority: priority || 'Medium'
                      });
                      alert('Maintenance request submitted successfully!');
                      window.location.reload();
                    } catch (error: any) {
                      alert(`Failed to submit maintenance request: ${error.response?.data?.message || 'Unknown error'}`);
                    }
                  }
                }}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                Report Issue
              </button>
              <Link 
                to={`/dashboard/maintenance?tenantId=${tenant._id}`}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors block text-center"
              >
                View All Issues ({relatedData?.maintenance?.length || 0})
              </Link>
              
              <button
                onClick={async () => {
                  const months = prompt('Enter additional months to extend lease:', '12');
                  if (months && !isNaN(Number(months))) {
                    try {
                      const currentEndDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : new Date();
                      const newEndDate = new Date(currentEndDate);
                      newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));
                      
                      await apiClient.put(`/tenants/${tenant._id}`, {
                        leaseEndDate: newEndDate.toISOString().split('T')[0],
                        leaseDuration: (tenant.leaseDuration || 12) + parseInt(months)
                      });
                      alert(`Lease extended by ${months} months successfully!`);
                      window.location.reload();
                    } catch (error: any) {
                      alert(`Failed to renew lease: ${error.response?.data?.message || 'Unknown error'}`);
                    }
                  }
                }}
                className="w-full bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-600 transition-colors"
              >
                Renew Lease
              </button>
              
              <button
                onClick={async () => {
                  const reason = prompt('Reason for lease termination (optional):');
                  if (confirm(`Terminate lease for ${tenant.name}? This will archive the tenant.`)) {
                    try {
                      await apiClient.put(`/tenants/${tenant._id}`, {
                        status: 'Archived',
                        leaseEndDate: new Date().toISOString().split('T')[0],
                        terminationReason: reason || 'Lease terminated'
                      });
                      alert('Lease terminated and tenant archived successfully!');
                      window.location.reload();
                    } catch (error: any) {
                      alert(`Failed to terminate lease: ${error.response?.data?.message || 'Unknown error'}`);
                    }
                  }
                }}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Terminate Lease
              </button>
            </div>
          </UniversalCard>
        </div>
      </div>
      
      {/* Edit Modal */}
      <EditTenantModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        tenant={tenant}
        onTenantUpdated={(updatedTenant) => {
          // Refresh tenant data
          window.location.reload();
        }}
      />
      
      {/* Quick Payment Modal */}
      <QuickPaymentModal
        isOpen={showQuickPayment}
        onClose={() => setShowQuickPayment(false)}
        tenant={tenant}
        onPaymentAdded={() => {
          // Refresh page to show new payment
          window.location.reload();
        }}
        isOverdue={paymentType === 'overdue'}
        overdueAmount={overdueAmount}
        monthsOverdue={monthsOverdue}
      />
    </motion.div>
  );
};

export default TenantDetailsPage;