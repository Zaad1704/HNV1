import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ChevronLeft, User, Mail, Phone, Home, FileText, Download, Edit, Trash2 } from 'lucide-react';

// Fetch a single tenant by their ID
const fetchTenantDetails = async (tenantId: string) => {
    const { data } = await apiClient.get(`/tenants/${tenantId}`);
    return data.data;
};

const TenantProfilePage = () => {
    const { tenantId } = useParams<{ tenantId: string }>();

    const { data: tenant, isLoading, isError } = useQuery({
        queryKey: ['tenantDetails', tenantId],
        queryFn: () => fetchTenantDetails(tenantId!),
        enabled: !!tenantId, // Only fetch if tenantId is present
    });

    const handleDownloadPdf = async () => {
        try {
            const response = await apiClient.get(`/reports/tenant-profile/${tenantId}/pdf`, {
                responseType: 'blob', // Important for handling file downloads
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Tenant-Profile-${tenant.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            alert('Failed to download PDF.');
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Tenant Profile...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error loading tenant details.</div>;

    return (
        <div className="text-dark-text">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard/tenants" className="text-light-text hover:text-brand-primary" title="Back to Tenants List">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold">Tenant Profile</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-light-card border rounded-lg hover:bg-gray-100"><Download size={16} /> Download PDF</button>
                    {/* Add Edit/Delete buttons later */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Main Info & Photo */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-light-card p-6 rounded-xl border border-border-color text-center">
                        <img src={tenant.imageUrl || `https://placehold.co/128x128/EBF4FF/7091E6?text=${tenant.name.charAt(0)}`} alt={tenant.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white object-cover shadow-md" />
                        <h2 className="text-2xl font-bold">{tenant.name}</h2>
                        <p className="text-light-text">{tenant.propertyId?.name}, Unit {tenant.unit}</p>
                    </div>
                    <div className="bg-light-card p-6 rounded-xl border border-border-color">
                        <h3 className="font-bold mb-4 text-lg">Contact Info</h3>
                        <p className="flex items-center gap-2 mb-2"><Mail size={16} className="text-light-text"/> {tenant.email}</p>
                        <p className="flex items-center gap-2"><Phone size={16} className="text-light-text"/> {tenant.phone || 'N/A'}</p>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="md:col-span-2 bg-light-card p-6 rounded-xl border border-border-color">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-light-text">Father's Name</h4>
                            <p>{tenant.fatherName || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-light-text">Mother's Name</h4>
                            <p>{tenant.motherName || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-light-text">Permanent Address</h4>
                            <p>{tenant.permanentAddress || 'N/A'}</p>
                        </div>
                        <hr className="my-4"/>
                        <div>
                            <h4 className="font-semibold text-light-text">Government ID Number</h4>
                            <p>{tenant.govtIdNumber || 'N/A'}</p>
                        </div>
                        <div className="flex gap-4">
                            {tenant.govtIdImageUrlFront && <div><h4 className="font-semibold text-light-text mb-1">ID Front</h4><img src={tenant.govtIdImageUrlFront} className="h-24 rounded-md border"/></div>}
                            {tenant.govtIdImageUrlBack && <div><h4 className="font-semibold text-light-text mb-1">ID Back</h4><img src={tenant.govtIdImageUrlBack} className="h-24 rounded-md border"/></div>}
                        </div>
                        <hr className="my-4"/>
                        <div>
                            <h3 className="font-bold text-lg mb-2">Reference</h3>
                            <p><strong className="text-light-text">Name:</strong> {tenant.reference?.name || 'N/A'}</p>
                            <p><strong className="text-light-text">Phone:</strong> {tenant.reference?.phone || 'N/A'}</p>
                            <p><strong className="text-light-text">ID Number:</strong> {tenant.reference?.idNumber || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantProfilePage;
