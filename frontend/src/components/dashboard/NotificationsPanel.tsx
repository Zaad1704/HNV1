import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Bell, X, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { Link } from 'react-router-dom';

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
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    requestPermission 
  } = useNotifications();

  const { data: serverNotifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  useEffect(() => {
    requestPermission();
  }, []);

  const allNotifications = [...notifications, ...serverNotifications];
  const totalUnread = unreadCount + serverNotifications.filter((n: any) => !n.isRead).length;

  const handleOpen = () => {
    setIsOpen(true);
    if (totalUnread > 0) {
      markReadMutation.mutate();
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full text-text-secondary hover:text-text-primary transition-colors"
      >
        <Bell size={20} />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
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
                <div className="flex items-center gap-2">
                  {totalUnread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-brand-blue hover:text-brand-blue/80 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full text-text-secondary hover:text-text-primary"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {allNotifications.length > 0 ? (
                  allNotifications.map((notification: any) => (
                    <div
                      key={notification._id || notification.id}
                      className={`p-4 border-b border-app-border last:border-b-0 hover:bg-app-bg/50 transition-colors ${
                        !notification.isRead && !notification.read ? 'bg-brand-blue/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-primary text-sm">
                            {notification.title || 'Notification'}
                          </h4>
                          <p className="text-text-secondary text-xs mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-text-muted text-xs">
                              {formatTime(notification.timestamp || notification.createdAt)}
                            </span>
                            {notification.action && (
                              <Link
                                to={notification.action.url}
                                className="text-xs text-brand-blue hover:text-brand-blue/80 flex items-center gap-1"
                                onClick={() => setIsOpen(false)}
                              >
                                {notification.action.label}
                                <ExternalLink size={10} />
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {(!notification.isRead && !notification.read) && (
                            <button
                              onClick={() => markAsRead(notification.id || notification._id)}
                              className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-app-bg transition-colors"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {notification.id && (
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
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