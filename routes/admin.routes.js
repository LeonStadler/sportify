import express from 'express';
import { InvitationError, createInvitation } from '../services/invitationService.js';
import { queueEmail } from '../services/emailService.js';
import { toCamelCase } from '../utils/helpers.js';

export const createAdminRouter = (pool) => {
    const router = express.Router();

    router.get('/users', async (req, res) => {
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

    router.get('/invitations', async (req, res) => {
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

    router.post('/invite-user', async (req, res) => {
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

            await queueEmail(pool, {
                recipient: email,
                subject: 'Sportify – Einladung',
                body: `Hallo ${firstName},\n\nDu wurdest zu Sportify eingeladen.\nVerwende diesen Code, um dich zu registrieren: ${token}\n\nDie Einladung läuft am ${new Date(invitation.expires_at).toISOString()} ab.`,
            });

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

