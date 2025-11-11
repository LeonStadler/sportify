import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { toCamelCase, USER_DISPLAY_NAME_SQL } from "../utils/helpers.js";

export const createScoreboardRouter = (pool) => {
  const router = express.Router();

  // GET /api/scoreboard/overall - Overall leaderboard
  router.get("/overall", authMiddleware, async (req, res) => {
    try {
      const { period = "all" } = req.query;
      let dateFilter = "";

      if (period === "week") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '7 days'`;
      } else if (period === "month") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '30 days'`;
      } else if (period === "year") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '365 days'`;
      }

      const query = `
                SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    COALESCE(SUM(wa.points_earned), 0) as total_points,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as total_pullups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as total_pushups,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as total_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as total_cycling,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'situps' THEN wa.quantity ELSE 0 END), 0) as total_situps
                FROM users u
                LEFT JOIN workouts w ON u.id = w.user_id ${dateFilter}
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
                HAVING COALESCE(SUM(wa.points_earned), 0) > 0
                ORDER BY total_points DESC
                LIMIT 50
            `;

      const { rows } = await pool.query(query);

      const leaderboard = rows.map((row, index) => {
        const converted = toCamelCase(row);
        return {
          id: converted.id,
          displayName: converted.displayName || "Athlet",
          avatarUrl: converted.avatarUrl || null,
          totalPoints: Number(converted.totalPoints) || 0,
          totalPullups: Number(converted.totalPullups) || 0,
          totalPushups: Number(converted.totalPushups) || 0,
          totalRunning: Number(converted.totalRunning) || 0,
          totalCycling: Number(converted.totalCycling) || 0,
          totalSitups: Number(converted.totalSitups) || 0,
          rank: index + 1,
          isCurrentUser: row.id === req.user.id,
        };
      });

      res.json({ leaderboard });
    } catch (error) {
      console.error("Scoreboard overall error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden des Scoreboards." });
    }
  });

  // GET /api/scoreboard/activity/:activity - Activity-specific leaderboard
  router.get("/activity/:activity", authMiddleware, async (req, res) => {
    try {
      const { activity } = req.params;
      const { period = "all" } = req.query;

      const validActivities = [
        "pullups",
        "pushups",
        "running",
        "cycling",
        "situps",
      ];
      if (!validActivities.includes(activity)) {
        return res.status(400).json({ error: "Ungültiger Aktivitätstyp" });
      }

      let dateFilter = "";
      if (period === "week") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '7 days'`;
      } else if (period === "month") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '30 days'`;
      } else if (period === "year") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '365 days'`;
      }

      const query = `
                SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    COALESCE(SUM(wa.quantity), 0) as total_amount,
                    COALESCE(SUM(wa.points_earned), 0) as total_points
                FROM users u
                LEFT JOIN workouts w ON u.id = w.user_id ${dateFilter}
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id AND wa.activity_type = $1
                GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
                HAVING COALESCE(SUM(wa.points_earned), 0) > 0
                ORDER BY total_points DESC
                LIMIT 50
            `;

      const { rows } = await pool.query(query, [activity]);

      const leaderboard = rows.map((row, index) => {
        const converted = toCamelCase(row);
        return {
          id: converted.id,
          displayName: converted.displayName || "Athlet",
          avatarUrl: converted.avatarUrl || null,
          totalAmount: Number(converted.totalAmount) || 0,
          totalPoints: Number(converted.totalPoints) || 0,
          rank: index + 1,
          isCurrentUser: row.id === req.user.id,
        };
      });

      res.json({ leaderboard });
    } catch (error) {
      console.error("Scoreboard activity error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden des Scoreboards." });
    }
  });

  return router;
};
