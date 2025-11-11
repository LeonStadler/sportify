import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { applyDisplayName, extractSearchTerm, parsePaginationParams, toCamelCase } from '../utils/helpers.js';

export const createUsersRouter = (pool) => {
    const router = express.Router();

    router.get('/search', authMiddleware, async (req, res) => {
        try {
            const { query = '', page = '1', limit = '10' } = req.query;
            const trimmedQuery = String(query).trim();

            if (trimmedQuery.length < 2) {
                return res.json([]);
            }

            const { page: currentPage, limit: pageSize } = parsePaginationParams(page, limit);
            const searchTerm = extractSearchTerm(trimmedQuery);

            if (!searchTerm) {
                return res.json([]);
            }

            const searchQuery = `
                SELECT
                    id,
                    email,
                    first_name,
                    last_name,
                    nickname,
                    display_preference,
                    avatar_url
                FROM users
                WHERE (
                    first_name ILIKE $1
                    OR last_name ILIKE $1
                    OR nickname ILIKE $1
                    OR email ILIKE $1
                )
                AND id != $2
                ORDER BY
                    CASE
                        WHEN first_name ILIKE $3 THEN 1
                        WHEN last_name ILIKE $3 THEN 2
                        WHEN nickname ILIKE $3 THEN 3
                        ELSE 4
                    END,
                    first_name,
                    last_name
                LIMIT $4 OFFSET $5
            `;

            const searchPattern = `%${searchTerm}%`;
            const exactPattern = `${searchTerm}%`;
            const offset = (currentPage - 1) * pageSize;

            const { rows } = await pool.query(searchQuery, [
                searchPattern,
                req.user.id,
                exactPattern,
                pageSize,
                offset
            ]);

            const results = rows.map((row) => applyDisplayName(toCamelCase(row)));

            res.json(results);
        } catch (error) {
            console.error('User search error:', error);
            res.status(500).json({ error: 'Serverfehler bei der Benutzersuche.' });
        }
    });

    return router;
};

