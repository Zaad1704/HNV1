import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const fetchAllRequests = async () => {
    // This new backend endpoint needs to be created
    const { data } = await apiClient.get('/super-admin/all-maintenance-requests');
    return data.data;
};

const AdminMaintenancePage = () => {
    const { data: requests = [], isLoading } = useQuery(['allMaintenanceRequests'], fetchAllRequests);

    if (isLoading) return <div className="text-center p-8">Loading all maintenance requests...</div>;

    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Platform-Wide Maintenance Requests</h1>
            <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-border-color">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Organization</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Issue</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {requests.map((req: any) => (
                            <tr key={req._id}>
                                <td className="p-4 font-semibold">{req.organizationId?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text">{req.propertyId?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text">{req.description}</td>
                                <td className="p-4 text-light-text">{req.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMaintenancePage;
