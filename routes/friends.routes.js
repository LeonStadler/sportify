import { randomUUID } from 'crypto';
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { applyDisplayName, createRateLimiter, toCamelCase } from '../utils/helpers.js';

const friendRequestRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

export const createFriendsRouter = (pool, ensureFriendInfrastructure) => {
    const router = express.Router();

    // GET /api/friends/invite/:userId - Public route to handle invitation links
    router.get('/invite/:userId', async (req, res) => {
        try {
            await ensureFriendInfrastructure();

            const { userId } = req.params;

            // Prüfe ob User existiert
            const { rows } = await pool.query(
                `SELECT id, first_name, last_name, nickname, display_preference, avatar_url
                 FROM users WHERE id = $1`,
                [userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            const inviter = rows[0];
            const displayName = inviter.display_preference === 'nickname' && inviter.nickname
                ? inviter.nickname
                : inviter.display_preference === 'fullName'
                    ? `${inviter.first_name} ${inviter.last_name}`
                    : inviter.first_name;

            res.json({
                inviter: {
                    id: inviter.id,
                    displayName,
                    avatarUrl: inviter.avatar_url
                }
            });
        } catch (error) {
            console.error('Get invite info error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Einladungsinformationen.' });
        }
    });

    // POST /api/friends/invite/:userId - Accept invitation (requires auth) - Creates friendship directly
    router.post('/invite/:userId', authMiddleware, async (req, res) => {
        try {
            await ensureFriendInfrastructure();

            const { userId: inviterId } = req.params;
            const currentUserId = req.user.id;

            if (inviterId === currentUserId) {
                return res.status(400).json({ error: 'Du kannst dir selbst keine Freundschaftsanfrage senden.' });
            }

            // Prüfe ob User existiert
            const { rows: inviterRows } = await pool.query('SELECT id FROM users WHERE id = $1', [inviterId]);
            if (inviterRows.length === 0) {
                return res.status(404).json({ error: 'Einladender Benutzer wurde nicht gefunden.' });
            }

            // Prüfe ob bereits befreundet
            const { rowCount: existingFriends } = await pool.query(
                `SELECT 1 FROM friendships 
                 WHERE ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
                 AND status = 'accepted'`,
                [currentUserId, inviterId]
            );

            if (existingFriends > 0) {
                return res.status(409).json({ error: 'Ihr seid bereits befreundet.' });
            }

            // Prüfe ob bereits eine ausstehende Anfrage existiert
            const { rows: existingRequests } = await pool.query(
                `SELECT id, requester_id, target_id FROM friend_requests
                 WHERE ((requester_id = $1 AND target_id = $2) OR (requester_id = $2 AND target_id = $1))
                 AND status = 'pending'`,
                [currentUserId, inviterId]
            );

            // Wenn bereits eine Anfrage existiert, akzeptiere diese
            if (existingRequests.length > 0) {
                const request = existingRequests[0];
                
                // Prüfe ob es eine ausstehende Invitation gibt und markiere sie als verwendet
                const { rows: currentUserRows } = await pool.query('SELECT email FROM users WHERE id = $1', [currentUserId]);
                if (currentUserRows.length > 0) {
                    const currentUserEmail = currentUserRows[0].email;
                    const { rows: invitationRows } = await pool.query(
                        'SELECT id FROM invitations WHERE email = $1 AND status = $2 AND used = false AND invited_by = $3',
                        [currentUserEmail, 'pending', inviterId]
                    );
                    if (invitationRows.length > 0) {
                        const invitationId = invitationRows[0].id;
                        const { markInvitationUsed } = await import('../services/invitationService.js');
                        await markInvitationUsed(pool, invitationId);
                        console.log(`✅ Invitation ${invitationId} wurde als verwendet markiert (Freundschaftsanfrage akzeptiert per Link)`);
                    }
                }
                
                // Der eingeladene User ist der requester, der Einlader ist der target
                // Wir müssen prüfen, ob die Anfrage vom Einlader kommt oder vom eingeladenen User
                if (request.requester_id === inviterId && request.target_id === currentUserId) {
                    // Der Einlader hat die Anfrage gesendet - akzeptiere sie
                    const friendshipId = randomUUID();
                    await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', request.id]);
                    await pool.query(
                        `INSERT INTO friendships (id, requester_id, addressee_id, status)
                         VALUES ($1, $2, $3, 'accepted')
                         ON CONFLICT ON CONSTRAINT friendships_requester_id_addressee_id_key 
                         DO UPDATE SET status = 'accepted'`,
                        [friendshipId, inviterId, currentUserId]
                    );
                    return res.status(200).json({
                        message: 'Freundschaft wurde akzeptiert.',
                        type: 'accepted'
                    });
                } else {
                    // Es gibt bereits eine Anfrage vom eingeladenen User - diese wird automatisch akzeptiert
                    const friendshipId = randomUUID();
                    await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', request.id]);
                    await pool.query(
                        `INSERT INTO friendships (id, requester_id, addressee_id, status)
                         VALUES ($1, $2, $3, 'accepted')
                         ON CONFLICT ON CONSTRAINT friendships_requester_id_addressee_id_key 
                         DO UPDATE SET status = 'accepted'`,
                        [friendshipId, currentUserId, inviterId]
                    );
                    return res.status(200).json({
                        message: 'Freundschaft wurde akzeptiert.',
                        type: 'accepted'
                    });
                }
            }

            // Prüfe ob es eine ausstehende Invitation für diese E-Mail gibt und markiere sie als verwendet
            // Hole E-Mail des aktuellen Users
            const { rows: currentUserRows } = await pool.query('SELECT email FROM users WHERE id = $1', [currentUserId]);
            if (currentUserRows.length > 0) {
                const currentUserEmail = currentUserRows[0].email;
                // Suche nach ausstehenden Invitations für diese E-Mail
                const { rows: invitationRows } = await pool.query(
                    'SELECT id FROM invitations WHERE email = $1 AND status = $2 AND used = false AND invited_by = $3',
                    [currentUserEmail, 'pending', inviterId]
                );
                if (invitationRows.length > 0) {
                    const invitationId = invitationRows[0].id;
                    const { markInvitationUsed } = await import('../services/invitationService.js');
                    await markInvitationUsed(pool, invitationId);
                    console.log(`✅ Invitation ${invitationId} wurde als verwendet markiert (Freundschaft akzeptiert per Link)`);
                }
            }

            // Keine bestehende Anfrage - erstelle direkt die Freundschaft
            // Der eingeladene User akzeptiert die Einladung, also ist der Einlader der requester
            const friendshipId = randomUUID();
            await pool.query(
                `INSERT INTO friendships (id, requester_id, addressee_id, status)
                 VALUES ($1, $2, $3, 'accepted')
                 ON CONFLICT ON CONSTRAINT friendships_requester_id_addressee_id_key 
                 DO UPDATE SET status = 'accepted'`,
                [friendshipId, inviterId, currentUserId]
            );

            res.status(201).json({
                message: 'Freundschaft wurde erstellt.',
                type: 'friendship_created',
                friendshipId
            });
        } catch (error) {
            console.error('Accept invite error:', error);
            console.error('Error stack:', error.stack);
            console.error('Error code:', error.code);
            console.error('Error detail:', error.detail);
            const errorMessage = process.env.NODE_ENV === 'development'
                ? (error.message || error.detail || 'Serverfehler beim Erstellen der Freundschaft.')
                : 'Serverfehler beim Erstellen der Freundschaft.';
            res.status(500).json({ error: errorMessage });
        }
    });

    router.get('/', authMiddleware, async (req, res) => {
        try {
            await ensureFriendInfrastructure();

            const query = `
                SELECT
                    f.id AS friendship_id,
                    CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END AS friend_id,
                    u.first_name,
                    u.last_name,
                    u.nickname,
                    u.display_preference,
                    u.avatar_url
                FROM friendships f
                JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
                WHERE (f.requester_id = $1 OR f.addressee_id = $1)
                AND f.status = 'accepted'
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

            const { rowCount: existingFriends } = await pool.query(
                `SELECT 1 FROM friendships 
                 WHERE ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
                 AND status = 'accepted'`,
                [req.user.id, targetUserId]
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
                const friendshipId = randomUUID();

                await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', requestId]);
                await pool.query(
                    `INSERT INTO friendships (id, requester_id, addressee_id, status)
                     VALUES ($1, $2, $3, 'accepted')
                     ON CONFLICT ON CONSTRAINT friendships_requester_id_addressee_id_key 
                     DO UPDATE SET status = 'accepted'`,
                    [friendshipId, request.requester_id, request.target_id]
                );

                return res.json({ status: 'accepted' });
            }

            await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['declined', requestId]);
            res.json({ status: 'declined' });
        } catch (error) {
            console.error('Update friend request error:', error);
            console.error('Error stack:', error.stack);
            console.error('Error code:', error.code);
            console.error('Error detail:', error.detail);
            console.error('Error constraint:', error.constraint);
            const errorMessage = process.env.NODE_ENV === 'development'
                ? (error.message || error.detail || 'Serverfehler beim Aktualisieren der Freundschaftsanfrage.')
                : 'Serverfehler beim Aktualisieren der Freundschaftsanfrage.';
            res.status(500).json({ error: errorMessage });
        }
    });

    router.delete('/requests/:requestId', authMiddleware, async (req, res) => {
        try {
            await ensureFriendInfrastructure();

            const { requestId } = req.params;
            const { rows } = await pool.query(
                'SELECT id, requester_id, target_id, status FROM friend_requests WHERE id = $1',
                [requestId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Anfrage nicht gefunden.' });
            }

            const request = rows[0];

            // Nur der requester kann die Anfrage zurückziehen
            if (request.requester_id !== req.user.id) {
                return res.status(403).json({ error: 'Du kannst nur deine eigenen Anfragen zurückziehen.' });
            }

            if (request.status !== 'pending') {
                return res.status(400).json({ error: 'Diese Anfrage wurde bereits bearbeitet.' });
            }

            await pool.query('DELETE FROM friend_requests WHERE id = $1', [requestId]);
            res.json({ message: 'Anfrage wurde zurückgezogen.' });
        } catch (error) {
            console.error('Delete friend request error:', error);
            console.error('Error stack:', error.stack);
            console.error('Error code:', error.code);
            console.error('Error detail:', error.detail);
            const errorMessage = process.env.NODE_ENV === 'development'
                ? (error.message || error.detail || 'Serverfehler beim Zurückziehen der Anfrage.')
                : 'Serverfehler beim Zurückziehen der Anfrage.';
            res.status(500).json({ error: errorMessage });
        }
    });

    router.delete('/:friendshipId', authMiddleware, async (req, res) => {
        try {
            await ensureFriendInfrastructure();

            const { friendshipId } = req.params;
            const { rows } = await pool.query(
                'SELECT id, requester_id, addressee_id FROM friendships WHERE id = $1',
                [friendshipId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Freundschaft nicht gefunden.' });
            }

            const friendship = rows[0];
            if (![friendship.requester_id, friendship.addressee_id].includes(req.user.id)) {
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

