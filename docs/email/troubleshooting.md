# Fehlerbehebung

## SMTP nicht konfiguriert

Prüfe `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`.

## Auth‑Fehler

- SMTP‑Credentials prüfen
- 2FA/App‑Passwort beim Provider prüfen

## Timeout

- Port prüfen (`465` für SSL, `587` für STARTTLS)
- Firewall/Netzwerk prüfen
