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
            inactive: 'bg-gray-500/20 text-gray-300',
            sent: 'bg-blue-500/20 text-blue-300',
            failed: 'bg-red-500/20 text-red-400',
        };
        return map[status as keyof typeof map] || 'bg-gray-500/20 text-gray-300';
    };

    const getTypeIcon = (type: string) => {
        const map = {
            email_rent_reminder: <Mail size={16} />,
            app_rent_reminder: <Smartphone size={16} />,
            sms_rent_reminder: <MessageSquare size={16} />,
        };
        return map[type as keyof typeof map] || <Bell size={16} />;
    };

    if (isLoading) return <div className="text-center p-8 text-dark-text">Loading reminders...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch reminders.</div>;

    return (
        <div className="text-dark-text">
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
                    className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary hover:bg-opacity-90 text-brand-dark font-bold rounded-lg shadow-md transition-colors"
                >
                    <PlusCircle size={18} />
                    <span>Add New Reminder</span>
                </button>
            </div>

            {reminders.length === 0 ? (
                <div className="text-center py-16 bg-light-card rounded-xl border-2 border-dashed border-border-color">
                    <h3 className="text-xl font-semibold text-dark-text">No Automated Reminders Configured</h3>
                    <p className="text-light-text mt-2 mb-4">Set up recurring rent reminders for your tenants.</p>
                </div>
            ) : (
                <div className="bg-light-card rounded-xl shadow-lg border border-border-color overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-dark-bg/50 border-b border-border-color">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Tenant</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Type</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Next Send</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Frequency</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                                    <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {reminders.map((reminder) => (
                                    <tr key={reminder._id} className="hover:bg-dark-bg/40">
                                        <td className="p-4 font-semibold text-dark-text">{reminder.tenantId.name} ({reminder.tenantId.unit})</td>
                                        <td className="p-4 flex items-center gap-2 text-light-text capitalize">
                                            {getTypeIcon(reminder.type)} {reminder.type.replace(/_/g, ' ')}
                                        </td>
                                        <td className="p-4 text-light-text">{new Date(reminder.nextRunDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-light-text capitalize">{reminder.frequency}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(reminder.status)}`}>
                                                {reminder.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => handleEditReminder(reminder)} className="text-brand-primary hover:underline p-2" title="Edit Reminder"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteReminder(reminder._id)} className="text-red-400 hover:underline p-2" title="Delete Reminder" disabled={deleteMutation.isLoading}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemindersPage;
