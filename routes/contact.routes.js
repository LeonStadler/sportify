import express from 'express';
import { queueEmail } from '../services/emailService.js';

export const createContactRouter = (pool) => {
    const router = express.Router();

    // POST /api/contact - Kontaktformular verarbeiten
    router.post('/', async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;

            // Validierung
            if (!name || !email || !subject || !message) {
                return res.status(400).json({
                    error: 'Alle Felder sind erforderlich.',
                });
            }

            // E-Mail-Format validieren
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Ungültige E-Mail-Adresse.',
                });
            }

            // SMTP_USER aus .env holen (Empfänger der Kontakt-E-Mail)
            const smtpUser = process.env.SMTP_USER || process.env.SMTP_FROM;
            if (!smtpUser) {
                console.error('[Contact] ❌ SMTP_USER ist nicht in der .env Datei gesetzt');
                return res.status(500).json({
                    error: 'E-Mail-Konfiguration fehlt. Bitte kontaktieren Sie den Administrator.',
                });
            }

            // E-Mail-Inhalt erstellen
            const emailSubject = `Kontaktformular: ${subject}`;
            const emailBody = `Neue Kontaktanfrage von ${name}

E-Mail: ${email}
Betreff: ${subject}

Nachricht:
${message}

---
Diese E-Mail wurde über das Kontaktformular auf der Sportify-Website gesendet.`;

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
        }
        .field {
            margin-bottom: 15px;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            margin-top: 5px;
            padding: 10px;
            background-color: white;
            border-radius: 3px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Neue Kontaktanfrage</h1>
    </div>
    <div class="content">
        <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
        </div>
        <div class="field">
            <div class="label">E-Mail:</div>
            <div class="value">${email}</div>
        </div>
        <div class="field">
            <div class="label">Betreff:</div>
            <div class="value">${subject}</div>
        </div>
        <div class="field">
            <div class="label">Nachricht:</div>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
        </div>
    </div>
    <div class="footer">
        <p>Diese E-Mail wurde über das Kontaktformular auf der Sportify-Website gesendet.</p>
    </div>
</body>
</html>`;

            console.info(`[Contact] 📧 Versende Kontaktformular-E-Mail von ${email} an ${smtpUser}`);

            // E-Mail versenden
            await queueEmail(pool, {
                recipient: smtpUser,
                subject: emailSubject,
                body: emailBody,
                html: emailHtml,
            });

            console.info(`[Contact] ✅ Kontaktformular-E-Mail erfolgreich versendet`);

            res.status(200).json({
                success: true,
                message: 'Ihre Nachricht wurde erfolgreich versendet.',
            });
        } catch (error) {
            console.error('[Contact] ❌ Fehler beim Verarbeiten des Kontaktformulars:', error);
            res.status(500).json({
                error: 'Fehler beim Versenden der Nachricht. Bitte versuchen Sie es später erneut.',
            });
        }
    });

    return router;
};


