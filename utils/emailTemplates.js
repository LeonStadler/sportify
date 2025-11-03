/**
 * E-Mail-Template-System für Sportify
 * 
 * Erstellt einheitliche, barrierefreie E-Mails im Corporate Design
 * mit Light/Dark Mode Support, Orange-Branding und Legal Footer
 */

/**
 * Generiert das Basis-E-Mail-Template mit Header, Footer und Light/Dark Mode Support
 * 
 * @param {Object} options - Template-Optionen
 * @param {string} options.content - Hauptinhalt der E-Mail (HTML)
 * @param {string} [options.preheader] - Preheader-Text (wird vor dem Header angezeigt)
 * @param {string} [options.frontendUrl] - Frontend URL für Links (optional)
 * @returns {string} Komplettes HTML-E-Mail-Template
 */
export const createEmailTemplate = ({ content, preheader = '', frontendUrl = '' }) => {
    // Orange Primary Color: hsl(24.6 95% 53.1%) = ca. #F97316
    const primaryOrange = '#F97316';
    const primaryOrangeDark = '#EA580C';
    
    // Frontend URL mit Fallback
    const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'https://sportify.app';
    
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
                                <!-- Trophy SVG Icon -->
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 10px auto;">
                                    <path d="M6 9H4C2.89543 9 2 9.89543 2 11V12C2 15.3137 4.68629 18 8 18H16C19.3137 18 22 15.3137 22 12V11C22 9.89543 21.1046 9 20 9H18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 9L7 3H17L18 9" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 18V22" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M8 22H16" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </td>
                            <!-- Text -->
                            <td style="padding-left: 12px; vertical-align: middle;">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: bold; color: #F97316; line-height: 1.2;">Sportify</td>
                                    </tr>
                                    <tr>
                                        <td style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #6b6b6b; line-height: 1.4; padding-top: 2px;">by Leon Stadler</td>
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
        <div style="margin-top: 8px;">
            <a href="${baseUrl}/privacy" style="color: inherit; text-decoration: underline; margin-right: 16px;">Privacy</a>
            <a href="${baseUrl}/terms" style="color: inherit; text-decoration: underline; margin-right: 16px;">Terms</a>
            <a href="${baseUrl}/imprint" style="color: inherit; text-decoration: underline; margin-right: 16px;">Imprint</a>
            <a href="${baseUrl}/contact" style="color: inherit; text-decoration: underline;">Contact</a>
        </div>
    `;

    return `
<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
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

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0a0a0a;
                color: #fafafa;
            }
            .email-container {
                background-color: #1a1a1a !important;
            }
            .content-wrapper {
                background-color: #1a1a1a !important;
            }
            .text-primary {
                color: #f97316 !important;
            }
            .text-muted {
                color: #a3a3a3 !important;
            }
            .code-box, .token-box {
                background-color: #2a2a2a !important;
                border-color: #3a3a3a !important;
                color: #fafafa !important;
            }
            .button {
                background-color: #f97316 !important;
                color: #0a0a0a !important;
            }
            .button:hover {
                background-color: #ea580c !important;
            }
        }

        /* Container */
        .email-wrapper {
            width: 100%;
            background-color: #f5f5f5;
            padding: 20px 0;
        }

        @media (prefers-color-scheme: dark) {
            .email-wrapper {
                background-color: #0a0a0a;
            }
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (prefers-color-scheme: dark) {
            .email-container {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            }
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
            padding: 32px 24px;
            text-align: center;
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

        @media (prefers-color-scheme: dark) {
            .content-wrapper h1,
            .content-wrapper h2 {
                color: #fafafa;
            }
            .content-wrapper p {
                color: #d4d4d4;
            }
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

        @media (prefers-color-scheme: dark) {
            .email-footer {
                background-color: #1a1a1a;
            }
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

        @media (prefers-color-scheme: dark) {
            .footer-text,
            .footer-links,
            .footer-links a {
                color: #a3a3a3;
            }
            .footer-links a:hover {
                color: #F97316;
            }
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

        @media (prefers-color-scheme: dark) {
            .text-muted {
                color: #a3a3a3;
            }
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
        <span class="preheader">${preheader || 'Sportify'}</span>
        
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <a href="${baseUrl}" class="logo-link" aria-label="Sportify - Zur Startseite">
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
                    © 2025 Sportify. All rights reserved. Developed by Leon Stadler.
                </p>
                <div class="footer-links">
                    <a href="${baseUrl}/privacy">Privacy</a>
                    <a href="${baseUrl}/terms">Terms</a>
                    <a href="${baseUrl}/imprint">Imprint</a>
                    <a href="${baseUrl}/contact">Contact</a>
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
 * @param {string} [options.token] - Optional: Token/Code zur Anzeige
 * @param {string} [options.tokenLabel] - Label für Token (z.B. "Alternativ kannst du diesen Code verwenden:")
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
    token,
    tokenLabel,
    frontendUrl = '',
    preheader = ''
}) => {
    let content = '';

    // Greeting
    if (greeting) {
        content += `<p style="margin-bottom: 16px;">${greeting}</p>`;
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
        const fullUrl = buttonUrl.startsWith('http') ? buttonUrl : `${frontendUrl || process.env.FRONTEND_URL || 'https://sportify.app'}${buttonUrl}`;
        content += `
            <div class="button-container">
                <a href="${fullUrl}" class="button" style="color: #ffffff; text-decoration: none;">
                    ${buttonText}
                </a>
            </div>
        `;

        // Alternative Link-Text
        content += `<p class="text-muted" style="font-size: 14px; margin-top: 24px;">
            Falls der Button nicht funktioniert, kopiere folgenden Link in deinen Browser:<br>
            <a href="${fullUrl}" style="color: #F97316; word-break: break-all;">${fullUrl}</a>
        </p>`;
    }

    // Token
    if (token) {
        if (tokenLabel) {
            content += `<p style="margin-top: 24px;">${tokenLabel}</p>`;
        } else {
            content += `<p style="margin-top: 24px;">Alternativ kannst du diesen Code verwenden:</p>`;
        }
        content += `<div class="token-box">${token}</div>`;
    }

    // Additional Text
    if (additionalText) {
        content += `<p style="margin-top: 24px;">${additionalText}</p>`;
    }

    return createEmailTemplate({
        content,
        preheader: preheader || title || 'Sportify',
        frontendUrl
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
    frontendUrl = '',
    preheader = ''
}) => {
    let content = '';

    if (greeting) {
        content += `<p style="margin-bottom: 16px;">${greeting}</p>`;
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
        preheader: preheader || title || 'Sportify',
        frontendUrl
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
    frontendUrl = '',
    preheader = ''
}) => {
    let content = '';

    if (greeting) {
        content += `<p style="margin-bottom: 16px;">${greeting}</p>`;
    }

    if (title) {
        content += `<h1 class="text-primary">${title}</h1>`;
    }

    if (message) {
        content += `<p style="font-size: 18px; line-height: 1.8;">${message}</p>`;
    }

    if (actionText && actionUrl) {
        const fullUrl = actionUrl.startsWith('http') ? actionUrl : `${frontendUrl || process.env.FRONTEND_URL || 'https://sportify.app'}${actionUrl}`;
        content += `
            <div class="button-container" style="margin-top: 32px;">
                <a href="${fullUrl}" class="button" style="color: #ffffff; text-decoration: none;">
                    ${actionText}
                </a>
            </div>
        `;
    }

    return createEmailTemplate({
        content,
        preheader: preheader || title || 'Sportify',
        frontendUrl
    });
};

