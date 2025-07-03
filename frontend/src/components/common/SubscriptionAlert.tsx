import React from 'react';
import { AlertTriangle, CreditCard, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriptionAlertProps {
  status: 'expired' | 'canceled' | 'inactive' | 'warning';
  message: string;
  onDismiss?: () => void;
}

const SubscriptionAlert: React.FC<SubscriptionAlertProps> = ({ 
  status, 
  message, 
  onDismiss 
}) => {
  const getAlertStyles = () => {
    switch (status) {
      case 'expired':
      case 'canceled':
      case 'inactive':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'expired':
      case 'canceled':
      case 'inactive':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <CreditCard className="text-blue-500" size={20} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`border rounded-2xl p-4 mb-6 ${getAlertStyles()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <p className="font-semibold">Subscription {status}</p>
              <p className="text-sm opacity-90">{message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(status === 'expired' || status === 'canceled' || status === 'inactive') && (
              <Link
                to="/plans"
                className="bg-white text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <CreditCard size={16} />
                Resubscribe
              </Link>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionAlert;