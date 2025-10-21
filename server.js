import bcrypt from 'bcryptjs';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
import { randomUUID } from 'crypto';
import { queueEmail } from './services/emailService.js';
import {
    TokenError,
    createEmailVerificationToken,
    createPasswordResetToken,
    markEmailVerificationTokenUsed,
    markPasswordResetTokenUsed,
    validateEmailVerificationToken,
    validatePasswordResetToken,
} from './services/tokenService.js';
import { InvitationError, createInvitation } from './services/invitationService.js';
import { createAdminMiddleware } from './middleware/adminMiddleware.js';

import { createMigrationRunner } from './db/migrations.js';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const app = express();
const port = process.env.PORT || 3001;

const ALLOWED_JOURNAL_MOODS = ['energized', 'balanced', 'tired', 'sore', 'stressed'];

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    }

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        converted[camelKey] = toCamelCase(value);
    }
    return converted;
};

const applyDisplayName = (user) => {
    if (user.displayPreference === 'nickname' && user.nickname) {
        user.displayName = user.nickname;
    } else if (user.displayPreference === 'fullName') {
        user.displayName = `${user.firstName} ${user.lastName}`;
    } else {
        user.displayName = user.firstName;
    }
    return user;
};

const createRateLimiter = ({ windowMs, max }) => {
    const hits = new Map();

    return (key) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        const existing = hits.get(key) || [];
        const recent = existing.filter((timestamp) => timestamp > windowStart);
        recent.push(now);
        hits.set(key, recent);

        if (recent.length > max) {
            const earliest = recent[0];
            const retryAfterMs = windowMs - (now - earliest);
            return { allowed: false, retryAfter: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
        }

        return { allowed: true };
    };
};
// TOTP helpers
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const bufferToBase32 = (buffer) => {
    let bits = 0;
    let value = 0;
    let output = '';

    for (const byte of buffer) {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }

    return output;
};

const base32ToBuffer = (input) => {
    const sanitized = input.toUpperCase().replace(/=+$/, '');
    let bits = 0;
    let value = 0;
    const bytes = [];

    for (const char of sanitized) {
        const index = BASE32_ALPHABET.indexOf(char);
        if (index === -1) {
            throw new Error('Ungültiger Base32-Wert.');
        }

        value = (value << 5) | index;
        bits += 5;

        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }

    return Buffer.from(bytes);
};

const generateTotpSecret = (length = 20) => {
    const random = crypto.randomBytes(length);
    return bufferToBase32(random);
};

const generateHOTP = (secret, counter, digits = 6) => {
    const secretBuffer = base32ToBuffer(secret);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', secretBuffer).update(counterBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24)
        | ((hmac[offset + 1] & 0xff) << 16)
        | ((hmac[offset + 2] & 0xff) << 8)
        | (hmac[offset + 3] & 0xff);

    const otp = (code % (10 ** digits)).toString().padStart(digits, '0');
    return otp;
};

const constantTimeEquals = (a, b) => {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    if (bufferA.length !== bufferB.length) return false;
    return crypto.timingSafeEqual(bufferA, bufferB);
};

const verifyTotpToken = (token, secret, window = 1, digits = 6) => {
    if (!secret) return false;
    const sanitizedToken = String(token || '').replace(/\s+/g, '');
    if (sanitizedToken.length !== digits) return false;

    const currentCounter = Math.floor(Date.now() / 1000 / 30);

    try {
        for (let offset = -window; offset <= window; offset++) {
            const generated = generateHOTP(secret, currentCounter + offset, digits);
            if (constantTimeEquals(generated, sanitizedToken)) {
                return true;
            }
        }
    } catch (error) {
        console.error('TOTP verification error:', error);
        return false;
    }

    return false;
};

const buildOtpAuthUrl = (secret, label, issuer = 'Sportify') => {
    const encodedLabel = encodeURIComponent(label);
    const encodedIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
};

const generateBackupCodes = (count = 10, length = 10) => {
    const codes = new Set();

    while (codes.size < count) {
        let code = '';
        while (code.length < length) {
            const value = crypto.randomInt(0, 36);
            code += value.toString(36);
        }
        codes.add(code.toUpperCase());
    }

    return Array.from(codes);
};

const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined) return defaultValue;
    const normalized = String(value).toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return defaultValue;
};

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sendPasswordResetEmail = async (recipientEmail, _token) => {
    // Integrate with transactional email provider here
    if (!recipientEmail) return;

    // Placeholder implementation ensures sensitive tokens are not logged.
    console.info('Passwort-Zurücksetzungs-E-Mail ausgelöst', { email: recipientEmail });

    if (process.env.NODE_ENV !== 'production') {
        console.info('Ein Entwicklungs-Reset-Token wurde generiert. Überprüfen Sie Ihren konfigurierten Mail-Service für Details.');
    }
};
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Database Connection
const sslEnabled = parseBoolean(process.env.DATABASE_SSL_ENABLED, false);
const rejectUnauthorized = parseBoolean(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED, true);
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
const runMigrations = createMigrationRunner(pool);
};

if (sslEnabled) {
    poolConfig.ssl = {
        rejectUnauthorized,
    };
}

const pool = new Pool(poolConfig);

const adminMiddleware = createAdminMiddleware(pool);
let trainingJournalTableInitialized = false;

const sanitizeColumnType = (type) => {
    if (!type) return 'UUID';
    const sanitized = type.replace(/[^a-zA-Z0-9_\s()]/g, '');
    return sanitized || 'UUID';
};

const getColumnSqlType = async (tableName, columnName) => {
    const query = `
        SELECT format_type(atttypid, atttypmod) as data_type
        FROM pg_attribute
        WHERE attrelid = $1::regclass
          AND attname = $2
          AND NOT attisdropped
    `;

    try {
        const { rows } = await pool.query(query, [tableName, columnName]);
        if (rows.length === 0 || !rows[0].data_type) {
            return 'UUID';
        }
        return sanitizeColumnType(rows[0].data_type);
    } catch (error) {
        console.warn(`Could not determine column type for ${tableName}.${columnName}:`, error.message);
        return 'UUID';
    }
};

const WEEK_WINDOW_CONDITION = `
    COALESCE(w.workout_date, w.created_at::date) >= date_trunc('week', CURRENT_DATE)
    AND COALESCE(w.workout_date, w.created_at::date) < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
`;

const weeklyChallengeTargets = {
    pullups: 200,
    pushups: 400,
    running: 30,
    cycling: 120,
    points: 1500
};

const USER_DISPLAY_NAME_SQL = `
    CASE
        WHEN u.display_preference = 'nickname' AND u.nickname IS NOT NULL THEN u.nickname
        WHEN u.display_preference = 'fullName' THEN CONCAT(u.first_name, ' ', u.last_name)
        ELSE u.first_name
    END
`;

const normalizeEntryDate = (value) => {
    if (!value) {
        return new Date().toISOString().slice(0, 10);
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new ValidationError('Ungültiges Datum für den Trainingseintrag.');
    }
    return parsed.toISOString().slice(0, 10);
};

const normalizeOptionalDateFilter = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new ValidationError('Ungültiges Datum im Filter.');
    }

    return parsed.toISOString().slice(0, 10);
};

const coerceOptionalScaleValue = (value, { field, min, max, allowZero = false }) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
        throw new ValidationError(`Der Wert für ${field} muss eine Zahl sein.`);
    }

    const rounded = Math.round(numberValue);
    const effectiveMin = allowZero ? Math.max(min, 0) : min;

    if (rounded < effectiveMin || rounded > max) {
        throw new ValidationError(`Der Wert für ${field} muss zwischen ${effectiveMin} und ${max} liegen.`);
    }

    return rounded;
};

const parseJournalTags = (value) => {
    if (!value) {
        return [];
    }

    const rawTags = Array.isArray(value) ? value : String(value).split(',');
    const trimmed = rawTags
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => tag.slice(0, 40));

    const uniqueTags = Array.from(new Set(trimmed.map((tag) => tag.toLowerCase())));

    if (uniqueTags.length > 10) {
        throw new ValidationError('Es können maximal 10 Tags pro Eintrag gespeichert werden.');
    }

    return uniqueTags;
};

const sanitizeMetricsPayload = (metrics) => {
    if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
        return {};
    }

    const sanitizedMetrics = {};
    for (const [key, value] of Object.entries(metrics)) {
        const trimmedKey = String(key).trim();
        if (!trimmedKey) {
            continue;
        }

        const numericValue = typeof value === 'number' ? value : Number(value);
        if (Number.isFinite(numericValue)) {
            sanitizedMetrics[trimmedKey.slice(0, 60)] = Number(numericValue);
        }
    }

    return sanitizedMetrics;
};

const toTrainingJournalEntry = (row) => {
    const entry = toCamelCase(row);
    entry.tags = Array.isArray(row.tags) ? row.tags : [];
    entry.metrics = row.metrics && typeof row.metrics === 'object' ? row.metrics : {};
    return entry;
};

const buildPaginationMeta = (page, limit, totalItems) => {
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    return {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

const ensureWorkoutOwnership = async (workoutId, userId) => {
    if (!workoutId) {
        return null;
    }

    const { rows } = await pool.query('SELECT id FROM workouts WHERE id = $1 AND user_id = $2', [workoutId, userId]);
    if (rows.length === 0) {
        throw new ValidationError('Ungültiges Workout: Es wurde kein Workout gefunden oder es gehört nicht zum Benutzer.');
    }

    return workoutId;
};

const parsePaginationParams = (page, limit) => {
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    return { page: parsedPage, limit: parsedLimit };
};

const extractSearchTerm = (value) => {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (trimmed.length < 2) {
        return null;
    }

    return trimmed;
};

const friendRequestRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

// Database Connection
// Middlewares
app.use(cors());
app.use(express.json());

const ensureFriendInfrastructure = async () => {
    const { rows } = await pool.query(`
        SELECT to_regclass('public.users') AS has_users
    `);

    if (!rows[0]?.has_users) {
        return;
    }

    await pool.query(`
        CREATE TABLE IF NOT EXISTS friend_requests (
            id UUID PRIMARY KEY,
            requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (requester_id, target_id)
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS friendships (
            id UUID PRIMARY KEY,
            user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            user_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_one_id, user_two_id)
        );
    `);
};

if (process.env.NODE_ENV !== 'test') {
    ensureFriendInfrastructure().catch((error) => {
        console.error('Failed to ensure friend infrastructure:', error);
    });
}

// Routes
app.get('/', (req, res) => {
    res.send('Sportify API is running!');
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Kein Token bereitgestellt, Zugriff verweigert.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token ist ungültig.' });
    }
};

// Auth Routes
const authRouter = express.Router();

// GET /api/auth/me - Protected Route
authRouter.get('/me', authMiddleware, async (req, res) => {
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

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Serverfehler beim Abrufen der Benutzerdaten.' });
    }
});

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
    const { email, password, firstName, lastName, nickname, displayPreference } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Alle erforderlichen Felder müssen ausgefüllt werden.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name, nickname, display_preference)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, nickname, display_preference, is_admin;
    `;
        const values = [email, password_hash, firstName, lastName, nickname, displayPreference || 'firstName'];

        const { rows } = await pool.query(newUserQuery, values);
        const rawUser = rows[0];

        try {
            const { token: verificationToken } = await createEmailVerificationToken(pool, rawUser.id);
            await queueEmail(pool, {
                recipient: email,
                subject: 'Sportify – E-Mail bestätigen',
                body: `Hallo ${firstName},\n\nbitte bestätige deine E-Mail-Adresse mit diesem Code: ${verificationToken}\n\nDein Sportify-Team`,
            });
        } catch (mailError) {
            console.error('Verification email error:', mailError);
        }

        // Convert snake_case to camelCase
        const user = toCamelCase(rawUser);

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' });
        }
        res.status(500).json({ error: 'Serverfehler bei der Registrierung.' });
    }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
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
                return res.status(400).json({ error: 'Zwei-Faktor-Authentifizierungscode erforderlich.' });
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

// POST /api/auth/reset-password - Request Password Reset
authRouter.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'E-Mail-Adresse ist erforderlich.' });
        }

        const userQuery = 'SELECT id FROM users WHERE email = $1';
        const { rows } = await pool.query(userQuery, [email]);

        if (rows.length === 0) {
            return res.json({ message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.' });
        }

        const userId = rows[0].id;
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashResetToken(resetToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL', [userId]);
            await client.query(
                'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
                [userId, tokenHash, expiresAt]
            );
            await client.query('COMMIT');
        } catch (transactionError) {
            await client.query('ROLLBACK');
            throw transactionError;
        } finally {
            client.release();
        }

        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Reset password email dispatch error:', emailError);
        try {
            const { token: resetToken } = await createPasswordResetToken(pool, rows[0].id);
            await queueEmail(pool, {
                recipient: email,
                subject: 'Sportify – Passwort zurücksetzen',
                body: `Hallo,\n\nverwende diesen Code, um dein Passwort zurückzusetzen: ${resetToken}\n\nDieser Code ist eine Stunde lang gültig.`,
            });
        } catch (mailError) {
            console.error('Password reset email error:', mailError);
            return res.status(500).json({ error: 'Fehler beim Versenden der Zurücksetzungs-E-Mail.' });
        }

        res.json({ message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Serverfehler beim Zurücksetzen des Passworts.' });
    }
});

// POST /api/auth/reset-password/confirm - Complete Password Reset
authRouter.post('/reset-password/confirm', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token und neues Passwort sind erforderlich.' });
        }

        const tokenHash = hashResetToken(token);

        const tokenQuery = `
            SELECT id, user_id
            FROM password_reset_tokens
            WHERE token_hash = $1
              AND used_at IS NULL
              AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const { rows } = await pool.query(tokenQuery, [tokenHash]);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Ungültiger oder abgelaufener Token.' });
        }

        const resetRecord = rows[0];
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(password, salt);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
                newPasswordHash,
                resetRecord.user_id,
            ]);
            await client.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [resetRecord.id]);
            await client.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL', [
                resetRecord.user_id,
            ]);
            await client.query('COMMIT');
        } catch (transactionError) {
            await client.query('ROLLBACK');
            throw transactionError;
        } finally {
            client.release();
        }

        res.json({ message: 'Passwort wurde erfolgreich zurückgesetzt.' });
    } catch (error) {
        console.error('Confirm reset password error:', error);
        res.status(500).json({ error: 'Serverfehler beim Bestätigen des Passwort-Resets.' });
    }
});

// POST /api/auth/enable-2fa - Initiate Two-Factor Authentication setup
authRouter.post('/confirm-reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token und neues Passwort sind erforderlich.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' });
        }

        const tokenData = await validatePasswordResetToken(pool, token);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, tokenData.userId]);
        await markPasswordResetTokenUsed(pool, tokenData.id);

        res.json({ message: 'Passwort wurde erfolgreich aktualisiert.' });
    } catch (error) {
        if (error instanceof TokenError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Confirm reset password error:', error);
        res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Passworts.' });
    }
});

authRouter.post('/verify-email', async (req, res) => {
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

authRouter.post('/resend-verification', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT email, first_name, is_email_verified FROM users WHERE id = $1', [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
        }

        const user = rows[0];

        if (user.is_email_verified) {
            return res.status(400).json({ error: 'E-Mail wurde bereits verifiziert.' });
        }

        const { token: verificationToken } = await createEmailVerificationToken(pool, req.user.id);
        await queueEmail(pool, {
            recipient: user.email,
            subject: 'Sportify – E-Mail bestätigen',
            body: `Hallo ${user.first_name},\n\nbitte bestätige deine E-Mail-Adresse mit diesem Code: ${verificationToken}\n\nDein Sportify-Team`,
        });

        res.json({ message: 'Verifizierungs-E-Mail wurde erneut gesendet.' });
    } catch (error) {
        if (error instanceof TokenError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Serverfehler beim Senden der Verifizierungs-E-Mail.' });
    }
});

// POST /api/auth/enable-2fa - Enable Two-Factor Authentication
authRouter.post('/enable-2fa', authMiddleware, async (req, res) => {
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
authRouter.post('/verify-2fa', authMiddleware, async (req, res) => {
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
authRouter.post('/backup-codes/consume', authMiddleware, async (req, res) => {
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
authRouter.post('/backup-codes/rotate', authMiddleware, async (req, res) => {
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
authRouter.post('/disable-2fa', authMiddleware, async (req, res) => {
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

app.use('/api/auth', authRouter);

// Admin APIs
const adminRouter = express.Router();

adminRouter.get('/users', async (req, res) => {
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

adminRouter.get('/invitations', async (req, res) => {
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

adminRouter.post('/invite-user', async (req, res) => {
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

app.use('/api/admin', authMiddleware, adminMiddleware, adminRouter);

// Profile Management APIs
const profileRouter = express.Router();

// PUT /api/profile/update - Update user profile
profileRouter.put('/update', authMiddleware, async (req, res) => {
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
profileRouter.delete('/account', authMiddleware, async (req, res) => {
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

app.use('/api/profile', profileRouter);

const friendsRouter = express.Router();

friendsRouter.get('/', authMiddleware, async (req, res) => {
    try {
        await ensureFriendInfrastructure();

        const query = `
            SELECT
                f.id AS friendship_id,
                CASE WHEN f.user_one_id = $1 THEN f.user_two_id ELSE f.user_one_id END AS friend_id,
                u.first_name,
                u.last_name,
                u.nickname,
                u.display_preference,
                u.avatar_url
            FROM friendships f
            JOIN users u ON u.id = CASE WHEN f.user_one_id = $1 THEN f.user_two_id ELSE f.user_one_id END
            WHERE f.user_one_id = $1 OR f.user_two_id = $1
            ORDER BY f.created_at DESC
        `;

        const { rows } = await pool.query(query, [req.user.id]);
        const friends = rows.map((row) => {
            const friend = applyDisplayName(toCamelCase(row));
            friend.id = friend.friendId;
            delete friend.friendId;
            return friend;
        });

        res.json(friends);
    } catch (error) {
        console.error('Friends list error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der Freundesliste.' });
    }
});

friendsRouter.get('/requests', authMiddleware, async (req, res) => {
    try {
        await ensureFriendInfrastructure();

        const incomingQuery = `
            SELECT
                fr.id AS request_id,
                fr.created_at,
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.nickname,
                u.display_preference,
                u.avatar_url
            FROM friend_requests fr
            JOIN users u ON u.id = fr.requester_id
            WHERE fr.target_id = $1 AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        `;

        const outgoingQuery = `
            SELECT
                fr.id AS request_id,
                fr.created_at,
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.nickname,
                u.display_preference,
                u.avatar_url
            FROM friend_requests fr
            JOIN users u ON u.id = fr.target_id
            WHERE fr.requester_id = $1 AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        `;

        const [incomingResult, outgoingResult] = await Promise.all([
            pool.query(incomingQuery, [req.user.id]),
            pool.query(outgoingQuery, [req.user.id])
        ]);

        const mapRequests = (rows, type) => rows.map((row) => {
            const request = toCamelCase(row);
            const user = applyDisplayName({
                id: request.userId,
                firstName: request.firstName,
                lastName: request.lastName,
                nickname: request.nickname,
                displayPreference: request.displayPreference,
                avatarUrl: request.avatarUrl
            });

            return {
                type,
                requestId: request.requestId,
                createdAt: request.createdAt,
                user
            };
        });

        res.json({
            incoming: mapRequests(incomingResult.rows, 'incoming'),
            outgoing: mapRequests(outgoingResult.rows, 'outgoing')
        });
    } catch (error) {
        console.error('Friend requests error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der Freundschaftsanfragen.' });
    }
});

friendsRouter.post('/requests', authMiddleware, async (req, res) => {
    try {
        await ensureFriendInfrastructure();

        const { targetUserId } = req.body;
        if (!targetUserId) {
            return res.status(400).json({ error: 'Zielbenutzer-ID ist erforderlich.' });
        }

        if (targetUserId === req.user.id) {
            return res.status(400).json({ error: 'Du kannst dir selbst keine Freundschaftsanfrage senden.' });
        }

        const rateLimit = friendRequestRateLimiter(req.user.id);
        if (!rateLimit.allowed) {
            return res.status(429).json({ error: 'Zu viele Anfragen. Bitte versuche es später erneut.', retryAfter: rateLimit.retryAfter });
        }

        const { rows: targetRows } = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [targetUserId]
        );

        if (targetRows.length === 0) {
            return res.status(404).json({ error: 'Zielbenutzer wurde nicht gefunden.' });
        }

        const [firstUser, secondUser] = [req.user.id, targetUserId].sort();
        const { rowCount: existingFriends } = await pool.query(
            'SELECT 1 FROM friendships WHERE user_one_id = $1 AND user_two_id = $2',
            [firstUser, secondUser]
        );

        if (existingFriends > 0) {
            return res.status(409).json({ error: 'Ihr seid bereits befreundet.' });
        }

        const { rowCount: pendingRequests } = await pool.query(
            `SELECT 1 FROM friend_requests
             WHERE ((requester_id = $1 AND target_id = $2) OR (requester_id = $2 AND target_id = $1))
             AND status = 'pending'`,
            [req.user.id, targetUserId]
        );

        if (pendingRequests > 0) {
            return res.status(409).json({ error: 'Es besteht bereits eine ausstehende Anfrage zwischen euch.' });
        }

        const requestId = randomUUID();
        await pool.query(
            `INSERT INTO friend_requests (id, requester_id, target_id, status)
             VALUES ($1, $2, $3, 'pending')`,
            [requestId, req.user.id, targetUserId]
        );

        res.status(201).json({ requestId });
    } catch (error) {
        console.error('Create friend request error:', error);
        res.status(500).json({ error: 'Serverfehler beim Erstellen der Freundschaftsanfrage.' });
    }
});

friendsRouter.put('/requests/:requestId', authMiddleware, async (req, res) => {
    try {
        await ensureFriendInfrastructure();

        const { requestId } = req.params;
        const { action } = req.body;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ error: 'Ungültige Aktion.' });
        }

        const { rows } = await pool.query(
            'SELECT id, requester_id, target_id, status FROM friend_requests WHERE id = $1',
            [requestId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Freundschaftsanfrage nicht gefunden.' });
        }

        const request = rows[0];

        if (request.target_id !== req.user.id) {
            return res.status(403).json({ error: 'Du darfst diese Anfrage nicht bearbeiten.' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Anfrage wurde bereits bearbeitet.' });
        }

        if (action === 'accept') {
            const [firstUser, secondUser] = [request.requester_id, request.target_id].sort();
            const friendshipId = randomUUID();

            await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', requestId]);
            await pool.query(
                `INSERT INTO friendships (id, user_one_id, user_two_id)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_one_id, user_two_id) DO NOTHING`,
                [friendshipId, firstUser, secondUser]
            );

            return res.json({ status: 'accepted' });
        }

        await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['declined', requestId]);
        res.json({ status: 'declined' });
    } catch (error) {
        console.error('Update friend request error:', error);
        res.status(500).json({ error: 'Serverfehler beim Aktualisieren der Freundschaftsanfrage.' });
    }
});

friendsRouter.delete('/:friendshipId', authMiddleware, async (req, res) => {
    try {
        await ensureFriendInfrastructure();

        const { friendshipId } = req.params;
        const { rows } = await pool.query(
            'SELECT id, user_one_id, user_two_id FROM friendships WHERE id = $1',
            [friendshipId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Freundschaft nicht gefunden.' });
        }

        const friendship = rows[0];
        if (![friendship.user_one_id, friendship.user_two_id].includes(req.user.id)) {
            return res.status(403).json({ error: 'Du darfst diese Freundschaft nicht entfernen.' });
        }

        await pool.query('DELETE FROM friendships WHERE id = $1', [friendshipId]);
        res.json({ message: 'Freund wurde entfernt.' });
    } catch (error) {
        console.error('Delete friendship error:', error);
        res.status(500).json({ error: 'Serverfehler beim Entfernen des Freundes.' });
    }
});

app.use('/api/friends', friendsRouter);

const usersRouter = express.Router();

usersRouter.get('/search', authMiddleware, async (req, res) => {
    try {
        const { query = '', page = '1', limit = '10' } = req.query;
        const trimmedQuery = String(query).trim();

        if (trimmedQuery.length < 2) {
            return res.json([]);
        }

        const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const offset = (parsedPage - 1) * parsedLimit;
        const likeQuery = `%${trimmedQuery.replace(/\s+/g, '%')}%`;

        const searchQuery = `
            SELECT
                id,
                first_name,
                last_name,
                nickname,
                display_preference,
                avatar_url
            FROM users
            WHERE id <> $1
              AND (
                  first_name ILIKE $2 OR
                  last_name ILIKE $2 OR
                  nickname ILIKE $2 OR
                  email ILIKE $2
              )
            ORDER BY first_name ASC, last_name ASC
            LIMIT $3 OFFSET $4
        `;

        const { rows } = await pool.query(searchQuery, [req.user.id, likeQuery, parsedLimit, offset]);
        const results = rows.map((row) => applyDisplayName(toCamelCase(row)));

        res.json(results);
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ error: 'Serverfehler bei der Benutzersuche.' });
    }
});

app.use('/api/users', usersRouter);

// Workout Management APIs
const workoutRouter = express.Router();

// GET /api/workouts - Get user workouts with pagination and filtering
workoutRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        const offset = (page - 1) * limit;

        let typeFilter = '';
        let params = [req.user.id, parseInt(limit), offset];

        if (type && type !== 'all') {
            typeFilter = 'AND wa.activity_type = $4';
            params.push(type);
        }

        const query = `
            SELECT 
                w.id,
                w.title,
                w.description,
                w.workout_date,
                w.duration,
                w.created_at,
                w.updated_at,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', wa.id,
                            'activityType', wa.activity_type,
                            'quantity', wa.quantity,
                            'points', wa.points_earned,
                            'notes', wa.notes,
                            'unit', wa.unit,
                            'setsData', wa.sets_data
                        ) ORDER BY wa.order_index, wa.id
                    ) FILTER (WHERE wa.id IS NOT NULL),
                    '[]'::json
                ) as activities
            FROM workouts w
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE w.user_id = $1 ${typeFilter}
            GROUP BY w.id, w.title, w.description, w.workout_date, w.duration, w.created_at, w.updated_at
            ORDER BY w.workout_date DESC, w.created_at DESC
            LIMIT $2 OFFSET $3;
        `;

        const { rows } = await pool.query(query, params);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(DISTINCT w.id) as total
            FROM workouts w
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE w.user_id = $1 ${typeFilter};
        `;
        const countParams = type && type !== 'all' ? [req.user.id, type] : [req.user.id];
        const { rows: countRows } = await pool.query(countQuery, countParams);

        const workouts = rows.map(row => {
            const activities = Array.isArray(row.activities) ? row.activities.map(a => ({
                id: a.id,
                activityType: a.activityType,
                amount: a.quantity,
                points: a.points,
                notes: a.notes,
                unit: a.unit,
                sets: a.setsData ? JSON.parse(a.setsData) : null
            })).filter(a => a.id !== null) : [];

            return {
                ...toCamelCase(row),
                activities,
            };
        });

        res.json({
            workouts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(countRows[0].total / limit),
                totalItems: parseInt(countRows[0].total),
                hasNext: page * limit < countRows[0].total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der Workouts.' });
    }
});

// POST /api/workouts - Create new workout
workoutRouter.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, activities, workoutDate, duration } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Workout-Titel ist erforderlich.' });
        }

        if (!activities || !Array.isArray(activities) || activities.length === 0) {
            return res.status(400).json({ error: 'Mindestens eine Aktivität ist erforderlich.' });
        }

        // Validate activities
        const validActivityTypes = ['pullups', 'pushups', 'running', 'cycling', 'situps', 'other'];
        for (const activity of activities) {
            if (!activity.activityType || !validActivityTypes.includes(activity.activityType)) {
                return res.status(400).json({ error: `Ungültiger Aktivitätstyp: ${activity.activityType}` });
            }
            // Check both 'quantity' (new) and 'amount' (legacy) fields
            const activityAmount = activity.quantity || activity.amount;
            if (!activityAmount || activityAmount <= 0) {
                return res.status(400).json({ error: 'Aktivitätsmenge muss größer als 0 sein.' });
            }
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // First check if workouts table has duration column, if not, add it
            const checkColumnsQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'workouts' AND column_name = 'duration';
            `;
            const { rows: columnRows } = await client.query(checkColumnsQuery);

            if (columnRows.length === 0) {
                // Add duration column if it doesn't exist
                await client.query('ALTER TABLE workouts ADD COLUMN duration INTEGER;');
            }

            // Create workout with duration
            const workoutQuery = `
                INSERT INTO workouts (user_id, title, description, workout_date, duration)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, title, description, workout_date, duration, created_at, updated_at;
            `;
            const { rows: workoutRows } = await client.query(workoutQuery, [
                req.user.id,
                title.trim(),
                description ? description.trim() : null,
                workoutDate ? new Date(workoutDate) : new Date(),
                duration && duration > 0 ? duration : null
            ]);

            const workoutId = workoutRows[0].id;

            // Calculate points based on activity type and amount
            const calculateActivityPoints = (activityType, amount) => {
                switch (activityType) {
                    case 'pullups': return amount * 3;
                    case 'pushups': return amount * 1;
                    case 'situps': return amount * 1;
                    case 'running': return amount * 10;
                    case 'cycling': return amount * 5;
                    case 'other': return amount * 1;
                    default: return 0;
                }
            };

            // Check if workout_activities table has sets column
            const checkSetsColumnQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'workout_activities' AND column_name = 'sets_data';
            `;
            const { rows: setsColumnRows } = await client.query(checkSetsColumnQuery);

            if (setsColumnRows.length === 0) {
                // Add sets_data column if it doesn't exist
                await client.query('ALTER TABLE workout_activities ADD COLUMN sets_data JSONB;');
                await client.query('ALTER TABLE workout_activities ADD COLUMN unit VARCHAR(20);');
            }

            // Create activities
            const activitiesData = [];
            for (let i = 0; i < activities.length; i++) {
                const activity = activities[i];
                // Support both new 'quantity' and legacy 'amount' fields
                const activityAmount = activity.quantity || activity.amount;
                const points = calculateActivityPoints(activity.activityType, activityAmount);

                const activityQuery = `
                    INSERT INTO workout_activities (workout_id, activity_type, quantity, points_earned, notes, order_index, sets_data, unit)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id, activity_type, quantity, points_earned, notes, order_index, sets_data, unit;
                `;
                const { rows: activityRows } = await client.query(activityQuery, [
                    workoutId,
                    activity.activityType,
                    activityAmount,
                    points,
                    activity.notes ? activity.notes.trim() : null,
                    i,
                    activity.sets ? JSON.stringify(activity.sets) : null,
                    activity.unit || 'Stück'
                ]);
                const row = toCamelCase(activityRows[0]);
                row.amount = row.quantity;
                row.points = row.pointsEarned;
                if (row.setsData) {
                    row.sets = JSON.parse(row.setsData);
                }
                delete row.quantity;
                delete row.pointsEarned;
                delete row.setsData;
                activitiesData.push(row);
            }

            await client.query('COMMIT');

            const newWorkout = {
                ...toCamelCase(workoutRows[0]),
                activities: activitiesData
            };

            res.status(201).json(newWorkout);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json({ error: 'Serverfehler beim Erstellen des Workouts.' });
    }
});

// GET /api/workouts/:id - Get single workout
workoutRouter.get('/:id', authMiddleware, async (req, res) => {
    try {
        const workoutId = req.params.id;
        const query = `
            SELECT
                w.id, w.title, w.description, w.workout_date, w.duration,
                w.created_at, w.updated_at,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', wa.id,
                            'activityType', wa.activity_type,
                            'quantity', wa.quantity,
                            'points', wa.points_earned,
                            'notes', wa.notes,
                            'unit', wa.unit,
                            'setsData', wa.sets_data
                        ) ORDER BY wa.order_index, wa.id
                    ) FILTER (WHERE wa.id IS NOT NULL),
                    '[]'::json
                ) as activities
            FROM workouts w
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE w.id = $1 AND w.user_id = $2
            GROUP BY w.id, w.title, w.description, w.workout_date, w.duration, w.created_at, w.updated_at;
        `;
        const { rows } = await pool.query(query, [workoutId, req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Workout nicht gefunden.' });
        }
        const row = rows[0];
        const activities = Array.isArray(row.activities)
            ? row.activities.map(a => ({
                id: a.id,
                activityType: a.activityType,
                amount: a.quantity,
                points: a.points,
                notes: a.notes,
                unit: a.unit,
                sets: a.setsData ? JSON.parse(a.setsData) : null,
            })).filter(a => a.id !== null)
            : [];
        res.json({ ...toCamelCase(row), activities });
    } catch (error) {
        console.error('Get workout error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden des Workouts.' });
    }
});

// PUT /api/workouts/:id - Update workout
workoutRouter.put('/:id', authMiddleware, async (req, res) => {
    try {
        const workoutId = req.params.id;
        const { title, description, activities, workoutDate, duration } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Workout-Titel ist erforderlich.' });
        }
        if (!activities || !Array.isArray(activities) || activities.length === 0) {
            return res.status(400).json({ error: 'Mindestens eine Aktivität ist erforderlich.' });
        }

        const validActivityTypes = ['pullups', 'pushups', 'running', 'cycling', 'situps', 'other'];
        for (const activity of activities) {
            if (!activity.activityType || !validActivityTypes.includes(activity.activityType)) {
                return res.status(400).json({ error: `Ungültiger Aktivitätstyp: ${activity.activityType}` });
            }
            const activityAmount = activity.quantity || activity.amount;
            if (!activityAmount || activityAmount <= 0) {
                return res.status(400).json({ error: 'Aktivitätsmenge muss größer als 0 sein.' });
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const checkQuery = 'SELECT id FROM workouts WHERE id = $1 AND user_id = $2';
            const { rows: checkRows } = await client.query(checkQuery, [workoutId, req.user.id]);
            if (checkRows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Workout nicht gefunden.' });
            }

            const updateQuery = `
                UPDATE workouts
                SET title = $1,
                    description = $2,
                    workout_date = $3,
                    duration = $4,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 AND user_id = $6
                RETURNING id, title, description, workout_date, duration, created_at, updated_at;
            `;
            const { rows: workoutRows } = await client.query(updateQuery, [
                title.trim(),
                description ? description.trim() : null,
                workoutDate ? new Date(workoutDate) : new Date(),
                duration && duration > 0 ? duration : null,
                workoutId,
                req.user.id,
            ]);

            await client.query('DELETE FROM workout_activities WHERE workout_id = $1', [workoutId]);

            const calculateActivityPoints = (activityType, amount) => {
                switch (activityType) {
                    case 'pullups': return amount * 3;
                    case 'pushups': return amount * 1;
                    case 'situps': return amount * 1;
                    case 'running': return amount * 10;
                    case 'cycling': return amount * 5;
                    case 'other': return amount * 1;
                    default: return 0;
                }
            };

            const activitiesData = [];
            for (let i = 0; i < activities.length; i++) {
                const activity = activities[i];
                const activityAmount = activity.quantity || activity.amount;
                const points = calculateActivityPoints(activity.activityType, activityAmount);
                const activityQuery = `
                    INSERT INTO workout_activities (workout_id, activity_type, quantity, points_earned, notes, order_index, sets_data, unit)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id, activity_type, quantity, points_earned, notes, order_index, sets_data, unit;
                `;
                const { rows: activityRows } = await client.query(activityQuery, [
                    workoutId,
                    activity.activityType,
                    activityAmount,
                    points,
                    activity.notes ? activity.notes.trim() : null,
                    i,
                    activity.sets ? JSON.stringify(activity.sets) : null,
                    activity.unit || 'Stück',
                ]);
                const row = toCamelCase(activityRows[0]);
                row.amount = row.quantity;
                row.points = row.pointsEarned;
                if (row.setsData) {
                    row.sets = JSON.parse(row.setsData);
                }
                delete row.quantity;
                delete row.pointsEarned;
                delete row.setsData;
                activitiesData.push(row);
            }

            await client.query('COMMIT');

            const updatedWorkout = {
                ...toCamelCase(workoutRows[0]),
                activities: activitiesData,
            };
            res.json(updatedWorkout);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Update workout error:', error);
        res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Workouts.' });
    }
});

// DELETE /api/workouts/:id - Delete workout
workoutRouter.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const workoutId = req.params.id;

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check if workout exists and belongs to user
            const checkQuery = 'SELECT id FROM workouts WHERE id = $1 AND user_id = $2';
            const { rows: checkRows } = await client.query(checkQuery, [workoutId, req.user.id]);

            if (checkRows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Workout nicht gefunden.' });
            }

            // Delete activities first (due to foreign key constraint)
            await client.query('DELETE FROM workout_activities WHERE workout_id = $1', [workoutId]);

            // Delete workout
            await client.query('DELETE FROM workouts WHERE id = $1 AND user_id = $2', [workoutId, req.user.id]);

            await client.query('COMMIT');

            res.json({ message: 'Workout erfolgreich gelöscht.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({ error: 'Serverfehler beim Löschen des Workouts.' });
    }
});

// Use workout router
app.use('/api/workouts', workoutRouter);

// Training Journal Router
const trainingJournalRouter = express.Router();

trainingJournalRouter.use(authMiddleware);

// GET /api/training-journal - List journal entries with filters and pagination
trainingJournalRouter.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '10', mood, startDate, endDate, search } = req.query;
        const { page: currentPage, limit: pageSize } = parsePaginationParams(page, limit);

        const filters = ['user_id = $1'];
        const params = [req.user.id];
        let paramIndex = 2;

        if (typeof mood === 'string' && ALLOWED_JOURNAL_MOODS.includes(mood)) {
            filters.push(`mood = $${paramIndex}`);
            params.push(mood);
            paramIndex += 1;
        }

        if (startDate) {
            const normalizedStart = normalizeOptionalDateFilter(startDate);
            filters.push(`entry_date >= $${paramIndex}`);
            params.push(normalizedStart);
            paramIndex += 1;
        }

        if (endDate) {
            const normalizedEnd = normalizeOptionalDateFilter(endDate);
            filters.push(`entry_date <= $${paramIndex}`);
            params.push(normalizedEnd);
            paramIndex += 1;
        }

        const searchTerm = extractSearchTerm(search);
        if (searchTerm) {
            filters.push(`(notes ILIKE $${paramIndex} OR EXISTS (SELECT 1 FROM unnest(tags) tag WHERE tag ILIKE $${paramIndex}))`);
            params.push(`%${searchTerm}%`);
            paramIndex += 1;
        }

        const whereClause = filters.join(' AND ');
        const entriesQuery = `
            SELECT
                id,
                user_id,
                workout_id,
                entry_date,
                mood,
                energy_level,
                focus_level,
                sleep_quality,
                soreness_level,
                perceived_exertion,
                notes,
                tags,
                metrics,
                created_at,
                updated_at
            FROM training_journal_entries
            WHERE ${whereClause}
            ORDER BY entry_date DESC, created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const queryParams = [...params, pageSize, (currentPage - 1) * pageSize];
        const { rows } = await pool.query(entriesQuery, queryParams);
        const entries = rows.map(toTrainingJournalEntry);

        const countQuery = `SELECT COUNT(*)::int AS total FROM training_journal_entries WHERE ${whereClause}`;
        const { rows: countRows } = await pool.query(countQuery, params);
        const totalItems = countRows[0]?.total || 0;

        res.json({
            entries,
            pagination: buildPaginationMeta(currentPage, pageSize, totalItems)
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('List training journal entries error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden des Trainingstagebuchs.' });
    }
});

// GET /api/training-journal/summary - Aggregated metrics for journal entries
trainingJournalRouter.get('/summary', async (req, res) => {
    try {
        const summaryQuery = `
            SELECT
                COUNT(*)::int AS total_entries,
                ROUND(AVG(energy_level)::numeric, 2) AS avg_energy_level,
                ROUND(AVG(focus_level)::numeric, 2) AS avg_focus_level,
                ROUND(AVG(sleep_quality)::numeric, 2) AS avg_sleep_quality,
                ROUND(AVG(soreness_level)::numeric, 2) AS avg_soreness_level,
                ROUND(AVG(perceived_exertion)::numeric, 2) AS avg_perceived_exertion,
                MIN(entry_date) AS first_entry,
                MAX(entry_date) AS last_entry
            FROM training_journal_entries
            WHERE user_id = $1
        `;

        const moodDistributionQuery = `
            SELECT mood, COUNT(*)::int AS count
            FROM training_journal_entries
            WHERE user_id = $1
            GROUP BY mood
        `;

        const tagsQuery = `
            SELECT tag, COUNT(*)::int AS count
            FROM training_journal_entries,
            LATERAL unnest(tags) AS tag
            WHERE user_id = $1
            GROUP BY tag
            ORDER BY count DESC
            LIMIT 10
        `;

        const latestQuery = `
            SELECT
                id,
                user_id,
                workout_id,
                entry_date,
                mood,
                energy_level,
                focus_level,
                sleep_quality,
                soreness_level,
                perceived_exertion,
                notes,
                tags,
                metrics,
                created_at,
                updated_at
            FROM training_journal_entries
            WHERE user_id = $1
            ORDER BY entry_date DESC, created_at DESC
            LIMIT 1
        `;

        const [{ rows: summaryRows }, { rows: moodRows }, { rows: tagRows }, { rows: latestRows }] = await Promise.all([
            pool.query(summaryQuery, [req.user.id]),
            pool.query(moodDistributionQuery, [req.user.id]),
            pool.query(tagsQuery, [req.user.id]),
            pool.query(latestQuery, [req.user.id])
        ]);

        res.json({
            ...toCamelCase(summaryRows[0] || {}),
            moodDistribution: moodRows.map(toCamelCase),
            topTags: tagRows.map(toCamelCase),
            latestEntry: latestRows.length ? toTrainingJournalEntry(latestRows[0]) : null
        });
    } catch (error) {
        console.error('Training journal summary error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der Trainingstagebuch-Übersicht.' });
    }
});

// GET /api/training-journal/:id - Single entry
trainingJournalRouter.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT
                id,
                user_id,
                workout_id,
                entry_date,
                mood,
                energy_level,
                focus_level,
                sleep_quality,
                soreness_level,
                perceived_exertion,
                notes,
                tags,
                metrics,
                created_at,
                updated_at
            FROM training_journal_entries
            WHERE id = $1 AND user_id = $2
        `;

        const { rows } = await pool.query(query, [req.params.id, req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Eintrag wurde nicht gefunden.' });
        }

        res.json(toTrainingJournalEntry(rows[0]));
    } catch (error) {
        console.error('Get training journal entry error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden des Trainingstagebuch-Eintrags.' });
    }
});

// POST /api/training-journal - Create entry
trainingJournalRouter.post('/', async (req, res) => {
    try {
        const entryDate = normalizeEntryDate(req.body.entryDate);
        const mood = typeof req.body.mood === 'string' ? req.body.mood : 'balanced';
        if (!ALLOWED_JOURNAL_MOODS.includes(mood)) {
            throw new ValidationError('Ungültige Stimmung für das Trainingstagebuch.');
        }

        const energyLevel = coerceOptionalScaleValue(req.body.energyLevel, { field: 'Energielevel', min: 1, max: 10 });
        const focusLevel = coerceOptionalScaleValue(req.body.focusLevel, { field: 'Fokus', min: 1, max: 10 });
        const sleepQuality = coerceOptionalScaleValue(req.body.sleepQuality, { field: 'Schlafqualität', min: 1, max: 10 });
        const sorenessLevel = coerceOptionalScaleValue(req.body.sorenessLevel, { field: 'Muskelkater', min: 0, max: 10, allowZero: true });
        const perceivedExertion = coerceOptionalScaleValue(req.body.perceivedExertion, { field: 'Belastungsempfinden', min: 1, max: 10 });
        const notes = req.body.notes ? String(req.body.notes).trim() : null;

        if (notes && notes.length > 2000) {
            throw new ValidationError('Notizen dürfen maximal 2000 Zeichen enthalten.');
        }

        const tags = parseJournalTags(req.body.tags);
        const metrics = sanitizeMetricsPayload(req.body.metrics);
        const workoutId = await ensureWorkoutOwnership(req.body.workoutId, req.user.id);

        const insertQuery = `
            INSERT INTO training_journal_entries (
                user_id,
                workout_id,
                entry_date,
                mood,
                energy_level,
                focus_level,
                sleep_quality,
                soreness_level,
                perceived_exertion,
                notes,
                tags,
                metrics
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING
                id,
                user_id,
                workout_id,
                entry_date,
                mood,
                energy_level,
                focus_level,
                sleep_quality,
                soreness_level,
                perceived_exertion,
                notes,
                tags,
                metrics,
                created_at,
                updated_at
        `;

        const insertValues = [
            req.user.id,
            workoutId,
            entryDate,
            mood,
            energyLevel,
            focusLevel,
            sleepQuality,
            sorenessLevel,
            perceivedExertion,
            notes,
            tags.length ? tags : null,
            Object.keys(metrics).length ? JSON.stringify(metrics) : '{}'
        ];

        const { rows } = await pool.query(insertQuery, insertValues);
        res.status(201).json(toTrainingJournalEntry(rows[0]));
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Create training journal entry error:', error);
        res.status(500).json({ error: 'Serverfehler beim Speichern des Trainingstagebuch-Eintrags.' });
    }
});

// PUT /api/training-journal/:id - Update entry
trainingJournalRouter.put('/:id', async (req, res) => {
    try {
        const entryId = req.params.id;
        const selectQuery = 'SELECT id FROM training_journal_entries WHERE id = $1 AND user_id = $2';
        const { rows: existingRows } = await pool.query(selectQuery, [entryId, req.user.id]);

        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Eintrag wurde nicht gefunden.' });
        }

        const entryDate = normalizeEntryDate(req.body.entryDate);
        const mood = typeof req.body.mood === 'string' ? req.body.mood : 'balanced';
        if (!ALLOWED_JOURNAL_MOODS.includes(mood)) {
            throw new ValidationError('Ungültige Stimmung für das Trainingstagebuch.');
        }

        const energyLevel = coerceOptionalScaleValue(req.body.energyLevel, { field: 'Energielevel', min: 1, max: 10 });
        const focusLevel = coerceOptionalScaleValue(req.body.focusLevel, { field: 'Fokus', min: 1, max: 10 });
        const sleepQuality = coerceOptionalScaleValue(req.body.sleepQuality, { field: 'Schlafqualität', min: 1, max: 10 });
        const sorenessLevel = coerceOptionalScaleValue(req.body.sorenessLevel, { field: 'Muskelkater', min: 0, max: 10, allowZero: true });
        const perceivedExertion = coerceOptionalScaleValue(req.body.perceivedExertion, { field: 'Belastungsempfinden', min: 1, max: 10 });
        const notes = req.body.notes ? String(req.body.notes).trim() : null;

        if (notes && notes.length > 2000) {
            throw new ValidationError('Notizen dürfen maximal 2000 Zeichen enthalten.');
        }

        const tags = parseJournalTags(req.body.tags);
        const metrics = sanitizeMetricsPayload(req.body.metrics);
        const workoutId = await ensureWorkoutOwnership(req.body.workoutId, req.user.id);

        const updateQuery = `
            UPDATE training_journal_entries
            SET
                workout_id = $1,
                entry_date = $2,
                mood = $3,
                energy_level = $4,
                focus_level = $5,
                sleep_quality = $6,
                soreness_level = $7,
                perceived_exertion = $8,
                notes = $9,
                tags = $10,
                metrics = $11,
                updated_at = NOW()
            WHERE id = $12 AND user_id = $13
            RETURNING
                id,
                user_id,
                workout_id,
                entry_date,
                mood,
                energy_level,
                focus_level,
                sleep_quality,
                soreness_level,
                perceived_exertion,
                notes,
                tags,
                metrics,
                created_at,
                updated_at
        `;

        const updateValues = [
            workoutId,
            entryDate,
            mood,
            energyLevel,
            focusLevel,
            sleepQuality,
            sorenessLevel,
            perceivedExertion,
            notes,
            tags.length ? tags : null,
            Object.keys(metrics).length ? JSON.stringify(metrics) : '{}',
            entryId,
            req.user.id
        ];

        const { rows } = await pool.query(updateQuery, updateValues);
        res.json(toTrainingJournalEntry(rows[0]));
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Update training journal entry error:', error);
        res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Trainingstagebuch-Eintrags.' });
    }
});

// DELETE /api/training-journal/:id - Delete entry
trainingJournalRouter.delete('/:id', async (req, res) => {
    try {
        const deleteQuery = 'DELETE FROM training_journal_entries WHERE id = $1 AND user_id = $2';
        const { rowCount } = await pool.query(deleteQuery, [req.params.id, req.user.id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Eintrag wurde nicht gefunden.' });
        }

        res.json({ message: 'Eintrag wurde erfolgreich gelöscht.' });
    } catch (error) {
        console.error('Delete training journal entry error:', error);
        res.status(500).json({ error: 'Serverfehler beim Löschen des Trainingstagebuch-Eintrags.' });
    }
});

app.use('/api/training-journal', trainingJournalRouter);

// Scoreboard Router
const scoreboardRouter = express.Router();

// GET /api/scoreboard/overall - Overall leaderboard
scoreboardRouter.get('/overall', authMiddleware, async (req, res) => {
    try {
        const { period = 'all' } = req.query;
        let dateFilter = '';

        if (period === 'week') {
            dateFilter = `AND w.workout_date >= NOW() - INTERVAL '7 days'`;
        } else if (period === 'month') {
            dateFilter = `AND w.workout_date >= NOW() - INTERVAL '30 days'`;
        } else if (period === 'year') {
            dateFilter = `AND w.workout_date >= NOW() - INTERVAL '365 days'`;
        }

        const query = `
            SELECT
                u.id,
                ${USER_DISPLAY_NAME_SQL} as display_name,
                u.avatar_url,
                COALESCE(SUM(wa.points_earned), 0) as total_points,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as total_pullups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as total_pushups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as total_running,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as total_cycling,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'situps' THEN wa.quantity ELSE 0 END), 0) as total_situps
            FROM users u
            LEFT JOIN workouts w ON u.id = w.user_id ${dateFilter}
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
            ORDER BY total_points DESC
            LIMIT 50
        `;

        const { rows } = await pool.query(query);

        const leaderboard = rows.map((row, index) => ({
            ...toCamelCase(row),
            rank: index + 1,
            isCurrentUser: row.id === req.user.id
        }));

        res.json({ leaderboard });
    } catch (error) {
        console.error('Scoreboard overall error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden des Scoreboards.' });
    }
});

// GET /api/scoreboard/activity/:activity - Activity-specific leaderboard
scoreboardRouter.get('/activity/:activity', authMiddleware, async (req, res) => {
    try {
        const { activity } = req.params;
        const { period = 'all' } = req.query;

        const validActivities = ['pullups', 'pushups', 'running', 'cycling', 'situps', 'other'];
        if (!validActivities.includes(activity)) {
            return res.status(400).json({ error: 'Ungültiger Aktivitätstyp' });
        }

        let dateFilter = '';
        if (period === 'week') {
            dateFilter = `AND w.workout_date >= NOW() - INTERVAL '7 days'`;
        } else if (period === 'month') {
            dateFilter = `AND w.workout_date >= NOW() - INTERVAL '30 days'`;
        } else if (period === 'year') {
            dateFilter = `AND w.workout_date >= NOW() - INTERVAL '365 days'`;
        }

        const query = `
            SELECT
                u.id,
                ${USER_DISPLAY_NAME_SQL} as display_name,
                u.avatar_url,
                COALESCE(SUM(wa.quantity), 0) as total_amount,
                COALESCE(SUM(wa.points_earned), 0) as total_points
            FROM users u
            LEFT JOIN workouts w ON u.id = w.user_id ${dateFilter}
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id AND wa.activity_type = $1
            GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
            HAVING COALESCE(SUM(wa.quantity), 0) > 0
            ORDER BY total_amount DESC
            LIMIT 50
        `;

        const { rows } = await pool.query(query, [activity]);

        const leaderboard = rows.map((row, index) => ({
            ...toCamelCase(row),
            rank: index + 1,
            isCurrentUser: row.id === req.user.id
        }));

        res.json({ leaderboard });
    } catch (error) {
        console.error('Scoreboard activity error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden des Scoreboards.' });
    }
});

app.use('/api/scoreboard', scoreboardRouter);

// Stats Router
const statsRouter = express.Router();

// GET /api/stats - User statistics
statsRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(DISTINCT w.id) as total_workouts,
                COALESCE(SUM(wa.points_earned), 0) as total_points,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as total_pullups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as total_pushups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as total_running,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as total_cycling,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'situps' THEN wa.quantity ELSE 0 END), 0) as total_situps,
                COALESCE(AVG(w.duration), 0) as avg_workout_duration
            FROM workouts w
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE w.user_id = $1
        `;

        const { rows } = await pool.query(query, [req.user.id]);
        const stats = toCamelCase(rows[0]);

        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der Statistiken.' });
    }
});

app.use('/api/stats', statsRouter);

// Goals Router
const goalsRouter = express.Router();

// GET /api/goals - User goals (mock data for now)
goalsRouter.get('/', authMiddleware, async (req, res) => {
    try {
        // For now, return mock goals - can be enhanced later with database storage
        const goals = {
            pullups: { target: 100, current: 0 },
            pushups: { target: 500, current: 0 },
            running: { target: 50, current: 0 },
            cycling: { target: 100, current: 0 }
        };

        // Get current progress
        const query = `
            SELECT 
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) as current_pullups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) as current_pushups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) as current_running,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) as current_cycling
            FROM workouts w
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE w.user_id = $1 AND w.workout_date >= DATE_TRUNC('month', CURRENT_DATE)
        `;

        const { rows } = await pool.query(query, [req.user.id]);
        const progress = rows[0];

        goals.pullups.current = parseInt(progress.current_pullups) || 0;
        goals.pushups.current = parseInt(progress.current_pushups) || 0;
        goals.running.current = parseInt(progress.current_running) || 0;
        goals.cycling.current = parseInt(progress.current_cycling) || 0;

        res.json(goals);
    } catch (error) {
        console.error('Goals error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der Ziele.' });
    }
});

app.use('/api/goals', goalsRouter);

// Recent Workouts Router  
const recentWorkoutsRouter = express.Router();

// GET /api/recent-workouts - Recent workouts
recentWorkoutsRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const { limit: limitQuery } = req.query;
        const limit = Math.max(1, Math.min(parseInt(limitQuery, 10) || 5, 50));

        const query = `
            SELECT
                w.id,
                w.created_at,
                w.notes,
                ARRAY_AGG(
                    JSON_BUILD_OBJECT(
                        'activityType', wa.activity_type,
                        'amount', wa.quantity,
                        'unit', wa.unit,
                        'points', wa.points_earned
                    )
                    ORDER BY wa.order_index, wa.id
                ) FILTER (WHERE wa.id IS NOT NULL) as activities
            FROM workouts w
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE w.user_id = $1
            GROUP BY w.id, w.created_at, w.notes
            ORDER BY w.created_at DESC
            LIMIT $2
        `;

        const { rows } = await pool.query(query, [req.user.id, limit]);

        const workouts = rows.map(row => {
            const camelRow = toCamelCase(row);
            const activities = Array.isArray(camelRow.activities)
                ? camelRow.activities.map(activity => ({
                    activityType: activity.activityType,
                    amount: activity.amount ?? activity.quantity ?? 0,
                    unit: activity.unit ?? null,
                    points: activity.points ?? null
                }))
                : [];

            return {
                id: camelRow.id,
                createdAt: camelRow.createdAt,
                notes: camelRow.notes,
                activities
            };
        });

        res.json(workouts);
    } catch (error) {
        console.error('Recent workouts error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der letzten Workouts.' });
    }
});

app.use('/api/recent-workouts', recentWorkoutsRouter);

// Activity Feed Router
const feedRouter = express.Router();

// GET /api/feed - Activity feed
feedRouter.get('/', authMiddleware, async (req, res) => {
    try {
        await ensureFriendInfrastructure();

        const query = `
            WITH friend_ids AS (
                SELECT CASE WHEN user_one_id = $1 THEN user_two_id ELSE user_one_id END AS friend_id
                FROM friendships
                WHERE user_one_id = $1 OR user_two_id = $1
            )
        const { page = 1, limit: limitQuery } = req.query;
        const limit = Math.max(1, Math.min(parseInt(limitQuery, 10) || 20, 50));
        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const offset = (currentPage - 1) * limit;

        const query = `
            SELECT
                wa.id,
                wa.activity_type,
                wa.quantity as amount,
                COALESCE(wa.points_earned, 0) as points,
                COALESCE(wa.created_at, w.created_at) as created_at,
                w.title as workout_title,
                u.first_name,
                u.last_name,
                u.nickname,
                u.display_preference,
                u.avatar_url
            FROM workout_activities wa
            JOIN workouts w ON wa.workout_id = w.id
            JOIN users u ON w.user_id = u.id
            WHERE w.user_id = $1 OR w.user_id IN (SELECT friend_id FROM friend_ids)
            ORDER BY w.workout_date DESC, wa.id DESC
            LIMIT 20
        `;

        const { rows } = await pool.query(query, [req.user.id]);

        const activities = rows.map(row => applyDisplayName(toCamelCase(row)));
            ORDER BY COALESCE(wa.created_at, w.created_at) DESC
            LIMIT $1 OFFSET $2
        `;

        const { rows } = await pool.query(query, [limit, offset]);

        const activities = rows.map(row => {
            const activity = toCamelCase(row);

            let displayName = activity.firstName || activity.nickname || 'Athlet';
            if (activity.displayPreference === 'nickname' && activity.nickname) {
                displayName = activity.nickname;
            } else if (activity.displayPreference === 'fullName') {
                const fullName = [activity.firstName, activity.lastName].filter(Boolean).join(' ').trim();
                displayName = fullName || displayName;
            }

            return {
                id: activity.id,
                userName: displayName,
                userAvatar: activity.avatarUrl || null,
                userFirstName: activity.firstName,
                userLastName: activity.lastName,
                activityType: activity.activityType,
                amount: activity.amount ?? 0,
                points: activity.points ?? 0,
                workoutTitle: activity.workoutTitle,
                createdAt: activity.createdAt || activity.workoutDate
            };
        });

        res.json({ activities });
    } catch (error) {
        console.error('Activity feed error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden des Activity Feeds.' });
    }
});

app.use('/api/feed', feedRouter);

// Challenges Router
const challengesRouter = express.Router();

const getWeeklyWindow = async () => {
    const windowQuery = `
        SELECT
            date_trunc('week', CURRENT_DATE)::date AS start_date,
            (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date AS end_date
    `;

    const { rows } = await pool.query(windowQuery);
    return rows[0];
};

challengesRouter.get('/weekly', authMiddleware, async (req, res) => {
    try {
        const { start_date: weekStart, end_date: weekEnd } = await getWeeklyWindow();

        const progressQuery = `
            SELECT
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) AS pullups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pushups' THEN wa.quantity ELSE 0 END), 0) AS pushups,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) AS running,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'cycling' THEN wa.quantity ELSE 0 END), 0) AS cycling,
                COALESCE(SUM(wa.points_earned), 0) AS total_points,
                COUNT(DISTINCT w.id) AS workouts_completed
            FROM workouts w
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE w.user_id = $1
              AND ${WEEK_WINDOW_CONDITION}
        `;

        const leaderboardQuery = `
            SELECT
                u.id,
                ${USER_DISPLAY_NAME_SQL} AS display_name,
                u.avatar_url,
                COALESCE(SUM(wa.points_earned), 0) AS total_points,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) AS total_running,
                COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) AS total_pullups
            FROM users u
            LEFT JOIN workouts w ON u.id = w.user_id
            LEFT JOIN workout_activities wa ON w.id = wa.workout_id
            WHERE ${WEEK_WINDOW_CONDITION}
            GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
            HAVING COALESCE(SUM(wa.points_earned), 0) > 0
            ORDER BY total_points DESC
            LIMIT 10
        `;

        const userStandingQuery = `
            WITH ranked AS (
                SELECT
                    u.id,
                    ${USER_DISPLAY_NAME_SQL} AS display_name,
                    u.avatar_url,
                    COALESCE(SUM(wa.points_earned), 0) AS total_points,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'running' THEN wa.quantity ELSE 0 END), 0) AS total_running,
                    COALESCE(SUM(CASE WHEN wa.activity_type = 'pullups' THEN wa.quantity ELSE 0 END), 0) AS total_pullups,
                    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(wa.points_earned), 0) DESC) AS position
                FROM users u
                LEFT JOIN workouts w ON u.id = w.user_id
                LEFT JOIN workout_activities wa ON w.id = wa.workout_id
                WHERE ${WEEK_WINDOW_CONDITION}
                GROUP BY u.id, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url
            )
            SELECT * FROM ranked WHERE id = $1 AND total_points > 0
        `;

        const [progressResult, leaderboardResult, userStandingResult] = await Promise.all([
            pool.query(progressQuery, [req.user.id]),
            pool.query(leaderboardQuery),
            pool.query(userStandingQuery, [req.user.id])
        ]);

        const progressRow = progressResult.rows[0] || {};
        const totalPoints = Number(progressRow.total_points) || 0;
        const userProgress = {
            pullups: Number(progressRow.pullups) || 0,
            pushups: Number(progressRow.pushups) || 0,
            running: Number(progressRow.running) || 0,
            cycling: Number(progressRow.cycling) || 0,
            workoutsCompleted: Number(progressRow.workouts_completed) || 0,
            totalPoints
        };

        const leaderboard = leaderboardResult.rows.map((row, index) => ({
            id: row.id,
            displayName: row.display_name || 'Athlet',
            avatarUrl: row.avatar_url,
            totalPoints: Number(row.total_points) || 0,
            totalRunning: Number(row.total_running) || 0,
            totalPullups: Number(row.total_pullups) || 0,
            rank: index + 1,
            isCurrentUser: row.id === req.user.id
        }));

        const userOnLeaderboard = leaderboard.some(entry => entry.isCurrentUser);
        const userStandingRow = userStandingResult.rows[0];

        if (!userOnLeaderboard && userStandingRow) {
            leaderboard.push({
                id: userStandingRow.id,
                displayName: userStandingRow.display_name || 'Athlet',
                avatarUrl: userStandingRow.avatar_url,
                totalPoints: Number(userStandingRow.total_points) || 0,
                totalRunning: Number(userStandingRow.total_running) || 0,
                totalPullups: Number(userStandingRow.total_pullups) || 0,
                rank: Number(userStandingRow.position) || leaderboard.length + 1,
                isCurrentUser: true
            });
        }

        const now = new Date();
        const endDate = new Date(weekEnd);
        endDate.setHours(23, 59, 59, 999);
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        const activityProgress = {
            pullups: {
                target: weeklyChallengeTargets.pullups,
                current: userProgress.pullups,
                percentage: Math.min((userProgress.pullups / weeklyChallengeTargets.pullups) * 100, 100)
            },
            pushups: {
                target: weeklyChallengeTargets.pushups,
                current: userProgress.pushups,
                percentage: Math.min((userProgress.pushups / weeklyChallengeTargets.pushups) * 100, 100)
            },
            running: {
                target: weeklyChallengeTargets.running,
                current: userProgress.running,
                percentage: Math.min((userProgress.running / weeklyChallengeTargets.running) * 100, 100)
            },
            cycling: {
                target: weeklyChallengeTargets.cycling,
                current: userProgress.cycling,
                percentage: Math.min((userProgress.cycling / weeklyChallengeTargets.cycling) * 100, 100)
            }
        };

        const totalCompletion = Math.min((totalPoints / weeklyChallengeTargets.points) * 100, 100);

        res.json({
            week: {
                start: weekStart,
                end: weekEnd,
                daysRemaining
            },
            targets: { ...weeklyChallengeTargets },
            progress: {
                ...userProgress,
                completionPercentage: totalCompletion
            },
            activities: activityProgress,
            leaderboard
        });
    } catch (error) {
        console.error('Weekly challenge error:', error);
        res.status(500).json({ error: 'Serverfehler beim Laden der Wochen-Challenge.' });
    }
});

app.use('/api/challenges', challengesRouter);

const startServer = async () => {
    try {
        await runMigrations();
        const server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
        return server;
    } catch (error) {
        console.error('Failed to start server due to migration error:', error);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw error;
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export { app, pool, runMigrations, startServer };
// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

export { app, pool, ensureFriendInfrastructure };
export { app, pool };
export default app;
