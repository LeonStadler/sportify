---
title: "E-Mail-Templates"
---

# E-Mail-Templates

## 🎨 Design-System

Das Sportify E-Mail-Template-System verwendet ein konsistentes Design mit Corporate Branding und maximaler Kompatibilität.

## 🖼️ Header Design

### Logo-Bereich
```html
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 220px;">
  <tr>
    <td align="left" style="padding: 0;">
      <!-- Orange Hintergrund mit Trophy Icon -->
      <div style="background-color: #F97316; border-radius: 8px; width: 48px; height: 48px; text-align: center; vertical-align: middle; padding: 10px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <!-- Trophy SVG Path -->
        </svg>
      </div>
      <!-- Text: "Sportify by Leon Stadler" -->
    </td>
  </tr>
</table>
```

**Features:**
- Orange Branding (#F97316)
- Trophy Icon als Logo
- Responsive Design
- Gleicher Header in Light/Dark Mode

## 🎯 Template-Typen

### 1. Action Email (`createActionEmail`)
**Zweck:** E-Mails mit Call-to-Action Button

```javascript
const emailHtml = createActionEmail({
  greeting: "Hallo Max,",
  title: "E-Mail-Adresse bestätigen",
  message: "Bitte bestätige deine E-Mail-Adresse...",
  buttonText: "E-Mail-Adresse bestätigen",
  buttonUrl: "https://sportify.app/verify?token=abc123",
  additionalText: "Dieser Link ist 24 Stunden gültig.",
  frontendUrl: "https://sportify.app",
  preheader: "E-Mail-Adresse bestätigen"
});
```

### 2. Simple Email (`createSimpleEmail`)
**Zweck:** Reine Text-E-Mails ohne Button

```javascript
const emailHtml = createSimpleEmail({
  greeting: "Hallo Max,",
  title: "Willkommen bei Sportify",
  message: "<p>Dein Account wurde erfolgreich aktiviert!</p>",
  frontendUrl: "https://sportify.app"
});
```

### 3. Success Email (`createSuccessEmail`)
**Zweck:** Erfolgsmeldungen und Achievements

```javascript
const emailHtml = createSuccessEmail({
  greeting: "Herzlichen Glückwunsch, Max!",
  title: "Neuer persönlicher Rekord!",
  message: "Du hast einen neuen PR aufgestellt...",
  actionText: "Zu meinen Workouts",
  actionUrl: "/workouts",
  frontendUrl: "https://sportify.app"
});
```

## 🎨 Farbschema

### Light Mode (Default)
```css
:root {
  --background: #ffffff;
  --foreground: #1a1a1a;
  --primary: #F97316;
  --muted: #6b6b6b;
}
```

### Dark Mode (@media prefers-color-scheme: dark)
```css
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0a0e27 !important;
    color: #f8fafc !important;
  }
  .button {
    background-color: #F97316 !important;
    color: #ffffff !important;
  }
}
```

## 🔧 Inline-Styles

**Warum Inline-Styles?**
- ✅ Maximale E-Mail-Client-Kompatibilität
- ✅ Keine externen CSS-Dateien
- ✅ Outlook-kompatibel
- ✅ Gmail-kompatibel

### Button-Styles
```html
<a href="https://sportify.app/action"
   style="display: inline-block;
          padding: 14px 32px;
          background-color: #F97316;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          line-height: 1.5;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  Button Text
</a>
```

## 📱 Responsive Design

### Mobile Optimierung
```css
@media only screen and (max-width: 600px) {
  .email-container {
    width: 100% !important;
    border-radius: 0 !important;
  }
  .button {
    padding: 12px 24px !important;
    font-size: 14px !important;
  }
}
```

**Features:**
- Volle Breite auf Mobile
- Kleinere Buttons
- Optimierte Schriftgrößen

## 🌙 Dark Mode Support

### Automatische Erkennung
```html
<!-- Dark Mode wird automatisch über CSS Media Queries erkannt -->
@media (prefers-color-scheme: dark) {
  .email-container {
    background-color: #0a0e27 !important;
  }
}
```

### Manuelle Steuerung
```html
<!-- Für Tests oder benutzerdefinierte Einstellungen -->
[data-theme="dark"] .email-container {
  background-color: #0a0e27 !important;
}
```

## 🔤 Typography

### Schriftarten (Fallback-Kette)
```css
font-family: 'Inter',
             system-ui,
             -apple-system,
             BlinkMacSystemFont,
             'Segoe UI',
             Arial,
             sans-serif;
```

### Schriftgrößen
- **H1**: 24px, 700 weight (Titel)
- **H2**: 20px, 600 weight (Untertitel)
- **Body**: 16px, 400 weight (Fließtext)
- **Small**: 14px, 400 weight (Zusatzinfo)
- **Tiny**: 12px, 400 weight (Footer)

## 📏 Layout-Struktur

```
┌─────────────────────────────────┐
│           Header                │
│  ┌─────┐ Sportify by Leon      │
│  │🏆   │ Stadler                │
│  └─────┘                        │
├─────────────────────────────────┤
│           Content               │
│  Greeting: "Hallo Max,"         │
│                                 │
│  Title: "E-Mail bestätigen"     │
│                                 │
│  Message: "Bitte bestätige..."  │
│                                 │
│  [Button: "Bestätigen"]         │
│                                 │
│  Additional: "Link gültig 24h"  │
├─────────────────────────────────┤
│           Footer                │
│  © 2025 Sportify                │
│  Privacy | Terms | Imprint      │
└─────────────────────────────────┘
```

## 🛡️ Sicherheit & Barrierefreiheit

### Sicherheit
- **URL-Encoding**: Alle Parameter werden sicher kodiert
- **Token-Hashing**: Sensible Daten werden gehasht gespeichert
- **Expiration**: Links verfallen automatisch

### Barrierefreiheit
- **Alt-Texte**: Für Bilder und Icons
- **ARIA-Labels**: Semantische Beschriftungen
- **Kontrast**: Mindestens 4.5:1 Kontrastverhältnis
- **Fokus-Indikatoren**: Sichtbare Fokus-States

## 🧪 Template-Testing

### Test-Abdeckung
```bash
# Alle E-Mail-Typen testen
node test-email.js test@example.com general
node test-email.js test@example.com password
node test-email.js test@example.com invitation
node test-email.js test@example.com success
node test-email.js test@example.com verification
```

### Browser-Kompatibilität
- ✅ Chrome Desktop/Mobile
- ✅ Firefox Desktop/Mobile
- ✅ Safari Desktop/Mobile
- ✅ Edge Desktop/Mobile

### E-Mail-Client-Kompatibilität
- ✅ Gmail Web/App
- ✅ Outlook Desktop/Web/App
- ✅ Apple Mail
- ✅ Thunderbird
- ✅ Yahoo Mail
- ✅ ProtonMail

## 🔄 Template-Updates

### Branding-Änderungen
```javascript
// In utils/emailTemplates.js
const primaryOrange = "#F97316";  // Neue Brand-Farbe
const primaryOrangeDark = "#EA580C"; // Hover-State
```

### Neue E-Mail-Typen
```javascript
// Neue Template-Funktion hinzufügen
export const createNewsletterEmail = ({ ... }) => {
  // Newsletter-spezifische Logik
};
```

### Internationalisierung
```javascript
// Mehrsprachige Templates
const translations = {
  de: { /* Deutsche Texte */ },
  en: { /* Englische Texte */ }
};
```