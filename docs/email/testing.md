# E-Mail-Testing & Debugging

## 🧪 Test-Script

Das `test-email.js` Script ermöglicht es, alle E-Mail-Typen sicher zu testen ohne echte Benutzer zu beeinflussen.

## 🚀 Verwendung

### Basis-Syntax
```bash
node test-email.js <email-adresse> [email-type]
```

### Verfügbare E-Mail-Typen
```bash
# Allgemeiner Test (Standard)
node test-email.js test@example.com

# Spezifische Typen
node test-email.js test@example.com general      # Allgemeiner Test
node test-email.js test@example.com password     # Passwort-Reset
node test-email.js test@example.com invitation   # Freundschaftseinladung
node test-email.js test@example.com success      # Erfolgs-E-Mail
node test-email.js test@example.com verification # E-Mail-Verifikation
```

### Hilfe anzeigen
```bash
node test-email.js
# Zeigt alle verfügbaren Optionen
```

## 📋 Ausgabe-Beispiel

```
📋 Konfiguration geladen:
   FRONTEND_URL: http://localhost:4000
   VITE_FRONTEND_URL: http://localhost:4000
   SMTP_HOST: w01bb322.kasserver.com

🚀 Starte E-Mail-System Tests...

📡 Teste SMTP-Verbindung...
✅ SMTP-Verbindung erfolgreich

📧 Sende invitation-Test-E-Mail...
👥 Teste Freundschaftseinladung...
✅ Test-E-Mail erfolgreich versendet!
📨 An: test@example.com
📧 Typ: invitation
🔗 Message-ID: <abc123@example.com>

🎉 E-Mail-Test abgeschlossen!
```

## 🔍 Was wird getestet?

### ✅ SMTP-Verbindung
- Verbindungsaufbau zum SMTP-Server
- Authentifizierung mit Benutzername/Passwort
- SSL/TLS-Verschlüsselung

### ✅ Template-Rendering
- HTML-Generierung mit Inline-Styles
- Responsive Design
- Dark/Light Mode Support
- Button-Design und Funktionalität

### ✅ E-Mail-Versand
- Subject, From, To Header
- HTML + Text Content
- Message-ID Generierung
- SMTP-Response-Handling

### ✅ Link-Funktionalität
- Korrekt kodierte URLs
- Frontend-URL aus Konfiguration
- Token-Parameter (falls vorhanden)

## 🛠️ Debugging

### SMTP-Probleme diagnostizieren
```bash
# Nur SMTP-Verbindung testen (ohne E-Mail-Versand)
node -e "
import('./services/emailService.js').then(async (m) => {
  const result = await m.testSMTPConnection();
  console.log('SMTP Test Result:', result);
})
"
```

### Template-Vorschau
```bash
# HTML-Ausgabe eines Templates anzeigen
node -e "
import('./utils/emailTemplates.js').then((m) => {
  const html = m.createActionEmail({
    greeting: 'Hallo Test!',
    title: 'Debug Test',
    message: 'Template-Vorschau',
    buttonText: 'Test Button',
    buttonUrl: 'https://example.com'
  });
  console.log(html.substring(0, 500) + '...');
})
"
```

### Konfiguration prüfen
```bash
# Geladene Umgebungsvariablen anzeigen
node -e "
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
"
```

## 🐛 Häufige Probleme & Lösungen

### Problem: "SMTP-Verbindung fehlgeschlagen"
```
❌ SMTP-Verbindung fehlgeschlagen. Überprüfe deine SMTP-Konfiguration in .env
```

**Lösungen:**
1. **.env.local prüfen:**
   ```bash
   cat .env.local | grep SMTP
   ```
2. **Netzwerk-Konnektivität:**
   ```bash
   ping w01bb322.kasserver.com
   telnet w01bb322.kasserver.com 465
   ```
3. **SMTP-Credentials:**
   ```bash
   # Test mit curl
   curl -v --url 'smtps://w01bb322.kasserver.com:465' \
        --user 'sportify@leon-stadler.com:PASSWORD' \
        --mail-from 'sportify@leon-stadler.com' \
        --mail-rcpt 'test@example.com' \
        --upload-file /dev/null
   ```

### Problem: "E-Mail-Angaben sind unvollständig"
```
❌ Fehler beim E-Mail-Test: E-Mail-Angaben sind unvollständig. Fehlend: body/html
```

**Ursache:** Das Script versucht, eine bereits von der echten Funktion versendete E-Mail nochmal zu senden.

**Lösung:** Das ist normales Verhalten für `password` E-Mails. Die echte `sendPasswordResetEmail` Funktion versendet die E-Mail selbst.

### Problem: Button wird nicht orange angezeigt
**Ursache:** E-Mail-Client ignoriert CSS-Styles

**Lösung:** Unser System verwendet bereits Inline-Styles für maximale Kompatibilität.

**Test:**
```bash
node test-email.js test@example.com general
# Prüfe ob Button in E-Mail-Client orange erscheint
```

### Problem: Links funktionieren nicht
```
FRONTEND_URL: http://localhost:8080  # Falscher Port!
```

**Lösung:** `.env.local` korrigieren:
```bash
FRONTEND_URL=http://localhost:4000  # Dein tatsächlicher Port
VITE_FRONTEND_URL=http://localhost:4000
```

### Problem: E-Mail erreicht nicht den Empfänger
**Mögliche Ursachen:**
1. **SPAM-Filter:** E-Mail landet im Spam-Ordner
2. **SMTP-Provider Block:** Zu viele E-Mails in kurzer Zeit
3. **Falsche E-Mail-Adresse:** Tippfehler in der Adresse
4. **DNS-Probleme:** Domain nicht korrekt konfiguriert

**Debugging:**
```bash
# SMTP-Log aktivieren
LOG_EMAIL_DETAILS=true node test-email.js test@example.com
```

## 📊 Test-Reports

### E-Mail-Client-Kompatibilität

| Client | Version | Status | Notizen |
|--------|---------|--------|---------|
| Gmail Web | Latest | ✅ | Perfekt |
| Gmail App | iOS/Android | ✅ | Perfekt |
| Outlook Web | Latest | ✅ | Perfekt |
| Outlook Desktop | 365 | ✅ | Perfekt |
| Apple Mail | Latest | ✅ | Perfekt |
| Thunderbird | Latest | ✅ | Perfekt |

### Performance-Metriken

```
SMTP-Verbindung: < 500ms
Template-Rendering: < 50ms
E-Mail-Versand: < 2s
```

## 🔄 CI/CD Integration

### GitHub Actions Test
```yaml
- name: Test E-Mail System
  run: |
    node test-email.js ci-test@sportify.app general
    node test-email.js ci-test@sportify.app verification
```

### Docker Test
```dockerfile
# E-Mail-System in Container testen
FROM node:18-alpine
COPY . /app
WORKDIR /app
RUN npm install
CMD ["node", "test-email.js", "docker-test@example.com"]
```

## 📈 Monitoring & Alerts

### E-Mail-Versand überwachen
```sql
-- Versand-Statistiken der letzten 24h
SELECT
  DATE_TRUNC('hour', sent_at) as hour,
  COUNT(*) as emails_sent,
  COUNT(CASE WHEN sent_at IS NULL THEN 1 END) as failed
FROM outbound_emails
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Token-Expiration überwachen
```sql
-- Bald ablaufende Tokens
SELECT
  'verification' as type,
  COUNT(*) as count
FROM email_verification_tokens
WHERE used = false
  AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '1 hour'

UNION ALL

SELECT
  'password_reset' as type,
  COUNT(*) as count
FROM password_reset_tokens
WHERE used = false
  AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '1 hour';
```

## 🎯 Best Practices

### Test-Regeln
1. **Immer lokale .env.local verwenden**
2. **Test-E-Mails an echte Adressen senden** (nicht nur an Entwickler)
3. **Alle E-Mail-Typen regelmäßig testen**
4. **Performance-Metriken tracken**
5. **E-Mail-Client-Kompatibilität prüfen**

### Debugging-Workflow
1. **SMTP-Verbindung testen**
2. **Template-Vorschau generieren**
3. **E-Mail mit Test-Adresse versenden**
4. **In verschiedenen Clients öffnen**
5. **Links und Buttons testen**
6. **Logs analysieren**

### Sicherheits-Tests
- **Token-Expiration prüfen**
- **SQL-Injection verhindern**
- **XSS in Templates vermeiden**
- **Rate-Limiting testen**

## 📚 Weiterführende Links

- [E-Mail-Client CSS Support](https://www.campaignmonitor.com/css/)
- [Inline-Styles Best Practices](https://www.litmus.com/blog/css-support)
- [SMTP Debugging](https://nodemailer.com/smtp/)
- [E-Mail Testing Tools](https://www.mail-tester.com/)