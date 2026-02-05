# Profil & Konto

## Zweck

Profilverwaltung, Präferenzen, Einladungen, Passwort und 2FA.

## UI‑Screens

- `Profile`
- `auth/*`

## API‑Endpunkte

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/confirm`
- `POST /api/auth/enable-2fa`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/disable-2fa`
- `PUT /api/profile/update`
- `POST /api/profile/change-password`
- `DELETE /api/profile/account`

Details: [Authentication API](../api/authentication.md), [Profile API](../api/profile.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `users` | Profile | `email`, `display_preference`, `preferences`, `role` |
| `user_backup_codes` | 2FA | `user_id`, `code`, `used_at` |
| `email_verification_tokens` | Verifikation | `user_id`, `expires_at`, `used` |
| `password_reset_tokens` | Reset | `user_id`, `expires_at`, `used` |
