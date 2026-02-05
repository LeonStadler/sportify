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

Alternativ alles in einem Schritt:

```
npm run build:with-docs
```

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
