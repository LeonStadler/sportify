import { randomUUID } from "crypto";
import ExcelJS from "exceljs";
import express from "express";
import multer from "multer";
import { createAdminMiddleware } from "../middleware/adminMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendEmailQueueAlert } from "../services/alertService.js";
import { queueEmail } from "../services/emailService.js";
import {
  InvitationError,
  createInvitation,
} from "../services/invitationService.js";
import {
  cleanupStuckJobs,
  getJobStats,
} from "../services/jobCleanupService.js";
import { slugifyExerciseName } from "../utils/exerciseUtils.js";
import { getFrontendUrl, toCamelCase } from "../utils/helpers.js";
import { computePointsPerUnit } from "../utils/scoring.js";

export const createAdminRouter = (pool) => {
  const router = express.Router();
  const EXERCISE_IMPORT_COLUMNS = [
    "name",
    "description",
    "category",
    "discipline",
    "movementPattern",
    "measurementTypes",
    "distanceUnit",
    "timeUnit",
    "difficultyTier",
    "requiresWeight",
    "allowsWeight",
    "supportsSets",
    "muscleGroups",
    "equipment",
    "aliases",
  ];
  const EXERCISE_IMPORT_OPTIONS = {
    categories: ["Kraft", "Ausdauer", "Mobility", "Skills", "Functional"],
    disciplines: [
      "Calisthenics/Bodyweight",
      "Yoga/Stretching",
      "Weights/Gym",
      "Running",
      "Cycling",
      "Swimming",
    ],
    movementPatterns: [
      "push",
      "pull",
      "squat",
      "hinge",
      "carry",
      "rotation",
      "isometric",
    ],
    measurementTypes: [
      "reps",
      "time",
      "distance",
      "reps,time",
      "time,distance",
    ],
    distanceUnits: ["km", "m", "miles"],
    timeUnits: ["min", "sec"],
    booleanValues: ["true", "false"],
  };
  const adminMiddleware = createAdminMiddleware(pool);
  const upload = multer({ storage: multer.memoryStorage() });

  const buildExerciseImportMeta = () => ({
    required: [
      "name",
      "category",
      "discipline",
      "movementPattern",
      "measurementTypes",
      "difficultyTier",
      "muscleGroups",
      "equipment",
    ],
    allowedValues: {
      category: EXERCISE_IMPORT_OPTIONS.categories,
      discipline: EXERCISE_IMPORT_OPTIONS.disciplines,
      movementPattern: EXERCISE_IMPORT_OPTIONS.movementPatterns,
      measurementTypes: EXERCISE_IMPORT_OPTIONS.measurementTypes,
      distanceUnit: EXERCISE_IMPORT_OPTIONS.distanceUnits,
      timeUnit: EXERCISE_IMPORT_OPTIONS.timeUnits,
      boolean: EXERCISE_IMPORT_OPTIONS.booleanValues,
    },
    rules: [
      "measurementTypes ist eine kommaseparierte Liste. Erlaubt: reps, time, distance, reps,time, time,distance.",
      "Kombination reps,distance ist nicht erlaubt.",
      "muscleGroups, equipment und aliases werden kommasepariert angegeben.",
      "requiresWeight/allowsWeight/supportsSets akzeptieren true/false.",
    ],
  });

  const buildExerciseExampleRow = () => ({
    name: "Pull-Ups",
    category: "Kraft",
    discipline: "Calisthenics/Bodyweight",
    movementPattern: "pull",
    difficultyTier: 6,
    measurementTypes: "reps",
    requiresWeight: true,
    allowsWeight: false,
    supportsSets: true,
    muscleGroups: "Latissimus, Bizeps",
    equipment: "Bodyweight, Pull-up Bar",
    distanceUnit: "km",
    timeUnit: "min",
    aliases: "Pull-up, Klimmzug",
    description: "Klassische Klimmzüge an der Stange",
  });

  const isEmptyValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
  };

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const buildImportPayload = (raw) => {
    const name = String(raw?.name || "").trim();
    const isFullExport =
      raw &&
      typeof raw.unit === "string" &&
      (raw.slug || slugifyExerciseName(name));

    if (isFullExport) {
      const slug = String(raw.slug || slugifyExerciseName(name) || "").trim();
      if (!name || !slug) {
        return { valid: false, reason: "required", name, slug, isFullExport };
      }
      return {
        valid: true,
        isFullExport,
        name,
        slug,
        aliases: Array.isArray(raw.aliases) ? raw.aliases : [],
        values: {
          name,
          slug,
          description:
            raw.description != null ? String(raw.description).trim() : null,
          category: String(raw.category || "").trim() || null,
          discipline: String(raw.discipline || "").trim() || null,
          movementPattern: String(raw.movementPattern || "").trim() || null,
          measurementType:
            String(raw.measurementType || "reps").trim() || "reps",
          pointsPerUnit: Number.isFinite(Number(raw.pointsPerUnit))
            ? Number(raw.pointsPerUnit)
            : 1,
          unit: String(raw.unit || "reps").trim() || "reps",
          hasWeight: raw.hasWeight === true,
          hasSetMode: raw.hasSetMode !== false,
          requiresWeight: raw.requiresWeight === true,
          allowsWeight: raw.allowsWeight === true,
          supportsSets: raw.supportsSets !== false,
          supportsTime: raw.supportsTime === true,
          supportsDistance: raw.supportsDistance === true,
          supportsGrade: raw.supportsGrade === true,
          difficultyTier: Number.isFinite(Number(raw.difficultyTier))
            ? Number(raw.difficultyTier)
            : 5,
          muscleGroups: Array.isArray(raw.muscleGroups) ? raw.muscleGroups : [],
          equipment: Array.isArray(raw.equipment) ? raw.equipment : [],
          unitOptions: Array.isArray(raw.unitOptions) ? raw.unitOptions : [],
          isActive: raw.isActive !== false,
        },
      };
    }

    const category = String(raw?.category || "").trim();
    const discipline = String(raw?.discipline || "").trim();
    const movementPattern = String(raw?.movementPattern || "").trim();
    const difficultyTier = Number(
      raw?.difficultyTier ?? raw?.difficulty ?? NaN,
    );
    const measurementTypesRaw =
      raw?.measurementTypes ?? raw?.measurementType ?? "";
    const measurementTypes = Array.isArray(measurementTypesRaw)
      ? measurementTypesRaw
      : String(measurementTypesRaw)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    const hasDistance = measurementTypes.includes("distance");
    const hasTime = measurementTypes.includes("time");
    const hasReps = measurementTypes.includes("reps");
    const measurementType =
      String(raw?.measurementType || "") ||
      (hasDistance
        ? "distance"
        : hasReps && hasTime
          ? "mixed"
          : hasReps
            ? "reps"
            : "time");
    const requiresWeight =
      raw?.requiresWeight === true ||
      String(raw?.requiresWeight).toLowerCase() === "true";
    const allowsWeight =
      raw?.allowsWeight === true ||
      String(raw?.allowsWeight).toLowerCase() === "true";
    const supportsSets =
      raw?.supportsSets !== undefined
        ? raw.supportsSets === true ||
          String(raw.supportsSets).toLowerCase() === "true"
        : hasReps || hasTime;
    const supportsTime =
      raw?.supportsTime !== undefined
        ? raw.supportsTime === true ||
          String(raw.supportsTime).toLowerCase() === "true"
        : hasTime;
    const supportsDistance =
      raw?.supportsDistance !== undefined
        ? raw.supportsDistance === true ||
          String(raw.supportsDistance).toLowerCase() === "true"
        : hasDistance;
    const muscleGroups = normalizeArray(raw?.muscleGroups);
    const equipment = normalizeArray(raw?.equipment);
    const aliasList = normalizeArray(raw?.aliases);

    const distanceUnit = String(raw?.distanceUnit || "km");
    const timeUnit = String(raw?.timeUnit || "min");

    const requiredOk =
      name &&
      category &&
      discipline &&
      movementPattern &&
      measurementType &&
      Number.isFinite(difficultyTier) &&
      muscleGroups.length > 0 &&
      equipment.length > 0;

    if (!requiredOk) {
      return {
        valid: false,
        reason: "required",
        name,
        slug: slugifyExerciseName(name),
        isFullExport,
      };
    }

    const slug = slugifyExerciseName(name);
    if (!slug) {
      return { valid: false, reason: "slug", name, slug, isFullExport };
    }

    const normalizedPointsSource = "auto";
    const resolvedPointsPerUnit = computePointsPerUnit({
      measurementType,
      difficultyTier,
    });
    const resolvedUnit = hasDistance
      ? distanceUnit
      : hasTime
        ? timeUnit
        : "reps";
    const unitOptions = hasDistance
      ? [
          { value: "km", label: "Kilometer" },
          { value: "m", label: "Meter" },
          { value: "miles", label: "Miles" },
        ]
      : hasTime
        ? [
            { value: "min", label: "Minuten" },
            { value: "sec", label: "Sekunden" },
          ]
        : [];

    return {
      valid: true,
      isFullExport,
      name,
      slug,
      aliases: aliasList,
      values: {
        name,
        slug,
        description: raw?.description ? String(raw.description).trim() : null,
        category,
        discipline,
        movementPattern,
        measurementType,
        pointsPerUnit: Number.isFinite(resolvedPointsPerUnit)
          ? resolvedPointsPerUnit
          : 1,
        unit: resolvedUnit,
        hasWeight: requiresWeight || allowsWeight,
        hasSetMode: supportsSets,
        requiresWeight,
        allowsWeight,
        supportsSets,
        supportsTime,
        supportsDistance,
        supportsGrade: false,
        difficultyTier,
        muscleGroups,
        equipment,
        unitOptions,
        isActive: true,
        pointsSource: normalizedPointsSource,
      },
    };
  };

  const processExerciseImport = async (rawExercises, userId, options = {}) => {
    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };
    const mode = options.mode === "manual" ? "manual" : "auto";
    const decisions = options.decisions || {};

    const mergeFields = [
      "name",
      "slug",
      "description",
      "category",
      "discipline",
      "movementPattern",
      "measurementType",
      "pointsPerUnit",
      "unit",
      "hasWeight",
      "hasSetMode",
      "requiresWeight",
      "allowsWeight",
      "supportsSets",
      "supportsTime",
      "supportsDistance",
      "supportsGrade",
      "difficultyTier",
      "muscleGroups",
      "equipment",
      "unitOptions",
      "isActive",
    ];

    for (const raw of rawExercises) {
      const payload = buildImportPayload(raw);
      if (!payload.valid) {
        results.skipped += 1;
        continue;
      }

      const { rows: existingRows } = await pool.query(
        "SELECT * FROM exercises WHERE slug = $1 OR LOWER(name) = LOWER($2) LIMIT 1",
        [payload.slug, payload.name],
      );

      if (existingRows.length > 0) {
        const existing = toCamelCase(existingRows[0]);
        existing.unitOptions = existingRows[0].unit_options || [];
        const decisionMap =
          decisions[payload.slug] || decisions[payload.name] || {};

        const merged = {};
        for (const field of mergeFields) {
          const incoming = payload.values[field];
          const current = existing[field];
          const decision =
            typeof decisionMap[field] === "string"
              ? decisionMap[field]
              : decisionMap[field] === false
                ? "keep"
                : decisionMap[field] === true
                  ? "import"
                  : undefined;
          if (decision === "keep") {
            merged[field] = current;
          } else if (decision === "import") {
            merged[field] = incoming;
          } else if (mode === "auto") {
            merged[field] = isEmptyValue(incoming) ? current : incoming;
          } else {
            merged[field] = isEmptyValue(incoming) ? current : incoming;
          }
        }

        await pool.query(
          `
            UPDATE exercises
            SET
              name = $2,
              slug = $3,
              description = $4,
              category = $5,
              discipline = $6,
              movement_pattern = $7,
              measurement_type = $8,
              points_per_unit = $9,
              unit = $10,
              has_weight = $11,
              has_set_mode = $12,
              requires_weight = $13,
              allows_weight = $14,
              supports_sets = $15,
              supports_time = $16,
              supports_distance = $17,
              supports_grade = $18,
              difficulty_tier = $19,
              muscle_groups = $20,
              equipment = $21,
              unit_options = $22::jsonb,
              status = 'approved',
              approved_by = $23,
              is_active = $24,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `,
          [
            existing.id,
            merged.name,
            merged.slug,
            merged.description,
            merged.category,
            merged.discipline,
            merged.movementPattern,
            merged.measurementType,
            merged.pointsPerUnit,
            merged.unit,
            merged.hasWeight,
            merged.hasSetMode,
            merged.requiresWeight,
            merged.allowsWeight,
            merged.supportsSets,
            merged.supportsTime,
            merged.supportsDistance,
            merged.supportsGrade,
            merged.difficultyTier,
            merged.muscleGroups,
            merged.equipment,
            JSON.stringify(merged.unitOptions || []),
            userId,
            merged.isActive !== false,
          ],
        );

        const aliasDecision =
          typeof decisionMap.aliases === "string"
            ? decisionMap.aliases
            : decisionMap.aliases === false
              ? "keep"
              : decisionMap.aliases === true
                ? "import"
                : undefined;
        if (
          (mode === "auto" && !isEmptyValue(payload.aliases)) ||
          aliasDecision === "import"
        ) {
          for (const alias of payload.aliases) {
            const aliasSlug = slugifyExerciseName(String(alias));
            if (!aliasSlug) continue;
            await pool.query(
              `INSERT INTO exercise_aliases (exercise_id, alias, alias_slug, created_by)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (exercise_id, alias_slug) DO NOTHING`,
              [existing.id, String(alias), aliasSlug, userId],
            );
          }
        }

        results.updated += 1;
        continue;
      }

      const exerciseId = randomUUID();
      await pool.query(
        `
          INSERT INTO exercises (
            id,
            name,
            slug,
            description,
            category,
            discipline,
            movement_pattern,
            measurement_type,
            points_per_unit,
            points_source,
            unit,
            has_weight,
            has_set_mode,
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
            approved_by,
            is_active
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'auto',$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb,$22,$23,$24)
        `,
        [
          exerciseId,
          payload.values.name,
          payload.values.slug,
          payload.values.description,
          payload.values.category,
          payload.values.discipline,
          payload.values.movementPattern,
          payload.values.measurementType,
          payload.values.pointsPerUnit,
          payload.values.unit,
          payload.values.hasWeight,
          payload.values.hasSetMode,
          payload.values.requiresWeight,
          payload.values.allowsWeight,
          payload.values.supportsSets,
          payload.values.supportsTime,
          payload.values.supportsDistance,
          payload.values.supportsGrade,
          payload.values.difficultyTier,
          payload.values.muscleGroups,
          payload.values.equipment,
          JSON.stringify(payload.values.unitOptions || []),
          "approved",
          userId,
          payload.values.isActive !== false,
        ],
      );

      if (payload.aliases.length > 0) {
        for (const alias of payload.aliases) {
          const aliasSlug = slugifyExerciseName(String(alias));
          if (!aliasSlug) continue;
          await pool.query(
            `INSERT INTO exercise_aliases (exercise_id, alias, alias_slug, created_by)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (exercise_id, alias_slug) DO NOTHING`,
            [exerciseId, String(alias), aliasSlug, userId],
          );
        }
      }

      results.imported += 1;
    }

    return results;
  };

  const parseExercisesFromXlsxBuffer = async (buffer) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new Error("Keine Arbeitsmappe gefunden.");
    }

    const headerRow = sheet.getRow(1);
    const headers = headerRow.values
      .slice(1)
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    if (headers.length === 0) {
      throw new Error("Keine Spaltenüberschriften gefunden.");
    }

    const exercises = [];
    const extractCellValue = (cell) => {
      const value = cell?.value;
      if (value === null || value === undefined) return "";
      if (typeof value === "object") {
        if (value.text) return value.text;
        if (Array.isArray(value.richText)) {
          return value.richText.map((item) => item.text).join("");
        }
        if (value.result !== undefined) return value.result;
        if (value.formula) return value.formula;
        if (value.hyperlink) return value.text || value.hyperlink;
        if (value instanceof Date) return value.toISOString();
      }
      return value;
    };

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const record = {};
      let hasValue = false;
      headers.forEach((header, index) => {
        const cell = row.getCell(index + 1);
        const cellValue = extractCellValue(cell);
        if (
          cellValue !== null &&
          cellValue !== undefined &&
          String(cellValue).trim() !== ""
        ) {
          hasValue = true;
        }
        record[header] = cellValue ?? "";
      });
      if (hasValue) {
        exercises.push(record);
      }
    });

    return exercises;
  };

  const buildImportPreview = async (rawExercises) => {
    const items = [];
    const slugCandidates = [];
    const nameCandidates = [];
    const payloads = rawExercises.map((raw) => {
      const payload = buildImportPayload(raw);
      if (payload.valid) {
        slugCandidates.push(payload.slug);
        nameCandidates.push(payload.name.toLowerCase());
      }
      return payload;
    });

    const { rows: existingRows } = await pool.query(
      `SELECT * FROM exercises WHERE slug = ANY($1::text[]) OR LOWER(name) = ANY($2::text[])`,
      [slugCandidates, nameCandidates],
    );
    const existingBySlug = new Map();
    const existingByName = new Map();
    existingRows.forEach((row) => {
      const normalized = toCamelCase(row);
      normalized.unitOptions = row.unit_options || [];
      existingBySlug.set(normalized.slug, normalized);
      existingByName.set(
        String(normalized.name || "").toLowerCase(),
        normalized,
      );
    });

    const diffFields = [
      "name",
      "description",
      "category",
      "discipline",
      "movementPattern",
      "measurementType",
      "pointsPerUnit",
      "unit",
      "hasWeight",
      "hasSetMode",
      "requiresWeight",
      "allowsWeight",
      "supportsSets",
      "supportsTime",
      "supportsDistance",
      "supportsGrade",
      "difficultyTier",
      "muscleGroups",
      "equipment",
      "unitOptions",
      "isActive",
    ];

    let countNew = 0;
    let countUpdate = 0;
    let countInvalid = 0;

    payloads.forEach((payload) => {
      if (!payload.valid) {
        countInvalid += 1;
        items.push({
          key: payload.slug || payload.name || String(countInvalid),
          status: "invalid",
          reason: payload.reason || "invalid",
          incoming: null,
          existing: null,
          diffs: {},
        });
        return;
      }

      const existing =
        existingBySlug.get(payload.slug) ||
        existingByName.get(payload.name.toLowerCase()) ||
        null;
      const status = existing ? "update" : "new";
      if (status === "new") countNew += 1;
      else countUpdate += 1;

      const diffs = {};
      diffFields.forEach((field) => {
        const incoming = payload.values[field];
        const current = existing ? existing[field] : null;
        const changed =
          JSON.stringify(incoming ?? null) !== JSON.stringify(current ?? null);
        diffs[field] = {
          incoming,
          existing: current,
          changed,
          incomingEmpty: isEmptyValue(incoming),
        };
      });

      const incomingAliases = payload.aliases || [];
      const existingAliases = existing?.aliases || [];
      diffs.aliases = {
        incoming: incomingAliases,
        existing: existingAliases,
        changed:
          JSON.stringify(incomingAliases ?? []) !==
          JSON.stringify(existingAliases ?? []),
        incomingEmpty: isEmptyValue(incomingAliases),
      };

      items.push({
        key: payload.slug,
        status,
        name: payload.name,
        slug: payload.slug,
        incoming: payload.values,
        existing,
        diffs,
      });
    });

    return {
      items,
      summary: {
        total: items.length,
        new: countNew,
        update: countUpdate,
        invalid: countInvalid,
      },
    };
  };

  const buildExerciseTemplateWorkbook = () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sportify";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet("Exercises");
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    sheet.columns = EXERCISE_IMPORT_COLUMNS.map((key) => ({
      header: key,
      key,
      width: key === "description" ? 36 : 22,
    }));

    sheet.getRow(1).font = { bold: true };

    const example = buildExerciseExampleRow();
    sheet.addRow(EXERCISE_IMPORT_COLUMNS.map((key) => example[key] ?? ""));

    const optionsSheet = workbook.addWorksheet("Options");
    optionsSheet.state = "veryHidden";

    const setOptionColumn = (columnIndex, title, values) => {
      optionsSheet.getCell(1, columnIndex).value = title;
      values.forEach((value, idx) => {
        optionsSheet.getCell(idx + 2, columnIndex).value = value;
      });
      const startRow = 2;
      const endRow = values.length + 1;
      return { columnIndex, startRow, endRow };
    };

    const categoryRange = setOptionColumn(
      1,
      "categories",
      EXERCISE_IMPORT_OPTIONS.categories,
    );
    const disciplineRange = setOptionColumn(
      2,
      "disciplines",
      EXERCISE_IMPORT_OPTIONS.disciplines,
    );
    const patternRange = setOptionColumn(
      3,
      "movementPatterns",
      EXERCISE_IMPORT_OPTIONS.movementPatterns,
    );
    const measurementRange = setOptionColumn(
      4,
      "measurementTypes",
      EXERCISE_IMPORT_OPTIONS.measurementTypes,
    );
    const distanceRange = setOptionColumn(
      5,
      "distanceUnits",
      EXERCISE_IMPORT_OPTIONS.distanceUnits,
    );
    const timeRange = setOptionColumn(
      6,
      "timeUnits",
      EXERCISE_IMPORT_OPTIONS.timeUnits,
    );
    const booleanRange = setOptionColumn(
      7,
      "boolean",
      EXERCISE_IMPORT_OPTIONS.booleanValues,
    );

    const toColumnLetter = (column) => {
      let result = "";
      let col = column;
      while (col > 0) {
        const mod = (col - 1) % 26;
        result = String.fromCharCode(65 + mod) + result;
        col = Math.floor((col - 1) / 26);
      }
      return result;
    };

    const addValidation = (columnKey, range) => {
      const columnIndex = EXERCISE_IMPORT_COLUMNS.indexOf(columnKey);
      if (columnIndex < 0) return;
      const columnLetter = toColumnLetter(columnIndex + 1);
      const formula = `=Options!$${toColumnLetter(range.columnIndex)}$${range.startRow}:$${toColumnLetter(
        range.columnIndex,
      )}$${range.endRow}`;
      sheet.dataValidations.add(`${columnLetter}2:${columnLetter}1000`, {
        type: "list",
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorTitle: "Ungültiger Wert",
        error: "Bitte wähle einen Wert aus der Liste.",
      });
    };

    addValidation("category", categoryRange);
    addValidation("discipline", disciplineRange);
    addValidation("movementPattern", patternRange);
    addValidation("measurementTypes", measurementRange);
    addValidation("distanceUnit", distanceRange);
    addValidation("timeUnit", timeRange);
    addValidation("requiresWeight", booleanRange);
    addValidation("allowsWeight", booleanRange);
    addValidation("supportsSets", booleanRange);

    return workbook;
  };

  router.get("/users", adminMiddleware, async (req, res) => {
    try {
      const { rows } = await pool.query(`
                SELECT
                    id,
                    email,
                    first_name,
                    last_name,
                    nickname,
                    is_email_verified,
                    has_2fa,
                    role,
                    is_blocked,
                    created_at,
                    last_login_at
                FROM users
                ORDER BY created_at DESC
            `);

      const users = rows.map((row) => {
        const user = toCamelCase(row);
        // Fix has_2fa -> has2FA conversion (toCamelCase doesn't handle numbers)
        if (user.has_2fa !== undefined) {
          user.has2FA = user.has_2fa;
          delete user.has_2fa;
        }
        return user;
      });
      res.json(users);
    } catch (error) {
      console.error("Admin users error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden der Benutzerliste." });
    }
  });

  router.put("/users/:userId/block", adminMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const { blocked } = req.body;

      if (typeof blocked !== "boolean") {
        return res
          .status(400)
          .json({ error: "blocked muss ein Boolean sein." });
      }

      await pool.query(`UPDATE users SET is_blocked = $1 WHERE id = $2`, [
        blocked,
        userId,
      ]);

      res.json({ success: true, blocked });
    } catch (error) {
      console.error("Admin block user error:", error);
      res
        .status(500)
        .json({
          error: "Serverfehler beim Blockieren/Entsperren des Benutzers.",
        });
    }
  });

  router.put("/users/:userId/role", adminMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !["user", "admin"].includes(role)) {
        return res
          .status(400)
          .json({ error: "role muss 'user' oder 'admin' sein." });
      }

      await pool.query(`UPDATE users SET role = $1 WHERE id = $2`, [
        role,
        userId,
      ]);

      res.json({ success: true, role });
    } catch (error) {
      console.error("Admin change user role error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Ändern der Benutzerrolle." });
    }
  });

  router.get("/invitations", adminMiddleware, async (req, res) => {
    try {
      const { rows } = await pool.query(`
                SELECT
                    i.id,
                    i.email,
                    i.first_name,
                    i.last_name,
                    i.status,
                    i.created_at,
                    i.expires_at,
                    inviter.first_name AS invited_by_first_name,
                    inviter.last_name AS invited_by_last_name
                FROM invitations i
                LEFT JOIN users inviter ON i.invited_by = inviter.id
                ORDER BY i.created_at DESC
            `);

      const invitations = rows.map((row) => toCamelCase(row));
      res.json(invitations);
    } catch (error) {
      console.error("Admin invitations error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden der Einladungen." });
    }
  });

  // GET /api/admin/overview-stats - Overview counts for admin dashboard
  router.get(
    "/overview-stats",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const [
          usersResult,
          workoutsResult,
          templatesResult,
          exercisesResult,
          journalResult,
          awardsResult,
          badgesResult,
          activitiesResult,
        ] = await Promise.all([
          pool.query("SELECT COUNT(*)::int AS total FROM users"),
          pool.query("SELECT COUNT(*)::int AS total FROM workouts"),
          pool.query("SELECT COUNT(*)::int AS total FROM workout_templates"),
          pool.query("SELECT COUNT(*)::int AS total FROM exercises"),
          pool.query(
            "SELECT COUNT(*)::int AS total FROM training_journal_entries",
          ),
          pool.query("SELECT COUNT(*)::int AS total FROM awards"),
          pool.query("SELECT COUNT(*)::int AS total FROM user_badges"),
          pool.query("SELECT COUNT(*)::int AS total FROM workout_activities"),
        ]);

        res.json({
          users: usersResult.rows[0]?.total || 0,
          workouts: workoutsResult.rows[0]?.total || 0,
          templates: templatesResult.rows[0]?.total || 0,
          exercises: exercisesResult.rows[0]?.total || 0,
          recoveryEntries: journalResult.rows[0]?.total || 0,
          awards: awardsResult.rows[0]?.total || 0,
          badges: badgesResult.rows[0]?.total || 0,
          workoutActivities: activitiesResult.rows[0]?.total || 0,
        });
      } catch (error) {
        console.error("Admin overview stats error:", error);
        res.status(500).json({
          error: "Serverfehler beim Laden der Admin-Übersicht.",
        });
      }
    },
  );

  // GET /api/admin/exercises - Get all exercises (optional filters)
  router.get(
    "/exercises",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { status, includeInactive } = req.query || {};
        const conditions = [];
        const params = [];
        let index = 1;

        if (status) {
          params.push(status);
          conditions.push(`status = $${index}`);
          index += 1;
        }

        if (includeInactive !== "true") {
          conditions.push("is_active = true");
        }

        const whereClause = conditions.length
          ? `WHERE ${conditions.join(" AND ")}`
          : "";

        const { rows } = await pool.query(
          `
                SELECT
                    id,
                    name,
                    slug,
                    description,
                    category,
                    discipline,
                    movement_pattern,
                    measurement_type,
                    points_per_unit,
                    unit,
                    has_weight,
                    has_set_mode,
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
                    approved_by,
                    merged_into,
                    is_active,
                    created_at,
                    updated_at,
                    COALESCE(
                      (SELECT array_agg(alias) FROM exercise_aliases ea WHERE ea.exercise_id = exercises.id),
                      '{}'::text[]
                    ) AS aliases
                FROM exercises
                ${whereClause}
                ORDER BY name ASC
            `,
          params,
        );

        const exercises = rows.map((row) => ({
          ...toCamelCase(row),
          unitOptions: row.unit_options || [],
        }));

        res.json(exercises);
      } catch (error) {
        console.error("Admin exercises GET error:", error);
        res.status(500).json({ error: "Serverfehler beim Laden der Übungen." });
      }
    },
  );

  // POST /api/admin/exercises/export-selected - Export selected exercises (full data, lossless for import elsewhere)
  router.post(
    "/exercises/export-selected",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { ids } = req.body || {};
        if (!Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: "Keine Übungs-IDs angegeben." });
        }
        const validIds = ids
          .filter((id) => typeof id === "string" && id.trim())
          .slice(0, 5000);
        if (validIds.length === 0) {
          return res.status(400).json({ error: "Keine gültigen Übungs-IDs." });
        }

        const { rows } = await pool.query(
          `
          SELECT
            id,
            name,
            slug,
            description,
            category,
            discipline,
            movement_pattern,
            measurement_type,
            points_per_unit,
            unit,
            has_weight,
            has_set_mode,
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
            approved_by,
            merged_into,
            is_active,
            created_at,
            updated_at,
            COALESCE(
              (SELECT array_agg(alias) FROM exercise_aliases ea WHERE ea.exercise_id = exercises.id),
              '{}'::text[]
            ) AS aliases
          FROM exercises
          WHERE id = ANY($1::varchar[])
          ORDER BY name ASC
          `,
          [validIds],
        );

        const exercises = rows.map((row) => ({
          ...toCamelCase(row),
          unitOptions: row.unit_options || [],
        }));

        res.json({ exercises, meta: { exported: exercises.length } });
      } catch (error) {
        console.error("Admin exercises export-selected error:", error);
        res.status(500).json({ error: "Serverfehler beim Export." });
      }
    },
  );

  // GET /api/admin/exercises/export - Export template for bulk import
  router.get(
    "/exercises/export",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const format = String(req.query.format || "csv").toLowerCase();
        if (format === "xlsx" || format === "excel") {
          const workbook = buildExerciseTemplateWorkbook();
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=exercise-import-template.xlsx",
          );
          await workbook.xlsx.write(res);
          return res.end();
        }
        if (format === "json") {
          return res.json({
            columns: EXERCISE_IMPORT_COLUMNS,
            meta: buildExerciseImportMeta(),
            exercises: [buildExerciseExampleRow()],
            examples: [buildExerciseExampleRow()],
          });
        }
        const csvHeader = `${EXERCISE_IMPORT_COLUMNS.join(",")}\n`;
        const example = buildExerciseExampleRow();
        const exampleRow = EXERCISE_IMPORT_COLUMNS.map((key) => {
          const value = example[key] ?? "";
          return typeof value === "string" ? value : String(value ?? "");
        }).join(",");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=exercise-import-template.csv",
        );
        return res.send(`${csvHeader}${exampleRow}\n`);
      } catch (error) {
        console.error("Admin exercises export error:", error);
        res.status(500).json({ error: "Serverfehler beim Export." });
      }
    },
  );

  // POST /api/admin/exercises/import - Import exercises in bulk
  router.post(
    "/exercises/import",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { exercises, mode, decisions } = req.body || {};
        if (!Array.isArray(exercises)) {
          return res.status(400).json({ error: "Keine Übungen angegeben." });
        }
        const results = await processExerciseImport(exercises, req.user.id, {
          mode,
          decisions,
        });
        res.json(results);
      } catch (error) {
        console.error("Admin exercises import error:", error);
        res.status(500).json({ error: "Serverfehler beim Import." });
      }
    },
  );

  // POST /api/admin/exercises/import-preview - Preview exercises before import
  router.post(
    "/exercises/import-preview",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { exercises } = req.body || {};
        if (!Array.isArray(exercises)) {
          return res.status(400).json({ error: "Keine Übungen angegeben." });
        }
        const preview = await buildImportPreview(exercises);
        res.json({ exercises, preview });
      } catch (error) {
        console.error("Admin exercises import-preview error:", error);
        res.status(500).json({ error: "Serverfehler beim Import-Preview." });
      }
    },
  );

  // POST /api/admin/exercises/import-file - Import exercises from XLSX
  router.post(
    "/exercises/import-file",
    authMiddleware,
    adminMiddleware,
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Keine Datei angegeben." });
        }
        const filename = req.file.originalname?.toLowerCase() || "";
        if (!filename.endsWith(".xlsx")) {
          return res
            .status(400)
            .json({ error: "Nur .xlsx Dateien werden unterstützt." });
        }

        const exercises = await parseExercisesFromXlsxBuffer(req.file.buffer);
        const mode = req.body?.mode;
        const decisions =
          typeof req.body?.decisions === "string"
            ? JSON.parse(req.body.decisions)
            : req.body?.decisions;
        const results = await processExerciseImport(exercises, req.user.id, {
          mode,
          decisions,
        });
        res.json(results);
      } catch (error) {
        console.error("Admin exercises import-file error:", error);
        res.status(500).json({ error: "Serverfehler beim Import." });
      }
    },
  );

  // POST /api/admin/exercises/import-preview-file - Preview XLSX before import
  router.post(
    "/exercises/import-preview-file",
    authMiddleware,
    adminMiddleware,
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Keine Datei angegeben." });
        }
        const filename = req.file.originalname?.toLowerCase() || "";
        if (!filename.endsWith(".xlsx")) {
          return res
            .status(400)
            .json({ error: "Nur .xlsx Dateien werden unterstützt." });
        }
        const exercises = await parseExercisesFromXlsxBuffer(req.file.buffer);
        const preview = await buildImportPreview(exercises);
        res.json({ exercises, preview });
      } catch (error) {
        console.error("Admin exercises import-preview-file error:", error);
        res.status(500).json({ error: "Serverfehler beim Import-Preview." });
      }
    },
  );

  // POST /api/admin/exercises - Create new exercise
  router.post(
    "/exercises",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const {
          name,
          id,
          slug,
          pointsPerUnit,
          pointsSource,
          unit,
          hasWeight,
          hasSetMode,
          description,
          category,
          discipline,
          movementPattern,
          measurementType,
          requiresWeight,
          allowsWeight,
          supportsSets,
          supportsTime,
          supportsDistance,
          supportsGrade,
          difficultyTier,
          muscleGroups,
          equipment,
          aliases,
          unitOptions,
          isActive,
          status,
        } = req.body;

        if (!name || !unit) {
          return res.status(400).json({
            error: "Name und Einheit sind erforderlich.",
          });
        }

        if (pointsPerUnit !== undefined && pointsPerUnit <= 0) {
          return res
            .status(400)
            .json({ error: "Punkte pro Einheit muss größer als 0 sein." });
        }

        const exerciseId = id || randomUUID();
        const exerciseSlug = slug || slugifyExerciseName(name);

        if (!exerciseSlug) {
          return res
            .status(400)
            .json({ error: "Slug konnte nicht erzeugt werden." });
        }

        const { rows: existing } = await pool.query(
          "SELECT id FROM exercises WHERE id = $1 OR slug = $2",
          [exerciseId, exerciseSlug],
        );
        if (existing.length > 0) {
          return res.status(409).json({
            error:
              "Eine Übung mit dieser ID oder diesem Slug existiert bereits.",
          });
        }

        const normalizedPointsSource =
          pointsSource === "manual" ? "manual" : "auto";
        const resolvedPointsPerUnit =
          normalizedPointsSource === "manual" && pointsPerUnit !== undefined
            ? Number(pointsPerUnit)
            : computePointsPerUnit({
                measurementType: measurementType || "reps",
                difficultyTier,
              });

        const { rows } = await pool.query(
          `
                INSERT INTO exercises (
                  id,
                  name,
                  slug,
                  description,
                  category,
                  discipline,
                  movement_pattern,
                  measurement_type,
                  points_per_unit,
                  points_source,
                  unit,
                  has_weight,
                  has_set_mode,
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
                  approved_by,
                  is_active
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
                RETURNING *
            `,
          [
            exerciseId,
            name,
            exerciseSlug,
            description || null,
            category || null,
            discipline || null,
            movementPattern || null,
            measurementType || null,
            Number.isFinite(resolvedPointsPerUnit) ? resolvedPointsPerUnit : 1,
            normalizedPointsSource,
            unit,
            hasWeight || false,
            hasSetMode !== undefined ? hasSetMode : true,
            requiresWeight || false,
            allowsWeight || false,
            supportsSets !== undefined ? supportsSets : true,
            supportsTime || false,
            supportsDistance || false,
            supportsGrade || false,
            difficultyTier || null,
            muscleGroups || null,
            equipment || null,
            JSON.stringify(unitOptions || []),
            status || "approved",
            req.user.id,
            isActive !== undefined ? isActive : true,
          ],
        );

        const aliasList = Array.isArray(aliases)
          ? aliases.map((alias) => String(alias).trim()).filter(Boolean)
          : [];
        if (aliasList.length > 0) {
          for (const alias of aliasList) {
            const aliasSlug = slugifyExerciseName(alias);
            if (!aliasSlug) continue;
            await pool.query(
              `INSERT INTO exercise_aliases (exercise_id, alias, alias_slug, created_by)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (alias_slug) DO NOTHING`,
              [exerciseId, alias, aliasSlug, req.user.id],
            );
          }
        }

        res.status(201).json({
          ...toCamelCase(rows[0]),
          unitOptions: rows[0].unit_options || [],
          aliases: aliasList,
        });
      } catch (error) {
        console.error("Admin exercises POST error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Erstellen der Übung." });
      }
    },
  );

  // PUT /api/admin/exercises/:id - Update exercise
  router.put(
    "/exercises/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body || {};
        const aliasList = Array.isArray(updates.aliases)
          ? updates.aliases.map((alias) => String(alias).trim()).filter(Boolean)
          : null;

        // Erlaubte Felder zum Aktualisieren
        const allowedFields = [
          "name",
          "description",
          "slug",
          "category",
          "discipline",
          "movementPattern",
          "measurementType",
          "pointsPerUnit",
          "pointsSource",
          "unit",
          "hasWeight",
          "hasSetMode",
          "requiresWeight",
          "allowsWeight",
          "supportsSets",
          "supportsTime",
          "supportsDistance",
          "supportsGrade",
          "difficultyTier",
          "muscleGroups",
          "equipment",
          "unitOptions",
          "status",
          "isActive",
          "mergedInto",
        ];
        const fieldsToUpdate = Object.keys(updates).filter((key) =>
          allowedFields.includes(key),
        );

        if (fieldsToUpdate.length === 0 && !aliasList) {
          return res.status(400).json({
            error: "Keine gültigen Felder zum Aktualisieren angegeben.",
          });
        }

        const { rows: existingRows } = await pool.query(
          "SELECT measurement_type, difficulty_tier, points_source FROM exercises WHERE id = $1",
          [id],
        );
        if (existingRows.length === 0) {
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }
        const existing = existingRows[0];

        const normalizedPointsSource =
          updates.pointsSource === "manual"
            ? "manual"
            : updates.pointsSource === "auto"
              ? "auto"
              : null;
        const nextMeasurementType =
          updates.measurementType ?? existing.measurement_type ?? "reps";
        const nextDifficultyTier =
          updates.difficultyTier ?? existing.difficulty_tier ?? null;
        let nextPointsSource =
          normalizedPointsSource || existing.points_source || "auto";

        if (updates.pointsPerUnit !== undefined) {
          nextPointsSource = "manual";
        }

        if (nextPointsSource === "auto") {
          updates.pointsPerUnit = computePointsPerUnit({
            measurementType: nextMeasurementType,
            difficultyTier: nextDifficultyTier,
          });
          updates.pointsSource = "auto";
          if (!fieldsToUpdate.includes("pointsPerUnit"))
            fieldsToUpdate.push("pointsPerUnit");
          if (!fieldsToUpdate.includes("pointsSource"))
            fieldsToUpdate.push("pointsSource");
        } else if (normalizedPointsSource === "manual") {
          updates.pointsSource = "manual";
          if (!fieldsToUpdate.includes("pointsSource"))
            fieldsToUpdate.push("pointsSource");
        }

        // Konvertiere camelCase zu snake_case für die Datenbank
        let updatePairs = fieldsToUpdate
          .map((field, index) => {
            let dbField = field;
            if (field === "pointsPerUnit") dbField = "points_per_unit";
            else if (field === "pointsSource") dbField = "points_source";
            else if (field === "hasWeight") dbField = "has_weight";
            else if (field === "hasSetMode") dbField = "has_set_mode";
            else if (field === "unitOptions") dbField = "unit_options";
            else if (field === "isActive") dbField = "is_active";
            else if (field === "movementPattern") dbField = "movement_pattern";
            else if (field === "measurementType") dbField = "measurement_type";
            else if (field === "requiresWeight") dbField = "requires_weight";
            else if (field === "allowsWeight") dbField = "allows_weight";
            else if (field === "supportsSets") dbField = "supports_sets";
            else if (field === "supportsTime") dbField = "supports_time";
            else if (field === "supportsDistance")
              dbField = "supports_distance";
            else if (field === "supportsGrade") dbField = "supports_grade";
            else if (field === "difficultyTier") dbField = "difficulty_tier";
            else if (field === "muscleGroups") dbField = "muscle_groups";
            else if (field === "equipment") dbField = "equipment";
            else if (field === "mergedInto") dbField = "merged_into";

            if (field === "unitOptions") {
              return `${dbField} = $${index + 1}::jsonb`;
            }
            return `${dbField} = $${index + 1}`;
          })
          .join(", ");

        const values = fieldsToUpdate.map((field) => {
          if (field === "unitOptions") {
            return JSON.stringify(updates[field] || []);
          }
          if (field === "slug") {
            return updates[field] || slugifyExerciseName(updates.name);
          }
          if (field === "pointsSource") {
            return updates[field] || nextPointsSource;
          }
          return updates[field];
        });

        if (
          fieldsToUpdate.includes("status") &&
          updates.status === "approved"
        ) {
          values.push(req.user.id);
          updatePairs += `, approved_by = $${values.length}`;
        }

        values.push(id);

        let rows = [];
        if (fieldsToUpdate.length > 0) {
          const query = `
                  UPDATE exercises
                  SET ${updatePairs}, updated_at = CURRENT_TIMESTAMP
                  WHERE id = $${values.length}
                  RETURNING *
              `;
          ({ rows } = await pool.query(query, values));
        } else {
          const result = await pool.query(
            `SELECT * FROM exercises WHERE id = $1`,
            [id],
          );
          rows = result.rows;
        }

        if (rows.length === 0) {
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }

        if (aliasList) {
          await pool.query(
            `DELETE FROM exercise_aliases WHERE exercise_id = $1`,
            [id],
          );
          for (const alias of aliasList) {
            const aliasSlug = slugifyExerciseName(alias);
            if (!aliasSlug) continue;
            await pool.query(
              `INSERT INTO exercise_aliases (exercise_id, alias, alias_slug, created_by)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (alias_slug) DO NOTHING`,
              [id, alias, aliasSlug, req.user.id],
            );
          }
        }

        res.json({
          ...toCamelCase(rows[0]),
          unitOptions: rows[0].unit_options || [],
          aliases: aliasList ?? undefined,
        });
      } catch (error) {
        console.error("Admin exercises PUT error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Aktualisieren der Übung." });
      }
    },
  );

  // POST /api/admin/exercises/:id/merge - Merge exercise into target
  router.post(
    "/exercises/:id/merge",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      const client = await pool.connect();
      try {
        const { id } = req.params;
        const { targetExerciseId } = req.body || {};
        if (!targetExerciseId || targetExerciseId === id) {
          return res
            .status(400)
            .json({ error: "Ziel-Übung ist erforderlich." });
        }

        await client.query("BEGIN");

        const { rows: sourceRows } = await client.query(
          "SELECT id, name, slug FROM exercises WHERE id = $1",
          [id],
        );
        const { rows: targetRows } = await client.query(
          "SELECT id FROM exercises WHERE id = $1",
          [targetExerciseId],
        );
        if (sourceRows.length === 0 || targetRows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }

        const source = sourceRows[0];
        const aliasSlug = slugifyExerciseName(source.name || source.slug || id);

        await client.query(
          `UPDATE workout_activities SET exercise_id = $1 WHERE exercise_id = $2`,
          [targetExerciseId, id],
        );
        await client.query(
          `UPDATE workout_activities SET activity_type = $1 WHERE activity_type = $2`,
          [targetExerciseId, id],
        );

        await client.query(
          `UPDATE exercise_aliases SET exercise_id = $1 WHERE exercise_id = $2`,
          [targetExerciseId, id],
        );

        await client.query(
          `INSERT INTO exercise_aliases (exercise_id, alias, alias_slug, created_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (alias_slug) DO NOTHING`,
          [targetExerciseId, source.name, aliasSlug, req.user.id],
        );

        await client.query(
          `UPDATE exercises
           SET merged_into = $1, is_active = false, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [targetExerciseId, id],
        );

        await client.query("COMMIT");
        res.json({ status: "ok" });
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Admin merge exercise error:", error);
        res.status(500).json({ error: "Serverfehler beim Zusammenfuehren." });
      } finally {
        client.release();
      }
    },
  );

  // POST /api/admin/exercises/:id/deactivate - Deactivate exercise
  router.post(
    "/exercises/:id/deactivate",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { rows } = await pool.query(
          `UPDATE exercises SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
          [id],
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }
        res.json({ status: "ok" });
      } catch (error) {
        console.error("Admin deactivate exercise error:", error);
        res.status(500).json({ error: "Serverfehler beim Deaktivieren." });
      }
    },
  );

  // DELETE /api/admin/exercises/:id - Permanently delete exercise
  router.delete(
    "/exercises/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { rows } = await pool.query(
          `SELECT id FROM exercises WHERE id = $1`,
          [id],
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }
        await pool.query(
          `UPDATE workout_activities SET exercise_id = NULL WHERE exercise_id = $1`,
          [id],
        );
        await pool.query(
          `UPDATE workout_template_activities SET exercise_id = NULL WHERE exercise_id = $1`,
          [id],
        );
        await pool.query(`DELETE FROM exercises WHERE id = $1`, [id]);
        res.json({ status: "ok" });
      } catch (error) {
        console.error("Admin delete exercise error:", error);
        res.status(500).json({ error: "Serverfehler beim Löschen." });
      }
    },
  );

  // GET /api/admin/exercise-reports
  router.get(
    "/exercise-reports",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { status = "pending" } = req.query || {};
        const { rows } = await pool.query(
          `SELECT * FROM exercise_reports WHERE status = $1 ORDER BY created_at DESC`,
          [status],
        );
        res.json(
          rows.map((row) => {
            const normalized = toCamelCase(row);
            if (!normalized.description && normalized.details) {
              normalized.description = normalized.details;
            }
            return normalized;
          }),
        );
      } catch (error) {
        console.error("Admin exercise reports error:", error);
        res.status(500).json({ error: "Serverfehler beim Laden der Reports." });
      }
    },
  );

  // PUT /api/admin/exercise-reports/:id/resolve
  router.put(
    "/exercise-reports/:id/resolve",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { status = "resolved" } = req.body || {};
        const { rows } = await pool.query(
          `UPDATE exercise_reports
           SET status = $1, resolved_by = $2, resolved_at = CURRENT_TIMESTAMP
           WHERE id = $3
           RETURNING *`,
          [status, req.user.id, id],
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: "Report nicht gefunden." });
        }
        res.json(toCamelCase(rows[0]));
      } catch (error) {
        console.error("Admin resolve report error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Aktualisieren des Reports." });
      }
    },
  );

  // GET /api/admin/exercise-edit-requests
  router.get(
    "/exercise-edit-requests",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { status = "pending" } = req.query || {};
        const { rows } = await pool.query(
          `SELECT * FROM exercise_edit_requests WHERE status = $1 ORDER BY created_at DESC`,
          [status],
        );
        res.json(rows.map((row) => toCamelCase(row)));
      } catch (error) {
        console.error("Admin edit requests error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Laden der Änderungsanfragen." });
      }
    },
  );

  // PUT /api/admin/exercise-edit-requests/:id/resolve
  router.put(
    "/exercise-edit-requests/:id/resolve",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      const client = await pool.connect();
      try {
        const { id } = req.params;
        const { status = "approved", adminNotes } = req.body || {};

        await client.query("BEGIN");

        const { rows: requestRows } = await client.query(
          `SELECT * FROM exercise_edit_requests WHERE id = $1`,
          [id],
        );
        if (requestRows.length === 0) {
          await client.query("ROLLBACK");
          return res
            .status(404)
            .json({ error: "Änderungsanfrage nicht gefunden." });
        }

        const request = requestRows[0];

        if (status === "approved") {
          const changes = request.change_request || {};
          const allowed = {
            name: "name",
            description: "description",
            category: "category",
            discipline: "discipline",
            movementPattern: "movement_pattern",
            measurementType: "measurement_type",
            unit: "unit",
            requiresWeight: "requires_weight",
            allowsWeight: "allows_weight",
            supportsSets: "supports_sets",
            supportsTime: "supports_time",
            supportsDistance: "supports_distance",
            supportsGrade: "supports_grade",
            difficultyTier: "difficulty_tier",
            muscleGroups: "muscle_groups",
            equipment: "equipment",
            unitOptions: "unit_options",
          };

          const updateFields = [];
          const updateValues = [];
          let idx = 1;
          for (const [key, value] of Object.entries(changes)) {
            if (!allowed[key]) continue;
            if (key === "unitOptions") {
              updateFields.push(`${allowed[key]} = $${idx}::jsonb`);
              updateValues.push(JSON.stringify(value || []));
            } else {
              updateFields.push(`${allowed[key]} = $${idx}`);
              updateValues.push(value);
            }
            idx += 1;
          }

          if (updateFields.length > 0) {
            updateValues.push(request.exercise_id);
            await client.query(
              `UPDATE exercises SET ${updateFields.join(
                ", ",
              )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx}`,
              updateValues,
            );
          }
        }

        const { rows: updated } = await client.query(
          `UPDATE exercise_edit_requests
           SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP
           WHERE id = $4
           RETURNING *`,
          [status, adminNotes || null, req.user.id, id],
        );

        await client.query("COMMIT");
        res.json(toCamelCase(updated[0]));
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Admin resolve edit request error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Bearbeiten der Anfrage." });
      } finally {
        client.release();
      }
    },
  );

  router.post(
    "/invite-user",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { email, firstName, lastName } = req.body;

        if (!email || !firstName || !lastName) {
          return res
            .status(400)
            .json({ error: "E-Mail, Vorname und Nachname sind erforderlich." });
        }

        const { rows: existingUsers } = await pool.query(
          "SELECT id FROM users WHERE email = $1",
          [email],
        );
        if (existingUsers.length > 0) {
          return res
            .status(409)
            .json({ error: "Für diese E-Mail existiert bereits ein Konto." });
        }

        const { invitation, token } = await createInvitation(pool, {
          email,
          firstName,
          lastName,
          invitedBy: req.user.id,
        });

        const frontendUrl = getFrontendUrl(req);
        const inviteLink = `${frontendUrl}/invite/${req.user.id}`;
        const expiresDate = new Date(invitation.expires_at).toLocaleDateString(
          "de-DE",
        );

        // Plain-Text-Version für Fallback
        const emailBody = `Hallo ${firstName},

Du wurdest zu Sportify eingeladen.

Klicke auf folgenden Link, um dich zu registrieren:
${inviteLink}

Oder verwende diesen Code bei der Registrierung: ${token}

Die Einladung läuft am ${expiresDate} ab.`;

        // Verwende das neue E-Mail-Template
        const { createActionEmail } =
          await import("../utils/emailTemplates.js");
        const emailHtml = createActionEmail({
          greeting: `Hallo ${firstName},`,
          title: "Du wurdest zu Sportify eingeladen",
          message:
            "Du wurdest eingeladen, Teil der Sportify-Community zu werden. Registriere dich jetzt und starte dein Training!",
          buttonText: "Jetzt registrieren",
          buttonUrl: inviteLink,
          additionalText: `Die Einladung läuft am ${expiresDate} ab.`,
          frontendUrl,
          preheader: "Du wurdest zu Sportify eingeladen",
        });

        try {
          await queueEmail(pool, {
            recipient: email,
            subject: "Sportify – Einladung",
            body: emailBody,
            html: emailHtml,
          });
          console.log(
            `✅ Admin-Einladungs-E-Mail erfolgreich versendet an: ${email}`,
          );
        } catch (emailError) {
          console.error(
            `❌ Fehler beim Versenden der Admin-Einladungs-E-Mail an ${email}:`,
            emailError,
          );
          console.error("   Fehler-Details:", {
            message: emailError.message,
            code: emailError.code,
            response: emailError.response,
          });
          throw new Error(
            `Einladung wurde erstellt, aber E-Mail konnte nicht versendet werden: ${emailError.message}`,
          );
        }

        res.status(201).json({
          message: "Einladung gesendet.",
          invitation: toCamelCase(invitation),
        });
      } catch (error) {
        if (error instanceof InvitationError) {
          return res.status(400).json({ error: error.message });
        }
        console.error("Invite user error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Senden der Einladung." });
      }
    },
  );

  router.get("/monitoring", adminMiddleware, async (req, res) => {
    try {
      const jobStats = await getJobStats(pool);

      // Get email queue stats
      const { rows: emailStats } = await pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count,
                    COUNT(*) FILTER (WHERE attempts >= 3) as failed_after_retries
                FROM email_queue
                WHERE created_at > NOW() - INTERVAL '7 days'
                GROUP BY status
            `);

      const { rows: recentEmails } = await pool.query(`
                SELECT id, recipient, subject, status, attempts, error, created_at, processed_at
                FROM email_queue
                WHERE created_at > NOW() - INTERVAL '24 hours'
                ORDER BY created_at DESC
                LIMIT 50
            `);

      res.json({
        jobs: {
          stats: jobStats.stats.map((row) => toCamelCase(row)),
          recentFailures: jobStats.recentFailures.map((row) => toCamelCase(row)),
          stuckJobs: jobStats.stuckJobs.map((row) => toCamelCase(row)),
        },
        emails: {
          stats: emailStats.map((row) => toCamelCase(row)),
          recent: recentEmails.map((row) => toCamelCase(row)),
        },
      });
    } catch (error) {
      console.error("Admin monitoring error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Laden der Monitoring-Daten." });
    }
  });

  router.post("/monitoring/cleanup-jobs", adminMiddleware, async (req, res) => {
    try {
      const result = await cleanupStuckJobs(pool);
      res.json({ status: "ok", ...result });
    } catch (error) {
      console.error("Cleanup jobs error:", error);
      res.status(500).json({ error: "Serverfehler beim Cleanup der Jobs." });
    }
  });

  router.post("/monitoring/test-alert", adminMiddleware, async (req, res) => {
    try {
      await sendEmailQueueAlert(0, 0);
      res.json({ status: "ok", message: "Test alert sent" });
    } catch (error) {
      console.error("Test alert error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Senden des Test-Alerts." });
    }
  });

  return router;
};
