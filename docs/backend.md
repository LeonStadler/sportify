# Backend

Diese Dokumentation beschreibt Backend‑Struktur, Services und API‑Design.

## Struktur

```
server.js
routes/
middleware/
services/
utils/
migrations/
```

## Routes

Alle Routen werden in `server.js` unter `/api/*` registriert:

- `/api/auth`
- `/api/admin`
- `/api/profile`
- `/api/friends`
- `/api/users`
- `/api/exercises`
- `/api/workouts`
- `/api/training-journal`
- `/api/scoreboard`
- `/api/stats`
- `/api/goals`
- `/api/recent-workouts`
- `/api/feed`
- `/api/challenges`
- `/api/events`
- `/api/notifications`
- `/api/reactions`
- `/api/contact`

Details: [API Übersicht](api/README.md).

## Middleware

- `authMiddleware` prüft JWT und setzt `req.user`.
- `adminMiddleware` prüft Admin‑Rolle.

## Services (Auszug)

- **emailService/emailQueueService**: Queue + Versand von Mails.
- **tokenService**: Verifizierungs‑ und Reset‑Tokens.
- **invitationService**: Einladungen.
- **pushService**: Web Push (VAPID).
- **eventService**: Wochen-/Monats‑Jobs, Awards, Summaries.

## Datenbank

- `pg` Pool mit `DATABASE_URL`.
- SQL‑Migrationen in `migrations/`.

## Umgebungsvariablen

Pflicht (Produktion):

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

Optional (Backend):

- `PORT`
- `NODE_ENV`
- `DATABASE_SSL_ENABLED`
- `DATABASE_SSL_REJECT_UNAUTHORIZED`
- `CORS_ALLOW_ORIGINS`

E‑Mail/SMTP:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `SMTP_FROM`
- `LOG_EMAIL_CONFIG`, `LOG_EMAIL_DETAILS`

Events/Jobs:

- `EVENTS_CRON_SECRET` (oder `CRON_SECRET`)
- `EVENTS_BASE_URL`
- `EMAIL_PREFERENCES_SECRET`
- `EMAIL_PREFERENCES_TOKEN_TTL`
- `EVENTS_UTC_OFFSET_MINUTES` oder `EVENTS_TIMEZONE_OFFSET_MINUTES`
- `ALERT_EMAIL`

Push:

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Alternativ `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_SUBJECT`
- `WEB_PUSH_TTL_SECONDS`

Frontend‑Expose (Vite):

- `VITE_FRONTEND_URL`
- `VITE_CONTACT_*` (Adresse/Impressum)

## Fehlerbehandlung

Fehler werden als JSON mit `error` Feld zurückgegeben. HTTP‑Statuscodes folgen REST‑Konventionen.
