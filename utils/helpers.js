import crypto from 'crypto';

// Helper-Funktion um Frontend-URL dynamisch zu ermitteln
export const getFrontendUrl = (req) => {
    // 1. Prüfe Umgebungsvariable (höchste Priorität)
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL;
    }

    // 2. Versuche aus Request-Header zu ermitteln (Referer oder Origin)
    const referer = req?.headers?.referer;
    const origin = req?.headers?.origin;

    if (origin) {
        try {
            const url = new URL(origin);
            // Entferne /api Pfad falls vorhanden
            return `${url.protocol}//${url.host}`;
        } catch (e) {
            // Invalid URL
        }
    }

    if (referer) {
        try {
            const url = new URL(referer);
            // Entferne /api Pfad und andere Pfade
            return `${url.protocol}//${url.host}`;
        } catch (e) {
            // Invalid URL
        }
    }

    // 3. Prüfe Host-Header - wenn localhost, versuche Port aus Referer/Origin zu extrahieren
    const host = req?.headers?.host;

    // Versuche Port aus Referer zu extrahieren
    if (referer) {
        try {
            const url = new URL(referer);
            if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                const port = url.port || (url.protocol === 'https:' ? '443' : '80');
                if (port !== '443' && port !== '80') {
                    return `${url.protocol}//${url.hostname}:${port}`;
                }
                return `${url.protocol}//${url.hostname}:${port === '443' ? '' : ''}`;
            }
        } catch (e) {
            // Continue
        }
    }

    // 4. Fallback: Wenn Host-Header vorhanden und localhost, nutze diesen
    if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
        // Host-Header Format: localhost:8080
        if (host.includes(':')) {
            return `http://${host}`;
        }
        // Wenn kein Port im Host, versuche Standard-Port
        return `http://${host}`;
    }

    // 5. Finaler Fallback
    return 'http://localhost:4000';
};

// Helper function to convert snake_case to camelCase
export const toCamelCase = (obj) => {
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

export const applyDisplayName = (user) => {
    if (user.displayPreference === 'nickname' && user.nickname) {
        user.displayName = user.nickname;
    } else if (user.displayPreference === 'fullName') {
        user.displayName = `${user.firstName} ${user.lastName}`;
    } else {
        user.displayName = user.firstName;
    }
    return user;
};

export const createRateLimiter = ({ windowMs, max }) => {
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

export const generateTotpSecret = (length = 20) => {
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

export const verifyTotpToken = (token, secret, window = 1, digits = 6) => {
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

export const buildOtpAuthUrl = (secret, label, issuer = 'Sportify') => {
    const encodedLabel = encodeURIComponent(label);
    const encodedIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
};

export const generateBackupCodes = (count = 10, length = 10) => {
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

export const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined) return defaultValue;
    const normalized = String(value).toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return defaultValue;
};

export const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const normalizeEntryDate = (value) => {
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

export const normalizeOptionalDateFilter = (value) => {
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

export const coerceOptionalScaleValue = (value, { field, min, max, allowZero = false }) => {
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

export const parseJournalTags = (value) => {
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

export const sanitizeMetricsPayload = (metrics) => {
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

export const toTrainingJournalEntry = (row) => {
    const entry = toCamelCase(row);
    entry.tags = Array.isArray(row.tags) ? row.tags : [];
    entry.metrics = row.metrics && typeof row.metrics === 'object' ? row.metrics : {};
    return entry;
};

export const buildPaginationMeta = (page, limit, totalItems) => {
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    return {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

export const ensureWorkoutOwnership = async (pool, workoutId, userId) => {
    if (!workoutId) {
        return null;
    }

    const { rows } = await pool.query('SELECT id FROM workouts WHERE id = $1 AND user_id = $2', [workoutId, userId]);
    if (rows.length === 0) {
        throw new ValidationError('Ungültiges Workout: Es wurde kein Workout gefunden oder es gehört nicht zum Benutzer.');
    }

    return workoutId;
};

export const parsePaginationParams = (page, limit) => {
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    return { page: parsedPage, limit: parsedLimit };
};

export const extractSearchTerm = (value) => {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (trimmed.length < 2) {
        return null;
    }

    return trimmed;
};

export const sanitizeColumnType = (type) => {
    if (!type) return 'UUID';
    const sanitized = type.replace(/[^a-zA-Z0-9_\s()]/g, '');
    return sanitized || 'UUID';
};

export const getColumnSqlType = async (pool, tableName, columnName) => {
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

export const ALLOWED_JOURNAL_MOODS = ['energized', 'balanced', 'tired', 'sore', 'stressed'];

export const WEEK_WINDOW_CONDITION = `
    COALESCE(w.workout_date, w.created_at::date) >= date_trunc('week', CURRENT_DATE)
    AND COALESCE(w.workout_date, w.created_at::date) < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
`;

export const weeklyChallengeTargets = {
    pullups: 200,
    pushups: 400,
    running: 30,
    cycling: 120,
    points: 1500
};

export const USER_DISPLAY_NAME_SQL = `
    CASE
        WHEN u.display_preference = 'nickname' AND u.nickname IS NOT NULL THEN u.nickname
        WHEN u.display_preference = 'fullName' THEN CONCAT(u.first_name, ' ', u.last_name)
        ELSE u.first_name
    END
`;

export const sendPasswordResetEmail = async (pool, recipientEmail, resetToken, userName = null, req = null) => {
    if (!recipientEmail || !resetToken) {
        throw new Error('E-Mail-Adresse und Reset-Token sind erforderlich.');
    }

    const frontendUrl = req ? getFrontendUrl(req) : (process.env.FRONTEND_URL || 'http://localhost:4000');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
    const greeting = userName ? `Hallo ${userName},` : 'Hallo,';
    const emailBody = `${greeting}

Du hast eine Passwort-Zurücksetzung für dein Sportify-Konto angefordert.

Klicke auf folgenden Link, um dein Passwort zurückzusetzen:
${resetUrl}

Alternativ kannst du diesen Code manuell eingeben:
${resetToken}

Dieser Link ist eine Stunde lang gültig.

Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.

Dein Sportify-Team`;

    const emailHtml = `
<!DOCTYPE html>
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

    console.info(`[Password Reset] Sende E-Mail an: ${recipientEmail}`);

    // Verwende queueEmail direkt (wie bei Registrierung)
    const { queueEmail } = await import('../services/emailService.js');

    await queueEmail(pool, {
        recipient: recipientEmail,
        subject: 'Sportify – Passwort zurücksetzen',
        body: emailBody,
        html: emailHtml,
    });
    console.info(`[Password Reset] E-Mail erfolgreich in Queue eingefügt für: ${recipientEmail}`);
};

