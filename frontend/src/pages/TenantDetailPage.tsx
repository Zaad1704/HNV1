import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Share2, Download, MessageCircle, Phone, Mail } from 'lucide-react';
import TenantProfileDashboard from '../components/tenant/TenantProfileDashboard';
import TenantCommunicationLog from '../components/tenant/TenantCommunicationLog';
import TenantDocumentManager from '../components/tenant/TenantDocumentManager';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const TenantDetailPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}`);
      return data.data;
    },
    enabled: !!tenantId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tenant Not Found</h2>
          <p className="text-gray-600 mb-4">The requested tenant could not be found.</p>
          <button
            onClick={() => navigate('/dashboard/tenants')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'communication', label: 'Communication', count: 12 },
    { id: 'documents', label: 'Documents', count: 8 },
    { id: 'maintenance', label: 'Maintenance', count: 3 },
    { id: 'payments', label: 'Payments', count: 24 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/tenants')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-gray-600">Unit {tenant.unit} • {tenant.propertyId?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">
              <Phone size={16} />
              Call
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
              <Mail size={16} />
              Email
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600">
              <MessageCircle size={16} />
              Message
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200">
              <Share2 size={16} />
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200">
              <Download size={16} />
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200">
              <Edit size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <TenantProfileDashboard tenantId={tenantId!} />
          )}
          
          {activeTab === 'communication' && (
            <TenantCommunicationLog 
              tenantId={tenantId!} 
              tenantName={tenant.name}
            />
          )}
          
          {activeTab === 'documents' && (
            <TenantDocumentManager 
              tenantId={tenantId!} 
              tenantName={tenant.name}
            />
          )}
          
          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance Requests</h3>
              <p className="text-gray-600">Maintenance request management coming soon</p>
            </div>
          )}
          
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment History</h3>
              <p className="text-gray-600">Detailed payment history coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDetailPage;