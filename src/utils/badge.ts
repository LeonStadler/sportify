/**
 * Badge API für PWA App-Icon
 * Zeigt Notification Count auf dem App-Icon an
 *
 * Browser-Support:
 * - Chrome/Edge: ✅ Unterstützt
 * - Firefox: ❌ Nicht unterstützt
 * - Safari (iOS): ❌ Nicht unterstützt
 * - Safari (macOS): ❌ Nicht unterstützt
 */

interface NavigatorWithBadge {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
}

/**
 * Setzt den Badge auf dem App-Icon
 * @param count - Anzahl der Notifications (0 = Badge entfernen)
 */
export async function setAppBadge(count: number): Promise<void> {
  if (!("setAppBadge" in navigator)) {
    console.warn("[Badge API] Not supported in this browser");
    return;
  }

  try {
    const nav = navigator as Navigator & NavigatorWithBadge;
    if (count > 0 && nav.setAppBadge) {
      await nav.setAppBadge(count);
    } else if (nav.clearAppBadge) {
      await nav.clearAppBadge();
    }
  } catch (error) {
    console.error("[Badge API] Error setting badge:", error);
  }
}

/**
 * Entfernt den Badge vom App-Icon
 */
export async function clearAppBadge(): Promise<void> {
  await setAppBadge(0);
}

/**
 * Prüft ob Badge API unterstützt wird
 */
export function isBadgeSupported(): boolean {
  return "setAppBadge" in navigator;
}
