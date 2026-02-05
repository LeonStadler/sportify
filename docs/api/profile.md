# Profile API

Profilverwaltung, Einladungen und Achievements.

## PUT /api/profile/update

Aktualisiert das Profil.

**Auth:** erforderlich

**Body (JSON):**

```json
{
  "firstName": "Max",
  "lastName": "Mustermann",
  "nickname": "optional",
  "displayPreference": "firstName|fullName|nickname",
  "languagePreference": "de|en",
  "preferences": { "...": "..." },
  "avatar": "optional (URL oder JSON)",
  "showInGlobalRankings": true
}
```

**Antwort (200):** Aktualisiertes Benutzerobjekt.

## POST /api/profile/change-password

Ändert das Passwort.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "currentPassword": "alt", "newPassword": "neu" }
```

## GET /api/profile/friends/:friendId

Gibt das Profil eines Freundes aus (inkl. statischer Infos).

**Auth:** erforderlich

## GET /api/profile/achievements

Lädt Achievements/Badges des Users.

**Auth:** erforderlich

## DELETE /api/profile/account

Löscht das Konto.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "password": "aktuelles-passwort" }
```

## POST /api/profile/invite-friend

Sendet eine Einladung per E‑Mail.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "email": "friend@example.com" }
```

## GET /api/profile/invitations

Listet Einladungen des Users.

**Auth:** erforderlich

## POST /api/profile/invitations/:id/resend

Versendet eine Einladung erneut.

**Auth:** erforderlich

## DELETE /api/profile/invitations/:id

Widerruft eine Einladung.

**Auth:** erforderlich
