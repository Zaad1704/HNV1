import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fetchNotifications = async () => {
  const { data } = await apiClient.get('/notifications');
  return data.data;
};

const markAsRead = async () => {
  await apiClient.post('/notifications/mark-as-read');
};

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleOpen = () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      markReadMutation.mutate();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full text-text-secondary hover:text-text-primary transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-80 app-surface rounded-2xl border border-app-border shadow-app-xl z-50"
            >
              <div className="p-4 border-b border-app-border flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-text-secondary hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification: any) => (
                    <div
                      key={notification._id}
                      className={`p-4 border-b border-app-border last:border-b-0 ${
                        !notification.isRead ? 'bg-brand-blue/5' : ''
                      }`}
                    >
                      <p className="text-sm text-text-primary">{notification.message}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell size={32} className="mx-auto text-text-muted mb-2" />
                    <p className="text-text-secondary text-sm">No notifications</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPanel;