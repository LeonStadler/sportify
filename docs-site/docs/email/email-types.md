---
title: "Verfügbare E-Mail-Typen"
---

# Verfügbare E-Mail-Typen

Sportify verwendet verschiedene E-Mail-Templates für unterschiedliche Anwendungsfälle. Alle E-Mails verwenden das einheitliche Design-System mit Inline-Styles.

## 📧 1. E-Mail-Verifikation

**Trigger:** Nach Registrierung oder E-Mail-Änderung
**Route:** `POST /api/auth/register`
**Template:** `createActionEmail`

### Inhalt
```
Betreff: Sportify – E-Mail bestätigen

Greeting: Hallo [Vorname],

Title: E-Mail-Adresse bestätigen

Message: Bitte bestätige deine E-Mail-Adresse, um dein Sportify-Konto zu aktivieren.

Button: E-Mail-Adresse bestätigen
URL: /auth/email-verification?token=...&email=...

Additional: Dieser Link ist 24 Stunden lang gültig.
```

### Technische Details
- **Token-Typ:** `email_verification_tokens`
- **Expiration:** 24 Stunden
- **Single-Use:** Token wird nach Verwendung invalidiert
- **Datenbank:** `email_verification_tokens` Tabelle

### Test-Kommando
```bash
node test-email.js deine@email.com verification
```

---

## 🔑 2. Passwort-Zurücksetzung

**Trigger:** "Passwort vergessen" Funktion
**Route:** `POST /api/auth/forgot-password`
**Template:** `sendPasswordResetEmail()` (eigene Funktion)

### Inhalt
```
Betreff: Sportify – Passwort zurücksetzen

Greeting: Hallo [Vorname],

Title: Passwort zurücksetzen

Message: Du hast eine Passwort-Zurücksetzung für dein Sportify-Konto angefordert.

Button: Passwort zurücksetzen
URL: /auth/reset-password?token=...

Additional: Dieser Link ist eine Stunde lang gültig.
          Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.
```

### Technische Details
- **Token-Typ:** `password_reset_tokens`
- **Expiration:** 1 Stunde
- **Single-Use:** Token wird nach Verwendung invalidiert
- **Sicherheit:** Zusätzliche E-Mail-Validierung erforderlich
- **Datenbank:** `password_reset_tokens` Tabelle

### Test-Kommando
```bash
node test-email.js deine@email.com password
```

---

## 👥 3. Freundschaftseinladung

**Trigger:** Freund einladen
**Route:** `POST /api/profile/invitations/:id/resend`
**Template:** `createActionEmail`

### Inhalt
```
Betreff: Sportify – Einladung

Greeting: Hallo,

Title: Du wurdest zu Sportify eingeladen

Message: Jemand hat dich eingeladen, Teil der Sportify-Community zu werden.
         Registriere dich jetzt und starte dein Training!

Button: Jetzt registrieren
URL: /invite/[userId]

Additional: Die Einladung läuft am [Datum] ab.
```

### Technische Details
- **Token-Typ:** `invitations`
- **Expiration:** 7 Tage
- **Multi-Use:** Einladung kann mehrfach verwendet werden
- **Status:** `pending` → `accepted`/`expired`
- **Datenbank:** `invitations` Tabelle

### Test-Kommando
```bash
node test-email.js deine@email.com invitation
```

---

## 🏆 4. Erfolgs-E-Mail

**Trigger:** Persönliche Rekorde, Achievements
**Template:** `createSuccessEmail`

### Inhalt
```
Betreff: Sportify – Neuer persönlicher Rekord!

Greeting: Herzlichen Glückwunsch, [Vorname]!

Title: Neuer persönlicher Rekord!

Message: Du hast einen neuen persönlichen Rekord aufgestellt!
         In dieser Woche hast du insgesamt 500 Punkte gesammelt
         und 25 Push-ups absolviert.

Button: Zu meinen Workouts (optional)
URL: /workouts

Additional: (keiner)
```

### Technische Details
- **Trigger:** Automatisch nach Workouts
- **Personalisierung:** Enthält konkrete Zahlen
- **Motivation:** Positive, ermutigende Sprache
- **Optional Button:** Nicht immer erforderlich

### Test-Kommando
```bash
node test-email.js deine@email.com success
```

---

## 📊 5. Wöchentliche/Monatliche Zusammenfassungen

**Trigger:** Geplante Cron-Jobs (noch nicht implementiert)
**Template:** `createSuccessEmail` oder Custom

### Geplante Inhalte
```
Betreff: Sportify – Deine Trainingswoche im Überblick

Greeting: Hallo [Vorname],

Title: Deine Trainingswoche im Überblick

Message: Diese Woche hast du:
         • 5 Workouts absolviert
         • 2.350 Punkte gesammelt
         • 3 neue persönliche Rekorde aufgestellt
         • Durchschnittlich 45 Minuten pro Training

Button: Zu meinen Statistiken
URL: /stats

Additional: Bleib dran! Nächste Woche wird noch besser!
```

### Technische Details
- **Status:** Geplant für zukünftige Version
- **Trigger:** GitHub Actions Cron-Job
- **Personalisierung:** Individuelle Statistiken
- **Frequenz:** Wöchentlich/Monatlich

---

## 📧 6. Allgemeiner Test (General)

**Zweck:** Template-Testing und Debugging
**Template:** `createActionEmail`

### Inhalt
```
Betreff: Sportify - E-Mail Test

Greeting: Hallo Test-User,

Title: E-Mail Test erfolgreich!

Message: Das ist eine Test-E-Mail um zu überprüfen, ob das E-Mail-System
         und die Templates korrekt funktionieren.

Button: Zur Sportify App
URL: [FRONTEND_URL]

Additional: Diese Test-E-Mail wurde automatisch generiert mit Inline-Styles
            für maximale E-Mail-Client-Kompatibilität.
```

### Test-Kommando
```bash
node test-email.js deine@email.com general
# oder kurz:
node test-email.js deine@email.com
```

---

## 🔧 E-Mail-Flows

### Registrierung
1. User registriert sich
2. **E-Mail-Verifikation** wird versendet
3. User klickt Link
4. Account wird aktiviert

### Passwort-Reset
1. User klickt "Passwort vergessen"
2. **Passwort-Reset-E-Mail** wird versendet
3. User klickt Link und setzt neues Passwort
4. Token wird invalidiert

### Freund einladen
1. User lädt Freund ein
2. **Freundschaftseinladung** wird versendet
3. Freund registriert sich über Link
4. Freundschaft wird automatisch erstellt

### Erfolge feiern
1. User erreicht persönlichen Rekord
2. **Erfolgs-E-Mail** wird versendet
3. User wird motiviert weiterzumachen

---

## 📊 Statistiken & Monitoring

### Versand-Tracking
```sql
-- Alle versendeten E-Mails
SELECT recipient, subject, sent_at
FROM outbound_emails
ORDER BY sent_at DESC;

-- Erfolgsrate nach Typ
SELECT
  CASE
    WHEN subject LIKE '%bestätigen%' THEN 'verification'
    WHEN subject LIKE '%zurücksetzen%' THEN 'password'
    WHEN subject LIKE '%Einladung%' THEN 'invitation'
    ELSE 'other'
  END as email_type,
  COUNT(*) as count
FROM outbound_emails
WHERE sent_at IS NOT NULL
GROUP BY email_type;
```

### Token-Status
```sql
-- Aktive Tokens
SELECT 'verification' as type, COUNT(*) as count
FROM email_verification_tokens
WHERE used = false AND expires_at > NOW()

UNION ALL

SELECT 'password_reset' as type, COUNT(*) as count
FROM password_reset_tokens
WHERE used = false AND expires_at > NOW()

UNION ALL

SELECT 'invitations' as type, COUNT(*) as count
FROM invitations
WHERE status = 'pending' AND expires_at > NOW();
```

---

## 🚨 Fehlerbehebung

### Häufige Probleme

**Problem:** E-Mail wird nicht angezeigt
**Lösung:** Inline-Styles verwenden, kein externes CSS

**Problem:** Button-Farbe falsch
**Lösung:** `#F97316` für Background, `#ffffff` für Text

**Problem:** Links funktionieren nicht
**Lösung:** `FRONTEND_URL` in `.env.local` prüfen

**Problem:** Token abgelaufen
**Lösung:** Expiration-Zeiten prüfen (24h, 1h, 7d)

### Debugging
```bash
# SMTP-Verbindung testen
node -e "import('./services/emailService.js').then(m => m.testSMTPConnection())"

# Template-Vorschau
node -e "
import('./utils/emailTemplates.js').then(m => {
  const html = m.createActionEmail({
    greeting: 'Test',
    title: 'Test E-Mail',
    message: 'Test Nachricht',
    buttonText: 'Test Button',
    buttonUrl: 'https://example.com'
  });
  console.log(html);
})
"
```