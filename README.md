# Sportify - Modern Sports Analytics Platform

Eine moderne Webanwendung für Sport-Analytics und Fitness-Tracking, entwickelt von **Leon Stadler**.

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Features](#features)
- [Technologien](#technologien)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Entwicklung](#entwicklung)
- [Projektstruktur](#projektstruktur)
- [API-Dokumentation](#api-dokumentation)
- [Deployment](#deployment)
- [Dokumentation](#dokumentation)
- [Lizenz](#lizenz)

## Überblick

Sportify ist eine vollständig funktionsfähige Progressive Web App (PWA) für Sport-Analytics und Fitness-Tracking. Die Anwendung ermöglicht es Benutzern, ihre Workouts zu verfolgen, Statistiken zu analysieren, mit Freunden zu konkurrieren und ihre Fitness-Fortschritte zu überwachen.

### Hauptfunktionen

- **Workout-Tracking**: Erfassung und Verwaltung von Trainingsaktivitäten
- **Statistiken & Analytics**: Detaillierte Auswertungen und Trends
- **Scoreboard**: Ranglisten und Wettbewerbe mit Freunden
- **Soziale Features**: Freundschaftssystem, Activity Feed, Einladungen
- **Training Journal**: Tagebuch für Trainingseinträge mit Stimmung und Metriken
- **Ziele & Challenges**: Wöchentliche Ziele und Herausforderungen
- **PWA**: Offline-Funktionalität, Installierbarkeit, Service Worker

## Features

### Kernfunktionen

- ✅ **Dashboard**: Übersichtliche Darstellung aller wichtigen Metriken
- ✅ **Scoreboard**: Live-Ergebnisse und Ranglisten nach Aktivitätstyp
- ✅ **Statistiken**: Detaillierte Auswertungen mit Charts und Filtern
- ✅ **Profil**: Persönliche Einstellungen, Avatar-Upload, Konto-Verwaltung
- ✅ **Training**: Workout-Verwaltung mit CRUD-Funktionalität
- ✅ **Training Journal**: Tagebuch für Trainingseinträge mit Tags und Metriken
- ✅ **Freunde**: Freundschaftssystem mit Anfragen und Verwaltung
- ✅ **Activity Feed**: Feed mit Aktivitäten von Freunden
- ✅ **Benachrichtigungen**: In-App Benachrichtigungssystem
- ✅ **Admin-Panel**: Benutzer- und Übungsverwaltung für Administratoren

### Technische Features

- ✅ **Multi-Language**: Vollständige Unterstützung für Deutsch und Englisch (i18next)
- ✅ **Dark/Light Theme**: Automatische Theme-Erkennung und manuelle Auswahl
- ✅ **Responsive Design**: Optimiert für Desktop, Tablet und Mobile
- ✅ **PWA**: Service Worker, Offline-Support, Installierbarkeit
- ✅ **2FA**: Zwei-Faktor-Authentifizierung mit TOTP
- ✅ **Email-Verifizierung**: E-Mail-basierte Kontoverifizierung
- ✅ **Passwort-Reset**: Sichere Passwort-Zurücksetzung per E-Mail

## Technologien

### Frontend

- **Framework**: React 18 mit TypeScript
- **Build Tool**: Vite 5
- **UI Library**: shadcn/ui mit Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form mit Zod Validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Internationalization**: i18next
- **Theme**: next-themes

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Datenbank**: PostgreSQL (Neon)
- **Authentifizierung**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer mit SMTP
- **2FA**: TOTP (Time-based One-Time Password)

### DevOps & Tools

- **Deployment**: Vercel
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Testing**: Vitest

## Voraussetzungen

- **Node.js**: Version 18 oder höher
- **npm**: Version 10.8.2 oder höher (empfohlen)
- **PostgreSQL**: Datenbank (z.B. Neon, Supabase, oder lokal)
- **SMTP-Server**: Für E-Mail-Versand (optional für Entwicklung)

## Installation

### 1. Repository klonen

```bash
git clone <repository-url>
cd sportify
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env` und fülle die Werte aus:

```bash
cp .env.example .env
```

Siehe [Konfiguration](#konfiguration) für Details zu den Umgebungsvariablen.

### 4. Datenbank einrichten

Stelle sicher, dass deine PostgreSQL-Datenbank läuft und die Verbindungs-URL in `.env` gesetzt ist. Die Migrationen werden beim Serverstart automatisch ausgeführt.

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Dies startet sowohl den Frontend- (Vite) als auch den Backend-Server (Express) gleichzeitig.

- **Frontend**: `http://localhost:8080` (oder Port aus `FRONTEND_URL`)
- **Backend**: `http://localhost:3001` (oder Port aus `PORT`)

## Konfiguration

### Umgebungsvariablen

#### Backend (.env)

```bash
# Datenbank
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_SSL_ENABLED=false
DATABASE_SSL_REJECT_UNAUTHORIZED=true

# Server
PORT=3001

# JWT
JWT_SECRET=your-secret-key-here

# E-Mail (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@sportify.com

# Frontend URL (für E-Mail-Links)
FRONTEND_URL=http://localhost:8080
```

#### Frontend (.env)

Die Frontend-Umgebungsvariablen werden über `import.meta.env` verfügbar gemacht:

```bash
VITE_API_URL=http://localhost:3001/api
```

### Datenbank-TLS-Konfiguration

Die PostgreSQL-Verbindung kann per Umgebungsvariablen abgesichert werden:

- `DATABASE_SSL_ENABLED` – aktiviert TLS für die Verbindung, Standard: `false`
- `DATABASE_SSL_REJECT_UNAUTHORIZED` – legt fest, ob Zertifikate validiert werden, Standard: `true`

Beispiel für gehostete Datenbanken mit eigenem Zertifikat:

```bash
export DATABASE_SSL_ENABLED=true
export DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## Entwicklung

### Verfügbare Scripts

```bash
# Entwicklung (Frontend + Backend)
npm run dev

# Nur Frontend
npm run dev:frontend

# Nur Backend
npm run dev:backend

# Production Build
npm run build

# Development Build
npm run build:dev

# Linting
npm run lint

# Type-Checking
npm run type-check

# Tests
npm run test

# Tests im Watch-Modus
npm run test:watch

# Preview (Production Build lokal testen)
npm run preview

# Icons generieren
npm run generate-icons

# Formatierung
npm run format
```

### Code-Struktur

Das Projekt folgt modernen React/TypeScript Best Practices:

- **ESLint** für Code-Qualität
- **TypeScript** für Type-Safety
- **Tailwind CSS** für Styling
- **Component-basierte Architektur**
- **Responsive Design First**
- **Accessibility (a11y) Standards**

### Entwicklungshinweise

- Frontend und Backend laufen getrennt (Frontend: Vite Dev Server, Backend: Express)
- API-Calls gehen über `VITE_API_URL` (Standard: `http://localhost:3001/api`)
- Hot Module Replacement (HMR) ist für Frontend aktiviert
- Backend nutzt Nodemon für automatisches Neuladen bei Änderungen

## Projektstruktur

```
sportify/
├── api/                    # Vercel Serverless Function Entry Point
├── config/                 # Backend-Konfiguration
│   └── contactInfo.js
├── db/                     # Datenbank-Logik
│   ├── migrations.js       # Migration-Runner
│   └── scripts/           # SQL-Utility-Skripte
├── docs/                   # Dokumentation
│   ├── api/                # API-Dokumentation
│   ├── architecture.md
│   ├── backend.md
│   ├── database.md
│   ├── deployment.md
│   ├── development.md
│   ├── frontend.md
│   └── pwa.md
├── middleware/             # Express Middleware
│   ├── adminMiddleware.js
│   └── authMiddleware.js
├── migrations/             # SQL-Migrationsdateien
│   ├── 001_initial_schema.sql
│   └── ...
├── public/                 # Statische Assets
│   ├── fonts/
│   ├── icons/
│   ├── sw.js              # Service Worker
│   └── offline.html
├── routes/                 # Express Route Handler
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── challenges.routes.js
│   ├── contact.routes.js
│   ├── feed.routes.js
│   ├── friends.routes.js
│   ├── goals.routes.js
│   ├── notifications.routes.js
│   ├── profile.routes.js
│   ├── recent-workouts.routes.js
│   ├── scoreboard.routes.js
│   ├── stats.routes.js
│   ├── training-journal.routes.js
│   ├── users.routes.js
│   └── workouts.routes.js
├── scripts/                # Utility-Skripte
│   └── generate-icons.js
├── services/                # Backend-Services
│   ├── emailService.js
│   ├── invitationService.js
│   └── tokenService.js
├── src/                     # Frontend-Quellcode
│   ├── components/          # React-Komponenten
│   │   ├── ui/             # shadcn/ui Basis-Komponenten
│   │   ├── auth/
│   │   └── ...
│   ├── config/             # Frontend-Konfiguration
│   ├── contexts/           # React Contexts
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Utility-Funktionen
│   ├── pages/              # Seiten-Komponenten
│   ├── types/              # TypeScript-Typen
│   └── utils/              # Frontend-Utilities
├── tests/                   # Tests
├── utils/                   # Backend-Utilities
├── server.js               # Express Server Entry Point
├── vercel.json             # Vercel-Konfiguration
└── vite.config.ts          # Vite-Konfiguration
```

## API-Dokumentation

Die API-Dokumentation ist in `docs/api/` verfügbar. Eine Übersicht der verfügbaren Endpunkte:

### Authentifizierung (`/api/auth`)

- `POST /api/auth/register` - Registrierung
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Aktueller Benutzer
- `POST /api/auth/verify-email` - E-Mail verifizieren
- `POST /api/auth/forgot-password` - Passwort-Reset anfordern
- `POST /api/auth/confirm-reset-password` - Passwort zurücksetzen
- `POST /api/auth/enable-2fa` - 2FA aktivieren
- `POST /api/auth/verify-2fa` - 2FA verifizieren
- `POST /api/auth/disable-2fa` - 2FA deaktivieren

### Workouts (`/api/workouts`)

- `GET /api/workouts` - Workouts auflisten
- `POST /api/workouts` - Workout erstellen
- `GET /api/workouts/:id` - Workout abrufen
- `PUT /api/workouts/:id` - Workout aktualisieren
- `DELETE /api/workouts/:id` - Workout löschen

### Training Journal (`/api/training-journal`)

- `GET /api/training-journal` - Einträge auflisten
- `POST /api/training-journal` - Eintrag erstellen
- `GET /api/training-journal/:id` - Eintrag abrufen
- `PUT /api/training-journal/:id` - Eintrag aktualisieren
- `DELETE /api/training-journal/:id` - Eintrag löschen

### Weitere Endpunkte

- `/api/profile` - Profil-Verwaltung
- `/api/friends` - Freundschaftssystem
- `/api/feed` - Activity Feed
- `/api/scoreboard` - Ranglisten
- `/api/stats` - Statistiken
- `/api/goals` - Ziele
- `/api/challenges` - Challenges
- `/api/notifications` - Benachrichtigungen
- `/api/users` - Benutzer-Suche
- `/api/admin` - Admin-Funktionen

Siehe `docs/api/` für detaillierte Dokumentation.

## Deployment

### Vercel Deployment

Die Anwendung ist für Vercel optimiert:

1. **Vercel CLI** installieren:
   ```bash
   npm i -g vercel
   ```

2. **Deployment**:
   ```bash
   vercel
   ```

3. **Production Deployment**:
   ```bash
   vercel --prod
   ```

### Umgebungsvariablen auf Vercel

Stelle sicher, dass alle erforderlichen Umgebungsvariablen in den Vercel-Projekteinstellungen gesetzt sind:

- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `FRONTEND_URL`
- `VITE_API_URL`

### Datenbank-Migrationen

Migrationen werden automatisch beim Serverstart ausgeführt. Auf Vercel werden sie beim ersten Request ausgeführt.

Siehe `docs/deployment.md` für detaillierte Anleitung.

## Dokumentation

Vollständige Dokumentation ist im `docs/` Ordner verfügbar:

- **[Architektur](docs/architecture.md)** - Systemarchitektur und Design-Entscheidungen
- **[Entwicklung](docs/development.md)** - Entwicklungshinweise und Best Practices
- **[Deployment](docs/deployment.md)** - Deployment-Anleitung
- **[Datenbank](docs/database.md)** - Datenbank-Schema und Migrationen
- **[Frontend](docs/frontend.md)** - Frontend-Struktur und Komponenten
- **[Backend](docs/backend.md)** - Backend-Struktur und Services
- **[PWA](docs/pwa.md)** - PWA-Features und Implementierung
- **[API](docs/api/)** - API-Dokumentation

## Lizenz

Alle Rechte vorbehalten - Leon Stadler

---

**Entwickelt mit Leidenschaft für moderne Web-Entwicklung und Sports Analytics** 🏃‍♂️⚽📊
