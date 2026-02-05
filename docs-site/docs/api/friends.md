---
title: "Friends API"
---

# Friends API

## GET /api/friends/invite/:userId

Erstellt/liest einen Einladungslink für einen User.

**Auth:** nicht erforderlich (öffentlicher Zugriff für Einladungs-Flow)

## POST /api/friends/invite/:userId

Akzeptiert eine Einladung (Friendship anlegen).

**Auth:** erforderlich

## GET /api/friends

Listet Freunde.

**Auth:** erforderlich

## GET /api/friends/requests

Listet Freundschaftsanfragen.

**Auth:** erforderlich

## POST /api/friends/requests

Erstellt eine Freundschaftsanfrage.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "targetUserId": "uuid" }
```

## PUT /api/friends/requests/:requestId

Antwortet auf Anfrage (accept/decline).

**Auth:** erforderlich

**Body (JSON):**

```json
{ "action": "accept|decline" }
```

## DELETE /api/friends/requests/:requestId

Löscht eine Anfrage.

**Auth:** erforderlich

## DELETE /api/friends/:friendshipId

Entfernt eine Freundschaft.

**Auth:** erforderlich
