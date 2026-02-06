# Deployment

## Überblick

Sportify besteht aus zwei Build‑Artefakten:

- **App**: Vite Build nach `dist/`
- **Docs**: Docusaurus Build nach `docs-site/build`, wird nach `dist/docs` kopiert

Damit ist die Dokumentation unter `domain/docs` im gleichen Deployment erreichbar.

## Build‑Pipeline (App + Docs)

1. Docs synchronisieren:

```
npm run docs:sync
```

2. Docs bauen:

```
npm run docs:build
```

3. App bauen:

```
npm run build
```

4. Docs in App‑Build integrieren:

```
node scripts/copy-docs-build.js
```

Alternativ alles in einem Schritt (inkl. Migrationen, sofern `DATABASE_URL` gesetzt):

```
npm run build:with-docs
```

Dabei läuft zuerst `npm run migrate`: Sind Migrationen ausstehend, werden sie einmal gegen die konfigurierte DB ausgeführt. Ohne `DATABASE_URL` wird migrate übersprungen (z. B. lokaler Build).

## Docusaurus‑Sync

Die Inhalte werden aus `docs/` nach `docs-site/docs/` kopiert. Das passiert **automatisiert** über `docs:sync` und sollte nicht manuell editiert werden.

Quelle der Wahrheit:

- `docs/`

Generierte Kopie:

- `docs-site/docs/`

## Vercel Setup

- Root‑Projekt: App + Docs in einem Deployment
- `buildCommand`: `npm run build:with-docs`
- `outputDirectory`: `dist`
- Dokumentation wird in `dist/docs` ausgeliefert

### Datenbank-Migrationen auf Vercel

Migrationen laufen **nur während des Builds** (vor Docs- und App-Build), nicht beim Cold Start der Serverless-Funktion. Dafür muss `DATABASE_URL` in den Vercel Environment Variables für den **Build** verfügbar sein (Settings → Environment Variables → bei Production/Preview „Build“ anhaken).

Ablauf: `build:with-docs` startet mit `npm run migrate` → Verbindung zur DB → alle ausstehenden Migrationen (z. B. `workout_templates`, `exercise_favorites`, `exercises.points_source`) werden einmal ausgeführt → danach Docs- und App-Build. Das Deployment dauert dadurch etwas länger, die App geht aber mit aktueller DB live.

Ohne `DATABASE_URL` beim Build schlägt migrate nicht fehl (wird übersprungen); die API würde dann weiterhin 500 liefern, wenn Tabellen/Spalten fehlen. **Empfehlung:** `DATABASE_URL` für Build und Runtime setzen.

## Domain

- Hauptdomain zeigt auf die App (Root)
- Dokumentation läuft unter `/docs`
- Bei eigener Domain nur ein Projekt nötig

## CI/CD

- Push in `main` triggert Vercel Build
- Preview‑Deployments für PRs möglich (Vercel Standard)

## Preview vs. Production

- Preview: automatische Deploys pro Branch/PR
- Production: Deploy aus `main`
- Docs werden immer im gleichen Build wie die App veröffentlicht
