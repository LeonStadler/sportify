# Sportify - Modern Sports Analytics Platform

**Eine moderne Webanwendung für Sport-Analytics und Fitness-Tracking**  
**A modern web application for sports analytics and fitness tracking**

Entwickelt von **Leon Stadler** | Developed by **Leon Stadler**

---

## Inhaltsverzeichnis / Table of Contents

- [Überblick / Overview](#überblick--overview)
- [Zweck & Vision / Purpose & Vision](#zweck--vision--purpose--vision)
- [Kernfunktionalität / Core Functionality](#kernfunktionalität--core-functionality)
- [Features](#features)
- [Technologien / Technologies](#technologien--technologies)
- [Voraussetzungen / Requirements](#voraussetzungen--requirements)
- [Installation](#installation)
- [Konfiguration / Configuration](#konfiguration--configuration)
- [Entwicklung / Development](#entwicklung--development)
- [API-Dokumentation / API Documentation](#api-dokumentation--api-documentation)
- [Deployment](#deployment)
- [Dokumentation / Documentation](#dokumentation--documentation)
- [Lizenz / License](#lizenz--license)

---

## Überblick / Overview

### Deutsch

**Sportify** ist eine vollständig funktionsfähige Progressive Web App (PWA) für umfassendes Sport-Analytics und Fitness-Tracking. Die Anwendung ermöglicht es Benutzern, ihre Workouts zu verfolgen, detaillierte Statistiken zu analysieren, mit Freunden zu konkurrieren und ihre Fitness-Fortschritte langfristig zu überwachen.

Die Plattform kombiniert moderne Web-Technologien mit einer benutzerfreundlichen Oberfläche, um eine nahtlose Erfahrung auf Desktop, Tablet und Mobile-Geräten zu bieten. Mit Offline-Funktionalität, mehrsprachiger Unterstützung und umfangreichen sozialen Features ist Sportify die ideale Lösung für alle, die ihre Fitness-Ziele systematisch verfolgen und erreichen möchten.

### English

**Sportify** is a fully functional Progressive Web App (PWA) for comprehensive sports analytics and fitness tracking. The application enables users to track their workouts, analyze detailed statistics, compete with friends, and monitor their fitness progress over time.

The platform combines modern web technologies with a user-friendly interface to provide a seamless experience on desktop, tablet, and mobile devices. With offline functionality, multilingual support, and extensive social features, Sportify is the ideal solution for anyone looking to systematically track and achieve their fitness goals.

---

## Zweck & Vision / Purpose & Vision

### Deutsch

**Der Zweck von Sportify** ist es, eine zentrale Plattform zu schaffen, die Sportler und Fitness-Enthusiasten dabei unterstützt:

- **Systematisches Tracking**: Alle Trainingsaktivitäten an einem Ort erfassen und verwalten
- **Datengetriebene Entscheidungen**: Durch detaillierte Statistiken und Analytics bessere Trainingsentscheidungen treffen
- **Motivation durch Community**: Durch soziale Interaktionen, Wettbewerbe und Freunde motiviert bleiben
- **Langfristige Fortschrittsverfolgung**: Entwicklung über Wochen, Monate und Jahre hinweg dokumentieren
- **Zielorientiertes Training**: Durch Ziele und Challenges strukturiert trainieren

**Die Vision** ist es, eine fuehrende source-available Loesung fuer persoenliches Fitness-Tracking zu werden, die sowohl fuer Einsteiger als auch fuer fortgeschrittene Athleten geeignet ist.

### English

**The purpose of Sportify** is to create a central platform that supports athletes and fitness enthusiasts in:

- **Systematic Tracking**: Capture and manage all training activities in one place
- **Data-Driven Decisions**: Make better training decisions through detailed statistics and analytics
- **Community Motivation**: Stay motivated through social interactions, competitions, and friends
- **Long-Term Progress Tracking**: Document development over weeks, months, and years
- **Goal-Oriented Training**: Train systematically through goals and challenges

**The vision** is to become a leading source-available solution for personal fitness tracking, suitable for both beginners and advanced athletes.

---

## Kernfunktionalität / Core Functionality

### Deutsch

Die Kernfunktionalität von Sportify umfasst folgende Hauptbereiche:

#### 1. Workout-Management

- **Erfassung von Trainingsaktivitäten**: Erstellen, bearbeiten und löschen von Workouts
- **Vielseitige Aktivitätstypen**: Unterstützung für verschiedene Sportarten (Laufen, Radfahren, Krafttraining, etc.)
- **Detaillierte Metriken**: Erfassung von Dauer, Distanz, Intensität, Kalorien und weiteren Parametern
- **Zeitstempel und Historie**: Vollständige Chronik aller Trainingsaktivitäten

#### 2. Statistiken & Analytics

- **Umfassende Auswertungen**: Detaillierte Statistiken zu Trainingsvolumen, Häufigkeit und Entwicklung
- **Interaktive Visualisierungen**: Charts und Grafiken für bessere Dateninterpretation
- **Zeitraum-Filter**: Analyse nach Wochen, Monaten oder Jahren
- **Trend-Analysen**: Erkennung von Fortschritten und Entwicklungen über die Zeit

#### 3. Soziale Interaktion

- **Freundschaftssystem**: Freunde hinzufügen, Anfragen verwalten und Profile ansehen
- **Activity Feed**: Live-Feed mit Aktivitäten von Freunden
- **Scoreboard & Rankings**: Wettbewerbe und Ranglisten nach verschiedenen Kriterien
- **Einladungssystem**: Freunde per Link einladen

#### 4. Zielsetzung & Motivation

- **Wöchentliche Ziele**: Individuelle Ziele setzen und verfolgen
- **Challenges**: Herausforderungen erstellen und teilnehmen
- **Fortschritts-Tracking**: Visuelle Darstellung des Fortschritts zu gesetzten Zielen
- **Benachrichtigungen**: Erinnerungen und Updates zu Zielen und Aktivitäten

#### 5. Training Journal

- **Tagebuch-Funktion**: Detaillierte Einträge zu Trainingseinheiten
- **Stimmungs-Tracking**: Erfassung des Wohlbefindens und der Motivation
- **Tags und Kategorien**: Organisation von Einträgen durch Tags
- **Metriken-Integration**: Verknüpfung mit Workout-Daten

#### 6. Benutzerverwaltung & Sicherheit

- **Sicheres Authentifizierungssystem**: JWT-basierte Authentifizierung
- **Zwei-Faktor-Authentifizierung (2FA)**: Zusätzliche Sicherheitsebene mit TOTP
- **E-Mail-Verifizierung**: Sichere Kontoverifizierung
- **Profil-Management**: Avatar-Upload, Einstellungen und Präferenzen
- **Admin-Panel**: Verwaltungstools für Administratoren

### English

The core functionality of Sportify includes the following main areas:

#### 1. Workout Management

- **Training Activity Recording**: Create, edit, and delete workouts
- **Versatile Activity Types**: Support for various sports (running, cycling, strength training, etc.)
- **Detailed Metrics**: Capture duration, distance, intensity, calories, and other parameters
- **Timestamps and History**: Complete chronicle of all training activities

#### 2. Statistics & Analytics

- **Comprehensive Evaluations**: Detailed statistics on training volume, frequency, and development
- **Interactive Visualizations**: Charts and graphs for better data interpretation
- **Time Period Filters**: Analysis by weeks, months, or years
- **Trend Analyses**: Recognition of progress and developments over time

#### 3. Social Interaction

- **Friendship System**: Add friends, manage requests, and view profiles
- **Activity Feed**: Live feed with activities from friends
- **Scoreboard & Rankings**: Competitions and rankings by various criteria
- **Invitation System**: Invite friends via link

#### 4. Goal Setting & Motivation

- **Weekly Goals**: Set and track individual goals
- **Challenges**: Create and participate in challenges
- **Progress Tracking**: Visual representation of progress toward set goals
- **Notifications**: Reminders and updates on goals and activities

#### 5. Training Journal

- **Diary Function**: Detailed entries on training sessions
- **Mood Tracking**: Capture well-being and motivation
- **Tags and Categories**: Organization of entries through tags
- **Metrics Integration**: Linking with workout data

#### 6. User Management & Security

- **Secure Authentication System**: JWT-based authentication
- **Two-Factor Authentication (2FA)**: Additional security layer with TOTP
- **Email Verification**: Secure account verification
- **Profile Management**: Avatar upload, settings, and preferences
- **Admin Panel**: Management tools for administrators

---

## Features

### Deutsch

#### Kernfunktionen / Core Features

- ✅ **Dashboard**: Übersichtliche Darstellung aller wichtigen Metriken, Ziele und aktuellen Aktivitäten
- ✅ **Scoreboard**: Live-Ergebnisse und Ranglisten nach Aktivitätstyp mit Zeitraum-Filtern
- ✅ **Statistiken**: Detaillierte Auswertungen mit interaktiven Charts, Filtern und Vergleichen
- ✅ **Profil**: Persönliche Einstellungen, Avatar-Upload, Konto-Verwaltung und Präferenzen
- ✅ **Training**: Vollständige Workout-Verwaltung mit CRUD-Funktionalität und Validierung
- ✅ **Training Journal**: Tagebuch für Trainingseinträge mit Tags, Stimmung und Metriken
- ✅ **Freunde**: Umfassendes Freundschaftssystem mit Anfragen, Verwaltung und Suche
- ✅ **Activity Feed**: Live-Feed mit Aktivitäten von Freunden und Interaktionsmöglichkeiten
- ✅ **Benachrichtigungen**: In-App Benachrichtigungssystem für alle wichtigen Events
- ✅ **Admin-Panel**: Benutzer- und System-Verwaltung für Administratoren

#### Technische Features / Technical Features

- ✅ **Multi-Language**: Vollständige Unterstützung für Deutsch und Englisch (i18next)
- ✅ **Dark/Light Theme**: Automatische Theme-Erkennung basierend auf System-Präferenzen und manuelle Auswahl
- ✅ **Responsive Design**: Optimiert für Desktop, Tablet und Mobile mit Touch-Gesten
- ✅ **PWA**: Service Worker, Offline-Support, Installierbarkeit, App-like Experience
- ✅ **2FA**: Zwei-Faktor-Authentifizierung mit TOTP (Time-based One-Time Password)
- ✅ **Email-Verifizierung**: E-Mail-basierte Kontoverifizierung mit sicheren Tokens
- ✅ **Passwort-Reset**: Sichere Passwort-Zurücksetzung per E-Mail mit zeitlich begrenzten Links
- ✅ **Offline-Synchronisation**: Automatische Synchronisation von Offline-Änderungen bei Verbindung

### English

#### Core Features

- ✅ **Dashboard**: Clear presentation of all important metrics, goals, and current activities
- ✅ **Scoreboard**: Live results and rankings by activity type with time period filters
- ✅ **Statistics**: Detailed evaluations with interactive charts, filters, and comparisons
- ✅ **Profile**: Personal settings, avatar upload, account management, and preferences
- ✅ **Training**: Complete workout management with CRUD functionality and validation
- ✅ **Training Journal**: Diary for training entries with tags, mood, and metrics
- ✅ **Friends**: Comprehensive friendship system with requests, management, and search
- ✅ **Activity Feed**: Live feed with activities from friends and interaction options
- ✅ **Notifications**: In-app notification system for all important events
- ✅ **Admin Panel**: User and system management for administrators

#### Technical Features

- ✅ **Multi-Language**: Full support for German and English (i18next)
- ✅ **Dark/Light Theme**: Automatic theme detection based on system preferences and manual selection
- ✅ **Responsive Design**: Optimized for desktop, tablet, and mobile with touch gestures
- ✅ **PWA**: Service Worker, offline support, installability, app-like experience
- ✅ **2FA**: Two-factor authentication with TOTP (Time-based One-Time Password)
- ✅ **Email Verification**: Email-based account verification with secure tokens
- ✅ **Password Reset**: Secure password reset via email with time-limited links
- ✅ **Offline Synchronization**: Automatic synchronization of offline changes when connected

---

## Technologien / Technologies

### Frontend

- **Framework**: React 18.3 mit TypeScript 5.5
- **Build Tool**: Vite 5.4
- **UI Library**: shadcn/ui mit Radix UI Primitives
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM v6.26
- **State Management**: TanStack Query (React Query) v5.56
- **Form Handling**: React Hook Form v7.53 mit Zod v3.23 Validation
- **Charts**: Recharts v2.12
- **Icons**: Lucide React v0.462
- **Internationalization**: i18next v23.7 mit react-i18next v13.5
- **Theme Management**: next-themes v0.3
- **Notifications**: Sonner v1.5 (Toast Notifications)

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.1
- **Datenbank**: PostgreSQL (kompatibel mit Neon, Supabase, etc.)
- **Authentifizierung**: JWT (JSON Web Tokens) mit jsonwebtoken v9.0
- **Password Hashing**: bcryptjs v3.0
- **Email**: Nodemailer v7.0 mit SMTP
- **2FA**: TOTP (Time-based One-Time Password) mit qrcode.react v4.2
- **File Upload**: Multer v2.0 für Avatar-Uploads
- **Database Client**: pg (node-postgres) v8.16

### DevOps & Tools

- **Deployment**: Vercel (Serverless Functions)
- **Version Control**: Git
- **Package Manager**: npm 10.8.2
- **Linting**: ESLint 9.9
- **Type Checking**: TypeScript 5.5
- **Testing**: Vitest 2.1 mit Testing Library
- **Code Formatting**: Prettier 3.1
- **Development Tools**: Nodemon 3.1, Concurrently 9.1

---

## Voraussetzungen / Requirements

### Deutsch

- **Node.js**: Version 18 oder höher
- **npm**: Version 10.8.2 oder höher (empfohlen)
- **PostgreSQL**: Datenbank (z.B. Neon, Supabase, oder lokal installiert)
- **SMTP-Server**: Für E-Mail-Versand (optional für lokale Entwicklung)

### English

- **Node.js**: Version 18 or higher
- **npm**: Version 10.8.2 or higher (recommended)
- **PostgreSQL**: Database (e.g., Neon, Supabase, or locally installed)
- **SMTP Server**: For email delivery (optional for local development)

---

## Installation

### 1. Repository klonen / Clone Repository

```bash
git clone <repository-url>
cd sportify
```

### 2. Dependencies installieren / Install Dependencies

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren / Configure Environment Variables

Kopiere `.env.example` zu `.env` und fülle die Werte aus:  
Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Siehe [Konfiguration](#konfiguration--configuration) für Details zu den Umgebungsvariablen.  
See [Configuration](#konfiguration--configuration) for details on environment variables.

### 4. Datenbank einrichten / Setup Database

Stelle sicher, dass deine PostgreSQL-Datenbank läuft und die Verbindungs-URL in `.env` gesetzt ist. Die Migrationen werden beim Serverstart automatisch ausgeführt.  
Make sure your PostgreSQL database is running and the connection URL is set in `.env`. Migrations are automatically executed on server start.

### 5. Entwicklungsserver starten / Start Development Server

```bash
npm run dev
```

Dies startet sowohl den Frontend- (Vite) als auch den Backend-Server (Express) gleichzeitig.  
This starts both the frontend (Vite) and backend (Express) server simultaneously.

- **Frontend**: `http://localhost:8080` (oder Port aus `FRONTEND_URL` / or port from `FRONTEND_URL`)
- **Backend**: `http://localhost:3001` (oder Port aus `PORT` / or port from `PORT`)

---

## Konfiguration / Configuration

### Umgebungsvariablen / Environment Variables

#### Backend (.env)

```bash
# Datenbank / Database
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_SSL_ENABLED=false
DATABASE_SSL_REJECT_UNAUTHORIZED=true

# Server
PORT=3001

# JWT
JWT_SECRET=your-secret-key-here

# E-Mail (SMTP) / Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@sportify.com

# Frontend URL (für E-Mail-Links / for email links)
FRONTEND_URL=http://localhost:8080
```

#### Frontend (.env)

Die Frontend-Umgebungsvariablen werden über `import.meta.env` verfügbar gemacht:  
Frontend environment variables are made available via `import.meta.env`:

```bash
VITE_API_URL=http://localhost:3001/api
```

### Datenbank-TLS-Konfiguration / Database TLS Configuration

Die PostgreSQL-Verbindung kann per Umgebungsvariablen abgesichert werden:  
The PostgreSQL connection can be secured via environment variables:

- `DATABASE_SSL_ENABLED` – aktiviert TLS für die Verbindung, Standard: `false` / enables TLS for the connection, default: `false`
- `DATABASE_SSL_REJECT_UNAUTHORIZED` – legt fest, ob Zertifikate validiert werden, Standard: `true` / determines whether certificates are validated, default: `true`

Beispiel für gehostete Datenbanken mit eigenem Zertifikat:  
Example for hosted databases with own certificate:

```bash
export DATABASE_SSL_ENABLED=true
export DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

---

## Entwicklung / Development

### Verfügbare Scripts / Available Scripts

```bash
# Entwicklung (Frontend + Backend) / Development (Frontend + Backend)
npm run dev

# Nur Frontend / Frontend only
npm run dev:frontend

# Nur Backend / Backend only
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

# Tests im Watch-Modus / Tests in watch mode
npm run test:watch

# Preview (Production Build lokal testen / test locally)
npm run preview

# Icons generieren / Generate icons
npm run generate-icons

# Formatierung / Formatting
npm run format
```

### Code-Struktur / Code Structure

Das Projekt folgt modernen React/TypeScript Best Practices:  
The project follows modern React/TypeScript best practices:

- **ESLint** für Code-Qualität / for code quality
- **TypeScript** für Type-Safety / for type safety
- **Tailwind CSS** für Styling / for styling
- **Component-basierte Architektur** / Component-based architecture
- **Responsive Design First** / Responsive design first
- **Accessibility (a11y) Standards** / Accessibility (a11y) standards

### Entwicklungshinweise / Development Notes

- Frontend und Backend laufen getrennt (Frontend: Vite Dev Server, Backend: Express)  
  Frontend and backend run separately (Frontend: Vite Dev Server, Backend: Express)
- API-Calls gehen über `VITE_API_URL` (Standard: `http://localhost:3001/api`)  
  API calls go through `VITE_API_URL` (default: `http://localhost:3001/api`)
- Hot Module Replacement (HMR) ist für Frontend aktiviert  
  Hot Module Replacement (HMR) is enabled for frontend
- Backend nutzt Nodemon für automatisches Neuladen bei Änderungen  
  Backend uses Nodemon for automatic reloading on changes

---

## API-Dokumentation / API Documentation

### Deutsch

Die vollständige API-Dokumentation befindet sich im [`docs/api/`](docs/api/) Verzeichnis. Hier eine Übersicht der verfügbaren Endpunkt-Gruppen:

#### Authentifizierung (`/api/auth`)

- Registrierung, Login, Logout
- E-Mail-Verifizierung
- Passwort-Reset
- Zwei-Faktor-Authentifizierung (2FA)

#### Workouts (`/api/workouts`)

- CRUD-Operationen für Workouts
- Workout-Liste mit Filtern
- Workout-Details und Metriken

#### Training Journal (`/api/training-journal`)

- Tagebuch-Einträge verwalten
- Tags und Kategorien
- Stimmungs-Tracking

#### Soziale Features

- **Freunde** (`/api/friends`): Freundschaftssystem, Anfragen, Suche
- **Activity Feed** (`/api/feed`): Feed mit Aktivitäten von Freunden
- **Benachrichtigungen** (`/api/notifications`): In-App Benachrichtigungen

#### Statistiken & Rankings

- **Scoreboard** (`/api/scoreboard`): Ranglisten nach Aktivitätstyp
- **Statistiken** (`/api/stats`): Detaillierte Auswertungen und Charts

#### Weitere Endpunkte

- **Profil** (`/api/profile`): Profil-Verwaltung und Einstellungen
- **Ziele** (`/api/goals`): Wöchentliche Ziele
- **Challenges** (`/api/challenges`): Herausforderungen
- **Benutzer** (`/api/users`): Benutzer-Suche
- **Admin** (`/api/admin`): Admin-Funktionen

Für detaillierte Informationen zu Request/Response-Formaten, Authentifizierung und Beispielen siehe die [vollständige API-Dokumentation](docs/api/README.md).

### English

The complete API documentation is located in the [`docs/api/`](docs/api/) directory. Here is an overview of available endpoint groups:

#### Authentication (`/api/auth`)

- Registration, Login, Logout
- Email Verification
- Password Reset
- Two-Factor Authentication (2FA)

#### Workouts (`/api/workouts`)

- CRUD operations for workouts
- Workout list with filters
- Workout details and metrics

#### Training Journal (`/api/training-journal`)

- Manage diary entries
- Tags and categories
- Mood tracking

#### Social Features

- **Friends** (`/api/friends`): Friendship system, requests, search
- **Activity Feed** (`/api/feed`): Feed with activities from friends
- **Notifications** (`/api/notifications`): In-app notifications

#### Statistics & Rankings

- **Scoreboard** (`/api/scoreboard`): Rankings by activity type
- **Statistics** (`/api/stats`): Detailed evaluations and charts

#### Additional Endpoints

- **Profile** (`/api/profile`): Profile management and settings
- **Goals** (`/api/goals`): Weekly goals
- **Challenges** (`/api/challenges`): Challenges
- **Users** (`/api/users`): User search
- **Admin** (`/api/admin`): Admin functions

For detailed information on request/response formats, authentication, and examples, see the [complete API documentation](docs/api/README.md).

---

## Deployment

### Vercel Deployment

Die Anwendung ist für Vercel optimiert:  
The application is optimized for Vercel:

1. **Vercel CLI** installieren / Install Vercel CLI:

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

### Umgebungsvariablen auf Vercel / Environment Variables on Vercel

Stelle sicher, dass alle erforderlichen Umgebungsvariablen in den Vercel-Projekteinstellungen gesetzt sind:  
Make sure all required environment variables are set in the Vercel project settings:

- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `FRONTEND_URL`
- `VITE_API_URL`

### Datenbank-Migrationen / Database Migrations

Migrationen sollen beim Deploy durch die Pipeline laufen. Cold-Start-Migrationen sind standardmäßig AUS; bei Bedarf aktivieren mit `RUN_MIGRATIONS_ON_LOAD=true`.  
Migrations are expected to run during deploy. Cold-start migrations are OFF by default; enable with `RUN_MIGRATIONS_ON_LOAD=true` if needed.

Status kann fuer die aktuelle Serverless-Instanz ueber `GET /api/health/migrations` geprueft werden (zeigt `ok`/`pending`).  
Status for the current serverless instance can be checked via `GET /api/health/migrations` (shows `ok`/`pending`).

Siehe [`docs/deployment.md`](docs/deployment.md) für detaillierte Anleitung.  
See [`docs/deployment.md`](docs/deployment.md) for detailed instructions.

---

## Dokumentation / Documentation

### Deutsch

Vollständige Dokumentation ist im [`docs/`](docs/) Ordner verfügbar:

- **[Dokumentations-Übersicht](docs/README.md)** - Übersicht über alle verfügbaren Dokumentationen
- **[Architektur](docs/architecture.md)** - Systemarchitektur und Design-Entscheidungen
- **[Entwicklung](docs/development.md)** - Entwicklungshinweise und Best Practices
- **[Deployment](docs/deployment.md)** - Deployment-Anleitung für verschiedene Plattformen
- **[Datenbank](docs/database.md)** - Datenbank-Schema, Migrationen und Datenmodell
- **[Frontend](docs/frontend.md)** - Frontend-Struktur, Komponenten und Patterns
- **[Backend](docs/backend.md)** - Backend-Struktur, Services und API-Design
- **[PWA](docs/pwa.md)** - PWA-Features und Implementierung
- **[API-Dokumentation](docs/api/)** - Vollständige API-Dokumentation mit allen Endpunkten

### English

Complete documentation is available in the [`docs/`](docs/) folder:

- **[Documentation Overview](docs/README.md)** - Overview of all available documentation
- **[Architecture](docs/architecture.md)** - System architecture and design decisions
- **[Development](docs/development.md)** - Development guidelines and best practices
- **[Deployment](docs/deployment.md)** - Deployment guide for various platforms
- **[Database](docs/database.md)** - Database schema, migrations, and data model
- **[Frontend](docs/frontend.md)** - Frontend structure, components, and patterns
- **[Backend](docs/backend.md)** - Backend structure, services, and API design
- **[PWA](docs/pwa.md)** - PWA features and implementation
- **[API Documentation](docs/api/)** - Complete API documentation with all endpoints

---

## Lizenz / License

Dieses Projekt ist source-available (nicht Open Source). Private, nicht-kommerzielle Nutzung ist erlaubt. Jede Weitergabe oder oeffentliche Bereitstellung (Hosting/SaaS) ist nur mit schriftlicher Genehmigung erlaubt und erfordert Namensnennung im Frontend sowie im oeffentlichen Repo. Details: siehe `LICENSE`. Genehmigungen: sportify@leon-stadler.com.  
This project is source-available (not open source). Private, non-commercial use is allowed. Any distribution or public availability (hosting/SaaS) requires written permission and attribution in the frontend and the public repo. See `LICENSE` for details. Permission requests: sportify@leon-stadler.com.  
Beitraege werden derzeit nicht angenommen. Contributions are not accepted at this time.

---

**Entwickelt mit Leidenschaft für moderne Web-Entwicklung und Sports Analytics** 🏃‍♂️⚽📊  
**Developed with passion for modern web development and sports analytics** 🏃‍♂️⚽📊
