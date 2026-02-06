# PWA Testing

## Ziele

- Installierbarkeit
- Offline‑Fallback
- Cache‑Verhalten
- Push‑Flow (optional)

## Checkliste (lokal)

1. **Build & Preview**
   - `npm run build`
   - `npm run preview`
2. **Installierbarkeit**
   - Manifest wird geladen
   - Install‑Prompt erscheint (Chrome/Edge)
3. **Offline‑Seite**
   - DevTools → Network → Offline
   - Seite lädt `offline.html`
4. **Cache‑Verhalten**
   - `Application → Service Workers`
   - Cache Entries prüfen
5. **Push** (optional)
   - `GET /api/notifications/public-key`
   - Subscription speichern

## Browser

- Chrome/Edge: volle PWA‑Unterstützung
- Firefox: eingeschränkt
- Safari: installiert, aber eingeschränkte Push‑Features
