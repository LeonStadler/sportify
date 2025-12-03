import { sendEmail } from "./emailService.js";

const ALERT_EMAIL = process.env.SMTP_USER || process.env.ALERT_EMAIL;

export const sendJobFailureAlert = async (jobName, error, metadata = {}) => {
  if (!ALERT_EMAIL) {
    console.warn("No alert email configured, skipping alert");
    return;
  }

  try {
    await sendEmail({
      recipient: ALERT_EMAIL,
      subject: `[Sportify Alert] Job Failure: ${jobName}`,
      body: `Job "${jobName}" has failed.\n\nError: ${error}\n\nMetadata: ${JSON.stringify(metadata, null, 2)}`,
    });
  } catch (err) {
    console.error("Failed to send job failure alert:", err);
  }
};

export const sendEmailQueueAlert = async (failedCount, pendingCount) => {
  if (!ALERT_EMAIL) {
    return;
  }

  try {
    await sendEmail({
      recipient: ALERT_EMAIL,
      subject: `[Sportify Alert] Email Queue Issues`,
      body: `Email queue has issues:\n\n- Failed emails: ${failedCount}\n- Pending emails: ${pendingCount}\n\nPlease check the admin dashboard for details.`,
    });
  } catch (err) {
    console.error("Failed to send email queue alert:", err);
  }
};
