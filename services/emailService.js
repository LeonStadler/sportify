import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Erstelle SMTP Transport
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP-Konfiguration nicht vollständig. E-Mails werden nur in der Datenbank gespeichert.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_PORT === '465', // true für 465, false für andere Ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Versendet eine E-Mail direkt via SMTP
export const sendEmail = async ({ recipient, subject, body, html }) => {
  if (!recipient || !subject || (!body && !html)) {
    throw new Error('E-Mail-Angaben sind unvollständig.');
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn(`E-Mail konnte nicht versendet werden (SMTP nicht konfiguriert): ${subject} an ${recipient}`);
    return { queued: false, error: 'SMTP nicht konfiguriert' };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipient,
      subject,
      text: body,
      html: html || body?.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);
    console.info(`✅ E-Mail erfolgreich via SMTP versendet: ${subject} an ${recipient}`, { messageId: info.messageId, response: info.response });
    return { queued: true, messageId: info.messageId };
  } catch (error) {
    console.error('Fehler beim Versenden der E-Mail:', error);
    throw error;
  }
};

// Speichert E-Mail in Datenbank UND versendet sie direkt
export const queueEmail = async (pool, { recipient, subject, body, html }) => {
  if (!recipient || !subject || (!body && !html)) {
    throw new Error('E-Mail-Angaben sind unvollständig.');
  }

  console.info(`[Email Service] Starte E-Mail-Versand: ${subject} an ${recipient}`);

  // Versende E-Mail direkt zuerst
  let emailSent = false;
  try {
    const result = await sendEmail({ recipient, subject, body, html });
    emailSent = result.queued === true;
    console.info(`[Email Service] E-Mail-Versand erfolgreich: ${subject} an ${recipient}`);
  } catch (sendError) {
    console.error(`[Email Service] ❌ Fehler beim Versenden der E-Mail: ${sendError.message}`, sendError);
    // Weiter mit Datenbank-Speicherung auch bei Fehler
  }

  // Speichere in Datenbank für Logging/Archivierung
  try {
    const result = await pool.query(
      emailSent
        ? 'INSERT INTO outbound_emails (recipient, subject, body, sent_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id'
        : 'INSERT INTO outbound_emails (recipient, subject, body, sent_at) VALUES ($1, $2, $3, NULL) RETURNING id',
      [recipient, subject, body || html]
    );

    const emailId = result.rows[0]?.id;
    console.info(`[Email Service] E-Mail in Datenbank gespeichert (ID: ${emailId}): ${subject} an ${recipient}`);

    if (emailSent && emailId) {
      // Aktualisiere sent_at falls noch nicht gesetzt
      await pool.query('UPDATE outbound_emails SET sent_at = CURRENT_TIMESTAMP WHERE id = $1 AND sent_at IS NULL', [emailId]);
    }

    return { queued: emailSent, emailId };
  } catch (dbError) {
    console.error('[Email Service] Fehler beim Speichern der E-Mail in Datenbank:', dbError);
    // Wenn E-Mail versendet wurde, ist das okay
    if (emailSent) {
      return { queued: true, emailId: null };
    }
    throw new Error(`E-Mail konnte nicht versendet werden: ${dbError.message}`);
  }
};
