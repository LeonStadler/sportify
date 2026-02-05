---
title: "Fehlerbehebung & Support"
---

# Fehlerbehebung & Support

## 🚨 Häufige Probleme & Lösungen

### 1. "SMTP-Verbindung fehlgeschlagen"

**Symptom:**
```
❌ SMTP-Verbindung fehlgeschlagen. Überprüfe deine SMTP-Konfiguration in .env
```

**Diagnose:**
```bash
# 1. Konfiguration prüfen
node -e "
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD length:', process.env.SMTP_PASSWORD?.length);
"
```

**Lösungen:**

**a) Falsche Credentials:**
```bash
# Passwort zurücksetzen bei KASSERVER
# Gehe zu: https://www.kasserver.com/login/
# E-Mail → E-Mail-Konten → Passwort ändern
```

**b) Port blockiert:**
```bash
# Port 465 testen
telnet w01bb322.kasserver.com 465

# Alternativ Port 587 versuchen
# In .env.local ändern:
SMTP_PORT=587
```

**c) Firewall/VPN:**
```bash
# VPN deaktivieren oder SMTP-Ports freigeben
# Ports: 25, 587, 465, 993, 995
```

**d) DNS-Problem:**
```bash
# DNS auflösen testen
nslookup w01bb322.kasserver.com
```

---

### 2. "E-Mail erreicht nicht den Empfänger"

**Mögliche Ursachen:**

**a) Spam-Filter:**
- ✅ E-Mail landet im Spam-Ordner
- ✅ Betreff/Betreff prüfen (keine "Test" Wörter)
- ✅ HTML-Inhalt auf Spam-Trigger prüfen

**b) Provider blockiert:**
```sql
-- Versendete E-Mails der letzten Stunde zählen
SELECT COUNT(*) as emails_last_hour
FROM outbound_emails
WHERE sent_at > NOW() - INTERVAL '1 hour';
```
- KASSERVER: Max 1000 E-Mails/Stunde
- Gmail: Max 500 E-Mails/Stunde

**c) Falsche FROM-Adresse:**
```bash
# FROM-Adresse muss mit SMTP_USER übereinstimmen
SMTP_FROM=sportify@leon-stadler.com  # Muss gleich sein wie
SMTP_USER=sportify@leon-stadler.com   # SMTP_USER
```

**d) SPF/DKIM nicht konfiguriert:**
```bash
# DNS-Einträge prüfen
dig TXT leon-stadler.com
# Sollte SPF-Eintrag enthalten
```

---

### 3. "Button wird nicht orange angezeigt"

**Symptom:** Button ist grau oder hat falsche Farbe

**Diagnose:**
```bash
# Test-E-Mail senden und HTML inspizieren
node test-email.js debug@example.com general
```

**Lösungen:**

**a) E-Mail-Client unterstützt kein CSS:**
- ✅ Unser System verwendet Inline-Styles
- ✅ Sollte in allen Clients funktionieren

**b) Dark Mode Problem:**
```html
<!-- Button sollte immer haben: -->
style="background-color: #F97316; color: #ffffff !important;"
```

**c) CSS überschrieben:**
- ✅ Inline-Styles haben höchste Priorität
- ✅ `!important` verhindert Überschreibungen

---

### 4. "Links funktionieren nicht"

**Symptom:** Button/Link führt zu falscher URL

**Diagnose:**
```bash
# Konfiguration prüfen
node -e "
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('VITE_FRONTEND_URL:', process.env.VITE_FRONTEND_URL);
"
```

**Lösungen:**

**a) Falsche Frontend-URL:**
```bash
# In .env.local korrigieren
FRONTEND_URL=http://localhost:4000  # Dein Vite-Port
VITE_FRONTEND_URL=http://localhost:4000
```

**b) Token-Parameter fehlen:**
```javascript
// URL sollte so aussehen:
/auth/email-verification?token=abc123&email=user@example.com
```

**c) URL-Encoding Problem:**
```javascript
// Token muss URL-encoded sein
const safeToken = encodeURIComponent(token);
const url = `${frontendUrl}/auth/verify?token=${safeToken}`;
```

---

### 5. "Token ist abgelaufen"

**Symptom:**
```
❌ Token ist abgelaufen
❌ Ungültiger Token
```

**Diagnose:**
```sql
-- Token-Status prüfen
SELECT id, expires_at, used, created_at
FROM email_verification_tokens
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 5;
```

**Lösungen:**

**a) Expiration-Zeiten prüfen:**
- E-Mail-Verifikation: 24 Stunden
- Passwort-Reset: 1 Stunde
- Einladungen: 7 Tage

**b) Token neu generieren:**
```javascript
// Neuen Token erstellen
await createEmailVerificationToken(pool, userId);
```

**c) Uhrzeit-Synchronisation:**
```bash
# Server-Zeit prüfen
date
# Datenbank-Zeit prüfen
psql -c "SELECT NOW();"
```

---

### 6. "Template wird nicht richtig angezeigt"

**Symptom:** E-Mail sieht falsch aus, Layout broken

**Diagnose:**
```bash
# Template-Vorschau generieren
node -e "
import('./utils/emailTemplates.js').then(m => {
  const html = m.createActionEmail({
    greeting: 'Test',
    title: 'Test E-Mail',
    message: 'Test Nachricht',
    buttonText: 'Test Button',
    buttonUrl: 'https://example.com'
  });
  console.log(html.substring(0, 1000));
})
"
```

**Lösungen:**

**a) HTML-Syntax-Fehler:**
- ✅ Templates sind valid HTML
- ✅ Alle Tags sind korrekt geschlossen

**b) CSS-Kompatibilität:**
- ✅ Nur Inline-Styles verwendet
- ✅ Kein externes CSS

**c) E-Mail-Client spezifisch:**
```html
<!-- Outlook-spezifische Kommentare -->
<!--[if mso]>
<style type="text/css">
/* Outlook-spezifische Fixes */
</style>
<![endif]-->
```

---

### 7. "Datenbank-Fehler bei E-Mail-Versand"

**Symptom:**
```
❌ Fehler beim Speichern der E-Mail in Datenbank
```

**Diagnose:**
```sql
-- Datenbank-Verbindung testen
SELECT 1;

-- Tabelle-Struktur prüfen
\d outbound_emails

-- Berechtigungen prüfen
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'outbound_emails';
```

**Lösungen:**

**a) Datenbank-Verbindung:**
```bash
# Connection testen
psql $DATABASE_URL -c "SELECT 1;"
```

**b) Migrationen ausführen:**
```bash
# Alle Migrationen laufen lassen
npm run migrate
```

**c) Tabellen-Berechtigungen:**
```sql
-- User-Berechtigungen vergeben
GRANT ALL PRIVILEGES ON TABLE outbound_emails TO sportify_user;
```

---

### 8. "Rate-Limit erreicht"

**Symptom:**
```
❌ Zu viele E-Mails in kurzer Zeit
```

**Diagnose:**
```sql
-- Versand-Statistiken
SELECT
  DATE_TRUNC('hour', sent_at) as hour,
  COUNT(*) as count
FROM outbound_emails
WHERE sent_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

**Lösungen:**

**a) Rate-Limit erhöhen:**
- Bei KASSERVER: Support kontaktieren
- Auf SendGrid/Mailgun wechseln (höhere Limits)

**b) Queue-System implementieren:**
```javascript
// E-Mails in Warteschlange einreihen
const queueEmail = async (options) => {
  // Rate-Limit prüfen
  // Bei Limit: in Queue speichern
  // Sonst: direkt versenden
};
```

**c) Versand verteilen:**
```javascript
// E-Mails über Zeit verteilen
const delay = Math.random() * 60000; // 0-60 Sekunden
setTimeout(() => sendEmail(options), delay);
```

---

## 🛠️ Debugging-Tools

### SMTP-Debugging
```bash
# Detaillierte SMTP-Logs
LOG_EMAIL_DETAILS=true node test-email.js debug@example.com

# SMTP-Verbindung manuell testen
openssl s_client -connect w01bb322.kasserver.com:465 -crlf
```

### Template-Debugging
```bash
# HTML-Vorschau speichern
node -e "
import('./utils/emailTemplates.js').then(m => {
  const html = m.createActionEmail({
    greeting: 'Debug',
    title: 'Debug E-Mail',
    message: 'Debug Nachricht',
    buttonText: 'Debug Button',
    buttonUrl: 'https://example.com'
  });
  require('fs').writeFileSync('debug-email.html', html);
  console.log('HTML gespeichert in debug-email.html');
})
"
```

### Datenbank-Debugging
```sql
-- Alle Token-Tabellen prüfen
SELECT 'verification' as type, COUNT(*) as count FROM email_verification_tokens
UNION ALL
SELECT 'password_reset' as type, COUNT(*) as count FROM password_reset_tokens
UNION ALL
SELECT 'invitations' as type, COUNT(*) as count FROM invitations
UNION ALL
SELECT 'outbound_emails' as type, COUNT(*) as count FROM outbound_emails;

-- Fehlerhafte E-Mails finden
SELECT recipient, subject, created_at
FROM outbound_emails
WHERE sent_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚑 Notfall-Recovery

### 1. E-Mail-System komplett deaktivieren
```javascript
// In routes/auth.routes.js
const emailDisabled = process.env.DISABLE_EMAIL === 'true';

if (!emailDisabled) {
  await queueEmail(pool, { ... });
}
```

### 2. Fallback auf Console-Logging
```javascript
// E-Mails nur in Logs schreiben
console.log('E-Mail würde versendet werden an:', recipient);
console.log('Betreff:', subject);
console.log('Inhalt:', html);
```

### 3. Alternative E-Mail-Adresse verwenden
```javascript
// Alle E-Mails an Admin umleiten
const actualRecipient = process.env.DEBUG_EMAIL || recipient;
await sendEmail({ ...emailOptions, recipient: actualRecipient });
```

---

## 📞 Support & Hilfe

### Selbsthilfe
1. **Logs prüfen:** `tail -f logs/app.log`
2. **Test-Script verwenden:** `node test-email.js`
3. **Dokumentation lesen:** `docs/email/`
4. **GitHub Issues prüfen**

### Professionelle Hilfe
- **KASSERVER Support:** support@kasserver.com
- **SMTP-Provider Docs:** Offizielle Dokumentation
- **E-Mail-Tester:** mail-tester.com
- **Litmus:** E-Mail-Client Testing

### Wichtige Kontakte
- **Domain:** leon-stadler.com (KASSERVER)
- **E-Mail:** sportify@leon-stadler.com
- **Support:** support@kasserver.com

---

## 📈 Performance-Optimierung

### E-Mail-Versand beschleunigen
```javascript
// Verbindung wiederverwenden
const transporter = createTransporter();
// Mehrere E-Mails über gleiche Verbindung senden

// Templates cachen
const templateCache = new Map();
const getCachedTemplate = (key) => templateCache.get(key);
```

### Datenbank-Optimierung
```sql
-- Indizes für Token-Tabellen
CREATE INDEX idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_expires ON email_verification_tokens(expires_at);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX idx_invitations_expires ON invitations(expires_at);

-- Alte Tokens automatisch löschen
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
  DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
  DELETE FROM invitations WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 Sicherheits-Checkliste

### Vor Produktions-Deployment
- [ ] SMTP-Passwort nicht in Git
- [ ] HTTPS-URLs in Produktion
- [ ] Token-Expiration angemessen kurz
- [ ] Rate-Limiting implementiert
- [ ] HTML-Injection verhindert
- [ ] Logging aktiviert
- [ ] Monitoring eingerichtet

### Regelmäßige Wartung
- [ ] Token-Tabellen bereinigen
- [ ] Versand-Logs archivieren
- [ ] SMTP-Credentials rotieren
- [ ] SPF/DKIM/DMARC prüfen
- [ ] E-Mail-Client-Kompatibilität testen