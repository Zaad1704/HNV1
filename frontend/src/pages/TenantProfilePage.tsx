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

    if (isLoading) return <div className="p-8 text-center text-dark-text dark:text-dark-text-dark">Loading Tenant Profile...</div>;
    if (isError) return <div className="p-8 text-center text-red-500 dark:text-red-500">Error loading tenant details.</div>;

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
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
                    <Link to="/dashboard/tenants" className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors duration-150" title="Back to Tenants List">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold">Tenant Profile</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* The "Edit" button now opens the modal */}
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-dark-card border border-border-color dark:border-border-color-dark rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg/40 font-semibold text-dark-text dark:text-dark-text-dark transition-colors"><Edit size={16} /> Edit Profile</button>
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-dark-card border border-border-color dark:border-border-color-dark rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg/40 text-dark-text dark:text-dark-text-dark transition-colors"><Download size={16} /> Download PDF</button>
                    <button onClick={handleDeleteClick} disabled={deleteMutation.isLoading} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"><Trash2 size={16}/> Delete</button>
                </div>
            </div>

            {/* The rest of the tenant profile page remains the same */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-border-color dark:border-border-color-dark shadow-sm transition-all duration-200">
                        <h2 className="text-2xl font-bold mb-4">{tenant?.name}</h2>
                        <p className="flex items-center gap-2 text-light-text dark:text-light-text-dark"><Mail size={16} className="text-brand-primary dark:text-brand-secondary"/> {tenant?.email}</p>
                        <p className="flex items-center gap-2 text-light-text dark:text-light-text-dark"><Phone size={16} className="text-brand-primary dark:text-brand-secondary"/> {tenant?.phone}</p>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-border-color dark:border-border-color-dark shadow-sm transition-all duration-200">
                        <h3 className="text-xl font-bold mb-4">Lease Information</h3>
                        <p className="flex items-center gap-2 text-light-text dark:text-light-text-dark"><Home size={16} className="text-brand-primary dark:text-brand-secondary"/> Property: {tenant?.propertyId?.name}</p>
                        <p className="flex items-center gap-2 text-light-text dark:text-light-text-dark"><FileText size={16} className="text-brand-primary dark:text-brand-secondary"/> Lease End Date: {tenant?.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantProfilePage;
