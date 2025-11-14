import express from 'express';
import { processMonthlyEvents, processWeeklyEvents } from '../services/eventService.js';
import { processEmailQueue } from '../services/emailQueueService.js';

const verifyCronRequest = (req) => {
    const cronSecret = process.env.EVENTS_CRON_SECRET || process.env.CRON_SECRET;
    if (!cronSecret) {
        return true;
    }
    const authorization = req.headers['authorization'] || '';
    if (authorization.startsWith('Bearer ')) {
        const token = authorization.slice(7);
        return token === cronSecret;
    }
    if (req.query?.secret) {
        return req.query.secret === cronSecret;
    }
    return false;
};

export const createEventsRouter = (pool) => {
    const router = express.Router();

    router.post('/weekly', async (req, res) => {
        if (!verifyCronRequest(req)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const result = await processWeeklyEvents(pool, {
                force: req.query.force === 'true' || req.body?.force === true,
            });
            res.json({ status: 'ok', ...result });
        } catch (error) {
            console.error('Weekly events processing failed:', error);
            res.status(500).json({ error: 'Failed to process weekly events', details: error.message });
        }
    });

    router.post('/monthly', async (req, res) => {
        if (!verifyCronRequest(req)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const result = await processMonthlyEvents(pool, {
                force: req.query.force === 'true' || req.body?.force === true,
            });
            res.json({ status: 'ok', ...result });
        } catch (error) {
            console.error('Monthly events processing failed:', error);
            res.status(500).json({ error: 'Failed to process monthly events', details: error.message });
        }
    });

    router.post('/emails/dispatch', async (req, res) => {
        if (!verifyCronRequest(req)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const result = await processEmailQueue(pool, { limit: Number(req.query.limit) || 25 });
            res.json({ status: 'ok', ...result });
        } catch (error) {
            console.error('Email dispatch failed:', error);
            res.status(500).json({ error: 'Failed to process email queue', details: error.message });
        }
    });

    return router;
};
