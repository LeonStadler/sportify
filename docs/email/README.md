# E-Mail-System

Diese Dokumentation beschreibt das E‑Mail‑System (Queue, Templates, Versand und Jobs).

## Überblick

- Versand via SMTP (`nodemailer`)
- Queue in der DB (`email_queue`)
- Versandjobs via `POST /api/events/emails/dispatch`

## Verzeichnis

```
docs/email/
├── README.md
├── architecture.md
├── templates.md
├── email-types.md
├── testing.md
├── configuration.md
└── troubleshooting.md
```

## Schnellstart (lokal)

```bash
node test-email.js deine@email.com
```

## Wichtige Env‑Vars

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `SMTP_FROM`
- `LOG_EMAIL_CONFIG`, `LOG_EMAIL_DETAILS`

Weitere Details: [configuration.md](configuration.md)
