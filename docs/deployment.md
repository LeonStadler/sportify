# Deployment

Diese Dokumentation beschreibt den Deployment-Prozess für Sportify.

## Vercel Deployment

Sportify ist für Vercel optimiert und nutzt Serverless Functions für das Backend.

### Voraussetzungen

- Vercel Account
- Vercel CLI installiert: `npm i -g vercel`
- Git Repository

### Deployment-Schritte

#### 1. Vercel CLI Login

```bash
vercel login
```

#### 2. Projekt verknüpfen

```bash
vercel link
```

#### 3. Umgebungsvariablen setzen

In Vercel Dashboard oder per CLI:

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add SMTP_FROM
vercel env add FRONTEND_URL
vercel env add VITE_API_URL
```

#### 4. Deployment

```bash
# Preview Deployment
vercel

# Production Deployment
vercel --prod
```

### Automatisches Deployment

Vercel deployt automatisch bei jedem Push zu:

- **Preview**: Jeder Branch
- **Production**: `main` Branch

### Konfiguration

Die `vercel.json` Datei konfiguriert:

- **Rewrites**: API-Routes zu Serverless Functions
- **Headers**: Security Headers (CSP, etc.)
- **Static Assets**: Automatisches Serving

## Event-Scheduling im Free-Plan

Da der Vercel-Hobby-Plan nur zwei einfache Cron-Jobs zulässt, werden die Event-Auswertungen über **GitHub Actions** angestoßen:

- Workflow: `.github/workflows/events-scheduler.yml`
- Secrets im GitHub-Repo hinterlegen:
  - `EVENTS_BASE_URL` (z. B. `https://<project>.vercel.app`)
  - `EVENTS_CRON_SECRET` (muss mit der Server-Env übereinstimmen)
- Frequenzen: wöchentlich (Montag), monatlich (1. des Monats) und alle 15 Minuten für den Mail-Dispatcher.
- Optional per `workflow_dispatch` manuell triggerbar.

## Umgebungsvariablen

### Backend (Serverless Functions)

- `DATABASE_URL`: PostgreSQL-Verbindungs-URL
- `DATABASE_SSL_ENABLED`: TLS aktivieren (true/false)
- `DATABASE_SSL_REJECT_UNAUTHORIZED`: Zertifikat-Validierung
- `JWT_SECRET`: Secret für JWT-Tokens
- `SMTP_HOST`: SMTP-Server Host
- `SMTP_PORT`: SMTP-Server Port
- `SMTP_USER`: SMTP-Benutzername
- `SMTP_PASSWORD`: SMTP-Passwort
- `SMTP_FROM`: Absender-E-Mail-Adresse
- `FRONTEND_URL`: Frontend-URL für E-Mail-Links

### Frontend (Build-Time)

- `VITE_API_URL`: API-URL für Frontend

## Datenbank-Migrationen

Standard: Migrationen laufen in der CI/CD-Pipeline beim Deploy.  
Cold-Start-Migrationen sind AUS; aktiviere sie nur bei Bedarf mit `RUN_MIGRATIONS_ON_LOAD=true`.

Die Migration-Logik befindet sich in:
- `db/migrations.js`: Migration-Runner
- `migrations/`: SQL-Migrationsdateien

Status prüfen (Serverless):
- `GET /api/health/migrations` zeigt `ran/inFlight/error/enabled`
- `GET /api/health` enthält das gleiche Feld unter `migrations`

### Manuelle Migrationen

Falls nötig, können Migrationen manuell ausgeführt werden:

```bash
# Lokal
node -e "import('./db/migrations.js').then(m => m.createMigrationRunner(pool)())"
```

## Build-Prozess

### Frontend Build

1. TypeScript-Kompilierung: `tsc -b`
2. Vite Build: `vite build`
3. Statische Assets werden in `dist/` generiert

### Backend Build

- Serverless Functions werden automatisch von Vercel gebaut
- Entry Point: `api/index.js`

## Domain-Konfiguration

### Custom Domain

1. In Vercel Dashboard: Project → Settings → Domains
2. Domain hinzufügen
3. DNS-Records konfigurieren (A/CNAME)

### SSL/TLS

- Automatisch von Vercel bereitgestellt
- Let's Encrypt Zertifikate

## Monitoring

### Vercel Analytics

- Automatisch aktiviert
- Verfügbar im Vercel Dashboard

### Logs

- **Function Logs**: In Vercel Dashboard → Functions
- **Build Logs**: In Vercel Dashboard → Deployments

## Troubleshooting

### Build-Fehler

- Prüfe Build-Logs in Vercel Dashboard
- Prüfe TypeScript-Fehler lokal: `npm run type-check`
- Prüfe ESLint-Fehler lokal: `npm run lint`

### Runtime-Fehler

- Prüfe Function Logs in Vercel Dashboard
- Prüfe Umgebungsvariablen
- Prüfe Datenbank-Verbindung

### Migration-Fehler

- Prüfe Datenbank-Verbindung
- Prüfe Migration-Logs
- Führe Migrationen manuell aus falls nötig

## Rollback

### Vercel Rollback

1. Gehe zu Vercel Dashboard → Deployments
2. Wähle vorherige erfolgreiche Deployment
3. Klicke auf "Promote to Production"

### Oder per CLI

```bash
vercel rollback
```

## Performance-Optimierung

### Frontend

- **Static Assets**: Automatisch über CDN ausgeliefert
- **Code Splitting**: Automatisch durch Vite
- **Image Optimization**: (Optional) Vercel Image Optimization

### Backend

- **Serverless Functions**: Automatisches Scaling
- **Connection Pooling**: Optimiert für Serverless
- **Caching**: React Query für API-Responses

## Sicherheit

### Headers

Automatisch gesetzt durch `vercel.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`: Konfiguriert
- `Referrer-Policy`: strict-origin-when-cross-origin

### Secrets

- **Umgebungsvariablen**: Nie im Code committen
- **Vercel Secrets**: Verwende Vercel Environment Variables
- **JWT Secret**: Starke, zufällige Zeichenkette

## CI/CD

### GitHub Actions (Optional)

Beispiel-Workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Checkliste vor Deployment

- [ ] Alle Umgebungsvariablen gesetzt
- [ ] Datenbank-Verbindung getestet
- [ ] Build lokal erfolgreich: `npm run build`
- [ ] Type-Check erfolgreich: `npm run type-check`
- [ ] Linting erfolgreich: `npm run lint`
- [ ] Tests erfolgreich: `npm run test`
- [ ] Migrationen getestet
- [ ] E-Mail-Konfiguration getestet

## Weitere Deployment-Optionen

### Docker (Optional)

Dockerfile-Beispiel:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "server.js"]
```

### Andere Plattformen

- **Netlify**: Ähnlich zu Vercel
- **Railway**: Mit Docker-Support
- **Heroku**: Mit Buildpacks
- **AWS/GCP/Azure**: Mit Container-Services

Siehe jeweilige Plattform-Dokumentation für Details.
