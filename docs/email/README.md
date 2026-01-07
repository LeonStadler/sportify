# E-Mail-System Dokumentation

Diese Dokumentation beschreibt das komplette E-Mail-System von Sportify, einschließlich Templates, Konfiguration, Tests und Fehlerbehebung.

## 📁 Verzeichnisstruktur

```
docs/email/
├── README.md              # Diese Übersicht
├── architecture.md        # System-Architektur
├── templates.md           # E-Mail-Templates & Design
├── email-types.md         # Verfügbare E-Mail-Typen
├── testing.md             # Test-Script & Debugging
├── configuration.md       # SMTP-Konfiguration
└── troubleshooting.md     # Fehlerbehebung
```

## 🎯 Schnellstart

```bash
# E-Mail-System testen
node test-email.js deine@email.com

# Spezifischen E-Mail-Typ testen
node test-email.js deine@email.com password
node test-email.js deine@email.com invitation
```

## 📧 Überblick

Das Sportify E-Mail-System bietet:

- ✅ **5 verschiedene E-Mail-Typen** (Verifikation, Passwort-Reset, Einladungen, Erfolge)
- ✅ **Inline-Styles** für maximale E-Mail-Client-Kompatibilität
- ✅ **Dark/Light Mode** Support
- ✅ **Responsive Design** für alle Geräte
- ✅ **Vollständiges Test-Suite** mit Script
- ✅ **SMTP-Konfiguration** für verschiedene Provider

## 🚀 Features

### Templates
- Corporate Design mit Sportify-Branding
- Orange (#F97316) als Primärfarbe
- Trophy-Icon im Header
- Responsive Layout

### Kompatibilität
- ✅ Outlook Desktop/Mobile
- ✅ Gmail Web/Mobile
- ✅ Apple Mail
- ✅ Thunderbird
- ✅ Alle gängigen Webmail-Clients

### Sicherheit
- Token-basierte Links mit Expiration
- HTML-Sanitization
- SMTP-Authentifizierung
- Logging aller E-Mail-Versendungen

## 📚 Weitere Informationen

- [System-Architektur](architecture.md)
- [E-Mail-Templates](templates.md)
- [Verfügbare E-Mail-Typen](email-types.md)
- [Test-Script Anleitung](testing.md)
- [SMTP-Konfiguration](configuration.md)
- [Fehlerbehebung](troubleshooting.md)