# Changelog

## Zweck

Release‑Informationen und Produktänderungen.

## UI‑Screens

- `Changelog`

## API‑Abhängigkeiten

Keine.

---

## Version 2.1.0 (2026-02-07)

### Neues Scoring-System

- **Transparente Punkte-Logik**: Klarer aufgeschlüsselte Punkte-Quellen (z. B. Trainingsart, Intensität, Umfang) und konsistente Berechnung über App und Backend.
- **Dynamische Gewichtung**: Bessere Balance zwischen Ausdauer, Kraft und gemischten Workouts – fairer Vergleich über verschiedene Trainingsstile.
- **Profil-Einfluss**: Relevante Profilwerte (z. B. Gewicht) fließen kontrolliert in die Berechnung ein.
- **Scoreboard & Statistiken**: Einheitliche Darstellung der neuen Punkte-Logik in Rangliste, Monats-/Gesamtansicht und Statistiken.
- **UX-Verbesserungen**: Erklärungstexte und Tooltips im UI für bessere Nachvollziehbarkeit.

---

## Version 2.0.5 (2026-02-06)

### Dokumentation & Plattform

- **Docusaurus‑Plattform**: Initiale Doku‑Plattform aufgebaut; erreichbar unter `/docs` (z. B. `deinname/docs`).
- **Bereiche erweitert**: Dokumentation in **Grundlagen**, **Design**, **API**, **Features** und **Systeme** deutlich ausgebaut.
- **Überarbeitet**: Inhalte strukturiert, vereinheitlicht und aktualisiert für bessere Orientierung.
- **Guides**: Onboarding, Glossar und Best Practices ergänzt, damit neue Teammitglieder schneller onboarden.
- **Referenzen**: API‑Übersichten, Datenflüsse und Systemgrenzen dokumentiert, inkl. klare Zuständigkeiten.

---

## Version 2.0.0 (2026-02-06) – Major Update

### Dynamische Übungs-Datenbank & Workout-Vorlagen

Mit 2.0.0 wurde die Möglichkeit geschaffen, **eigene Übungen anzulegen** und sie **überall** in der App zu nutzen: in Statistiken, Scoreboard, Wochenzielen, Dashboard-Kacheln, Workouts und Workout-Vorlagen. Es gibt keine festen 5–6 Übungen mehr – alle Übungen sind dynamisch aus der Übungs-DB.

- **Neue Übungsseite**: Eigene Übungen anlegen, durchsuchen, filtern (Kategorie, Muskelgruppe, Ausrüstung, Schwierigkeit etc.), sortieren, als Favoriten speichern.
- **Übungen überall**: Workout-Formular, Wochenziele, Scoreboard (Top-Übungen, individuelle Übungen), Dashboard-Kacheln, Statistiken und Vorlagen nutzen alle dieselbe Übungs-DB.
- **Vorschläge bei Workouts**: Beim Anlegen/Bearbeiten von Workouts werden Übungen aus der Datenbank vorgeschlagen; beim Erstellen neuer Übungen werden ähnliche Namen angezeigt, um Duplikate zu vermeiden.
- **Übungen melden / Änderung vorschlagen**: Möglichkeit, Übungen zu melden oder Änderungsvorschläge (z. B. Korrektur Name/Beschreibung) einzureichen.
- **Workout-Vorlagen**: Umfangreiches Vorlagen-System, das mit dem Trainingstagebuch zusammenarbeitet.
  - Vorlagen erstellen (auch aus einem bestehenden Training heraus), duplizieren, bearbeiten; Anzeige des ursprünglichen Erstellers bei duplizierten Vorlagen.
  - Teilen: öffentlich (public), nur Freunde oder privat.
  - Vorlagen durchsuchen, filtern, als Favoriten speichern; verbesserte Erstellung und Verwaltung.
- **Import/Export**: Übungen (Admin) per Excel importieren/exportieren.
- **Einheitliche Darstellung**: Entfernung von Emojis bei Aktivitäten und Kacheln für ein einheitliches Erscheinungsbild mit der neuen Übungsseite.

---

## Version 1.9.9 (2026-02-05)

### Scoring, Rangliste & Einstellungen

- **Neues Scoring-System (UX/UI)**: Überarbeitetes Monatsscoring, das sich dynamisch anpasst; Profil-Einstellungen (z. B. Gewicht) für das Scoring integriert.
- **Scoreboard**: Top-3-Übungen und individuelle Übungen; einheitliche Zeitraumauswahl inkl. Option „Gesamt“; Rangliste standardmäßig auf „Monat“ beim Öffnen; neue globale Ansicht auch wenn man selbst nicht in der globalen Statistik erscheinen möchte.
- **Theme & Sprache**: Einstellungen überarbeitet – funktionieren geräteübergreifend und einheitlich.
- **Privatsphäre & Benachrichtigungen**: E-Mail-Benachrichtigungen deaktivierbar; Profil privat oder aus der globalen Rangliste ausblendbar (`show_in_global_rankings`).
- **2FA & Übersetzungen**: Probleme behoben, mehr Lokalisierung.

---

## Version 1.9.8 (2026-02-02)

### Profile, Kacheln & Ziele

- **Individuelle Wochenziele**: Angepasste Wochen-Übungsziele und Wochen-Challenge mit klarerem Fortschritt.
- **Kacheln**: Überarbeitete Top-Übung- und Dashboard-Kacheln, kleinere Design-Verbesserungen im Kachel-Interface.
- **Avatar & Drawing**: Überarbeitete Avatar-Einstellungen und Verläufe (Gradients); Zeichnen (Drawing) in den Einstellungen verbessert.
- **Monatsscoring**: Dynamische Anpassung der Monatsdarstellung für bessere Vergleichbarkeit.

---

## Version 1.9.7 (2026-01-30)

### Einheiten, Aktivitätslogik & Stabilität

- **Einheitenpräferenzen**: Projektweit vereinheitlicht (km/m, min, kg etc.) in Workouts, Profil und Statistiken.
- **Aktivitäten**: Activity-Type wird aus Übungs-Daten abgeleitet; Workout-Summen (Totals) werden berechnet und genutzt.
- **Rangliste**: Verbesserte Ranglogik und Nutzeranzeige.
- **Backend**: Build-Zeit-Migrationen für Vercel-Deployment; stabilere Migrations- und Server-Konfiguration.
- **Übersetzungen**: Yards-Einheit und weitere Einheiten in MyWorkouts und UI übersetzt.

---

## Version 1.9.6 (2026-01-26)

### Workout-Vorlagen & Training

- **Vorlagen**: Erweiterte Filterung, Quell-Vorlage, Favoriten; Erstellung und Verwaltung deutlich verbessert.
- **Training-Layout**: Refaktor der Training-Seite für bessere Responsivität und klarere Struktur.
- **Workout-Klassifizierung**: Einheiten-Normalisierung und bessere Auswertung.
- **Admin**: Übersichts-Statistik-Endpoint für Dashboard; Nickname-Validierung und Fehlerbehandlung bei Auth und Profil.

---

## Version 1.9.5 (2026-01-22)

### Übungsverwaltung & Datenqualität

- **Übungs-Management**: Neue Filter/Suche/Sortierung (Kategorie, Muskelgruppe, Equipment, Movement-Pattern, Messart), inklusive Muscle-Group-Selector.
- **Übungsdetails**: Detailseiten und UI-Responsivität verbessert.
- **Import/Export**: Übungen (Admin) per Excel importieren/exportieren.
- **Punkte-Quelle & Favoriten**: `points_source` und Exercise-Favorites eingeführt.

---

## Version 1.9.4 (2026-01-18)

### Dokumentation & /docs

- **Neue Dokumentation**: Zusätzliche, strukturierte Produkt- und Technik-Doku unter `/docs`.
- **Build & Deployment**: Doku zu Migrationen, Datenbank, Entwicklung und Deployment ergänzt/überarbeitet.

---

## Version 1.9.3 (2026-01-11)

### UI/UX & Freundesprofile

- **Weekly Goals UX**: Refaktor auf Drawer für bessere Bedienbarkeit; angepasste Komponenten für individuelle Ziele.
- **FriendProfile**: Besseres Nicht-Freunde-Handling und Lokalisierung.
- **Dashboard**: Leaderboard- und Monatsziel-Karten überarbeitet, klare Struktur.

---

## Version 1.9.2 (2026-01-04)

### PWA, Safe-Area & Öffentliche Seiten

- **Safe-Area**: Notch-Optimierungen für iOS/PWA; bessere Top-Padding-Logik.
- **Public Pages**: Scroll- und Titel-Darstellung korrigiert.
- **Navigation**: UI-Komponenten refaktoriert für bessere Responsivität.

---

## Ältere Versionen (App-Changelog)

Die detaillierten Einträge für 1.9.0 und älter sind in der App auf der Changelog-Seite und in den i18n-Übersetzungen hinterlegt (z. B. Reaktionen auf Workouts 1.9.0, Keyboard Shortcuts 1.8.5, Rangliste & Ziele 1.8.0).
