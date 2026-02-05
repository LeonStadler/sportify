---
title: "PWA Testing Guide"
---

# PWA Testing Guide

Dieses Dokument beschreibt, wie die PWA getestet werden kann.

## Lighthouse Testing

### Chrome DevTools

1. Öffne die App im Chrome Browser
2. Öffne DevTools (F12 oder Cmd+Option+I)
3. Gehe zum Tab "Lighthouse"
4. Wähle:
   - **Categories**: Progressive Web App
   - **Device**: Mobile oder Desktop
5. Klicke auf "Analyze page load"

### Erwartete Ergebnisse

- **Installable**: ✅ Die App sollte als installierbar erkannt werden
- **PWA Optimized**: ✅ Alle PWA-Features sollten erkannt werden
- **Service Worker**: ✅ Service Worker sollte registriert sein
- **Web App Manifest**: ✅ Manifest sollte gültig sein
- **Offline Capability**: ✅ Offline-Funktionalität sollte vorhanden sein

### Bekannte Probleme

- **Maskable Icons**: Lighthouse kann maskable Icons als Warnung anzeigen, wenn sie nicht perfekt sind. Das ist normal.
- **Splash Screens**: Nicht alle Splash Screens werden von Lighthouse erkannt, das ist normal für iOS.

## Cross-Browser Testing

### Chrome/Edge (Desktop & Mobile)

**Installation**:
1. Öffne die App im Browser
2. Klicke auf das Install-Icon in der Adressleiste
3. Oder nutze den Install-Prompt in der App

**Offline-Testing**:
1. Öffne DevTools → Network Tab
2. Aktiviere "Offline" Modus
3. Navigiere durch die App
4. Prüfe ob Offline-Seite angezeigt wird

**Service Worker**:
1. DevTools → Application → Service Workers
2. Prüfe ob Service Worker registriert ist
3. Prüfe Cache-Inhalt unter "Cache Storage"

### Firefox

**Installation**:
- Firefox unterstützt `beforeinstallprompt` nicht
- Nutze manuelle Installation über Menü → "Diese Seite als App installieren"

**Offline-Testing**:
- Funktioniert wie Chrome
- Service Worker wird unterstützt

### Safari (iOS)

**Installation**:
1. Öffne die App in Safari
2. Tippe auf Teilen-Symbol
3. Wähle "Zum Home-Bildschirm"
4. Prüfe ob App-Icon korrekt angezeigt wird

**Offline-Testing**:
1. Aktiviere Flugmodus
2. Öffne die installierte App
3. Prüfe ob Offline-Seite angezeigt wird

**Splash Screen**:
- Prüfe ob Splash Screen beim Start angezeigt wird
- Prüfe Light/Dark Mode Varianten

### Safari (macOS)

**Installation**:
1. Safari → Datei → "Zum Dock hinzufügen"
2. Oder über Teilen-Symbol → "Zum Dock hinzufügen"

**Offline-Testing**:
- Funktioniert wie iOS

## Device Testing Checklist

### iOS Geräte

- [ ] iPhone (verschiedene Größen)
- [ ] iPad (verschiedene Größen)
- [ ] App-Icon wird korrekt angezeigt
- [ ] Splash Screen wird angezeigt
- [ ] Status Bar ist korrekt (translucent)
- [ ] Safe Area wird respektiert
- [ ] Offline-Funktionalität funktioniert
- [ ] App startet im Standalone-Modus

### Android Geräte

- [ ] Verschiedene Android-Versionen
- [ ] App-Icon wird korrekt angezeigt
- [ ] Maskable Icons funktionieren
- [ ] Install-Prompt wird angezeigt
- [ ] Offline-Funktionalität funktioniert
- [ ] Badge API funktioniert (wenn unterstützt)

### Desktop Browser

- [ ] Chrome
- [ ] Edge
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Install-Funktionalität
- [ ] Offline-Funktionalität
- [ ] Service Worker funktioniert

## Funktionale Tests

### Service Worker

1. **Registrierung**:
   ```javascript
   // In Browser Console
   navigator.serviceWorker.getRegistrations().then(console.log);
   ```

2. **Cache-Inhalt prüfen**:
   - DevTools → Application → Cache Storage
   - Prüfe ob Assets gecacht sind

3. **Update-Testing**:
   - Ändere Service Worker Version
   - Prüfe ob Update erkannt wird
   - Prüfe ob alte Caches gelöscht werden

### Offline-Funktionalität

1. **Offline-Seite**:
   - Aktiviere Offline-Modus
   - Navigiere zu nicht gecachter Seite
   - Prüfe ob Offline-Seite angezeigt wird

2. **Offline-Queue**:
   - Erstelle Workout offline
   - Prüfe ob in Queue gespeichert wird
   - Gehe wieder online
   - Prüfe ob synchronisiert wird

3. **Cached Content**:
   - Lade Seite online
   - Gehe offline
   - Prüfe ob gecachte Inhalte angezeigt werden

### Install Prompt

1. **Chrome/Edge**:
   - Prüfe ob `beforeinstallprompt` Event kommt
   - Prüfe ob Prompt angezeigt wird
   - Prüfe ob Installation funktioniert

2. **Safari/iOS**:
   - Prüfe ob Anleitung angezeigt wird
   - Prüfe ob manuelle Installation funktioniert

### Badge API

1. **Chrome/Edge**:
   - Erstelle Benachrichtigung
   - Prüfe ob Badge auf App-Icon angezeigt wird
   - Markiere als gelesen
   - Prüfe ob Badge verschwindet

### Share Target

1. **Teile von anderer App**:
   - Teile Link/Text von anderer App
   - Wähle Sportify als Ziel
   - Prüfe ob Share-Seite geöffnet wird
   - Prüfe ob Daten korrekt angezeigt werden

## Performance Testing

### Lighthouse Performance Score

- **Ziel**: > 90
- **Metriken**:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Time to Interactive (TTI)
  - Cumulative Layout Shift (CLS)

### Service Worker Performance

- **Cache Hit Rate**: Sollte > 80% sein
- **Offline Load Time**: Sollte < 2s sein
- **Cache Size**: Sollte < 10MB sein

## Accessibility Testing

### Screen Reader

- [ ] Alle interaktiven Elemente haben ARIA Labels
- [ ] Navigation ist logisch
- [ ] Fehlermeldungen werden angekündigt
- [ ] Formulare sind korrekt beschriftet

### Keyboard Navigation

- [ ] Tab-Reihenfolge ist logisch
- [ ] Alle Funktionen sind per Tastatur erreichbar
- [ ] Focus-Indikatoren sind sichtbar
- [ ] Modals können mit ESC geschlossen werden

## Sicherheits-Tests

### HTTPS

- [ ] App läuft über HTTPS (oder localhost)
- [ ] Service Worker funktioniert nur über HTTPS

### Content Security Policy

- [ ] CSP Headers sind gesetzt
- [ ] Keine unsicheren Inline-Scripts
- [ ] Externe Ressourcen sind erlaubt

## Bekannte Limitationen

### iOS

- ❌ Kein `beforeinstallprompt` Event
- ❌ Keine Badge API
- ❌ Keine Share Target API
- ❌ Keine Background Sync
- ✅ Service Worker funktioniert
- ✅ Offline-Funktionalität funktioniert

### Firefox

- ❌ Kein `beforeinstallprompt` Event
- ❌ Keine Badge API
- ✅ Service Worker funktioniert
- ✅ Offline-Funktionalität funktioniert

## Automatisierte Tests

### Service Worker Tests

```javascript
// Beispiel-Test
describe('Service Worker', () => {
  it('should register service worker', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    expect(registration).toBeDefined();
  });
});
```

### Offline Tests

```javascript
// Beispiel-Test
describe('Offline Functionality', () => {
  it('should show offline page when offline', async () => {
    // Simuliere Offline-Modus
    // Prüfe ob Offline-Seite angezeigt wird
  });
});
```

## Troubleshooting

### Service Worker wird nicht registriert

1. Prüfe Browser-Konsole auf Fehler
2. Stelle sicher, dass App über HTTPS läuft
3. Prüfe ob Service Worker-Datei existiert
4. Prüfe Network Tab auf 404 Fehler

### Icons werden nicht angezeigt

1. Prüfe ob Icons im `public/` Ordner sind
2. Prüfe Manifest auf korrekte Pfade
3. Leere Browser-Cache
4. Prüfe Service Worker Cache

### Offline-Seite wird nicht angezeigt

1. Prüfe ob `offline.html` im Cache ist
2. Prüfe Service Worker Logs
3. Prüfe Network Tab auf Fehler

## Test-Report Vorlage

```
## PWA Test Report

**Datum**: [Datum]
**Browser**: [Browser + Version]
**Gerät**: [Gerät + OS Version]

### Installation
- [ ] Install-Prompt wird angezeigt
- [ ] Installation funktioniert
- [ ] App-Icon wird korrekt angezeigt

### Offline-Funktionalität
- [ ] Offline-Seite wird angezeigt
- [ ] Gecachte Inhalte werden angezeigt
- [ ] Offline-Queue funktioniert

### Service Worker
- [ ] Service Worker ist registriert
- [ ] Cache funktioniert
- [ ] Updates funktionieren

### Performance
- Lighthouse Score: [Score]
- FCP: [Zeit]
- LCP: [Zeit]

### Probleme
[Auflistung von Problemen]

### Verbesserungsvorschläge
[Auflistung von Verbesserungen]
```

