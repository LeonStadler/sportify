# Contact API

## POST /api/contact

Kontaktformular.

**Body (JSON):**

```json
{ "name": "Max", "email": "max@example.com", "subject": "Betreff", "message": "Text" }
```

**Antwort (200):**

```json
{ "success": true, "message": "Ihre Nachricht wurde erfolgreich versendet." }
```

**Hinweis:** SMTP‑Konfiguration (`SMTP_*`) ist erforderlich.
