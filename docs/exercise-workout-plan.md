# Sportify – Exercises, Workouts, Templates Plan (Detailed)

Stand: 2026-01-06

## Überblick & Zielbild
Sportify erhält eine dynamische, kuratierte Übungsdatenbank, die überall im Produkt genutzt wird (Training, Dashboard, Statistiken, Badges, Challenges, Aktivitäten). Hartcodierte Übungen verschwinden vollständig. Zusätzlich werden Workout-Templates eingeführt, die als Trainingspläne genutzt werden können (private/friends/public). Die Punkteberechnung bleibt zunächst einfach und deterministisch, ist aber für spätere Erweiterungen (Bodyweight, Personal-Baseline, Kategorien-Engines) vorbereitet.

## Erfolgskriterien (messbar)
- 0 hartcodierte Exercise-Listen im Frontend (alle über API).
- 100% der Workout-Activities referenzieren `exercise_id` (kein String-Name).
- Übungs-Search + Filter auf Trainingsseite vorhanden und performant (<300ms p95).
- Admin-Kuration: Pending-Liste + Approve/Reject/Merge + Deactivate vorhanden.
- Templates nutzbar (Create, View, Use) mit Sichtbarkeit (private/friends/public).
- Migration ohne Datenverlust (bestehende Workouts weiterhin korrekt angezeigt).

## Nicht-Ziele (für diese Iteration)
- Komplexe, personalisierte Punkteberechnung (Bodyweight, Baseline, Wilks etc.).
- Vollintegration externer Plattformen (Apple Health, Strava, Google Fit).
- Vollständiges Audit-Log-System fuer alle Admin-Aktionen (nur minimal noetig).

---

## Konzept: Uebungsdatenbank (ohne SQL-Schema)

### Uebungsdefinition
Jede Uebung ist ein eigenes, verwaltetes Objekt mit:
- Name + Slug (eindeutig, normalisiert)
- Kategorien (z. B. strength, endurance, climbing)
- Disziplinen (calisthenics, weights, cardio, boulder)
- Movement Pattern (push/pull/legs/core/full)
- Muskelgruppen (z. B. chest, back, legs)
- Equipment (z. B. bodyweight, barbell, dumbbell, rings)
- Mess-/Einheitentyp (reps, time, distance, weight, mixed, route)
- Faehigkeiten (supports sets, supports weight, supports distance/time)
- Schwierigkeitsgrad (tier 1-10)
- Status (pending/approved/rejected, active/inactive)
- Owner + Admin-Kuration (wer erstellt, wer freigibt)

### Dedupe & Aliases
Neue Uebungen muessen vor dem Anlegen aehnliche Namen anzeigen.
- Aehnlichkeits-Search ueber Normalisierung + Fuzzy Match
- Similarity-Score anzeigen (z. B. 0.82)
- Alias-System: pull ups, pull-ups, pullup -> ein Eintrag
- Admin kann Uebungen zusammenlegen (Merge), Aliases bleiben als Redirects

### Reports & Moderation
Nutzer koennen problematische Uebungen melden.
- Report-Gruende: duplicate, incorrect_scoring, inappropriate
- Admin kann Reports bearbeiten und Merge/Deaktivierung ausloesen

### Varianten
Fuer Incline/Decline/Weighted werden **separate Uebungen** erstellt.
- Vorteil: einfache Filterung, klare Statistiken, weniger UI-Komplexitaet
- Konsequenz: mehr Eintraege, aber eindeutige Semantik

---

## Konzept: Workouts (als Vorlagen speicherbar)
- Workouts bleiben **Workouts** (keine Umbenennung zu Templates).
- Ein Workout kann als **Vorlage** markiert und wiederverwendet werden.
- Workouts behalten Sets/Reps/Weight/Distance/Time/Notes.
- Eine Vorlage dient als Vorschlag; beim Speichern eines echten Workouts muessen Werte bestaetigt/angepasst werden.
- Sichtbarkeit: private / friends / public (in der Workout-Liste sichtbar).
- Andere Nutzer duerfen Vorlagen nutzen, optional kopieren, aber nicht bearbeiten.
- Empfehlung Datenmodell: Workout enthaelt `visibility` und `is_template` (statt separater Template-Entitaet).

---

## Konzept: Punkteberechnung (v1)
Einfaches, deterministisches System basierend auf Uebung + Einheit.
- Reps: points per rep
- Time: points per minute
- Distance: points per km

Kein Bodyweight-Faktor in v1.
Spaeter erweiterbar zu Engines pro Kategorie.

---

## Migration & Kompatibilitaet (High-Level)
1) Datenmodell erweitern, ohne bestehende Workouts zu brechen.
2) Seeds der bisherigen Uebungen (pullups/pushups/etc.) in der DB behalten.
3) Backfill: activity_type -> exercise_id
4) UI-Listen auf API umstellen
5) Temporaere Kompatibilitaet, falls alte Felder noch genutzt werden.

---

# Aufgabenplan (Tasks & To-Dos)

## Phase 0 – Vorbereitung & Analyse
- [ ] Bestehende Touchpoints fuer hartcodierte Uebungen erfassen
- [ ] Bestehende Trainingsdaten & Punkteberechnung pruefen

## Phase 1 – Datenmodell & Migration
- [x] Datenmodell erweitern (Uebung-Metadaten, Aliases, Varianten, Templates)
- [x] Workout-Sichtbarkeit und Vorlage-Flag einfuehren (`visibility`, `is_template`)
- [x] Seed-Update fuer Kern-Uebungen (Slug + Kategorien + Units)
- [x] Migration: vorhandene Workouts referenzieren `exercise_id`
- [x] Fallback/Mapping fuer Legacy-Workouts (falls noetig)
- [x] Migrations-Validierung auf Test-Daten

## Phase 2 – Exercises API + Admin Kuration
- [x] `GET /api/exercises` mit Search + Filter
- [x] Filter-Facets: Kategorie, Muskelgruppe, Equipment
- [x] `POST /api/exercises` (User Vorschlaege -> pending)
- [x] Similarity-Search (bei POST direkt liefern)
- [x] Admin Approve/Reject/Update
- [x] Admin Merge (Reassign Activities + Alias erstellen)
- [x] Deactivate (soft delete)
- [x] Exercise Reports (Create + Admin Resolve)
- [x] Exercise Edit-Requests (strukturierte Aenderungsvorschlaege)

## Phase 3 – Frontend: Uebungslexikon & Training Form
- [x] Uebungslexikon-Seite (Liste + Filter + Suchfeld)
- [x] New Exercise Flow (Aehnliche Vorschlaege anzeigen)
- [x] Training Form: Dropdown aus API (kein Hardcode)
- [x] Filter in Training Form (push/pull/legs/core, weight-required, endurance, climbing, muscle/equipment)
- [x] Einheiten-UI basierend auf Measurement Type
- [ ] Report-Action in Exercise Detail (optional v1.5)

## Phase 4 – Workout Vorlagen (Workouts als Vorlagen)
- [x] "Als Vorlage speichern" im Workout-Detail
- [x] Vorlagen-Liste (own/friends/public)
- [x] "Vorlage nutzen" -> Prefill Workout
- [x] Sichtbarkeit/Permissions pruefen

## Phase 5 – Climbing/Bouldering
- [ ] Aktivitaetstyp route/grade definieren
- [ ] UI fuer Bouldern (Grade, Routes, Attempts, Hangboard)
- [ ] Speicherung/Anzeige in Stats

## Phase 6 – Scoring v2 (spaeter)
- [ ] Kategorie-Engines (strength/endurance/isometric/climb)
- [ ] Bodyweight optional
- [ ] Personal-Baseline / Overperformance-Bonus
- [ ] Admin-Tuning + Report Flow

## Phase 7 – Testing, Performance, Abuse-Protection (parallel)
- [ ] Unit + Integration Tests fuer Search, Merge, Migration
- [ ] Property-Tests fuer: Merge-Integritaet, Search-Genauigkeit, Migration
- [ ] Performance Tests (Search p95 < 300ms)
- [ ] Rate Limits fuer Exercise Creation (z. B. 10/Tag/User)
- [ ] Caching fuer Exercise Search (optional)

---

## Deliverables (pro Phase)

### Phase 1 Deliverables
- Datenmodell-Erweiterung implementiert
- Migration laeuft clean
- Seeds aktualisiert

### Phase 2 Deliverables
- API Endpoints + Admin Workflows
- Similarity Search live

### Phase 3 Deliverables
- Trainingsseite ohne Hardcode
- Uebungslexikon live

### Phase 4 Deliverables
- Workout Templates live

### Phase 5 Deliverables
- Bouldering/Climbing basics live

---

## Risiko- und Sonderfaelle
- Merge fuehrt zu inkonsistenten IDs -> Alias Redirect + Activity Reassign muss robust sein
- Inaktive Uebungen duerfen nicht neu ausgewaehlt werden, aber alte Workouts muessen sie anzeigen
- Einheitensystem (kg/lbs, km/mi) sauber konvertieren
- Performance bei Search & Similarity (Indexing noetig)
- Spam/Low-Quality Uebungen -> Rate Limits + Admin Review

---

## Festgelegte Entscheidungen
- Workouts/Workouts-Templates: Sichtbarkeit private, friends, public.
- Uebungen: jeder darf vorschlagen/erstellen (pending), aber nicht bearbeiten.
- Bearbeiten/Loeschen/Merge: nur Admins.
- Merge-Rueckgaengig: nicht vorgesehen in v1; stattdessen Merge-Log + Alias-Redirects fuer Nachvollziehbarkeit.
- Neue Uebungen sind sofort global sichtbar (fuer alle nutzbar).
- Aenderungen: strukturierte Aenderungsvorschlaege, Admin kann freigeben oder manuell ueberarbeiten.
- Reports: nur intern (Admin).
- Vorlagen: Kopieren erlaubt (eigene Version), aber Original nicht direkt editierbar.
- Einheiten: Speicherung in Basiseinheiten; UI zeigt Nutzerpraeferenz (kg/lbs, km/mi).

---

# Zusatzplaene (Priorisierung, Rollout, UX-Flows)

## Priorisierung nach Aufwand/Nutzen

### A) Hocher Nutzen, moderater Aufwand (sofort starten)
- Phase 1 Datenmodell & Migration
- Phase 2 Exercises API + Admin Kuration
- Phase 3 Training Form: Hardcode entfernen + Search/Filter

### B) Hoher Nutzen, hoeherer Aufwand (nach Phase 3)
- Phase 4 Workout Templates

### C) Mittel/Nischennutzen, hoher Aufwand (spaeter)
- Phase 5 Bouldering/Climbing
- Phase 6 Scoring v2

### D) Optional/strategisch (nur wenn Ressourcen frei)
- Externe Integrationen (Apple Health/Google Fit)

---

## Rollout-Plan (Feature Flags + Migration Steps)

### Feature Flags (empfohlen)
- `exercises_db_enabled` (globale Umschaltung)
- `exercises_suggestions_enabled` (User kann Uebungen vorschlagen)
- `exercise_merge_admin_enabled`
- `workout_templates_enabled`
- `climbing_enabled`

### Rollout Ablauf
1) **Schema Erweiterung (Hidden)**
   - Datenmodell erweitern, Seeds aktualisieren, Backfill vorbereiten
   - Flags: alle aus
2) **Shadow Read (API parallel)**
   - API liefert Uebungen, UI nutzt aber noch Hardcode
   - Validierung: Search/Filter Test mit realen Daten
3) **Limited Enable (internal / admin)**
   - Training Form kann per Flag auf DB umstellen
   - Admin-Queue aktiv, User Suggestions optional
4) **Full Enable (alle Nutzer)**
   - Hardcode deaktivieren
   - Monitoring: Fehlerquote, Performance, Missing Exercises
5) **Templates Release**
   - Templates fuer wenige Nutzer testen, dann global

### Migration Checks (Gatekeeping)
- 0 referenzierte Exercises fehlen nach Backfill
- p95 Search < 300ms
- 0 Trainings-Seitenfehler beim Speichern

---

## UX-Flow Spezifikation (Screens & States)

### 1) Training Form (Exercise Selection)
**Ziel:** Nutzer findet Uebung schnell, korrekt, ohne Duplikate.
**Flow:**
1. Nutzer klickt auf Uebungsauswahl
2. Suchfeld + Filterchips (push/pull/legs, weight-required, endurance, climbing)
3. Ergebnisliste mit Tags (Kategorie, Einheitentyp, Schwierigkeitsgrad)
4. Auswahl setzt UI in passenden Modus (reps/time/distance/route)
5. Wenn Uebung fehlt: Shortcut "Neue Uebung vorschlagen"

**States:**
- Loading
- Empty State (keine Treffer)
- Error State (API fail)

### 2) Uebungslexikon (Library)
**Ziel:** Browse + Suggest + Transparenz (pending/approved).
**Flow:**
1. Listenansicht mit Suche + Filter
2. Exercise Detail Drawer (Beschreibung + Meta + Einheiten)
3. Button: "Neue Uebung vorschlagen"
4. Beim Tippen: aehnliche Uebungen anzeigen + Warnung vor Duplikat
5. Vorschlag wird als pending gespeichert

**States:**
- Pending Badge
- Approved Badge
- Rejected (optional sichtbar nur fuer Ersteller)

### 3) Admin: Exercise Moderation
**Ziel:** schnelle Kuration mit Merge-Flow.
**Flow:**
1. Pending Liste
2. Review (Name, Kategorien, Einheitentyp)
3. Similar Exercises angezeigt
4. Approve / Reject / Merge
5. Merge: Zieluebung waehlen + Alias setzen

### 4) Workout Vorlagen
**Ziel:** Workouts als Vorlagen speichern und teilen.
**Flow:**
1. Workout Detail -> "Als Vorlage speichern"
2. Vorlage-Form (Name, Beschreibung, Sichtbarkeit)
3. Vorlagen-Liste (own/friends/public)
4. "Vorlage nutzen" erzeugt neues Workout-Draft

### 5) Climbing/Bouldering
**Ziel:** Spezifische Eingabe ohne kognitive Ueberladung.
**Flow:**
1. Exercise Auswahl: "Bouldering"
2. UI zeigt Grade-System (V-Scale, Font, UIAA)
3. Eingabe: Routenanzahl, Attempts, Top/Flash
4. Optional: Hangboard/Holds

---

## Zusatz: UX Copy & Messaging (kurz)
- "Aehnliche Uebungen gefunden – moechtest du eine davon nutzen?"
- "Diese Uebung wurde erstellt und ist sofort nutzbar."
- "Aenderungen an Uebungen koennen nur von Admins vorgenommen werden."
- "Template gespeichert. Du kannst es jetzt nutzen oder teilen."

---

## Zusatz: Sichtbarkeit in Workout-Listen (UI-Details)

**Ziel:** In der eigenen Workout-Liste ist sofort sichtbar, ob ein Workout privat, friends oder public ist.

**Vorschlag UI:**
- **Badge direkt am Workout-Titel**: `Private`, `Friends`, `Public`
- **Farbcode**:
  - Private: neutral (grau)
  - Friends: blau
  - Public: gruen
- **Icon optional**:
  - Private: Schloss
  - Friends: Personen
  - Public: Globus

**Listenverhalten:**
- Default sortiert nach Datum (wie bisher)
- Filterchip: `Alle`, `Private`, `Friends`, `Public`
- In der Detailansicht ist Sichtbarkeit editierbar (nur Owner)
