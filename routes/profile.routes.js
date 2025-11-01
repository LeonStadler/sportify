import bcrypt from 'bcryptjs';
import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { toCamelCase } from '../utils/helpers.js';

export const createProfileRouter = (pool) => {
    const router = express.Router();

    // PUT /api/profile/update - Update user profile
    router.put('/update', authMiddleware, async (req, res) => {
        try {
            const { firstName, lastName, nickname, displayPreference, languagePreference, preferences } = req.body;

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
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING id, email, first_name, last_name, nickname, display_preference, 
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

    return router;
};

