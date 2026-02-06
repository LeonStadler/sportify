import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { badgeService } from "../services/badgeService.js";
import { applyDisplayName, toCamelCase } from "../utils/helpers.js";
import {
  computePersonalFactor,
  normalizeDistanceToKm,
  normalizeDurationToSeconds,
} from "../utils/scoring.js";

export const createWorkoutsRouter = (pool) => {
  const router = express.Router();
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let activityTypeColumnChecked = false;

  const parsePreferences = (value) => {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch (_error) {
        return {};
      }
    }
    return {};
  };

  const getBodyWeightKg = (preferences) => {
    const raw = preferences?.metrics?.bodyWeightKg ?? preferences?.bodyWeightKg;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const ensureActivityTypeColumnCompatible = async (client) => {
    if (activityTypeColumnChecked) return;

    const { rows } = await client.query(`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'workout_activities'
        AND column_name = 'activity_type'
      LIMIT 1
    `);

    const column = rows[0];
    if (
      column &&
      (column.data_type === "USER-DEFINED" ||
        column.udt_name === "activity_type")
    ) {
      await client.query(`
        ALTER TABLE workout_activities
        ALTER COLUMN activity_type TYPE VARCHAR(100)
        USING activity_type::text
      `);
      console.log(
        "[Workout] workout_activities.activity_type wurde auf VARCHAR migriert."
      );
    }

    activityTypeColumnChecked = true;
  };

  // GET /api/workouts - Get user workouts with pagination and filtering
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const { page = 1, limit = 10, type, startDate, endDate } = req.query;
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.max(Math.min(parseInt(limit, 10) || 10, 50), 1);
      const offset = (pageNumber - 1) * limitNumber;

      const filters = ["w.user_id = $1"];
      const params = [req.user.id];

      const parseDate = (value) => {
        if (!value) return null;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      let paramIndex = params.length + 1;

      if (type && type !== "all") {
        filters.push(
          `EXISTS (SELECT 1 FROM workout_activities wa_filter WHERE wa_filter.workout_id = w.id AND wa_filter.exercise_id = $${paramIndex})`
        );
        params.push(type);
        paramIndex++;
      }

      const start = parseDate(startDate);
      const end = parseDate(endDate);

      if (startDate && !start) {
        return res.status(400).json({ error: "Ungültiges Startdatum" });
      }

      if (endDate && !end) {
        return res.status(400).json({ error: "Ungültiges Enddatum" });
      }

      if (start && end && start > end) {
        filters.push(`w.start_time BETWEEN $${paramIndex} AND $${paramIndex + 1}::timestamp`);
        params.push(end);
        params.push(start);
        paramIndex += 2;
      } else {
        if (start) {
          filters.push(`w.start_time >= $${paramIndex}`);
          params.push(start);
          paramIndex++;
        }
        if (end) {
          filters.push(`w.start_time < $${paramIndex}::date + INTERVAL '1 day'`);
          params.push(end);
          paramIndex++;
        }
      }

      const filterClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
      const paramsWithPagination = [...params, limitNumber, offset];

      const query = `
                SELECT 
                    w.id,
                    w.title,
                    w.description,
                    w.start_time,
                    w.duration,
                    w.use_end_time,
                    w.difficulty,
                    w.session_type,
                    w.rounds,
                    w.rest_between_sets_seconds,
                    w.rest_between_activities_seconds,
                    w.rest_between_rounds_seconds,
                    w.category,
                    w.discipline,
                    w.movement_pattern,
                    CASE
                      WHEN w.movement_patterns IS NOT NULL THEN w.movement_patterns
                      WHEN w.movement_pattern IS NOT NULL THEN ARRAY[w.movement_pattern]
                      ELSE ARRAY[]::text[]
                    END AS movement_patterns,
                    w.visibility,
                    false AS is_template,
                    w.source_template_id,
                    w.source_template_root_id,
                    MAX(source_template.title) AS source_template_title,
                    MAX(
                      CASE
                        WHEN source_owner.id IS NULL THEN NULL
                        WHEN source_owner.display_preference = 'nickname'
                          AND NULLIF(TRIM(source_owner.nickname), '') IS NOT NULL
                          THEN source_owner.nickname
                        WHEN source_owner.display_preference = 'fullName'
                          THEN NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
                        ELSE COALESCE(
                          NULLIF(TRIM(source_owner.first_name), ''),
                          NULLIF(TRIM(source_owner.nickname), ''),
                          NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
                        )
                      END
                    ) AS source_template_owner_display_name,
                    MAX(source_owner.id::text) AS source_template_owner_id,
                    MAX(root_template.title) AS source_template_root_title,
                    MAX(
                      CASE
                        WHEN root_owner.id IS NULL THEN NULL
                        WHEN root_owner.display_preference = 'nickname'
                          AND NULLIF(TRIM(root_owner.nickname), '') IS NOT NULL
                          THEN root_owner.nickname
                        WHEN root_owner.display_preference = 'fullName'
                          THEN NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
                        ELSE COALESCE(
                          NULLIF(TRIM(root_owner.first_name), ''),
                          NULLIF(TRIM(root_owner.nickname), ''),
                          NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
                        )
                      END
                    ) AS source_template_root_owner_display_name,
                    MAX(root_owner.id::text) AS source_template_root_owner_id,
                    w.created_at,
                    w.updated_at,
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', wa.id,
                                'activityType', wa.activity_type,
                                'quantity', wa.quantity,
                                'points', wa.points_earned,
                                'notes', wa.notes,
                                'unit', wa.unit,
                                'restBetweenSetsSeconds', wa.rest_between_sets_seconds,
                                'restAfterSeconds', wa.rest_after_seconds,
                                'effort', wa.effort,
                                'supersetGroup', wa.superset_group,
                                'setsData', wa.sets_data
                            ) ORDER BY wa.order_index, wa.id
                        ) FILTER (WHERE wa.id IS NOT NULL),
                        '[]'::json
                    ) as activities,
                    reactions.reactions as reactions
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN workout_templates source_template ON source_template.id = w.source_template_id
                LEFT JOIN users source_owner ON source_owner.id = source_template.user_id
                LEFT JOIN workout_templates root_template ON root_template.id = COALESCE(w.source_template_root_id, w.source_template_id)
                LEFT JOIN users root_owner ON root_owner.id = root_template.user_id
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
                ${filterClause}
                GROUP BY w.id, w.title, w.description, w.start_time, w.duration, w.use_end_time, w.difficulty, w.session_type, w.rounds, w.rest_between_sets_seconds, w.rest_between_activities_seconds, w.rest_between_rounds_seconds, w.category, w.discipline, w.movement_pattern, w.movement_patterns, w.visibility, w.source_template_id, w.source_template_root_id, w.created_at, w.updated_at, reactions.reactions
                ORDER BY w.start_time DESC, w.created_at DESC
                LIMIT $${params.length + 1} OFFSET $${params.length + 2};
            `;

      const { rows } = await pool.query(query, paramsWithPagination);

      // Get total count for pagination
      const countQuery = `
                SELECT COUNT(DISTINCT w.id) as total
                FROM workouts w
                ${filterClause};
            `;
      const { rows: countRows } = await pool.query(countQuery, params);
      const totalCount = Number(countRows[0].total) || 0;

      // For own workouts, always show all reactions with names
      // Settings only apply to friends viewing the workouts
      const isOwnWorkout = true; // This is always own workouts in this route

      const workouts = rows.map((row) => {
        const activities = Array.isArray(row.activities)
          ? row.activities
              .map((a) => {
                let sets = null;
                if (a.setsData) {
                  // JSONB wird von PostgreSQL manchmal als Objekt zurückgegeben, manchmal als String
                  if (typeof a.setsData === "string") {
                    try {
                      sets = JSON.parse(a.setsData);
                    } catch (parseError) {
                      console.error("Error parsing setsData:", parseError);
                      sets = null;
                    }
                  } else {
                    // Bereits ein Objekt
                    sets = a.setsData;
                  }
                }
                return {
                  id: a.id,
                  activityType: a.activityType,
                  amount: a.quantity,
                  points: a.points,
                  notes: a.notes,
                  unit: a.unit,
                  restBetweenSetsSeconds: a.restBetweenSetsSeconds ?? null,
                  restAfterSeconds: a.restAfterSeconds ?? null,
                  effort: a.effort ?? null,
                  supersetGroup: a.supersetGroup ?? null,
                  sets,
                };
              })
              .filter((a) => a.id !== null)
          : [];

        const workout = toCamelCase(row);

        // Process reactions
        const rawReactions = Array.isArray(row.reactions) ? row.reactions : [];
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

        const reactions = rawReactions.map((reaction) => {
          const allUsers = mapReactionUsers(reaction.users);
          const currentUserReaction = allUsers.some(
            (user) => user.id === req.user.id
          )
            ? reaction.emoji
            : undefined;

          // For own workouts, always show all user names
          const users = allUsers;

          return {
            emoji: reaction.emoji,
            count: Number(reaction.count) || allUsers.length,
            users,
            ...(currentUserReaction ? { currentUserReaction } : {}),
          };
        });

        // Extrahiere workoutDate und startTime aus start_time (TIMESTAMPTZ)
        // start_time ist NOT NULL, daher sollte es immer vorhanden sein
        // Speichere auch start_time als ISO-String für Frontend
        let startTimeDate = null;

        // Handle different formats: Date object, ISO string, or timestamp
        if (workout.startTime) {
          if (workout.startTime instanceof Date) {
            startTimeDate = workout.startTime;
          } else if (typeof workout.startTime === "string") {
            startTimeDate = new Date(workout.startTime);
          } else {
            // Try to convert to Date
            startTimeDate = new Date(workout.startTime);
          }
        }

        // Fallback: Use raw start_time from database if available
        if (
          (!startTimeDate || isNaN(startTimeDate.getTime())) &&
          row.start_time
        ) {
          if (row.start_time instanceof Date) {
            startTimeDate = row.start_time;
          } else {
            startTimeDate = new Date(row.start_time);
          }
        }

        if (startTimeDate && !isNaN(startTimeDate.getTime())) {
          // workoutDate: Nur das Datum (YYYY-MM-DD)
          workout.workoutDate = startTimeDate.toISOString().split("T")[0];
          // startTime: Nur die Zeit (HH:mm)
          const hours = String(startTimeDate.getHours()).padStart(2, "0");
          const minutes = String(startTimeDate.getMinutes()).padStart(2, "0");
          workout.startTime = `${hours}:${minutes}`;
          // startTimeTimestamp: Vollständiger ISO-String für direkte Verwendung
          workout.startTimeTimestamp = startTimeDate.toISOString();
        } else {
          // Fallback: Verwende createdAt
          console.warn(
            "Invalid start_time for workout:",
            workout.id,
            "Using createdAt as fallback"
          );
          const createdAtDate = new Date(workout.createdAt);
          if (!isNaN(createdAtDate.getTime())) {
            workout.workoutDate = createdAtDate.toISOString().split("T")[0];
            const hours = String(createdAtDate.getHours()).padStart(2, "0");
            const minutes = String(createdAtDate.getMinutes()).padStart(2, "0");
            workout.startTime = `${hours}:${minutes}`;
            workout.startTimeTimestamp = createdAtDate.toISOString();
          } else {
            workout.workoutDate = null;
            workout.startTime = null;
            workout.startTimeTimestamp = null;
          }
        }

        return {
          ...workout,
          activities,
          reactions,
        };
      });

      res.json({
        workouts,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.max(Math.ceil(totalCount / limitNumber), 1),
          totalItems: totalCount,
          hasNext: pageNumber * limitNumber < totalCount,
          hasPrev: pageNumber > 1,
        },
      });
    } catch (error) {
      console.error("Get workouts error:", error);
      res.status(500).json({ error: "Serverfehler beim Laden der Workouts." });
    }
  });

  const buildTemplateAccessClause = (userIdParamIndex, alias = "w") => `
    (${alias}.user_id = $${userIdParamIndex}
      OR ${alias}.visibility = 'public'
      OR (
        ${alias}.visibility = 'friends'
        AND ${alias}.user_id IN (
          SELECT CASE
            WHEN requester_id = $${userIdParamIndex} THEN addressee_id
            ELSE requester_id
          END
          FROM friendships
          WHERE (requester_id = $${userIdParamIndex} OR addressee_id = $${userIdParamIndex})
            AND status = 'accepted'
        )
      )
    )
  `;

  // GET /api/workouts/templates - List template workouts accessible to user
  router.get("/templates", authMiddleware, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query || {};
      const params = [req.user.id, Number(limit), Number(offset)];

      const query = `
        SELECT 
          wt.id,
          wt.user_id,
          wt.title,
          wt.description,
          wt.start_time,
          wt.duration,
          wt.use_end_time,
          wt.difficulty,
          wt.session_type,
          wt.rounds,
          wt.rest_between_sets_seconds,
          wt.rest_between_activities_seconds,
          wt.rest_between_rounds_seconds,
          wt.category,
          wt.discipline,
          wt.movement_pattern,
          CASE
            WHEN wt.movement_patterns IS NOT NULL THEN wt.movement_patterns
            WHEN wt.movement_pattern IS NOT NULL THEN ARRAY[wt.movement_pattern]
            ELSE ARRAY[]::text[]
          END AS movement_patterns,
          wt.visibility,
          wt.source_template_id,
          wt.source_template_root_id,
          MAX(source_template.title) AS source_template_title,
          wt.created_at,
          wt.updated_at,
          u.first_name,
          u.last_name,
          u.nickname,
          u.display_preference,
          MAX(
            CASE
              WHEN source_owner.id IS NULL THEN NULL
              WHEN source_owner.display_preference = 'nickname'
                AND NULLIF(TRIM(source_owner.nickname), '') IS NOT NULL
                THEN source_owner.nickname
              WHEN source_owner.display_preference = 'fullName'
                THEN NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
              ELSE COALESCE(
                NULLIF(TRIM(source_owner.first_name), ''),
                NULLIF(TRIM(source_owner.nickname), ''),
                NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
              )
            END
          ) AS source_template_owner_display_name,
          MAX(source_owner.id::text) AS source_template_owner_id,
          MAX(root_template.title) AS source_template_root_title,
          MAX(
            CASE
              WHEN root_owner.id IS NULL THEN NULL
              WHEN root_owner.display_preference = 'nickname'
                AND NULLIF(TRIM(root_owner.nickname), '') IS NOT NULL
                THEN root_owner.nickname
              WHEN root_owner.display_preference = 'fullName'
                THEN NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
              ELSE COALESCE(
                NULLIF(TRIM(root_owner.first_name), ''),
                NULLIF(TRIM(root_owner.nickname), ''),
                NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
              )
            END
          ) AS source_template_root_owner_display_name,
          MAX(root_owner.id::text) AS source_template_root_owner_id,
          COALESCE(usage_stats.usage_count, 0)::int AS usage_count,
          COALESCE(mg.muscle_groups, ARRAY[]::text[]) AS muscle_groups,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', wta.id,
                'activityType', wta.activity_type,
                'quantity', wta.quantity,
                'points', wta.points_earned,
                'notes', wta.notes,
                'unit', wta.unit,
                'restBetweenSetsSeconds', wta.rest_between_sets_seconds,
                'restAfterSeconds', wta.rest_after_seconds,
                'effort', wta.effort,
                'supersetGroup', wta.superset_group,
                'setsData', wta.sets_data
              ) ORDER BY wta.order_index, wta.id
            ) FILTER (WHERE wta.id IS NOT NULL),
            '[]'::json
          ) as activities
        FROM workout_templates wt
        JOIN users u ON u.id = wt.user_id
        LEFT JOIN workout_template_activities wta ON wt.id = wta.template_id
        LEFT JOIN workout_templates source_template ON source_template.id = wt.source_template_id
        LEFT JOIN users source_owner ON source_owner.id = source_template.user_id
        LEFT JOIN workout_templates root_template ON root_template.id = COALESCE(wt.source_template_root_id, wt.source_template_id)
        LEFT JOIN users root_owner ON root_owner.id = root_template.user_id
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS usage_count
          FROM workouts used_workout
          WHERE used_workout.source_template_id = wt.id
        ) usage_stats ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(array_agg(DISTINCT mg), ARRAY[]::text[]) AS muscle_groups
          FROM workout_template_activities wta2
          JOIN exercises e ON e.id = wta2.exercise_id
          CROSS JOIN LATERAL unnest(e.muscle_groups) AS mg
          WHERE wta2.template_id = wt.id
        ) mg ON true
        WHERE ${buildTemplateAccessClause(1, "wt")}
        GROUP BY wt.id, u.id, mg.muscle_groups, usage_stats.usage_count
        ORDER BY wt.updated_at DESC
        LIMIT $2 OFFSET $3;
      `;

      const { rows } = await pool.query(query, params);
      const templates = rows.map((row) => {
        const activities = Array.isArray(row.activities)
          ? row.activities
              .map((a) => ({
                id: a.id,
                activityType: a.activityType,
                amount: a.quantity,
                points: a.points,
                notes: a.notes,
                unit: a.unit,
                restBetweenSetsSeconds: a.restBetweenSetsSeconds ?? null,
                restAfterSeconds: a.restAfterSeconds ?? null,
                effort: a.effort ?? null,
                supersetGroup: a.supersetGroup ?? null,
                sets: a.setsData
                  ? typeof a.setsData === "string"
                    ? JSON.parse(a.setsData)
                    : a.setsData
                  : null,
              }))
              .filter((a) => a.id !== null)
          : [];

        const workout = toCamelCase(row);
        workout.isTemplate = true;
        workout.activities = activities;
        workout.owner = {
          id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          nickname: row.nickname,
          displayPreference: row.display_preference,
        };
        let startTimeDate = null;
        if (workout.startTime) {
          if (workout.startTime instanceof Date) {
            startTimeDate = workout.startTime;
          } else {
            startTimeDate = new Date(workout.startTime);
          }
        }
        if (startTimeDate && !Number.isNaN(startTimeDate.getTime())) {
          workout.workoutDate = startTimeDate.toISOString().split("T")[0];
          const hours = String(startTimeDate.getHours()).padStart(2, "0");
          const minutes = String(startTimeDate.getMinutes()).padStart(2, "0");
          workout.startTime = `${hours}:${minutes}`;
          workout.startTimeTimestamp = startTimeDate.toISOString();
        }
        return workout;
      });

      res.json({ templates });
    } catch (error) {
      console.error("Template workouts error:", error);
      res.status(500).json({ error: "Serverfehler beim Laden der Vorlagen." });
    }
  });

  // GET /api/workouts/templates/:id - Get single template if accessible
  router.get("/templates/:id", authMiddleware, async (req, res) => {
    try {
      const templateId = req.params.id;
      const query = `
        SELECT 
          wt.id,
          wt.user_id,
          wt.title,
          wt.description,
          wt.start_time,
          wt.duration,
          wt.use_end_time,
          wt.difficulty,
          wt.session_type,
          wt.rounds,
          wt.rest_between_sets_seconds,
          wt.rest_between_activities_seconds,
          wt.rest_between_rounds_seconds,
          wt.category,
          wt.discipline,
          wt.movement_pattern,
          CASE
            WHEN wt.movement_patterns IS NOT NULL THEN wt.movement_patterns
            WHEN wt.movement_pattern IS NOT NULL THEN ARRAY[wt.movement_pattern]
            ELSE ARRAY[]::text[]
          END AS movement_patterns,
          wt.visibility,
          wt.source_template_id,
          wt.source_template_root_id,
          MAX(source_template.title) AS source_template_title,
          wt.created_at,
          wt.updated_at,
          u.first_name,
          u.last_name,
          u.nickname,
          u.display_preference,
          MAX(
            CASE
              WHEN source_owner.id IS NULL THEN NULL
              WHEN source_owner.display_preference = 'nickname'
                AND NULLIF(TRIM(source_owner.nickname), '') IS NOT NULL
                THEN source_owner.nickname
              WHEN source_owner.display_preference = 'fullName'
                THEN NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
              ELSE COALESCE(
                NULLIF(TRIM(source_owner.first_name), ''),
                NULLIF(TRIM(source_owner.nickname), ''),
                NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
              )
            END
          ) AS source_template_owner_display_name,
          MAX(source_owner.id::text) AS source_template_owner_id,
          MAX(root_template.title) AS source_template_root_title,
          MAX(
            CASE
              WHEN root_owner.id IS NULL THEN NULL
              WHEN root_owner.display_preference = 'nickname'
                AND NULLIF(TRIM(root_owner.nickname), '') IS NOT NULL
                THEN root_owner.nickname
              WHEN root_owner.display_preference = 'fullName'
                THEN NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
              ELSE COALESCE(
                NULLIF(TRIM(root_owner.first_name), ''),
                NULLIF(TRIM(root_owner.nickname), ''),
                NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
              )
            END
          ) AS source_template_root_owner_display_name,
          MAX(root_owner.id::text) AS source_template_root_owner_id,
          COALESCE(usage_stats.usage_count, 0)::int AS usage_count,
          COALESCE(mg.muscle_groups, ARRAY[]::text[]) AS muscle_groups,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', wta.id,
                'activityType', wta.activity_type,
                'quantity', wta.quantity,
                'points', wta.points_earned,
                'notes', wta.notes,
                'unit', wta.unit,
                'restBetweenSetsSeconds', wta.rest_between_sets_seconds,
                'restAfterSeconds', wta.rest_after_seconds,
                'effort', wta.effort,
                'supersetGroup', wta.superset_group,
                'setsData', wta.sets_data
              ) ORDER BY wta.order_index, wta.id
            ) FILTER (WHERE wta.id IS NOT NULL),
            '[]'::json
          ) as activities
        FROM workout_templates wt
        JOIN users u ON u.id = wt.user_id
        LEFT JOIN workout_template_activities wta ON wt.id = wta.template_id
        LEFT JOIN workout_templates source_template ON source_template.id = wt.source_template_id
        LEFT JOIN users source_owner ON source_owner.id = source_template.user_id
        LEFT JOIN workout_templates root_template ON root_template.id = COALESCE(wt.source_template_root_id, wt.source_template_id)
        LEFT JOIN users root_owner ON root_owner.id = root_template.user_id
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS usage_count
          FROM workouts used_workout
          WHERE used_workout.source_template_id = wt.id
        ) usage_stats ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(array_agg(DISTINCT mg), ARRAY[]::text[]) AS muscle_groups
          FROM workout_template_activities wta2
          JOIN exercises e ON e.id = wta2.exercise_id
          CROSS JOIN LATERAL unnest(e.muscle_groups) AS mg
          WHERE wta2.template_id = wt.id
        ) mg ON true
        WHERE wt.id = $1 AND ${buildTemplateAccessClause(2, "wt")}
        GROUP BY wt.id, u.id, mg.muscle_groups, usage_stats.usage_count
      `;
      const { rows } = await pool.query(query, [templateId, req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Vorlage nicht gefunden." });
      }
      const row = rows[0];
      const activities = Array.isArray(row.activities)
        ? row.activities
            .map((a) => ({
              id: a.id,
              activityType: a.activityType,
              amount: a.quantity,
              points: a.points,
              notes: a.notes,
              unit: a.unit,
              restBetweenSetsSeconds: a.restBetweenSetsSeconds ?? null,
              restAfterSeconds: a.restAfterSeconds ?? null,
              effort: a.effort ?? null,
              supersetGroup: a.supersetGroup ?? null,
              sets: a.setsData
                ? typeof a.setsData === "string"
                  ? JSON.parse(a.setsData)
                  : a.setsData
                : null,
            }))
            .filter((a) => a.id !== null)
        : [];
      const workout = toCamelCase(row);
      workout.isTemplate = true;
      workout.activities = activities;
      workout.owner = {
        id: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        nickname: row.nickname,
        displayPreference: row.display_preference,
      };
      let startTimeDate = null;
      if (workout.startTime) {
        if (workout.startTime instanceof Date) {
          startTimeDate = workout.startTime;
        } else {
          startTimeDate = new Date(workout.startTime);
        }
      }
      if (startTimeDate && !Number.isNaN(startTimeDate.getTime())) {
        workout.workoutDate = startTimeDate.toISOString().split("T")[0];
        const hours = String(startTimeDate.getHours()).padStart(2, "0");
        const minutes = String(startTimeDate.getMinutes()).padStart(2, "0");
        workout.startTime = `${hours}:${minutes}`;
        workout.startTimeTimestamp = startTimeDate.toISOString();
      }
      res.json(workout);
    } catch (error) {
      console.error("Template workout get error:", error);
      res.status(500).json({ error: "Serverfehler beim Laden der Vorlage." });
    }
  });

  // POST /api/workouts - Create new workout
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const {
        title,
        description,
        activities,
        workoutDate,
        duration,
        startTime,
        endTime,
        useEndTime,
        visibility,
        isTemplate,
        difficulty,
        sessionType,
        rounds,
        restBetweenSetsSeconds,
        restBetweenActivitiesSeconds,
        restBetweenRoundsSeconds,
        category,
        discipline,
        movementPattern,
        movementPatterns,
        sourceTemplateId,
      } = req.body;

      const parsePositiveInt = (value) => {
        const num = Number(value);
        return Number.isFinite(num) && num > 0 ? Math.round(num) : null;
      };

      const parseNonNegativeInt = (value) => {
        const num = Number(value);
        return Number.isFinite(num) && num >= 0 ? Math.round(num) : null;
      };

      const isTemplateRequest = Boolean(isTemplate);
      const normalizedVisibility = ["private", "friends", "public"].includes(
        visibility
      )
        ? visibility
        : "private";
      const normalizedDifficulty = parsePositiveInt(difficulty);
      const normalizedRounds = parsePositiveInt(rounds) ?? 1;
      const normalizedRestBetweenSetsSeconds = parseNonNegativeInt(
        restBetweenSetsSeconds
      );
      const normalizedRestBetweenActivitiesSeconds = parseNonNegativeInt(
        restBetweenActivitiesSeconds
      );
      const normalizedRestBetweenRoundsSeconds = parseNonNegativeInt(
        restBetweenRoundsSeconds
      );
      const rawSourceTemplateId =
        typeof sourceTemplateId === "string" && sourceTemplateId.trim().length > 0
          ? sourceTemplateId.trim()
          : null;
      let normalizedSourceTemplateId = null;
      let normalizedSourceTemplateRootId = null;

      console.log("Received workout data:", {
        title,
        activitiesCount: activities?.length,
        activities: activities?.map((a) => ({
          activityType: a.activityType,
          quantity: a.quantity,
          amount: a.amount,
          hasSets: !!a.sets,
          setsCount: a.sets?.length,
        })),
        visibility,
        isTemplate: isTemplateRequest,
        sourceTemplateId: rawSourceTemplateId,
      });

      if (!title || !title.trim()) {
        return res
          .status(400)
          .json({ error: "Workout-Titel ist erforderlich." });
      }

      if (
        !activities ||
        !Array.isArray(activities) ||
        activities.length === 0
      ) {
        return res
          .status(400)
          .json({ error: "Mindestens eine Aktivität ist erforderlich." });
      }

      // Load valid activity types from database
      const { rows: validExercises } = await pool.query(`
                SELECT id, slug FROM exercises WHERE is_active = true
            `);
      const { rows: aliasRows } = await pool.query(`
                SELECT ea.alias_slug, ea.exercise_id
                FROM exercise_aliases ea
                JOIN exercises e ON e.id = ea.exercise_id
                WHERE e.is_active = true
            `);
      const validActivityTypes = new Set(validExercises.map((ex) => ex.id));
      const normalizeExerciseKey = (value) =>
        String(value || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");
      const normalizedExerciseMap = new Map();
      validExercises.forEach((ex) => {
        if (ex.id) {
          normalizedExerciseMap.set(normalizeExerciseKey(ex.id), ex.id);
        }
        if (ex.slug) {
          normalizedExerciseMap.set(normalizeExerciseKey(ex.slug), ex.id);
        }
      });
      aliasRows.forEach((row) => {
        if (row.alias_slug) {
          normalizedExerciseMap.set(row.alias_slug, row.exercise_id);
        }
      });
      const resolveExerciseId = (activityType) => {
        const raw = String(activityType || "").trim();
        if (!raw) return null;
        if (validActivityTypes.has(raw)) return raw;
        const normalized = normalizeExerciseKey(raw);
        return normalizedExerciseMap.get(normalized) || null;
      };

      // Validate activities
      for (const activity of activities) {
        const resolvedExerciseId = resolveExerciseId(activity.activityType);
        if (!resolvedExerciseId) {
          return res
            .status(400)
            .json({
              error: `Ungültiger Aktivitätstyp: ${activity.activityType}`,
            });
        }
        activity.activityType = resolvedExerciseId;

        // Berechne Gesamtmenge: Wenn Sets vorhanden sind, summiere alle Reps
        let activityAmount = activity.quantity || activity.amount;
        if (
          activity.sets &&
          Array.isArray(activity.sets) &&
          activity.sets.length > 0
        ) {
          const totalFromSets = activity.sets.reduce(
            (sum, set) => sum + (set.reps || 0),
            0
          );
          // Verwende die berechnete Summe aus Sets, falls sie größer ist
          if (totalFromSets > 0) {
            activityAmount = totalFromSets;
          }
        }

        // Check both 'quantity' (new) and 'amount' (legacy) fields, berücksichtige auch Sets
        if (!activityAmount || activityAmount <= 0) {
          return res
            .status(400)
            .json({ error: "Aktivitätsmenge muss größer als 0 sein." });
        }
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");
        if (!isTemplateRequest) {
          await ensureActivityTypeColumnCompatible(client);
        }

        // First check if workouts table has required columns, add if missing
        if (!isTemplateRequest) {
          const checkColumnsQuery = `
                    SELECT column_name, data_type
                    FROM information_schema.columns 
                    WHERE table_name = 'workouts' 
                    AND column_name IN ('duration', 'start_time', 'use_end_time', 'category', 'discipline', 'movement_pattern', 'movement_patterns', 'source_template_id', 'source_template_root_id');
                `;
          const { rows: columnRows } = await client.query(checkColumnsQuery);
          const existingColumns = columnRows.map((row) => row.column_name);
          const startTimeType = columnRows.find(
            (row) => row.column_name === "start_time"
          )?.data_type;

          if (!existingColumns.includes("duration")) {
            await client.query(
              "ALTER TABLE workouts ADD COLUMN duration INTEGER;"
            );
          }
          if (!existingColumns.includes("start_time")) {
            await client.query(
              "ALTER TABLE workouts ADD COLUMN start_time TIMESTAMPTZ;"
            );
          } else if (
            startTimeType &&
            startTimeType !== "timestamp with time zone"
          ) {
            // Wenn start_time existiert aber nicht TIMESTAMPTZ ist, migriere es
            await client.query(`
                        ALTER TABLE workouts 
                        ALTER COLUMN start_time TYPE TIMESTAMPTZ 
                        USING CASE 
                            WHEN start_time IS NOT NULL AND workout_date IS NOT NULL 
                                THEN (workout_date::date + start_time::interval)::timestamptz
                            WHEN workout_date IS NOT NULL 
                                THEN workout_date::timestamptz
                            ELSE start_time::timestamptz
                        END;
                    `);
          }
          if (!existingColumns.includes("use_end_time")) {
            await client.query(
              "ALTER TABLE workouts ADD COLUMN use_end_time BOOLEAN DEFAULT false;"
            );
          }
          if (!existingColumns.includes("category")) {
            await client.query("ALTER TABLE workouts ADD COLUMN category VARCHAR(50);");
          }
          if (!existingColumns.includes("discipline")) {
            await client.query("ALTER TABLE workouts ADD COLUMN discipline VARCHAR(50);");
          }
          if (!existingColumns.includes("movement_pattern")) {
            await client.query("ALTER TABLE workouts ADD COLUMN movement_pattern VARCHAR(50);");
          }
          if (!existingColumns.includes("movement_patterns")) {
            await client.query("ALTER TABLE workouts ADD COLUMN movement_patterns TEXT[];");
          }
          if (!existingColumns.includes("source_template_id")) {
            await client.query(
            "ALTER TABLE workouts ADD COLUMN source_template_id UUID;"
          );
          }
          if (!existingColumns.includes("source_template_root_id")) {
            await client.query(
              "ALTER TABLE workouts ADD COLUMN source_template_root_id UUID;"
            );
          }
        }

        if (rawSourceTemplateId && UUID_REGEX.test(rawSourceTemplateId)) {
          const sourceTemplateCheckQuery = `
            SELECT wt.id
            FROM workout_templates wt
            WHERE wt.id = $1
              AND ${buildTemplateAccessClause(2, "wt")}
            LIMIT 1;
          `;
          const { rows: sourceTemplateRows } = await client.query(
            sourceTemplateCheckQuery,
            [rawSourceTemplateId, req.user.id]
          );
        if (sourceTemplateRows.length > 0) {
          normalizedSourceTemplateId = sourceTemplateRows[0].id;
        }
      }

      if (normalizedSourceTemplateId) {
        const { rows: rootRows } = await client.query(
          "SELECT id, source_template_root_id FROM workout_templates WHERE id = $1",
          [normalizedSourceTemplateId]
        );
        if (rootRows.length > 0) {
          normalizedSourceTemplateRootId =
            rootRows[0].source_template_root_id || rootRows[0].id;
        }
      }

        // Kombiniere workoutDate und startTime zu start_time (TIMESTAMPTZ)
        let finalStartTime = null;
        if (workoutDate) {
          const datePart = new Date(workoutDate);
          if (startTime && typeof startTime === "string") {
            // Kombiniere Datum und Zeit
            const [hours, minutes] = startTime.split(":").map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
              datePart.setHours(hours, minutes, 0, 0);
              finalStartTime = datePart.toISOString();
            }
          } else {
            // Nur Datum, Zeit bleibt 00:00:00
            finalStartTime = datePart.toISOString();
          }
        } else if (isTemplateRequest && existingStartTime) {
          finalStartTime = existingStartTime;
        } else {
          // Fallback: aktuelles Datum/Zeit
          finalStartTime = new Date().toISOString();
        }

        // Berechne duration
        let finalDuration = null;
        const finalUseEndTime = useEndTime === true;

        // Wenn useEndTime true ist und endTime vorhanden, berechne duration
        if (finalUseEndTime && endTime && startTime) {
          try {
            const [startHours, startMins] = startTime.split(":").map(Number);
            const [endHours, endMins] = endTime.split(":").map(Number);
            const startMinutes = startHours * 60 + startMins;
            const endMinutes = endHours * 60 + endMins;
            finalDuration = endMinutes - startMinutes;
            if (finalDuration < 0) {
              // Wenn Endzeit am nächsten Tag ist
              finalDuration = 24 * 60 + finalDuration;
            }
          } catch (e) {
            console.error("Error calculating duration from endTime:", e);
          }
        } else if (duration && duration > 0) {
          // Wenn duration direkt gesendet wurde
          finalDuration = duration;
        }

        const resolvedCategory = isTemplateRequest ? category || null : null;
        const resolvedDiscipline = isTemplateRequest ? discipline || null : null;
        const resolvedMovementPattern = isTemplateRequest
          ? movementPattern || null
          : null;
        const resolvedMovementPatterns = isTemplateRequest
          ? Array.isArray(movementPatterns)
            ? movementPatterns
            : movementPattern
              ? [movementPattern]
              : null
          : null;

        let workoutRows = [];
        if (isTemplateRequest) {
          const templateQuery = `
                    INSERT INTO workout_templates (
                      user_id,
                      title,
                      description,
                      start_time,
                      duration,
                      use_end_time,
                      difficulty,
                      session_type,
                      rounds,
                      rest_between_sets_seconds,
                      rest_between_activities_seconds,
                      rest_between_rounds_seconds,
                      category,
                      discipline,
                      movement_pattern,
                      movement_patterns,
                      source_template_id,
                      source_template_root_id,
                      visibility
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                    RETURNING id, title, description, start_time, duration, use_end_time, difficulty, session_type, rounds, rest_between_sets_seconds, rest_between_activities_seconds, rest_between_rounds_seconds, category, discipline, movement_pattern, movement_patterns, source_template_id, source_template_root_id, visibility, created_at, updated_at;
                `;
          const { rows } = await client.query(templateQuery, [
            req.user.id,
            title.trim(),
            description ? description.trim() : null,
            finalStartTime,
            finalDuration && finalDuration > 0 ? Math.round(finalDuration) : null,
            finalUseEndTime,
            normalizedDifficulty,
            sessionType || null,
            normalizedRounds,
            normalizedRestBetweenSetsSeconds,
            normalizedRestBetweenActivitiesSeconds,
            normalizedRestBetweenRoundsSeconds,
            resolvedCategory,
            resolvedDiscipline,
            resolvedMovementPattern,
            resolvedMovementPatterns,
            normalizedSourceTemplateId,
            normalizedSourceTemplateRootId,
            normalizedVisibility,
          ]);
          workoutRows = rows;
        } else {
          // Create workout with start_time (TIMESTAMPTZ), duration, and use_end_time
          const workoutQuery = `
                    INSERT INTO workouts (
                      user_id,
                      title,
                      description,
                      start_time,
                      duration,
                      use_end_time,
                      difficulty,
                      session_type,
                      rounds,
                      rest_between_sets_seconds,
                      rest_between_activities_seconds,
                      rest_between_rounds_seconds,
                      category,
                      discipline,
                      movement_pattern,
                      movement_patterns,
                      source_template_id,
                      source_template_root_id,
                      visibility
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                    RETURNING id, title, description, start_time, duration, use_end_time, difficulty, session_type, rounds, rest_between_sets_seconds, rest_between_activities_seconds, rest_between_rounds_seconds, category, discipline, movement_pattern, movement_patterns, source_template_id, source_template_root_id, visibility, created_at, updated_at;
                `;
          const { rows } = await client.query(workoutQuery, [
            req.user.id,
            title.trim(),
            description ? description.trim() : null,
            finalStartTime,
            finalDuration && finalDuration > 0 ? Math.round(finalDuration) : null,
            finalUseEndTime,
            normalizedDifficulty,
            sessionType || null,
            normalizedRounds,
            normalizedRestBetweenSetsSeconds,
            normalizedRestBetweenActivitiesSeconds,
            normalizedRestBetweenRoundsSeconds,
            resolvedCategory,
            resolvedDiscipline,
            resolvedMovementPattern,
            resolvedMovementPatterns,
            normalizedSourceTemplateId,
            normalizedSourceTemplateRootId,
            normalizedVisibility,
          ]);
          workoutRows = rows;
        }

        const workoutId = workoutRows[0].id;

        const { rows: userRows } = await client.query(
          `SELECT preferences FROM users WHERE id = $1`,
          [req.user.id]
        );
        const userPreferences = parsePreferences(userRows[0]?.preferences);
        const bodyWeightKg = getBodyWeightKg(userPreferences);

        // Load exercises with points from database
        const { rows: exerciseRows } = await client.query(`
                    SELECT id,
                           points_per_unit,
                           measurement_type,
                           supports_time,
                           supports_distance,
                           requires_weight,
                           allows_weight,
                           unit,
                           is_active
                    FROM exercises
                    WHERE is_active = true
                `);

        const exerciseMap = new Map();
        exerciseRows.forEach((ex) => {
          exerciseMap.set(ex.id, {
            pointsPerUnit: parseFloat(ex.points_per_unit) || 0,
            measurementType: ex.measurement_type || "reps",
            supportsTime: Boolean(ex.supports_time),
            supportsDistance: Boolean(ex.supports_distance),
            requiresWeight: Boolean(ex.requires_weight),
            allowsWeight: Boolean(ex.allows_weight),
            unit: ex.unit,
          });
        });

        const calculateActivityScore = ({
          activityType,
          activityAmount,
          unit,
          totalReps,
          totalDurationSec,
          totalDistanceKm,
          maxWeightKg,
          measurementType,
        }) => {
          const exercise = exerciseMap.get(activityType);
          if (!exercise) {
            return 0;
          }

          let normalizedAmount = 0;
          if (measurementType === "time") {
            normalizedAmount =
              totalDurationSec ||
              normalizeDurationToSeconds(activityAmount, unit);
          } else if (measurementType === "distance") {
            normalizedAmount =
              totalDistanceKm || normalizeDistanceToKm(activityAmount, unit);
          } else {
            normalizedAmount = totalReps || Number(activityAmount) || 0;
          }

          const basePoints = normalizedAmount * (exercise.pointsPerUnit || 0);
          if (!Number.isFinite(basePoints) || basePoints <= 0) {
            return 0;
          }

          const personalFactor =
            !isTemplateRequest && bodyWeightKg
              ? computePersonalFactor({
                  bodyWeightKg,
                  extraWeightKg: maxWeightKg,
                  maxDeviation: 0.2,
                })
              : 1;

          return Number((basePoints * personalFactor).toFixed(2));
        };

        if (!isTemplateRequest) {
          // Check if workout_activities table has sets column
          const checkSetsColumnQuery = `
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'workout_activities' AND column_name IN ('sets_data', 'unit');
                `;
          const { rows: setsColumnRows } =
            await client.query(checkSetsColumnQuery);

          const hasSetsData = setsColumnRows.some(
            (row) => row.column_name === "sets_data"
          );
          const hasUnit = setsColumnRows.some(
            (row) => row.column_name === "unit"
          );

          if (!hasSetsData) {
            // Add sets_data column if it doesn't exist
            console.log("Adding sets_data column to workout_activities");
            await client.query(
              "ALTER TABLE workout_activities ADD COLUMN sets_data JSONB;"
            );
          }

          if (!hasUnit) {
            // Add unit column if it doesn't exist
            console.log("Adding unit column to workout_activities");
            await client.query(
              "ALTER TABLE workout_activities ADD COLUMN unit VARCHAR(20);"
            );
          }
        }

        const activityTable = isTemplateRequest
          ? "workout_template_activities"
          : "workout_activities";
        const activityParentColumn = isTemplateRequest ? "template_id" : "workout_id";

        // Create activities
        const activitiesData = [];
        for (let i = 0; i < activities.length; i++) {
          const activity = activities[i];

          // Berechne Gesamtmenge: Wenn Sets vorhanden sind, summiere alle Reps
          let activityAmount = activity.quantity || activity.amount;
          let setsToStore = null;
          let totalReps = 0;
          let totalDurationSec = 0;
          let totalDistanceKm = 0;
          let maxWeightKg = 0;
          const exercise = exerciseMap.get(activity.activityType);
          const measurementType =
            exercise?.measurementType || "reps";

          if (
            activity.sets &&
            Array.isArray(activity.sets) &&
            activity.sets.length > 0
          ) {
            // Filtere Sets heraus, die keine Reps haben (reps <= 0)
            const validSets = activity.sets.filter(
              (set) =>
                set &&
                ((set.reps || 0) > 0 ||
                  (set.weight || 0) > 0 ||
                  (set.duration || 0) > 0 ||
                  (set.distance || 0) > 0)
            );
            validSets.forEach((set) => {
              const reps = Number(set.reps) || 0;
              const durationSec = normalizeDurationToSeconds(
                set.duration,
                activity.unit
              );
              const distanceKm = normalizeDistanceToKm(
                set.distance,
                activity.unit
              );
              const weight = Number(set.weight) || 0;
              totalReps += reps;
              totalDurationSec += durationSec;
              totalDistanceKm += distanceKm;
              if (weight > maxWeightKg) maxWeightKg = weight;
            });
            const totalFromSets =
              measurementType === "time"
                ? totalDurationSec
                : measurementType === "distance"
                  ? totalDistanceKm
                  : totalReps;

            // Verwende die berechnete Summe aus Sets, falls sie größer ist
            if (totalFromSets > 0) {
              activityAmount = totalFromSets;
              // Speichere nur gültige Sets (mit reps > 0)
              setsToStore = validSets.length > 0 ? validSets : null;
            }
          }

          if (!setsToStore) {
            if (measurementType === "time") {
              totalDurationSec = normalizeDurationToSeconds(
                activityAmount,
                activity.unit
              );
            } else if (measurementType === "distance") {
              totalDistanceKm = normalizeDistanceToKm(
                activityAmount,
                activity.unit
              );
            } else {
              totalReps = Number(activityAmount) || 0;
            }
          }

          const points = calculateActivityScore({
            activityType: activity.activityType,
            activityAmount,
            unit: activity.unit,
            totalReps,
            totalDurationSec,
            totalDistanceKm,
            maxWeightKg,
            measurementType,
          });

          const activityQuery = `
                        INSERT INTO ${activityTable} (
                          ${activityParentColumn},
                          activity_type,
                          quantity,
                          points_earned,
                          exercise_id,
                          measurement_type,
                          reps,
                          duration,
                          distance,
                          weight,
                          notes,
                          order_index,
                          sets_data,
                          unit,
                          rest_between_sets_seconds,
                          rest_after_seconds,
                          effort,
                          superset_group
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                        RETURNING id, activity_type, quantity, points_earned, notes, order_index, sets_data, unit, rest_between_sets_seconds, rest_after_seconds, effort, superset_group;
                    `;

          let setsDataValue = null;
          if (setsToStore && setsToStore.length > 0) {
            try {
              // Sicherstellen, dass setsToStore ein Array von Objekten ist
              if (Array.isArray(setsToStore)) {
                setsDataValue = JSON.stringify(setsToStore);
                console.log(
                  `Activity ${i}: Storing ${setsToStore.length} sets, setsDataValue:`,
                  setsDataValue.substring(0, 100)
                );
              } else if (typeof setsToStore === "string") {
                // Falls es bereits ein String ist, verwenden wir ihn direkt
                setsDataValue = setsToStore;
                console.log(`Activity ${i}: Sets already stringified`);
              } else {
                // Falls es ein Objekt ist, stringify es
                setsDataValue = JSON.stringify(setsToStore);
              }
            } catch (jsonError) {
              console.error("Error stringifying sets:", jsonError);
              console.error("setsToStore:", setsToStore);
              setsDataValue = null;
            }
          }

          try {
            const { rows: activityRows } = await client.query(activityQuery, [
              workoutId,
              activity.activityType,
              activityAmount,
              points,
              activity.activityType,
              measurementType || null,
              totalReps || null,
              totalDurationSec || null,
              totalDistanceKm || null,
              maxWeightKg || null,
              activity.notes ? activity.notes.trim() : null,
              i,
              setsDataValue,
              activity.unit || "Stück",
              parseNonNegativeInt(activity.restBetweenSetsSeconds),
              parseNonNegativeInt(activity.restAfterSeconds),
              parsePositiveInt(activity.effort),
              activity.supersetGroup || null,
            ]);
            const row = toCamelCase(activityRows[0]);
            row.amount = row.quantity;
            row.points = row.pointsEarned;
            if (row.setsData) {
              // JSONB wird von PostgreSQL manchmal als Objekt zurückgegeben, manchmal als String
              if (typeof row.setsData === "string") {
                try {
                  row.sets = JSON.parse(row.setsData);
                } catch (parseError) {
                  console.error("Error parsing setsData:", parseError);
                  row.sets = null;
                }
              } else {
                // Bereits ein Objekt
                row.sets = row.setsData;
              }
            }
            delete row.quantity;
            delete row.pointsEarned;
            delete row.setsData;
            activitiesData.push(row);
          } catch (queryError) {
            console.error(`Error inserting activity ${i}:`, queryError);
            console.error("Activity data:", {
              activityType: activity.activityType,
              activityAmount,
              points,
              setsDataValue,
              unit: activity.unit || "Stück",
            });
            throw queryError;
          }
        }

        if (!isTemplateRequest) {
          const { rows: lifetimeTotals } = await client.query(
            `SELECT wa.exercise_id, COALESCE(SUM(wa.quantity), 0) AS total_quantity
             FROM workouts w
             JOIN workout_activities wa ON w.id = wa.workout_id
             WHERE w.user_id = $1
               AND wa.exercise_id IS NOT NULL
             GROUP BY wa.exercise_id`,
            [req.user.id]
          );

          for (const total of lifetimeTotals) {
            await badgeService.handleLifetimeMilestones(
              client,
              req.user.id,
              total.exercise_id,
              Number(total.total_quantity) || 0
            );
          }
        }

        await client.query("COMMIT");

        const workout = toCamelCase(workoutRows[0]);
        workout.isTemplate = isTemplateRequest;
        workout.isTemplate = isTemplateRequest;

        // Extrahiere workoutDate und startTime aus start_time (TIMESTAMPTZ)
        // start_time ist NOT NULL, daher sollte es immer vorhanden sein
        // Speichere auch start_time als ISO-String für Frontend
        let startTimeDate = null;

        // Handle different formats: Date object, ISO string, or timestamp
        if (workout.startTime) {
          if (workout.startTime instanceof Date) {
            startTimeDate = workout.startTime;
          } else if (typeof workout.startTime === "string") {
            startTimeDate = new Date(workout.startTime);
          } else {
            // Try to convert to Date
            startTimeDate = new Date(workout.startTime);
          }
        }

        // Fallback: Use raw start_time from database if available
        if (
          (!startTimeDate || isNaN(startTimeDate.getTime())) &&
          workoutRows[0].start_time
        ) {
          if (workoutRows[0].start_time instanceof Date) {
            startTimeDate = workoutRows[0].start_time;
          } else {
            startTimeDate = new Date(workoutRows[0].start_time);
          }
        }

        if (startTimeDate && !isNaN(startTimeDate.getTime())) {
          // workoutDate: Nur das Datum (YYYY-MM-DD)
          workout.workoutDate = startTimeDate.toISOString().split("T")[0];
          // startTime: Nur die Zeit (HH:mm)
          const hours = String(startTimeDate.getHours()).padStart(2, "0");
          const minutes = String(startTimeDate.getMinutes()).padStart(2, "0");
          workout.startTime = `${hours}:${minutes}`;
          // startTimeTimestamp: Vollständiger ISO-String für direkte Verwendung
          workout.startTimeTimestamp = startTimeDate.toISOString();
        } else {
          // Fallback: Verwende createdAt
          console.warn(
            "Invalid start_time for workout:",
            workout.id,
            "Using createdAt as fallback"
          );
          const createdAtDate = new Date(workout.createdAt);
          if (!isNaN(createdAtDate.getTime())) {
            workout.workoutDate = createdAtDate.toISOString().split("T")[0];
            const hours = String(createdAtDate.getHours()).padStart(2, "0");
            const minutes = String(createdAtDate.getMinutes()).padStart(2, "0");
            workout.startTime = `${hours}:${minutes}`;
            workout.startTimeTimestamp = createdAtDate.toISOString();
          } else {
            workout.workoutDate = null;
            workout.startTime = null;
            workout.startTimeTimestamp = null;
          }
        }

        const newWorkout = {
          ...workout,
          activities: activitiesData,
        };

        res.status(201).json(newWorkout);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Create workout error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
        column: error.column,
      });

      // Sende immer Details im Development-Modus
      const isDevelopment = process.env.NODE_ENV !== "production";

      // Erstelle eine detaillierte Fehlermeldung
      let errorMessage = error.message || "Unbekannter Fehler";
      if (error.detail) {
        errorMessage += ` - ${error.detail}`;
      }
      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }

      res.status(500).json({
        error: "Serverfehler beim Erstellen des Workouts.",
        details: isDevelopment ? errorMessage : undefined,
        code: error.code,
      });
    }
  });

  // GET /api/workouts/:id - Get single workout
  router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const workoutId = req.params.id;
      const query = `
                SELECT
                    w.id, w.title, w.description, 
                    w.start_time,
                    w.duration,
                    w.use_end_time,
                    w.difficulty,
                    w.session_type,
                    w.rounds,
                    w.rest_between_sets_seconds,
                    w.rest_between_activities_seconds,
                    w.rest_between_rounds_seconds,
                    w.visibility,
                    false AS is_template,
                    w.source_template_id,
                    w.source_template_root_id,
                    MAX(source_template.title) AS source_template_title,
                    MAX(
                      CASE
                        WHEN source_owner.id IS NULL THEN NULL
                        WHEN source_owner.display_preference = 'nickname'
                          AND NULLIF(TRIM(source_owner.nickname), '') IS NOT NULL
                          THEN source_owner.nickname
                        WHEN source_owner.display_preference = 'fullName'
                          THEN NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
                        ELSE COALESCE(
                          NULLIF(TRIM(source_owner.first_name), ''),
                          NULLIF(TRIM(source_owner.nickname), ''),
                          NULLIF(TRIM(CONCAT(COALESCE(source_owner.first_name, ''), ' ', COALESCE(source_owner.last_name, ''))), '')
                        )
                      END
                    ) AS source_template_owner_display_name,
                    MAX(source_owner.id::text) AS source_template_owner_id,
                    MAX(root_template.title) AS source_template_root_title,
                    MAX(
                      CASE
                        WHEN root_owner.id IS NULL THEN NULL
                        WHEN root_owner.display_preference = 'nickname'
                          AND NULLIF(TRIM(root_owner.nickname), '') IS NOT NULL
                          THEN root_owner.nickname
                        WHEN root_owner.display_preference = 'fullName'
                          THEN NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
                        ELSE COALESCE(
                          NULLIF(TRIM(root_owner.first_name), ''),
                          NULLIF(TRIM(root_owner.nickname), ''),
                          NULLIF(TRIM(CONCAT(COALESCE(root_owner.first_name, ''), ' ', COALESCE(root_owner.last_name, ''))), '')
                        )
                      END
                    ) AS source_template_root_owner_display_name,
                    MAX(root_owner.id::text) AS source_template_root_owner_id,
                    w.created_at, w.updated_at,
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', wa.id,
                                'activityType', wa.activity_type,
                                'quantity', wa.quantity,
                                'points', wa.points_earned,
                                'notes', wa.notes,
                                'unit', wa.unit,
                                'restBetweenSetsSeconds', wa.rest_between_sets_seconds,
                                'restAfterSeconds', wa.rest_after_seconds,
                                'effort', wa.effort,
                                'supersetGroup', wa.superset_group,
                                'setsData', wa.sets_data
                            ) ORDER BY wa.order_index, wa.id
                        ) FILTER (WHERE wa.id IS NOT NULL),
                        '[]'::json
                    ) as activities
                FROM workouts w
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                LEFT JOIN workout_templates source_template ON source_template.id = w.source_template_id
                LEFT JOIN users source_owner ON source_owner.id = source_template.user_id
                LEFT JOIN workout_templates root_template ON root_template.id = COALESCE(w.source_template_root_id, w.source_template_id)
                LEFT JOIN users root_owner ON root_owner.id = root_template.user_id
                WHERE w.id = $1 AND w.user_id = $2
                GROUP BY w.id, w.title, w.description, w.start_time, w.duration, w.use_end_time, w.visibility, w.source_template_id, w.source_template_root_id, w.created_at, w.updated_at;
            `;
      const { rows } = await pool.query(query, [workoutId, req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Workout nicht gefunden." });
      }
      const row = rows[0];
      const activities = Array.isArray(row.activities)
        ? row.activities
            .map((a) => ({
              id: a.id,
              activityType: a.activityType,
              amount: a.quantity,
              points: a.points,
              notes: a.notes,
              unit: a.unit,
              restBetweenSetsSeconds: a.restBetweenSetsSeconds ?? null,
              restAfterSeconds: a.restAfterSeconds ?? null,
              effort: a.effort ?? null,
              supersetGroup: a.supersetGroup ?? null,
              sets: a.setsData
                ? typeof a.setsData === "string"
                  ? JSON.parse(a.setsData)
                  : a.setsData
                : null,
            }))
            .filter((a) => a.id !== null)
        : [];
      const workout = toCamelCase(row);

      // Extrahiere workoutDate und startTime aus start_time (TIMESTAMPTZ)
      // start_time ist NOT NULL, daher sollte es immer vorhanden sein
      // Speichere auch start_time als ISO-String für Frontend
      let startTimeDate = null;

      // Handle different formats: Date object, ISO string, or timestamp
      if (workout.startTime) {
        if (workout.startTime instanceof Date) {
          startTimeDate = workout.startTime;
        } else if (typeof workout.startTime === "string") {
          startTimeDate = new Date(workout.startTime);
        } else {
          // Try to convert to Date
          startTimeDate = new Date(workout.startTime);
        }
      }

      // Fallback: Use raw start_time from database if available
      if (
        (!startTimeDate || isNaN(startTimeDate.getTime())) &&
        row.start_time
      ) {
        if (row.start_time instanceof Date) {
          startTimeDate = row.start_time;
        } else {
          startTimeDate = new Date(row.start_time);
        }
      }

      if (startTimeDate && !isNaN(startTimeDate.getTime())) {
        // workoutDate: Nur das Datum (YYYY-MM-DD)
        workout.workoutDate = startTimeDate.toISOString().split("T")[0];
        // startTime: Nur die Zeit (HH:mm)
        const hours = String(startTimeDate.getHours()).padStart(2, "0");
        const minutes = String(startTimeDate.getMinutes()).padStart(2, "0");
        workout.startTime = `${hours}:${minutes}`;
        // startTimeTimestamp: Vollständiger ISO-String für direkte Verwendung
        workout.startTimeTimestamp = startTimeDate.toISOString();
      } else {
        // Fallback: Verwende createdAt
        console.warn(
          "Invalid start_time for workout:",
          workout.id,
          "Using createdAt as fallback"
        );
        const createdAtDate = new Date(workout.createdAt);
        if (!isNaN(createdAtDate.getTime())) {
          workout.workoutDate = createdAtDate.toISOString().split("T")[0];
          const hours = String(createdAtDate.getHours()).padStart(2, "0");
          const minutes = String(createdAtDate.getMinutes()).padStart(2, "0");
          workout.startTime = `${hours}:${minutes}`;
          workout.startTimeTimestamp = createdAtDate.toISOString();
        } else {
          workout.workoutDate = null;
          workout.startTime = null;
          workout.startTimeTimestamp = null;
        }
      }

      res.json({ ...workout, activities });
    } catch (error) {
      console.error("Get workout error:", error);
      res.status(500).json({ error: "Serverfehler beim Laden des Workouts." });
    }
  });

  // PUT /api/workouts/:id - Update workout
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const workoutId = req.params.id;
      const {
        title,
        description,
        activities,
        workoutDate,
        duration,
        startTime,
        endTime,
        useEndTime,
        visibility,
        isTemplate,
        difficulty,
        sessionType,
        rounds,
        restBetweenSetsSeconds,
        restBetweenActivitiesSeconds,
        restBetweenRoundsSeconds,
        category,
        discipline,
        movementPattern,
        movementPatterns,
      } = req.body;

      const parsePositiveInt = (value) => {
        const num = Number(value);
        return Number.isFinite(num) && num > 0 ? Math.round(num) : null;
      };

      const parseNonNegativeInt = (value) => {
        const num = Number(value);
        return Number.isFinite(num) && num >= 0 ? Math.round(num) : null;
      };

      const isTemplateRequest = Boolean(isTemplate);
      const normalizedVisibility = ["private", "friends", "public"].includes(
        visibility
      )
        ? visibility
        : "private";
      const normalizedDifficulty = parsePositiveInt(difficulty);
      const normalizedRounds = parsePositiveInt(rounds) ?? 1;
      const normalizedRestBetweenSetsSeconds = parseNonNegativeInt(
        restBetweenSetsSeconds
      );
      const normalizedRestBetweenActivitiesSeconds = parseNonNegativeInt(
        restBetweenActivitiesSeconds
      );
      const normalizedRestBetweenRoundsSeconds = parseNonNegativeInt(
        restBetweenRoundsSeconds
      );

      if (!title || !title.trim()) {
        return res
          .status(400)
          .json({ error: "Workout-Titel ist erforderlich." });
      }
      if (
        !activities ||
        !Array.isArray(activities) ||
        activities.length === 0
      ) {
        return res
          .status(400)
          .json({ error: "Mindestens eine Aktivität ist erforderlich." });
      }

      // Load valid activity types from database
      const { rows: validExercises } = await pool.query(`
                SELECT id, slug FROM exercises WHERE is_active = true
            `);
      const { rows: aliasRows } = await pool.query(`
                SELECT ea.alias_slug, ea.exercise_id
                FROM exercise_aliases ea
                JOIN exercises e ON e.id = ea.exercise_id
                WHERE e.is_active = true
            `);
      const validActivityTypes = new Set(validExercises.map((ex) => ex.id));
      const normalizeExerciseKey = (value) =>
        String(value || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");
      const normalizedExerciseMap = new Map();
      validExercises.forEach((ex) => {
        if (ex.id) {
          normalizedExerciseMap.set(normalizeExerciseKey(ex.id), ex.id);
        }
        if (ex.slug) {
          normalizedExerciseMap.set(normalizeExerciseKey(ex.slug), ex.id);
        }
      });
      aliasRows.forEach((row) => {
        if (row.alias_slug) {
          normalizedExerciseMap.set(row.alias_slug, row.exercise_id);
        }
      });
      const resolveExerciseId = (activityType) => {
        const raw = String(activityType || "").trim();
        if (!raw) return null;
        if (validActivityTypes.has(raw)) return raw;
        const normalized = normalizeExerciseKey(raw);
        return normalizedExerciseMap.get(normalized) || null;
      };

      // Validate activities
      for (const activity of activities) {
        const resolvedExerciseId = resolveExerciseId(activity.activityType);
        if (!resolvedExerciseId) {
          return res
            .status(400)
            .json({
              error: `Ungültiger Aktivitätstyp: ${activity.activityType}`,
            });
        }
        activity.activityType = resolvedExerciseId;

        // Berechne Gesamtmenge: Wenn Sets vorhanden sind, summiere alle Reps
        let activityAmount = activity.quantity || activity.amount;
        if (
          activity.sets &&
          Array.isArray(activity.sets) &&
          activity.sets.length > 0
        ) {
          const totalFromSets = activity.sets.reduce(
            (sum, set) => sum + (set.reps || 0),
            0
          );
          // Verwende die berechnete Summe aus Sets, falls sie größer ist
          if (totalFromSets > 0) {
            activityAmount = totalFromSets;
          }
        }

        // Check both 'quantity' (new) and 'amount' (legacy) fields, berücksichtige auch Sets
        if (!activityAmount || activityAmount <= 0) {
          return res
            .status(400)
            .json({ error: "Aktivitätsmenge muss größer als 0 sein." });
        }
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const templateCheckQuery =
          "SELECT id, start_time FROM workout_templates WHERE id = $1 AND user_id = $2";
        const { rows: templateRows } = await client.query(templateCheckQuery, [
          workoutId,
          req.user.id,
        ]);
        const isTemplateRecord = templateRows.length > 0;
        let existingStartTime = templateRows[0]?.start_time ?? null;

        if (!isTemplateRecord) {
          await ensureActivityTypeColumnCompatible(client);

          const checkQuery =
            "SELECT id, start_time FROM workouts WHERE id = $1 AND user_id = $2";
          const { rows: checkRows } = await client.query(checkQuery, [
            workoutId,
            req.user.id,
          ]);
          if (checkRows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Workout nicht gefunden." });
          }
          existingStartTime = checkRows[0]?.start_time ?? null;

          const checkColumnsQuery = `
                    SELECT column_name
                    FROM information_schema.columns 
                    WHERE table_name = 'workouts' 
                    AND column_name IN ('category', 'discipline', 'movement_pattern', 'movement_patterns');
                `;
          const { rows: columnRows } = await client.query(checkColumnsQuery);
          const existingColumns = columnRows.map((row) => row.column_name);
          if (!existingColumns.includes("category")) {
            await client.query("ALTER TABLE workouts ADD COLUMN category VARCHAR(50);");
          }
          if (!existingColumns.includes("discipline")) {
            await client.query("ALTER TABLE workouts ADD COLUMN discipline VARCHAR(50);");
          }
          if (!existingColumns.includes("movement_pattern")) {
            await client.query("ALTER TABLE workouts ADD COLUMN movement_pattern VARCHAR(50);");
          }
          if (!existingColumns.includes("movement_patterns")) {
            await client.query("ALTER TABLE workouts ADD COLUMN movement_patterns TEXT[];");
          }
        }

        // Kombiniere workoutDate und startTime zu start_time (TIMESTAMPTZ)
        let finalStartTime = null;
        if (workoutDate) {
          const datePart = new Date(workoutDate);
          if (startTime && typeof startTime === "string") {
            // Kombiniere Datum und Zeit
            const [hours, minutes] = startTime.split(":").map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
              datePart.setHours(hours, minutes, 0, 0);
              finalStartTime = datePart.toISOString();
            }
          } else {
            // Nur Datum, Zeit bleibt 00:00:00
            finalStartTime = datePart.toISOString();
          }
        } else {
          // Fallback: aktuelles Datum/Zeit
          finalStartTime = new Date().toISOString();
        }

        // Berechne duration
        let finalDuration = null;
        const finalUseEndTime = useEndTime === true;

        // Wenn useEndTime true ist und endTime vorhanden, berechne duration
        if (finalUseEndTime && endTime && startTime) {
          try {
            const [startHours, startMins] = startTime.split(":").map(Number);
            const [endHours, endMins] = endTime.split(":").map(Number);
            const startMinutes = startHours * 60 + startMins;
            const endMinutes = endHours * 60 + endMins;
            finalDuration = endMinutes - startMinutes;
            if (finalDuration < 0) {
              // Wenn Endzeit am nächsten Tag ist
              finalDuration = 24 * 60 + finalDuration;
            }
          } catch (e) {
            console.error("Error calculating duration from endTime:", e);
          }
        } else if (duration && duration > 0) {
          // Wenn duration direkt gesendet wurde
          finalDuration = duration;
        }

        const resolvedCategory = isTemplateRecord ? category || null : null;
        const resolvedDiscipline = isTemplateRecord ? discipline || null : null;
        const resolvedMovementPattern = isTemplateRecord
          ? movementPattern || null
          : null;
        const resolvedMovementPatterns = isTemplateRecord
          ? Array.isArray(movementPatterns)
            ? movementPatterns
            : movementPattern
              ? [movementPattern]
              : null
          : null;

        let workoutRows = [];
        if (isTemplateRecord) {
          const updateTemplateQuery = `
                    UPDATE workout_templates
                    SET title = $1,
                        description = $2,
                        start_time = $3,
                        duration = $4,
                        use_end_time = $5,
                        difficulty = $6,
                        session_type = $7,
                        rounds = $8,
                        rest_between_sets_seconds = $9,
                        rest_between_activities_seconds = $10,
                        rest_between_rounds_seconds = $11,
                        category = $12,
                        discipline = $13,
                        movement_pattern = $14,
                        movement_patterns = $15,
                        visibility = $16,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $17 AND user_id = $18
                    RETURNING id, title, description, start_time, duration, use_end_time, difficulty, session_type, rounds, rest_between_sets_seconds, rest_between_activities_seconds, rest_between_rounds_seconds, category, discipline, movement_pattern, movement_patterns, source_template_id, source_template_root_id, visibility, created_at, updated_at;
                `;
          const { rows } = await client.query(updateTemplateQuery, [
            title.trim(),
            description ? description.trim() : null,
            finalStartTime,
            finalDuration && finalDuration > 0 ? Math.round(finalDuration) : null,
            finalUseEndTime,
            normalizedDifficulty,
            sessionType || null,
            normalizedRounds,
            normalizedRestBetweenSetsSeconds,
            normalizedRestBetweenActivitiesSeconds,
            normalizedRestBetweenRoundsSeconds,
            resolvedCategory,
            resolvedDiscipline,
            resolvedMovementPattern,
            resolvedMovementPatterns,
            normalizedVisibility,
            workoutId,
            req.user.id,
          ]);
          workoutRows = rows;
        } else {
          const updateQuery = `
                    UPDATE workouts
                    SET title = $1,
                        description = $2,
                        start_time = $3,
                        duration = $4,
                        use_end_time = $5,
                        difficulty = $6,
                        session_type = $7,
                        rounds = $8,
                        rest_between_sets_seconds = $9,
                        rest_between_activities_seconds = $10,
                        rest_between_rounds_seconds = $11,
                        category = $12,
                        discipline = $13,
                        movement_pattern = $14,
                        movement_patterns = $15,
                        visibility = $16,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $17 AND user_id = $18
                    RETURNING id, title, description, start_time, duration, use_end_time, difficulty, session_type, rounds, rest_between_sets_seconds, rest_between_activities_seconds, rest_between_rounds_seconds, category, discipline, movement_pattern, movement_patterns, source_template_id, source_template_root_id, visibility, created_at, updated_at;
                `;
          const { rows } = await client.query(updateQuery, [
            title.trim(),
            description ? description.trim() : null,
            finalStartTime,
            finalDuration && finalDuration > 0 ? Math.round(finalDuration) : null,
            finalUseEndTime,
            normalizedDifficulty,
            sessionType || null,
            normalizedRounds,
            normalizedRestBetweenSetsSeconds,
            normalizedRestBetweenActivitiesSeconds,
            normalizedRestBetweenRoundsSeconds,
            resolvedCategory,
            resolvedDiscipline,
            resolvedMovementPattern,
            resolvedMovementPatterns,
            normalizedVisibility,
            workoutId,
            req.user.id,
          ]);
          workoutRows = rows;
        }

        const activityTable = isTemplateRecord
          ? "workout_template_activities"
          : "workout_activities";
        const activityParentColumn = isTemplateRecord ? "template_id" : "workout_id";

        await client.query(
          `DELETE FROM ${activityTable} WHERE ${activityParentColumn} = $1`,
          [workoutId]
        );

        const { rows: userRows } = await client.query(
          `SELECT preferences FROM users WHERE id = $1`,
          [req.user.id]
        );
        const userPreferences = parsePreferences(userRows[0]?.preferences);
        const bodyWeightKg = getBodyWeightKg(userPreferences);

        // Load exercises with points from database
        const { rows: exerciseRows } = await client.query(`
                    SELECT id,
                           points_per_unit,
                           measurement_type,
                           supports_time,
                           supports_distance,
                           requires_weight,
                           allows_weight,
                           unit,
                           is_active
                    FROM exercises
                    WHERE is_active = true
                `);

        const exerciseMap = new Map();
        exerciseRows.forEach((ex) => {
          exerciseMap.set(ex.id, {
            pointsPerUnit: parseFloat(ex.points_per_unit) || 0,
            measurementType: ex.measurement_type || "reps",
            supportsTime: Boolean(ex.supports_time),
            supportsDistance: Boolean(ex.supports_distance),
            requiresWeight: Boolean(ex.requires_weight),
            allowsWeight: Boolean(ex.allows_weight),
            unit: ex.unit,
          });
        });

        const calculateActivityScore = ({
          activityType,
          activityAmount,
          unit,
          totalReps,
          totalDurationSec,
          totalDistanceKm,
          maxWeightKg,
          measurementType,
        }) => {
          const exercise = exerciseMap.get(activityType);
          if (!exercise) {
            return 0;
          }

          let normalizedAmount = 0;
          if (measurementType === "time") {
            normalizedAmount =
              totalDurationSec ||
              normalizeDurationToSeconds(activityAmount, unit);
          } else if (measurementType === "distance") {
            normalizedAmount =
              totalDistanceKm || normalizeDistanceToKm(activityAmount, unit);
          } else {
            normalizedAmount = totalReps || Number(activityAmount) || 0;
          }

          const basePoints = normalizedAmount * (exercise.pointsPerUnit || 0);
          if (!Number.isFinite(basePoints) || basePoints <= 0) {
            return 0;
          }

          const personalFactor =
            !isTemplateRecord && bodyWeightKg
              ? computePersonalFactor({
                  bodyWeightKg,
                  extraWeightKg: maxWeightKg,
                  maxDeviation: 0.2,
                })
              : 1;

          return Number((basePoints * personalFactor).toFixed(2));
        };

        const activitiesData = [];
        for (let i = 0; i < activities.length; i++) {
          const activity = activities[i];

          // Berechne Gesamtmenge: Wenn Sets vorhanden sind, summiere alle Reps
          let activityAmount = activity.quantity || activity.amount;
          let setsToStore = null;
          let totalReps = 0;
          let totalDurationSec = 0;
          let totalDistanceKm = 0;
          let maxWeightKg = 0;
          const exercise = exerciseMap.get(activity.activityType);
          const measurementType =
            exercise?.measurementType || "reps";

          if (
            activity.sets &&
            Array.isArray(activity.sets) &&
            activity.sets.length > 0
          ) {
            // Filtere Sets heraus, die keine Reps haben (reps <= 0)
            const validSets = activity.sets.filter(
              (set) =>
                set &&
                ((set.reps || 0) > 0 ||
                  (set.weight || 0) > 0 ||
                  (set.duration || 0) > 0 ||
                  (set.distance || 0) > 0)
            );
            validSets.forEach((set) => {
              const reps = Number(set.reps) || 0;
              const durationSec = normalizeDurationToSeconds(
                set.duration,
                activity.unit
              );
              const distanceKm = normalizeDistanceToKm(
                set.distance,
                activity.unit
              );
              const weight = Number(set.weight) || 0;
              totalReps += reps;
              totalDurationSec += durationSec;
              totalDistanceKm += distanceKm;
              if (weight > maxWeightKg) maxWeightKg = weight;
            });
            const totalFromSets =
              measurementType === "time"
                ? totalDurationSec
                : measurementType === "distance"
                  ? totalDistanceKm
                  : totalReps;

            // Verwende die berechnete Summe aus Sets, falls sie größer ist
            if (totalFromSets > 0) {
              activityAmount = totalFromSets;
              // Speichere nur gültige Sets (mit reps > 0)
              setsToStore = validSets.length > 0 ? validSets : null;
            }
          }

          if (!setsToStore) {
            if (measurementType === "time") {
              totalDurationSec = normalizeDurationToSeconds(
                activityAmount,
                activity.unit
              );
            } else if (measurementType === "distance") {
              totalDistanceKm = normalizeDistanceToKm(
                activityAmount,
                activity.unit
              );
            } else {
              totalReps = Number(activityAmount) || 0;
            }
          }

          const points = calculateActivityScore({
            activityType: activity.activityType,
            activityAmount,
            unit: activity.unit,
            totalReps,
            totalDurationSec,
            totalDistanceKm,
            maxWeightKg,
            measurementType,
          });
          const activityQuery = `
                        INSERT INTO ${activityTable} (
                          ${activityParentColumn},
                          activity_type,
                          quantity,
                          points_earned,
                          exercise_id,
                          measurement_type,
                          reps,
                          duration,
                          distance,
                          weight,
                          notes,
                          order_index,
                          sets_data,
                          unit,
                          rest_between_sets_seconds,
                          rest_after_seconds,
                          effort,
                          superset_group
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                        RETURNING id, activity_type, quantity, points_earned, notes, order_index, sets_data, unit, rest_between_sets_seconds, rest_after_seconds, effort, superset_group;
                    `;

          let setsDataValue = null;
          if (setsToStore && setsToStore.length > 0) {
            try {
              // Sicherstellen, dass setsToStore ein Array von Objekten ist
              if (Array.isArray(setsToStore)) {
                setsDataValue = JSON.stringify(setsToStore);
              } else if (typeof setsToStore === "string") {
                // Falls es bereits ein String ist, verwenden wir ihn direkt
                setsDataValue = setsToStore;
              } else {
                // Falls es ein Objekt ist, stringify es
                setsDataValue = JSON.stringify(setsToStore);
              }
            } catch (jsonError) {
              console.error("Error stringifying sets:", jsonError);
              console.error("setsToStore:", setsToStore);
              setsDataValue = null;
            }
          }

          const { rows: activityRows } = await client.query(activityQuery, [
            workoutId,
            activity.activityType,
            activityAmount,
            points,
            activity.activityType,
            measurementType || null,
            totalReps || null,
            totalDurationSec || null,
            totalDistanceKm || null,
            maxWeightKg || null,
            activity.notes ? activity.notes.trim() : null,
            i,
            setsDataValue,
            activity.unit || "Stück",
            parseNonNegativeInt(activity.restBetweenSetsSeconds),
            parseNonNegativeInt(activity.restAfterSeconds),
            parsePositiveInt(activity.effort),
            activity.supersetGroup || null,
          ]);
          const row = toCamelCase(activityRows[0]);
          row.amount = row.quantity;
          row.points = row.pointsEarned;
          if (row.setsData) {
            // JSONB wird von PostgreSQL manchmal als Objekt zurückgegeben, manchmal als String
            if (typeof row.setsData === "string") {
              try {
                row.sets = JSON.parse(row.setsData);
              } catch (parseError) {
                console.error("Error parsing setsData:", parseError);
                row.sets = null;
              }
            } else {
              // Bereits ein Objekt
              row.sets = row.setsData;
            }
          }
          delete row.quantity;
          delete row.pointsEarned;
          delete row.setsData;
          activitiesData.push(row);
        }

        if (!isTemplateRecord) {
          const { rows: lifetimeTotals } = await client.query(
            `SELECT wa.exercise_id, COALESCE(SUM(wa.quantity), 0) AS total_quantity
             FROM workouts w
             JOIN workout_activities wa ON w.id = wa.workout_id
             WHERE w.user_id = $1
               AND wa.exercise_id IS NOT NULL
             GROUP BY wa.exercise_id`,
            [req.user.id]
          );

          for (const total of lifetimeTotals) {
            await badgeService.handleLifetimeMilestones(
              client,
              req.user.id,
              total.exercise_id,
              Number(total.total_quantity) || 0
            );
          }
        }

        await client.query("COMMIT");

        const workout = toCamelCase(workoutRows[0]);

        // Extrahiere workoutDate und startTime aus start_time (TIMESTAMPTZ)
        // start_time ist NOT NULL, daher sollte es immer vorhanden sein
        // Speichere auch start_time als ISO-String für Frontend
        let startTimeDate = null;

        // Handle different formats: Date object, ISO string, or timestamp
        if (workout.startTime) {
          if (workout.startTime instanceof Date) {
            startTimeDate = workout.startTime;
          } else if (typeof workout.startTime === "string") {
            startTimeDate = new Date(workout.startTime);
          } else {
            // Try to convert to Date
            startTimeDate = new Date(workout.startTime);
          }
        }

        // Fallback: Use raw start_time from database if available
        if (
          (!startTimeDate || isNaN(startTimeDate.getTime())) &&
          workoutRows[0].start_time
        ) {
          if (workoutRows[0].start_time instanceof Date) {
            startTimeDate = workoutRows[0].start_time;
          } else {
            startTimeDate = new Date(workoutRows[0].start_time);
          }
        }

        if (startTimeDate && !isNaN(startTimeDate.getTime())) {
          // workoutDate: Nur das Datum (YYYY-MM-DD)
          workout.workoutDate = startTimeDate.toISOString().split("T")[0];
          // startTime: Nur die Zeit (HH:mm)
          const hours = String(startTimeDate.getHours()).padStart(2, "0");
          const minutes = String(startTimeDate.getMinutes()).padStart(2, "0");
          workout.startTime = `${hours}:${minutes}`;
          // startTimeTimestamp: Vollständiger ISO-String für direkte Verwendung
          workout.startTimeTimestamp = startTimeDate.toISOString();
        } else {
          // Fallback: Verwende createdAt
          console.warn(
            "Invalid start_time for workout:",
            workout.id,
            "Using createdAt as fallback"
          );
          const createdAtDate = new Date(workout.createdAt);
          if (!isNaN(createdAtDate.getTime())) {
            workout.workoutDate = createdAtDate.toISOString().split("T")[0];
            const hours = String(createdAtDate.getHours()).padStart(2, "0");
            const minutes = String(createdAtDate.getMinutes()).padStart(2, "0");
            workout.startTime = `${hours}:${minutes}`;
            workout.startTimeTimestamp = createdAtDate.toISOString();
          } else {
            workout.workoutDate = null;
            workout.startTime = null;
            workout.startTimeTimestamp = null;
          }
        }

        const updatedWorkout = {
          ...workout,
          activities: activitiesData,
        };
        res.json(updatedWorkout);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Update workout error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Aktualisieren des Workouts." });
    }
  });

  // DELETE /api/workouts/:id - Delete workout
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const workoutId = req.params.id;

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const templateCheckQuery =
          "SELECT id FROM workout_templates WHERE id = $1 AND user_id = $2";
        const { rows: templateRows } = await client.query(templateCheckQuery, [
          workoutId,
          req.user.id,
        ]);

        if (templateRows.length > 0) {
          await client.query(
            "DELETE FROM workout_template_activities WHERE template_id = $1",
            [workoutId]
          );
          await client.query(
            "DELETE FROM workout_templates WHERE id = $1 AND user_id = $2",
            [workoutId, req.user.id]
          );
          await client.query("COMMIT");
          return res.json({ message: "Workout erfolgreich gelöscht." });
        }

        // Check if workout exists and belongs to user
        const checkQuery =
          "SELECT id FROM workouts WHERE id = $1 AND user_id = $2";
        const { rows: checkRows } = await client.query(checkQuery, [
          workoutId,
          req.user.id,
        ]);

        if (checkRows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Workout nicht gefunden." });
        }

        // Delete activities first (due to foreign key constraint)
        await client.query(
          "DELETE FROM workout_activities WHERE workout_id = $1",
          [workoutId]
        );

        // Delete workout
        await client.query(
          "DELETE FROM workouts WHERE id = $1 AND user_id = $2",
          [workoutId, req.user.id]
        );

        await client.query("COMMIT");

        res.json({ message: "Workout erfolgreich gelöscht." });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Delete workout error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Löschen des Workouts." });
    }
  });

  return router;
};
