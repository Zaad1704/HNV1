import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Share2, Download, MessageCircle, Phone, Mail } from 'lucide-react';
import TenantProfileDashboard from '../components/tenant/TenantProfileDashboard';
import TenantCommunicationLog from '../components/tenant/TenantCommunicationLog';
import TenantDocumentManager from '../components/tenant/TenantDocumentManager';
import TenantNotesAndTags from '../components/tenant/TenantNotesAndTags';
import TenantPaymentTimeline from '../components/tenant/TenantPaymentTimeline';
import TenantAnalyticsDashboard from '../components/tenant/TenantAnalyticsDashboard';
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
    { id: 'analytics', label: 'Analytics', count: null },
    { id: 'payments', label: 'Payments', count: 24 },
    { id: 'communication', label: 'Messages', count: 12 },
    { id: 'documents', label: 'Documents', count: 8 },
    { id: 'notes', label: 'Notes', count: 5 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-First Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard/tenants')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{tenant.name}</h1>
                <p className="text-sm text-gray-600 truncate">Unit {tenant.unit} • {tenant.propertyId?.name}</p>
              </div>
            </div>
            
            {/* Mobile Action Menu */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 touch-manipulation">
                  <Phone size={16} />
                  <span className="hidden lg:inline">Call</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 touch-manipulation">
                  <Mail size={16} />
                  <span className="hidden lg:inline">Email</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 touch-manipulation">
                  <MessageCircle size={16} />
                  <span className="hidden lg:inline">Message</span>
                </button>
              </div>
              
              {/* Mobile Quick Actions */}
              <div className="md:hidden flex items-center gap-1">
                <button className="p-3 bg-green-500 text-white rounded-xl touch-manipulation">
                  <Phone size={18} />
                </button>
                <button className="p-3 bg-blue-500 text-white rounded-xl touch-manipulation">
                  <Mail size={18} />
                </button>
                <button className="p-3 bg-purple-500 text-white rounded-xl touch-manipulation">
                  <MessageCircle size={18} />
                </button>
              </div>
              
              <div className="hidden md:flex items-center gap-2">
                <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 touch-manipulation">
                  <Share2 size={16} />
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 touch-manipulation">
                  <Download size={16} />
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 touch-manipulation">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Navigation Tabs */}
        <div className="sticky top-16 md:top-20 z-10 bg-white border-b border-gray-200">
          <div className="px-4 md:px-6">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 touch-manipulation min-w-max ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium">{tab.label}</span>
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
        </div>

        {/* Mobile-Optimized Tab Content */}
        <div className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 md:space-y-6">
              <TenantProfileDashboard tenantId={tenantId!} className="mobile-optimized" />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-4 md:space-y-6">
              <TenantAnalyticsDashboard tenantId={tenantId!} className="mobile-optimized" />
            </div>
          )}
          
          {activeTab === 'payments' && (
            <div className="space-y-4 md:space-y-6">
              <TenantPaymentTimeline tenantId={tenantId!} className="mobile-optimized" />
            </div>
          )}
          
          {activeTab === 'communication' && (
            <div className="space-y-4 md:space-y-6">
              <TenantCommunicationLog 
                tenantId={tenantId!} 
                tenantName={tenant.name}
                className="mobile-optimized"
              />
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div className="space-y-4 md:space-y-6">
              <TenantDocumentManager 
                tenantId={tenantId!} 
                tenantName={tenant.name}
                className="mobile-optimized"
              />
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div className="space-y-4 md:space-y-6">
              <TenantNotesAndTags 
                tenantId={tenantId!} 
                tenantName={tenant.name}
                className="mobile-optimized"
              />
            </div>
          )}
        </div>
        
        {/* Mobile Bottom Navigation Spacer */}
        <div className="h-20 md:hidden"></div>
      </div>
    </div>
  );
};

export default TenantDetailPage;