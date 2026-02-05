---
title: "SMTP-Konfiguration"
---

# SMTP-Konfiguration

## 📧 SMTP-Setup für E-Mail-Versand

Das E-Mail-System verwendet SMTP für den zuverlässigen Versand von Transaktions-E-Mails.

## 🔧 Grundkonfiguration

### Erforderliche Umgebungsvariablen

```bash
# SMTP-Server Konfiguration
SMTP_HOST=w01bb322.kasserver.com
SMTP_PORT=465
SMTP_USER=sportify@leon-stadler.com
SMTP_PASSWORD=dein-smtp-passwort
SMTP_FROM=sportify@leon-stadler.com

# Frontend-URLs für E-Mail-Links
FRONTEND_URL=http://localhost:4000
VITE_FRONTEND_URL=http://localhost:4000
```

### Lokale Entwicklung (.env.local)

```bash
# Beispiel für lokale Entwicklung
SMTP_HOST=w01bb322.kasserver.com
SMTP_PORT=465
SMTP_USER=sportify@leon-stadler.com
SMTP_PASSWORD=4,adXB8KxDGkRZoFUCbH
SMTP_FROM=sportify@leon-stadler.com

FRONTEND_URL=http://localhost:4000
VITE_FRONTEND_URL=http://localhost:4000
```

### Produktion (.env)

```bash
# Beispiel für Produktion
SMTP_HOST=w01bb322.kasserver.com
SMTP_PORT=465
SMTP_USER=sportify@leon-stadler.com
SMTP_PASSWORD=produktions-passwort
SMTP_FROM=sportify@leon-stadler.com

FRONTEND_URL=https://www.vertic-id.com
VITE_FRONTEND_URL=https://www.vertic-id.com
```

## 🏢 Beliebte SMTP-Provider

### 1. KASSERVER (Empfohlen)
```bash
SMTP_HOST=w01bb322.kasserver.com
SMTP_PORT=465
SMTP_USER=deine-domain@leon-stadler.com
SMTP_PASSWORD=dein-passwort
```

**Features:**
- ✅ Zuverlässig
- ✅ Deutsche Server
- ✅ SSL/TLS Standard
- ✅ Günstige Preise

### 2. Gmail SMTP
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine-email@gmail.com
SMTP_PASSWORD=app-specific-password
```

**Wichtig:** Gmail benötigt ein "App-Password", nicht dein normales Passwort!

### 3. Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=deine-email@outlook.com
SMTP_PASSWORD=dein-passwort
```

### 4. SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=dein-sendgrid-api-key
```

**Vorteil:** Dediziert für E-Mail-Versand, bessere Zustellraten.

### 5. Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@deine-domain.mailgun.org
SMTP_PASSWORD=dein-mailgun-password
```

## 🔐 Sicherheit & Authentifizierung

### SSL/TLS Verschlüsselung

**Port 465 (SMTPS):**
```bash
SMTP_PORT=465  # SSL von Anfang an
```
- ✅ Höchste Sicherheit
- ✅ Standard für KASSERVER

**Port 587 (STARTTLS):**
```bash
SMTP_PORT=587  # Upgrade zu TLS
```
- ✅ Gute Sicherheit
- ✅ Kompatibel mit Gmail/Outlook

**Port 25 (Plain):**
```bash
SMTP_PORT=25   # KEINE Verschlüsselung
```
- ❌ **Nicht empfohlen!**
- ❌ Unsicher, wird blockiert

### Passwort-Sicherheit

**Sonderzeichen im Passwort:**
```bash
# RICHTIG: Ohne Anführungszeichen
SMTP_PASSWORD=4,adXB8KxDGkRZoFUCbH

# FALSCH: Mit Anführungszeichen
SMTP_PASSWORD="4,adXB8KxDGkRZoFUCbH"
```

**App-Specific Passwords (Gmail):**
1. Gehe zu [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Generiere Passwort für "Mail"
4. Verwende dieses Passwort in SMTP_PASSWORD

## 🧪 Konfiguration testen

### 1. SMTP-Verbindung prüfen
```bash
# Direkter Test
node -e "
import('./services/emailService.js').then(async (m) => {
  console.log('Testing SMTP connection...');
  const result = await m.testSMTPConnection();
  console.log('Result:', result);
})
"
```

### 2. Test-E-Mail versenden
```bash
node test-email.js deine@email.com
```

### 3. Detaillierte Logs aktivieren
```bash
# In .env.local hinzufügen
LOG_EMAIL_DETAILS=true
LOG_EMAIL_CONFIG=true

# Dann testen
node test-email.js deine@email.com
```

## 🌐 Frontend-URL Konfiguration

### Lokale Entwicklung
```bash
# Wenn Vite auf Port 4000 läuft
FRONTEND_URL=http://localhost:4000
VITE_FRONTEND_URL=http://localhost:4000

# Wenn Vite auf Port 5173 läuft (Standard)
FRONTEND_URL=http://localhost:5173
VITE_FRONTEND_URL=http://localhost:5173
```

### Produktion
```bash
# Mit Domain
FRONTEND_URL=https://sportify.app
VITE_FRONTEND_URL=https://sportify.app

# Mit Subdomain
FRONTEND_URL=https://app.sportify.com
VITE_FRONTEND_URL=https://app.sportify.com
```

### Load Balancer / Reverse Proxy
```bash
# Externer Load Balancer
FRONTEND_URL=https://api.sportify.com

# Interne App
VITE_FRONTEND_URL=https://app.sportify.com
```

## ⚙️ Erweiterte Konfiguration

### Verbindung Timeouts
```javascript
// In services/emailService.js
const config = {
  connectionTimeout: 15000,  // 15 Sekunden
  greetingTimeout: 15000,
  socketTimeout: 15000,
};
```

### TLS-Optionen
```javascript
// In services/emailService.js
tls: {
  rejectUnauthorized: false,  // Selbstsignierte Zertifikate erlauben
  minVersion: 'TLSv1.2'       // Mindest TLS-Version
}
```

### Rate Limiting
```javascript
// SMTP-Provider Limits beachten
const RATE_LIMITS = {
  kasserver: { perHour: 1000, perDay: 5000 },
  gmail: { perHour: 500, perDay: 2000 },
  sendgrid: { perHour: 10000, perDay: 100000 }
};
```

## 🔧 Fehlerbehebung

### "SMTP-Verbindung fehlgeschlagen"
**Mögliche Ursachen:**
1. **Falsche Credentials:**
   ```bash
   # Test mit telnet
   telnet w01bb322.kasserver.com 465
   ```

2. **Firewall blockiert:**
   ```bash
   # Port-Scan
   nmap -p 465 w01bb322.kasserver.com
   ```

3. **Netzwerk-Problem:**
   ```bash
   # DNS auflösen
   nslookup w01bb322.kasserver.com
   ```

### "Authentication failed"
**Lösungen:**
1. **Passwort prüfen:** Enthält es Sonderzeichen?
2. **App-Password:** Bei Gmail erforderlich
3. **2FA:** Bei einigen Providern aktivieren

### "Connection timeout"
**Lösungen:**
1. **Port prüfen:** 465 (SSL) vs 587 (STARTTLS)
2. **Firewall:** SMTP-Ports freigeben
3. **VPN/Proxy:** Kann SMTP blockieren

## 📊 Monitoring & Wartung

### Versand-Statistiken
```sql
-- Tägliche Versand-Statistiken
SELECT
  DATE(sent_at) as date,
  COUNT(*) as emails_sent,
  COUNT(CASE WHEN sent_at IS NULL THEN 1 END) as failed
FROM outbound_emails
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

### SMTP-Logs aktivieren
```bash
# Temporär für Debugging
LOG_EMAIL_CONFIG=true
LOG_EMAIL_DETAILS=true

# Dann in den Logs schauen
tail -f logs/app.log | grep "Email Service"
```

### Provider-Limits überwachen
```javascript
// In services/emailService.js hinzufügen
const checkRateLimit = async () => {
  const today = new Date().toISOString().split('T')[0];
  const sentToday = await pool.query(
    'SELECT COUNT(*) FROM outbound_emails WHERE DATE(sent_at) = $1',
    [today]
  );

  if (sentToday.rows[0].count > RATE_LIMITS.kasserver.perDay) {
    console.warn('⚠️ Tägliches E-Mail-Limit erreicht!');
  }
};
```

## 🚀 Deployment Checklist

### Vor Produktions-Deployment
- [ ] SMTP-Credentials in Production gesetzt
- [ ] FRONTEND_URL auf Produktions-Domain
- [ ] Test-E-Mail erfolgreich versendet
- [ ] Rate-Limits des Providers geprüft
- [ ] SSL/TLS-Zertifikate validiert
- [ ] SPF/DKIM/DMARC konfiguriert
- [ ] Monitoring eingerichtet

### Produktions-Konfiguration
```bash
# .env.production
NODE_ENV=production
SMTP_HOST=w01bb322.kasserver.com
SMTP_PORT=465
SMTP_USER=sportify@leon-stadler.com
SMTP_PASSWORD=produktions-passwort
SMTP_FROM=sportify@leon-stadler.com

FRONTEND_URL=https://www.vertic-id.com
VITE_FRONTEND_URL=https://www.vertic-id.com

# Monitoring
LOG_EMAIL_DETAILS=false  # In Prod weniger Logs
LOG_EMAIL_CONFIG=false
```

## 📚 Weiterführende Ressourcen

- [KASSERVER SMTP Dokumentation](https://www.kasserver.com/support/faq/email/)
- [Gmail SMTP Setup](https://support.google.com/mail/answer/7126229)
- [SendGrid SMTP](https://docs.sendgrid.com/ui/account-and-settings/smtp)
- [E-Mail Security Best Practices](https://www.cloudflare.com/learning/email-security/)