import { randomUUID } from 'crypto';
import { sendEmail } from './emailService.js';

export const queueEmailSummary = async (pool, { userId, recipient, subject, body, html, scheduledAt = new Date() }) => {
    if (!recipient || !subject) {
        throw new Error('Recipient and subject are required');
    }

    const id = randomUUID();
    await pool.query(
        `INSERT INTO email_queue (id, user_id, recipient, subject, body, html, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, userId || null, recipient, subject, body || null, html || null, scheduledAt]
    );
    return id;
};

export const markEmailAsProcessed = async (pool, id, { error = null } = {}) => {
    await pool.query(
        `UPDATE email_queue
         SET status = $2,
             processed_at = NOW(),
             attempts = attempts + 1,
             error = $3
         WHERE id = $1`,
        [id, error ? 'failed' : 'sent', error]
    );
};

export const claimPendingEmails = async (pool, { limit = 25 } = {}) => {
    const { rows } = await pool.query(
        `SELECT id, user_id, recipient, subject, body, html
         FROM email_queue
         WHERE status = 'pending' AND scheduled_at <= NOW()
         ORDER BY scheduled_at ASC
         LIMIT $1`,
        [limit]
    );
    return rows;
};

export const processEmailQueue = async (pool, { limit = 25 } = {}) => {
    const pendingEmails = await claimPendingEmails(pool, { limit });
    const results = [];

    for (const email of pendingEmails) {
        try {
            await sendEmail({
                recipient: email.recipient,
                subject: email.subject,
                body: email.body || undefined,
                html: email.html || undefined,
            });
            await markEmailAsProcessed(pool, email.id);
            results.push({ id: email.id, status: 'sent' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
            await markEmailAsProcessed(pool, email.id, { error: message });
            results.push({ id: email.id, status: 'failed', error: message });
        }
    }

    return { processed: results.length, results };
};
