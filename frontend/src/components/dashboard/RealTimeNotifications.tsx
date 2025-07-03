import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Info, Bell } from 'lucide-react';

interface RealTimeNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);

  useEffect(() => {
    // Poll for new notifications every 30 seconds
    const interval = setInterval(async () => {
      try {
        const { data } = await fetch('/api/notifications').then(r => r.json());
        const unreadNotifications = data.filter((n: any) => !n.read);
        
        // Show only the most recent unread notification as a toast
        if (unreadNotifications.length > 0) {
          const latest = unreadNotifications[0];
          addNotification({
            id: latest.id,
            type: latest.type,
            title: latest.title,
            message: latest.message,
            duration: 5000
          });
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: RealTimeNotification) => {
    setNotifications(prev => [...prev, notification]);

    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check size={20} className="text-green-500" />;
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      case 'warning': return <AlertCircle size={20} className="text-orange-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`max-w-sm p-4 rounded-2xl border shadow-lg ${getBackgroundColor(notification.type)}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {notification.title}
                </h4>
                <p className="text-gray-700 text-sm mt-1">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeNotifications;