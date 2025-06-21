import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useWindowSize } from '../hooks/useWindowSize'; // FIX: Import useWindowSize
import { Wrench, Calendar, Home, AlertCircle } from 'lucide-react'; // FIX: Added icons for mobile view

const fetchRequests = async () => {
    // FIX: Corrected endpoint, assuming /api/maintenance will return org-specific requests
    const { data } = await apiClient.get('/maintenance'); 
    return data.data;
};

const updateRequestStatus = async ({ id, status }: { id: string, status: string }) => {
    const { data } = await apiClient.put(`/maintenance/${id}`, { status });
    return data.data;
};

const MaintenanceRequestsPage = () => {
    const queryClient = useQueryClient();
    const { data: requests = [], isLoading, isError } = useQuery(['maintenanceRequests'], fetchRequests);
    const { width } = useWindowSize(); // FIX: Get window width

    const mutation = useMutation({
        mutationFn: updateRequestStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
        },
        onError: (err: any) => { // FIX: Add error handling for mutation
            alert(`Failed to update request status: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleStatusChange = (id: string, newStatus: string) => {
        mutation.mutate({ id, status: newStatus });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Open': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-amber-100 text-amber-800',
            'Completed': 'bg-green-100 text-green-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) return <div className="text-center p-8">Loading requests...</div>;
    if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch maintenance requests.</div>;

    // FIX: Desktop Table View
    const DesktopView = () => (
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
                                        disabled={mutation.isLoading} // Disable while updating
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
    );

    // FIX: Mobile Card View for Maintenance Requests
    const MobileView = () => (
        <div className="grid grid-cols-1 gap-4">
            {requests.map((req: any) => (
                <div key={req._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-dark-text text-lg flex items-center gap-2"><Wrench size={18}/> {req.description}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                            {req.status}
                        </span>
                    </div>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-1"><Home size={14}/> Property: {req.propertyId?.name || 'N/A'}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2"><Calendar size={14}/> Date: {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2"><Users size={14}/> Requested By: {req.requestedBy?.name || 'N/A'}</p>
                    
                    <div className="mt-3">
                        <label htmlFor={`status-${req._id}`} className="block text-sm font-medium text-light-text mb-1">Update Status:</label>
                        <select 
                            id={`status-${req._id}`}
                            value={req.status} 
                            onChange={(e) => handleStatusChange(req._id, e.target.value)}
                            className={`block w-full border border-border-color rounded-md py-2 px-3 text-dark-text bg-light-bg focus:ring-brand-primary focus:border-brand-primary`}
                            disabled={mutation.isLoading}
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );


    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Maintenance Requests</h1>
            {requests.length > 0 ? (
                // FIX: Conditionally render DesktopView or MobileView based on screen width
                width < 768 ? <MobileView /> : <DesktopView />
            ) : (
                <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                    <h3 className="text-xl font-semibold text-dark-text">No Maintenance Requests Found</h3>
                    <p className="text-light-text mt-2 mb-4">You can submit requests from your tenant portal or properties page.</p>
                </div>
            )}
        </div>
    );
};

export default MaintenanceRequestsPage;
