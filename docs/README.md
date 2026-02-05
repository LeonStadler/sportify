# Sportify Dokumentation

Willkommen in der zentralen Dokumentation für Sportify. Diese Übersicht ist dein Einstiegspunkt in Architektur, Produkt, APIs, Design und Betrieb.

## Hinweis zur Doku‑Generierung

Die Docusaurus‑Docs werden aus `docs/` generiert. Quelle der Wahrheit ist `docs/`, die Kopie in `docs-site/docs/` wird automatisiert erzeugt:

```
npm run docs:sync
```

Für das Live‑Deployment unter `/docs` wird alles in einem Schritt gebaut:

```
npm run build:with-docs
```

Details: [Deployment](deployment.md)

## Schnellstart

<div className="row overview-grid">
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/architecture">
      <div className="card__header"><h3>Architektur</h3></div>
      <div className="card__body"><p>Systemueberblick, Datenfluss, Kernkomponenten.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/backend">
      <div className="card__header"><h3>Backend</h3></div>
      <div className="card__body"><p>REST-API, Services, Auth, Jobs.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/frontend">
      <div className="card__header"><h3>Frontend</h3></div>
      <div className="card__body"><p>Pages, Komponenten, UX-Flows.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/database">
      <div className="card__header"><h3>Datenbank</h3></div>
      <div className="card__body"><p>Schema, Migrationen, Betrieb.</p></div>
    </a>
  </div>
</div>

## Hauptbereiche

<div className="row overview-grid">
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/design/README">
      <div className="card__header"><h3>Design</h3></div>
      <div className="card__body"><p>CI/CD, Tokens, Layout, Komponenten.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/api">
      <div className="card__header"><h3>API</h3></div>
      <div className="card__body"><p>Endpoints, Beispiele, Fehlercodes.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/features/overview">
      <div className="card__header"><h3>Features</h3></div>
      <div className="card__body"><p>Produkt-Funktionalitaeten und UI-Screens.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/systems/README">
      <div className="card__header"><h3>Systeme</h3></div>
      <div className="card__body"><p>Querschnitts-Systeme und technische Flows.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/operations">
      <div className="card__header"><h3>Betrieb</h3></div>
      <div className="card__body"><p>Deployment, Monitoring, Jobs.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/pwa">
      <div className="card__header"><h3>PWA</h3></div>
      <div className="card__body"><p>Offline, Install, Push.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/email/README">
      <div className="card__header"><h3>E-Mail</h3></div>
      <div className="card__body"><p>Templates, Versand, Debugging.</p></div>
    </a>
  </div>
  <div className="col col--3">
    <a className="card card--hoverable" href="/docs/audit-gap-list">
      <div className="card__header"><h3>Audit</h3></div>
      <div className="card__body"><p>Gap-Liste und Abdeckung.</p></div>
    </a>
  </div>
</div>

## Design

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/corporate-identity">
      <div className="card__header"><h3>Corporate Identity</h3></div>
      <div className="card__body"><p>Werte, Tonality, Markenlogik.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/corporate-design">
      <div className="card__header"><h3>Corporate Design</h3></div>
      <div className="card__body"><p>Logo, Anwendung, Regeln.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/design-tokens">
      <div className="card__header"><h3>Design Tokens</h3></div>
      <div className="card__body"><p>Farben, Radius, systematische Tokens.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/typography">
      <div className="card__header"><h3>Typografie</h3></div>
      <div className="card__body"><p>Schrift, Hierarchie, Lesbarkeit.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/layout-grid">
      <div className="card__header"><h3>Layout & Grid</h3></div>
      <div className="card__body"><p>Breakpoints, Spacing, Rhythmus.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/components">
      <div className="card__header"><h3>Komponenten</h3></div>
      <div className="card__body"><p>UI-Inventory und Patterns.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/interactions-motion">
      <div className="card__header"><h3>Interaktionen & Motion</h3></div>
      <div className="card__body"><p>States, Feedback, Animationen.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/accessibility">
      <div className="card__header"><h3>Accessibility</h3></div>
      <div className="card__body"><p>Kontrast, Fokus, A11y-Checkliste.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/iconography">
      <div className="card__header"><h3>Iconography</h3></div>
      <div className="card__body"><p>Icon-System und Regeln.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/content-tone">
      <div className="card__header"><h3>Content & Tone</h3></div>
      <div className="card__body"><p>Sprache, Mikro-Copy, Beispiele.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/landing-page">
      <div className="card__header"><h3>Landing Page</h3></div>
      <div className="card__body"><p>Struktur, Tonalitaet, CTA-Logik.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/design/governance">
      <div className="card__header"><h3>Governance</h3></div>
      <div className="card__body"><p>Prozess fuer Design-Aenderungen.</p></div>
    </a>
  </div>
</div>

## API

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/authentication">
      <div className="card__header"><h3>Authentication</h3></div>
      <div className="card__body"><p>Registrierung, Login, 2FA.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/profile">
      <div className="card__header"><h3>Profile</h3></div>
      <div className="card__body"><p>Profil, Security, Einladungen.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/users">
      <div className="card__header"><h3>Users</h3></div>
      <div className="card__body"><p>Benutzersuche, Profile.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/workouts">
      <div className="card__header"><h3>Workouts</h3></div>
      <div className="card__body"><p>Workouts & Templates.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/exercises">
      <div className="card__header"><h3>Exercises</h3></div>
      <div className="card__body"><p>Uebungsdatenbank, Reports.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/training-journal">
      <div className="card__header"><h3>Training Journal</h3></div>
      <div className="card__body"><p>Trainingstagebuch.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/goals">
      <div className="card__header"><h3>Goals</h3></div>
      <div className="card__body"><p>Wochenziele.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/challenges">
      <div className="card__header"><h3>Challenges</h3></div>
      <div className="card__body"><p>Wochen-Challenges.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/friends">
      <div className="card__header"><h3>Friends</h3></div>
      <div className="card__body"><p>Freundschaften, Requests.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/feed">
      <div className="card__header"><h3>Feed</h3></div>
      <div className="card__body"><p>Activity Feed, Pagination.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/reactions">
      <div className="card__header"><h3>Reactions</h3></div>
      <div className="card__body"><p>Reaktionen auf Workouts.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/scoreboard">
      <div className="card__header"><h3>Scoreboard</h3></div>
      <div className="card__body"><p>Rankings & Punkte.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/stats">
      <div className="card__header"><h3>Stats</h3></div>
      <div className="card__body"><p>Statistiken & Auswertungen.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/recent-workouts">
      <div className="card__header"><h3>Recent Workouts</h3></div>
      <div className="card__body"><p>Schnellzugriff auf letzte Workouts.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/notifications">
      <div className="card__header"><h3>Notifications</h3></div>
      <div className="card__body"><p>In-App & Push.</p></div>
    </a>
  </div>
</div>

<div className="row overview-grid">
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/events">
      <div className="card__header"><h3>Events</h3></div>
      <div className="card__body"><p>Jobs & Auswertung.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/contact">
      <div className="card__header"><h3>Contact</h3></div>
      <div className="card__body"><p>Kontaktformular.</p></div>
    </a>
  </div>
  <div className="col col--4">
    <a className="card card--hoverable" href="/docs/api/admin">
      <div className="card__header"><h3>Admin</h3></div>
      <div className="card__body"><p>Admin-Tools und Monitoring.</p></div>
    </a>
  </div>
</div>

## Features

<div className="row overview-grid">
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/landing"><div className="card__header"><h3>Landing</h3></div><div className="card__body"><p>Public Einstieg und Value Prop.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/dashboard"><div className="card__header"><h3>Dashboard</h3></div><div className="card__body"><p>Kennzahlen und Uebersicht.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/training-workouts"><div className="card__header"><h3>Training & Workouts</h3></div><div className="card__body"><p>Workouts, Templates, Sessions.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/exercises"><div className="card__header"><h3>Uebungen</h3></div><div className="card__body"><p>Uebungsdatenbank und Logs.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/training-journal"><div className="card__header"><h3>Training-Journal</h3></div><div className="card__body"><p>Eintraege, Tags, Stimmung.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/goals-challenges"><div className="card__header"><h3>Ziele & Challenges</h3></div><div className="card__body"><p>Tracking & Progress.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/statistics"><div className="card__header"><h3>Statistiken</h3></div><div className="card__body"><p>Analysen und Trends.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/rankings"><div className="card__header"><h3>Rankings</h3></div><div className="card__body"><p>Scoreboard und Punkte.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/social"><div className="card__header"><h3>Social</h3></div><div className="card__body"><p>Feed, Friends, Interaktion.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/notifications"><div className="card__header"><h3>Benachrichtigungen</h3></div><div className="card__body"><p>In-App & Push.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/profile"><div className="card__header"><h3>Profil</h3></div><div className="card__body"><p>Konto, Einstellungen.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/admin"><div className="card__header"><h3>Admin</h3></div><div className="card__body"><p>Monitoring & Tools.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/operations"><div className="card__header"><h3>Operations</h3></div><div className="card__body"><p>Systembetrieb.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/contact"><div className="card__header"><h3>Kontakt</h3></div><div className="card__body"><p>Support & Formulare.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/invite"><div className="card__header"><h3>Invite</h3></div><div className="card__body"><p>Einladungen.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/share"><div className="card__header"><h3>Share</h3></div><div className="card__body"><p>Teilen von Workouts.</p></div></a></div>
</div>

<div className="row overview-grid">
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/changelog"><div className="card__header"><h3>Changelog</h3></div><div className="card__body"><p>Release-Notizen.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/legal"><div className="card__header"><h3>Rechtliches</h3></div><div className="card__body"><p>Impressum & Datenschutz.</p></div></a></div>
  <div className="col col--3"><a className="card card--hoverable" href="/docs/features/notfound"><div className="card__header"><h3>404</h3></div><div className="card__body"><p>NotFound-Seite.</p></div></a></div>
</div>

## Systeme

<div className="row overview-grid">
  <div className="col col--4"><a className="card card--hoverable" href="/docs/systems/workout-templates"><div className="card__header"><h3>Workout-Vorlagen</h3></div><div className="card__body"><p>Templates, Herkunft, Nutzung.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/systems/notifications"><div className="card__header"><h3>Benachrichtigungen</h3></div><div className="card__body"><p>In-App & Push-Flow.</p></div></a></div>
  <div className="col col--4"><a className="card card--hoverable" href="/docs/exercise-system"><div className="card__header"><h3>Exercise-System</h3></div><div className="card__body"><p>Dynamische Uebungen & Units.</p></div></a></div>
</div>
