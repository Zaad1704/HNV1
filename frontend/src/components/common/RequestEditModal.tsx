import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { X } from 'lucide-react';

interface RequestEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    resourceId: string;
    resourceModel: string;
    approverId: string;
    onSuccess: () => void;
}

const RequestEditModal: React.FC<RequestEditModalProps> = ({ isOpen, onClose, resourceId, resourceModel, approverId, onSuccess }) => {
    const queryClient = useQueryClient();
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (requestData: { resourceId: string; resourceModel: string; reason: string; approverId: string; }) => 
            apiClient.post('/edit-requests', requestData),
        onSuccess: () => {
            alert('Your request has been sent to the Landlord for approval.');
            onSuccess(); // Callback to parent component
            onClose();   // Close the modal
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to send request.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!reason) {
            setError('A reason for the request is required.');
            return;
        }
        mutation.mutate({ resourceId, resourceModel, reason, approverId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card rounded-xl shadow-xl w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-dark-text">Request Permission to
