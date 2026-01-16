import express from "express";
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
import { getFrontendUrl, toCamelCase } from "../utils/helpers.js";
import { slugifyExerciseName } from "../utils/exerciseUtils.js";
import { randomUUID } from "crypto";

export const createAdminRouter = (pool) => {
  const router = express.Router();
  const adminMiddleware = createAdminMiddleware(pool);

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

        const { rows } = await pool.query(`
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
                    updated_at
                FROM exercises
                ${whereClause}
                ORDER BY name ASC
            `, params);

        const exercises = rows.map((row) => ({
          ...toCamelCase(row),
          unitOptions: row.unit_options || [],
        }));

        res.json(exercises);
      } catch (error) {
        console.error("Admin exercises GET error:", error);
        res.status(500).json({ error: "Serverfehler beim Laden der Übungen." });
      }
    }
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
          unitOptions,
          isActive,
          status,
        } = req.body;

        if (!name || pointsPerUnit === undefined || !unit) {
          return res.status(400).json({
            error: "Name, Punkte pro Einheit und Einheit sind erforderlich.",
          });
        }

        if (pointsPerUnit <= 0) {
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
          [exerciseId, exerciseSlug]
        );
        if (existing.length > 0) {
          return res.status(409).json({
            error: "Eine Übung mit dieser ID oder diesem Slug existiert bereits.",
          });
        }

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
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
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
            pointsPerUnit,
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
          ]
        );

        res.status(201).json({
          ...toCamelCase(rows[0]),
          unitOptions: rows[0].unit_options || [],
        });
      } catch (error) {
        console.error("Admin exercises POST error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Erstellen der Übung." });
      }
    }
  );

  // PUT /api/admin/exercises/:id - Update exercise
  router.put(
    "/exercises/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;

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
          allowedFields.includes(key)
        );

        if (fieldsToUpdate.length === 0) {
          return res.status(400).json({
            error: "Keine gültigen Felder zum Aktualisieren angegeben.",
          });
        }

        // Konvertiere camelCase zu snake_case für die Datenbank
        let updatePairs = fieldsToUpdate
          .map((field, index) => {
            let dbField = field;
            if (field === "pointsPerUnit") dbField = "points_per_unit";
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
            else if (field === "supportsDistance") dbField = "supports_distance";
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
          return updates[field];
        });

        if (fieldsToUpdate.includes("status") && updates.status === "approved") {
          values.push(req.user.id);
          updatePairs += `, approved_by = $${values.length}`;
        }

        values.push(id);

        const query = `
                UPDATE exercises
                SET ${updatePairs}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${values.length}
                RETURNING *
            `;

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }

        res.json({
          ...toCamelCase(rows[0]),
          unitOptions: rows[0].unit_options || [],
        });
      } catch (error) {
        console.error("Admin exercises PUT error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Aktualisieren der Übung." });
      }
    }
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
          [id]
        );
        const { rows: targetRows } = await client.query(
          "SELECT id FROM exercises WHERE id = $1",
          [targetExerciseId]
        );
        if (sourceRows.length === 0 || targetRows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }

        const source = sourceRows[0];
        const aliasSlug = slugifyExerciseName(source.name || source.slug || id);

        await client.query(
          `UPDATE workout_activities SET exercise_id = $1 WHERE exercise_id = $2`,
          [targetExerciseId, id]
        );
        await client.query(
          `UPDATE workout_activities SET activity_type = $1 WHERE activity_type = $2`,
          [targetExerciseId, id]
        );

        await client.query(
          `UPDATE exercise_aliases SET exercise_id = $1 WHERE exercise_id = $2`,
          [targetExerciseId, id]
        );

        await client.query(
          `INSERT INTO exercise_aliases (exercise_id, alias, alias_slug, created_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (alias_slug) DO NOTHING`,
          [targetExerciseId, source.name, aliasSlug, req.user.id]
        );

        await client.query(
          `UPDATE exercises
           SET merged_into = $1, is_active = false, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [targetExerciseId, id]
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
    }
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
          [id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: "Übung nicht gefunden." });
        }
        res.json({ status: "ok" });
      } catch (error) {
        console.error("Admin deactivate exercise error:", error);
        res.status(500).json({ error: "Serverfehler beim Deaktivieren." });
      }
    }
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
          [status]
        );
        res.json(rows.map((row) => toCamelCase(row)));
      } catch (error) {
        console.error("Admin exercise reports error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Laden der Reports." });
      }
    }
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
          [status, req.user.id, id]
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
    }
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
          [status]
        );
        res.json(rows.map((row) => toCamelCase(row)));
      } catch (error) {
        console.error("Admin edit requests error:", error);
        res
          .status(500)
          .json({ error: "Serverfehler beim Laden der Änderungsanfragen." });
      }
    }
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
          [id]
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
                ", "
              )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx}`,
              updateValues
            );
          }
        }

        const { rows: updated } = await client.query(
          `UPDATE exercise_edit_requests
           SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP
           WHERE id = $4
           RETURNING *`,
          [status, adminNotes || null, req.user.id, id]
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
    }
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
          [email]
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
          "de-DE"
        );

        // Plain-Text-Version für Fallback
        const emailBody = `Hallo ${firstName},

Du wurdest zu Sportify eingeladen.

Klicke auf folgenden Link, um dich zu registrieren:
${inviteLink}

Oder verwende diesen Code bei der Registrierung: ${token}

Die Einladung läuft am ${expiresDate} ab.`;

        // Verwende das neue E-Mail-Template
        const { createActionEmail } = await import(
          "../utils/emailTemplates.js"
        );
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
            `✅ Admin-Einladungs-E-Mail erfolgreich versendet an: ${email}`
          );
        } catch (emailError) {
          console.error(
            `❌ Fehler beim Versenden der Admin-Einladungs-E-Mail an ${email}:`,
            emailError
          );
          console.error("   Fehler-Details:", {
            message: emailError.message,
            code: emailError.code,
            response: emailError.response,
          });
          throw new Error(
            `Einladung wurde erstellt, aber E-Mail konnte nicht versendet werden: ${emailError.message}`
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
    }
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
        jobs: jobStats,
        emails: {
          stats: emailStats,
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
