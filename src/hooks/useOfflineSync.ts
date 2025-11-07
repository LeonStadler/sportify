import { useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncQueue, hasQueuedActions } from '@/utils/offlineQueue';
import { API_URL } from '@/lib/api';

/**
 * Hook für automatische Offline-Synchronisation
 * Synchronisiert queued Aktionen wenn wieder online
 */
export function useOfflineSync() {
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (isOnline && hasQueuedActions()) {
      // Warte kurz bevor Sync startet (für stabile Verbindung)
      const timeoutId = setTimeout(() => {
        // API_URL enthält bereits /api, daher direkt verwenden
        const baseUrl = API_URL.replace('/api', '');
        syncQueue(baseUrl)
          .then((result) => {
            if (result.success > 0 || result.failed > 0) {
              console.log(
                `[OfflineSync] Synced ${result.success} actions, ${result.failed} failed`
              );
            }
          })
          .catch((error) => {
            console.error('[OfflineSync] Error during sync:', error);
          });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isOnline]);
}

