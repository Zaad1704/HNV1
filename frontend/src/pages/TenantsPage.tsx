import React, { useState, useMemo } from 'react';
import apiClient from '../api/client';
import AddTenantModal from '../components/common/AddTenantModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ClipboardList, Edit, Eye, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ITenant {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    unit: string;
    status: 'Active' | 'Inactive' | 'Late';
    propertyId?: { _id: string; name: string; };
    organizationId: string;
    leaseEndDate?: string;
    rentAmount?: number;
    discountAmount?: number;
    discountExpiresAt?: string;
}

const fetchTenants = async () => { /* ... (no change) ... */ };

// --- Edit Tenant Modal Component (with Status field) ---
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
        status: tenant.status || 'Active', // ADDED STATUS
        leaseEndDate: tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toISOString().split('T')[0] : '',
        rentAmount: tenant.rentAmount || 0,
        discountAmount: tenant.discountAmount || 0,
        discountExpiresAt: tenant.discountExpiresAt ? new Date(tenant.discountExpiresAt).toISOString().split('T')[0] : '',
    });
    const [error, setError] = useState('');
    const { data: properties, isLoading: isLoadingProperties } = useQuery(['propertiesForTenantModal'], () => apiClient.get('/properties').then(res => res.data.data), { enabled: isOpen });

    const mutation = useMutation({
        mutationFn: (updatedTenantData: Partial<ITenant>) => apiClient.put(`/tenants/${tenant._id}`, updatedTenantData),
        onSuccess: () => { onTenantUpdated(); onClose(); },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to update tenant.')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ ...formData, rentAmount: Number(formData.rentAmount), discountAmount: Number(formData.discountAmount) });
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
                    <div><label>Full Name</label><input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 w-full bg-light-bg p-2 rounded-md"/></div>
                    <div><label>Email</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full bg-light-bg p-2 rounded-md"/></div>
                    {/* --- ADDED STATUS DROPDOWN --- */}
                    <div>
                        <label className="block text-sm font-medium text-light-text">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full bg-light-bg border-border-color p-2 rounded-md">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive (Archive)</option>
                            <option value="Late">Late</option>
                        </select>
                    </div>
                    {/* Other fields... */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-orange text-white rounded-lg">{mutation.isLoading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main TenantsPage Component ---
const TenantsPage = () => {
    const navigate = useNavigate();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<ITenant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();
    const { data: tenants = [], isLoading, isError } = useQuery({ queryKey: ['tenants'], queryFn: fetchTenants });

    const handleDownloadCollectionSheet = async () => { /* ... (no change) ... */ };

    // --- NEW: Mutation for deleting a tenant ---
    const deleteMutation = useMutation({
        mutationFn: (tenantId: string) => apiClient.delete(`/tenants/${tenantId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || "Failed to delete tenant.");
        }
    });

    const handleDeleteClick = (tenantId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this tenant? This action cannot be undone.")) {
            deleteMutation.mutate(tenantId);
        }
    };

    // --- NEW: Search/filter logic ---
    const filteredTenants = useMemo(() => {
        if (!searchTerm) return tenants;
        return tenants.filter(tenant =>
            tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.unit.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, tenants]);

    const getStatusBadge = (status: string) => { /* ... (no change) ... */ };
  
    const DesktopView = () => (
        <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-border-color">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Tenant</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Property / Unit</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {filteredTenants.map((tenant: ITenant) => (
                            <tr key={tenant._id} className="hover:bg-gray-50">
                                <td className="p-4"><p className="font-semibold text-dark-text">{tenant.name}</p><p className="text-xs text-light-text">{tenant.email}</p></td>
                                <td className="p-4 text-light-text">{tenant.propertyId?.name || 'N/A'} - Unit {tenant.unit}</td>
                                <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>{tenant.status}</span></td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <button onClick={() => navigate(`/dashboard/tenants/${tenant._id}/statement`)} className="p-2 hover:bg-gray-100 rounded-md" title="View Statement"><Eye size={16}/></button>
                                    <button onClick={() => { setSelectedTenant(tenant); setIsEditModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-md" title="Edit Tenant"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteClick(tenant._id)} disabled={deleteMutation.isLoading} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Delete Tenant"><Trash2 size={16}/></button>
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
            {selectedTenant && <EditTenantModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} tenant={selectedTenant} onTenantUpdated={() => queryClient.invalidateQueries({ queryKey: ['tenants'] })} />}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-text">Manage Tenants</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleDownloadCollectionSheet} className="flex items-center space-x-2 px-4 py-2.5 bg-light-card border rounded-lg"><ClipboardList size={18} /><span>Collection Sheet</span></button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary text-white font-bold rounded-lg"><Plus size={18} /><span>Add Tenant</span></button>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text" size={20} />
                <input type="text" placeholder="Search by name, email, or unit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-light-card border border-border-color rounded-lg" />
            </div>
      
            {filteredTenants.length > 0 ? <DesktopView /> : (
                <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                    <h3 className="text-xl font-semibold text-dark-text">No Tenants Found</h3>
                    <p className="text-light-text mt-2 mb-4">{searchTerm ? `No results for "${searchTerm}".` : "Get started by adding your first tenant."}</p>
                </div>
            )}
        </div>
    );
};

export default TenantsPage;
