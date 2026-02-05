# Users API

## GET /api/users/search

Suche nach Benutzern (für Freundschaftsanfragen).

**Auth:** erforderlich

**Query (wichtigste Felder):**

- `query` (min. 2 Zeichen)
- `page`, `limit`

**Response (Beispiel):**

```json
[
  { "id": "uuid", "displayName": "Max", "avatarUrl": "...", "email": "..." }
]
```

**Fehlerfälle:**

- `500` Serverfehler

**Hinweis:** aktuelle Freunde und offene Anfragen werden ausgeschlossen.
