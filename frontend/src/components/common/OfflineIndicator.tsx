import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline, wasOffline } = useOfflineStatus();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={16} />
            <span>You're offline. Some features may not work.</span>
          </div>
        </motion.div>
      )}
      
      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          onAnimationComplete={() => {
            setTimeout(() => {
              // Auto-hide after 3 seconds
            }, 3000);
          }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi size={16} />
            <span>Connection restored!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;