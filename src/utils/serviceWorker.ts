// Service Worker Registrierung und Update-Handling

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[Service Worker] Registered successfully:', registration.scope);
          
          // Prüfe auf Updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Neuer Service Worker verfügbar
                  console.log('[Service Worker] New version available');
                  
                  // Optional: Zeige Benachrichtigung an Benutzer
                  if (confirm('Eine neue Version ist verfügbar. Seite neu laden?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
          
          // Prüfe regelmäßig auf Updates (alle Stunde)
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error);
        });
    });
    
    // Handle Service Worker Updates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  } else {
    console.warn('[Service Worker] Not supported in this browser');
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister().then((success) => {
        if (success) {
          console.log('[Service Worker] Unregistered successfully');
        }
      });
    });
  }
}

