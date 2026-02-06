# Entwicklung

## Voraussetzungen

- Node.js >= 18
- PostgreSQL

## Setup

1. Dependencies: `npm install`
2. `.env` erstellen (siehe Abschnitt Umgebungsvariablen)
3. Dev‑Server: `npm run dev`

## Skripte (Auszug)

- `npm run dev` – Frontend + Backend
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run test`
- `npm run lint`
- `npm run type-check`

## Umgebungsvariablen

Pflicht (lokal/prod):

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

Optional (Backend):

- `PORT`, `NODE_ENV`
- `DATABASE_SSL_ENABLED`, `DATABASE_SSL_REJECT_UNAUTHORIZED`
- `CORS_ALLOW_ORIGINS`
- `RUN_MIGRATIONS_ON_REQUEST`

E‑Mail/SMTP:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- `LOG_EMAIL_CONFIG`, `LOG_EMAIL_DETAILS`

Jobs/Events:

- `EVENTS_CRON_SECRET` oder `CRON_SECRET`
- `EVENTS_BASE_URL`
- `EMAIL_PREFERENCES_SECRET`
- `EMAIL_PREFERENCES_TOKEN_TTL`
- `EVENTS_UTC_OFFSET_MINUTES` oder `EVENTS_TIMEZONE_OFFSET_MINUTES`
- `ALERT_EMAIL`

Push:

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- oder `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_SUBJECT`
- `WEB_PUSH_TTL_SECONDS`

Frontend (Vite):

- `VITE_FRONTEND_URL`
- `VITE_CONTACT_ADDRESS_*`
- `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`, `VITE_CONTACT_RESPONSIBLE_PERSON`

## Struktur

- Backend: `server.js`, `routes/`, `services/`, `middleware/`
- Frontend: `src/` (Pages, Components, Services)

## Tests

- `npm run test` (Node + Vitest)
- `npm run test:watch`
