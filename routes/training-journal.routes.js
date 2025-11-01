import express from 'express';
import authMiddleware from '../authMiddleware.js';
import {
    ALLOWED_JOURNAL_MOODS,
    ValidationError,
    buildPaginationMeta,
    coerceOptionalScaleValue,
    ensureWorkoutOwnership,
    extractSearchTerm,
    normalizeEntryDate,
    normalizeOptionalDateFilter,
    parseJournalTags,
    parsePaginationParams,
    sanitizeMetricsPayload,
    toCamelCase,
    toTrainingJournalEntry,
} from '../utils/helpers.js';

export const createTrainingJournalRouter = (pool) => {
    const router = express.Router();

    router.use(authMiddleware);

    // GET /api/training-journal - List journal entries with filters and pagination
    router.get('/', async (req, res) => {
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
    router.get('/summary', async (req, res) => {
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
    router.get('/:id', async (req, res) => {
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
    router.post('/', async (req, res) => {
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
            const workoutId = await ensureWorkoutOwnership(pool, req.body.workoutId, req.user.id);

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
    router.put('/:id', async (req, res) => {
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
            const workoutId = await ensureWorkoutOwnership(pool, req.body.workoutId, req.user.id);

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
    router.delete('/:id', async (req, res) => {
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

    return router;
};

