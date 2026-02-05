# Users API

## GET /api/users/search

Suche nach Benutzern.

**Auth:** erforderlich

**Query:**

- `query`: Suchstring (E‑Mail, Name, Spitzname)
- `limit`, `offset`: Pagination

**Antwort (200):** Liste von Benutzern (reduzierte Felder).
