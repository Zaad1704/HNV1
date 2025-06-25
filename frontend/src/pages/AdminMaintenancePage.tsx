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

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading all maintenance requests...</div>;

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
            <h1 className="text-3xl font-bold mb-8">Platform-Wide Maintenance Requests</h1>
            <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
                <table className="w-full text-left">
                    <thead className="bg-light-bg border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Organization</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Issue</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                        {requests.map((req: any) => (
                            <tr key={req._id} className="hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">{req.organizationId?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.propertyId?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.description}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMaintenancePage;
