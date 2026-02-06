# Friends API

## GET /api/friends/invite/:userId

Öffentlicher Invite‑Link (zeigt Einlader‑Info).

**Response (Beispiel):**

```json
{ "inviter": { "id": "uuid", "displayName": "Max", "avatarUrl": "..." } }
```

## POST /api/friends/invite/:userId

Akzeptiert Invite und erstellt Freundschaft.

**Auth:** erforderlich

**Response (Beispiel):**

```json
{ "message": "Freundschaft wurde erstellt.", "type": "friendship_created", "friendshipId": "uuid" }
```

## GET /api/friends

Listet Freunde.

**Auth:** erforderlich

## GET /api/friends/requests

Listet eingehende und ausgehende Anfragen.

**Auth:** erforderlich

**Response (Beispiel):**

```json
{
  "incoming": [ { "type": "incoming", "requestId": "...", "createdAt": "...", "user": { "id": "...", "displayName": "..." } } ],
  "outgoing": [ { "type": "outgoing", "requestId": "...", "createdAt": "...", "user": { "id": "..." } } ]
}
```

## POST /api/friends/requests

Erstellt eine Freundschaftsanfrage.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "targetUserId": "uuid" }
```

**Response:** `{ "requestId": "uuid" }`

**Rate‑Limit:** 10 Anfragen / 15 Minuten

## PUT /api/friends/requests/:requestId

Akzeptieren oder ablehnen.

**Body (JSON):**

```json
{ "action": "accept|decline" }
```

**Response (Beispiel):** `{ "status": "accepted" }`

## DELETE /api/friends/requests/:requestId

Zieht eine eigene Anfrage zurück.

## DELETE /api/friends/:friendshipId

Entfernt eine Freundschaft.

**Fehlerfälle (typisch):**

- `400` ungültige Aktion
- `403` nicht erlaubt
- `404` nicht gefunden
- `409` Konflikt
