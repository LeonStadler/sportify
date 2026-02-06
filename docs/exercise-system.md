# Übungssystem (Exercise System)

Diese Dokumentation beschreibt das **dynamische Übungssystem**, die Anforderungen, das Datenmodell, User‑Präferenzen und den Migrationsansatz.

## Ausgangslage

Historisch wurden Übungen hartkodiert (z. B. `pullups`, `pushups`, `running`, `cycling`, `situps`). Diese Legacy‑Typen existieren weiterhin als Fallback, werden aber schrittweise durch das dynamische Übungssystem ersetzt.

## Zielbild

- **Zentrale Übungsdatenbank** statt harter Listen.
- Einheitliche Nutzung in Training, Statistiken, Rankings, Badges, Challenges.
- Admin‑Kuration (Freigabe, Merge, Deaktivierung, Aliases).

## Kern‑Anforderungen

Jede Übung besitzt:

- **Name + Slug** (eindeutig)
- **Kategorie** und **Disziplin**
- **Movement Pattern** (`push|pull|legs|core|full`)
- **Muskelgruppen** und **Equipment**
- **Mess‑Typ** (`reps | time | distance`)
- **Flags**: `supports_sets`, `supports_time`, `supports_distance`, `requires_weight`, `allows_weight`
- **Difficulty Tier** (1–10)
- **Scoring**: `points_per_unit` + `points_source`
- **Status**: `pending | approved | rejected` + `is_active`

## Mess‑Typen & Einheiten

- `reps`: Wiederholungen
- `time`: Sekunden/Minuten/Stunden (normalisiert auf Sekunden)
- `distance`: m/km/miles (normalisiert auf km)

Siehe [scoring.md](scoring.md).

## User‑Präferenzen (Units)

Einheiten werden pro User gespeichert und im Frontend berücksichtigt:

```
preferences.units.distance = km | miles | m | yards
preferences.units.weight = kg | lbs
preferences.units.temperature = celsius | fahrenheit
```

- Distanz und Gewicht werden im UI umgerechnet.
- Temperatur‑Einheit wird in der UI angezeigt (keine serverseitige Konvertierung).

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `exercises` | Übungsstamm | `id`, `name`, `slug`, `measurement_type`, `points_per_unit`, `difficulty_tier`, `status`, `is_active`, `merged_into` |
| `exercise_aliases` | Aliases | `exercise_id`, `alias`, `alias_slug` |
| `exercise_favorites` | Favoriten | `user_id`, `exercise_id` |
| `exercise_edit_requests` | Änderungsanträge | `exercise_id`, `change_request`, `status`, `reviewed_by` |
| `exercise_reports` | Reports | `exercise_id`, `reason`, `status`, `resolved_by` |
| `workout_activities` | Aktivitäten | `activity_type`, `quantity`, `unit`, `points_earned` |

## Admin‑Flows (Kuration)

- **Create/Update** von Übungen
- **Merge** (Duplikate auflösen)
- **Deactivate** (Übung ausblenden)
- **Bulk‑Import/Export** (CSV/JSON)
- **Reports** bearbeiten
- **Edit‑Requests** prüfen und übernehmen

Siehe [Admin API](api/admin.md).

## Such‑ & Filter‑Logik

Filter werden serverseitig unterstützt:

- Kategorie, Disziplin, Movement Pattern
- Mess‑Typ und Multi‑Mess‑Typ
- Muskelgruppen, Equipment
- Schwierigkeitsbereich
- Status/Active

Siehe [Exercises API](api/exercises.md).

## Migration (Vorgehen)

Das dynamische System wurde so eingeführt, dass bestehende Daten stabil bleiben:

1. **Übungsdatenbank eingeführt** (`exercises`, Aliases, Favorites, Edit‑Requests).
2. **Legacy‑Typen** als initiale Datensätze importiert.
3. **Workouts** nutzen `activity_type` als `exercise_id` (Legacy‑Fallback bleibt erlaubt).
4. **Scoring** basiert auf `measurement_type` und `difficulty_tier` der Übung.
5. **Admin‑Tools** ermöglichen Pflege und Konsolidierung.

## API‑Bezug

- [Exercises API](api/exercises.md)
- [Workouts API](api/workouts.md)
- [Admin API](api/admin.md)
