---
title: "Frontend"
---

# Frontend

Diese Dokumentation beschreibt Aufbau, Screens und zentrale Patterns.

## Struktur

```
src/
├── pages/         # Screens
├── components/    # UI/Feature-Komponenten
├── features/      # Feature-Module
├── services/      # API-Clients
├── contexts/      # Auth/Theme
├── hooks/         # Custom Hooks
└── utils/         # Helpers
```

## Screens (Auszug)

- `Landing`, `Index`, `Dashboard`
- Auth: `pages/auth/*`
- `Training`, `MyWorkouts`, `Exercises`
- `Stats`, `Scoreboard`
- `Friends`, `FriendsActivities`, `FriendProfile`
- `Profile`, `Admin`
- `Contact`, `Imprint`, `Privacy`, `Terms`

## State & Daten

- **TanStack Query** für Server‑State
- **AuthContext** für User‑Session
- Lokaler Zustand via React Hooks

## i18n

- i18next im Frontend
- Sprache wird im Profil gespeichert (`languagePreference`)

## PWA/Offline

- Service Worker + Cache
- Offline‑Funktionen für Kernbereiche

Details in [pwa.md](pwa.md).
