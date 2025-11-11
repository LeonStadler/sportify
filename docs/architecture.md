# Architektur

Diese Dokumentation beschreibt die Systemarchitektur von Sportify.

## Übersicht

Sportify ist eine moderne Full-Stack-Webanwendung mit folgender Architektur:

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │
│   (Express)     │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Neon)        │
└─────────────────┘
```

## Frontend-Architektur

### Technologie-Stack

- **React 18**: UI-Framework mit Hooks und Context API
- **TypeScript**: Type-Safety und bessere Entwicklererfahrung
- **Vite**: Schneller Build-Tool und Dev-Server
- **React Router**: Client-seitiges Routing
- **TanStack Query**: Server-State-Management und Caching
- **shadcn/ui**: UI-Komponenten-Bibliothek
- **Tailwind CSS**: Utility-First CSS-Framework

### Struktur

```
src/
├── components/     # Wiederverwendbare Komponenten
├── pages/          # Seiten-Komponenten
├── hooks/          # Custom Hooks
├── contexts/       # React Contexts
├── lib/            # Utility-Funktionen
├── types/          # TypeScript-Typen
└── utils/          # Frontend-Utilities
```

### State Management

- **React Context**: Für globale Auth-State
- **TanStack Query**: Für Server-State (API-Daten)
- **Local State**: useState/useReducer für Komponenten-State

### Routing

- **Public Routes**: Landing, Login, Register, etc.
- **Protected Routes**: Dashboard, Profile, Training, etc.
- **Admin Routes**: Admin-Panel (nur für Admins)

## Backend-Architektur

### Technologie-Stack

- **Node.js**: JavaScript-Runtime
- **Express.js**: Web-Framework
- **PostgreSQL**: Relationale Datenbank
- **JWT**: Authentifizierung
- **bcryptjs**: Password Hashing
- **Nodemailer**: E-Mail-Versand

### Struktur

```
backend/
├── routes/         # Route Handler
├── middleware/     # Express Middleware
├── services/       # Business Logic
├── db/             # Datenbank-Logik
├── utils/          # Utility-Funktionen
└── migrations/     # Datenbank-Migrationen
```

### API-Design

- **RESTful**: Standard HTTP-Methoden (GET, POST, PUT, DELETE)
- **JSON**: Datenformat für Request/Response
- **JWT**: Token-basierte Authentifizierung
- **camelCase**: Response-Daten werden automatisch konvertiert

### Middleware-Pipeline

1. **CORS**: Cross-Origin Resource Sharing
2. **JSON Parser**: Request Body Parsing
3. **Auth Middleware**: JWT-Verifizierung
4. **Admin Middleware**: Admin-Rechte-Prüfung (optional)
5. **Route Handler**: Business Logic

## Datenbank-Architektur

### Schema-Übersicht

Haupttabellen:

- `users`: Benutzer-Daten
- `workouts`: Workout-Einträge
- `workout_activities`: Aktivitäten innerhalb eines Workouts
- `exercises`: Übungstypen
- `training_journal_entries`: Trainingstagebuch-Einträge
- `friendships`: Freundschaften
- `friend_requests`: Freundschaftsanfragen
- `invitations`: Einladungen
- `notifications`: Benachrichtigungen

### Beziehungen

- **One-to-Many**: User → Workouts, User → Training Journal Entries
- **Many-to-Many**: Users ↔ Friendships
- **Cascade Delete**: Beim Löschen eines Users werden alle zugehörigen Daten gelöscht

Siehe [Datenbank-Dokumentation](database.md) für Details.

## Sicherheit

### Authentifizierung

- **JWT Tokens**: Stateless Authentifizierung
- **Password Hashing**: bcryptjs mit Salt
- **2FA**: TOTP-basierte Zwei-Faktor-Authentifizierung
- **Email Verification**: E-Mail-basierte Kontoverifizierung

### Autorisierung

- **Role-based**: User vs. Admin
- **Resource-based**: Benutzer können nur eigene Ressourcen verwalten
- **Middleware**: Auth- und Admin-Middleware für Route-Schutz

### Datenvalidierung

- **Backend**: Input-Validierung in Route Handlern
- **Frontend**: Zod-Schemas für Form-Validierung
- **SQL Injection**: Parameterized Queries
- **XSS**: Content Security Policy Headers

## Performance

### Frontend

- **Code Splitting**: Route-based Lazy Loading
- **Tree Shaking**: Unused Code Elimination
- **Asset Optimization**: Vite Build-Optimierungen
- **Caching**: Service Worker für Offline-Support

### Backend

- **Connection Pooling**: PostgreSQL Connection Pool
- **Query Optimization**: Indizierte Datenbankabfragen
- **Caching**: React Query für API-Response-Caching

## Skalierung

### Horizontal Scaling

- **Stateless Backend**: JWT-basierte Authentifizierung ermöglicht Load Balancing
- **Database**: PostgreSQL kann mit Read Replicas skaliert werden
- **CDN**: Statische Assets können über CDN ausgeliefert werden

### Vertical Scaling

- **Connection Pool**: Anpassbare Pool-Größe
- **Caching**: Erweiterte Caching-Strategien möglich

## Deployment

### Vercel

- **Serverless Functions**: Backend als Serverless Functions
- **Static Assets**: Frontend als statische Dateien
- **Automatic Deployments**: Git-basierte Deployments

Siehe [Deployment-Dokumentation](deployment.md) für Details.

## Monitoring & Logging

### Development

- **Console Logs**: Entwicklungs-Logs im Terminal
- **Error Boundaries**: React Error Boundaries für Frontend-Fehler

### Production

- **Vercel Logs**: Automatische Logs auf Vercel
- **Error Tracking**: (Optional) Integration mit Sentry oder ähnlich

## Zukünftige Verbesserungen

- [ ] Real-time Updates mit WebSockets
- [ ] Erweiterte Caching-Strategien
- [ ] Performance-Monitoring
- [ ] Error Tracking Integration
- [ ] API Rate Limiting
- [ ] GraphQL API (optional)

