import { useEffect, useState } from 'react';

/**
 * Custom Hook für Online/Offline-Status
 * 
 * @returns {boolean} isOnline - true wenn online, false wenn offline
 * @returns {boolean} isOffline - true wenn offline, false wenn online
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialer Status basierend auf navigator.onLine
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Default: online annehmen
  });

  useEffect(() => {
    // Handler für Online-Event
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handler für Offline-Event
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Event Listener hinzufügen
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

