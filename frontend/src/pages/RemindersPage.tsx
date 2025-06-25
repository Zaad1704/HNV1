import React, { useState } from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Bell, Edit, Trash2, Mail, MessageSquare, Smartphone } from 'lucide-react';
import ReminderFormModal from '../components/common/ReminderFormModal';

interface IReminderRecord {
    _id: string;
    tenantId: { _id: string; name: string; unit: string; propertyId: { name: string } };
    type: 'email_rent_reminder' | 'app_rent_reminder' | 'sms_rent_reminder';
    nextRunDate: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    status: 'active' | 'inactive' | 'sent' | 'failed';
}

const fetchReminders = async (): Promise<IReminderRecord[]> => {
    const { data } = await apiClient.get('/reminders');
    return data.data;
};

const RemindersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reminderToEdit, setReminderToEdit] = useState<IReminderRecord | undefined>(undefined);

    const { data: reminders = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['reminders'],
        queryFn: fetchReminders,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/reminders/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
            alert('Reminder deleted successfully!');
        },
        onError: (err: any) => {
            alert(`Failed to delete reminder: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleAddReminder = () => {
        setReminderToEdit(undefined);
        setIsModalOpen(true);
    };

    const handleEditReminder = (reminder: IReminderRecord) => {
        setReminderToEdit(reminder);
        setIsModalOpen(true);
    };

    const handleDeleteReminder = (id: string) => {
        if (window.confirm('Are you sure you want to delete this reminder?')) {
            deleteMutation.mutate(id);
        }
    };

    const getStatusBadge = (status: string) => {
        const map = {
            active: 'bg-green-500/20 text-green-300',
            inactive: 'bg-light-text/20 text-light-text',
            sent: 'bg-brand-primary/20 text-brand-primary',
            failed: 'bg-brand-orange/20 text-brand-orange',
        };
        return map[status as keyof typeof map] || 'bg-light-text/20 text-light-text';
    };

    const getTypeIcon = (type: string) => {
        const map = {
            email_rent_reminder: <Mail size={16} />,
            app_rent_reminder: <Smartphone size={16} />,
            sms_rent_reminder: <MessageSquare size={16} />,
        };
        return map[type as keyof typeof map] || <Bell size={16} />;
    };

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading reminders...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch reminders.</div>;

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
            <ReminderFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveSuccess={() => refetch()}
                reminderToEdit={reminderToEdit}
            />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Automated Reminders</h1>
                <button
                    onClick={handleAddReminder}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg shadow-md transition-colors duration-200"
                >
                    <PlusCircle size={18} />
                    <span>Add New Reminder</span>
                </button>
            </div>

            {reminders.length === 0 ? (
                <div className="text-center py-16 bg-light-card rounded-xl border-2 border-dashed border-border-color dark:bg-dark-card dark:border-border-color-dark">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark">No Automated Reminders Configured</h3>
                    <p className="text-light-text mt-2 mb-4 dark:text-light-text-dark">Set up recurring rent reminders for your tenants.</p>
                </div>
            ) : (
                <div className="bg-light-card rounded-xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
