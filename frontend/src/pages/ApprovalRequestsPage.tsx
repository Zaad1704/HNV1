import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Check, X, FileWarning } from 'lucide-react';

// Define the shape of the request data for type safety
interface IEditRequest {
    _id: string;
    reason: string;
    requester: {
        _id: string;
        name: string;
        email: string;
    };
    resourceId: { // This will be the populated CashFlow record
        _id: string;
        amount: number;
        transactionDate: string;
        type: string;
    };
    resourceModel: string;
}

// Fetch pending requests for the logged-in Landlord
const fetchApprovalRequests = async (): Promise<IEditRequest[]> => {
    const { data } = await apiClient.get('/edit-requests');
    return data.data;
};

const ApprovalRequestsPage: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: requests = [], isLoading, isError } = useQuery({
        queryKey: ['approvalRequests'],
        queryFn: fetchApprovalRequests,
    });

    // Mutation to handle approving a request
    const approveMutation = useMutation({
        mutationFn: (requestId: string) => apiClient.put(`/edit-requests/${requestId}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
            alert('Request approved successfully.');
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to approve request.'),
    });

    // Mutation to handle rejecting a request
    const rejectMutation = useMutation({
        mutationFn: (requestId: string) => apiClient.put(`/edit-requests/${requestId}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to reject request.'),
    });

    if (isLoading) return <div className="text-center p-8">Loading approval requests...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">Failed to load requests.</div>;

    return (
        <div className="text-dark-text">
            <h1 className="text-3xl font-bold mb-8">Pending Approval Requests</h1>

            {requests.length === 0 ? (
                <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                    <h3 className="text-xl font-semibold text-dark-text">No Pending Requests</h3>
                    <p className="text-light-text mt-2">There are currently no pending edit or delete requests from your agents.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-grow">
                                <p className="font-semibold text-dark-text">
                                    <span className="font-bold text-brand-primary">{req.requester.name}</span> is requesting to edit a cash flow record:
                                </p>
                                <p className="text-sm text-light-text mt-1">
                                    Amount: <span className="font-semibold text-dark-text">${req.resourceId.amount.toFixed(2)}</span> | 
                                    Date: <span className="font-semibold text-dark-text">{new Date(req.resourceId.transactionDate).toLocaleDateString()}</span>
                                </p>
                                <div className="mt-2 p-3 bg-light-bg border border-dashed rounded-md">
                                    <p className="text-sm text-light-text font-semibold">Reason:</p>
                                    <p className="text-sm text-dark-text">{req.reason}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => rejectMutation.mutate(req._id)}
                                    disabled={rejectMutation.isLoading}
                                    className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200"
                                >
                                    <X size={16}/> Reject
                                </button>
                                <button
                                    onClick={() => approveMutation.mutate(req._id)}
                                    disabled={approveMutation.isLoading}
                                    className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200"
                                >
                                    <Check size={16}/> Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApprovalRequestsPage;
