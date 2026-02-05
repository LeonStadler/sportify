# Deployment

## Vercel

Sportify ist für Vercel optimiert und nutzt Express für die API.

### Voraussetzungen

- Vercel Account
- Vercel CLI (`npm i -g vercel`)

### Schritte

1. `vercel login`
2. `vercel link`
3. Umgebungsvariablen setzen (siehe unten)
4. `vercel` (Preview) oder `vercel --prod`

### Umgebungsvariablen (Backend)

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `DATABASE_SSL_ENABLED`, `DATABASE_SSL_REJECT_UNAUTHORIZED`
- `CORS_ALLOW_ORIGINS`
- `SMTP_*` (falls E‑Mails aktiv)
- `EVENTS_CRON_SECRET` / `CRON_SECRET`
- `EVENTS_BASE_URL`
- `EMAIL_PREFERENCES_SECRET`, `EMAIL_PREFERENCES_TOKEN_TTL`
- `VAPID_*` oder `WEB_PUSH_*`

### Frontend (Vite)

- `VITE_FRONTEND_URL`
- `VITE_CONTACT_*`

## Event‑Scheduling (GitHub Actions)

Im Free‑Plan werden Jobs über GitHub Actions getriggert:

- Workflow: `.github/workflows/events-scheduler.yml`
- Secrets:
  - `EVENTS_BASE_URL`
  - `EVENTS_CRON_SECRET`

## Migrationen

Migrationen laufen beim Server‑Start. Optional bei Vercel pro Request:

- `RUN_MIGRATIONS_ON_REQUEST=true`

Status prüfen:

- `GET /api/health` → `migrations` Feld

## Build

- `npm run build` (TypeScript + Vite)
- Output: `dist/`
