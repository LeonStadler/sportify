# Workouts API

API-Endpunkte für Workout-Management.

## Endpunkte

### GET /api/workouts

Ruft Workouts des Benutzers ab.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Seitennummer (Standard: 1)
- `limit` (optional): Anzahl pro Seite (Standard: 10)
- `type` (optional): Filter nach Aktivitätstyp (z.B. "pullups", "running")

**Response (200):**
```json
{
  "workouts": [
    {
      "id": "uuid",
      "title": "Morning Workout",
      "description": "Description",
      "startTime": "2024-01-01T08:00:00Z",
      "duration": 60,
      "useEndTime": false,
      "activities": [
        {
          "id": "uuid",
          "activityType": "pullups",
          "amount": 20,
          "points": 60,
          "notes": "Notes",
          "unit": "Wiederholungen",
          "sets": [
            { "reps": 10, "weight": null },
            { "reps": 10, "weight": null }
          ]
        }
      ],
      "createdAt": "2024-01-01T08:00:00Z",
      "updatedAt": "2024-01-01T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/workouts

Erstellt ein neues Workout.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Morning Workout",
  "description": "Description",
  "startTime": "2024-01-01T08:00:00Z",
  "duration": 60,
  "useEndTime": false,
  "activities": [
    {
      "activityType": "pullups",
      "amount": 20,
      "unit": "Wiederholungen",
      "notes": "Notes",
      "sets": [
        { "reps": 10, "weight": null },
        { "reps": 10, "weight": null }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Morning Workout",
  "description": "Description",
  "startTime": "2024-01-01T08:00:00Z",
  "duration": 60,
  "useEndTime": false,
  "activities": [...],
  "createdAt": "2024-01-01T08:00:00Z",
  "updatedAt": "2024-01-01T08:00:00Z"
}
```

**Fehler:**
- `400`: Ungültige Eingabedaten
- `401`: Nicht authentifiziert

### GET /api/workouts/:id

Ruft ein einzelnes Workout ab.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Morning Workout",
  "description": "Description",
  "startTime": "2024-01-01T08:00:00Z",
  "duration": 60,
  "useEndTime": false,
  "activities": [...],
  "createdAt": "2024-01-01T08:00:00Z",
  "updatedAt": "2024-01-01T08:00:00Z"
}
```

**Fehler:**
- `401`: Nicht authentifiziert
- `403`: Workout gehört nicht zum Benutzer
- `404`: Workout nicht gefunden

### PUT /api/workouts/:id

Aktualisiert ein Workout.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Workout",
  "description": "Updated Description",
  "startTime": "2024-01-01T09:00:00Z",
  "duration": 90,
  "useEndTime": true,
  "activities": [...]
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Workout",
  ...
}
```

**Fehler:**
- `400`: Ungültige Eingabedaten
- `401`: Nicht authentifiziert
- `403`: Workout gehört nicht zum Benutzer
- `404`: Workout nicht gefunden

### DELETE /api/workouts/:id

Löscht ein Workout.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Workout erfolgreich gelöscht."
}
```

**Fehler:**
- `401`: Nicht authentifiziert
- `403`: Workout gehört nicht zum Benutzer
- `404`: Workout nicht gefunden

### GET /api/workouts/exercises

Ruft verfügbare Übungstypen ab.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "exercises": [
    {
      "id": "pullups",
      "name": "Klimmzüge",
      "pointsPerUnit": 3.0,
      "unit": "Wiederholungen",
      "hasWeight": false,
      "hasSetMode": true,
      "unitOptions": [
        {
          "value": "Wiederholungen",
          "label": "Wiederholungen",
          "multiplier": 1
        }
      ],
      "isActive": true
    }
  ]
}
```

## Datenstrukturen

### Workout

```typescript
interface Workout {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  duration?: number; // Minuten
  useEndTime: boolean;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}
```

### Activity

```typescript
interface Activity {
  id: string;
  activityType: string; // exercise ID
  amount: number;
  points: number;
  notes?: string;
  unit: string;
  sets?: Set[];
}

interface Set {
  reps: number;
  weight?: number; // Optional, wenn hasWeight = true
}
```

## Validierung

### Workout

- `title`: Erforderlich, max. 255 Zeichen
- `startTime`: Erforderlich, gültiges Datum/Zeit
- `duration`: Optional, positive Zahl (Minuten)
- `activities`: Array, mindestens 1 Aktivität

### Activity

- `activityType`: Erforderlich, muss existierende Übung sein
- `amount`: Erforderlich, positive Zahl
- `unit`: Erforderlich, muss zu Übung passen
- `sets`: Optional, Array von Sets

## Punkteberechnung

Punkte werden automatisch berechnet:

```
Punkte = amount * points_per_unit (von Übung)
```

Bei Sets:
```
Punkte = Summe(reps pro Set) * points_per_unit
```

## Fehlerbehandlung

- `400`: Bad Request - Ungültige Eingabedaten
- `401`: Unauthorized - Nicht authentifiziert
- `403`: Forbidden - Workout gehört nicht zum Benutzer
- `404`: Not Found - Workout nicht gefunden
- `500`: Internal Server Error - Serverfehler

## Beispiele

### Workout mit Sets erstellen

```json
{
  "title": "Pull-up Training",
  "startTime": "2024-01-01T08:00:00Z",
  "activities": [
    {
      "activityType": "pullups",
      "amount": 30,
      "unit": "Wiederholungen",
      "sets": [
        { "reps": 10 },
        { "reps": 10 },
        { "reps": 10 }
      ]
    }
  ]
}
```

### Workout mit Distanz

```json
{
  "title": "Morning Run",
  "startTime": "2024-01-01T07:00:00Z",
  "duration": 30,
  "activities": [
    {
      "activityType": "running",
      "amount": 5,
      "unit": "km"
    }
  ]
}
```

