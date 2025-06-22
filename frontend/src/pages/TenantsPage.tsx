import React, { useState } from 'react';
import apiClient from '../api/client';
import AddTenantModal from '../components/common/AddTenantModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileDown, ClipboardList, Edit, Eye } from 'lucide-react'; // Added Eye icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Define interface for tenant data, including new discount fields
export interface ITenant {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    unit: string;
    status: 'Active' | 'Inactive' | 'Late';
    propertyId?: {
        _id: string;
        name: string;
    };
    organizationId: string;
    leaseEndDate?: string;
    rentAmount?: number;
    discountAmount?: number;
    discountExpiresAt?: string;
}

const fetchTenants = async () => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

// --- New Edit Tenant Modal Component (Defined Inline) ---
interface EditTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: ITenant;
    onTenantUpdated: () => void;
}

const EditTenantModal: React.FC<EditTenantModalProps> = ({ isOpen, onClose, tenant, onTenantUpdated }) => {
    const [formData, setFormData] = useState({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        propertyId: tenant.propertyId?._id || '',
        unit: tenant.unit || '',
        leaseEndDate: tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toISOString().split('T')[0] : '',
        rentAmount: tenant.rentAmount || 0,
        discountAmount: tenant.discountAmount || 0,
        discountExpiresAt: tenant.discountExpiresAt ? new Date(tenant.discountExpiresAt).toISOString().split('T')[0] : '',
    });
    const [error, setError] = useState('');

    const { data: properties, isLoading: isLoadingProperties } = useQuery(['propertiesForTenantModal'], () => apiClient.get('/properties').then(res => res.data.data), { enabled: isOpen });

    const mutation = useMutation({
        mutationFn: (updatedTenantData: Partial<ITenant>) => apiClient.put(`/tenants/${tenant._id}`, updatedTenantData),
        onSuccess: () => {
            onTenantUpdated();
            onClose();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to update tenant.')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const dataToSubmit = {
            ...formData,
            rentAmount: Number(formData.rentAmount),
            discountAmount: Number(formData.discountAmount),
            leaseEndDate: formData.leaseEndDate || undefined,
            discountExpiresAt: formData.discountExpiresAt || undefined,
        };
        mutation.mutate(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card rounded-xl shadow-xl w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-dark-text">Edit Tenant: {tenant.name}</h2>
                    <button onClick={onClose} className="text-light-text hover:text-dark-text text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">{error}</div>}

                    {/* Basic Tenant Info */}
                    <div><label className="block text-sm font-medium text-light-text">Full Name</label><input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                    <div><label className="block text-sm font-medium text-light-text">Email</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                    <div><label className="block text-sm font-medium text-light-text">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>

                    {/* Lease & Property Info */}
                    <div><label className="block text-sm font-medium text-light-text">Property</label><select name="propertyId" required value={formData.propertyId} onChange={handleChange} disabled={isLoadingProperties} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"><option value="">{isLoadingProperties ? 'Loading...' : 'Select'}</option>{properties?.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-light-text">Unit</label><input type="text" name="unit" required value={formData.unit} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                    <div><label className="block text-sm font-medium text-light-text">Monthly Rent</label><input type="number" name="rentAmount" required value={formData.rentAmount} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                    <div><label className="block text-sm font-medium text-light-text">Lease End Date</label><input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/></div>
                    
                    {/* NEW: Discount Fields */}
                    <h3 className="text-lg font-semibold text-dark-text border-b border-border-color pb-2 mt-4">Discount Settings</h3>
                    <div>
                        <label className="block text-sm font-medium text-light-text">Discount Amount ($)</label>
                        <input type="number" name="discountAmount" value={formData.discountAmount} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text">Discount Expires At</label>
                        <input type="date" name="discountExpiresAt" value={formData.discountExpiresAt} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md"/>
                        <p className="text-xs text-light-text mt-1">Leave blank for no expiry. Set to 0 discount to remove.</p>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-dark-text font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-orange text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
                            {mutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main TenantsPage Component ---
const TenantsPage = () => {
  const navigate = useNavigate(); // Initialize navigate hook

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<ITenant | null>(null);

  const queryClient = useQueryClient();
  const { data: tenants = [], isLoading, isError } = useQuery({ queryKey: ['tenants'], queryFn: fetchTenants });

  const handleDownloadCollectionSheet = () => {
    const sheetUrl = `${import.meta.env.VITE_API_URL || ''}/api/reports/monthly-collection-sheet`;
    const token = localStorage.getItem('token');
    window.open(`${sheetUrl}?token=${token}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-amber-100 text-amber-800';
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
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Rent / Discount</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {tenants.map((tenant: ITenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-dark-text">{tenant.name}</td>
                    <td className="p-4 text-light-text">{tenant.propertyId?.name || 'N/A'}</td>
                    <td className="p-4 text-light-text">{tenant.unit}</td>
                    <td className="p-4 text-light-text">
                        ${tenant.rentAmount?.toFixed(2) || '0.00'}
                        {tenant.discountAmount && tenant.discountAmount > 0 && (
                            <span className="text-sm text-red-500 block">
                                -${tenant.discountAmount.toFixed(2)} (until {tenant.discountExpiresAt ? new Date(tenant.discountExpiresAt).toLocaleDateString() : 'N/A'})
                            </span>
                        )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2"> {/* Added flex for action buttons */}
                      <button
                         onClick={() => { setSelectedTenant(tenant); setIsEditModalOpen(true); }}
                         className="font-medium text-brand-primary hover:underline flex items-center gap-1"
                         title="Edit Tenant Details"
                      >
                         <Edit size={16}/>
                         Edit
                      </button>
                      {/* NEW: View Statement Button */}
                      <button
                         onClick={() => navigate(`/dashboard/tenants/${tenant._id}/statement`)}
                         className="font-medium text-blue-500 hover:underline flex items-center gap-1"
                         title="View Monthly Statement"
                      >
                         <Eye size={16}/>
                         Statement
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
  );
  
  if (isLoading) return <div className="text-center p-8">Loading tenants...</div>;
  if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch tenants.</div>;

  return (
    <div>
      <AddTenantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {selectedTenant && (
        <EditTenantModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          tenant={selectedTenant}
          onTenantUpdated={() => queryClient.invalidateQueries({ queryKey: ['tenants'] })}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Tenants</h1>
        <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCollectionSheet}
              className="flex items-center space-x-2 px-4 py-2.5 bg-light-card border border-border-color text-dark-text font-semibold rounded-lg hover:bg-gray-50"
            >
              <ClipboardList size={18} />
              <span>Collection Sheet</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg shadow-md transition-colors"
            >
              <Plus size={18} />
              <span>Add Tenant</span>
            </button>
        </div>
      </div>
      
       {tenants.length > 0 ? <DesktopView /> : (
            <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                <h3 className="text-xl font-semibold text-dark-text">No Tenants Found</h3>
                <p className="text-light-text mt-2 mb-4">Get started by adding your first tenant.</p>
            </div>
       )}
    </div>
  );
};

export default TenantsPage;
