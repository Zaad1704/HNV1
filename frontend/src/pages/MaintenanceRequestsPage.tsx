import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

const fetchRequests = async () => {
    const { data } = await apiClient.get('/maintenance-requests');
    return data.data;
};

const updateRequestStatus = async ({ id, status }: { id: string, status: string }) => {
    const { data } = await apiClient.put(`/maintenance-requests/${id}`, { status });
    return data.data;
};

const MaintenanceRequestsPage = () => {
    const queryClient = useQueryClient();
    const { data: requests = [], isLoading } = useQuery(['maintenanceRequests'], fetchRequests);

    const mutation = useMutation({
        mutationFn: updateRequestStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
        },
    });

    const handleStatusChange = (id: string, newStatus: string) => {
        mutation.mutate({ id, status: newStatus });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Open': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-amber-100 text-amber-800',
            'Resolved': 'bg-green-100 text-green-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) return <div className="text-center p-8">Loading requests...</div>;

    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Maintenance Requests</h1>
            <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-border-color">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Date</th>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Tenant</th>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Property</th>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Issue</th>
                                <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {requests.length > 0 ? (
                                requests.map((req: any) => (
                                <tr key={req._id} className="hover:bg-gray-50">
                                    <td className="p-4 text-light-text">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 font-semibold text-dark-text">{req.requestedBy?.name || 'N/A'}</td>
                                    <td className="p-4 text-light-text">{req.propertyId?.name || 'N/A'}</td>
                                    <td className="p-4 text-light-text">{req.description}</td>
                                    <td className="p-4">
                                        <select 
                                            value={req.status} 
                                            onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                            className={`border-0 rounded-md py-1 px-2 text-xs font-semibold ${getStatusBadge(req.status)}`}
                                            style={{ appearance: 'none' }}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-light-text">No maintenance requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceRequestsPage;
