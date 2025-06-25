// frontend/src/components/dashboard/NotificationsPanel.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchNotifications = async () => {
    const { data } = await apiClient.get('/notifications');
    return data.data;
};

const NotificationsPanel = () => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        refetchInterval: 60000, // Refetch every 60 seconds
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsReadMutation = useMutation({
        mutationFn: () => apiClient.post('/notifications/mark-as-read'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark transition-colors">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-light-card dark:bg-dark-card rounded-lg shadow-xl border border-border-color dark:border-border-color-dark z-10 transition-all duration-200">
                    <div className="p-4 flex justify-between items-center border-b border-border-color dark:border-border-color-dark">
                        <h3 className="font-bold text-dark-text dark:text-dark-text-dark">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={() => markAsReadMutation.mutate()} className="text-xs text-brand-primary dark:text-brand-secondary font-semibold hover:underline transition-colors">Mark all as read</button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                             <p className="text-center text-light-text dark:text-light-text-dark py-8">No notifications</p>
                        ) : (
                            notifications.map(n => (
                                <Link to={n.link} key={n._id} onClick={() => setIsOpen(false)} className={`block p-4 border-b border-border-color dark:border-border-color-dark hover:bg-light-bg dark:hover:bg-dark-bg/20 transition-colors ${!n.isRead ? 'bg-brand-primary/10' : ''}`}>
                                    <p className="text-sm text-dark-text dark:text-dark-text-dark">{n.message}</p>
                                    <p className="text-xs text-light-text dark:text-light-text-dark mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;
