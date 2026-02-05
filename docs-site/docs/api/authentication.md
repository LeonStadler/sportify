---
title: "Authentication API"
---

# Authentication API

API-Endpunkte für Registrierung, Login, E-Mail-Verifizierung, Passwort-Reset und 2FA.

## GET /api/auth/me

Liefert den aktuellen Benutzer.

**Auth:** erforderlich

**Antwort (200):** Benutzerobjekt inkl. Präferenzen, Rollen und Zeitstempeln.

## POST /api/auth/register

Registriert einen neuen Benutzer.

**Body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "min. 8 Zeichen",
  "firstName": "Max",
  "lastName": "Mustermann",
  "nickname": "optional",
  "displayPreference": "firstName|fullName|nickname",
  "invitationToken": "optional"
}
```

**Antwort (200):**

```json
{
  "message": "Registrierung erfolgreich. Bitte verifiziere deine E-Mail.",
  "email": "user@example.com"
}
```

## POST /api/auth/login

Login mit E-Mail und Passwort. Falls 2FA aktiv ist, wird ein TOTP oder Backup‑Code benötigt.

**Body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "passwort",
  "twoFactorToken": "123456",
  "backupCode": "BACKUPCODE"
}
```

**Antwort (200):**

```json
{
  "user": { "...": "..." },
  "token": "jwt-token"
}
```

**Antwort (200) – 2FA erforderlich:**

```json
{
  "requires2FA": true,
  "message": "2FA-Token erforderlich"
}
```

## POST /api/auth/forgot-password

Startet den Passwort‑Reset (E-Mail mit Token).

**Body (JSON):**

```json
{ "email": "user@example.com" }
```

**Antwort (200):**

```json
{ "message": "Passwort-Reset-E-Mail wurde gesendet." }
```

## POST /api/auth/reset-password/confirm

Setzt das Passwort mit Reset‑Token zurück.

**Body (JSON):**

```json
{ "token": "reset-token", "password": "neues-passwort" }
```

**Antwort (200):**

```json
{ "message": "Passwort wurde erfolgreich zurückgesetzt." }
```

## POST /api/auth/confirm-reset-password

Alias für `/reset-password/confirm` (Frontend‑Kompatibilität). Gleiche Eingaben/Antworten.

## POST /api/auth/verify-email

Bestätigt die E‑Mail‑Adresse.

**Body (JSON):**

```json
{ "token": "verification-token" }
```

**Antwort (200):**

```json
{ "message": "E-Mail erfolgreich verifiziert." }
```

## POST /api/auth/resend-verification

Sendet eine neue Verifizierungs‑Mail.

**Body (JSON):**

```json
{ "email": "optional, falls nicht authentifiziert" }
```

**Auth:** optional (falls vorhanden, wird der eingeloggte User verwendet)

**Antwort (200):**

```json
{ "message": "..." }
```

## 2FA

### POST /api/auth/enable-2fa

Generiert Secret und Backup‑Codes (2FA wird danach via `verify-2fa` aktiviert).

**Auth:** erforderlich

**Antwort (200):**

```json
{
  "secret": {
    "base32": "...",
    "otpauthUrl": "otpauth://totp/..."
  },
  "backupCodes": ["CODE1", "CODE2"]
}
```

### POST /api/auth/verify-2fa

Aktiviert 2FA nach Token‑Prüfung.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "token": "123456" }
```

### POST /api/auth/backup-codes/consume

Verwendet einen Backup‑Code als 2FA‑Ersatz.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "code": "BACKUPCODE" }
```

### POST /api/auth/backup-codes/rotate

Erzeugt neue Backup‑Codes.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "password": "aktuelles-passwort" }
```

### POST /api/auth/disable-2fa

Deaktiviert 2FA.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "password": "aktuelles-passwort" }
```

## Typische Fehler

- `400`: Ungültige Eingaben/Token
- `401`: Nicht authentifiziert/Token ungültig
- `403`: Nicht erlaubt (z. B. E‑Mail nicht verifiziert)
- `409`: Konflikt (z. B. Spitzname/E‑Mail vergeben)
- `429`: Rate Limit
- `500`: Serverfehler
