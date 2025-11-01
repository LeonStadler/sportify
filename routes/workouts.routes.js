import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { toCamelCase } from '../utils/helpers.js';

export const createWorkoutsRouter = (pool) => {
    const router = express.Router();

    // GET /api/workouts - Get user workouts with pagination and filtering
    router.get('/', authMiddleware, async (req, res) => {
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
                    COALESCE(w.workout_date::text, NULL) as workout_date,
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

                const workout = toCamelCase(row);

                // Stelle sicher, dass workoutDate als ISO-String zurückgegeben wird
                if (workout.workoutDate) {
                    if (workout.workoutDate instanceof Date) {
                        workout.workoutDate = workout.workoutDate.toISOString();
                    } else if (typeof workout.workoutDate !== 'string') {
                        // Versuche es in ein Date-Objekt zu konvertieren und dann zu ISO-String
                        const dateObj = new Date(workout.workoutDate);
                        if (!isNaN(dateObj.getTime())) {
                            workout.workoutDate = dateObj.toISOString();
                        } else {
                            workout.workoutDate = null;
                        }
                    }
                } else {
                    workout.workoutDate = null;
                }

                return {
                    ...workout,
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
    router.post('/', authMiddleware, async (req, res) => {
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

                    // Berechne Gesamtmenge: Wenn Sets vorhanden sind, summiere alle Reps
                    let activityAmount = activity.quantity || activity.amount;
                    if (activity.sets && Array.isArray(activity.sets) && activity.sets.length > 0) {
                        const totalFromSets = activity.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
                        // Verwende die berechnete Summe aus Sets, falls sie größer ist
                        if (totalFromSets > 0) {
                            activityAmount = totalFromSets;
                        }
                    }

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

                const workout = toCamelCase(workoutRows[0]);

                // Stelle sicher, dass workoutDate als ISO-String zurückgegeben wird
                if (workout.workoutDate) {
                    if (workout.workoutDate instanceof Date) {
                        workout.workoutDate = workout.workoutDate.toISOString();
                    } else if (typeof workout.workoutDate !== 'string') {
                        const dateObj = new Date(workout.workoutDate);
                        if (!isNaN(dateObj.getTime())) {
                            workout.workoutDate = dateObj.toISOString();
                        } else {
                            workout.workoutDate = null;
                        }
                    }
                } else {
                    workout.workoutDate = null;
                }

                const newWorkout = {
                    ...workout,
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
    router.get('/:id', authMiddleware, async (req, res) => {
        try {
            const workoutId = req.params.id;
            const query = `
                SELECT
                    w.id, w.title, w.description, 
                    COALESCE(w.workout_date::text, NULL) as workout_date, 
                    w.duration,
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
            const workout = toCamelCase(row);

            // Stelle sicher, dass workoutDate als ISO-String zurückgegeben wird
            if (workout.workoutDate) {
                if (workout.workoutDate instanceof Date) {
                    workout.workoutDate = workout.workoutDate.toISOString();
                } else if (typeof workout.workoutDate !== 'string') {
                    const dateObj = new Date(workout.workoutDate);
                    if (!isNaN(dateObj.getTime())) {
                        workout.workoutDate = dateObj.toISOString();
                    } else {
                        workout.workoutDate = null;
                    }
                }
            } else {
                workout.workoutDate = null;
            }

            res.json({ ...workout, activities });
        } catch (error) {
            console.error('Get workout error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden des Workouts.' });
        }
    });

    // PUT /api/workouts/:id - Update workout
    router.put('/:id', authMiddleware, async (req, res) => {
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

                    // Berechne Gesamtmenge: Wenn Sets vorhanden sind, summiere alle Reps
                    let activityAmount = activity.quantity || activity.amount;
                    if (activity.sets && Array.isArray(activity.sets) && activity.sets.length > 0) {
                        const totalFromSets = activity.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
                        // Verwende die berechnete Summe aus Sets, falls sie größer ist
                        if (totalFromSets > 0) {
                            activityAmount = totalFromSets;
                        }
                    }

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

                const workout = toCamelCase(workoutRows[0]);

                // Stelle sicher, dass workoutDate als ISO-String zurückgegeben wird
                if (workout.workoutDate) {
                    if (workout.workoutDate instanceof Date) {
                        workout.workoutDate = workout.workoutDate.toISOString();
                    } else if (typeof workout.workoutDate !== 'string') {
                        const dateObj = new Date(workout.workoutDate);
                        if (!isNaN(dateObj.getTime())) {
                            workout.workoutDate = dateObj.toISOString();
                        } else {
                            workout.workoutDate = null;
                        }
                    }
                } else {
                    workout.workoutDate = null;
                }

                const updatedWorkout = {
                    ...workout,
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
    router.delete('/:id', authMiddleware, async (req, res) => {
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

    return router;
};

