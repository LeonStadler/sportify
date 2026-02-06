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

## Design‑System

Siehe [design/README.md](design/README.md) für Farben, Typografie, Layout und Komponenten.

## Layout‑Prinzipien

- Mobile‑first
- Grid‑basierte Layouts
- Konsistente Spacing‑Scale

## UI‑States

- Loading: Skeletons oder Spinner
- Empty: klare Empty‑States
- Error: user‑freundliche Fehler

## Screens (Auszug)

- `Landing`, `Index`, `Dashboard`
- Auth: `pages/auth/*`
- `Training`, `MyWorkouts`, `Exercises`
- `Stats`, `Scoreboard`
- `Friends`, `FriendsActivities`, `FriendProfile`
- `Profile`, `Admin`
- `Contact`, `Imprint`, `Privacy`, `Terms`, `Changelog`, `Share`, `Invite`

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
