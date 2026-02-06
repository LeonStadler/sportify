# Komponenten

Grundkomponenten (aus `src/components/ui`):

- Buttons, Badge, Card, Input, Textarea, Select
- Checkbox, Radio, Switch, Slider
- Tabs, Accordion, Collapsible
- Dialog, Alert‑Dialog, Sheet/Drawer, Popover, Tooltip, Hover‑Card
- Dropdown, Context‑Menu, Menubar, Navigation‑Menu
- Table, Pagination, Breadcrumb
- Avatar, Calendar, Carousel
- Toasts (Sonner), Alerts
- Skeleton, Scroll‑Area, Resizable Panels
- Chart‑Container (Recharts‑Integration)

## Komponenten‑Philosophie

- **Einfach, robust, wiederverwendbar**
- **Funktion vor Stil**: erst Nutzbarkeit, dann Ästhetik
- **Tokens überall**: Farben und Abstände niemals hard‑coden

## Buttons

Varianten:

- default (Primary)
- secondary
- outline
- ghost
- link
- destructive

Größen:

- sm
- default
- lg
- icon

Begründung: Buttons sind primärer Handlungsanker. Varianten decken klare Intent‑Klassen ab.

## Cards

- Standard‑Fläche für Inhalte, Metriken, Listen
- Leichte Border, subtile Schatten
- Dark‑Mode: leichtes Blurring

Begründung: Cards strukturieren Daten ohne das Layout zu fragmentieren.

## Forms

- React‑Hook‑Form basierte Muster
- Pflichtfelder klar markieren
- Fehler direkt am Feld, mit kurzer Erklärung
- Focus‑Ring sichtbar (`ring`‑Token)

Begründung: Form‑Fehler sind der Haupt‑UX‑Pain‑Point. Feedback muss lokal & eindeutig sein.

## Tabellen

- Klarer Header + Zeilenabstände
- Nutzbar für Admin‑Listen und Reports

## Charts & Data‑Viz

- Recharts via `ChartContainer`
- Farben pro Serie über CSS‑Variablen `--color-*`
- Tooltips mit klarer Typo und Kontrast

Begründung: Analytics sind Kernwert. Charts müssen konsistent und leicht interpretierbar sein.
