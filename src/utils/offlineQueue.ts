/**
 * Offline Queue System für PWA
 * Speichert Aktionen die offline durchgeführt wurden und synchronisiert sie später
 */

const QUEUE_STORAGE_KEY = "sportify-offline-queue";
const MAX_QUEUE_SIZE = 100;

export interface QueuedAction {
  id: string;
  type: string;
  endpoint: string;
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

/**
 * Fügt eine Aktion zur Offline-Queue hinzu
 */
export function addToQueue(
  endpoint: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>
): string {
  const queue = getQueue();
  const action: QueuedAction = {
    id: generateId(),
    type: "api-request",
    endpoint,
    method,
    body,
    headers,
    timestamp: Date.now(),
    retries: 0,
  };

  queue.push(action);

  // Begrenze Queue-Größe
  if (queue.length > MAX_QUEUE_SIZE) {
    queue.shift(); // Entferne älteste Aktion
  }

  saveQueue(queue);
  return action.id;
}

/**
 * Holt alle Aktionen aus der Queue
 */
export function getQueue(): QueuedAction[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("[OfflineQueue] Error reading queue:", error);
    return [];
  }
}

/**
 * Speichert die Queue
 */
function saveQueue(queue: QueuedAction[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("[OfflineQueue] Error saving queue:", error);
  }
}

/**
 * Entfernt eine Aktion aus der Queue
 */
export function removeFromQueue(actionId: string): void {
  const queue = getQueue();
  const filtered = queue.filter((action) => action.id !== actionId);
  saveQueue(filtered);
}

/**
 * Synchronisiert alle Aktionen in der Queue
 */
export async function syncQueue(apiUrl: string): Promise<{
  success: number;
  failed: number;
}> {
  const queue = getQueue();
  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  // Sortiere nach Timestamp (älteste zuerst)
  const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);

  for (const action of sortedQueue) {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...action.headers,
      };

      // Stelle sicher dass endpoint mit / beginnt
      const endpoint = action.endpoint.startsWith("/")
        ? action.endpoint
        : `/${action.endpoint}`;
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: action.method,
        headers,
        body: action.body ? JSON.stringify(action.body) : undefined,
      });

      if (response.ok) {
        removeFromQueue(action.id);
        success++;
      } else {
        // Erhöhe Retry-Count
        action.retries++;
        if (action.retries >= 3) {
          // Nach 3 Versuchen entfernen
          removeFromQueue(action.id);
          failed++;
        } else {
          // Aktualisiere Queue mit neuem Retry-Count
          const updatedQueue = getQueue();
          const index = updatedQueue.findIndex((a) => a.id === action.id);
          if (index !== -1) {
            updatedQueue[index] = action;
            saveQueue(updatedQueue);
          }
        }
      }
    } catch (error) {
      console.error("[OfflineQueue] Error syncing action:", error);
      action.retries++;
      if (action.retries >= 3) {
        removeFromQueue(action.id);
        failed++;
      } else {
        const updatedQueue = getQueue();
        const index = updatedQueue.findIndex((a) => a.id === action.id);
        if (index !== -1) {
          updatedQueue[index] = action;
          saveQueue(updatedQueue);
        }
      }
    }
  }

  return { success, failed };
}

/**
 * Generiert eine eindeutige ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Löscht die gesamte Queue
 */
export function clearQueue(): void {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}

/**
 * Prüft ob Queue Aktionen enthält
 */
export function hasQueuedActions(): boolean {
  return getQueue().length > 0;
}
