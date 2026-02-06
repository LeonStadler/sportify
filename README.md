# Sportify – Modern Sports Analytics Platform

**Sportify** ist eine moderne Progressive Web App für Sport‑Analytics und Fitness‑Tracking. Die Anwendung erlaubt das Erfassen von Workouts, die Analyse von Statistiken, den Vergleich mit Freunden sowie die langfristige Dokumentation von Fortschritten.

## Überblick

- **Workout‑Management** mit Aktivitäten, Sets und Templates
- **Übungsdatenbank** mit Filtern und Favoriten
- **Statistiken & Scoreboard**
- **Social Features** (Freunde, Feed, Reaktionen)
- **Ziele & Challenges**
- **Training Journal**
- **Benachrichtigungen & Push**
- **PWA** mit Offline‑Support
- **2FA + E‑Mail‑Verifizierung**

## Technologien

- React 18, Vite, TypeScript
- Express, PostgreSQL
- TanStack Query, Tailwind, Radix UI
- i18next, PWA

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

## Tests

```bash
npm run test
```

## Umgebungsvariablen (Auszug)

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `SMTP_*` (optional)
- `VAPID_*` (optional)

Details: [docs/development.md](docs/development.md)

## Dokumentation

- [Dokumentations-Übersicht](docs/README.md)
- [API-Dokumentation](docs/api/README.md)

## Lizenz

Siehe [LICENSE](LICENSE).
