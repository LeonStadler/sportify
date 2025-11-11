import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { toCamelCase } from "../utils/helpers.js";

export const createFeedRouter = (pool, ensureFriendInfrastructure) => {
  const router = express.Router();

  // GET /api/feed - Activity feed
  router.get("/", authMiddleware, async (req, res) => {
    try {
      await ensureFriendInfrastructure();

      const { page = 1, limit: limitQuery } = req.query;
      const limit = Math.max(1, Math.min(parseInt(limitQuery, 10) || 20, 50));
      const currentPage = Math.max(1, parseInt(page, 10) || 1);
      const offset = (currentPage - 1) * limit;

      // Prüfe ob friendships-Tabelle existiert und ob der Benutzer Freunde hat
      let hasFriends = false;
      let friendIds = [];

      try {
        const friendCheckQuery = `
                    SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS friend_id
                    FROM friendships
                    WHERE (requester_id = $1 OR addressee_id = $1)
                    AND status = 'accepted'
                `;
        const friendResult = await pool.query(friendCheckQuery, [req.user.id]);
        friendIds = friendResult.rows.map((row) => row.friend_id);
        hasFriends = friendIds.length > 0;
      } catch (error) {
        // Tabelle existiert möglicherweise nicht - setze hasFriends auf false
        console.warn("Could not check friendships:", error.message);
        hasFriends = false;
      }

      // Füge eigene ID zu friendIds hinzu, damit auch eigene Aktivitäten angezeigt werden
      const allUserIds = [...new Set([req.user.id, ...friendIds])];

      // Aktivitäten von Freunden UND eigenen Aktivitäten
      const query = `
                SELECT
                    wa.id,
                    wa.activity_type,
                    wa.quantity as amount,
                    COALESCE(wa.points_earned, 0) as points,
                    w.start_time,
                    w.title as workout_title,
                    u.first_name,
                    u.last_name,
                    u.nickname,
                    u.display_preference,
                    u.avatar_url
                FROM workout_activities wa
                JOIN workouts w ON wa.workout_id = w.id
                JOIN users u ON w.user_id = u.id
                WHERE w.user_id = ANY($1::uuid[])
                ORDER BY w.start_time DESC
                LIMIT $2 OFFSET $3
            `;
      const queryParams = [allUserIds, limit, offset];

      const { rows } = await pool.query(query, queryParams);

      const activities = rows.map((row) => {
        const activity = toCamelCase(row);

        // Bestimme Display-Name basierend auf display_preference
        let displayName = activity.firstName || activity.nickname || "Athlet";
        if (activity.displayPreference === "nickname" && activity.nickname) {
          displayName = activity.nickname;
        } else if (activity.displayPreference === "fullName") {
          const fullName = [activity.firstName, activity.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          displayName = fullName || displayName;
        }

        // Konvertiere start_time (TIMESTAMPTZ) zu ISO-String - KEIN Fallback
        let startTimeTimestamp = null;

        if (row.start_time) {
          // start_time kommt direkt aus der Datenbank als TIMESTAMPTZ
          if (row.start_time instanceof Date) {
            startTimeTimestamp = row.start_time.toISOString();
          } else if (typeof row.start_time === "string") {
            // Prüfe ob es bereits ein gültiger ISO-String ist
            const testDate = new Date(row.start_time);
            if (!isNaN(testDate.getTime())) {
              // Wenn es bereits ein ISO-String ist, verwende ihn direkt
              if (
                row.start_time.includes("T") ||
                row.start_time.includes("Z")
              ) {
                startTimeTimestamp = row.start_time;
              } else {
                startTimeTimestamp = testDate.toISOString();
              }
            }
          } else {
            // Versuche es als Date zu konvertieren
            const testDate = new Date(row.start_time);
            if (!isNaN(testDate.getTime())) {
              startTimeTimestamp = testDate.toISOString();
            }
          }
        }

        // Wenn kein gültiges start_time vorhanden ist, verwende null (kein Fallback)
        if (!startTimeTimestamp) {
          console.warn(
            "No valid start_time found for activity:",
            activity.id,
            "start_time value:",
            row.start_time,
            "type:",
            typeof row.start_time
          );
        }

        return {
          id: activity.id,
          userName: displayName,
          userAvatar: activity.avatarUrl || null,
          userFirstName: activity.firstName,
          userLastName: activity.lastName,
          activityType: activity.activityType,
          amount: activity.amount ?? 0,
          points: activity.points ?? 0,
          workoutTitle: activity.workoutTitle,
          startTimeTimestamp: startTimeTimestamp,
        };
      });

      res.json({
        activities,
        hasFriends,
      });
    } catch (error) {
      console.error("Activity feed error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden des Activity Feeds." });
    }
  });

  return router;
};
