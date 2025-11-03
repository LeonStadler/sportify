import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { createAdminMiddleware } from '../middleware/adminMiddleware.js';
import { queueEmail } from '../services/emailService.js';
import { InvitationError, createInvitation } from '../services/invitationService.js';
import { toCamelCase, getFrontendUrl } from '../utils/helpers.js';

export const createAdminRouter = (pool) => {
    const router = express.Router();
    const adminMiddleware = createAdminMiddleware(pool);

    router.get('/users', adminMiddleware, async (req, res) => {
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
                    is_admin,
                    COALESCE(is_active, true) AS is_active,
                    created_at,
                    last_login_at
                FROM users
                ORDER BY created_at DESC
            `);

            const users = rows.map(row => toCamelCase(row));
            res.json(users);
        } catch (error) {
            console.error('Admin users error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Benutzerliste.' });
        }
    });

    router.get('/invitations', adminMiddleware, async (req, res) => {
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

            const invitations = rows.map(row => toCamelCase(row));
            res.json(invitations);
        } catch (error) {
            console.error('Admin invitations error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Einladungen.' });
        }
    });

    // GET /api/admin/exercises - Get all exercises
    router.get('/exercises', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const { rows } = await pool.query(`
                SELECT
                    id,
                    name,
                    points_per_unit,
                    unit,
                    has_weight,
                    has_set_mode,
                    unit_options,
                    is_active,
                    created_at,
                    updated_at
                FROM exercises
                ORDER BY name ASC
            `);

            const exercises = rows.map(row => ({
                ...toCamelCase(row),
                unitOptions: row.unit_options || []
            }));

            res.json(exercises);
        } catch (error) {
            console.error('Admin exercises GET error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Übungen.' });
        }
    });

    // POST /api/admin/exercises - Create new exercise
    router.post('/exercises', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const { id, name, pointsPerUnit, unit, hasWeight, hasSetMode, unitOptions, isActive } = req.body;

            if (!id || !name || pointsPerUnit === undefined || !unit) {
                return res.status(400).json({ error: 'ID, Name, Punkte pro Einheit und Einheit sind erforderlich.' });
            }

            if (pointsPerUnit <= 0) {
                return res.status(400).json({ error: 'Punkte pro Einheit muss größer als 0 sein.' });
            }

            const { rows: existing } = await pool.query('SELECT id FROM exercises WHERE id = $1', [id]);
            if (existing.length > 0) {
                return res.status(409).json({ error: 'Eine Übung mit dieser ID existiert bereits.' });
            }

            const { rows } = await pool.query(`
                INSERT INTO exercises (id, name, points_per_unit, unit, has_weight, has_set_mode, unit_options, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
                id,
                name,
                pointsPerUnit,
                unit,
                hasWeight || false,
                hasSetMode !== undefined ? hasSetMode : true,
                JSON.stringify(unitOptions || []),
                isActive !== undefined ? isActive : true
            ]);

            res.status(201).json(toCamelCase(rows[0]));
        } catch (error) {
            console.error('Admin exercises POST error:', error);
            res.status(500).json({ error: 'Serverfehler beim Erstellen der Übung.' });
        }
    });

    // PUT /api/admin/exercises/:id - Update exercise
    router.put('/exercises/:id', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Erlaubte Felder zum Aktualisieren
            const allowedFields = ['name', 'pointsPerUnit', 'unit', 'hasWeight', 'hasSetMode', 'unitOptions', 'isActive'];
            const fieldsToUpdate = Object.keys(updates).filter(key => allowedFields.includes(key));

            if (fieldsToUpdate.length === 0) {
                return res.status(400).json({ error: 'Keine gültigen Felder zum Aktualisieren angegeben.' });
            }

            // Konvertiere camelCase zu snake_case für die Datenbank
            const updatePairs = fieldsToUpdate.map((field, index) => {
                let dbField = field;
                if (field === 'pointsPerUnit') dbField = 'points_per_unit';
                else if (field === 'hasWeight') dbField = 'has_weight';
                else if (field === 'hasSetMode') dbField = 'has_set_mode';
                else if (field === 'unitOptions') dbField = 'unit_options';
                else if (field === 'isActive') dbField = 'is_active';

                if (field === 'unitOptions') {
                    return `${dbField} = $${index + 1}::jsonb`;
                }
                return `${dbField} = $${index + 1}`;
            }).join(', ');

            const values = fieldsToUpdate.map(field => {
                if (field === 'unitOptions') {
                    return JSON.stringify(updates[field] || []);
                }
                return updates[field];
            });
            values.push(id);

            const query = `
                UPDATE exercises
                SET ${updatePairs}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${values.length}
                RETURNING *
            `;

            const { rows } = await pool.query(query, values);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Übung nicht gefunden.' });
            }

            res.json(toCamelCase(rows[0]));
        } catch (error) {
            console.error('Admin exercises PUT error:', error);
            res.status(500).json({ error: 'Serverfehler beim Aktualisieren der Übung.' });
        }
    });

    router.post('/invite-user', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const { email, firstName, lastName } = req.body;

            if (!email || !firstName || !lastName) {
                return res.status(400).json({ error: 'E-Mail, Vorname und Nachname sind erforderlich.' });
            }

            const { rows: existingUsers } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUsers.length > 0) {
                return res.status(409).json({ error: 'Für diese E-Mail existiert bereits ein Konto.' });
            }

            const { invitation, token } = await createInvitation(pool, {
                email,
                firstName,
                lastName,
                invitedBy: req.user.id,
            });

            const frontendUrl = getFrontendUrl(req);
            const inviteLink = `${frontendUrl}/invite/${req.user.id}`;
            const expiresDate = new Date(invitation.expires_at).toLocaleDateString('de-DE');

            // Plain-Text-Version für Fallback
            const emailBody = `Hallo ${firstName},

Du wurdest zu Sportify eingeladen.

Klicke auf folgenden Link, um dich zu registrieren:
${inviteLink}

Oder verwende diesen Code bei der Registrierung: ${token}

Die Einladung läuft am ${expiresDate} ab.`;

            // Verwende das neue E-Mail-Template
            const { createActionEmail } = await import('../utils/emailTemplates.js');
            const emailHtml = createActionEmail({
                greeting: `Hallo ${firstName},`,
                title: 'Du wurdest zu Sportify eingeladen',
                message: 'Du wurdest eingeladen, Teil der Sportify-Community zu werden. Registriere dich jetzt und starte dein Training!',
                buttonText: 'Jetzt registrieren',
                buttonUrl: inviteLink,
                token: token,
                tokenLabel: 'Oder verwende diesen Code bei der Registrierung:',
                additionalText: `Die Einladung läuft am ${expiresDate} ab.`,
                frontendUrl,
                preheader: 'Du wurdest zu Sportify eingeladen'
            });

            try {
                await queueEmail(pool, {
                    recipient: email,
                    subject: 'Sportify – Einladung',
                    body: emailBody,
                    html: emailHtml,
                });
                console.log(`✅ Admin-Einladungs-E-Mail erfolgreich versendet an: ${email}`);
            } catch (emailError) {
                console.error(`❌ Fehler beim Versenden der Admin-Einladungs-E-Mail an ${email}:`, emailError);
                console.error('   Fehler-Details:', {
                    message: emailError.message,
                    code: emailError.code,
                    response: emailError.response
                });
                throw new Error(`Einladung wurde erstellt, aber E-Mail konnte nicht versendet werden: ${emailError.message}`);
            }

            res.status(201).json({
                message: 'Einladung gesendet.',
                invitation: toCamelCase(invitation),
            });
        } catch (error) {
            if (error instanceof InvitationError) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Invite user error:', error);
            res.status(500).json({ error: 'Serverfehler beim Senden der Einladung.' });
        }
    });

    return router;
};

