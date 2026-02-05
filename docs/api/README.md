# API-Dokumentation

Diese Dokumentation beschreibt alle API-Endpunkte von Sportify.

## Basis-URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://<deine-domain>/api`

## Authentifizierung

Die meisten Endpunkte erfordern einen JWT im Header:

```
Authorization: Bearer <token>
```

## Antwortformat

Erfolg (Beispiele):

```json
{
  "data": { "...": "..." },
  "message": "Success"
}
```

Oder direkt ein Objekt/Array:

```json
{
  "id": "uuid",
  "name": "Example"
}
```

Fehler:

```json
{
  "error": "Fehlermeldung",
  "status": 400
}
```

## Statuscodes (typisch)

- `200`: Erfolg
- `201`: Erstellt
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

## Pagination

Für Listen:

```
GET /api/resource?page=1&limit=10
```

Beispielantwort:

```json
{
  "data": ["..."],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Kapitel

### Authentifizierung & Konto

- [Authentication API](authentication.md) – Registrierung, Login, 2FA, Passwort-Reset
- [Profile API](profile.md) – Profil, Passwort, Einladungen, Achievements
- [Users API](users.md) – Benutzersuche

### Training & Inhalte

- [Workouts API](workouts.md) – Workouts & Templates
- [Exercises API](exercises.md) – Übungsdatenbank, Favoriten, Reports
- [Training Journal API](training-journal.md) – Trainingstagebuch
- [Goals API](goals.md) – Wochenziele
- [Challenges API](challenges.md) – Wochen-Challenges

### Social & Feed

- [Friends API](friends.md) – Freundschaften & Requests
- [Feed API](feed.md) – Activity Feed
- [Reactions API](reactions.md) – Reaktionen auf Workouts
- [Scoreboard API](scoreboard.md) – Rankings
- [Stats API](stats.md) – Statistiken
- [Recent Workouts API](recent-workouts.md) – Schnellzugriff

### Benachrichtigungen & Systeme

- [Notifications API](notifications.md) – In-App & Push
- [Events API](events.md) – Wöchentliche/monatliche Jobs
- [Contact API](contact.md) – Kontaktformular
- [Admin API](admin.md) – Admin-Tools
