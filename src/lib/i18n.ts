import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
    de: {
        translation: {
            // Navigation
            "navigation": {
                "dashboard": "Dashboard",
                "scoreboard": "Rangliste",
                "stats": "Statistiken",
                "training": "Training",
                "profile": "Profil",
                "admin": "Admin",
                "settings": "Einstellungen",
                "logout": "Abmelden",
                "friends": "Freunde"
            },
            // Auth
            "auth": {
                "login": "Anmelden",
                "register": "Registrieren",
                "logout": "Abmelden",
                "email": "E-Mail",
                "password": "Passwort",
                "confirmPassword": "Passwort bestätigen",
                "firstName": "Vorname",
                "lastName": "Nachname",
                "nickname": "Spitzname",
                "forgotPassword": "Passwort vergessen?",
                "resetPassword": "Passwort zurücksetzen",
                "backToLogin": "Zurück zur Anmeldung",
                "createAccount": "Konto erstellen",
                "alreadyHaveAccount": "Bereits ein Konto?",
                "noAccount": "Noch kein Konto?",
                "enable2FA": "2FA aktivieren",
                "disable2FA": "2FA deaktivieren",
                "twoFactorCode": "2FA Code",
                "verifyEmail": "E-Mail bestätigen",
                "resendVerification": "Bestätigung erneut senden",
                "emailVerified": "E-Mail bestätigt",
                "inviteUsers": "Nutzer einladen",
                "deleteAccount": "Konto löschen",
                "confirmDelete": "Löschung bestätigen"
            },
            // Profile
            "profile": {
                "personalInfo": "Persönliche Informationen",
                "displayPreferences": "Anzeige-Einstellungen",
                "displayName": "Anzeigename",
                "useNickname": "Spitzname verwenden",
                "useFirstName": "Vorname verwenden",
                "useFullName": "Vollständiger Name",
                "publicProfile": "Öffentliches Profil",
                "accountSettings": "Konto-Einstellungen",
                "security": "Sicherheit",
                "privacy": "Datenschutz"
            },
            // Dashboard
            "dashboard": {
                "welcome": "Willkommen",
                "overview": "Übersicht",
                "recentActivity": "Letzte Aktivitäten",
                "statistics": "Statistiken",
                "performance": "Leistung",
                "goals": "Ziele",
                "achievements": "Erfolge"
            },
            // Settings
            "settings": {
                "general": "Allgemein",
                "appearance": "Erscheinungsbild",
                "language": "Sprache",
                "theme": "Design",
                "light": "Hell",
                "dark": "Dunkel",
                "system": "System"
            },
            // Common
            "common": {
                "save": "Speichern",
                "cancel": "Abbrechen",
                "confirm": "Bestätigen",
                "delete": "Löschen",
                "edit": "Bearbeiten",
                "close": "Schließen",
                "back": "Zurück",
                "next": "Weiter",
                "previous": "Zurück",
                "submit": "Absenden",
                "loading": "Laden...",
                "error": "Fehler",
                "success": "Erfolgreich",
                "warning": "Warnung",
                "info": "Information"
            }
        }
    },
    en: {
        translation: {
            // Navigation
            "navigation": {
                "dashboard": "Dashboard",
                "scoreboard": "Scoreboard",
                "stats": "Statistics",
                "training": "Training",
                "profile": "Profile",
                "admin": "Admin",
                "settings": "Settings",
                "logout": "Logout",
                "friends": "Friends"
            },
            // Auth
            "auth": {
                "login": "Login",
                "register": "Register",
                "logout": "Logout",
                "email": "Email",
                "password": "Password",
                "confirmPassword": "Confirm Password",
                "firstName": "First Name",
                "lastName": "Last Name",
                "nickname": "Nickname",
                "forgotPassword": "Forgot Password?",
                "resetPassword": "Reset Password",
                "backToLogin": "Back to Login",
                "createAccount": "Create Account",
                "alreadyHaveAccount": "Already have an account?",
                "noAccount": "Don't have an account?",
                "enable2FA": "Enable 2FA",
                "disable2FA": "Disable 2FA",
                "twoFactorCode": "2FA Code",
                "verifyEmail": "Verify Email",
                "resendVerification": "Resend Verification",
                "emailVerified": "Email Verified",
                "inviteUsers": "Invite Users",
                "deleteAccount": "Delete Account",
                "confirmDelete": "Confirm Deletion"
            },
            // Profile
            "profile": {
                "personalInfo": "Personal Information",
                "displayPreferences": "Display Preferences",
                "displayName": "Display Name",
                "useNickname": "Use Nickname",
                "useFirstName": "Use First Name",
                "useFullName": "Use Full Name",
                "publicProfile": "Public Profile",
                "accountSettings": "Account Settings",
                "security": "Security",
                "privacy": "Privacy"
            },
            // Dashboard
            "dashboard": {
                "welcome": "Welcome",
                "overview": "Overview",
                "recentActivity": "Recent Activity",
                "statistics": "Statistics",
                "performance": "Performance",
                "goals": "Goals",
                "achievements": "Achievements"
            },
            // Settings
            "settings": {
                "general": "General",
                "appearance": "Appearance",
                "language": "Language",
                "theme": "Theme",
                "light": "Light",
                "dark": "Dark",
                "system": "System"
            },
            // Common
            "common": {
                "save": "Save",
                "cancel": "Cancel",
                "confirm": "Confirm",
                "delete": "Delete",
                "edit": "Edit",
                "close": "Close",
                "back": "Back",
                "next": "Next",
                "previous": "Previous",
                "submit": "Submit",
                "loading": "Loading...",
                "error": "Error",
                "success": "Success",
                "warning": "Warning",
                "info": "Information"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'de',
        lng: 'de', // default language
        debug: false,

        interpolation: {
            escapeValue: false // React already does escaping
        },

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage']
        }
    });

export default i18n; 