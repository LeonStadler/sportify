# Sportify

**Moderne Progressive Web App für Sport‑Analytics und Fitness‑Tracking.** Workouts erfassen, Statistiken auswerten, mit Freunden vergleichen und Fortschritte langfristig dokumentieren – mit PWA‑Offline, optionalen Push‑Benachrichtigungen und mehrsprachiger Oberfläche (DE/EN).

---

## Überblick

Sportify verbindet persönliches Training mit sozialem Wettbewerb und klarer Dokumentation:

| Bereich                    | Beschreibung                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **Training & Workouts**    | Workouts mit Aktivitäten, Sets und Templates; Übungsdatenbank mit Filtern und Favoriten |
| **Statistiken & Rankings** | Auswertungen, Scoreboard, Punkte und Trends                                             |
| **Social**                 | Freunde, Activity‑Feed, Reaktionen auf Workouts                                         |
| **Ziele & Challenges**     | Wochenziele, Challenges, Fortschritts‑Tracking                                          |
| **Training Journal**       | Einträge, Tags, Stimmung, Verknüpfung mit Workouts                                      |
| **Sicherheit & Konto**     | E‑Mail‑Verifizierung, 2FA (TOTP), Passwort‑Reset                                        |
| **PWA**                    | Installierbar, Offline‑Support, optional Web Push                                       |

Die vollständige **Feature‑ und Produktdokumentation** findest du in der Online‑Doku (siehe unten).

---

## Architektur (Kurz)

- **Frontend:** React 18, Vite, TypeScript – Tailwind, Radix UI (shadcn/ui), TanStack Query, React Router, i18next
- **Backend:** Express, REST/JSON, JWT‑Auth, parameterisierte SQL (pg)
- **Datenbank:** PostgreSQL, Migrationen in `migrations/`
- **Betrieb:** Optional SMTP, Web Push (VAPID), Event‑Jobs (Cron); Deployment z. B. Vercel

Details: [Architektur](https://vertic-id.com/docs/architecture), [Backend](https://vertic-id.com/docs/backend), [Frontend](https://vertic-id.com/docs/frontend), [Datenbank](https://vertic-id.com/docs/database).

---

## Schnellstart

**Voraussetzungen:** Node.js ≥ 18, PostgreSQL

```bash
# Abhängigkeiten
npm install

# Umgebung: .env aus .env.example anlegen (mind. DATABASE_URL, JWT_SECRET, FRONTEND_URL)
# Siehe docs/development.md bzw. Online‑Doku

# Entwicklung (Frontend + Backend)
npm run dev
```

- Frontend: typischerweise <http://localhost:8080>
- Backend: typischerweise <http://localhost:3001>

---

## Wichtige Skripte

| Befehl                                         | Beschreibung                  |
| ---------------------------------------------- | ----------------------------- |
| `npm run dev`                                  | Frontend + Backend gemeinsam  |
| `npm run dev:frontend` / `npm run dev:backend` | Nur Frontend bzw. Backend     |
| `npm run build`                                | Produktions‑Build (TS + Vite) |
| `npm run test`                                 | Tests (Node + Vitest)         |
| `npm run lint`                                 | ESLint                        |
| `npm run type-check`                           | TypeScript ohne Emit          |

Weitere Skripte und Umgebungsvariablen: [Entwicklung](https://vertic-id.com/docs/development).

---

## Umgebungsvariablen (Auszug)

- **Pflicht:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- **Optional:** SMTP (E‑Mail), VAPID (Push), Events/Jobs, Frontend‑Variablen (`VITE_*`)

Vollständige Liste und Beschreibung: [Entwicklung – Umgebungsvariablen](https://vertic-id.com/docs/development#umgebungsvariablen).

---

## Dokumentation

**Online (empfohlen):**  
**[sportify.leon-stadler.com/docs](https://vertic-id.com/docs)**

Dort findest du u. a.:

- **Architektur, Backend, Frontend, Datenbank**
- **Design** (Corporate Identity, Tokens, Layout, Komponenten, A11y)
- **API** (Endpoints, Auth, Workouts, Exercises, Social, Admin, …)
- **Features** (Landing, Dashboard, Training, Journal, Ziele, Social, …)
- **Systeme** (Templates, Notifications, Exercise‑System)
- **Betrieb** (Deployment, PWA, E‑Mail)

**Im Repository:**

- [docs/README.md](docs/README.md) – Übersicht der Docs
- [docs/development.md](docs/development.md) – Setup und Skripte
- [docs/api/README.md](docs/api/README.md) – API‑Übersicht

---

## Lizenz

Siehe [LICENSE](LICENSE).
