import { randomUUID } from "crypto";
import { sendEmailQueueAlert } from "./alertService.js";
import { sendEmail } from "./emailService.js";

const MAX_EMAIL_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 60000; // 1 Minute

export const queueEmailSummary = async (
  pool,
  { userId, recipient, subject, body, html, scheduledAt = new Date() }
) => {
  if (!recipient || !subject) {
    throw new Error("Recipient and subject are required");
  }

  const id = randomUUID();
  await pool.query(
    `INSERT INTO email_queue (id, user_id, recipient, subject, body, html, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      userId || null,
      recipient,
      subject,
      body || null,
      html || null,
      scheduledAt,
    ]
  );
  return id;
};

export const markEmailAsProcessed = async (
  pool,
  id,
  { error = null, retry = false } = {}
) => {
  if (retry) {
    // Calculate next retry time with exponential backoff
    const { rows } = await pool.query(
      `SELECT attempts FROM email_queue WHERE id = $1`,
      [id]
    );
    const attempts = rows[0]?.attempts || 0;
    const delayMinutes = Math.pow(2, attempts); // 1, 2, 4, 8 minutes
    const nextRetryAt = new Date(
      Date.now() + delayMinutes * RETRY_DELAY_BASE_MS
    );

    await pool.query(
      `UPDATE email_queue
             SET status = 'pending',
                 attempts = attempts + 1,
                 error = $2,
                 scheduled_at = $3
             WHERE id = $1`,
      [id, error, nextRetryAt]
    );
  } else {
    await pool.query(
      `UPDATE email_queue
             SET status = $2,
                 processed_at = NOW(),
                 attempts = attempts + 1,
                 error = $3
             WHERE id = $1`,
      [id, error ? "failed" : "sent", error]
    );
  }
};

export const claimPendingEmails = async (pool, { limit = 25 } = {}) => {
  // Claim rows up-front to prevent double processing across concurrent workers
  // Include retry emails that are due
  const { rows } = await pool.query(
    `WITH pending AS (
            SELECT id
            FROM email_queue
            WHERE status = 'pending' 
              AND scheduled_at <= NOW()
              AND attempts < $1
            ORDER BY scheduled_at ASC, attempts ASC
            LIMIT $2
            FOR UPDATE SKIP LOCKED
        )
        UPDATE email_queue e
        SET status = 'processing'
        FROM pending
        WHERE e.id = pending.id
        RETURNING e.id, e.user_id, e.recipient, e.subject, e.body, e.html, e.attempts`,
    [MAX_EMAIL_RETRIES, limit]
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
      results.push({ id: email.id, status: "sent" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      const shouldRetry = email.attempts < MAX_EMAIL_RETRIES;

      if (shouldRetry) {
        await markEmailAsProcessed(pool, email.id, {
          error: message,
          retry: true,
        });
        results.push({
          id: email.id,
          status: "retry",
          error: message,
          attempts: email.attempts + 1,
        });
      } else {
        await markEmailAsProcessed(pool, email.id, { error: message });
        results.push({ id: email.id, status: "failed", error: message });
      }
    }
  }

  const failedCount = results.filter((r) => r.status === "failed").length;
  const retryCount = results.filter((r) => r.status === "retry").length;

  // Send alert if there are many failures
  if (failedCount > 10) {
    const { rows: pendingRows } = await pool.query(
      `SELECT COUNT(*) as count FROM email_queue WHERE status = 'pending'`
    );
    const pendingCount = parseInt(pendingRows[0]?.count || 0, 10);
    await sendEmailQueueAlert(failedCount, pendingCount);
  }

  return { processed: results.length, results, failedCount, retryCount };
};
