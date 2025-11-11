# Authentication API

API-Endpunkte für Authentifizierung, Registrierung und Benutzerverwaltung.

## Endpunkte

### POST /api/auth/register

Registriert einen neuen Benutzer.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "nickname": "johndoe",
  "displayPreference": "firstName",
  "invitationToken": "optional-token"
}
```

**Response (200):**
```json
{
  "message": "Registrierung erfolgreich. Bitte verifiziere deine E-Mail.",
  "email": "user@example.com"
}
```

**Fehler:**
- `400`: Ungültige Eingabedaten
- `409`: E-Mail bereits registriert

### POST /api/auth/login

Meldet einen Benutzer an.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "twoFactorToken": "123456",
  "backupCode": "BACKUPCODE"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "token": "jwt-token",
  "requires2FA": false
}
```

**2FA erforderlich (200):**
```json
{
  "requires2FA": true,
  "message": "2FA-Token erforderlich"
}
```

**Fehler:**
- `401`: Ungültige Anmeldedaten
- `403`: E-Mail nicht verifiziert

### GET /api/auth/me

Ruft die Daten des aktuellen Benutzers ab.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "nickname": "johndoe",
  "displayPreference": "firstName",
  "isEmailVerified": true,
  "has2FA": false,
  "avatar": "url",
  "themePreference": "system",
  "languagePreference": "de",
  "preferences": { ... },
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-01-01T00:00:00Z"
}
```

**Fehler:**
- `401`: Nicht authentifiziert
- `404`: Benutzer nicht gefunden

### POST /api/auth/verify-email

Verifiziert die E-Mail-Adresse eines Benutzers.

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response (200):**
```json
{
  "message": "E-Mail erfolgreich verifiziert."
}
```

**Fehler:**
- `400`: Ungültiger oder abgelaufener Token

### POST /api/auth/resend-verification

Sendet eine neue Verifizierungs-E-Mail.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Verifizierungs-E-Mail wurde gesendet."
}
```

### POST /api/auth/forgot-password

Fordert einen Passwort-Reset an.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Passwort-Reset-E-Mail wurde gesendet."
}
```

**Rate Limiting:** Max. 3 Requests pro Stunde pro E-Mail

### POST /api/auth/confirm-reset-password

Setzt das Passwort zurück.

**Request Body:**
```json
{
  "token": "reset-token",
  "newPassword": "newsecurepassword"
}
```

**Response (200):**
```json
{
  "message": "Passwort erfolgreich zurückgesetzt."
}
```

**Fehler:**
- `400`: Ungültiger oder abgelaufener Token
- `400`: Passwort zu schwach

## 2FA Endpunkte

### POST /api/auth/enable-2fa

Aktiviert 2FA für den Benutzer.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "secret": {
    "base32": "JBSWY3DPEHPK3PXP",
    "otpauthUrl": "otpauth://totp/..."
  },
  "backupCodes": ["CODE1", "CODE2", ...]
}
```

**Hinweis:** 2FA ist noch nicht vollständig aktiviert. Benutzer muss Token verifizieren.

### POST /api/auth/verify-2fa

Verifiziert den 2FA-Token und aktiviert 2FA vollständig.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "2FA erfolgreich aktiviert."
}
```

**Fehler:**
- `400`: Ungültiger Token

### POST /api/auth/backup-codes/consume

Verwendet einen Backup-Code für 2FA.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "BACKUPCODE"
}
```

**Response (200):**
```json
{
  "message": "Backup-Code erfolgreich verwendet."
}
```

### POST /api/auth/backup-codes/rotate

Generiert neue Backup-Codes.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "password": "current-password"
}
```

**Response (200):**
```json
{
  "backupCodes": ["NEWCODE1", "NEWCODE2", ...]
}
```

### POST /api/auth/disable-2fa

Deaktiviert 2FA für den Benutzer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "password": "current-password"
}
```

**Response (200):**
```json
{
  "message": "2FA erfolgreich deaktiviert."
}
```

## Einladungen

### POST /api/auth/accept-invitation

Akzeptiert eine Einladung.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "invitationToken": "invitation-token"
}
```

**Response (200):**
```json
{
  "message": "Einladung erfolgreich akzeptiert."
}
```

## Fehlerbehandlung

Alle Endpunkte können folgende Fehler zurückgeben:

- `400`: Bad Request - Ungültige Eingabedaten
- `401`: Unauthorized - Nicht authentifiziert oder ungültiger Token
- `403`: Forbidden - Keine Berechtigung
- `404`: Not Found - Ressource nicht gefunden
- `429`: Too Many Requests - Rate Limit überschritten
- `500`: Internal Server Error - Serverfehler

## Rate Limiting

Bestimmte Endpunkte haben Rate Limiting:

- **Passwort-Reset**: 3 Requests pro Stunde pro E-Mail
- **E-Mail-Verifizierung**: 5 Requests pro Stunde pro Benutzer

## Sicherheit

- Passwörter werden mit bcrypt gehasht
- JWT-Tokens haben eine Ablaufzeit (Standard: 7 Tage)
- 2FA-Tokens sind zeitbasiert (30 Sekunden)
- Backup-Codes sind Einmal-Codes
- E-Mail-Tokens haben Ablaufzeit (1 Stunde)

