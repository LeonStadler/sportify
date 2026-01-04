import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { applyDisplayName, toCamelCase } from "../utils/helpers.js";

export const createFeedRouter = (pool, ensureFriendInfrastructure) => {
  const router = express.Router();

  // Helper: Parse date to ISO string
  const parseToISOString = (dateValue) => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    } else if (typeof dateValue === "string") {
      const testDate = new Date(dateValue);
      if (!isNaN(testDate.getTime())) {
        if (dateValue.includes("T") || dateValue.includes("Z")) {
          return dateValue;
        }
        return testDate.toISOString();
      }
    } else {
      const testDate = new Date(dateValue);
      if (!isNaN(testDate.getTime())) {
        return testDate.toISOString();
      }
    }
    return null;
  };

  // Helper: Get display name from user data
  const getDisplayName = (userData) => {
    let displayName = userData.firstName || userData.nickname || "Athlet";
    if (userData.displayPreference === "nickname" && userData.nickname) {
      displayName = userData.nickname;
    } else if (userData.displayPreference === "fullName") {
      const fullName = [userData.firstName, userData.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      displayName = fullName || displayName;
    }
    return displayName;
  };

  const mapReactionUsers = (users) => {
    if (!Array.isArray(users)) {
      return [];
    }

    return users.map((user) => {
      const mapped = applyDisplayName(toCamelCase(user));
      return {
        id: mapped.id,
        name: mapped.displayName || mapped.firstName || "Athlet",
        avatar: mapped.avatarUrl || null,
      };
    });
  };

  // Helper: Get friend IDs
  const getFriendIds = async (userId) => {
    try {
      const friendCheckQuery = `
        SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS friend_id
        FROM friendships
        WHERE (requester_id = $1 OR addressee_id = $1)
        AND status = 'accepted'
      `;
      const friendResult = await pool.query(friendCheckQuery, [userId]);
      return friendResult.rows.map((row) => row.friend_id);
    } catch (error) {
      console.warn("Could not check friendships:", error.message);
      return [];
    }
  };

  // GET /api/feed - Activity feed (grouped by workout)
  router.get("/", authMiddleware, async (req, res) => {
    try {
      await ensureFriendInfrastructure();

      const { page = 1, limit: limitQuery, period, start, end } = req.query;
      const limit = Math.max(1, Math.min(parseInt(limitQuery, 10) || 5, 50));
      const currentPage = Math.max(1, parseInt(page, 10) || 1);
      const offset = (currentPage - 1) * limit;

      const friendIds = await getFriendIds(req.user.id);
      const hasFriends = friendIds.length > 0;

      // Include own activities + friends
      const allUserIds = [...new Set([req.user.id, ...friendIds])];

      // Build date filter
      let dateFilter = "";
      const queryParams = [allUserIds];
      let paramIndex = 2;

      const parsedStart = start ? new Date(start) : null;
      const parsedEnd = end ? new Date(end) : null;
      const hasExplicitRange =
        parsedStart && !isNaN(parsedStart.getTime()) && parsedEnd && !isNaN(parsedEnd.getTime());

      if (hasExplicitRange) {
        dateFilter = ` AND w.start_time >= $${paramIndex} AND w.start_time <= $${paramIndex + 1}`;
        queryParams.push(parsedStart, parsedEnd);
        paramIndex += 2;
      } else if (period && period !== "all") {
        const now = new Date();
        let startDate;

        switch (period) {
          case "week":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "quarter":
            const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterMonth, 1);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case "custom":
            return res.status(400).json({ error: "Ungültiger Zeitraum" });
        }

        if (startDate) {
          dateFilter = ` AND w.start_time >= $${paramIndex}`;
          queryParams.push(startDate);
          paramIndex++;
        }
      }

      // Count total workouts for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT w.id) as total
        FROM workouts w
        WHERE w.user_id = ANY($1::uuid[])${dateFilter}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const totalItems = parseInt(countResult.rows[0]?.total || 0, 10);
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      // Get workouts with activities grouped
      const workoutsQuery = `
        SELECT 
          w.id as workout_id,
          w.title as workout_title,
          w.start_time,
          w.notes as workout_notes,
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.nickname,
          u.display_preference,
          u.avatar_url,
          u.preferences as owner_preferences,
          json_agg(
            json_build_object(
              'id', wa.id,
              'activityType', wa.activity_type,
              'amount', wa.quantity,
              'points', COALESCE(wa.points_earned, 0)
            ) ORDER BY wa.activity_type
          ) as activities,
          reactions.reactions as reactions,
          COALESCE(SUM(wa.points_earned), 0) as total_points
        FROM workouts w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN workout_activities wa ON wa.workout_id = w.id
        LEFT JOIN LATERAL (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'emoji', reaction_data.emoji,
                'count', reaction_data.count,
                'users', reaction_data.users
              ) ORDER BY reaction_data.emoji
            ),
            '[]'::jsonb
          ) AS reactions
          FROM (
            SELECT
              wr.emoji,
              COUNT(*)::int AS count,
              jsonb_agg(
                jsonb_build_object(
                  'id', ru.id,
                  'first_name', ru.first_name,
                  'last_name', ru.last_name,
                  'nickname', ru.nickname,
                  'display_preference', ru.display_preference,
                  'avatar_url', ru.avatar_url
                )
              ) AS users
            FROM workout_reactions wr
            JOIN users ru ON ru.id = wr.user_id
            WHERE wr.workout_id = w.id
            GROUP BY wr.emoji
          ) reaction_data
        ) reactions ON true
        WHERE w.user_id = ANY($1::uuid[])${dateFilter}
        GROUP BY w.id, w.title, w.start_time, w.notes, u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url, u.preferences, reactions.reactions
        ORDER BY w.start_time DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      const { rows } = await pool.query(workoutsQuery, queryParams);

      const workouts = rows.map((row) => {
        const userData = toCamelCase({
          first_name: row.first_name,
          last_name: row.last_name,
          nickname: row.nickname,
          display_preference: row.display_preference,
          avatar_url: row.avatar_url,
        });

        const displayName = getDisplayName(userData);
        const startTimeTimestamp = parseToISOString(row.start_time);

        // Filter out null activities (from LEFT JOIN when no activities exist)
        const activities = (row.activities || []).filter((a) => a.id !== null);
        
        // Get owner preferences for reaction visibility
        let ownerPreferences = {};
        try {
          ownerPreferences = typeof row.owner_preferences === 'string' 
            ? JSON.parse(row.owner_preferences) 
            : (row.owner_preferences || {});
        } catch (e) {
          ownerPreferences = {};
        }
        
        const friendsCanSee = ownerPreferences?.reactions?.friendsCanSee !== false; // default true
        const showNames = ownerPreferences?.reactions?.showNames !== false; // default true
        const isOwnWorkout = row.user_id === req.user.id;
        
        // Only show reactions if owner allows it (or if it's own workout)
        const rawReactions = (isOwnWorkout || friendsCanSee) && Array.isArray(row.reactions) ? row.reactions : [];
        const reactions = rawReactions.map((reaction) => {
          const allUsers = mapReactionUsers(reaction.users);
          const currentUserReaction = allUsers.some(
            (user) => user.id === req.user.id
          )
            ? reaction.emoji
            : undefined;

          // Only include user names if owner allows it (or if it's own workout)
          const users = (isOwnWorkout || showNames) ? allUsers : [];

          return {
            emoji: reaction.emoji,
            count: Number(reaction.count) || allUsers.length,
            users,
            ...(currentUserReaction ? { currentUserReaction } : {}),
          };
        });

        return {
          workoutId: row.workout_id,
          workoutTitle: row.workout_title || "Training",
          workoutNotes: row.workout_notes,
          startTimeTimestamp,
          userId: row.user_id,
          userName: displayName,
          userAvatar: userData.avatarUrl || null,
          userFirstName: userData.firstName,
          userLastName: userData.lastName,
          isOwnWorkout: row.user_id === req.user.id,
          activities,
          reactions,
          totalPoints: parseInt(row.total_points, 10) || 0,
        };
      });

      res.json({
        workouts,
        hasFriends,
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
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
