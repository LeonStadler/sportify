---
title: "E-Mail-System Architektur"
---

# E-Mail-System Architektur

## 🏗️ Überblick

Das Sportify E-Mail-System ist modular aufgebaut und verwendet eine klare Trennung zwischen Services, Templates und Konfiguration.

## 📁 Komponenten

### Core Services

#### `services/emailService.js`
```javascript
// Haupt-E-Mail-Service
- sendEmail()           // Direkter SMTP-Versand
- queueEmail()          // Versand mit Datenbank-Logging
- testSMTPConnection()  // Verbindungstest
```

#### `utils/emailTemplates.js`
```javascript
// Template-Engine
- createEmailTemplate()     // Basis-Template mit Header/Footer
- createActionEmail()       // E-Mails mit Call-to-Action Button
- createSimpleEmail()       // Einfache Text-E-Mails
- createSuccessEmail()      // Erfolgs-Benachrichtigungen
```

### Route Handler

#### `routes/auth.routes.js`
```javascript
// Authentifizierungs-E-Mails
- POST /api/auth/register          // E-Mail-Verifikation
- POST /api/auth/forgot-password   // Passwort-Reset
- POST /api/auth/resend-verification // Verifikation erneut senden
```

#### `routes/profile.routes.js`
```javascript
// Profil-E-Mails
- POST /api/profile/invitations/:id/resend  // Einladung erneut senden
```

### Test System

#### `test-email.js`
```bash
# Kommandozeilen-Tool für E-Mail-Tests
node test-email.js <email> [type]
```

## 🔄 Datenfluss

```
1. User-Action (Registrierung, Passwort-Reset, etc.)
   ↓
2. Route Handler ruft E-Mail-Service auf
   ↓
3. E-Mail-Service validiert und bereitet vor
   ↓
4. Template-Engine generiert HTML + Text
   ↓
5. SMTP-Client sendet E-Mail
   ↓
6. Datenbank loggt Versand
   ↓
7. User erhält E-Mail
```

## 🗂️ Dateistruktur

```
services/
├── emailService.js          # SMTP-Handling & Queue
└── tokenService.js          # Token-Generierung & Validierung

utils/
├── emailTemplates.js        # HTML-Template-Engine
└── helpers.js               # sendPasswordResetEmail()

routes/
├── auth.routes.js           # Auth-E-Mails
└── profile.routes.js        # Profil-E-Mails

docs/email/
├── README.md
├── architecture.md          # Diese Datei
├── templates.md
├── email-types.md
├── testing.md
├── configuration.md
└── troubleshooting.md
```

## 🔒 Sicherheit

### Token-System
- **Composite Tokens**: `ID:RAW_TOKEN` Format
- **Expiration**: 24h (Verifikation), 1h (Passwort-Reset), 7d (Einladungen)
- **Hashing**: bcrypt für Token-Speicherung
- **Single-Use**: Tokens werden nach Verwendung invalidiert

### SMTP-Sicherheit
- **TLS/SSL**: Erforderlich für sichere Übertragung
- **Authentifizierung**: SMTP_USER + SMTP_PASSWORD
- **Logging**: Alle Versendungen werden protokolliert
- **Rate Limiting**: Durch SMTP-Provider implementiert

### Content Security
- **HTML Sanitization**: Inline-Styles statt externer CSS
- **URL Encoding**: Sichere Parameter-Übertragung
- **Input Validation**: E-Mail-Format und Token-Validierung

## 📊 Monitoring

### Datenbank-Tabellen
```sql
-- Versendete E-Mails
CREATE TABLE outbound_emails (
  id SERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- E-Mail-Verifikation
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passwort-Reset
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Freundschaftseinladungen
CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  invitation_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Logging
- **SMTP-Logs**: Verbindung, Versand-Status, Message-IDs
- **Application-Logs**: Token-Generierung, Validierung, Fehler
- **Database-Logs**: Alle E-Mail-Versendungen mit Timestamps

## 🚀 Performance

### Optimierungen
- **Template-Caching**: HTML-Templates werden einmal kompiliert
- **Connection-Pooling**: SMTP-Verbindungen werden wiederverwendet
- **Async Processing**: E-Mail-Versand blockiert nicht die UI
- **Queue-System**: E-Mails werden asynchron verarbeitet

### Limits & Quotas
- **SMTP-Provider Limits**: Respektiert Rate-Limits
- **Database Cleanup**: Alte Tokens werden automatisch bereinigt
- **Error Handling**: Robuste Fehlerbehandlung bei SMTP-Ausfällen

## 🔧 Wartung

### Regelmäßige Aufgaben
- **Token Cleanup**: Alte, ungenutzte Tokens entfernen
- **Log Rotation**: E-Mail-Logs archivieren
- **SMTP Monitoring**: Verbindung und Versand-Raten überwachen
- **Template Updates**: Design und Branding aktualisieren

### Backup & Recovery
- **Database Backups**: Alle Token-Tabellen sichern
- **Configuration Backup**: SMTP-Einstellungen dokumentieren
- **Log Archiving**: Versand-Historie aufbewahren