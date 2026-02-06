# Profile API

Profilverwaltung, Einladungen und Achievements.

## PUT /api/profile/update

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
  "avatar": "optional",
  "showInGlobalRankings": true
}
```

## POST /api/profile/change-password

**Auth:** erforderlich

```json
{ "currentPassword": "alt", "newPassword": "neu" }
```

## GET /api/profile/friends/:friendId

Profil eines Freundes.

## GET /api/profile/achievements

Achievements/Badges des Users.

## DELETE /api/profile/account

**Auth:** erforderlich

```json
{ "password": "aktuelles-passwort" }
```

## POST /api/profile/invite-friend

Sendet Einladung per E‑Mail.

```json
{ "email": "friend@example.com" }
```

## GET /api/profile/invitations

Listet Einladungen.

## POST /api/profile/invitations/:id/resend

Einladung erneut senden.

## DELETE /api/profile/invitations/:id

Einladung löschen.
