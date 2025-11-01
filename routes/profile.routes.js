import bcrypt from 'bcryptjs';
import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { queueEmail } from '../services/emailService.js';
import { InvitationError, createInvitation } from '../services/invitationService.js';
import { toCamelCase } from '../utils/helpers.js';

export const createProfileRouter = (pool) => {
    const router = express.Router();

    // PUT /api/profile/update - Update user profile
    router.put('/update', authMiddleware, async (req, res) => {
        try {
            const { firstName, lastName, nickname, displayPreference, languagePreference, preferences, avatar } = req.body;

            if (!firstName || !lastName) {
                return res.status(400).json({ error: 'Vorname und Nachname sind erforderlich.' });
            }

            const updateQuery = `
                UPDATE users
                SET first_name = $1,
                    last_name = $2,
                    nickname = $3,
                    display_preference = $4, 
                    language_preference = $5,
                    preferences = $6,
                    avatar_url = $7,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
                RETURNING id, email, first_name, last_name, nickname, display_preference, avatar_url,
                         is_email_verified, has_2fa, is_admin, language_preference, preferences, 
                         created_at, last_login_at, role
            `;

            const { rows } = await pool.query(updateQuery, [
                firstName.trim(),
                lastName.trim(),
                nickname ? nickname.trim() : null,
                displayPreference || 'firstName',
                languagePreference || 'de',
                preferences ? JSON.stringify(preferences) : '{}',
                avatar ? (typeof avatar === 'string' ? avatar : JSON.stringify(avatar)) : null,
                req.user.id
            ]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            const user = toCamelCase(rows[0]);
            // Parse preferences back to object
            if (user.preferences && typeof user.preferences === 'string') {
                user.preferences = JSON.parse(user.preferences);
            }
            // avatar_url wird bereits in camelCase als avatar zurückgegeben

            res.json(user);
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Profils.' });
        }
    });

    // DELETE /api/profile/account - Delete user account
    router.delete('/account', authMiddleware, async (req, res) => {
        try {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ error: 'Passwort ist zur Bestätigung erforderlich.' });
            }

            // Verify password
            const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
            const { rows } = await pool.query(userQuery, [req.user.id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            const isMatch = await bcrypt.compare(password, rows[0].password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Ungültiges Passwort.' });
            }

            // Delete user (cascading deletes will handle related records)
            await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);

            res.json({ message: 'Konto wurde erfolgreich gelöscht.' });
        } catch (error) {
            console.error('Delete account error:', error);
            res.status(500).json({ error: 'Serverfehler beim Löschen des Kontos.' });
        }
    });

    // POST /api/profile/invite-friend - Invite a friend
    router.post('/invite-friend', authMiddleware, async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'E-Mail-Adresse ist erforderlich.' });
            }

            // Prüfe ob Benutzer bereits existiert
            const { rows: existingUsers } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUsers.length > 0) {
                return res.status(409).json({ error: 'Für diese E-Mail existiert bereits ein Konto.' });
            }

            // Erstelle Einladung ohne firstName und lastName (werden bei Registrierung eingegeben)
            const { invitation, token } = await createInvitation(pool, {
                email,
                firstName: '', // Wird bei Registrierung eingegeben
                lastName: '', // Wird bei Registrierung eingegeben
                invitedBy: req.user.id,
            });

            // Sende E-Mail
            await queueEmail(pool, {
                recipient: email,
                subject: 'Sportify – Einladung',
                body: `Hallo!\n\nDu wurdest zu Sportify eingeladen.\nVerwende diesen Code, um dich zu registrieren: ${token}\n\nDie Einladung läuft am ${new Date(invitation.expires_at).toLocaleDateString('de-DE')} ab.`,
            });

            res.status(201).json({
                message: 'Einladung gesendet.',
                invitation: toCamelCase(invitation),
            });
        } catch (error) {
            if (error instanceof InvitationError) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Invite friend error:', error);
            res.status(500).json({ error: 'Serverfehler beim Senden der Einladung.' });
        }
    });

    // GET /api/profile/invitations - Get user's invitations
    router.get('/invitations', authMiddleware, async (req, res) => {
        try {
            const { rows } = await pool.query(
                `SELECT id, email, first_name, last_name, status, created_at, expires_at, used, used_at, invited_by
                 FROM invitations
                 WHERE invited_by = $1
                 ORDER BY created_at DESC`,
                [req.user.id]
            );

            const invitations = rows.map((row) => toCamelCase(row));
            res.json(invitations);
        } catch (error) {
            console.error('Get invitations error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Einladungen.' });
        }
    });

    return router;
};

