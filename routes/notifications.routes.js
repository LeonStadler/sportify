import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

export const createNotificationsRouter = () => {
    const router = express.Router();

    // GET /api/notifications - Get user notifications
    router.get('/', authMiddleware, async (req, res) => {
        try {
            // TODO: Implementiere echte Benachrichtigungen aus der Datenbank
            // Für jetzt: Leeres Array zurückgeben
            res.json([]);
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Benachrichtigungen.' });
        }
    });

    // POST /api/notifications/mark-read - Mark all notifications as read
    router.post('/mark-read', authMiddleware, async (req, res) => {
        try {
            // TODO: Implementiere echte Mark-as-Read Funktionalität
            // Für jetzt: Erfolg zurückgeben
            res.json({ message: 'Alle Benachrichtigungen wurden als gelesen markiert.' });
        } catch (error) {
            console.error('Mark notifications as read error:', error);
            res.status(500).json({ error: 'Serverfehler beim Markieren der Benachrichtigungen.' });
        }
    });

    return router;
};

