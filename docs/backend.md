# Backend

Diese Dokumentation beschreibt die Backend-Struktur, Services und API-Design von Sportify.

## Struktur

```
backend/
├── routes/              # Express Route Handler
├── middleware/          # Express Middleware
├── services/           # Business Logic Services
├── db/                 # Datenbank-Logik
├── utils/              # Utility-Funktionen
└── migrations/         # SQL-Migrationsdateien
```

## Routes

### Route-Struktur

Jede Route-Datei exportiert eine Factory-Funktion:

```javascript
export const createMyRouter = (pool) => {
  const router = express.Router();
  
  router.get('/', authMiddleware, async (req, res) => {
    // Handler
  });
  
  return router;
};
```

### Verfügbare Routes

- `auth.routes.js`: Authentifizierung
- `workouts.routes.js`: Workout-Management
- `profile.routes.js`: Profil-Verwaltung
- `friends.routes.js`: Freundschaftssystem
- `feed.routes.js`: Activity Feed
- `scoreboard.routes.js`: Ranglisten
- `stats.routes.js`: Statistiken
- `training-journal.routes.js`: Trainingstagebuch
- `goals.routes.js`: Ziele
- `challenges.routes.js`: Challenges
- `notifications.routes.js`: Benachrichtigungen
- `users.routes.js`: Benutzer-Suche
- `admin.routes.js`: Admin-Funktionen
- `contact.routes.js`: Kontaktformular

## Middleware

### authMiddleware

JWT-Token-Verifizierung:

```javascript
import authMiddleware from './middleware/authMiddleware.js';

router.get('/protected', authMiddleware, handler);
```

Setzt `req.user` mit `{ id: userId }`.

### adminMiddleware

Admin-Rechte-Prüfung:

```javascript
import { createAdminMiddleware } from './middleware/adminMiddleware.js';

const adminMiddleware = createAdminMiddleware(pool);
router.get('/admin', authMiddleware, adminMiddleware, handler);
```

## Services

### emailService

E-Mail-Versand:

```javascript
import { queueEmail } from './services/emailService.js';

await queueEmail(pool, {
  recipient: 'user@example.com',
  subject: 'Subject',
  body: 'Body',
  html: '<html>...</html>'
});
```

### tokenService

Token-Management:

```javascript
import {
  createEmailVerificationToken,
  validateEmailVerificationToken,
  markEmailVerificationTokenUsed
} from './services/tokenService.js';
```

### invitationService

Einladungs-Management:

```javascript
import { createInvitation } from './services/invitationService.js';

const invitation = await createInvitation(pool, {
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  invitedBy: userId
});
```

### eventService

Zeitgesteuerte Auswertungen für Wochen- und Monatsziele:

- `processWeeklyEvents` aggregiert Workouts, vergibt Badges/Awards und schreibt Leaderboard-Ränge.
- `processMonthlyEvents` prüft Monats-Challenges und vergibt Monatsabzeichen.
- Trigger werden im Free-Plan per **GitHub Actions** ausgelöst (`.github/workflows/events-scheduler.yml`). Der Workflow ruft die API-Endpunkte mit einem Bearer-Token (`EVENTS_CRON_SECRET`) auf und ersetzt damit die Vercel-Crons.
- Zeitzone: per `EVENTS_UTC_OFFSET_MINUTES` (Default `0`) lässt sich der Auswertungszeitpunkt vom UTC-Cron/Scheduler entkoppeln.

Zusätzliche Tabellen: `weekly_results`, `monthly_results`, `leaderboard_results`, `awards`, `user_badges`, `notifications`, `email_queue`, `push_subscriptions`.

## Datenbank

### Connection Pool

```javascript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### Queries

Parameterized Queries für SQL Injection-Schutz:

```javascript
const { rows } = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### camelCase Konvertierung

Automatische Konvertierung von snake_case zu camelCase:

```javascript
import { toCamelCase } from './utils/helpers.js';

const user = toCamelCase(rows[0]);
```

## API-Design

### RESTful Endpoints

- `GET /api/resource`: Liste abrufen
- `GET /api/resource/:id`: Einzelnes Item abrufen
- `POST /api/resource`: Neues Item erstellen
- `PUT /api/resource/:id`: Item aktualisieren
- `DELETE /api/resource/:id`: Item löschen

### Response-Format

Erfolg:
```json
{
  "data": { ... },
  "message": "Success"
}
```

Fehler:
```json
{
  "error": "Error message",
  "status": 400
}
```

### Error Handling

```javascript
try {
  // Logic
  res.json({ data: result });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

## Authentifizierung

### JWT Tokens

Token-Generierung:

```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

Token-Verifizierung:

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { id: decoded.userId };
```

### 2FA (TOTP)

TOTP-Generierung und -Verifizierung:

```javascript
import {
  generateTotpSecret,
  verifyTotpToken,
  buildOtpAuthUrl
} from './utils/helpers.js';
```

## Validierung

### Input-Validierung

```javascript
import { ValidationError } from './utils/helpers.js';

if (!email || !email.includes('@')) {
  throw new ValidationError('Invalid email');
}
```

### Helper-Funktionen

- `parsePaginationParams`: Pagination-Parameter
- `normalizeEntryDate`: Datum-Normalisierung
- `sanitizeMetricsPayload`: Metriken-Bereinigung
- `parseJournalTags`: Tag-Parsing

## CORS

CORS-Konfiguration:

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    // Origin-Validierung
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};
```

## Rate Limiting

Rate Limiter für bestimmte Endpunkte:

```javascript
import { createRateLimiter } from './utils/helpers.js';

const rateLimiter = createRateLimiter({ windowMs: 60000, max: 10 });

if (!rateLimiter(key).allowed) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

## Logging

### Console Logs

```javascript
console.log('Info message');
console.error('Error message');
console.warn('Warning message');
```

### Structured Logging (Optional)

Für Production könnte strukturiertes Logging integriert werden (z.B. Winston, Pino).

## Testing

### Test-Struktur

Tests in `tests/`:

- `authAdmin.test.js`: Auth und Admin Tests
- `friends.test.js`: Freundschafts-Tests
- `migrations-runner.test.js`: Migration-Tests

### Test-Datenbank

```javascript
import { createTestDatabase } from './tests/helpers/test-database.js';

const pool = await createTestDatabase();
```

## Performance

### Connection Pooling

Optimierte Pool-Größe für Serverless:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Anpassbar
  idleTimeoutMillis: 30000
});
```

### Query Optimization

- Indizierte Spalten verwenden
- `EXPLAIN ANALYZE` für Query-Analyse
- Vermeide N+1 Queries

## Sicherheit

### SQL Injection

Immer parameterized queries verwenden:

```javascript
// ✅ Gut
await pool.query('SELECT * FROM users WHERE id = $1', [id]);

// ❌ Schlecht
await pool.query(`SELECT * FROM users WHERE id = ${id}`);
```

### Password Hashing

```javascript
import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hash);
```

### Input Sanitization

- Validierung aller Inputs
- SQL-Escape für dynamische Queries
- XSS-Prevention durch JSON-Responses

## Deployment

### Serverless Functions (Vercel)

Entry Point: `api/index.js`

```javascript
import app from '../server.js';
export default app;
```

### Environment Variables

Alle Secrets über Umgebungsvariablen:

- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_*`
- `FRONTEND_URL`

## Troubleshooting

### Datenbank-Verbindung

- Prüfe `DATABASE_URL` Format
- Prüfe SSL-Einstellungen
- Prüfe Firewall-Regeln

### Migration-Fehler

- Prüfe Migration-Logs
- Prüfe Datenbank-Zugriffsrechte
- Prüfe Migration-Reihenfolge

### Performance-Probleme

- Prüfe Query-Performance
- Prüfe Connection Pool
- Prüfe Indizes

