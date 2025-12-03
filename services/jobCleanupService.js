import { sendEmail } from "./emailService.js";

const STUCK_JOB_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const ALERT_EMAIL = process.env.SMTP_USER || process.env.ALERT_EMAIL;

export const cleanupStuckJobs = async (pool) => {
  const threshold = new Date(Date.now() - STUCK_JOB_THRESHOLD_MS);

  const { rows: stuckJobs } = await pool.query(
    `SELECT id, job_name, scheduled_for, started_at, metadata
         FROM job_runs
         WHERE status = 'running' 
           AND started_at < $1`,
    [threshold]
  );

  if (stuckJobs.length === 0) {
    return { cleaned: 0, jobs: [] };
  }

  const cleanedJobs = [];
  for (const job of stuckJobs) {
    await pool.query(
      `UPDATE job_runs
             SET status = 'failed',
                 completed_at = NOW(),
                 metadata = jsonb_set(
                     COALESCE(metadata, '{}'::jsonb),
                     '{cleanup_reason}',
                     '"Job was stuck for more than 1 hour"'
                 )
             WHERE id = $1`,
      [job.id]
    );
    cleanedJobs.push({
      id: job.id,
      jobName: job.job_name,
      scheduledFor: job.scheduled_for,
      startedAt: job.started_at,
    });
  }

  // Send alert if stuck jobs were found
  if (cleanedJobs.length > 0 && ALERT_EMAIL) {
    try {
      await sendEmail({
        recipient: ALERT_EMAIL,
        subject: `[Sportify Alert] ${cleanedJobs.length} stuck job(s) cleaned up`,
        body: `The following jobs were stuck and have been marked as failed:\n\n${cleanedJobs.map((j) => `- ${j.jobName} (started: ${j.startedAt})\n`).join("")}`,
      });
    } catch (error) {
      console.error("Failed to send stuck job alert:", error);
    }
  }

  return { cleaned: cleanedJobs.length, jobs: cleanedJobs };
};

export const getJobStats = async (pool) => {
  const { rows: stats } = await pool.query(
    `SELECT 
            job_name,
            status,
            COUNT(*) as count,
            MAX(started_at) as last_run,
            COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
            COUNT(*) FILTER (WHERE status = 'running') as running_count,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_count
         FROM job_runs
         WHERE started_at > NOW() - INTERVAL '30 days'
         GROUP BY job_name, status
         ORDER BY job_name, status`
  );

  const { rows: recentFailures } = await pool.query(
    `SELECT job_name, COUNT(*) as count
         FROM job_runs
         WHERE status = 'failed' 
           AND started_at > NOW() - INTERVAL '7 days'
         GROUP BY job_name`
  );

  const { rows: stuckJobs } = await pool.query(
    `SELECT id, job_name, scheduled_for, started_at
         FROM job_runs
         WHERE status = 'running' 
           AND started_at < NOW() - INTERVAL '1 hour'`
  );

  return {
    stats,
    recentFailures,
    stuckJobs,
  };
};
