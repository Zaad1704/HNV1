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

  const getStatusBadge = (status: string) => { /* ... (existing function) ... */ };
  
  if (isLoading) return <div className="text-white text-center p-8">Loading tenants...</div>;
  if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch tenants.</div>;

  return (
    <div className="text-white">
      <AddTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTenantAdded={() => {}}/>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Manage Tenants</h1>
        <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCollectionSheet}
              className="flex items-center space-x-2 px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg"
            >
              <ClipboardList size={20} />
              <span>Collection Sheet</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg"
            >
              <Plus size={20} />
              <span>Add Tenant</span>
            </button>
        </div>
      </div>

      <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Tenant Name</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Property</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Unit</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tenants.map((tenant: any) => (
                  <tr key={tenant._id} className="hover:bg-slate-800">
                    <td className="p-4 font-bold text-white">{tenant.name}</td>
                    <td className="p-4 text-slate-300">{tenant.propertyId?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-300">{tenant.unit}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleGenerateInvoice(tenant._id)}
                        className="font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 ml-auto"
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
    </div>
  );
};

export default TenantsPage;
