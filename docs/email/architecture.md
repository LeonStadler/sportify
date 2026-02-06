# E‑Mail‑System Architektur

## Überblick

Das E‑Mail‑System nutzt SMTP (Nodemailer) und eine DB‑Queue für den Versand.

## Komponenten

- `services/emailService.js` – SMTP‑Versand + `queueEmail`
- `services/emailQueueService.js` – Queue‑Handling
- `services/tokenService.js` – Verifikation/Reset‑Tokens
- `services/invitationService.js` – Einladungen
- `routes/auth.routes.js` – Verifikation/Reset
- `routes/profile.routes.js` – Einladungen
- `routes/events.routes.js` – Dispatch der Queue

## Datenfluss

1. App‑Aktion (Register/Reset/Invitation)
2. Route erstellt Token + E‑Mail‑Payload
3. `queueEmail()` speichert in `email_queue` und sendet SMTP
4. `POST /api/events/emails/dispatch` verarbeitet offene Einträge

## Tabellen (Auszug)

- `email_queue`
- `email_verification_tokens`
- `password_reset_tokens`
- `invitations`

## Sicherheit

- Token mit Ablaufzeit
- Hashing der Token‑Daten
- SMTP‑Auth + TLS
