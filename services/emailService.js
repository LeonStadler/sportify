import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

/**
 * Bereinigt einen Umgebungsvariablen-Wert
 * Entfernt führende/nachfolgende Anführungszeichen und Whitespace
 */
const cleanEnvValue = (value) => {
  if (!value) return value;
  let cleaned = value.trim();
  // Entferne führende und nachfolgende Anführungszeichen (einfach oder doppelt)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

// Helper für bedingtes Logging
const shouldLog = () => {
  // In Production standardmäßig aus, außer explizit aktiviert
  if (process.env.NODE_ENV === 'production' && process.env.LOG_EMAIL_DETAILS !== 'true') {
    return false;
  }
  return true;
};

/**
 * Erstellt einen SMTP-Transporter mit Validierung und Verbindungstest
 */
const createTransporter = () => {
  const smtpHost = cleanEnvValue(process.env.SMTP_HOST);
  const smtpUser = cleanEnvValue(process.env.SMTP_USER);
  const smtpPassword = cleanEnvValue(process.env.SMTP_PASSWORD);
  const smtpPort = cleanEnvValue(process.env.SMTP_PORT) || '465';

  // Detaillierte Validierung der SMTP-Konfiguration
  if (!smtpHost) {
    console.error('[Email Service] ❌ SMTP_HOST ist nicht gesetzt in der .env Datei');
    return null;
  }
  if (!smtpUser) {
    console.error('[Email Service] ❌ SMTP_USER ist nicht gesetzt in der .env Datei');
    return null;
  }
  if (!smtpPassword || smtpPassword.length === 0) {
    console.error('[Email Service] ❌ SMTP_PASSWORD ist nicht gesetzt oder leer in der .env Datei');
    console.error('[Email Service] 💡 Tipp: Wenn das Passwort Sonderzeichen enthält, setze es OHNE Anführungszeichen in der .env');
    return null;
  }

  const port = parseInt(smtpPort, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(`[Email Service] ❌ Ungültiger SMTP_PORT: ${smtpPort}`);
    return null;
  }

  const config = {
    host: smtpHost,
    port: port,
    secure: port === 465, // true für 465 (SSL), false für andere Ports (STARTTLS)
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // Timeout-Einstellungen für bessere Fehlerbehandlung
    connectionTimeout: 15000, // 15 Sekunden
    greetingTimeout: 15000,
    socketTimeout: 15000,
    // Zusätzliche Optionen für bessere Kompatibilität
    tls: {
      rejectUnauthorized: false, // Akzeptiere selbstsignierte Zertifikate
      minVersion: 'TLSv1.2'
    }
  };

  // Konfiguration nur loggen, wenn explizit gewünscht (reduziert Rauschen) oder bei Debug
  if (process.env.LOG_EMAIL_CONFIG === 'true') {
    console.info('[Email Service] ✅ SMTP-Konfiguration geladen:', {
      host: smtpHost,
      port: config.port,
      secure: config.secure,
      user: smtpUser,
      passwordLength: smtpPassword.length,
      passwordSet: smtpPassword ? '✓' : '✗'
    });
  }

  try {
    const transporter = nodemailer.createTransport(config);
    return transporter;
  } catch (error) {
    console.error('[Email Service] ❌ Fehler beim Erstellen des SMTP-Transporters:', error);
    return null;
  }
};

/**
 * Versendet eine E-Mail direkt via SMTP
 * @param {Object} options - E-Mail Optionen
 * @param {string} options.recipient - Empfänger-E-Mail-Adresse
 * @param {string} options.subject - Betreff
 * @param {string} [options.body] - Text-Inhalt
 * @param {string} [options.html] - HTML-Inhalt
 * @returns {Promise<Object>} Ergebnis mit queued und messageId
 */
export const sendEmail = async ({ recipient, subject, body, html }) => {
  // Validierung der Eingaben
  if (!recipient || !subject || (!body && !html)) {
    const missingFields = [];
    if (!recipient) missingFields.push('recipient');
    if (!subject) missingFields.push('subject');
    if (!body && !html) missingFields.push('body/html');
    throw new Error(`E-Mail-Angaben sind unvollständig. Fehlend: ${missingFields.join(', ')}`);
  }

  // E-Mail-Format validieren
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipient)) {
    throw new Error(`Ungültige E-Mail-Adresse: ${recipient}`);
  }

  const transporter = createTransporter();

  if (!transporter) {
    const errorMsg = `E-Mail konnte nicht versendet werden (SMTP nicht konfiguriert): ${subject} an ${recipient}`;
    console.error(`[Email Service] ❌ ${errorMsg}`);
    console.error('[Email Service] Stelle sicher, dass SMTP_HOST, SMTP_USER und SMTP_PASSWORD in der .env Datei gesetzt sind');
    return { queued: false, error: 'SMTP nicht konfiguriert' };
  }

  try {
    const fromAddress = cleanEnvValue(process.env.SMTP_FROM) || cleanEnvValue(process.env.SMTP_USER);

    const mailOptions = {
      from: fromAddress,
      to: recipient,
      subject: subject,
      text: body || html?.replace(/<[^>]*>/g, ''), // HTML zu Text konvertieren falls nötig
      html: html || body?.replace(/\n/g, '<br>'), // Text zu HTML konvertieren falls nötig
    };

    if (shouldLog()) {
      console.info(`[Email Service] 📧 Versende E-Mail: "${subject}" an ${recipient}`);
      console.info(`[Email Service] 📤 Von: ${fromAddress}`);
    }

    const info = await transporter.sendMail(mailOptions);

    if (shouldLog()) {
      console.info(`[Email Service] ✅ E-Mail erfolgreich via SMTP versendet: ${subject} an ${recipient}`, {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted?.length > 0 ? info.accepted : 'Keine',
        rejected: info.rejected?.length > 0 ? info.rejected : 'Keine'
      });
    }

    return { queued: true, messageId: info.messageId };
  } catch (error) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    };

    console.error(`[Email Service] ❌ Fehler beim Versenden der E-Mail an ${recipient}:`, errorDetails);
    console.error(`[Email Service] 📋 Vollständiger Fehler:`, error);

    // Spezifische Fehlermeldungen für häufige Probleme
    if (error.code === 'EAUTH') {
      console.error('[Email Service] 🔐 Authentifizierungsfehler - Prüfe SMTP_USER und SMTP_PASSWORD');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('[Email Service] 🌐 Verbindungsfehler - Prüfe SMTP_HOST und SMTP_PORT');
    } else if (error.code === 'ESOCKET') {
      console.error('[Email Service] 🔌 Socket-Fehler - Prüfe Netzwerkverbindung und Firewall');
    }

    throw error;
  }
};

/**
 * Speichert E-Mail in Datenbank UND versendet sie direkt
 * Diese Funktion ist der Haupt-Endpunkt für alle E-Mail-Versendungen
 * @param {Object} pool - Datenbank-Pool
 * @param {Object} options - E-Mail Optionen
 * @param {string} options.recipient - Empfänger-E-Mail-Adresse
 * @param {string} options.subject - Betreff
 * @param {string} [options.body] - Text-Inhalt
 * @param {string} [options.html] - HTML-Inhalt
 * @returns {Promise<Object>} Ergebnis mit queued und emailId
 */
export const queueEmail = async (pool, { recipient, subject, body, html }) => {
  // Validierung
  if (!recipient || !subject || (!body && !html)) {
    throw new Error('E-Mail-Angaben sind unvollständig.');
  }

  if (!pool) {
    throw new Error('Datenbank-Pool ist erforderlich für queueEmail');
  }

  if (shouldLog()) {
    console.info(`[Email Service] 📬 Starte E-Mail-Versand: "${subject}" an ${recipient}`);
  }

  // Versende E-Mail direkt
  let emailSent = false;
  let emailError = null;
  let messageId = null;

  try {
    const result = await sendEmail({ recipient, subject, body, html });
    emailSent = result.queued === true;
    messageId = result.messageId;

    if (!emailSent) {
      const errorMsg = result.error || 'E-Mail konnte nicht versendet werden';
      emailError = new Error(errorMsg);
      console.error(`[Email Service] ❌ E-Mail-Versand fehlgeschlagen: ${errorMsg}`);
    } else {
      if (shouldLog()) {
        console.info(`[Email Service] ✅ E-Mail-Versand erfolgreich: ${subject} an ${recipient}`);
      }
    }
  } catch (sendError) {
    emailError = sendError;
    console.error(`[Email Service] ❌ Fehler beim Versenden der E-Mail: ${sendError.message}`);
    emailSent = false;
  }

  // Speichere IMMER in Datenbank für Logging/Archivierung (auch bei Fehler)
  let emailId = null;
  try {
    const emailContent = html || body || '';

    const result = await pool.query(
      emailSent
        ? 'INSERT INTO outbound_emails (recipient, subject, body, sent_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id'
        : 'INSERT INTO outbound_emails (recipient, subject, body, sent_at) VALUES ($1, $2, $3, NULL) RETURNING id',
      [recipient, subject, emailContent]
    );

    emailId = result.rows[0]?.id;
    const status = emailSent ? '✅ Versendet' : '❌ Fehlgeschlagen';
    
    if (shouldLog()) {
      console.info(`[Email Service] 💾 E-Mail in Datenbank gespeichert (ID: ${emailId}): ${subject} an ${recipient} - ${status}`);
    }

    if (emailSent && emailId && !messageId) {
      // Aktualisiere sent_at falls noch nicht gesetzt
      await pool.query('UPDATE outbound_emails SET sent_at = CURRENT_TIMESTAMP WHERE id = $1 AND sent_at IS NULL', [emailId]);
    }
  } catch (dbError) {
    console.error('[Email Service] ❌ Fehler beim Speichern der E-Mail in Datenbank:', dbError);
    // Wenn die E-Mail versendet wurde, aber nicht gespeichert werden konnte, ist das weniger kritisch
    if (emailSent) {
      console.warn('[Email Service] ⚠️ E-Mail wurde versendet, aber nicht in Datenbank gespeichert');
      return { queued: true, emailId: null };
    }
  }

  // Wenn E-Mail nicht versendet wurde, werfe Fehler (aber erst nach Datenbank-Speicherung)
  if (!emailSent) {
    throw emailError || new Error('E-Mail konnte nicht versendet werden');
  }

  return { queued: emailSent, emailId, messageId };
};

/**
 * Testet die SMTP-Verbindung
 * Kann für Debugging verwendet werden
 */
export const testSMTPConnection = async () => {
  console.info('[Email Service] 🔍 Teste SMTP-Verbindung...');

  const transporter = createTransporter();

  if (!transporter) {
    console.error('[Email Service] ❌ Transporter konnte nicht erstellt werden');
    return false;
  }

  try {
    await transporter.verify();
    console.info('[Email Service] ✅ SMTP-Verbindung erfolgreich getestet');
    return true;
  } catch (error) {
    console.error('[Email Service] ❌ SMTP-Verbindungstest fehlgeschlagen:', error.message);
    return false;
  }
};