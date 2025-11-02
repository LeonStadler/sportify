import bcrypt from 'bcryptjs';
import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { queueEmail } from '../services/emailService.js';
import { InvitationError, createInvitation } from '../services/invitationService.js';
import { getFrontendUrl, toCamelCase } from '../utils/helpers.js';

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

            // Ensure avatar field is correctly mapped (avatar_url -> avatarUrl -> avatar)
            if (user.avatarUrl !== undefined) {
                user.avatar = user.avatarUrl;
                delete user.avatarUrl;
            }

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
                // Benutzer existiert bereits - erstelle Freundschaftsanfrage direkt
                const targetUserId = existingUsers[0].id;

                if (targetUserId === req.user.id) {
                    return res.status(400).json({ error: 'Du kannst dir selbst keine Freundschaftsanfrage senden.' });
                }

                // Prüfe ob bereits befreundet
                const [firstUser, secondUser] = [req.user.id, targetUserId].sort();
                const { rowCount: existingFriends } = await pool.query(
                    'SELECT 1 FROM friendships WHERE user_one_id = $1 AND user_two_id = $2',
                    [firstUser, secondUser]
                );

                if (existingFriends > 0) {
                    return res.status(409).json({ error: 'Ihr seid bereits befreundet.' });
                }

                // Prüfe ob bereits eine ausstehende Anfrage existiert
                const { rowCount: pendingRequests } = await pool.query(
                    `SELECT 1 FROM friend_requests
                     WHERE ((requester_id = $1 AND target_id = $2) OR (requester_id = $2 AND target_id = $1))
                     AND status = 'pending'`,
                    [req.user.id, targetUserId]
                );

                if (pendingRequests > 0) {
                    return res.status(409).json({ error: 'Es besteht bereits eine ausstehende Anfrage zwischen euch.' });
                }

                // Erstelle Freundschaftsanfrage
                const { randomUUID } = await import('crypto');
                const requestId = randomUUID();
                await pool.query(
                    `INSERT INTO friend_requests (id, requester_id, target_id, status)
                     VALUES ($1, $2, $3, 'pending')`,
                    [requestId, req.user.id, targetUserId]
                );

                return res.status(201).json({
                    message: 'Freundschaftsanfrage wurde gesendet.',
                    type: 'friend_request',
                    requestId
                });
            }

            // Benutzer existiert nicht - erstelle Einladung
            const { invitation, token } = await createInvitation(pool, {
                email,
                firstName: '', // Wird bei Registrierung eingegeben
                lastName: '', // Wird bei Registrierung eingegeben
                invitedBy: req.user.id,
            });

            // Frontend URL für Einladungslink
            const frontendUrl = getFrontendUrl(req);
            const inviteLink = `${frontendUrl}/invite/${req.user.id}`;

            // Sende E-Mail mit Einladungslink
            try {
            await queueEmail(pool, {
                recipient: email,
                subject: 'Sportify – Einladung',
                body: `Hallo!\n\nDu wurdest zu Sportify eingeladen.\n\nKlicke auf folgenden Link, um dich zu registrieren:\n${inviteLink}\n\nOder verwende diesen Code bei der Registrierung: ${token}\n\nDie Einladung läuft am ${new Date(invitation.expires_at).toLocaleDateString('de-DE')} ab.`,
            });
                console.log(`✅ Einladungs-E-Mail erfolgreich versendet an: ${email}`);
            } catch (emailError) {
                console.error(`❌ Fehler beim Versenden der Einladungs-E-Mail an ${email}:`, emailError);
                console.error('   Fehler-Details:', {
                    message: emailError.message,
                    code: emailError.code,
                    response: emailError.response
                });
                // Einladung wurde erstellt, aber E-Mail konnte nicht versendet werden
                // Wir werfen den Fehler weiter, damit der User informiert wird
                throw new Error(`Einladung wurde erstellt, aber E-Mail konnte nicht versendet werden: ${emailError.message}`);
            }

            res.status(201).json({
                message: 'Einladung gesendet.',
                type: 'invitation',
                invitation: toCamelCase(invitation),
                inviteLink
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
            // Prüfe ob die Tabelle existiert
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'invitations'
                );
            `);

            if (!tableCheck.rows[0]?.exists) {
                // Tabelle existiert nicht, gib leeres Array zurück
                return res.json([]);
            }

            const { rows } = await pool.query(
                `SELECT id, email, first_name, last_name, status, created_at, expires_at, used, used_at, invited_by
                 FROM invitations
                 WHERE invited_by = $1
                 ORDER BY created_at DESC`,
                [req.user.id]
            );

            const invitations = rows.map((row) => {
                const invitation = toCamelCase(row);
                // Stelle sicher, dass alle Felder vorhanden sind
                return {
                    id: invitation.id || String(invitation.id) || '',
                    email: invitation.email || '',
                    firstName: invitation.firstName || invitation.first_name || '',
                    lastName: invitation.lastName || invitation.last_name || '',
                    status: invitation.status || 'pending',
                    createdAt: invitation.createdAt || invitation.created_at || new Date().toISOString(),
                    expiresAt: invitation.expiresAt || invitation.expires_at || new Date().toISOString(),
                    used: invitation.used !== undefined ? Boolean(invitation.used) : false,
                    usedAt: invitation.usedAt || invitation.used_at || null,
                };
            });
            res.json(invitations);
        } catch (error) {
            console.error('Get invitations error:', error);
            console.error('Error stack:', error.stack);
            // Detailliertere Fehlermeldung für Debugging
            res.status(500).json({
                error: 'Serverfehler beim Laden der Einladungen.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });

    return router;
};

