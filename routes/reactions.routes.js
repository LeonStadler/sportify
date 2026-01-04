import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createNotification } from "../services/notificationService.js";
import { applyDisplayName, toCamelCase } from "../utils/helpers.js";

const allowedEmojis = new Set(["👍", "❤️", "🔥", "💪", "🎉", "😊"]);

const mapUserSummary = (row) => {
  const user = applyDisplayName(
    toCamelCase({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      nickname: row.nickname,
      display_preference: row.display_preference,
      avatar_url: row.avatar_url,
    })
  );

  return {
    id: user.id,
    name: user.displayName || user.firstName || "Athlet",
    avatar: user.avatarUrl || null,
  };
};

export const createReactionsRouter = (pool) => {
  const router = express.Router();

  const getWorkoutOwner = async (workoutId) => {
    const { rows } = await pool.query(
      "SELECT user_id FROM workouts WHERE id = $1",
      [workoutId]
    );
    return rows[0]?.user_id || null;
  };

  const areFriends = async (userId, ownerId) => {
    const { rows } = await pool.query(
      `SELECT 1
       FROM friendships
       WHERE status = 'accepted'
         AND (
           (requester_id = $1 AND addressee_id = $2)
           OR (requester_id = $2 AND addressee_id = $1)
         )
       LIMIT 1`,
      [userId, ownerId]
    );
    return rows.length > 0;
  };

  const ensureWorkoutAccess = async (workoutId, userId) => {
    const ownerId = await getWorkoutOwner(workoutId);
    if (!ownerId) {
      return { allowed: false, reason: "not-found", ownerId: null };
    }
    if (ownerId === userId) {
      return { allowed: true, ownerId };
    }
    const friends = await areFriends(userId, ownerId);
    if (!friends) {
      return { allowed: false, reason: "not-friends", ownerId };
    }
    return { allowed: true, ownerId };
  };

  const listWorkoutReactions = async (workoutId, currentUserId, ownerId = null) => {
    // Get owner preferences if ownerId is provided
    let ownerPreferences = {};
    let isOwnWorkout = false;
    
    if (ownerId) {
      isOwnWorkout = ownerId === currentUserId;
      if (!isOwnWorkout) {
        const { rows: prefRows } = await pool.query(
          `SELECT preferences FROM users WHERE id = $1`,
          [ownerId]
        );
        if (prefRows[0]?.preferences) {
          try {
            ownerPreferences = typeof prefRows[0].preferences === 'string'
              ? JSON.parse(prefRows[0].preferences)
              : (prefRows[0].preferences || {});
          } catch (e) {
            ownerPreferences = {};
          }
        }
      }
    }
    
    const friendsCanSee = ownerPreferences?.reactions?.friendsCanSee !== false; // default true
    const showNames = ownerPreferences?.reactions?.showNames !== false; // default true
    
    // If not own workout and owner doesn't allow friends to see, return empty
    if (ownerId && !isOwnWorkout && !friendsCanSee) {
      return [];
    }
    
    const { rows } = await pool.query(
      `SELECT
          wr.emoji,
          COUNT(*)::int AS count,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'nickname', u.nickname,
              'display_preference', u.display_preference,
              'avatar_url', u.avatar_url
            )
          ) AS users
        FROM workout_reactions wr
        JOIN users u ON u.id = wr.user_id
        WHERE wr.workout_id = $1
        GROUP BY wr.emoji
        ORDER BY wr.emoji`,
      [workoutId]
    );

    return rows.map((row) => {
      const allUsers = Array.isArray(row.users)
        ? row.users.map(mapUserSummary)
        : [];
      const currentUserReaction = allUsers.some(
        (user) => user.id === currentUserId
      )
        ? row.emoji
        : undefined;

      // Only include user names if owner allows it (or if it's own workout)
      const users = (isOwnWorkout || showNames) ? allUsers : [];

      return {
        emoji: row.emoji,
        count: row.count || allUsers.length,
        users,
        ...(currentUserReaction ? { currentUserReaction } : {}),
      };
    });
  };

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { workoutId, emoji } = req.body || {};

      if (!workoutId || !emoji) {
        return res
          .status(400)
          .json({ error: "Workout-ID und Emoji sind erforderlich." });
      }

      if (!allowedEmojis.has(emoji)) {
        return res.status(400).json({ error: "Ungültiges Emoji." });
      }

      const access = await ensureWorkoutAccess(workoutId, req.user.id);
      if (!access.allowed) {
        return res.status(404).json({ error: "Workout nicht gefunden." });
      }
      if (access.ownerId === req.user.id) {
        return res
          .status(400)
          .json({ error: "Du kannst nicht auf dein eigenes Workout reagieren." });
      }

      await pool.query(
        `INSERT INTO workout_reactions (workout_id, user_id, emoji)
         VALUES ($1, $2, $3)
         ON CONFLICT (workout_id, user_id)
         DO UPDATE SET emoji = EXCLUDED.emoji, created_at = NOW()`,
        [workoutId, req.user.id, emoji]
      );

      if (access.ownerId && access.ownerId !== req.user.id) {
        const { rows: userRows } = await pool.query(
          `SELECT id, first_name, last_name, nickname, display_preference
           FROM users
           WHERE id = $1`,
          [req.user.id]
        );

        if (userRows[0]) {
          const user = applyDisplayName(toCamelCase(userRows[0]));
          const reactorName =
            user.displayName || user.firstName || "Ein Freund";

          await createNotification(pool, {
            userId: access.ownerId,
            type: "workout-reaction",
            title: "Neue Reaktion auf dein Training",
            message: `${reactorName} hat mit ${emoji} auf dein Training reagiert`,
            payload: {
              workoutId,
              emoji,
              reactorUserId: req.user.id,
            },
          });
        }
      }

      const reactions = await listWorkoutReactions(workoutId, req.user.id, access.ownerId);

      return res.status(201).json({ reactions });
    } catch (error) {
      console.error("Create reaction error:", error);
      res.status(500).json({ error: "Serverfehler beim Reagieren." });
    }
  });

  router.delete("/:workoutId", authMiddleware, async (req, res) => {
    try {
      const { workoutId } = req.params;
      if (!workoutId) {
        return res.status(400).json({ error: "Workout-ID fehlt." });
      }

      const access = await ensureWorkoutAccess(workoutId, req.user.id);
      if (!access.allowed) {
        return res.status(404).json({ error: "Workout nicht gefunden." });
      }

      await pool.query(
        `DELETE FROM workout_reactions
         WHERE workout_id = $1 AND user_id = $2`,
        [workoutId, req.user.id]
      );

      const reactions = await listWorkoutReactions(workoutId, req.user.id, access.ownerId);

      res.json({ reactions });
    } catch (error) {
      console.error("Delete reaction error:", error);
      res.status(500).json({ error: "Serverfehler beim Entfernen." });
    }
  });

  router.get("/workout/:workoutId", authMiddleware, async (req, res) => {
    try {
      const { workoutId } = req.params;
      if (!workoutId) {
        return res.status(400).json({ error: "Workout-ID fehlt." });
      }

      const access = await ensureWorkoutAccess(workoutId, req.user.id);
      if (!access.allowed) {
        return res.status(404).json({ error: "Workout nicht gefunden." });
      }

      const reactions = await listWorkoutReactions(workoutId, req.user.id, access.ownerId);
      res.json({ reactions });
    } catch (error) {
      console.error("Get reactions error:", error);
      res.status(500).json({ error: "Serverfehler beim Laden." });
    }
  });

  return router;
};
