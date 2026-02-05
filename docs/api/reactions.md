# Reactions API

Reaktionen auf Workouts.

## POST /api/reactions

Erstellt oder aktualisiert eine Reaktion.

**Auth:** erforderlich

**Body (JSON):**

```json
{ "workoutId": "uuid", "emoji": "👍" }
```

**Erlaubte Emojis:** `👍 ❤️ 🔥 💪 🎉 😊`

**Antwort (201):**

```json
{ "reactions": [ { "emoji": "👍", "count": 3, "users": ["..."] } ] }
```

**Hinweise:**

- Eigene Workouts können nicht reagiert werden.
- Wenn der Owner `preferences.reactions.friendsCanSee = false` gesetzt hat, werden Reaktionen für Freunde nicht angezeigt.

## DELETE /api/reactions/:workoutId

Entfernt eigene Reaktion.

**Auth:** erforderlich

## GET /api/reactions/workout/:workoutId

Listet Reaktionen zu einem Workout.

**Auth:** erforderlich
