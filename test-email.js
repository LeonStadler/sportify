#!/usr/bin/env node

/**
 * E-Mail Test Script für Sportify
 *
 * Testet verschiedene Arten von E-Mails mit Inline-Styles für maximale Kompatibilität.
 *
 * Verwendung:
 * node test-email.js <email-adresse> [email-type]
 *
 * Verfügbare E-Mail-Typen:
 * - general: Allgemeiner Test (Standard)
 * - password: Passwort-Zurücksetzung
 * - invitation: Freundschaftseinladung
 * - success: Erfolgs-E-Mail
 * - verification: E-Mail-Verifikation
 *
 * Beispiele:
 * node test-email.js test@example.com
 * node test-email.js test@example.com password
 * node test-email.js test@example.com invitation
 * node test-email.js test@example.com success
 * node test-email.js test@example.com verification
 *
 * Voraussetzungen:
 * - SMTP-Konfiguration in .env.local muss korrekt sein
 * - Frontend muss laufen (für korrekte URLs)
 */

import dotenv from 'dotenv';
import { sendEmail, testSMTPConnection } from './services/emailService.js';

// Lade immer .env.local für lokale Entwicklung (überschreibt .env)
dotenv.config({ path: '.env.local', override: true });

const testEmail = process.argv[2];
const emailType = process.argv[3] || 'general';

// Debug-Ausgaben für Konfiguration
console.log('📋 Konfiguration geladen:');
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'nicht gesetzt'}`);
console.log(`   VITE_FRONTEND_URL: ${process.env.VITE_FRONTEND_URL || 'nicht gesetzt'}`);
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'nicht gesetzt'}`);
console.log('');

if (!testEmail) {
    console.error('❌ Bitte geben Sie eine E-Mail-Adresse an!');
    console.log('Verwendung: node test-email.js <email-adresse> [email-type]');
    console.log('');
    console.log('Verfügbare E-Mail-Typen:');
    console.log('  general      - Allgemeiner Test (Standard)');
    console.log('  password     - Passwort-Zurücksetzung');
    console.log('  invitation   - Freundschaftseinladung');
    console.log('  success      - Erfolgs-E-Mail');
    console.log('  verification - E-Mail-Verifikation');
    console.log('');
    console.log('Beispiele:');
    console.log('  node test-email.js test@example.com');
    console.log('  node test-email.js test@example.com password');
    console.log('  node test-email.js test@example.com invitation');
    process.exit(1);
}

// Fake Pool für Tests (ohne echte Datenbank)
class FakePool {
    constructor() {
        this.emailLog = [];
    }

    async query(sql, params) {
        // Simuliere erfolgreiches Einfügen in outbound_emails
        if (sql.includes('INSERT INTO outbound_emails')) {
            this.emailLog.push({
                recipient: params[0],
                subject: params[1],
                body: params[2],
                sent_at: new Date()
            });
            return { rows: [{ id: 1 }] };
        }
        return { rows: [] };
    }
}

/**
 * Erstellt verschiedene Arten von Test-E-Mails
 */
async function createTestEmail(emailType, recipientEmail) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';

    switch (emailType) {
        case 'password': {
            // Verwende echte Passwort-Reset-Funktion
            const { sendPasswordResetEmail } = await import('./utils/helpers.js');
            console.log('🔐 Sende echte Passwort-Reset-E-Mail...');

            // Fake Token für Test
            const fakeToken = 'test-reset-token-12345';

            // Die sendPasswordResetEmail Funktion kümmert sich selbst um HTML und Text
            await sendPasswordResetEmail(new FakePool(), recipientEmail, fakeToken, 'Test User');

            // Gib dummy zurück, da die echte Funktion schon alles versendet hat
            return { sent: true };
        }

        case 'invitation': {
            // Simuliere Freundschaftseinladung
            console.log('👥 Teste Freundschaftseinladung...');
            const inviteLink = `${frontendUrl}/invite/123`;
            const expiresDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("de-DE");

            const { createActionEmail } = await import('./utils/emailTemplates.js');
            const emailHtml = createActionEmail({
                greeting: "Hallo!",
                title: "Du wurdest zu Sportify eingeladen",
                message: "Jemand hat dich eingeladen, Teil der Sportify-Community zu werden. Registriere dich jetzt und starte dein Training!",
                buttonText: "Jetzt registrieren",
                buttonUrl: inviteLink,
                additionalText: `Die Einladung läuft am ${expiresDate} ab.`,
                frontendUrl,
                preheader: "Du wurdest zu Sportify eingeladen",
            });

            const emailBody = `Hallo!

Du wurdest zu Sportify eingeladen.

Klicke auf folgenden Link, um dich zu registrieren:
${inviteLink}

Die Einladung läuft am ${expiresDate} ab.

Dein Sportify-Team`;

            return { emailHtml, emailBody, subject: 'Sportify – Einladung' };
        }

        case 'success': {
            // Simuliere Erfolgs-E-Mail
            console.log('🏆 Teste Erfolgs-E-Mail...');
            const { createSuccessEmail } = await import('./utils/emailTemplates.js');
            const emailHtml = createSuccessEmail({
                greeting: "Herzlichen Glückwunsch, Test User!",
                title: "Neuer persönlicher Rekord!",
                message: "Du hast einen neuen persönlichen Rekord aufgestellt! In dieser Woche hast du insgesamt 500 Punkte gesammelt und 25 Push-ups absolviert.",
                actionText: "Zu meinen Workouts",
                actionUrl: `${frontendUrl}/workouts`,
                frontendUrl,
                preheader: "Neuer persönlicher Rekord!",
            });

            const emailBody = `Herzlichen Glückwunsch, Test User!

Neuer persönlicher Rekord!

Du hast einen neuen persönlichen Rekord aufgestellt! In dieser Woche hast du insgesamt 500 Punkte gesammelt und 25 Push-ups absolviert.

Klicke hier, um zu deinen Workouts zu gelangen:
${frontendUrl}/workouts

Dein Sportify-Team`;

            return { emailHtml, emailBody, subject: 'Sportify – Neuer persönlicher Rekord!' };
        }

        case 'verification': {
            // Simuliere E-Mail-Verifikation
            console.log('✅ Teste E-Mail-Verifikation...');
            const verificationUrl = `${frontendUrl}/auth/email-verification?token=test-token-123&email=${encodeURIComponent(recipientEmail)}`;

            const { createActionEmail } = await import('./utils/emailTemplates.js');
            const emailHtml = createActionEmail({
                greeting: `Hallo Test User,`,
                title: "E-Mail-Adresse bestätigen",
                message: "Bitte bestätige deine E-Mail-Adresse, um dein Sportify-Konto zu aktivieren.",
                buttonText: "E-Mail-Adresse bestätigen",
                buttonUrl: verificationUrl,
                additionalText: "Dieser Link ist 24 Stunden lang gültig.",
                frontendUrl,
                preheader: "E-Mail-Adresse bestätigen",
            });

            const emailBody = `Hallo Test User,

bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Link klickst:

${verificationUrl}

Dieser Link ist 24 Stunden lang gültig.

Dein Sportify-Team`;

            return { emailHtml, emailBody, subject: 'Sportify – E-Mail bestätigen' };
        }

        default: {
            // Allgemeiner Test
            console.log('📧 Teste allgemeine E-Mail...');
            const { createActionEmail } = await import('./utils/emailTemplates.js');
            const emailHtml = createActionEmail({
                greeting: 'Hallo Test-User,',
                title: 'E-Mail Test erfolgreich!',
                message: 'Das ist eine Test-E-Mail um zu überprüfen, ob das E-Mail-System und die Templates korrekt funktionieren.',
                buttonText: 'Zur Sportify App',
                buttonUrl: frontendUrl,
                additionalText: 'Diese Test-E-Mail wurde automatisch generiert mit Inline-Styles für maximale E-Mail-Client-Kompatibilität.',
                frontendUrl,
                preheader: 'E-Mail Test',
            });

            const emailBody = 'Das ist eine Test-E-Mail. Wenn du HTML siehst, funktioniert das Template-System!';

            return { emailHtml, emailBody, subject: 'Sportify - E-Mail Test' };
        }
    }
}

async function testEmailSystem() {
    console.log('🚀 Starte E-Mail-System Tests...\n');

    try {
        // 1. SMTP-Verbindung testen
        console.log('📡 Teste SMTP-Verbindung...');
        const smtpOk = await testSMTPConnection();
        if (!smtpOk) {
            console.error('❌ SMTP-Verbindung fehlgeschlagen. Überprüfe deine SMTP-Konfiguration in .env');
            process.exit(1);
        }
        console.log('✅ SMTP-Verbindung erfolgreich\n');

        // 2. Test-E-Mail des gewählten Typs senden
        console.log(`📧 Sende ${emailType}-Test-E-Mail...`);

        const testResult = await createTestEmail(emailType, testEmail);

        // Spezieller Fall: password E-Mail wird von der echten Funktion versendet
        if (testResult.sent) {
            console.log('✅ Passwort-Reset-E-Mail erfolgreich versendet!');
            console.log(`📨 An: ${testEmail}`);
            console.log(`📧 Typ: ${emailType}`);
            console.log(`🔗 Verwendet echte sendPasswordResetEmail Funktion`);
        } else {
            // Normale E-Mails werden über sendEmail versendet
            const result = await sendEmail({
                recipient: testEmail,
                subject: testResult.subject,
                body: testResult.emailBody,
                html: testResult.emailHtml,
            });

            if (result.queued) {
                console.log('✅ Test-E-Mail erfolgreich versendet!');
                console.log(`📨 An: ${testEmail}`);
                console.log(`📧 Typ: ${emailType}`);
                console.log(`🔗 Message-ID: ${result.messageId}`);
            } else {
                console.error('❌ E-Mail konnte nicht versendet werden');
                console.error('Fehler:', result.error);
            }
        }

        console.log('\n🎉 E-Mail-Test abgeschlossen!');
        console.log(`📬 Überprüfe dein E-Mail-Postfach: ${testEmail}`);
        console.log('   - Schaue nach dem Button-Design (sollte orange sein)');
        console.log('   - Teste Light/Dark Mode Unterstützung');
        console.log('   - Überprüfe ob Links funktionieren');

    } catch (error) {
        console.error('❌ Fehler beim E-Mail-Test:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Script ausführen
testEmailSystem().catch(console.error);