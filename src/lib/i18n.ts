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
                "achievements": "Erfolge",
                "title": "Dashboard",
                "subtitle": "Deine sportlichen Fortschritte auf einen Blick",
                "loadingProgress": "Lädt deine sportlichen Fortschritte...",
                "totalPoints": "Gesamtpunkte",
                "pullups": "Klimmzüge",
                "runningDistance": "Laufdistanz",
                "rank": "Rang",
                "thisWeek": "diese Woche",
                "ofAthletes": "von {{count}} Athleten",
                "weeklyGoals": "Wochenziele",
                "goal": "Ziel",
                "pushups": "Liegestütze",
                "running": "Laufen",
                "cycling": "Radfahren",
                "error": "Fehler",
                "errorLoadingData": "Fehler beim Laden der Dashboard-Daten",
                "errorLoadingWorkouts": "Die letzten Workouts konnten nicht geladen werden.",
                "pleaseLoginWorkouts": "Bitte melde dich an, um deine letzten Workouts zu sehen.",
                "unexpectedFormat": "Unerwartetes Datenformat für Workouts erhalten.",
                "workoutsNotLoaded": "Letzte Workouts konnten nicht geladen werden.",
                "activityTypes": {
                    "pullup": "Klimmzüge",
                    "pushup": "Liegestütze",
                    "running": "Laufen",
                    "cycling": "Radfahren"
                },
                "timeAgo": {
                    "minutes": "vor {{count}} Minuten",
                    "hours": "vor {{count}} Stunden",
                    "yesterday": "gestern",
                    "days": "vor {{count}} Tagen"
                }
            },
            // Weekly Challenge
            "weeklyChallenge": {
                "title": "Wochen-Challenge",
                "pleaseLogin": "Melde dich an, um an der wöchentlichen Challenge teilzunehmen und Punkte zu sammeln.",
                "errorLoading": "Fehler beim Laden der Wochen-Challenge",
                "couldNotLoad": "Die Wochen-Challenge konnte nicht geladen werden.",
                "noData": "Aktuell liegen keine Challenge-Daten vor. Starte ein Workout, um Fortschritte zu sammeln!",
                "completed": "Geschafft",
                "day": "Tag",
                "days": "Tage",
                "points": "Punkte",
                "workoutsThisWeek": "{{count}} Workouts diese Woche",
                "progress": "Fortschritt",
                "leaderboard": "Leaderboard",
                "collectPoints": "Sammle Punkte, um in die Top 10 zu kommen",
                "bonusPointsSecured": "Bonuspunkte gesichert",
                "noActivitiesYet": "Noch keine Aktivitäten in dieser Woche. Sei der Erste und sammle Punkte!",
                "you": "Du",
                "kmRunning": "km Laufen",
                "pullUps": "Pull-ups"
            },
            // Activity Feed
            "activityFeed": {
                "title": "Aktivitäten der Freunde",
                "pleaseLogin": "Bitte melde dich an, um Aktivitäten zu sehen.",
                "unexpectedFormat": "Unerwartetes Datenformat vom Server.",
                "couldNotLoad": "Aktivitäten konnten nicht geladen werden.",
                "errorLoading": "Der Activity Feed konnte nicht geladen werden.",
                "noActivities": "Keine Aktivitäten von Freunden",
                "addFriends": "Füge Freunde hinzu, um ihre Workouts zu sehen!",
                "points": "Punkte",
                "repetitions": "Wiederholungen",
                "units": "Einheiten",
                "inWorkout": "in \"{{title}}\"",
                "timeAgoShort": {
                    "minutes": "vor {{count}} Min",
                    "hours": "vor {{count}}h",
                    "yesterday": "gestern",
                    "days": "vor {{count}}d"
                },
                "activityTypes": {
                    "pullups": "Klimmzüge",
                    "pushups": "Liegestütze",
                    "situps": "Sit-ups",
                    "running": "Laufen",
                    "cycling": "Radfahren",
                    "other": "Sonstiges",
                    "unknown": "Unbekannte Aktivität"
                }
            },
            // Scoreboard
            "scoreboard": {
                "title": "Scoreboard",
                "subtitle": "Vergleiche deine Leistungen mit anderen Athleten",
                "mustBeLoggedIn": "Du musst angemeldet sein, um das Scoreboard zu sehen.",
                "leaderboard": "Rangliste",
                "errorLoading": "Fehler beim Laden des Scoreboards",
                "noData": "Keine Daten für diese Rangliste vorhanden.",
                "participateToAppear": "Nimm an Workouts teil, um in der Rangliste zu erscheinen.",
                "activityTypes": {
                    "all": "Alle",
                    "pullups": "Klimmzüge",
                    "pushups": "Liegestütze",
                    "running": "Laufen",
                    "cycling": "Radfahren",
                    "situps": "Sit-ups",
                    "other": "Sonstiges"
                },
                "periods": {
                    "all": "Gesamt",
                    "week": "Letzte 7 Tage",
                    "month": "Letzte 30 Tage",
                    "year": "Letztes Jahr"
                },
                "units": {
                    "repetitions": "Wdh.",
                    "kilometers": "km",
                    "units": "Einheiten",
                    "points": "Punkte"
                },
                "stats": {
                    "pullups": "Klimmzüge",
                    "pushups": "Liegestütze",
                    "running": "Laufen"
                }
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
            // Landing Page
            "landing": {
                "settings": "Einstellungen",
                "openSettings": "Einstellungen öffnen",
                "language": "Sprache",
                "theme": "Design",
                "contact": "Kontakt",
                "login": "Anmelden",
                "register": "Registrieren",
                "registerShort": "Reg.",
                "newFeature": "Neu: Multi-Language Support",
                "heroTitle": "Deine ultimative",
                "heroSubtitle": "Sports Analytics",
                "heroSubtitle2": "Plattform",
                "heroDescription": "Tracke deine Workouts, analysiere deine Fortschritte und erreiche deine Fitnessziele mit der modernsten Sports Analytics Plattform.",
                "startFree": "Kostenlos starten",
                "contactUs": "Kontakt aufnehmen",
                "noCreditCard": "Keine Kreditkarte erforderlich",
                "secure": "100% sicher",
                "startNow": "Sofort loslegen",
                "features": "Features",
                "featuresTitle": "Alles was du brauchst",
                "featuresDescription": "Von Live-Tracking bis zu detaillierten Analytics - Sportify bietet alle Tools für deinen Fitness-Erfolg.",
                "testimonials": "Testimonials",
                "testimonialsTitle": "Was unsere Nutzer sagen",
                "testimonialsDescription": "Tausende von Athleten vertrauen bereits auf Sportify",
                "ctaBadge": "Jetzt starten",
                "ctaTitle": "Bereit durchzustarten?",
                "ctaDescription": "Schließe dich tausenden von Athleten an und beginne noch heute deine Fitness-Reise mit Sportify.",
                "ctaButton": "Jetzt kostenlos registrieren",
                "freeStart": "Kostenlos starten",
                "noCommitment": "Keine Bindung",
                "startImmediately": "Sofort loslegen",
                "footerDescription": "Die moderne Sports Analytics Plattform für ambitionierte Athleten.",
                "footerDeveloped": "Entwickelt mit",
                "footerBy": "von Leon Stadler.",
                "footerFeatures": "Features",
                "footerDeveloper": "Entwickler",
                "footerLegal": "Rechtliches",
                "footerCopyright": "© 2024 Sportify. Alle Rechte vorbehalten. Entwickelt von Leon Stadler.",
                "featuresList": {
                    "liveScoreboard": "Live Scoreboard",
                    "workoutTracking": "Workout Tracking",
                    "statistics": "Statistiken & Analytics",
                    "community": "Community Features"
                },
                "footerTech": {
                    "react": "React & TypeScript",
                    "modern": "Moderne Web-Technologien",
                    "opensource": "Open Source Komponenten"
                },
                "footerLinks": {
                    "privacy": "Datenschutz",
                    "terms": "AGB",
                    "imprint": "Impressum",
                    "contact": "Kontakt"
                },
                "featureTitles": {
                    "detailedStats": "Detaillierte Statistiken",
                    "realtime": "Echtzeit Updates",
                    "secure": "Sichere Daten",
                    "mobile": "Mobile First"
                },
                "featureDescriptions": {
                    "liveScoreboard": "Verfolge deine Leistungen in Echtzeit und vergleiche dich mit anderen Athleten.",
                    "detailedStats": "Analysiere deine Fortschritte mit umfassenden Charts und Metriken.",
                    "community": "Verbinde dich mit Freunden, lade sie ein und motiviert euch gegenseitig.",
                    "realtime": "Erhalte sofortige Updates über deine Aktivitäten und Erfolge.",
                    "secure": "Deine persönlichen Daten sind mit modernster Verschlüsselung geschützt.",
                    "mobile": "Perfekt optimiert für mobile Geräte - trainiere und tracke überall."
                }
            },
            // Auth Pages
            "authPages": {
                "backToHome": "Zurück zur Startseite",
                "welcomeBack": "Willkommen zurück!",
                "continueJourney": "Melde dich an, um deine Fitness-Reise fortzusetzen",
                "startFree": "Jetzt kostenfrei starten!",
                "createAccount": "Erstelle dein Sportify-Konto und beginne deine Fitness-Reise",
                "emailVerification": {
                    "backToLogin": "Zur Anmeldung",
                    "emailVerified": "E-Mail erfolgreich verifiziert!",
                    "accountActivated": "Ihr Sportify-Konto ist jetzt vollständig aktiviert. Sie können sich jetzt anmelden und alle Features nutzen.",
                    "loginNow": "Jetzt anmelden",
                    "backToHome": "Zur Startseite",
                    "verifyTitle": "E-Mail-Adresse bestätigen",
                    "verifying": "Ihre E-Mail wird verifiziert...",
                    "checkInbox": "Überprüfen Sie Ihr Postfach und klicken Sie auf den Bestätigungslink.",
                    "resendTitle": "Bestätigungs-E-Mail erneut senden",
                    "resendDescription": "Senden Sie die Bestätigungs-E-Mail erneut an {{email}}",
                    "resendDescriptionAlt": "Haben Sie keine E-Mail erhalten? Senden Sie eine neue Bestätigung.",
                    "emailLabel": "E-Mail-Adresse",
                    "emailPlaceholder": "ihre@email.com",
                    "checkSpam": "Überprüfen Sie auch Ihren Spam-Ordner. Die E-Mail kann bis zu 5 Minuten dauern.",
                    "sending": "Wird gesendet...",
                    "resendCountdown": "Erneut senden ({{count}}s)",
                    "resendButton": "Bestätigungs-E-Mail senden",
                    "invalidLink": "Der Verifizierungslink ist ungültig oder abgelaufen. Fordern Sie einen neuen Link an.",
                    "requestNewLink": "Neuen Link anfordern",
                    "alreadyVerified": "Bereits verifiziert?",
                    "loginHere": "Hier anmelden"
                },
                "forgotPassword": {
                    "backToLogin": "Zurück zur Anmeldung",
                    "title": "Passwort vergessen?",
                    "description": "Kein Problem! Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.",
                    "resetTitle": "Passwort zurücksetzen",
                    "resetDescription": "Geben Sie die E-Mail-Adresse Ihres Kontos ein",
                    "sending": "Wird gesendet...",
                    "sendResetLink": "Reset-Link senden",
                    "emailSent": "E-Mail versendet!",
                    "checkEmail": "Wir haben eine E-Mail an {{email}} gesendet. Überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen zum Zurücksetzen Ihres Passworts.",
                    "noEmailReceived": "Haben Sie keine E-Mail erhalten? Überprüfen Sie auch Ihren Spam-Ordner oder versuchen Sie es erneut.",
                    "tryAgain": "versuchen Sie es erneut",
                    "rememberPassword": "Erinnern Sie sich wieder an Ihr Passwort?",
                    "loginHere": "Hier anmelden"
                },
                "resetPassword": {
                    "backToLogin": "Zurück zur Anmeldung",
                    "title": "Passwort zurücksetzen",
                    "description": "Geben Sie Ihr neues Passwort ein",
                    "emailRequestTitle": "Passwort zurücksetzen",
                    "emailRequestDescription": "Kein Problem! Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.",
                    "resetTitle": "Neues Passwort festlegen",
                    "resetDescription": "Ihr neues Passwort muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben sowie eine Zahl enthalten.",
                    "passwordPlaceholder": "Neues Passwort",
                    "confirmPasswordPlaceholder": "Passwort bestätigen",
                    "passwordRequirements": "Mindestens 8 Zeichen, Groß- und Kleinbuchstaben sowie eine Zahl",
                    "tokenExpires": "Dieser Link ist nur für eine begrenzte Zeit gültig. Bitte setzen Sie Ihr Passwort bald zurück.",
                    "resetting": "Passwort wird zurückgesetzt...",
                    "resetButton": "Passwort zurücksetzen",
                    "sending": "Wird gesendet...",
                    "sendResetLink": "Reset-Link senden",
                    "emailSent": "E-Mail versendet!",
                    "checkEmail": "Wir haben eine E-Mail an {{email}} gesendet. Überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen zum Zurücksetzen Ihres Passworts.",
                    "noEmailReceived": "Haben Sie keine E-Mail erhalten? Überprüfen Sie auch Ihren Spam-Ordner oder versuchen Sie es erneut.",
                    "tryAgain": "versuchen Sie es erneut",
                    "passwordResetSuccess": "Passwort erfolgreich zurückgesetzt!",
                    "canLoginNow": "Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.",
                    "loginNow": "Jetzt anmelden",
                    "backToHome": "Zurück zur Startseite",
                    "rememberPassword": "Passwort wieder im Kopf?",
                    "loginHere": "Hier anmelden",
                    "missingToken": "Ungültiger oder fehlender Token",
                    "requestNewLink": "Bitte fordern Sie einen neuen Link an",
                    "invalidToken": "Ungültiger oder abgelaufener Token",
                    "resetFailed": "Passwort konnte nicht zurückgesetzt werden"
                },
                "twoFactor": {
                    "backToLogin": "Zurück zur Anmeldung",
                    "title": "Zwei-Faktor-Authentifizierung",
                    "description": "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein, um die Anmeldung abzuschließen.",
                    "enterCode": "Sicherheitscode eingeben",
                    "codeRegenerates": "Der Code wird alle 30 Sekunden neu generiert",
                    "sixDigitCode": "6-stelliger Code",
                    "codePlaceholder": "000000",
                    "verifying": "Wird verifiziert...",
                    "verifyCode": "Code verifizieren",
                    "requestNewCode": "Neuen Code anfordern",
                    "requestNewCodeCountdown": "Neuen Code anfordern ({{count}}s)",
                    "problems": "Probleme mit der Authentifizierung?",
                    "contactUs": "Kontaktieren Sie uns"
                }
            },
            // Contact Page
            "contact": {
                "back": "Zurück",
                "title": "Kontakt",
                "contactUs": "Kontaktieren Sie uns",
                "description": "Haben Sie Fragen zu Sportify? Wir sind hier um zu helfen! Senden Sie uns eine Nachricht und wir melden uns schnellstmöglich bei Ihnen.",
                "contactInfo": "Kontaktinformationen",
                "contactWays": "Verschiedene Wege um mit uns in Kontakt zu treten",
                "email": "E-Mail",
                "phone": "Telefon",
                "address": "Adresse",
                "responseTime": "Antwortzeit: Wir antworten normalerweise innerhalb von 24 Stunden",
                "sendMessage": "Nachricht senden",
                "formDescription": "Füllen Sie das Formular aus und wir melden uns bei Ihnen",
                "name": "Name",
                "namePlaceholder": "Ihr vollständiger Name",
                "subject": "Betreff",
                "subjectPlaceholder": "Worum geht es in Ihrer Nachricht?",
                "message": "Nachricht",
                "messagePlaceholder": "Schreiben Sie hier Ihre Nachricht...",
                "privacyNote": "Mit dem Absenden stimmen Sie zu, dass wir Ihre Daten zur Bearbeitung Ihrer Anfrage verwenden. Weitere Informationen finden Sie in unserer",
                "privacyLink": "Datenschutzerklärung",
                "sending": "Wird gesendet...",
                "sendMessageButton": "Nachricht senden",
                "messageSent": "Nachricht erfolgreich versendet!",
                "thankYouMessage": "Vielen Dank für Ihre Nachricht. Wir melden uns bald bei Ihnen.",
                "faqTitle": "Häufig gestellte Fragen",
                "faq": {
                    "freeTitle": "Ist Sportify kostenlos?",
                    "freeAnswer": "Ja, Sportify bietet eine kostenlose Grundversion mit allen wichtigen Features. Premium-Features werden in Zukunft verfügbar sein.",
                    "secureTitle": "Wie sicher sind meine Daten?",
                    "secureAnswer": "Ihre Daten werden mit modernster Verschlüsselung geschützt und niemals an Dritte weitergegeben. Datenschutz hat für uns höchste Priorität.",
                    "devicesTitle": "Welche Geräte werden unterstützt?",
                    "devicesAnswer": "Sportify funktioniert auf allen modernen Browsern und ist vollständig responsive für Desktop, Tablet und Smartphone optimiert.",
                    "deleteTitle": "Kann ich mein Konto jederzeit löschen?",
                    "deleteAnswer": "Ja, Sie können Ihr Konto jederzeit vollständig löschen. Alle Ihre Daten werden dabei unwiderruflich entfernt."
                }
            },
            // Legal Pages
            "legal": {
                "backToHome": "Zurück zur Startseite",
                "disclaimer": {
                    "title": "Rechtlicher Hinweis",
                    "germanLawApplies": "Diese Website unterliegt ausschließlich deutschem Recht.",
                    "translationOnly": "Die englische Version dieser Seiten ist nur eine Übersetzung und dient lediglich der besseren Verständlichkeit.",
                    "germanVersionValid": "Rechtlich verbindlich ist ausschließlich die deutsche Version."
                },
                "languageNote": "Diese Seite ist auf Deutsch und Englisch verfügbar. Die deutsche Version ist rechtlich verbindlich."
            },
            // Privacy Policy
            "privacy": {
                "title": "Datenschutzerklärung",
                "lastUpdated": "Zuletzt aktualisiert",
                "overview": {
                    "title": "1. Übersicht",
                    "content": "Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung informiert Sie über die Erhebung, Verarbeitung und Nutzung Ihrer personenbezogenen Daten bei der Nutzung unserer Sportify-Plattform.",
                    "responsibility": "Verantwortlicher für die Datenverarbeitung ist Leon Stadler."
                },
                "dataCollection": {
                    "title": "2. Datenerhebung",
                    "types": {
                        "title": "2.1 Arten der erhobenen Daten",
                        "intro": "Wir erheben folgende Kategorien von Daten:",
                        "personal": "Personenbezogene Daten (Name, E-Mail-Adresse, Profilbild)",
                        "usage": "Nutzungsdaten (Workout-Daten, Statistiken, Aktivitäten)",
                        "technical": "Technische Daten (IP-Adresse, Browser-Typ, Geräteinformationen)"
                    },
                    "purpose": {
                        "title": "2.2 Zweck der Datenerhebung",
                        "service": "Bereitstellung und Verbesserung unserer Dienste",
                        "communication": "Kommunikation mit Nutzern",
                        "improvement": "Analyse und Optimierung der Plattform",
                        "legal": "Erfüllung rechtlicher Verpflichtungen"
                    }
                },
                "dataUsage": {
                    "title": "3. Datenverwendung",
                    "content": "Ihre Daten werden ausschließlich zu den genannten Zwecken verwendet. Eine Weitergabe erfolgt nur in den nachfolgend beschriebenen Fällen:",
                    "sharing": {
                        "title": "3.1 Datenweitergabe",
                        "content": "Eine Weitergabe Ihrer Daten erfolgt nur in folgenden Fällen:",
                        "providers": "An Dienstleister, die uns bei der Bereitstellung unserer Dienste unterstützen (z.B. Hosting-Anbieter)",
                        "legal": "Wenn dies gesetzlich vorgeschrieben ist oder zur Rechtsdurchsetzung erforderlich ist",
                        "business": "Bei einer Unternehmensumstrukturierung oder -übertragung"
                    }
                },
                "cookies": {
                    "title": "4. Cookies und Tracking",
                    "content": "Wir verwenden Cookies und ähnliche Technologien, um Ihnen ein optimales Nutzererlebnis zu bieten.",
                    "types": {
                        "title": "4.1 Arten von Cookies",
                        "essential": "Notwendige Cookies: Für die Grundfunktionen der Website erforderlich",
                        "functional": "Funktionale Cookies: Speichern Ihre Präferenzen und Einstellungen",
                        "analytics": "Analyse-Cookies: Helfen uns, die Nutzung der Website zu verstehen"
                    }
                },
                "security": {
                    "title": "5. Datensicherheit",
                    "content": "Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen:",
                    "encryption": "Verschlüsselung von Datenübertragungen",
                    "access": "Zugriffskontrollen und Authentifizierung",
                    "regular": "Regelmäßige Sicherheitsüberprüfungen"
                },
                "rights": {
                    "title": "6. Ihre Rechte",
                    "intro": "Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:",
                    "access": "Auskunft über Ihre gespeicherten Daten",
                    "correction": "Berichtigung unrichtiger Daten",
                    "deletion": "Löschung Ihrer Daten",
                    "restriction": "Einschränkung der Verarbeitung",
                    "objection": "Widerspruch gegen die Verarbeitung",
                    "portability": "Datenübertragbarkeit",
                    "complaint": "Beschwerde bei einer Aufsichtsbehörde"
                },
                "retention": {
                    "title": "7. Speicherdauer",
                    "content": "Ihre Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen."
                },
                "changes": {
                    "title": "8. Änderungen dieser Datenschutzerklärung",
                    "content": "Wir behalten uns vor, diese Datenschutzerklärung anzupassen. Aktuelle Versionen finden Sie stets auf dieser Seite."
                },
                "contact": {
                    "title": "9. Kontakt",
                    "content": "Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:",
                    "email": "E-Mail"
                }
            },
            // Terms of Service
            "terms": {
                "title": "Allgemeine Geschäftsbedingungen (AGB)",
                "lastUpdated": "Zuletzt aktualisiert",
                "acceptance": {
                    "title": "1. Geltungsbereich und Annahme",
                    "content": "Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Sportify-Plattform. Durch die Registrierung und Nutzung unserer Dienste akzeptieren Sie diese AGB vollständig."
                },
                "service": {
                    "title": "2. Beschreibung der Dienstleistung",
                    "description": "Sportify ist eine Plattform zur Verfolgung und Analyse von Fitness-Aktivitäten. Wir bieten folgende Funktionen:",
                    "features": {
                        "title": "2.1 Funktionen",
                        "tracking": "Workout-Tracking und -Aufzeichnung",
                        "statistics": "Statistiken und Leistungsanalysen",
                        "community": "Community-Features und soziale Interaktion",
                        "scoreboard": "Ranglisten und Wettbewerbe"
                    }
                },
                "account": {
                    "title": "3. Benutzerkonto",
                    "registration": {
                        "title": "3.1 Registrierung",
                        "age": "Sie müssen mindestens 18 Jahre alt sein",
                        "accuracy": "Sie müssen genaue und vollständige Informationen angeben",
                        "responsibility": "Sie sind für die Sicherheit Ihres Kontos verantwortlich"
                    },
                    "security": {
                        "title": "3.2 Kontosicherheit",
                        "content": "Sie sind verantwortlich für die Geheimhaltung Ihrer Anmeldedaten. Informieren Sie uns umgehend über unbefugte Nutzung Ihres Kontos."
                    }
                },
                "usage": {
                    "title": "4. Nutzungsregeln",
                    "allowed": {
                        "title": "4.1 Erlaubte Nutzung",
                        "personal": "Persönliche Nutzung für Fitness-Tracking",
                        "lawful": "Rechtmäßige Nutzung in Übereinstimmung mit allen geltenden Gesetzen",
                        "respectful": "Respektvoller Umgang mit anderen Nutzern"
                    },
                    "prohibited": {
                        "title": "4.2 Verbotene Nutzung",
                        "illegal": "Jegliche illegale Aktivitäten",
                        "harm": "Schädigung anderer Nutzer oder der Plattform",
                        "unauthorized": "Unbefugter Zugriff auf andere Konten oder Systeme",
                        "spam": "Versenden von Spam oder unerwünschten Nachrichten",
                        "reverse": "Reverse Engineering oder Versuche, den Quellcode zu extrahieren"
                    }
                },
                "content": {
                    "title": "5. Urheberrecht und geistiges Eigentum",
                    "ownership": "Alle Rechte an der Plattform und ihren Inhalten liegen bei uns oder unseren Lizenzgebern.",
                    "userContent": "Sie behalten die Rechte an von Ihnen erstellten Inhalten, gewähren uns aber eine Lizenz zur Nutzung.",
                    "license": "Die Nutzung unserer Plattform gewährt Ihnen keine Eigentumsrechte an der Software oder den Inhalten."
                },
                "liability": {
                    "title": "6. Haftungsbeschränkung",
                    "content": "Wir haften nicht für Schäden, die durch die Nutzung unserer Plattform entstehen, soweit gesetzlich zulässig.",
                    "limitations": {
                        "title": "6.1 Haftungsausschlüsse",
                        "availability": "Wir garantieren keine ununterbrochene Verfügbarkeit der Plattform",
                        "accuracy": "Wir übernehmen keine Haftung für die Richtigkeit von Nutzerdaten",
                        "damages": "Wir haften nicht für indirekte oder Folge schäden"
                    }
                },
                "termination": {
                    "title": "7. Kündigung",
                    "user": "Sie können Ihr Konto jederzeit kündigen und löschen.",
                    "provider": "Wir behalten uns vor, Konten zu sperren oder zu löschen, die gegen diese AGB verstoßen.",
                    "effect": "Bei Kündigung werden Ihre Daten gemäß unserer Datenschutzerklärung behandelt."
                },
                "changes": {
                    "title": "8. Änderungen der AGB",
                    "content": "Wir behalten uns vor, diese AGB zu ändern. Änderungen werden auf dieser Seite veröffentlicht.",
                    "notification": "Bei wesentlichen Änderungen informieren wir Sie per E-Mail."
                },
                "governingLaw": {
                    "title": "9. Anwendbares Recht",
                    "content": "Diese AGB unterliegen deutschem Recht. Maßgeblich ist deutsches Recht.",
                    "jurisdiction": "Gerichtsstand ist, sofern gesetzlich zulässig, der Sitz des Anbieters."
                },
                "contact": {
                    "title": "10. Kontakt",
                    "content": "Bei Fragen zu diesen AGB können Sie sich an uns wenden:",
                    "email": "E-Mail"
                }
            },
            // Imprint
            "imprint": {
                "title": "Impressum",
                "lastUpdated": "Zuletzt aktualisiert",
                "responsibility": {
                    "title": "Angaben gemäß § 5 TMG",
                    "name": "Verantwortlich für den Inhalt",
                    "address": "Adresse"
                },
                "contact": {
                    "title": "Kontakt",
                    "email": "E-Mail",
                    "phone": "Telefon"
                },
                "disclaimer": {
                    "title": "Haftungsausschluss",
                    "content": {
                        "title": "Haftung für Inhalte",
                        "intro": "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.",
                        "responsibility": "Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen."
                    },
                    "links": {
                        "title": "Haftung für Links",
                        "intro": "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.",
                        "responsibility": "Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
                        "investigation": "Bei Bekanntwerden von Rechtsverstößen werden wir derartige Links umgehend entfernen."
                    }
                },
                "copyright": {
                    "title": "Urheberrecht",
                    "content": "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.",
                    "prohibition": "Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers."
                },
                "dataProtection": {
                    "title": "Datenschutz",
                    "content": "Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten erhoben werden, erfolgt dies stets im Rahmen der geltenden Datenschutzgesetze.",
                    "link": "Weitere Informationen finden Sie in unserer Datenschutzerklärung."
                }
            },
            // Validation Messages
            "validation": {
                "invalidEmail": "Ungültige E-Mail-Adresse",
                "passwordMin": "Passwort muss mindestens 6 Zeichen lang sein",
                "passwordMinLength": "Passwort muss mindestens 8 Zeichen lang sein",
                "passwordMin8": "Passwort muss mindestens 8 Zeichen lang sein",
                "passwordUpperCase": "Passwort muss mindestens einen Großbuchstaben enthalten",
                "passwordLowerCase": "Passwort muss mindestens einen Kleinbuchstaben enthalten",
                "passwordNumber": "Passwort muss mindestens eine Zahl enthalten",
                "passwordComplexity": "Passwort muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben sowie eine Zahl enthalten",
                "passwordMatch": "Passwörter stimmen nicht überein",
                "passwordsDoNotMatch": "Passwörter stimmen nicht überein",
                "nameMin": "Name muss mindestens 2 Zeichen lang sein",
                "firstNameMin": "Vorname muss mindestens 2 Zeichen lang sein",
                "lastNameMin": "Nachname muss mindestens 2 Zeichen lang sein",
                "subjectMin": "Betreff muss mindestens 5 Zeichen lang sein",
                "messageMin": "Nachricht muss mindestens 10 Zeichen lang sein",
                "passwordsNotMatch": "Passwörter stimmen nicht überein",
                "termsRequired": "Sie müssen den Nutzungsbedingungen zustimmen",
                "codeLength": "2FA-Code muss genau 6 Zeichen lang sein",
                "codeNumbers": "2FA-Code darf nur Zahlen enthalten"
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
                "info": "Information",
                "developedWith": "Entwickelt mit",
                "by": "von",
                "copyright": "© 2024 Sportify. Entwickelt mit ❤️ von Leon Stadler.",
                "displayPreview": "Anzeige:",
                "optional": "(optional)",
                "agreeTerms": "Ich stimme den",
                "termsOfService": "Nutzungsbedingungen",
                "and": "und der",
                "privacyPolicy": "Datenschutzerklärung",
                "to": "zu"
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
                "achievements": "Achievements",
                "title": "Dashboard",
                "subtitle": "Your sports progress at a glance",
                "loadingProgress": "Loading your sports progress...",
                "totalPoints": "Total Points",
                "pullups": "Pull-ups",
                "runningDistance": "Running Distance",
                "rank": "Rank",
                "thisWeek": "this week",
                "ofAthletes": "of {{count}} athletes",
                "weeklyGoals": "Weekly Goals",
                "goal": "Goal",
                "pushups": "Push-ups",
                "running": "Running",
                "cycling": "Cycling",
                "error": "Error",
                "errorLoadingData": "Error loading dashboard data",
                "errorLoadingWorkouts": "Recent workouts could not be loaded.",
                "pleaseLoginWorkouts": "Please log in to see your recent workouts.",
                "unexpectedFormat": "Unexpected data format for workouts received.",
                "workoutsNotLoaded": "Recent workouts could not be loaded.",
                "activityTypes": {
                    "pullup": "Pull-ups",
                    "pushup": "Push-ups",
                    "running": "Running",
                    "cycling": "Cycling"
                },
                "timeAgo": {
                    "minutes": "{{count}} minutes ago",
                    "hours": "{{count}} hours ago",
                    "yesterday": "yesterday",
                    "days": "{{count}} days ago"
                }
            },
            // Weekly Challenge
            "weeklyChallenge": {
                "title": "Weekly Challenge",
                "pleaseLogin": "Please log in to participate in the weekly challenge and collect points.",
                "errorLoading": "Error loading weekly challenge",
                "couldNotLoad": "The weekly challenge could not be loaded.",
                "noData": "Currently no challenge data available. Start a workout to collect progress!",
                "completed": "Completed",
                "day": "Day",
                "days": "Days",
                "points": "Points",
                "workoutsThisWeek": "{{count}} Workouts this week",
                "progress": "Progress",
                "leaderboard": "Leaderboard",
                "collectPoints": "Collect points to get into the Top 10",
                "bonusPointsSecured": "Bonus points secured",
                "noActivitiesYet": "No activities yet this week. Be the first and collect points!",
                "you": "You",
                "kmRunning": "km Running",
                "pullUps": "Pull-ups"
            },
            // Activity Feed
            "activityFeed": {
                "title": "Friends' Activities",
                "pleaseLogin": "Please log in to see activities.",
                "unexpectedFormat": "Unexpected data format from server.",
                "couldNotLoad": "Activities could not be loaded.",
                "errorLoading": "The activity feed could not be loaded.",
                "noActivities": "No activities from friends",
                "addFriends": "Add friends to see their workouts!",
                "points": "Points",
                "repetitions": "repetitions",
                "units": "units",
                "inWorkout": "in \"{{title}}\"",
                "timeAgoShort": {
                    "minutes": "{{count}} min ago",
                    "hours": "{{count}}h ago",
                    "yesterday": "yesterday",
                    "days": "{{count}}d ago"
                },
                "activityTypes": {
                    "pullups": "Pull-ups",
                    "pushups": "Push-ups",
                    "situps": "Sit-ups",
                    "running": "Running",
                    "cycling": "Cycling",
                    "other": "Other",
                    "unknown": "Unknown Activity"
                }
            },
            // Scoreboard
            "scoreboard": {
                "title": "Scoreboard",
                "subtitle": "Compare your performance with other athletes",
                "mustBeLoggedIn": "You must be logged in to view the scoreboard.",
                "leaderboard": "Leaderboard",
                "errorLoading": "Error loading scoreboard",
                "noData": "No data available for this leaderboard.",
                "participateToAppear": "Participate in workouts to appear on the leaderboard.",
                "activityTypes": {
                    "all": "All",
                    "pullups": "Pull-ups",
                    "pushups": "Push-ups",
                    "running": "Running",
                    "cycling": "Cycling",
                    "situps": "Sit-ups",
                    "other": "Other"
                },
                "periods": {
                    "all": "All Time",
                    "week": "Last 7 Days",
                    "month": "Last 30 Days",
                    "year": "Last Year"
                },
                "units": {
                    "repetitions": "Reps",
                    "kilometers": "km",
                    "units": "Units",
                    "points": "Points"
                },
                "stats": {
                    "pullups": "Pull-ups",
                    "pushups": "Push-ups",
                    "running": "Running"
                }
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
            // Landing Page
            "landing": {
                "settings": "Settings",
                "openSettings": "Open settings",
                "language": "Language",
                "theme": "Theme",
                "contact": "Contact",
                "login": "Login",
                "register": "Register",
                "registerShort": "Reg.",
                "newFeature": "New: Multi-Language Support",
                "heroTitle": "Your ultimate",
                "heroSubtitle": "Sports Analytics",
                "heroSubtitle2": "Platform",
                "heroDescription": "Track your workouts, analyze your progress and achieve your fitness goals with the most modern Sports Analytics platform.",
                "startFree": "Start free",
                "contactUs": "Contact us",
                "noCreditCard": "No credit card required",
                "secure": "100% secure",
                "startNow": "Start now",
                "features": "Features",
                "featuresTitle": "Everything you need",
                "featuresDescription": "From live tracking to detailed analytics - Sportify provides all the tools for your fitness success.",
                "testimonials": "Testimonials",
                "testimonialsTitle": "What our users say",
                "testimonialsDescription": "Thousands of athletes already trust Sportify",
                "ctaBadge": "Get started",
                "ctaTitle": "Ready to get started?",
                "ctaDescription": "Join thousands of athletes and start your fitness journey with Sportify today.",
                "ctaButton": "Register now for free",
                "freeStart": "Start free",
                "noCommitment": "No commitment",
                "startImmediately": "Start immediately",
                "footerDescription": "The modern Sports Analytics platform for ambitious athletes.",
                "footerDeveloped": "Developed with",
                "footerBy": "by Leon Stadler.",
                "footerFeatures": "Features",
                "footerDeveloper": "Developer",
                "footerLegal": "Legal",
                "footerCopyright": "© 2024 Sportify. All rights reserved. Developed by Leon Stadler.",
                "featuresList": {
                    "liveScoreboard": "Live Scoreboard",
                    "workoutTracking": "Workout Tracking",
                    "statistics": "Statistics & Analytics",
                    "community": "Community Features"
                },
                "footerTech": {
                    "react": "React & TypeScript",
                    "modern": "Modern Web Technologies",
                    "opensource": "Open Source Components"
                },
                "footerLinks": {
                    "privacy": "Privacy",
                    "terms": "Terms",
                    "imprint": "Imprint",
                    "contact": "Contact"
                },
                "featureTitles": {
                    "detailedStats": "Detailed Statistics",
                    "realtime": "Real-time Updates",
                    "secure": "Secure Data",
                    "mobile": "Mobile First"
                },
                "featureDescriptions": {
                    "liveScoreboard": "Track your performance in real-time and compare yourself with other athletes.",
                    "detailedStats": "Analyze your progress with comprehensive charts and metrics.",
                    "community": "Connect with friends, invite them and motivate each other.",
                    "realtime": "Get instant updates about your activities and achievements.",
                    "secure": "Your personal data is protected with state-of-the-art encryption.",
                    "mobile": "Perfectly optimized for mobile devices - train and track anywhere."
                }
            },
            // Auth Pages
            "authPages": {
                "backToHome": "Back to homepage",
                "welcomeBack": "Welcome back!",
                "continueJourney": "Sign in to continue your fitness journey",
                "startFree": "Start free now!",
                "createAccount": "Create your Sportify account and start your fitness journey",
                "emailVerification": {
                    "backToLogin": "Back to login",
                    "emailVerified": "Email successfully verified!",
                    "accountActivated": "Your Sportify account is now fully activated. You can now sign in and use all features.",
                    "loginNow": "Login now",
                    "backToHome": "Back to homepage",
                    "verifyTitle": "Confirm email address",
                    "verifying": "Your email is being verified...",
                    "checkInbox": "Check your inbox and click on the confirmation link.",
                    "resendTitle": "Resend confirmation email",
                    "resendDescription": "Resend the confirmation email to {{email}}",
                    "resendDescriptionAlt": "Didn't receive an email? Send a new confirmation.",
                    "emailLabel": "Email address",
                    "emailPlaceholder": "your@email.com",
                    "checkSpam": "Also check your spam folder. The email may take up to 5 minutes.",
                    "sending": "Sending...",
                    "resendCountdown": "Resend ({{count}}s)",
                    "resendButton": "Send confirmation email",
                    "invalidLink": "The verification link is invalid or expired. Request a new link.",
                    "requestNewLink": "Request new link",
                    "alreadyVerified": "Already verified?",
                    "loginHere": "Login here"
                },
                "forgotPassword": {
                    "backToLogin": "Back to login",
                    "title": "Forgot password?",
                    "description": "No problem! Enter your email address and we'll send you a reset link.",
                    "resetTitle": "Reset password",
                    "resetDescription": "Enter your account email address",
                    "sending": "Sending...",
                    "sendResetLink": "Send reset link",
                    "emailSent": "Email sent!",
                    "checkEmail": "We have sent an email to {{email}}. Check your inbox and follow the instructions to reset your password.",
                    "noEmailReceived": "Didn't receive an email? Also check your spam folder or try again.",
                    "tryAgain": "try again",
                    "rememberPassword": "Remember your password?",
                    "loginHere": "Login here"
                },
                "resetPassword": {
                    "backToLogin": "Back to login",
                    "title": "Reset password",
                    "description": "Enter your new password",
                    "emailRequestTitle": "Reset password",
                    "emailRequestDescription": "No problem! Enter your email address and we'll send you a reset link.",
                    "resetTitle": "Set new password",
                    "resetDescription": "Your new password must be at least 8 characters long and contain uppercase and lowercase letters as well as a number.",
                    "passwordPlaceholder": "New password",
                    "confirmPasswordPlaceholder": "Confirm password",
                    "passwordRequirements": "At least 8 characters, uppercase and lowercase letters and a number",
                    "tokenExpires": "This link is only valid for a limited time. Please reset your password soon.",
                    "resetting": "Resetting password...",
                    "resetButton": "Reset password",
                    "sending": "Sending...",
                    "sendResetLink": "Send reset link",
                    "emailSent": "Email sent!",
                    "checkEmail": "We have sent an email to {{email}}. Check your inbox and follow the instructions to reset your password.",
                    "noEmailReceived": "Didn't receive an email? Also check your spam folder or try again.",
                    "tryAgain": "try again",
                    "passwordResetSuccess": "Password reset successfully!",
                    "canLoginNow": "Your password has been successfully changed. You can now log in with your new password.",
                    "loginNow": "Login now",
                    "backToHome": "Back to homepage",
                    "rememberPassword": "Remember your password?",
                    "loginHere": "Login here",
                    "missingToken": "Invalid or missing token",
                    "requestNewLink": "Please request a new link",
                    "invalidToken": "Invalid or expired token",
                    "resetFailed": "Password could not be reset"
                },
                "twoFactor": {
                    "backToLogin": "Back to login",
                    "title": "Two-Factor Authentication",
                    "description": "Enter the 6-digit code from your authenticator app to complete the login.",
                    "enterCode": "Enter security code",
                    "codeRegenerates": "The code regenerates every 30 seconds",
                    "sixDigitCode": "6-digit code",
                    "codePlaceholder": "000000",
                    "verifying": "Verifying...",
                    "verifyCode": "Verify code",
                    "requestNewCode": "Request new code",
                    "requestNewCodeCountdown": "Request new code ({{count}}s)",
                    "problems": "Problems with authentication?",
                    "contactUs": "Contact us"
                }
            },
            // Contact Page
            "contact": {
                "back": "Back",
                "title": "Contact",
                "contactUs": "Contact us",
                "description": "Do you have questions about Sportify? We're here to help! Send us a message and we'll get back to you as soon as possible.",
                "contactInfo": "Contact information",
                "contactWays": "Different ways to get in touch with us",
                "email": "Email",
                "phone": "Phone",
                "address": "Address",
                "responseTime": "Response time: We usually respond within 24 hours",
                "sendMessage": "Send message",
                "formDescription": "Fill out the form and we'll get back to you",
                "name": "Name",
                "namePlaceholder": "Your full name",
                "subject": "Subject",
                "subjectPlaceholder": "What is your message about?",
                "message": "Message",
                "messagePlaceholder": "Write your message here...",
                "privacyNote": "By submitting, you agree that we use your data to process your request. For more information, see our",
                "privacyLink": "Privacy Policy",
                "sending": "Sending...",
                "sendMessageButton": "Send message",
                "messageSent": "Message sent successfully!",
                "thankYouMessage": "Thank you for your message. We will get back to you soon.",
                "faqTitle": "Frequently asked questions",
                "faq": {
                    "freeTitle": "Is Sportify free?",
                    "freeAnswer": "Yes, Sportify offers a free basic version with all important features. Premium features will be available in the future.",
                    "secureTitle": "How secure is my data?",
                    "secureAnswer": "Your data is protected with state-of-the-art encryption and never shared with third parties. Data protection is our top priority.",
                    "devicesTitle": "Which devices are supported?",
                    "devicesAnswer": "Sportify works on all modern browsers and is fully responsive optimized for desktop, tablet and smartphone.",
                    "deleteTitle": "Can I delete my account at any time?",
                    "deleteAnswer": "Yes, you can delete your account completely at any time. All your data will be permanently removed."
                }
            },
            // Validation Messages
            "validation": {
                "invalidEmail": "Invalid email address",
                "passwordMin": "Password must be at least 6 characters long",
                "passwordMinLength": "Password must be at least 8 characters long",
                "passwordMin8": "Password must be at least 8 characters long",
                "passwordUpperCase": "Password must contain at least one uppercase letter",
                "passwordLowerCase": "Password must contain at least one lowercase letter",
                "passwordNumber": "Password must contain at least one number",
                "passwordComplexity": "Password must be at least 8 characters long and contain uppercase and lowercase letters as well as a number",
                "passwordMatch": "Passwords do not match",
                "passwordsDoNotMatch": "Passwords do not match",
                "nameMin": "Name must be at least 2 characters long",
                "firstNameMin": "First name must be at least 2 characters long",
                "lastNameMin": "Last name must be at least 2 characters long",
                "subjectMin": "Subject must be at least 5 characters long",
                "messageMin": "Message must be at least 10 characters long",
                "passwordsNotMatch": "Passwords do not match",
                "termsRequired": "You must agree to the terms of service",
                "codeLength": "2FA code must be exactly 6 characters long",
                "codeNumbers": "2FA code may only contain numbers"
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
                "info": "Information",
                "developedWith": "Developed with",
                "by": "by",
                "copyright": "© 2024 Sportify. Developed with ❤️ by Leon Stadler.",
                "displayPreview": "Display:",
                "optional": "(optional)",
                "agreeTerms": "I agree to the",
                "termsOfService": "Terms of Service",
                "and": "and the",
                "privacyPolicy": "Privacy Policy",
                "to": ""
            },
            // Legal Pages
            "legal": {
                "backToHome": "Back to homepage",
                "disclaimer": {
                    "title": "Legal Notice",
                    "germanLawApplies": "This website is subject exclusively to German law.",
                    "translationOnly": "The English version of these pages is only a translation and serves merely for better understanding.",
                    "germanVersionValid": "Legally binding is exclusively the German version."
                },
                "languageNote": "This page is available in German and English. The German version is legally binding."
            },
            // Privacy Policy
            "privacy": {
                "title": "Privacy Policy",
                "lastUpdated": "Last updated",
                "overview": {
                    "title": "1. Overview",
                    "content": "The protection of your personal data is important to us. This privacy policy informs you about the collection, processing and use of your personal data when using our Sportify platform.",
                    "responsibility": "The person responsible for data processing is Leon Stadler."
                },
                "dataCollection": {
                    "title": "2. Data Collection",
                    "types": {
                        "title": "2.1 Types of Data Collected",
                        "intro": "We collect the following categories of data:",
                        "personal": "Personal data (name, email address, profile picture)",
                        "usage": "Usage data (workout data, statistics, activities)",
                        "technical": "Technical data (IP address, browser type, device information)"
                    },
                    "purpose": {
                        "title": "2.2 Purpose of Data Collection",
                        "service": "Provision and improvement of our services",
                        "communication": "Communication with users",
                        "improvement": "Analysis and optimization of the platform",
                        "legal": "Fulfillment of legal obligations"
                    }
                },
                "dataUsage": {
                    "title": "3. Data Usage",
                    "content": "Your data is used exclusively for the stated purposes. Disclosure occurs only in the cases described below:",
                    "sharing": {
                        "title": "3.1 Data Sharing",
                        "content": "Your data will only be shared in the following cases:",
                        "providers": "To service providers who support us in providing our services (e.g. hosting providers)",
                        "legal": "If required by law or necessary for law enforcement",
                        "business": "In case of a business restructuring or transfer"
                    }
                },
                "cookies": {
                    "title": "4. Cookies and Tracking",
                    "content": "We use cookies and similar technologies to provide you with an optimal user experience.",
                    "types": {
                        "title": "4.1 Types of Cookies",
                        "essential": "Essential cookies: Required for basic website functions",
                        "functional": "Functional cookies: Store your preferences and settings",
                        "analytics": "Analytics cookies: Help us understand website usage"
                    }
                },
                "security": {
                    "title": "5. Data Security",
                    "content": "We use technical and organizational measures to protect your data:",
                    "encryption": "Encryption of data transmissions",
                    "access": "Access controls and authentication",
                    "regular": "Regular security reviews"
                },
                "rights": {
                    "title": "6. Your Rights",
                    "intro": "You have the following rights regarding your personal data:",
                    "access": "Access to your stored data",
                    "correction": "Correction of incorrect data",
                    "deletion": "Deletion of your data",
                    "restriction": "Restriction of processing",
                    "objection": "Objection to processing",
                    "portability": "Data portability",
                    "complaint": "Complaint to a supervisory authority"
                },
                "retention": {
                    "title": "7. Retention Period",
                    "content": "Your data will only be stored for as long as necessary for the stated purposes or legal retention periods apply."
                },
                "changes": {
                    "title": "8. Changes to this Privacy Policy",
                    "content": "We reserve the right to adapt this privacy policy. Current versions can always be found on this page."
                },
                "contact": {
                    "title": "9. Contact",
                    "content": "If you have questions about data protection, you can contact us at any time:",
                    "email": "Email"
                }
            },
            // Terms of Service
            "terms": {
                "title": "Terms of Service",
                "lastUpdated": "Last updated",
                "acceptance": {
                    "title": "1. Scope and Acceptance",
                    "content": "These Terms of Service (ToS) govern the use of the Sportify platform. By registering and using our services, you fully accept these ToS."
                },
                "service": {
                    "title": "2. Description of Service",
                    "description": "Sportify is a platform for tracking and analyzing fitness activities. We offer the following features:",
                    "features": {
                        "title": "2.1 Features",
                        "tracking": "Workout tracking and recording",
                        "statistics": "Statistics and performance analyses",
                        "community": "Community features and social interaction",
                        "scoreboard": "Leaderboards and competitions"
                    }
                },
                "account": {
                    "title": "3. User Account",
                    "registration": {
                        "title": "3.1 Registration",
                        "age": "You must be at least 18 years old",
                        "accuracy": "You must provide accurate and complete information",
                        "responsibility": "You are responsible for the security of your account"
                    },
                    "security": {
                        "title": "3.2 Account Security",
                        "content": "You are responsible for keeping your login credentials confidential. Inform us immediately of any unauthorized use of your account."
                    }
                },
                "usage": {
                    "title": "4. Usage Rules",
                    "allowed": {
                        "title": "4.1 Permitted Use",
                        "personal": "Personal use for fitness tracking",
                        "lawful": "Lawful use in accordance with all applicable laws",
                        "respectful": "Respectful interaction with other users"
                    },
                    "prohibited": {
                        "title": "4.2 Prohibited Use",
                        "illegal": "Any illegal activities",
                        "harm": "Harming other users or the platform",
                        "unauthorized": "Unauthorized access to other accounts or systems",
                        "spam": "Sending spam or unwanted messages",
                        "reverse": "Reverse engineering or attempts to extract source code"
                    }
                },
                "content": {
                    "title": "5. Copyright and Intellectual Property",
                    "ownership": "All rights to the platform and its contents belong to us or our licensors.",
                    "userContent": "You retain the rights to content you create, but grant us a license to use it.",
                    "license": "Using our platform does not grant you ownership rights to the software or content."
                },
                "liability": {
                    "title": "6. Liability Limitation",
                    "content": "We are not liable for damages arising from the use of our platform, to the extent permitted by law.",
                    "limitations": {
                        "title": "6.1 Liability Exclusions",
                        "availability": "We do not guarantee uninterrupted availability of the platform",
                        "accuracy": "We assume no liability for the accuracy of user data",
                        "damages": "We are not liable for indirect or consequential damages"
                    }
                },
                "termination": {
                    "title": "7. Termination",
                    "user": "You can cancel and delete your account at any time.",
                    "provider": "We reserve the right to block or delete accounts that violate these ToS.",
                    "effect": "Upon termination, your data will be handled according to our privacy policy."
                },
                "changes": {
                    "title": "8. Changes to ToS",
                    "content": "We reserve the right to change these ToS. Changes will be published on this page.",
                    "notification": "For significant changes, we will notify you by email."
                },
                "governingLaw": {
                    "title": "9. Applicable Law",
                    "content": "These ToS are subject to German law. German law is decisive.",
                    "jurisdiction": "The place of jurisdiction is, if legally permissible, the seat of the provider."
                },
                "contact": {
                    "title": "10. Contact",
                    "content": "If you have questions about these ToS, you can contact us:",
                    "email": "Email"
                }
            },
            // Imprint
            "imprint": {
                "title": "Imprint",
                "lastUpdated": "Last updated",
                "responsibility": {
                    "title": "Information according to § 5 TMG",
                    "name": "Responsible for content",
                    "address": "Address"
                },
                "contact": {
                    "title": "Contact",
                    "email": "Email",
                    "phone": "Phone"
                },
                "disclaimer": {
                    "title": "Disclaimer",
                    "content": {
                        "title": "Liability for Content",
                        "intro": "As a service provider, we are responsible for our own content on these pages in accordance with general law pursuant to § 7 para. 1 TMG.",
                        "responsibility": "According to §§ 8 to 10 TMG, we as a service provider are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity."
                    },
                    "links": {
                        "title": "Liability for Links",
                        "intro": "Our offer contains links to external websites of third parties, on whose contents we have no influence.",
                        "responsibility": "The respective provider or operator of the pages is always responsible for the contents of the linked pages.",
                        "investigation": "Upon becoming aware of legal violations, we will immediately remove such links."
                    }
                },
                "copyright": {
                    "title": "Copyright",
                    "content": "The content and works created by the site operators on these pages are subject to German copyright law.",
                    "prohibition": "The reproduction, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator."
                },
                "dataProtection": {
                    "title": "Data Protection",
                    "content": "The use of our website is usually possible without providing personal data. If personal data is collected on our pages, this is always done within the framework of the applicable data protection laws.",
                    "link": "For more information, please see our Privacy Policy."
                }
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