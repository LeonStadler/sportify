# Social

## Zweck

Freundschaften, Activity Feed und Reaktionen.

## UI‑Screens

- `Friends`
- `FriendsActivities`
- `FriendProfile`

## API‑Endpunkte

- `GET /api/friends`
- `GET /api/friends/requests`
- `POST /api/friends/requests`
- `PUT /api/friends/requests/:requestId`
- `DELETE /api/friends/requests/:requestId`
- `DELETE /api/friends/:friendshipId`
- `GET /api/feed`
- `POST /api/reactions`
- `DELETE /api/reactions/:workoutId`
- `GET /api/reactions/workout/:workoutId`

Details: [Friends API](../api/friends.md), [Feed API](../api/feed.md), [Reactions API](../api/reactions.md)

## Datenmodell (Auszug)

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `friendships` | Freundschaften | `requester_id`, `addressee_id`, `status` |
| `friend_requests` | Anfragen | `requester_id`, `target_id`, `status` |
| `workout_reactions` | Reaktionen | `workout_id`, `user_id`, `emoji` |
