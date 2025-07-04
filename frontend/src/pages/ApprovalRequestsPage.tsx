import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Check, X, FileWarning } from 'lucide-react';
import { motion } from 'framer-motion';

interface IEditRequest {
    _id: string;
    reason: string;
    requester: { _id: string; name: string; email: string; };
    resourceId: { _id: string; amount: number; transactionDate: string; type: string; };
    resourceModel: string;
}

const fetchApprovalRequests = async (): Promise<IEditRequest[]> => {
    try {
        const { data } = await apiClient.get('/edit-requests');
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch approval requests');
        }
        return data.data || [];
    } catch (error: any) {
        console.error('Approval requests error:', error);
        throw error;
    }
};

const ApprovalRequestsPage: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: requests = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['approvalRequests'],
        queryFn: fetchApprovalRequests,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
        staleTime: 30000,
        refetchOnWindowFocus: false
    });

    const approveMutation = useMutation({
        mutationFn: (requestId: string) => apiClient.put(`/edit-requests/${requestId}/approve`),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvalRequests'] }); alert('Request approved successfully.'); },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to approve request.'),
    });

    const rejectMutation = useMutation({
        mutationFn: (requestId: string) => apiClient.put(`/edit-requests/${requestId}/reject`),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvalRequests'] }); },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to reject request.'),
    });

    if (isLoading) return <div className="text-center p-8 text-text-primary">Loading approval requests...</div>;
    
    if (isError) {
        return (
            <div className="text-center p-8">
                <div className="text-red-500 mb-4">Failed to load approval requests</div>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => refetch()} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    return (
        <motion.div 
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
            className="text-text-primary"
        >
            <h1 className="text-3xl font-bold mb-8">Pending Approval Requests</h1>

            {requests.length === 0 ? (
                <div className="text-center py-16 app-surface rounded-3xl border-2 border-dashed border-app-border">
                    <FileWarning size={48} className="mx-auto text-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">No Pending Requests</h3>
                    <p className="text-text-secondary mt-2">There are currently no pending edit requests from your agents.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req._id} className="app-surface p-4 rounded-xl border border-app-border shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-grow">
                                <p className="font-semibold text-text-primary">
                                    <span className="font-bold text-blue-500">{req.requester.name}</span> is requesting to edit a cash flow record:
                                </p>
                                <p className="text-sm text-text-secondary mt-1">
                                    Amount: <span className="font-semibold text-text-primary">${req.resourceId.amount.toFixed(2)}</span> | 
                                    Date: <span className="font-semibold text-text-primary">{new Date(req.resourceId.transactionDate).toLocaleDateString()}</span>
                                </p>
                                <div className="mt-2 p-3 bg-app-bg border border-dashed border-app-border rounded-md">
                                    <p className="text-sm text-text-secondary font-semibold">Reason:</p>
                                    <p className="text-sm text-text-primary">{req.reason}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={() => rejectMutation.mutate(req._id)} 
                                    disabled={rejectMutation.isPending} 
                                    className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-600 font-bold rounded-lg hover:bg-red-500/30"
                                >
                                    <X size={16}/> Reject
                                </button>
                                <button 
                                    onClick={() => approveMutation.mutate(req._id)} 
                                    disabled={approveMutation.isPending} 
                                    className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 font-bold rounded-lg hover:bg-green-500/30"
                                >
                                    <Check size={16}/> Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ApprovalRequestsPage;