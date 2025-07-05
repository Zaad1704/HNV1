import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, User, Building, Check, X } from 'lucide-react';
import apiClient from '../api/client';

const fetchApprovals = async () => {
  try {
    const { data } = await apiClient.get('/approvals');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch approvals:', error);
    return [];
  }
};

const updateApproval = async ({ id, status }: { id: string; status: string }) => {
  const { data } = await apiClient.put(`/approvals/${id}`, { status });
  return data.data;
};

const ApprovalRequestsPage = () => {
  const queryClient = useQueryClient();
  
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: fetchApprovals,
    retry: 1
  });

  const mutation = useMutation({
    mutationFn: updateApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  const handleApproval = (id: string, status: string) => {
    mutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading approvals...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Approval Requests</h1>
        <p className="text-text-secondary mt-1">Manage pending approvals</p>
      </div>

      {approvals.length > 0 ? (
        <div className="space-y-4">
          {approvals.map((approval: any, index: number) => (
            <motion.div
              key={approval._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 app-gradient rounded-xl flex items-center justify-center">
                      <CheckSquare size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">
                        {approval.type || 'Approval Request'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : approval.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {approval.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-text-secondary mb-4">
                    {approval.description || 'No description provided'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>Requested by: {approval.requestedBy?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={14} />
                      <span>Property: {approval.propertyId?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : 'No date'}</span>
                    </div>
                  </div>
                </div>
                
                {approval.status === 'Pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproval(approval._id, 'Approved')}
                      disabled={mutation.isPending}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(approval._id, 'Rejected')}
                      disabled={mutation.isPending}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 disabled:opacity-50"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Pending Approvals</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            All approval requests have been processed. New requests will appear here.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ApprovalRequestsPage;