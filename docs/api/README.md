# API-Dokumentation

Diese Dokumentation beschreibt alle verfügbaren API-Endpunkte von Sportify.

## Basis-URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Authentifizierung

Die meisten Endpunkte erfordern Authentifizierung über JWT-Token:

```
Authorization: Bearer <token>
```

Token wird nach erfolgreichem Login zurückgegeben.

## Endpunkte

### Authentifizierung

- [Authentication API](authentication.md) - Login, Register, 2FA, etc.

### Workouts

- [Workouts API](workouts.md) - Workout-Management

### Benutzer & Profil

- [Users API](users.md) - Benutzer-Suche
- Profile API - Profil-Verwaltung (Dokumentation folgt)

### Soziale Features

- Friends API - Freundschaftssystem (Dokumentation folgt)
- Feed API - Activity Feed (Dokumentation folgt)

### Statistiken & Rankings

- Scoreboard API - Ranglisten (Dokumentation folgt)
- Stats API - Statistiken (Dokumentation folgt)

### Weitere Features

- Training Journal API - Trainingstagebuch (Dokumentation folgt)
- Goals API - Ziele (Dokumentation folgt)
- Challenges API - Challenges (Dokumentation folgt)
- Notifications API - Benachrichtigungen (Dokumentation folgt)
- Admin API - Admin-Funktionen (Dokumentation folgt)

## Response-Format

### Erfolg

```json
{
  "data": { ... },
  "message": "Success"
}
```

Oder direkt:

```json
{
  "id": "123",
  "name": "Example"
}
```

### Fehler

```json
{
  "error": "Error message",
  "status": 400
}
```

## Status-Codes

- `200`: Erfolg
- `201`: Erstellt
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

Bestimmte Endpunkte haben Rate Limiting:

- Freundschaftsanfragen: 10 Requests pro 15 Minuten
- Weitere Limits können hinzugefügt werden

## Pagination

Endpunkte mit Listen unterstützen Pagination:

```
GET /api/resource?page=1&limit=10
```

Response:

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering & Sorting

Viele Endpunkte unterstützen Filterung:

```
GET /api/resource?filter=value&sort=field&order=asc
```

## Weitere Informationen

Siehe detaillierte Dokumentation für jeden Endpunkt in den jeweiligen Dateien.

