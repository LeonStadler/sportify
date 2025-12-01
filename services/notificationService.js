import { randomUUID } from 'crypto';
import { getPublicKey, isPushConfigured, sendPushNotification } from './pushService.js';

const parseJson = (value) => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (error) {
            return {};
        }
    }
    return value || {};
};

const mapSubscriptionRow = (row) => ({
    id: row.id,
    endpoint: row.endpoint,
    expirationTime: row.expiration_time,
    keys: parseJson(row.keys),
});

const listPushSubscriptionsInternal = async (pool, userId) => {
    const { rows } = await pool.query(
        `SELECT id, endpoint, expiration_time, keys
         FROM push_subscriptions
         WHERE user_id = $1`,
        [userId]
    );
    return rows.map(mapSubscriptionRow);
};

const deleteSubscriptionByEndpoint = async (pool, endpoint) => {
    await pool.query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [endpoint]);
};

const dispatchPushNotification = async (pool, notificationId, { userId, type, title, message, payload }) => {
    if (!isPushConfigured()) {
        return;
    }

    const subscriptions = await listPushSubscriptionsInternal(pool, userId);
    if (!subscriptions.length) {
        return;
    }

    const pushPayload = JSON.stringify({
        title,
        body: message,
        data: {
            notificationId,
            type,
            payload,
        },
        badge: '/icon-192x192.png',
        icon: '/icon-192x192.png',
        requireInteraction: true,
    });

    for (const subscription of subscriptions) {
        const formattedSubscription = {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime || undefined,
            keys: subscription.keys,
        };

        const result = await sendPushNotification(formattedSubscription, pushPayload);
        if (result.success) {
            await pool.query(
                `UPDATE push_subscriptions SET last_used_at = NOW() WHERE id = $1`,
                [subscription.id]
            );
            continue;
        }

        const statusCode = result.error?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
            await deleteSubscriptionByEndpoint(pool, subscription.endpoint);
        } else {
            console.error('[Push Service] Failed to send push notification:', result.error);
        }
    }
};

export const createNotification = async (pool, { userId, type, title, message, payload = {} }) => {
    if (!userId || !type || !title || !message) {
        throw new Error('Missing required notification fields');
    }

    const notificationId = randomUUID();
    await pool.query(
        `INSERT INTO notifications (id, user_id, type, title, message, payload)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [notificationId, userId, type, title, message, JSON.stringify(payload)]
    );

    await dispatchPushNotification(pool, notificationId, { userId, type, title, message, payload });

    return notificationId;
};

export const markNotificationsRead = async (pool, userId) => {
    await pool.query(
        `UPDATE notifications
         SET read_at = NOW()
         WHERE user_id = $1 AND read_at IS NULL`,
        [userId]
    );
};

export const listNotifications = async (pool, userId, { limit = 50 } = {}) => {
    const { rows } = await pool.query(
        `SELECT id, type, title, message, payload, created_at, read_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
    );

    return rows.map((row) => {
        return {
            id: row.id,
            type: row.type,
            title: row.title,
            message: row.message,
            payload: parseJson(row.payload),
            createdAt: row.created_at,
            readAt: row.read_at,
        };
    });
};

export const upsertPushSubscription = async (pool, userId, subscription) => {
    const { endpoint, keys, expirationTime } = subscription || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        throw new Error('Invalid subscription payload');
    }

    const normalizedExpiration = expirationTime ? new Date(expirationTime) : null;
    const normalizedKeys = { p256dh: keys.p256dh, auth: keys.auth };

    await pool.query(
        `INSERT INTO push_subscriptions (id, user_id, endpoint, expiration_time, keys, last_used_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (endpoint)
         DO UPDATE SET
            user_id = EXCLUDED.user_id,
            expiration_time = EXCLUDED.expiration_time,
            keys = EXCLUDED.keys,
            last_used_at = NOW()`,
        [randomUUID(), userId, endpoint, normalizedExpiration, JSON.stringify(normalizedKeys)]
    );
};

export const removePushSubscription = async (pool, userId, endpoint) => {
    if (!endpoint) return;
    await pool.query(
        `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
        [userId, endpoint]
    );
};

export const getPushPublicKey = () => getPublicKey();
