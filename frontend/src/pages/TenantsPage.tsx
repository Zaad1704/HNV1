import React, { useState } from 'react';
import apiClient from '../api/client';
import AddTenantModal from '../components/common/AddTenantModal';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileDown, ClipboardList } from 'lucide-react';

const fetchTenants = async () => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

const TenantsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tenants = [], isLoading, isError } = useQuery(['tenants'], fetchTenants);

  const handleGenerateInvoice = (tenantId: string) => {
    const token = localStorage.getItem('token');
    const invoiceUrl = `${import.meta.env.VITE_API_URL || ''}/api/invoices/rent/${tenantId}?token=${token}`;
    window.open(invoiceUrl, '_blank');
  };
  
  const handleDownloadCollectionSheet = () => {
    const sheetUrl = `${import.meta.env.VITE_API_URL || ''}/api/reports/monthly-collection-sheet`;
    window.open(sheetUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const DesktopView = () => (
     <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border-color">
              <tr>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Tenant Name</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Property</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Unit</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {tenants.map((tenant: any) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-dark-text">{tenant.name}</td>
                    <td className="p-4 text-light-text">{tenant.propertyId?.name || 'N/A'}</td>
                    <td className="p-4 text-light-text">{tenant.unit}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleGenerateInvoice(tenant._id)}
                        className="font-medium text-brand-orange hover:opacity-80 flex items-center gap-1 ml-auto"
                      >
                         <FileDown size={16}/>
                         Invoice
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
  );
  
  const MobileView = () => (
    <div className="space-y-4">
        {tenants.map((tenant: any) => (
            <div key={tenant._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-dark-text">{tenant.name}</h3>
                        <p className="text-sm text-light-text mt-1">{tenant.propertyId?.name || 'N/A'}, Unit {tenant.unit}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>{tenant.status}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border-color text-right">
                     <button onClick={() => handleGenerateInvoice(tenant._id)} className="font-semibold text-sm bg-brand-orange/10 text-brand-orange py-1.5 px-4 rounded-lg">
                        Generate Invoice
                    </button>
                </div>
            </div>
        ))}
    </div>
  );

  if (isLoading) return <div className="text-center p-8">Loading tenants...</div>;
  if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch tenants.</div>;

  return (
    <div>
      <AddTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTenantAdded={() => {}}/>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Tenants</h1>
        <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCollectionSheet}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-border-color text-dark-text font-semibold rounded-lg hover:bg-gray-50"
            >
              <ClipboardList size={18} />
              <span>Collection Sheet</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-orange hover:opacity-90 text-white font-bold rounded-lg shadow-sm"
            >
              <Plus size={18} />
              <span>Add Tenant</span>
            </button>
        </div>
      </div>
      
      <div className="hidden md:block"><DesktopView /></div>
      <div className="block md:hidden"><MobileView /></div>
    </div>
  );
};

export default TenantsPage;
