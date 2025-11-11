import bcrypt from 'bcryptjs';
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
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
                         is_email_verified, has_2fa, language_preference, preferences, 
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

            // Fix has_2fa -> has2FA conversion (toCamelCase doesn't handle numbers)
            if (user.has_2fa !== undefined) {
                user.has2FA = user.has_2fa;
                delete user.has_2fa;
            }

            res.json(user);
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Profils.' });
        }
    });

    // POST /api/profile/change-password - Change user password
    router.post('/change-password', authMiddleware, async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Aktuelles Passwort und neues Passwort sind erforderlich.' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.' });
            }

            // Verify current password
            const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
            const { rows } = await pool.query(userQuery, [req.user.id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Ungültiges aktuelles Passwort.' });
            }

            // Check if new password is different from current password
            const isSamePassword = await bcrypt.compare(newPassword, rows[0].password_hash);
            if (isSamePassword) {
                return res.status(400).json({ error: 'Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.' });
            }

            // Hash new password - using same method as registration
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(newPassword, salt);

            // Update password
            await pool.query(
                'UPDATE users SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [password_hash, req.user.id]
            );

            res.json({ message: 'Passwort wurde erfolgreich geändert.' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Serverfehler beim Ändern des Passworts.' });
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
            const { rows: existingUsers } = await pool.query('SELECT id, first_name, last_name, nickname, display_preference FROM users WHERE email = $1', [email]);

            if (existingUsers.length > 0) {
                // Benutzer existiert bereits - gib Status zurück, damit Frontend Dialog anzeigen kann
                const targetUser = existingUsers[0];
                const targetUserId = targetUser.id;

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

                // Gebe zurück, dass Benutzer existiert, damit Frontend Dialog anzeigen kann
                const displayName = targetUser.display_preference === 'nickname' && targetUser.nickname
                    ? targetUser.nickname
                    : targetUser.display_preference === 'fullName'
                        ? `${targetUser.first_name} ${targetUser.last_name}`
                        : targetUser.first_name;

                return res.status(200).json({
                    userExists: true,
                    userId: targetUserId,
                    displayName: displayName,
                    email: email,
                    message: 'Dieser Benutzer ist bereits registriert.'
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
            const expiresDate = new Date(invitation.expires_at).toLocaleDateString('de-DE');

            // Plain-Text-Version für Fallback
            const emailBody = `Hallo!

Du wurdest zu Sportify eingeladen.

Klicke auf folgenden Link, um dich zu registrieren:
${inviteLink}

Oder verwende diesen Code bei der Registrierung: ${token}

Die Einladung läuft am ${expiresDate} ab.`;

            // Verwende das neue E-Mail-Template
            const { createActionEmail } = await import('../utils/emailTemplates.js');
            const emailHtml = createActionEmail({
                greeting: 'Hallo!',
                title: 'Du wurdest zu Sportify eingeladen',
                message: 'Jemand hat dich eingeladen, Teil der Sportify-Community zu werden. Registriere dich jetzt und starte dein Training!',
                buttonText: 'Jetzt registrieren',
                buttonUrl: inviteLink,
                additionalText: `Die Einladung läuft am ${expiresDate} ab.`,
                frontendUrl,
                preheader: 'Du wurdest zu Sportify eingeladen'
            });

            // Sende E-Mail mit Einladungslink
            try {
            await queueEmail(pool, {
                recipient: email,
                subject: 'Sportify – Einladung',
                body: emailBody,
                html: emailHtml,
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
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            res.status(500).json({ 
                error: 'Serverfehler beim Senden der Einladung.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
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

