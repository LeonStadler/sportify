# Workout‑Vorlagen (Templates)

Dieses System ermöglicht wiederverwendbare Trainingspläne, die als Vorlagen gespeichert und wiederverwendet werden können.

## Zweck

- Trainingspläne wiederverwenden
- Vorlagen teilen (privat/freunde/öffentlich)
- Aus Vorlagen neue Workouts ableiten

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `workout_templates` | Vorlagen‑Kopf | `id`, `user_id`, `title`, `description`, `visibility`, `movement_pattern(s)`, `category`, `discipline`, `source_template_id`, `source_template_root_id`, `created_at` |
| `workout_template_activities` | Vorlagen‑Aktivitäten | `template_id`, `activity_type`, `quantity`, `unit`, `points_earned`, `sets_data`, `rest_between_sets_seconds`, `rest_after_seconds` |
| `workouts` | Nutzung aus Vorlagen | `source_template_id`, `source_template_root_id` |

## Sichtbarkeit & Herkunft

- `visibility`: `private` | `friends` | `public`
- `source_template_id`: direkte Quelle (wenn aus Vorlage erstellt)
- `source_template_root_id`: Ursprungsvorlage (Kette/Vererbung)

## Zugriff & Berechtigung (Backend)

Templates sind zugreifbar, wenn:

- Eigentümer (`user_id`) oder
- Sichtbarkeit passt (Freunde/Öffentlich)

Die Filterung erfolgt serverseitig beim Laden der Templates.

## API‑Bezug

- `GET /api/workouts/templates`
- `GET /api/workouts/templates/:id`
- `POST /api/workouts` mit `isTemplate: true`
- `POST /api/workouts` mit `sourceTemplateId`

## UI‑Integration

- Training‑Bereich: Vorlagen‑Browse
- Filter: eigene / Freunde / öffentlich
- Anzeige von Quellen‑ und Root‑Vorlagen inkl. Owner‑Credits

## Wichtige Logik

- Vorlagen können Aktivitäten inkl. Sets (`sets_data`) enthalten
- Aus einer Vorlage erstellte Workouts speichern die Herkunft
- Nutzung wird als `usage_count` berechnet
