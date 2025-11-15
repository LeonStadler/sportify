import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getAnalyticsForPeriod } from '../services/analytics/analyticsService.js';
import { getOverviewStats } from '../services/analytics/overviewService.js';

export const createStatsRouter = (pool) => {
    const router = express.Router();

    router.get('/', authMiddleware, async (req, res) => {
        try {
            const requestedPeriod = typeof req.query.period === 'string' ? req.query.period : 'week';
            const stats = await getOverviewStats(pool, req.user.id, requestedPeriod);
            res.json(stats);
        } catch (error) {
            console.error('Stats error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Statistiken.' });
        }
    });

    router.get('/analytics', authMiddleware, async (req, res) => {
        try {
            const requestedPeriod = typeof req.query.period === 'string' ? req.query.period : 'week';
            const analytics = await getAnalyticsForPeriod(pool, req.user.id, requestedPeriod);
            res.json(analytics);
        } catch (error) {
            console.error('Analytics stats error:', error);
            res.status(500).json({ error: 'Serverfehler beim Laden der Analytics-Daten.' });
        }
    });

    return router;
};
