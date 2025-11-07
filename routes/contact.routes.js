import express from 'express';
import { queueEmail } from '../services/emailService.js';
import { createSimpleEmail } from '../utils/emailTemplates.js';
import { getFrontendUrl } from '../utils/helpers.js';
import { contactInfo } from '../config/contactInfo.js';

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

            // Frontend URL ermitteln
            const frontendUrl = getFrontendUrl(req);

            // E-Mail-Inhalt erstellen mit dem einheitlichen Template-System
            const emailSubject = `Kontaktformular: ${subject}`;
            
            // HTML-Nachricht für das Template
            const messageHtml = `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: inherit;">Kontaktdaten:</h2>
                    <div style="background-color: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                        <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 8px 0;"><strong>E-Mail:</strong> <a href="mailto:${email}" style="color: #F97316; text-decoration: underline;">${email}</a></p>
                        <p style="margin: 8px 0;"><strong>Betreff:</strong> ${subject}</p>
                    </div>
                    <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: inherit;">Nachricht:</h2>
                    <div style="background-color: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
                </div>
            `;

            // Plain-Text-Version für Fallback
            const emailBody = `Neue Kontaktanfrage von ${name}

E-Mail: ${email}
Betreff: ${subject}

Nachricht:
${message}

---
Diese E-Mail wurde über das Kontaktformular auf der Sportify-Website gesendet.`;

            // Verwende das einheitliche E-Mail-Template-System
            const emailHtml = createSimpleEmail({
                greeting: '',
                title: 'Neue Kontaktanfrage',
                message: messageHtml,
                frontendUrl,
                preheader: `Kontaktanfrage von ${name}`,
                language: 'de',
            });

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


