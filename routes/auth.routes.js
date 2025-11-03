import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from '../authMiddleware.js';
import { queueEmail } from '../services/emailService.js';
import {
    TokenError,
    createEmailVerificationToken,
    createPasswordResetToken,
    markEmailVerificationTokenUsed,
    markPasswordResetTokenUsed,
    validateEmailVerificationToken,
    validatePasswordResetToken
} from '../services/tokenService.js';
import {
    buildOtpAuthUrl,
    generateBackupCodes,
    generateTotpSecret,
    getFrontendUrl,
    toCamelCase,
    verifyTotpToken,
} from '../utils/helpers.js';

export const createAuthRouter = (pool) => {
    const router = express.Router();

    // GET /api/auth/me - Protected Route
    router.get('/me', authMiddleware, async (req, res) => {
        try {
            const userQuery = `
                SELECT id, email, first_name, last_name, nickname, display_preference, avatar_url,
                       is_email_verified, has_2fa, is_admin, theme_preference, language_preference,
                       preferences, created_at, last_login_at, role
                FROM users
                WHERE id = $1
            `;
            const { rows } = await pool.query(userQuery, [req.user.id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            // Convert snake_case to camelCase
            const user = toCamelCase(rows[0]);

            // Parse preferences if it's a string
            if (user.preferences && typeof user.preferences === 'string') {
                try {
                    user.preferences = JSON.parse(user.preferences);
                } catch (e) {
                    user.preferences = {};
                }
            } else if (!user.preferences) {
                user.preferences = {};
            }

            // Ensure avatar field is correctly mapped (avatar_url -> avatarUrl -> avatar)
            if (user.avatarUrl !== undefined) {
                user.avatar = user.avatarUrl;
                delete user.avatarUrl;
            }

            res.json(user);
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen der Benutzerdaten.' });
        }
    });

    // POST /api/auth/register
    router.post('/register', async (req, res) => {
        const { email, password, firstName, lastName, nickname, displayPreference } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'Alle erforderlichen Felder müssen ausgefüllt werden.' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Ungültige E-Mail-Adresse.' });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            const newUserQuery = `
                INSERT INTO users (email, password_hash, first_name, last_name, nickname, display_preference, weekly_goals)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, email, first_name, last_name, nickname, display_preference, is_admin;
            `;
            const values = [email, password_hash, firstName, lastName, nickname, displayPreference || 'firstName', '{}'];

            const { rows } = await pool.query(newUserQuery, values);
            const rawUser = rows[0];

            // Versuche Verifizierungs-E-Mail zu senden
            let verificationEmailSent = false;
            let verificationToken = null;
            try {
                const tokenResult = await createEmailVerificationToken(pool, rawUser.id);
                verificationToken = tokenResult.token;

                const frontendUrl = getFrontendUrl(req);
                const verificationUrl = `${frontendUrl}/auth/email-verification?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`;

                const emailBody = `Hallo ${firstName},

bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Link klickst:

${verificationUrl}

Alternativ kannst du diesen Code manuell eingeben:
${verificationToken}

Dieser Link ist 24 Stunden lang gültig.

Dein Sportify-Team`;

                const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #0056b3; }
        .code { background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 14px; font-family: monospace; margin: 20px 0; word-break: break-all; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <p>Hallo ${firstName},</p>
        <p>bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Button klickst:</p>
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">E-Mail-Adresse bestätigen</a>
        </div>
        <p style="margin-top: 30px;">Falls der Button nicht funktioniert, kopiere folgenden Link in deinen Browser:</p>
        <div class="code">${verificationUrl}</div>
        <p>Alternativ kannst du diesen Code manuell eingeben:</p>
        <div class="code">${verificationToken}</div>
        <p style="margin-top: 20px;">Dieser Link ist 24 Stunden lang gültig.</p>
        <div class="footer">
            <p>Dein Sportify-Team</p>
        </div>
    </div>
</body>
</html>`;

                await queueEmail(pool, {
                    recipient: email,
                    subject: 'Sportify – E-Mail bestätigen',
                    body: emailBody,
                    html: emailHtml,
                });
                verificationEmailSent = true;
            } catch (mailError) {
                console.error('Fehler beim Versenden der Verifizierungs-E-Mail:', mailError.message);
                // User wurde erstellt, aber E-Mail konnte nicht versendet werden
                // Das ist nicht kritisch - User kann später erneut anfordern
            }

            // Convert snake_case to camelCase
            const user = toCamelCase(rawUser);

            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.status(201).json({ user, token });
        } catch (error) {
            console.error('Registration error:', error.message);
            if (error.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' });
            }
            const errorMessage = process.env.NODE_ENV === 'development'
                ? (error.message || error.detail || 'Serverfehler bei der Registrierung.')
                : 'Serverfehler bei der Registrierung.';
            res.status(500).json({ error: errorMessage });
        }
    });

    // POST /api/auth/login
    router.post('/login', async (req, res) => {
        const { email, password, twoFactorToken, backupCode } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' });
        }

        try {
            const userQuery = 'SELECT * FROM users WHERE email = $1';
            const { rows } = await pool.query(userQuery, [email]);

            if (rows.length === 0) {
                return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });
            }

            const rawUser = rows[0];
            const isMatch = await bcrypt.compare(password, rawUser.password_hash);

            if (!isMatch) {
                return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });
            }

            if (rawUser.has_2fa) {
                if (!twoFactorToken && !backupCode) {
                    // Return 200 with requires2FA flag instead of 400 to avoid browser console error
                    // This is expected behavior, not an error
                    return res.status(200).json({ requires2FA: true, message: 'Zwei-Faktor-Authentifizierungscode erforderlich.' });
                }

                const secret = rawUser.totp_secret;

                if (twoFactorToken) {
                    if (!secret) {
                        return res.status(500).json({ error: '2FA-Konfiguration ist unvollständig.' });
                    }
                    const isValidToken = verifyTotpToken(twoFactorToken, secret);
                    if (!isValidToken) {
                        return res.status(401).json({ error: 'Ungültiger Zwei-Faktor-Code.' });
                    }
                } else if (backupCode) {
                    const normalizedCode = String(backupCode).replace(/\s+/g, '').toUpperCase();
                    const { rows: backupRows } = await pool.query(
                        'SELECT id, code_hash FROM user_backup_codes WHERE user_id = $1 AND used_at IS NULL',
                        [rawUser.id]
                    );

                    let matchedCodeId = null;
                    for (const backupRow of backupRows) {
                        const matches = await bcrypt.compare(normalizedCode, backupRow.code_hash);
                        if (matches) {
                            matchedCodeId = backupRow.id;
                            break;
                        }
                    }

                    if (!matchedCodeId) {
                        return res.status(401).json({ error: 'Ungültiger Backup-Code.' });
                    }

                    await pool.query('UPDATE user_backup_codes SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [matchedCodeId]);
                }
            }

            const token = jwt.sign({ userId: rawUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

            // Don't send password hash to client
            delete rawUser.password_hash;
            delete rawUser.totp_secret;
            delete rawUser.totp_confirmed;

            // Convert snake_case to camelCase
            const user = toCamelCase(rawUser);

            // Update last_login_at
            await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [rawUser.id]);

            res.json({ user, token });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Serverfehler beim Login.' });
        }
    });

    // POST /api/auth/reset-password/confirm - Complete Password Reset (with token)
    // Wird verwendet um das Passwort mit einem Token zurückzusetzen
    router.post('/reset-password/confirm', async (req, res) => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({ error: 'Token und neues Passwort sind erforderlich.' });
            }

            if (password.length < 8) {
                return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' });
            }

            const tokenData = await validatePasswordResetToken(pool, token);
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, tokenData.userId]);
            await markPasswordResetTokenUsed(pool, tokenData.id);

            res.json({ message: 'Passwort wurde erfolgreich zurückgesetzt.' });
        } catch (error) {
            if (error instanceof TokenError) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Confirm reset password error:', error);
            res.status(500).json({ error: 'Serverfehler beim Bestätigen des Passwort-Resets.' });
        }
    });

    // POST /api/auth/confirm-reset-password - Alias für /reset-password/confirm (für Frontend-Kompatibilität)
    router.post('/confirm-reset-password', async (req, res) => {
        // Weiterleitung zu /reset-password/confirm
        req.url = '/reset-password/confirm';
        req.path = '/reset-password/confirm';
        return router.handle(req, res);
    });

    // POST /api/auth/verify-email
    router.post('/verify-email', async (req, res) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ error: 'Verifizierungstoken ist erforderlich.' });
            }

            const tokenData = await validateEmailVerificationToken(pool, token);
            await pool.query('UPDATE users SET is_email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [tokenData.userId]);
            await markEmailVerificationTokenUsed(pool, tokenData.id);

            res.json({ message: 'E-Mail erfolgreich verifiziert.' });
        } catch (error) {
            if (error instanceof TokenError) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Verify email error:', error);
            res.status(500).json({ error: 'Serverfehler bei der E-Mail-Verifizierung.' });
        }
    });

    // POST /api/auth/resend-verification
    router.post('/resend-verification', async (req, res) => {
        try {
            // Optional: Auth Token aus Header
            let userId = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.substring(7);
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.userId;
                } catch (e) {
                    // Token ungültig, verwende E-Mail statt User-ID
                }
            }

            const { email } = req.body;

            let user;
            if (userId) {
                // Wenn authentifiziert, verwende User-ID
                const { rows } = await pool.query('SELECT id, email, first_name, is_email_verified FROM users WHERE id = $1', [userId]);
                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
                }
                user = rows[0];
            } else if (email) {
                // Wenn nicht authentifiziert, verwende E-Mail
                const { rows } = await pool.query('SELECT id, email, first_name, is_email_verified FROM users WHERE email = $1', [email]);
                if (rows.length === 0) {
                    // Aus Sicherheitsgründen: Immer Erfolgsmeldung
                    return res.json({ message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine Verifizierungs-E-Mail gesendet.' });
                }
                user = rows[0];
            } else {
                return res.status(400).json({ error: 'E-Mail-Adresse oder Authentifizierung erforderlich.' });
            }

            if (user.is_email_verified) {
                return res.status(400).json({ error: 'E-Mail wurde bereits verifiziert.' });
            }

            const { token: verificationToken } = await createEmailVerificationToken(pool, user.id);

            const frontendUrl = getFrontendUrl(req);
            const verificationUrl = `${frontendUrl}/auth/email-verification?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(user.email)}`;

            const emailBody = `Hallo ${user.first_name},

bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Link klickst:

${verificationUrl}

Alternativ kannst du diesen Code manuell eingeben:
${verificationToken}

Dieser Link ist 24 Stunden lang gültig.

Dein Sportify-Team`;

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #0056b3; }
        .code { background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 14px; font-family: monospace; margin: 20px 0; word-break: break-all; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <p>Hallo ${user.first_name},</p>
        <p>bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Button klickst:</p>
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">E-Mail-Adresse bestätigen</a>
        </div>
        <p style="margin-top: 30px;">Falls der Button nicht funktioniert, kopiere folgenden Link in deinen Browser:</p>
        <div class="code">${verificationUrl}</div>
        <p>Alternativ kannst du diesen Code manuell eingeben:</p>
        <div class="code">${verificationToken}</div>
        <p style="margin-top: 20px;">Dieser Link ist 24 Stunden lang gültig.</p>
        <div class="footer">
            <p>Dein Sportify-Team</p>
        </div>
    </div>
</body>
</html>`;

            try {
                await queueEmail(pool, {
                    recipient: user.email,
                    subject: 'Sportify – E-Mail bestätigen',
                    body: emailBody,
                    html: emailHtml,
                });

                console.log('✅ Verifizierungs-E-Mail erfolgreich erneut versendet an:', user.email);
                res.json({ message: 'Verifizierungs-E-Mail wurde erneut gesendet.' });
            } catch (mailError) {
                console.error('❌ Fehler beim erneuten Versenden der Verifizierungs-E-Mail:', mailError);
                console.error('   Fehler-Details:', {
                    message: mailError.message,
                    code: mailError.code,
                    response: mailError.response
                });
                return res.status(500).json({ error: 'Verifizierungs-E-Mail konnte nicht versendet werden. Bitte versuche es später erneut.' });
            }
        } catch (error) {
            if (error instanceof TokenError) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Resend verification error:', error);
            res.status(500).json({ error: 'Serverfehler beim Senden der Verifizierungs-E-Mail.' });
        }
    });

    // POST /api/auth/enable-2fa - Enable Two-Factor Authentication
    router.post('/enable-2fa', authMiddleware, async (req, res) => {
        const client = await pool.connect();
        try {
            const { rows } = await client.query(
                'SELECT email, has_2fa, totp_secret, totp_confirmed FROM users WHERE id = $1',
                [req.user.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            const user = rows[0];

            if (user.has_2fa && user.totp_confirmed) {
                return res.status(400).json({ error: 'Zwei-Faktor-Authentifizierung ist bereits aktiviert.' });
            }

            const secret = generateTotpSecret();
            const otpLabel = user.email || `user-${req.user.id}`;
            const otpauthUrl = buildOtpAuthUrl(secret, otpLabel);
            const backupCodes = generateBackupCodes();
            const hashedBackupCodes = await Promise.all(backupCodes.map(async (code) => {
                const normalized = code.toUpperCase();
                return bcrypt.hash(normalized, 12);
            }));

            try {
                await client.query('BEGIN');
                await client.query(
                    'UPDATE users SET totp_secret = $1, totp_confirmed = false, has_2fa = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [secret, req.user.id]
                );
                await client.query('DELETE FROM user_backup_codes WHERE user_id = $1', [req.user.id]);
                for (const hashedCode of hashedBackupCodes) {
                    await client.query(
                        'INSERT INTO user_backup_codes (user_id, code_hash) VALUES ($1, $2)',
                        [req.user.id, hashedCode]
                    );
                }
                await client.query('COMMIT');
            } catch (transactionError) {
                await client.query('ROLLBACK');
                throw transactionError;
            }

            res.json({
                secret: {
                    base32: secret,
                    otpauthUrl,
                },
                backupCodes,
                message: 'Zwei-Faktor-Authentifizierung vorbereitet. Bitte Code eingeben, um zu bestätigen.',
            });
        } catch (error) {
            console.error('Enable 2FA error:', error);
            res.status(500).json({ error: 'Serverfehler beim Aktivieren der 2FA.' });
        } finally {
            client.release();
        }
    });

    // POST /api/auth/verify-2fa - Confirm Two-Factor Authentication setup
    router.post('/verify-2fa', authMiddleware, async (req, res) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ error: 'Ein TOTP-Code ist erforderlich.' });
            }

            const { rows } = await pool.query(
                'SELECT totp_secret, totp_confirmed FROM users WHERE id = $1',
                [req.user.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            const { totp_secret: secret } = rows[0];

            if (!secret) {
                return res.status(400).json({ error: 'Kein TOTP-Setup gefunden. Bitte erneut starten.' });
            }

            const isValid = verifyTotpToken(token, secret);

            if (!isValid) {
                return res.status(401).json({ error: 'Ungültiger TOTP-Code.' });
            }

            await pool.query(
                'UPDATE users SET has_2fa = true, totp_confirmed = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [req.user.id]
            );

            res.json({ message: 'Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert.' });
        } catch (error) {
            console.error('Verify 2FA error:', error);
            res.status(500).json({ error: 'Serverfehler beim Bestätigen der 2FA.' });
        }
    });

    // POST /api/auth/backup-codes/consume - Consume a backup code
    router.post('/backup-codes/consume', authMiddleware, async (req, res) => {
        try {
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({ error: 'Ein Backup-Code ist erforderlich.' });
            }

            const normalizedCode = String(code).replace(/\s+/g, '').toUpperCase();
            const { rows } = await pool.query(
                'SELECT id, code_hash FROM user_backup_codes WHERE user_id = $1 AND used_at IS NULL',
                [req.user.id]
            );

            let matchedCodeId = null;
            for (const row of rows) {
                const matches = await bcrypt.compare(normalizedCode, row.code_hash);
                if (matches) {
                    matchedCodeId = row.id;
                    break;
                }
            }

            if (!matchedCodeId) {
                return res.status(404).json({ error: 'Backup-Code wurde nicht gefunden oder bereits verwendet.' });
            }

            await pool.query('UPDATE user_backup_codes SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [matchedCodeId]);

            res.json({ message: 'Backup-Code wurde erfolgreich verwendet.' });
        } catch (error) {
            console.error('Consume backup code error:', error);
            res.status(500).json({ error: 'Serverfehler beim Verwenden des Backup-Codes.' });
        }
    });

    // POST /api/auth/backup-codes/rotate - Generate new backup codes
    router.post('/backup-codes/rotate', authMiddleware, async (req, res) => {
        const client = await pool.connect();
        try {
            const { rows } = await client.query('SELECT has_2fa FROM users WHERE id = $1', [req.user.id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            if (!rows[0].has_2fa) {
                return res.status(400).json({ error: 'Backup-Codes können nur für aktive 2FA erneuert werden.' });
            }

            const backupCodes = generateBackupCodes();
            const hashedBackupCodes = await Promise.all(backupCodes.map(async (code) => bcrypt.hash(code.toUpperCase(), 12)));

            try {
                await client.query('BEGIN');
                await client.query('DELETE FROM user_backup_codes WHERE user_id = $1', [req.user.id]);
                for (const hashedCode of hashedBackupCodes) {
                    await client.query('INSERT INTO user_backup_codes (user_id, code_hash) VALUES ($1, $2)', [req.user.id, hashedCode]);
                }
                await client.query('COMMIT');
            } catch (transactionError) {
                await client.query('ROLLBACK');
                throw transactionError;
            }

            res.json({
                backupCodes,
                message: 'Neue Backup-Codes wurden erfolgreich generiert.',
            });
        } catch (error) {
            console.error('Rotate backup codes error:', error);
            res.status(500).json({ error: 'Serverfehler beim Erneuern der Backup-Codes.' });
        } finally {
            client.release();
        }
    });

    // POST /api/auth/disable-2fa - Disable Two-Factor Authentication
    router.post('/disable-2fa', authMiddleware, async (req, res) => {
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

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(
                    'UPDATE users SET has_2fa = false, totp_secret = NULL, totp_confirmed = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                    [req.user.id]
                );
                await client.query('DELETE FROM user_backup_codes WHERE user_id = $1', [req.user.id]);
                await client.query('COMMIT');
            } catch (transactionError) {
                await client.query('ROLLBACK');
                throw transactionError;
            } finally {
                client.release();
            }

            res.json({ message: '2FA wurde erfolgreich deaktiviert.' });
        } catch (error) {
            console.error('Disable 2FA error:', error);
            res.status(500).json({ error: 'Serverfehler beim Deaktivieren der 2FA.' });
        }
    });

    // POST /api/auth/forgot-password - Request Password Reset
    router.post('/forgot-password', async (req, res) => {
        try {
            const { email } = req.body || {};

            // Validierung
            if (!email || typeof email !== 'string' || !email.trim()) {
                return res.status(400).json({ error: 'E-Mail-Adresse ist erforderlich.' });
            }

            const normalizedEmail = email.trim().toLowerCase();

            // E-Mail-Format validieren
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({ error: 'Ungültige E-Mail-Adresse.' });
            }

            // Prüfe ob User existiert
            const userResult = await pool.query(
                'SELECT id, first_name, email FROM users WHERE LOWER(email) = $1',
                [normalizedEmail]
            );

            // Aus Sicherheitsgründen: Erfolgsmeldung senden, auch wenn User nicht existiert
            if (userResult.rows.length === 0) {
                return res.status(200).json({
                    message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.',
                    success: true
                });
            }

            // User existiert - erstelle Token und versende E-Mail
            const user = userResult.rows[0];
            const userId = user.id;
            const userName = user.first_name || 'Benutzer';
            const userEmail = user.email;

            // Erstelle Reset-Token
            let resetToken;
            try {
                const tokenResult = await createPasswordResetToken(pool, userId);
                resetToken = tokenResult.token;
            } catch (tokenError) {
                console.error('Fehler beim Erstellen des Passwort-Reset-Tokens:', tokenError);
                // Token-Erstellung fehlgeschlagen - Erfolgsmeldung aus Sicherheitsgründen
                return res.status(200).json({
                    message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.',
                    success: true
                });
            }

            // Erstelle E-Mail-Inhalt
            const frontendUrl = getFrontendUrl(req);
            const resetUrl = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
            const greeting = `Hallo ${userName},`;

            const emailBody = `${greeting}

Du hast eine Passwort-Zurücksetzung für dein Sportify-Konto angefordert.

Klicke auf folgenden Link, um dein Passwort zurückzusetzen:
${resetUrl}

Alternativ kannst du diesen Code manuell eingeben:
${resetToken}

Dieser Link ist eine Stunde lang gültig.

Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.

Dein Sportify-Team`;

            const emailHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #b91c1c; }
        .token { background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 14px; font-family: monospace; margin: 20px 0; word-break: break-all; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <p>${greeting}</p>
        <p>Du hast eine Passwort-Zurücksetzung für dein Sportify-Konto angefordert.</p>
        <p>Klicke auf folgenden Button, um dein Passwort zurückzusetzen:</p>
        <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
        </div>
        <p style="margin-top: 30px;">Falls der Button nicht funktioniert, kopiere folgenden Link in deinen Browser:</p>
        <div class="token">${resetUrl}</div>
        <p>Alternativ kannst du diesen Code manuell eingeben:</p>
        <div class="token">${resetToken}</div>
        <p style="margin-top: 20px;">Dieser Link ist eine Stunde lang gültig.</p>
        <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
        <div class="footer">
            <p>Dein Sportify-Team</p>
        </div>
    </div>
</body>
</html>`;

            // Versende E-Mail
            try {
                await queueEmail(pool, {
                    recipient: userEmail,
                    subject: 'Sportify – Passwort zurücksetzen',
                    body: emailBody,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error('Fehler beim Versenden der Passwort-Reset-E-Mail:', emailError);
                // E-Mail-Versand fehlgeschlagen - aber Token wurde bereits erstellt
            }

            // Erfolgsmeldung
            return res.status(200).json({
                message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.',
                success: true
            });

        } catch (error) {
            console.error('Unerwarteter Fehler beim Passwort-Reset:', error);
            // Aus Sicherheitsgründen: Auch bei unerwarteten Fehlern Erfolgsmeldung
            return res.status(200).json({
                message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.',
                success: true
            });
        }
    });

    return router;
};

