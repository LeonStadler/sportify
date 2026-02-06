# Design Tokens

Quelle: `src/index.css` und `tailwind.config.ts`.

## Warum Tokens

Tokens schaffen eine stabile, skalierbare Design‑Sprache. Sie sichern Konsistenz und reduzieren visuelle Drift.

## Farbpalette (Grafik)

![Sportify Palette Light](/img/design/colors-light.svg)

![Sportify Palette Dark](/img/design/colors-dark.svg)

## Farben (Light)

- `--background`: `hsl(0 0% 100%)`
- `--foreground`: `hsl(222.2 84% 4.9%)`
- `--primary`: `hsl(24.6 95% 53.1%)`
- `--primary-foreground`: `hsl(210 40% 98%)`
- `--secondary`: `hsl(210 40% 96.1%)`
- `--secondary-foreground`: `hsl(222.2 47.4% 11.2%)`
- `--muted`: `hsl(210 40% 96.1%)`
- `--muted-foreground`: `hsl(215.4 16.3% 46.9%)`
- `--border`: `hsl(214.3 31.8% 91.4%)`
- `--input`: `hsl(214.3 31.8% 91.4%)`
- `--ring`: `hsl(24.6 95% 53.1%)`

## Farben (Dark)

- `--background`: `hsl(224 71.4% 4.1%)`
- `--foreground`: `hsl(210 20% 98%)`
- `--secondary`: `hsl(215 27.9% 16.9%)`
- `--muted`: `hsl(215 27.9% 16.9%)`
- `--muted-foreground`: `hsl(217.9 10.6% 64.9%)`
- `--border`: `hsl(215 27.9% 16.9%)`

## Semantik

- **Success**: grüne Akzente (Status OK)
- **Warning**: gelb/orange (Achtung)
- **Error**: rot (`--destructive`)

Begründung: Farben sind Status‑Marker, nicht Deko. Nutzer müssen Zustände sofort erkennen.

## Sidebar‑Tokens

- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-accent`
- `--sidebar-border`
- `--sidebar-ring`

## Radius

- `--radius`: `0.5rem`
- Ableitungen: `md`, `sm` in `tailwind.config.ts`

Begründung: Moderate Rundungen vermitteln Zugänglichkeit ohne zu verspielt zu wirken.
