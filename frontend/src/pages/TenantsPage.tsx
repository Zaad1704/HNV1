import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import AddTenantModal from '../components/common/AddTenantModal';

// Placeholder Icons
const AddIcon = () => <span>+</span>;

const TenantsPage = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.get('/tenants');
        setTenants(response.data.data);
      } catch (err) {
        setError('Failed to fetch tenants.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleTenantAdded = (newTenant: any) => {
    // A more robust implementation might refetch or find the property name.
    // For now, we add the new tenant, and the page will show 'N/A' for the property until refresh.
    setTenants(prevTenants => [...prevTenants, newTenant]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-teal-400/20 text-teal-300';
      case 'Late': return 'bg-amber-400/20 text-amber-300';
      case 'Inactive': return 'bg-slate-600/50 text-slate-400';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };
  
  if (loading) return <div className="text-white text-center p-8">Loading tenants...</div>;
  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="text-white">
      <AddTenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTenantAdded={handleTenantAdded}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Manage Tenants</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg shadow-lg hover:shadow-yellow-400/50 transition-all transform hover:scale-105"
        >
          <AddIcon />
          <span>Add Tenant</span>
        </button>
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
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tenants.length > 0 ? (
                tenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-slate-800 transition-colors">
                    <td className="p-4 font-bold text-white">{tenant.name}</td>
                    <td className="p-4 text-slate-300">{tenant.propertyId?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-300">{tenant.unit}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="font-medium text-yellow-400 hover:text-yellow-300">View Details</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    You haven't added any tenants yet. Click "Add Tenant" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantsPage;
