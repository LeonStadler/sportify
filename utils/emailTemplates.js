/**
 * E-Mail-Template-System für Sportify
 *
 * Erstellt einheitliche, barrierefreie E-Mails im Corporate Design
 * mit Light/Dark Mode Support, Orange-Branding und Legal Footer
 */

/**
 * Übersetzungen für E-Mail-Templates
 * Default: Deutsch
 */
const emailTranslations = {
  de: {
    footerCopyright:
      "© 2025 Sportify. Alle Rechte vorbehalten. Entwickelt von Leon Stadler.",
    footerPrivacy: "Datenschutz",
    footerTerms: "AGB",
    footerImprint: "Impressum",
    footerContact: "Kontakt",
    buttonFallback:
      "Falls der Button nicht funktioniert, kopiere folgenden Link in deinen Browser:",
    alternativeCode: "Alternativ kannst du diesen Code verwenden:",
    alternativeCodeLabel: "Alternativ kannst du diesen Code manuell eingeben:",
    goToHomepage: "Sportify - Zur Startseite",
    passwordResetTitle: "Passwort zurücksetzen",
    passwordResetMessage:
      "Du hast eine Passwort-Zurücksetzung für dein Sportify-Konto angefordert.",
    passwordResetButton: "Passwort zurücksetzen",
    passwordResetValidity:
      "Dieser Link ist eine Stunde lang gültig. Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.",
    emailVerificationTitle: "E-Mail-Adresse bestätigen",
    emailVerificationMessage:
      "Bitte bestätige deine E-Mail-Adresse, um dein Sportify-Konto zu aktivieren.",
    emailVerificationButton: "E-Mail-Adresse bestätigen",
    emailVerificationValidity: "Dieser Link ist 24 Stunden lang gültig.",
    invitationTitle: "Du wurdest zu Sportify eingeladen",
    invitationMessage:
      "Jemand hat dich eingeladen, Teil der Sportify-Community zu werden. Registriere dich jetzt und starte dein Training!",
    invitationButton: "Jetzt registrieren",
    invitationCodeLabel: "Oder verwende diesen Code bei der Registrierung:",
    invitationExpires: "Die Einladung läuft am",
  },
  en: {
    footerCopyright:
      "© 2025 Sportify. All rights reserved. Developed by Leon Stadler.",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerImprint: "Imprint",
    footerContact: "Contact",
    buttonFallback:
      "If the button doesn't work, copy the following link into your browser:",
    alternativeCode: "Alternatively, you can use this code:",
    alternativeCodeLabel: "Alternatively, you can manually enter this code:",
    goToHomepage: "Sportify - Go to homepage",
    passwordResetTitle: "Reset Password",
    passwordResetMessage:
      "You have requested a password reset for your Sportify account.",
    passwordResetButton: "Reset Password",
    passwordResetValidity:
      "This link is valid for one hour. If you did not make this request, you can ignore this email.",
    emailVerificationTitle: "Verify Email Address",
    emailVerificationMessage:
      "Please verify your email address to activate your Sportify account.",
    emailVerificationButton: "Verify Email Address",
    emailVerificationValidity: "This link is valid for 24 hours.",
    invitationTitle: "You have been invited to Sportify",
    invitationMessage:
      "Someone has invited you to become part of the Sportify community. Register now and start your training!",
    invitationButton: "Register Now",
    invitationCodeLabel: "Or use this code for registration:",
    invitationExpires: "The invitation expires on",
  },
};

/**
 * Generiert das Basis-E-Mail-Template mit Header, Footer und Light/Dark Mode Support
 *
 * @param {Object} options - Template-Optionen
 * @param {string} options.content - Hauptinhalt der E-Mail (HTML)
 * @param {string} [options.preheader] - Preheader-Text (wird vor dem Header angezeigt)
 * @param {string} [options.frontendUrl] - Frontend URL für Links (optional)
 * @param {string} [options.language] - Sprache ('de' oder 'en'), default 'de'
 * @returns {string} Komplettes HTML-E-Mail-Template
 */
export const createEmailTemplate = ({
  content,
  preheader = "",
  frontendUrl = "",
  language = "de",
}) => {
  const t = emailTranslations[language] || emailTranslations.de;
  const langAttr = language === "en" ? "en" : "de";
  // Orange Primary Color: hsl(24.6 95% 53.1%) = ca. #F97316
  const primaryOrange = "#F97316";
  const primaryOrangeDark = "#EA580C";

  // Frontend URL mit Fallback
  const baseUrl =
    frontendUrl || process.env.FRONTEND_URL || "https://sportify.app";

  // Logo als E-Mail-kompatibles Design (Trophy Icon + Text)
  // Verwendet feste Farben statt Gradienten für bessere E-Mail-Client-Kompatibilität
  const logoSvg = `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 220px;">
            <tr>
                <td align="left" style="padding: 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <!-- Trophy Icon Box mit Orange Hintergrund -->
                            <td style="background-color: #F97316; border-radius: 8px; width: 48px; height: 48px; text-align: center; vertical-align: middle; padding: 0;">
                                <!-- Trophy SVG Icon (Lucide Trophy Icon) -->
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 10px auto;">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M4 22h16" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </td>
                            <!-- Text -->
                            <td style="padding-left: 12px; vertical-align: middle;">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: bold; color: #FFFFFF; line-height: 1.2;">Sportify</td>
                                    </tr>
                                    <tr>
                                        <td style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #FFFFFF; opacity: 0.9; line-height: 1.4; padding-top: 2px;">by Leon Stadler</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;

  // Footer-Links HTML
  const footerLinksHtml = `
        <div class="footer-links-wrapper">
            <a href="${baseUrl}/privacy" class="footer-link">Privacy</a>
            <a href="${baseUrl}/terms" class="footer-link">Terms</a>
            <a href="${baseUrl}/imprint" class="footer-link">Imprint</a>
            <a href="${baseUrl}/contact" class="footer-link">Contact</a>
        </div>
    `;

  return `
<!DOCTYPE html>
<html lang="${langAttr}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <title>Sportify</title>
    <style type="text/css">
        /* Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        /* Base Styles - Light Mode (Default) */
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #ffffff;
        }

        /* Dark Mode Support - Verwendet Design-System Farben */
        /* Dark Mode Farben aus index.css: hsl(224, 71.4%, 4.1%) = #0a0e27, hsl(210, 20%, 98%) = #f8fafc */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0a0e27 !important;
                color: #f8fafc !important;
            }
            .email-wrapper {
                background-color: #0a0e27 !important;
            }
            .email-container {
                background-color: #0a0e27 !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.9) !important;
            }
            .content-wrapper {
                background-color: #0a0e27 !important;
            }
            .content-wrapper h1,
            .content-wrapper h2 {
                color: #f8fafc !important;
            }
            .content-wrapper p {
                color: #f8fafc !important;
            }
            .content-wrapper div {
                color: #f8fafc !important;
            }
            .content-wrapper a {
                color: #f97316 !important;
            }
            .text-primary {
                color: #f97316 !important;
            }
            .text-muted {
                color: #a3a3a3 !important;
            }
            .text-muted a {
                color: #F97316 !important;
            }
            .code-box, .token-box {
                background-color: #1e293b !important;
                border-color: #334155 !important;
                color: #f8fafc !important;
            }
            .button {
                background-color: #f97316 !important;
                color: #0a0e27 !important;
            }
            .button-link {
                color: #0a0e27 !important;
            }
            .button:hover {
                background-color: #ea580c !important;
            }
            .button:hover .button-link {
                color: #0a0e27 !important;
            }
            .greeting,
            .additional-text {
                color: #f8fafc !important;
            }
            .fallback-link {
                color: #a3a3a3 !important;
            }
            .success-message {
                color: #f8fafc !important;
            }
            .email-footer {
                background-color: #0a0e27 !important;
            }
            .footer-text,
            .footer-links {
                color: #a3a3a3 !important;
            }
            .footer-links a {
                color: #a3a3a3 !important;
            }
            .footer-links a:hover {
                color: #F97316 !important;
            }
            .footer-link {
                color: #a3a3a3 !important;
            }
            .footer-link:hover {
                color: #F97316 !important;
            }
            .email-header {
                background-color: #F97316 !important;
            }
        }
        
        /* Alternative Dark Mode via data-theme attribute für manuelle Steuerung */
        [data-theme="dark"] body,
        [data-theme="dark"] .email-wrapper {
            background-color: #0a0e27 !important;
            color: #f8fafc !important;
        }
        [data-theme="dark"] .email-container,
        [data-theme="dark"] .content-wrapper {
            background-color: #0a0e27 !important;
        }
        [data-theme="dark"] .content-wrapper h1,
        [data-theme="dark"] .content-wrapper h2,
        [data-theme="dark"] .content-wrapper p,
        [data-theme="dark"] .content-wrapper div {
            color: #f8fafc !important;
        }
        [data-theme="dark"] .content-wrapper a {
            color: #f97316 !important;
        }
        [data-theme="dark"] .text-muted {
            color: #a3a3a3 !important;
        }
        [data-theme="dark"] .text-muted a {
            color: #F97316 !important;
        }
        [data-theme="dark"] .button {
            background-color: #f97316 !important;
            color: #0a0e27 !important;
        }
        [data-theme="dark"] .button-link {
            color: #0a0e27 !important;
        }
        [data-theme="dark"] .greeting,
        [data-theme="dark"] .additional-text {
            color: #f8fafc !important;
        }
        [data-theme="dark"] .fallback-link {
            color: #a3a3a3 !important;
        }
        [data-theme="dark"] .success-message {
            color: #f8fafc !important;
        }
        [data-theme="dark"] .email-footer {
            background-color: #0a0e27 !important;
        }
        [data-theme="dark"] .footer-text,
        [data-theme="dark"] .footer-links,
        [data-theme="dark"] .footer-links a {
            color: #a3a3a3 !important;
        }
        [data-theme="dark"] .footer-links a:hover {
            color: #F97316 !important;
        }
        [data-theme="dark"] .footer-link {
            color: #a3a3a3 !important;
        }
        [data-theme="dark"] .footer-link:hover {
            color: #F97316 !important;
        }

        /* Container */
        .email-wrapper {
            width: 100%;
            background-color: #f5f5f5;
            padding: 20px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }


        /* Header - Orange Hintergrund mit weißem Text (funktioniert in Light und Dark Mode) */
        .email-header {
            background-color: #F97316;
            padding: 32px 24px;
            text-align: center;
        }
        
        /* Header bleibt immer orange - sieht in beiden Modi gut aus */
        @media (prefers-color-scheme: dark) {
            .email-header {
                background-color: #F97316 !important;
            }
        }

        .logo-link {
            display: inline-block;
            text-decoration: none;
        }

        /* Preheader */
        .preheader {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            color: transparent;
            height: 0;
            width: 0;
        }

        /* Content */
        .content-wrapper {
            padding: 32px 24px;
            background-color: #ffffff;
        }

        .content-wrapper h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px 0;
            color: #1a1a1a;
        }

        .content-wrapper h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 24px 0 12px 0;
            color: #1a1a1a;
        }

        .content-wrapper p {
            margin: 0 0 16px 0;
            color: #4a4a4a;
        }

        /* Content Links */
        .content-wrapper a {
            color: #F97316;
            text-decoration: underline;
        }

        /* Greeting Paragraph */
        .greeting {
            margin-bottom: 16px;
        }

        /* Additional Text Paragraph */
        .additional-text {
            margin-top: 24px;
        }

        /* Button Link */
        .button-link {
            color: #ffffff;
            text-decoration: none;
        }

        /* Fallback Link Paragraph */
        .fallback-link {
            font-size: 14px;
            margin-top: 24px;
        }

        .fallback-link a {
            color: #F97316;
            word-break: break-all;
            text-decoration: underline;
        }

        /* Success Message */
        .success-message {
            font-size: 18px;
            line-height: 1.8;
        }

        /* Success Button Container */
        .success-button-container {
            margin-top: 32px;
        }


        /* Button Styles */
        .button-container {
            text-align: center;
            margin: 24px 0;
        }

        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #F97316;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            line-height: 1.5;
            transition: background-color 0.2s;
        }

        .button:hover {
            background-color: #EA580C;
        }

        .button:focus {
            outline: 2px solid #F97316;
            outline-offset: 2px;
        }

        /* Code/Token Box */
        .code-box, .token-box {
            background-color: #f9f9f9;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            text-align: center;
            color: #1a1a1a;
        }

        /* Divider */
        .divider {
            height: 1px;
            background-color: #F97316;
            margin: 32px 0;
            border: none;
        }

        /* Footer */
        .email-footer {
            background-color: #fafafa;
            padding: 24px;
            text-align: center;
            border-top: 2px solid #F97316;
        }


        .footer-text {
            font-size: 12px;
            color: #6b6b6b;
            margin: 0 0 8px 0;
            line-height: 1.5;
        }

        .footer-links {
            font-size: 12px;
            color: #6b6b6b;
            margin-top: 12px;
        }

        .footer-links a {
            color: #6b6b6b;
            text-decoration: underline;
            margin: 0 8px;
        }

        .footer-links a:hover {
            color: #F97316;
        }

        /* Footer Links Wrapper */
        .footer-links-wrapper {
            margin-top: 8px;
        }

        .footer-link {
            color: inherit;
            text-decoration: underline;
            margin-right: 16px;
        }

        .footer-link:last-child {
            margin-right: 0;
        }


        /* Utility Classes */
        .text-center {
            text-align: center;
        }

        .text-primary {
            color: #F97316;
        }

        .text-muted {
            color: #6b6b6b;
        }


        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 8px; }
        .mb-2 { margin-bottom: 16px; }
        .mb-3 { margin-bottom: 24px; }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                border-radius: 0 !important;
            }
            .content-wrapper {
                padding: 24px 16px !important;
            }
            .email-header {
                padding: 24px 16px !important;
            }
            .button {
                padding: 12px 24px !important;
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Preheader Text -->
        <span class="preheader">${preheader || "Sportify"}</span>
        
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <a href="${baseUrl}" class="logo-link" aria-label="${t.goToHomepage}">
                    ${logoSvg}
                </a>
            </div>
            
            <!-- Content -->
            <div class="content-wrapper">
                ${content}
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <p class="footer-text">
                    ${t.footerCopyright}
                </p>
                <div class="footer-links">
                    <a href="${baseUrl}/privacy">${t.footerPrivacy}</a>
                    <a href="${baseUrl}/terms">${t.footerTerms}</a>
                    <a href="${baseUrl}/imprint">${t.footerImprint}</a>
                    <a href="${baseUrl}/contact">${t.footerContact}</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};

/**
 * Erstellt eine E-Mail mit Button-Action
 *
 * @param {Object} options - E-Mail-Optionen
 * @param {string} options.greeting - Begrüßung (z.B. "Hallo Max,")
 * @param {string} options.title - Hauptüberschrift
 * @param {string} options.message - Hauptnachricht
 * @param {string} [options.buttonText] - Button-Text
 * @param {string} [options.buttonUrl] - Button-URL
 * @param {string} [options.additionalText] - Zusätzlicher Text nach dem Button
 * @param {string} [options.frontendUrl] - Frontend URL
 * @param {string} [options.preheader] - Preheader-Text
 * @returns {string} HTML-E-Mail
 */
export const createActionEmail = ({
  greeting,
  title,
  message,
  buttonText,
  buttonUrl,
  additionalText,
  frontendUrl = "",
  preheader = "",
  language = "de",
}) => {
  const t = emailTranslations[language] || emailTranslations.de;
  let content = "";

  // Greeting
  if (greeting) {
    content += `<p class="greeting">${greeting}</p>`;
  }

  // Title
  if (title) {
    content += `<h1>${title}</h1>`;
  }

  // Message
  if (message) {
    content += `<p>${message}</p>`;
  }

  // Button
  if (buttonText && buttonUrl) {
    const fullUrl = buttonUrl.startsWith("http")
      ? buttonUrl
      : `${frontendUrl || process.env.FRONTEND_URL || "https://sportify.app"}${buttonUrl}`;
    content += `
            <div class="button-container">
                <a href="${fullUrl}" class="button button-link">
                    ${buttonText}
                </a>
            </div>
        `;

    // Alternative Link-Text (nur Link, kein Token)
    content += `<p class="text-muted fallback-link">
            ${t.buttonFallback}<br>
            <a href="${fullUrl}">${fullUrl}</a>
        </p>`;
  }

  // Additional Text
  if (additionalText) {
    content += `<p class="additional-text">${additionalText}</p>`;
  }

  return createEmailTemplate({
    content,
    preheader: preheader || title || "Sportify",
    frontendUrl,
    language,
  });
};

/**
 * Erstellt eine einfache Text-E-Mail ohne Button
 *
 * @param {Object} options - E-Mail-Optionen
 * @param {string} options.greeting - Begrüßung
 * @param {string} options.title - Hauptüberschrift
 * @param {string} options.message - Hauptnachricht (kann HTML enthalten)
 * @param {string} [options.frontendUrl] - Frontend URL
 * @param {string} [options.preheader] - Preheader-Text
 * @returns {string} HTML-E-Mail
 */
export const createSimpleEmail = ({
  greeting,
  title,
  message,
  frontendUrl = "",
  preheader = "",
  language = "de",
}) => {
  let content = "";

  if (greeting) {
    content += `<p class="greeting">${greeting}</p>`;
  }

  if (title) {
    content += `<h1>${title}</h1>`;
  }

  if (message) {
    // Erlaube einfaches HTML im Message
    content += `<div>${message}</div>`;
  }

  return createEmailTemplate({
    content,
    preheader: preheader || title || "Sportify",
    frontendUrl,
    language,
  });
};

/**
 * Erstellt eine Erfolgs-E-Mail (z.B. Challenge gewonnen)
 *
 * @param {Object} options - E-Mail-Optionen
 * @param {string} options.greeting - Begrüßung
 * @param {string} options.title - Titel (z.B. "Herzlichen Glückwunsch!")
 * @param {string} options.message - Hauptnachricht
 * @param {string} [options.actionText] - Optional: Call-to-Action Text
 * @param {string} [options.actionUrl] - Optional: Call-to-Action URL
 * @param {string} [options.frontendUrl] - Frontend URL
 * @param {string} [options.preheader] - Preheader-Text
 * @returns {string} HTML-E-Mail
 */
export const createSuccessEmail = ({
  greeting,
  title,
  message,
  actionText,
  actionUrl,
  frontendUrl = "",
  preheader = "",
  language = "de",
}) => {
  let content = "";

  if (greeting) {
    content += `<p class="greeting">${greeting}</p>`;
  }

  if (title) {
    content += `<h1 class="text-primary">${title}</h1>`;
  }

  if (message) {
    content += `<p class="success-message">${message}</p>`;
  }

  if (actionText && actionUrl) {
    const fullUrl = actionUrl.startsWith("http")
      ? actionUrl
      : `${frontendUrl || process.env.FRONTEND_URL || "https://sportify.app"}${actionUrl}`;
    content += `
            <div class="button-container success-button-container">
                <a href="${fullUrl}" class="button button-link">
                    ${actionText}
                </a>
            </div>
        `;
  }

  return createEmailTemplate({
    content,
    preheader: preheader || title || "Sportify",
    frontendUrl,
    language,
  });
};
