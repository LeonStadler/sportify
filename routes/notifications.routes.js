import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getPushPublicKey,
    listNotifications,
    markNotificationsRead,
    removePushSubscription,
    upsertPushSubscription,
} from '../services/notificationService.js';

export const createNotificationsRouter = (pool) => {
    const router = express.Router();

    // GET /api/notifications - Get user notifications
    router.get('/', authMiddleware, async (req, res) => {
        try {
            const notifications = await listNotifications(pool, req.user.id, { limit: 100 });
            const payload = notifications.map((notification) => ({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                payload: notification.payload,
                isRead: Boolean(notification.readAt),
                createdAt: notification.createdAt,
            }));
            res.json(payload);
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Benachrichtigungen.' });
        }
    });

    // POST /api/notifications/mark-read - Mark all notifications as read
    router.post('/mark-read', authMiddleware, async (req, res) => {
        try {
            await markNotificationsRead(pool, req.user.id);
            res.json({ message: 'Alle Benachrichtigungen wurden als gelesen markiert.' });
        } catch (error) {
            console.error('Mark notifications as read error:', error);
            res.status(500).json({ error: 'Serverfehler beim Markieren der Benachrichtigungen.' });
        }
    });

    router.get('/public-key', authMiddleware, (req, res) => {
        const publicKey = getPushPublicKey();
        res.json({ publicKey, enabled: Boolean(publicKey) });
    });

    router.post('/subscriptions', authMiddleware, async (req, res) => {
        try {
            await upsertPushSubscription(pool, req.user.id, req.body);
            res.status(201).json({ message: 'Push subscription gespeichert.' });
        } catch (error) {
            console.error('Save push subscription error:', error);
            res.status(400).json({ error: error.message || 'Ungültiges Subscription-Objekt.' });
        }
    });

    router.delete('/subscriptions', authMiddleware, async (req, res) => {
        try {
            const { endpoint } = req.body || {};
            if (!endpoint) {
                return res.status(400).json({ error: 'Endpoint ist erforderlich.' });
            }
            await removePushSubscription(pool, req.user.id, endpoint);
            res.status(204).send();
        } catch (error) {
            console.error('Remove push subscription error:', error);
            res.status(500).json({ error: 'Serverfehler beim Entfernen der Subscription.' });
        }
    });

    return router;
};

