import { randomUUID } from 'crypto';
import express from 'express';
import authMiddleware from '../authMiddleware.js';
import { applyDisplayName, createRateLimiter, toCamelCase } from '../utils/helpers.js';

const friendRequestRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

export const createFriendsRouter = (pool, ensureFriendInfrastructure) => {
    const router = express.Router();

    router.get('/', authMiddleware, async (req, res) => {
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
                // friendshipId sollte bereits nach toCamelCase vorhanden sein (von friendship_id)
                // friendId wird zu id umbenannt
                friend.id = friend.friendId;
                // Stelle sicher, dass friendshipId vorhanden ist
                if (!friend.friendshipId && friend.friendship_id) {
                    friend.friendshipId = friend.friendship_id;
                }
                delete friend.friendId;
                return friend;
            });

            res.json(friends);
        } catch (error) {
            console.error('Friends list error:', error);
            console.error('Error stack:', error.stack);
            console.error('Error code:', error.code);
            console.error('Error detail:', error.detail);

            // Prüfe ob es ein Datenbank-Fehler ist
            if (error.code === '42P01') {
                // Tabelle existiert nicht
                return res.status(500).json({
                    error: 'Die Freundschafts-Tabellen existieren nicht. Bitte starte den Server neu oder migriere die Datenbank.'
                });
            }

            const errorMessage = process.env.NODE_ENV === 'development'
                ? (error.message || error.detail || 'Serverfehler beim Laden der Freundesliste.')
                : 'Serverfehler beim Laden der Freundesliste.';
            res.status(500).json({ error: errorMessage });
        }
    });

    router.get('/requests', authMiddleware, async (req, res) => {
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

    router.post('/requests', authMiddleware, async (req, res) => {
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
            console.error('Error stack:', error.stack);
            console.error('Error code:', error.code);
            console.error('Error detail:', error.detail);
            console.error('Error constraint:', error.constraint);

            // Prüfe ob es ein Datenbank-Fehler ist
            if (error.code === '42P01') {
                // Tabelle existiert nicht
                return res.status(500).json({
                    error: 'Die Freundschafts-Tabellen existieren nicht. Bitte starte den Server neu oder migriere die Datenbank.'
                });
            }

            // Prüfe ob es ein Foreign Key Constraint Fehler ist
            if (error.code === '23503') {
                return res.status(400).json({
                    error: 'Der Benutzer existiert nicht.'
                });
            }

            // Prüfe ob es ein Unique Constraint Fehler ist
            if (error.code === '23505') {
                return res.status(409).json({
                    error: error.detail || 'Es besteht bereits eine Anfrage zwischen euch.'
                });
            }

            const errorMessage = process.env.NODE_ENV === 'development'
                ? (error.message || error.detail || 'Serverfehler beim Erstellen der Freundschaftsanfrage.')
                : 'Serverfehler beim Erstellen der Freundschaftsanfrage.';
            res.status(500).json({ error: errorMessage });
        }
    });

    router.put('/requests/:requestId', authMiddleware, async (req, res) => {
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

    router.delete('/:friendshipId', authMiddleware, async (req, res) => {
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

    return router;
};

