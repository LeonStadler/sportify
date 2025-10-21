import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3001;

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

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middlewares
app.use(cors());
app.use(express.json());

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
        // Check if preferences column exists, if not create it
        const checkPreferencesColumn = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'preferences';
        `;
        const { rows: prefColumnRows } = await pool.query(checkPreferencesColumn);

        if (prefColumnRows.length === 0) {
            // Add preferences column if it doesn't exist
            await pool.query('ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT \'{}\';');
        }

        // Check if language_preference column exists, if not create it
        const checkLanguageColumn = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'language_preference';
        `;
        const { rows: langColumnRows } = await pool.query(checkLanguageColumn);

        if (langColumnRows.length === 0) {
            // Add language_preference column if it doesn't exist
            await pool.query('ALTER TABLE users ADD COLUMN language_preference VARCHAR(5) DEFAULT \'de\';');
        }

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
    const { email, password } = req.body;

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

        const token = jwt.sign({ userId: rawUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Don't send password hash to client
        delete rawUser.password_hash;

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

        // Check if user exists
        const userQuery = 'SELECT id FROM users WHERE email = $1';
        const { rows } = await pool.query(userQuery, [email]);

        if (rows.length === 0) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.' });
        }

        // Generate reset token
        const resetToken = jwt.sign({ userId: rows[0].id, type: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // In a real app, you would send an email here
        console.log(`Password reset token for ${email}:`, resetToken);

        res.json({ message: 'Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Serverfehler beim Zurücksetzen des Passworts.' });
    }
});

// POST /api/auth/enable-2fa - Enable Two-Factor Authentication
authRouter.post('/enable-2fa', authMiddleware, async (req, res) => {
    try {
        // In a real app, you would generate a TOTP secret and QR code
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Sportify:${req.user.id}?secret=MOCK_SECRET&issuer=Sportify`;
        const backupCodes = ['123456', '789012', '345678', '901234', '567890'];

        // Update user's 2FA status
        await pool.query('UPDATE users SET has_2fa = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.user.id]);

        res.json({
            qrCode: qrCodeUrl,
            backupCodes: backupCodes,
            message: '2FA wurde erfolgreich aktiviert.'
        });
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ error: 'Serverfehler beim Aktivieren der 2FA.' });
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

        // Disable 2FA
        await pool.query('UPDATE users SET has_2fa = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.user.id]);

        res.json({ message: '2FA wurde erfolgreich deaktiviert.' });
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ error: 'Serverfehler beim Deaktivieren der 2FA.' });
    }
});

app.use('/api/auth', authRouter);

// Profile Management APIs
const profileRouter = express.Router();

// PUT /api/profile/update - Update user profile
profileRouter.put('/update', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, nickname, displayPreference, languagePreference, preferences } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'Vorname und Nachname sind erforderlich.' });
        }

        // Check if preferences column exists, if not create it
        const checkPreferencesColumn = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'preferences';
        `;
        const { rows: prefColumnRows } = await pool.query(checkPreferencesColumn);

        if (prefColumnRows.length === 0) {
            // Add preferences column if it doesn't exist
            await pool.query('ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT \'{}\';');
        }

        // Check if language_preference column exists, if not create it
        const checkLanguageColumn = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'language_preference';
        `;
        const { rows: langColumnRows } = await pool.query(checkLanguageColumn);

        if (langColumnRows.length === 0) {
            // Add language_preference column if it doesn't exist
            await pool.query('ALTER TABLE users ADD COLUMN language_preference VARCHAR(5) DEFAULT \'de\';');
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
                CASE 
                    WHEN u.display_preference = 'nickname' AND u.nickname IS NOT NULL THEN u.nickname
                    WHEN u.display_preference = 'fullName' THEN CONCAT(u.first_name, ' ', u.last_name)
                    ELSE u.first_name
                END as display_name,
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
                CASE 
                    WHEN u.display_preference = 'nickname' AND u.nickname IS NOT NULL THEN u.nickname
                    WHEN u.display_preference = 'fullName' THEN CONCAT(u.first_name, ' ', u.last_name)
                    ELSE u.first_name
                END as display_name,
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

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 