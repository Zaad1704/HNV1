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

    const mutation = useMutation(updateRequestStatus, {
        onSuccess: () => {
            queryClient.invalidateQueries(['maintenanceRequests']);
        },
    });

    const handleStatusChange = (id: string, newStatus: string) => {
        mutation.mutate({ id, status: newStatus });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            Open: 'bg-blue-500/20 text-blue-300',
            'In Progress': 'bg-amber-500/20 text-amber-300',
            Resolved: 'bg-green-500/20 text-green-300',
            Closed: 'bg-slate-600/50 text-slate-400'
        };
        return statusMap[status] || 'bg-gray-500/20 text-gray-300';
    };

    if (isLoading) return <div className="text-white text-center p-8">Loading requests...</div>;

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Maintenance Requests</h1>
            <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Date</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Tenant</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Property</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Issue</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {requests.map((req: any) => (
                                <tr key={req._id}>
                                    <td className="p-4 text-slate-300">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-white">{req.tenantId?.name || 'N/A'}</td>
                                    <td className="p-4 text-slate-300">{req.propertyId?.name || 'N/A'}</td>
                                    <td className="p-4 text-slate-300">{req.description}</td>
                                    <td className="p-4">
                                        <select 
                                            value={req.status} 
                                            onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                            className={`border-0 rounded-md text-xs font-semibold ${getStatusBadge(req.status)}`}
                                            style={{ backgroundColor: 'transparent' }}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceRequestsPage;
