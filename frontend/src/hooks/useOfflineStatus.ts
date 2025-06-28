import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(offlineService.getStatus());

  useEffect(() => {
    const unsubscribe = offlineService.onStatusChange(setIsOnline);
    return unsubscribe;
  }, []);

  return {
    isOnline,
    isOffline: !isOnline
  };
};