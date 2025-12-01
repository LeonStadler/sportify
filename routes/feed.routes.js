import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { toCamelCase } from "../utils/helpers.js";

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
          json_agg(
            json_build_object(
              'id', wa.id,
              'activityType', wa.activity_type,
              'amount', wa.quantity,
              'points', COALESCE(wa.points_earned, 0)
            ) ORDER BY wa.activity_type
          ) as activities,
          COALESCE(SUM(wa.points_earned), 0) as total_points
        FROM workouts w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN workout_activities wa ON wa.workout_id = w.id
        WHERE w.user_id = ANY($1::uuid[])${dateFilter}
        GROUP BY w.id, w.title, w.start_time, w.notes, u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
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
