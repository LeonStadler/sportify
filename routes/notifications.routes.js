import { randomUUID } from 'crypto';
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { toCamelCase } from '../utils/helpers.js';

export const createNotificationsRouter = (pool) => {
    const router = express.Router();

    // Helper function to create notification
    const createNotification = async (userId, type, relatedUserId, metadata = {}) => {
        try {
            const notificationId = randomUUID();
            await pool.query(
                `INSERT INTO notifications (id, user_id, type, related_user_id, metadata)
                 VALUES ($1, $2, $3, $4, $5)`,
                [notificationId, userId, type, relatedUserId, JSON.stringify(metadata)]
            );
            return notificationId;
        } catch (error) {
            console.error('Error creating notification:', error);
            // Don't throw - notifications are not critical
            return null;
        }
    };

    // GET /api/notifications - Get user notifications
    router.get('/', authMiddleware, async (req, res) => {
        try {
            const userId = req.user.id;

            // Check if notifications table exists
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'notifications'
                );
            `);

            if (!tableCheck.rows[0]?.exists) {
                // Table doesn't exist yet - return empty array
                return res.json([]);
            }

            // Get notifications from database
            const { rows } = await pool.query(
                `SELECT 
                    n.id,
                    n.type,
                    n.is_read AS "isRead",
                    n.created_at AS "createdAt",
                    n.read_at AS "readAt",
                    u.first_name AS "firstName",
                    u.last_name AS "lastName",
                    u.nickname,
                    u.avatar_url AS "avatarUrl"
                FROM notifications n
                LEFT JOIN users u ON u.id = n.related_user_id
                WHERE n.user_id = $1
                ORDER BY n.created_at DESC
                LIMIT 50`,
                [userId]
            );

            const notifications = rows.map(row => {
                const notification = toCamelCase(row);
                return {
                    id: notification.id,
                    type: notification.type,
                    isRead: notification.isRead,
                    createdAt: notification.createdAt,
                    firstName: notification.firstName,
                    lastName: notification.lastName,
                    nickname: notification.nickname,
                    avatarUrl: notification.avatarUrl
                };
            });

            res.json(notifications);
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Benachrichtigungen.' });
        }
    });

    // POST /api/notifications/mark-read - Mark all notifications as read
    router.post('/mark-read', authMiddleware, async (req, res) => {
        try {
            const userId = req.user.id;

            // Check if notifications table exists
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'notifications'
                );
            `);

            if (!tableCheck.rows[0]?.exists) {
                // Table doesn't exist yet - return success
                return res.json({ message: 'Alle Benachrichtigungen wurden als gelesen markiert.' });
            }

            // Mark all unread notifications as read
            await pool.query(
                `UPDATE notifications 
                 SET is_read = true, read_at = NOW()
                 WHERE user_id = $1 AND is_read = false`,
                [userId]
            );

            res.json({ message: 'Alle Benachrichtigungen wurden als gelesen markiert.' });
        } catch (error) {
            console.error('Mark notifications as read error:', error);
            res.status(500).json({ error: 'Serverfehler beim Markieren der Benachrichtigungen.' });
        }
    });

    // Export helper function for use in other routes
    router.createNotification = createNotification;

    return router;
};

