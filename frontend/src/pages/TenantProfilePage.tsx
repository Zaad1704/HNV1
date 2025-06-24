import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ChevronLeft, User, Mail, Phone, Home, FileText, Download, Edit, Trash2 } from 'lucide-react';
import EditTenantModal from '../components/common/EditTenantModal'; // Import the new modal

const fetchTenantDetails = async (tenantId: string) => {
    const { data } = await apiClient.get(`/tenants/${tenantId}`);
    return data.data;
};

const TenantProfilePage = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // State to manage the Edit Modal's visibility
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: tenant, isLoading, isError } = useQuery({
        queryKey: ['tenantDetails', tenantId],
        queryFn: () => fetchTenantDetails(tenantId!),
        enabled: !!tenantId,
    });
    
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/tenants/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            navigate('/dashboard/tenants');
        }
    });

    const handleDeleteClick = () => {
        if (window.confirm('Are you sure you want to delete this tenant?')) {
            deleteMutation.mutate(tenantId!);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await apiClient.get(`/reports/tenants/export?tenantId=${tenantId}&format=pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tenant-${tenantId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Failed to download tenant PDF:", error);
            alert("Could not download tenant PDF.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Tenant Profile...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error loading tenant details.</div>;

    return (
        <div className="text-dark-text">
            {/* Render the Edit modal and pass the current tenant's data to it */}
            <EditTenantModal 
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              tenant={tenant}
              onTenantUpdated={() => {
                // When the modal confirms an update, refetch the data for this page
                queryClient.invalidateQueries({ queryKey: ['tenantDetails', tenantId] });
              }}
            />
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard/tenants" className="text-light-text hover:text-brand-primary" title="Back to Tenants List">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold">Tenant Profile</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* The "Edit" button now opens the modal */}
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-light-card border rounded-lg hover:bg-gray-100 font-semibold"><Edit size={16} /> Edit Profile</button>
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-light-card border rounded-lg hover:bg-gray-100"><Download size={16} /> Download PDF</button>
                    <button onClick={handleDeleteClick} disabled={deleteMutation.isLoading} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"><Trash2 size={16}/> Delete</button>
                </div>
            </div>

            {/* The rest of the tenant profile page remains the same */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">{tenant?.name}</h2>
                        <p className="flex items-center gap-2"><Mail size={16} /> {tenant?.email}</p>
                        <p className="flex items-center gap-2"><Phone size={16} /> {tenant?.phone}</p>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Lease Information</h3>
                        <p className="flex items-center gap-2"><Home size={16} /> Property: {tenant?.propertyId?.name}</p>
                        <p className="flex items-center gap-2"><FileText size={16} /> Lease End Date: {tenant?.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantProfilePage;
