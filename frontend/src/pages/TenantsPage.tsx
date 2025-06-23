import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AddTenantModal from '../components/common/AddTenantModal';
import EditTenantModal from '../components/common/EditTenantModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Edit, Trash2, Search, Download } from 'lucide-react';

// Define the shape of a Tenant object for type safety
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

// Data fetching functions for React Query
const fetchTenants = async (): Promise<ITenant[]> => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const TenantsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State management for modals and filters
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<ITenant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');

    // Queries to fetch data from the backend
    const { data: tenants = [], isLoading, isError } = useQuery({ queryKey: ['tenants'], queryFn: fetchTenants });
    const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });

    // Mutation for deleting a tenant
    const deleteMutation = useMutation({
        mutationFn: (tenantId: string) => apiClient.delete(`/tenants/${tenantId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            alert('Tenant deleted successfully!');
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

    const handleEditClick = (tenant: ITenant) => {
        setSelectedTenant(tenant);
        setIsEditModalOpen(true);
    };

    // Handler for the CSV export button
    const handleExport = async () => {
        try {
            const response = await apiClient.get('/reports/tenants/export', {
                params: { propertyId: selectedPropertyFilter === 'all' ? '' : selectedPropertyFilter },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tenants-export-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Failed to export tenants:", error);
            alert("Could not export tenants.");
        }
    };
    
    // Memoized filtering logic
    const filteredTenants = useMemo(() => {
        return tenants.filter(tenant => {
            const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  tenant.unit.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProperty = selectedPropertyFilter === 'all' || tenant.propertyId?._id === selectedPropertyFilter;
            return matchesSearch && matchesProperty;
        });
    }, [searchTerm, tenants, selectedPropertyFilter]);

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Active': 'bg-green-100 text-green-800',
            'Inactive': 'bg-gray-100 text-gray-800',
            'Late': 'bg-amber-100 text-amber-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };
  
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
                                    <button onClick={() => navigate(`/dashboard/tenants/${tenant._id}/profile`)} className="p-2 hover:bg-gray-100 rounded-md" title="View Profile"><Eye size={16}/></button>
                                    <button onClick={() => handleEditClick(tenant)} className="p-2 hover:bg-gray-100 rounded-md" title="Edit Tenant"><Edit size={16}/></button>
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
            {/* Render modals for adding and editing tenants */}
            <AddTenantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            {selectedTenant && <EditTenantModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} tenant={selectedTenant} onTenantUpdated={() => queryClient.invalidateQueries({ queryKey: ['tenants'] })} />}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-text">Manage Tenants</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"><Download size={18} /><span>Export CSV</span></button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary text-white font-bold rounded-lg"><Plus size={18} /><span>Add Tenant</span></button>
                </div>
            </div>

            {/* Search and Filter UI */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text" size={20} />
                    <input type="text" placeholder="Search by name, email, or unit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-light-card border border-border-color rounded-lg" />
                </div>
                <div className="flex-shrink-0">
                    <select
                        value={selectedPropertyFilter}
                        onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                        className="w-full sm:w-64 h-full px-4 py-3 bg-light-card border border-border-color rounded-lg text-dark-text"
                    >
                        <option value="all">All Properties</option>
                        {properties.map(prop => (
                            <option key={prop._id} value={prop._id}>{prop.name}</option>
                        ))}
                    </select>
                </div>
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
