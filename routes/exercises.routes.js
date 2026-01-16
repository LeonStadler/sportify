import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { slugifyExerciseName } from "../utils/exerciseUtils.js";
import { toCamelCase } from "../utils/helpers.js";
import { randomUUID } from "crypto";

const buildFacets = (rows) => {
  const categories = new Set();
  const muscleGroups = new Set();
  const equipment = new Set();

  rows.forEach((row) => {
    if (row.category) categories.add(row.category);
    if (Array.isArray(row.muscle_groups)) {
      row.muscle_groups.forEach((item) => muscleGroups.add(item));
    }
    if (Array.isArray(row.equipment)) {
      row.equipment.forEach((item) => equipment.add(item));
    }
  });

  return {
    categories: Array.from(categories).sort(),
    muscleGroups: Array.from(muscleGroups).sort(),
    equipment: Array.from(equipment).sort(),
  };
};

export const createExercisesRouter = (pool) => {
  const router = express.Router();

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const {
        limit = 200,
        offset = 0,
        query,
        category,
        discipline,
        movementPattern,
        measurementType,
        muscleGroup,
        equipment,
        requiresWeight,
        status,
      } = req.query || {};

      const filters = ["is_active = true", "merged_into IS NULL"];
      const params = [];
      let idx = 1;

      const addFilter = (sql, value) => {
        filters.push(sql.replace("$", `$${idx}`));
        params.push(value);
        idx += 1;
      };

      if (category && category !== "all") {
        addFilter("category = $", category);
      }
      if (discipline && discipline !== "all") {
        addFilter("discipline = $", discipline);
      }
      if (movementPattern && movementPattern !== "all") {
        addFilter("movement_pattern = $", movementPattern);
      }
      if (measurementType && measurementType !== "all") {
        addFilter("measurement_type = $", measurementType);
      }
      if (status && status !== "all") {
        addFilter("status = $", status);
      }
      if (muscleGroup && muscleGroup !== "all") {
        addFilter("$ = ANY(muscle_groups)", muscleGroup);
      }
      if (equipment && equipment !== "all") {
        addFilter("$ = ANY(equipment)", equipment);
      }
      if (requiresWeight && requiresWeight !== "all") {
        addFilter("requires_weight = $", requiresWeight === "yes");
      }
      if (query && String(query).trim()) {
        addFilter("(LOWER(name) LIKE $ OR LOWER(slug) LIKE $)", `%${String(query).toLowerCase()}%`);
      }

      const sql = `
        SELECT *
        FROM exercises
        WHERE ${filters.join(" AND ")}
        ORDER BY name ASC
        LIMIT $${idx} OFFSET $${idx + 1}
      `;
      params.push(Number(limit));
      params.push(Number(offset));

      const { rows } = await pool.query(sql, params);
      const exercises = rows.map((row) => {
        const exercise = toCamelCase(row);
        exercise.unitOptions = row.unit_options || [];
        return exercise;
      });

      res.json({ exercises, facets: buildFacets(rows) });
    } catch (error) {
      console.error("Exercises list error:", error);
      res.status(500).json({ error: "Serverfehler beim Laden der Übungen." });
    }
  });

  router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        "SELECT * FROM exercises WHERE id = $1 AND is_active = true",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Übung nicht gefunden." });
      }
      const exercise = toCamelCase(rows[0]);
      exercise.unitOptions = rows[0].unit_options || [];
      res.json(exercise);
    } catch (error) {
      console.error("Exercise get error:", error);
      res.status(500).json({ error: "Serverfehler beim Laden der Übung." });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        discipline,
        movementPattern,
        measurementType,
        difficultyTier,
        muscleGroups,
        equipment,
        requiresWeight,
        allowsWeight,
        supportsSets,
        supportsTime,
        supportsDistance,
        supportsGrade,
        unitOptions,
        pointsPerUnit,
        unit,
      } = req.body || {};

      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: "Name ist erforderlich." });
      }

      const slugBase = slugifyExerciseName(name);
      let slug = slugBase;
      if (!slug) {
        return res.status(400).json({ error: "Ungültiger Name." });
      }

      const { rows: existing } = await pool.query(
        "SELECT id FROM exercises WHERE slug = $1",
        [slug]
      );
      if (existing.length > 0) {
        const suffix = randomUUID().slice(0, 8);
        slug = `${slug}-${suffix}`;
      }

      const exerciseId = randomUUID();

      const insertQuery = `
        INSERT INTO exercises (
          id,
          name,
          description,
          slug,
          category,
          discipline,
          movement_pattern,
          measurement_type,
          points_per_unit,
          unit,
          requires_weight,
          allows_weight,
          supports_sets,
          supports_time,
          supports_distance,
          supports_grade,
          difficulty_tier,
          muscle_groups,
          equipment,
          unit_options,
          status,
          created_by,
          is_active
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20,$21,$22)
        RETURNING *
      `;

      const { rows } = await pool.query(insertQuery, [
        exerciseId,
        String(name).trim(),
        description ? String(description).trim() : null,
        slug,
        category || null,
        discipline || null,
        movementPattern || null,
        measurementType || null,
        pointsPerUnit ?? 1,
        unit || null,
        Boolean(requiresWeight),
        Boolean(allowsWeight),
        supportsSets !== undefined ? Boolean(supportsSets) : true,
        Boolean(supportsTime),
        Boolean(supportsDistance),
        Boolean(supportsGrade),
        difficultyTier ?? null,
        Array.isArray(muscleGroups) ? muscleGroups : null,
        Array.isArray(equipment) ? equipment : null,
        JSON.stringify(Array.isArray(unitOptions) ? unitOptions : []),
        "pending",
        req.user.id,
        true,
      ]);

      const exercise = toCamelCase(rows[0]);
      exercise.unitOptions = rows[0].unit_options || [];
      res.status(201).json(exercise);
    } catch (error) {
      console.error("Create exercise error:", error);
      res.status(500).json({ error: "Serverfehler beim Erstellen der Übung." });
    }
  });

  router.post("/:id/report", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, details } = req.body || {};
      if (!reason || !String(reason).trim()) {
        return res.status(400).json({ error: "Grund ist erforderlich." });
      }

      const { rows } = await pool.query(
        `INSERT INTO exercise_reports (id, exercise_id, reported_by, reason, details)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         RETURNING *`,
        [id, req.user.id, String(reason).trim(), details || null]
      );
      res.status(201).json(toCamelCase(rows[0]));
    } catch (error) {
      console.error("Exercise report error:", error);
      res.status(500).json({ error: "Serverfehler beim Melden der Übung." });
    }
  });

  router.post("/:id/edit-request", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { changeRequest, notes } = req.body || {};
      if (!changeRequest || typeof changeRequest !== "object") {
        return res
          .status(400)
          .json({ error: "Änderungsvorschlag ist erforderlich." });
      }

      const { rows } = await pool.query(
        `INSERT INTO exercise_edit_requests (id, exercise_id, requested_by, change_request, notes)
         VALUES (gen_random_uuid(), $1, $2, $3::jsonb, $4)
         RETURNING *`,
        [id, req.user.id, JSON.stringify(changeRequest), notes || null]
      );
      res.status(201).json(toCamelCase(rows[0]));
    } catch (error) {
      console.error("Exercise edit request error:", error);
      res.status(500).json({ error: "Serverfehler beim Senden der Anfrage." });
    }
  });

  return router;
};
