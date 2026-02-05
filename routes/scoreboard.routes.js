import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { toCamelCase, USER_DISPLAY_NAME_SQL } from "../utils/helpers.js";

export const createScoreboardRouter = (pool) => {
  const router = express.Router();

  const parseDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const buildDateFilter = ({ period, startDate, endDate, baseIndex = 1 }) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const hasExplicitRange = start && end;
    const params = [];
    let clause = "";

    if (hasExplicitRange) {
      const [from, to] = start <= end ? [start, end] : [end, start];
      params.push(from, to);
      clause = `AND w.start_time >= $${baseIndex} AND w.start_time < $${baseIndex + 1}::date + INTERVAL '1 day'`;
    } else if (period === "week") {
      clause = `AND w.start_time >= date_trunc('week', CURRENT_DATE) AND w.start_time < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'`;
    } else if (period === "month") {
      clause = `AND w.start_time >= NOW() - INTERVAL '30 days'`;
    } else if (period === "year") {
      clause = `AND w.start_time >= NOW() - INTERVAL '365 days'`;
    } else if (period === "custom") {
      return { error: "Ungültiger Zeitraum" };
    }

    return { clause, params };
  };

  // GET /api/scoreboard/overall - Overall leaderboard
  router.get("/overall", authMiddleware, async (req, res) => {
    try {
      const {
        period = "all",
        start: startDate,
        end: endDate,
        scope = "friends",
      } = req.query;
      const dateResult = buildDateFilter({
        period,
        startDate,
        endDate,
        baseIndex: 1,
      });
      if (dateResult.error) {
        return res.status(400).json({ error: dateResult.error });
      }
      let dateFilter = dateResult.clause;
      const params = [...dateResult.params];
      let paramIndex = params.length + 1;

      let scopeFilter = "";
      // Scope filter logic
      if (scope === "friends") {
        params.push(req.user.id);
        const userParamIndex = paramIndex;
        paramIndex++; // Increment for next param if any
        scopeFilter = `
          AND (
            u.id = $${userParamIndex} OR
            EXISTS (
              SELECT 1 FROM friendships f
              WHERE f.status = 'accepted' AND (
                (f.requester_id = $${userParamIndex} AND f.addressee_id = u.id) OR
                (f.requester_id = u.id AND f.addressee_id = $${userParamIndex})
              )
            )
          )
        `;
      } else {
        // Global scope: only show users who opted in
        scopeFilter = "AND u.show_in_global_rankings = true";
      }

      const query = `
                SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    COALESCE(SUM(wa.points_earned), 0) as total_points
                FROM users u
                LEFT JOIN workouts w ON u.id = w.user_id ${dateFilter}
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE 1=1 ${scopeFilter}
                GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
                HAVING COALESCE(SUM(wa.points_earned), 0) > 0
                ORDER BY total_points DESC
                LIMIT 50
            `;

      const { rows } = await pool.query(query, params);

      const leaderboard = rows.map((row, index) => {
        const converted = toCamelCase(row);
        return {
          id: converted.id,
          displayName: converted.displayName || "Athlet",
          avatarUrl: converted.avatarUrl || null,
          totalPoints: Number(converted.totalPoints) || 0,
          rank: index + 1,
          isCurrentUser: row.id === req.user.id,
        };
      });

      const userDateResult = buildDateFilter({
        period,
        startDate,
        endDate,
        baseIndex: 2,
      });
      if (userDateResult.error) {
        return res.status(400).json({ error: userDateResult.error });
      }

      const userTotalsQuery =
        scope === "global"
          ? `
                WITH totals AS (
                  SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    u.show_in_global_rankings,
                    COALESCE(SUM(wa.points_earned), 0) as total_points
                  FROM users u
                  LEFT JOIN workouts w ON u.id = w.user_id ${userDateResult.clause}
                  LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                  GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url, u.show_in_global_rankings
                ),
                eligible AS (
                  SELECT * FROM totals
                  WHERE show_in_global_rankings = true OR id = $1
                ),
                ranked AS (
                  SELECT
                    *,
                    CASE
                      WHEN total_points > 0 THEN RANK() OVER (ORDER BY total_points DESC)
                      ELSE NULL
                    END AS computed_rank
                  FROM eligible
                )
                SELECT * FROM ranked WHERE id = $1
            `
          : `
                WITH totals AS (
                  SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    u.show_in_global_rankings,
                    COALESCE(SUM(wa.points_earned), 0) as total_points
                  FROM users u
                  LEFT JOIN workouts w ON u.id = w.user_id ${userDateResult.clause}
                  LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                  GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url, u.show_in_global_rankings
                ),
                ranked AS (
                  SELECT
                    *,
                    CASE
                      WHEN total_points > 0 THEN RANK() OVER (ORDER BY total_points DESC)
                      ELSE NULL
                    END AS computed_rank
                  FROM totals
                )
                SELECT * FROM ranked WHERE id = $1
            `;

      const userParams = [req.user.id, ...userDateResult.params];
      const { rows: userRows } = await pool.query(userTotalsQuery, userParams);
      const userRow = userRows[0];
      const alreadyListed = leaderboard.some((entry) => entry.id === req.user.id);

      if (userRow && !alreadyListed) {
        const converted = toCamelCase(userRow);
        const isMuted =
          scope === "global" && userRow.show_in_global_rankings === false;
        const userEntry = {
          id: converted.id,
          displayName: converted.displayName || "Athlet",
          avatarUrl: converted.avatarUrl || null,
          totalPoints: Number(converted.totalPoints) || 0,
          rank: isMuted ? null : converted.computedRank ?? null,
          isCurrentUser: true,
          isMuted,
        };
        const insertIndex = leaderboard.findIndex(
          (entry) => (entry.totalPoints ?? 0) < userEntry.totalPoints
        );
        if (insertIndex === -1) {
          leaderboard.push(userEntry);
        } else {
          leaderboard.splice(insertIndex, 0, userEntry);
        }
      }

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
      const {
        period = "all",
        start: startDate,
        end: endDate,
        scope = "friends",
      } = req.query;

      const params = [activity];
      const dateResult = buildDateFilter({
        period,
        startDate,
        endDate,
        baseIndex: 2,
      });
      if (dateResult.error) {
        return res.status(400).json({ error: dateResult.error });
      }
      const dateFilter = dateResult.clause;
      params.push(...dateResult.params);
      let paramIndex = params.length + 1;

      let scopeFilter = "";
      if (scope === "personal") {
        params.push(req.user.id);
        const userParamIndex = paramIndex;
        paramIndex++;
        scopeFilter = `AND u.id = $${userParamIndex}`;
      } else if (scope === "friends") {
        params.push(req.user.id);
        const userParamIndex = paramIndex;
        paramIndex++;
        scopeFilter = `
          AND (
            u.id = $${userParamIndex} OR
            EXISTS (
              SELECT 1 FROM friendships f
              WHERE f.status = 'accepted' AND (
                (f.requester_id = $${userParamIndex} AND f.addressee_id = u.id) OR
                (f.requester_id = u.id AND f.addressee_id = $${userParamIndex})
              )
            )
          )
        `;
      } else {
        scopeFilter = "AND u.show_in_global_rankings = true";
      }

      const query = `
                SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN COALESCE(ex.id::text, wa.activity_type) = $1
                            OR ex.slug = $1
                            OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                               regexp_replace(lower($1), '[^a-z0-9]+', '', 'g')
                            OR wa.activity_type = $1
                          THEN wa.quantity
                          ELSE 0
                        END
                      ),
                      0
                    ) as total_amount,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN COALESCE(ex.id::text, wa.activity_type) = $1
                            OR ex.slug = $1
                            OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                               regexp_replace(lower($1), '[^a-z0-9]+', '', 'g')
                            OR wa.activity_type = $1
                          THEN wa.points_earned
                          ELSE 0
                        END
                      ),
                      0
                    ) as total_points
                FROM users u
                LEFT JOIN workouts w ON u.id = w.user_id ${dateFilter}
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN exercises ex
                  ON ex.id::text = wa.activity_type::text
                  OR ex.slug = wa.activity_type
                  OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                     regexp_replace(lower(wa.activity_type), '[^a-z0-9]+', '', 'g')
                WHERE 1=1 ${scopeFilter}
                  AND (
                    COALESCE(ex.id::text, wa.activity_type) = $1
                    OR ex.slug = $1
                    OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                       regexp_replace(lower($1), '[^a-z0-9]+', '', 'g')
                    OR wa.activity_type = $1
                  )
                GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
                HAVING COALESCE(SUM(wa.points_earned), 0) > 0
                ORDER BY total_points DESC
                LIMIT 50
            `;

      const { rows } = await pool.query(query, params);

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

      const userDateResult = buildDateFilter({
        period,
        startDate,
        endDate,
        baseIndex: 2,
      });
      if (userDateResult.error) {
        return res.status(400).json({ error: userDateResult.error });
      }
      const userParams = [req.user.id, ...userDateResult.params, activity];
      const userTotalsQuery =
        scope === "global"
          ? `
                WITH totals AS (
                  SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    u.show_in_global_rankings,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN COALESCE(ex.id::text, wa.activity_type) = $${userParams.length}
                            OR ex.slug = $${userParams.length}
                            OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                               regexp_replace(lower($${userParams.length}), '[^a-z0-9]+', '', 'g')
                            OR wa.activity_type = $${userParams.length}
                          THEN wa.quantity
                          ELSE 0
                        END
                      ),
                      0
                    ) as total_amount,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN COALESCE(ex.id::text, wa.activity_type) = $${userParams.length}
                            OR ex.slug = $${userParams.length}
                            OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                               regexp_replace(lower($${userParams.length}), '[^a-z0-9]+', '', 'g')
                            OR wa.activity_type = $${userParams.length}
                          THEN wa.points_earned
                          ELSE 0
                        END
                      ),
                      0
                    ) as total_points
                  FROM users u
                  LEFT JOIN workouts w ON u.id = w.user_id ${userDateResult.clause}
                  LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                  LEFT JOIN exercises ex
                    ON ex.id::text = wa.activity_type::text
                    OR ex.slug = wa.activity_type
                    OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                       regexp_replace(lower(wa.activity_type), '[^a-z0-9]+', '', 'g')
                  GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url, u.show_in_global_rankings
                ),
                eligible AS (
                  SELECT * FROM totals
                  WHERE show_in_global_rankings = true OR id = $1
                ),
                ranked AS (
                  SELECT
                    *,
                    CASE
                      WHEN total_points > 0 THEN RANK() OVER (ORDER BY total_points DESC)
                      ELSE NULL
                    END AS computed_rank
                  FROM eligible
                )
                SELECT * FROM ranked WHERE id = $1
            `
          : `
                WITH totals AS (
                  SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} as display_name,
                    u.avatar_url,
                    u.show_in_global_rankings,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN COALESCE(ex.id::text, wa.activity_type) = $${userParams.length}
                            OR ex.slug = $${userParams.length}
                            OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                               regexp_replace(lower($${userParams.length}), '[^a-z0-9]+', '', 'g')
                            OR wa.activity_type = $${userParams.length}
                          THEN wa.quantity
                          ELSE 0
                        END
                      ),
                      0
                    ) as total_amount,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN COALESCE(ex.id::text, wa.activity_type) = $${userParams.length}
                            OR ex.slug = $${userParams.length}
                            OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                               regexp_replace(lower($${userParams.length}), '[^a-z0-9]+', '', 'g')
                            OR wa.activity_type = $${userParams.length}
                          THEN wa.points_earned
                          ELSE 0
                        END
                      ),
                      0
                    ) as total_points
                  FROM users u
                  LEFT JOIN workouts w ON u.id = w.user_id ${userDateResult.clause}
                  LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                  LEFT JOIN exercises ex
                    ON ex.id::text = wa.activity_type::text
                    OR ex.slug = wa.activity_type
                    OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
                       regexp_replace(lower(wa.activity_type), '[^a-z0-9]+', '', 'g')
                  WHERE COALESCE(ex.id::text, wa.activity_type) = $${userParams.length}
                  GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url, u.show_in_global_rankings
                ),
                ranked AS (
                  SELECT
                    *,
                    CASE
                      WHEN total_points > 0 THEN RANK() OVER (ORDER BY total_points DESC)
                      ELSE NULL
                    END AS computed_rank
                  FROM totals
                )
                SELECT * FROM ranked WHERE id = $1
            `;

      const { rows: userRows } = await pool.query(userTotalsQuery, userParams);
      const userRow = userRows[0];
      const alreadyListed = leaderboard.some((entry) => entry.id === req.user.id);

      if (userRow && !alreadyListed) {
        const converted = toCamelCase(userRow);
        const isMuted =
          scope === "global" && userRow.show_in_global_rankings === false;
        const userEntry = {
          id: converted.id,
          displayName: converted.displayName || "Athlet",
          avatarUrl: converted.avatarUrl || null,
          totalAmount: Number(converted.totalAmount) || 0,
          totalPoints: Number(converted.totalPoints) || 0,
          rank: isMuted ? null : converted.computedRank ?? null,
          isCurrentUser: true,
          isMuted,
        };
        const insertIndex = leaderboard.findIndex(
          (entry) => (entry.totalPoints ?? 0) < userEntry.totalPoints
        );
        if (insertIndex === -1) {
          leaderboard.push(userEntry);
        } else {
          leaderboard.splice(insertIndex, 0, userEntry);
        }
      }

      const { rows: activityRows } = await pool.query(
        `
          SELECT id, name, measurement_type, supports_time, supports_distance
          FROM exercises
          WHERE id = $1
             OR slug = $1
             OR regexp_replace(lower(slug), '[^a-z0-9]+', '', 'g') =
                regexp_replace(lower($1), '[^a-z0-9]+', '', 'g')
        `,
        [activity]
      );
      const activityMetaRow = activityRows[0];

      res.json({
        leaderboard,
        activityMeta: activityMetaRow
          ? {
              id: activityMetaRow.id,
              name: activityMetaRow.name,
              measurementType: activityMetaRow.measurement_type,
              supportsTime: activityMetaRow.supports_time,
              supportsDistance: activityMetaRow.supports_distance,
            }
          : {
              id: activity,
              name: activity,
              measurementType: "reps",
              supportsTime: false,
              supportsDistance: false,
            },
      });
    } catch (error) {
      console.error("Scoreboard activity error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden des Scoreboards." });
    }
  });

  // GET /api/scoreboard/top-exercises - Top exercises for the given period/scope
  router.get("/top-exercises", authMiddleware, async (req, res) => {
    try {
      const {
        period = "all",
        start: startDate,
        end: endDate,
        scope = "friends",
        limit = "5",
      } = req.query;

      let dateFilter = "";
      const params = [];
      let paramIndex = 1;

      const parseDate = (value) => {
        if (!value) return null;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      const start = parseDate(startDate);
      const end = parseDate(endDate);
      const hasExplicitRange = start && end;

      if (hasExplicitRange) {
        const [from, to] = start <= end ? [start, end] : [end, start];
        params.push(from, to);
        dateFilter = `AND w.start_time >= $${paramIndex} AND w.start_time < $${paramIndex + 1}::date + INTERVAL '1 day'`;
        paramIndex += 2;
      } else if (period === "week") {
        dateFilter = `AND w.start_time >= date_trunc('week', CURRENT_DATE) AND w.start_time < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'`;
      } else if (period === "month") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '30 days'`;
      } else if (period === "year") {
        dateFilter = `AND w.start_time >= NOW() - INTERVAL '365 days'`;
      } else if (period === "custom") {
        return res.status(400).json({ error: "Ungültiger Zeitraum" });
      }

      let scopeFilter = "";
      if (scope === "personal") {
        params.push(req.user.id);
        const userParamIndex = paramIndex;
        paramIndex++;
        scopeFilter = `AND u.id = $${userParamIndex}`;
      } else if (scope === "friends") {
        params.push(req.user.id);
        const userParamIndex = paramIndex;
        paramIndex++;
        scopeFilter = `
          AND (
            u.id = $${userParamIndex} OR
            EXISTS (
              SELECT 1 FROM friendships f
              WHERE f.status = 'accepted' AND (
                (f.requester_id = $${userParamIndex} AND f.addressee_id = u.id) OR
                (f.requester_id = u.id AND f.addressee_id = $${userParamIndex})
              )
            )
          )
        `;
      } else {
        scopeFilter = "AND u.show_in_global_rankings = true";
      }

      const parsedLimit = Math.max(1, Math.min(Number(limit) || 5, 10));

      const query = `
        SELECT
          COALESCE(ex.id::text, wa.activity_type) AS activity_id,
          COALESCE(ex.name, wa.activity_type) AS activity_label,
          COALESCE(ex.measurement_type, 'reps') AS measurement_type,
          COALESCE(ex.supports_time, false) AS supports_time,
          COALESCE(ex.supports_distance, false) AS supports_distance,
          COALESCE(SUM(wa.points_earned), 0)::numeric AS total_points,
          COALESCE(
            NULLIF(SUM(wa.points_earned), 0),
            NULLIF(SUM(wa.quantity), 0),
            0
          )::numeric AS score
        FROM workout_activities wa
        JOIN workouts w ON w.id = wa.workout_id ${dateFilter}
        JOIN users u ON u.id = w.user_id
        LEFT JOIN exercises ex
          ON ex.id::text = wa.activity_type::text
          OR ex.slug = wa.activity_type
          OR regexp_replace(lower(ex.slug), '[^a-z0-9]+', '', 'g') =
             regexp_replace(lower(wa.activity_type), '[^a-z0-9]+', '', 'g')
        WHERE 1=1 ${scopeFilter}
        GROUP BY COALESCE(ex.id::text, wa.activity_type), ex.name, ex.measurement_type, ex.supports_time, ex.supports_distance
        HAVING COALESCE(SUM(wa.points_earned), 0) > 0
           OR COALESCE(SUM(wa.quantity), 0) > 0
        ORDER BY score DESC
        LIMIT $${paramIndex}
      `;
      params.push(parsedLimit);

      const { rows } = await pool.query(query, params);
      const exercises = rows.map((row) => ({
        id: row.activity_id,
        name: row.activity_label,
        measurementType: row.measurement_type,
        supportsTime: row.supports_time,
        supportsDistance: row.supports_distance,
        totalPoints: Number(row.total_points || 0),
      }));

      res.json({ exercises });
    } catch (error) {
      console.error("Scoreboard top exercises error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden der Top-Übungen." });
    }
  });

  return router;
};
