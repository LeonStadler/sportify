# Sportify - Modern Sports Analytics Platform

Eine moderne Webanwendung für Sport-Analytics und Fitness-Tracking, entwickelt von **Leon Stadler**.

## 🚀 Features

- **Dashboard**: Übersichtliche Darstellung aller wichtigen Metriken
- **Scoreboard**: Live-Ergebnisse und Ranglisten
- **Statistiken**: Detaillierte Auswertungen und Trends
- **Profil**: Persönliche Einstellungen und Nutzerverwaltung
- **Multi-Language**: Vollständige Unterstützung für Deutsch und Englisch
- **Dark/Light Theme**: Automatische Theme-Erkennung und manuelle Auswahl
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Modern UI**: Basiert auf shadcn/ui Komponenten

## 🛠️ Technologien

- **Framework**: React 18 mit TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui mit Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form mit Zod Validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Internationalization**: i18next
- **Theme**: next-themes

## 📋 Voraussetzungen

- Node.js (Version 18 oder höher)
- npm (empfohlen) oder yarn

## 🚀 Installation

```bash
# Repository klonen
git clone <repository-url>
cd sportify

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build für Produktion
npm run build

# Linting
npm run lint

# Type-Checking
npm run type-check
```

## 📱 Nutzung

Nach dem Start der Anwendung mit `npm run dev` ist die App unter `http://localhost:5173` verfügbar.

### Navigation
- **Desktop**: Sidebar-Navigation mit allen Hauptbereichen
- **Mobile**: Bottom-Navigation mit Burger-Menü für erweiterte Optionen

### Features
- **Theme-Wechsel**: Über die Einstellungen in der Navigation
- **Sprache**: Deutsch/Englisch Umschaltung in den Einstellungen
- **Responsive**: Automatische Anpassung an Bildschirmgröße

## 🏗️ Projektstruktur

```
sportify/
├── src/
│   ├── components/          # Wiederverwendbare Komponenten
│   │   ├── ui/             # shadcn/ui Basis-Komponenten
│   │   └── ...             # Custom Komponenten
│   ├── pages/              # Haupt-Seiten der Anwendung
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Utility-Funktionen
│   └── ...
├── public/                 # Statische Assets
└── ...
```

## 🤝 Entwicklung

Das Projekt folgt modernen React/TypeScript Best Practices:

- **ESLint** für Code-Qualität
- **TypeScript** für Type-Safety
- **Tailwind CSS** für Styling
- **Component-basierte Architektur**
- **Responsive Design First**
- **Accessibility (a11y) Standards**

## 👨‍💻 Autor

**Leon Stadler**
- Entwickler und Designer der Sportify-Plattform
- Fokus auf moderne Web-Technologien und UX/UI

## 📄 Lizenz

Alle Rechte vorbehalten - Leon Stadler

---

*Erstellt mit Leidenschaft für moderne Web-Entwicklung und Sports Analytics* 🏃‍♂️⚽📊
