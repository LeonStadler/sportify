---
slug: /api
title: "API-Übersicht"
---

# API‑Übersicht

Diese Dokumentation beschreibt alle API‑Endpunkte von Sportify.

## Basis‑URL

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

<div className="row overview-grid">
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/authentication"><div className="card__header"><h3>Authentication</h3></div><div className="card__body"><p>Registrierung, Login, 2FA.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/profile"><div className="card__header"><h3>Profile</h3></div><div className="card__body"><p>Profil, Security, Einladungen.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/users"><div className="card__header"><h3>Users</h3></div><div className="card__body"><p>Benutzersuche.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/workouts"><div className="card__header"><h3>Workouts</h3></div><div className="card__body"><p>Workouts & Templates.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/exercises"><div className="card__header"><h3>Exercises</h3></div><div className="card__body"><p>Übungsdatenbank, Reports.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/training-journal"><div className="card__header"><h3>Training Journal</h3></div><div className="card__body"><p>Trainingstagebuch.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/goals"><div className="card__header"><h3>Goals</h3></div><div className="card__body"><p>Wochenziele.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/challenges"><div className="card__header"><h3>Challenges</h3></div><div className="card__body"><p>Wochen‑Challenges.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/friends"><div className="card__header"><h3>Friends</h3></div><div className="card__body"><p>Freundschaften.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/feed"><div className="card__header"><h3>Feed</h3></div><div className="card__body"><p>Activity Feed.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/reactions"><div className="card__header"><h3>Reactions</h3></div><div className="card__body"><p>Reaktionen auf Workouts.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/scoreboard"><div className="card__header"><h3>Scoreboard</h3></div><div className="card__body"><p>Rankings.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/stats"><div className="card__header"><h3>Stats</h3></div><div className="card__body"><p>Statistiken.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/recent-workouts"><div className="card__header"><h3>Recent Workouts</h3></div><div className="card__body"><p>Schnellzugriff.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/notifications"><div className="card__header"><h3>Notifications</h3></div><div className="card__body"><p>In‑App & Push.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/events"><div className="card__header"><h3>Events</h3></div><div className="card__body"><p>Jobs & Auswertung.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/contact"><div className="card__header"><h3>Contact</h3></div><div className="card__body"><p>Kontaktformular.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/api/admin"><div className="card__header"><h3>Admin</h3></div><div className="card__body"><p>Admin‑Tools.</p></div></a></div>
</div>
