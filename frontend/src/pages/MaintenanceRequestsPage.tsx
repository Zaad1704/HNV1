// frontend/src/pages/MaintenanceRequestsPage.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useWindowSize } from '../hooks/useWindowSize';
import { Wrench, Calendar, Home, AlertCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const fetchRequests = async () => {
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
    const { width } = useWindowSize();

    const mutation = useMutation({
        mutationFn: updateRequestStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
        },
        onError: (err: any) => {
            alert(`Failed to update request status: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleStatusChange = (id: string, newStatus: string) => {
        mutation.mutate({ id, status: newStatus });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Open': 'bg-brand-primary/20 text-brand-primary',
            'In Progress': 'bg-yellow-500/20 text-yellow-300',
            'Completed': 'bg-green-500/20 text-green-300',
            'Closed': 'bg-gray-500/20 text-gray-300'
        };
        return statusMap[status] || 'bg-gray-500/20 text-gray-300';
    };
    
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading requests...</div>;
    if (isError) return <div className="text-center p-8 text-red-400 dark:text-red-400">Failed to fetch maintenance requests.</div>;

    const DesktopView = () => (
        <div className="bg-light-card rounded-3xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg/50 border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Date</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Tenant</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Issue</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                        {requests.length > 0 ? (
                            requests.map((req: any) => (
                            <tr key={req._id} className="hover:bg-light-bg/50 transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                <td className="p-4 text-light-text dark:text-light-text-dark">{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">{req.requestedBy?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.propertyId?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.description}</td>
                                <td className="p-4">
                                    <select 
                                        value={req.status} 
                                        onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                        className={`border-0 rounded-md py-1 px-2 text-xs font-semibold ${getStatusBadge(req.status)} bg-light-bg dark:bg-dark-card dark:text-dark-text-dark`}
                                        style={{ appearance: 'none' }}
                                        disabled={mutation.isLoading}
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
                                <td colSpan={5} className="p-8 text-center text-light-text dark:text-light-text-dark">No maintenance requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const MobileView = () => (
        <div className="grid grid-cols-1 gap-4">
            {requests.map((req: any, index: number) => (
                <motion.div 
                    key={req._id} 
                    className="bg-light-card p-4 rounded-3xl border border-border-color shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-dark-text text-lg flex items-center gap-2 dark:text-dark-text-dark"><Wrench size={18}/> {req.description}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                            {req.status}
                        </span>
                    </div>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-1 dark:text-light-text-dark"><Home size={14}/> Property: {req.propertyId?.name || 'N/A'}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2 dark:text-light-text-dark"><Calendar size={14}/> Date: {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2 dark:text-light-text-dark"><Users size={14}/> Requested By: {req.requestedBy?.name || 'N/A'}</p>
                    
                    <div className="mt-3">
                        <label htmlFor={`status-${req._id}`} className="block text-sm font-medium text-light-text mb-1 dark:text-light-text-dark">Update Status:</label>
                        <select 
                            id={`status-${req._id}`}
                            value={req.status} 
                            onChange={(e) => handleStatusChange(req._id, e.target.value)}
                            className={`block w-full border border-border-color rounded-md py-2 px-3 text-dark-text bg-light-bg focus:ring-brand-primary focus:border-brand-primary dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark`}
                            disabled={mutation.isLoading}
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </motion.div>
            ))}
        </div>
    );


    return (
        <motion.div 
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
            className="text-dark-text dark:text-dark-text-dark"
        >
            <h1 className="text-3xl font-bold mb-8">Maintenance Requests</h1>
            {requests.length > 0 ? (
                width < 768 ? <MobileView /> : <DesktopView />
            ) : (
                <div className="text-center py-16 bg-light-card rounded-3xl border border-dashed border-border-color dark:bg-dark-card dark:border-border-color-dark">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark">No Maintenance Requests Found</h3>
                    <p className="text-light-text mt-2 mb-4 dark:text-light-text-dark">You can submit requests from your tenant portal or properties page.</p>
                </div>
            )}
        </motion.div>
    );
};

export default MaintenanceRequestsPage;
