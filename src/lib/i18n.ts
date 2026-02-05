import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Translation resources
const resources = {
  de: {
    translation: {
      // Navigation
      navigation: {
        dashboard: "Dashboard",
        scoreboard: "Rangliste",
        stats: "Statistiken",
        training: "Training",
        exercises: "Übungen",
        profile: "Profil",
        admin: "Admin",
        settings: "Einstellungen",
        logout: "Abmelden",
        friends: "Freunde",
        navigation: "Navigation",
        administration: "Administration",
        mainNavigation: "Hauptnavigation",
        settingsGroup: "Einstellungen",
        accountMenu: "Mein Account",
      },
      friends: {
        title: "Freunde",
        subtitle:
          "Vernetze dich mit anderen Sportlern und vergleiche eure Leistungen.",
        tabs: {
          friends: "Meine Freunde",
          requests: "Anfragen",
          search: "Finden",
        },
        list: {
          title: "Meine Freunde ({{count}})",
          emptyTitle: "Noch keine Freunde hinzugefügt.",
          emptyHint: "Verwende die Suche, um andere Athleten zu finden!",
          profile: "Profil",
          remove: "Entfernen",
        },
        requests: {
          incomingTitle: "Eingehende Anfragen ({{count}})",
          outgoingTitle: "Ausgehende Anfragen ({{count}})",
          noIncoming: "Keine eingehenden Anfragen.",
          noOutgoing: "Keine gesendeten Anfragen.",
          accept: "Akzeptieren",
          decline: "Ablehnen",
          cancel: "Zurückziehen",
        },
        search: {
          title: "Andere Athleten finden",
          placeholder: "Namen oder E-Mail suchen...",
          noUsers: "Keine Benutzer gefunden.",
          inviteTitle: "Person einladen",
          inviteDescription:
            "Die Person wurde nicht gefunden. Lade sie ein, Sportify zu nutzen.",
          requestAction: "Anfragen",
        },
        errors: {
          loadFriends: "Fehler beim Laden der Freunde.",
          loadRequests: "Fehler beim Laden der Anfragen.",
          invalidServerResponse:
            "Ungültige Antwort vom Server. Bitte versuche es erneut.",
          invalidServerResponseShort:
            "Ungültige Serverantwort. Bitte aktualisiere die Seite.",
          unknown: "Ein unbekannter Fehler ist aufgetreten.",
          notLoggedIn: "Nicht angemeldet.",
          removeFriend: "Fehler beim Entfernen des Freundes.",
          handleRequest: "Fehler bei der Bearbeitung der Anfrage.",
          cancelRequest: "Fehler beim Zurückziehen der Anfrage.",
          searchUsers: "Fehler bei der Benutzersuche.",
          sendRequest: "Fehler beim Senden der Anfrage.",
        },
        toasts: {
          removingFriend: "Entferne Freund...",
          removedFriend: "{{name}} wurde aus deiner Freundesliste entfernt.",
          processingRequest: "Bearbeite Anfrage...",
          sendingRequest: "Sende Anfrage an {{name}}...",
          requestAccepted: "Anfrage angenommen.",
          requestDeclined: "Anfrage abgelehnt.",
          cancelingRequest: "Ziehe Anfrage zurück...",
          requestCanceled: "Anfrage an {{name}} wurde zurückgezogen.",
          requestSent: "Freundschaftsanfrage an {{name}} gesendet.",
        },
        invitePage: {
          loading: "Lade Einladung...",
          title: "Freundschaftseinladung",
          description: "{{name}} möchte dich zu seinen Freunden hinzufügen",
          promptAuthenticated: "Möchtest du {{name}} als Freund hinzufügen?",
          promptUnauthenticated:
            "Um {{name}} als Freund hinzuzufügen, musst du dich anmelden.",
          accept: "Annehmen",
          later: "Später",
          sending: "Wird gesendet...",
          confirmInfo: "Die Freundschaft wird direkt erstellt.",
          login: "Anmelden",
          register: "Registrieren",
          registerInfo:
            "Falls du noch kein Konto hast, kannst du dich registrieren.",
          success: {
            friendshipCreatedTitle: "Freundschaft erstellt",
            friendshipCreatedDesc:
              "Ihr seid jetzt mit {{name}} befreundet.",
            requestSentTitle: "Freundschaftsanfrage gesendet",
            requestSentDesc:
              "Eine Freundschaftsanfrage wurde an {{name}} gesendet.",
          },
          errors: {
            invalidLink: "Ungültiger Einladungslink.",
            invalidOrExpired: "Einladungslink ungültig oder abgelaufen.",
            selfInvite:
              "Du kannst dir selbst keine Freundschaftsanfrage senden.",
            sendRequest: "Fehler beim Senden der Freundschaftsanfrage.",
            sendRequestTitle: "Fehler beim Senden der Freundschaftsanfrage",
            unknown: "Ein unbekannter Fehler ist aufgetreten.",
          },
        },
      },
      inviteFriendForm: {
        emailLabel: "E-Mail-Adresse",
        emailPlaceholder: "freund@example.com",
        nameHint:
          "Die Person kann sich bei der Registrierung selbst ihren Namen angeben.",
        actions: {
          sending: "Wird gesendet...",
          sendInvite: "Einladung senden",
          sendRequest: "Freundschaftsanfrage senden",
          cancel: "Abbrechen",
        },
        info: {
          inviteAlreadySentTitle: "Einladung bereits gesendet",
          inviteAlreadySentDesc:
            "Es wurde bereits eine Einladung an {{email}} gesendet.",
        },
        success: {
          inviteSentTitle: "Einladung gesendet",
          inviteSentDesc: "Eine Einladung wurde an {{target}} gesendet.",
          requestSentTitle: "Freundschaftsanfrage gesendet",
          requestSentDesc:
            "Eine Freundschaftsanfrage wurde an {{target}} gesendet.",
        },
        errors: {
          enterEmail: "Bitte gib eine E-Mail-Adresse ein.",
          invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
          sendInvite: "Fehler beim Senden der Einladung",
          sendRequest: "Fehler beim Senden der Freundschaftsanfrage",
          unknown: "Ein unbekannter Fehler ist aufgetreten.",
        },
        userExists: {
          title: "Benutzer bereits registriert",
          description:
            "Die E-Mail-Adresse {{email}} ist bereits bei Sportify registriert.",
          nameLabel: "Der Benutzer heißt {{name}}.",
          question:
            "Möchtest du stattdessen eine Freundschaftsanfrage an diese Person senden?",
        },
      },
      // Filters & pagination
      filters: {
        periodLabel: "Zeitraum",
        rangePlaceholder: "Zeitraum wählen",
        previous: "Zurück",
        next: "Weiter",
        prev: "Zurück",
        itemsPerPage: "Pro Seite:",
        filter: "Filter",
        title: "Filter",
        all: "Alle",
        show: "Filter",
        hide: "Filter ausblenden",
        sort: "Sortieren",
        reset: "Filter zurücksetzen",
        sortNone: "Keine",
        sortName: "Name",
        sortCategory: "Kategorie",
        sortDiscipline: "Disziplin",
        sortMeasurement: "Einheit",
        sortWeight: "Gewicht",
        sortDifficulty: "Schwierigkeit",
        sortNewest: "Neueste",
        viewGrid: "Grid",
        viewTable: "Tabelle",
        previousPeriod: "Vorherige Periode",
        nextPeriod: "Nächste Periode",
        alreadyCurrent: "Bereits aktuell",
        current: "Aktuell",
        pageLabel: "{{current}} / {{total}}",
        pageSummary: "{{start}}–{{end}} / {{total}}",
        itemSummary: "{{start}}–{{end}} von {{total}}",
        period: {
          all: "Gesamte Zeit",
          week: "Woche",
          month: "Monat",
          quarter: "Quartal",
          year: "Jahr",
          custom: "Benutzerdefiniert",
          currentWeek: "Aktuelle Woche",
          currentMonth: "Aktueller Monat",
          currentQuarter: "Aktuelles Quartal",
          currentYear: "Aktuelles Jahr",
        },
      },
      // Auth
      auth: {
        login: "Anmelden",
        register: "Registrieren",
        logout: "Abmelden",
        email: "E-Mail",
        password: "Passwort",
        confirmPassword: "Passwort bestätigen",
        firstName: "Vorname",
        lastName: "Nachname",
        nickname: "Spitzname",
        forgotPassword: "Passwort vergessen?",
        rememberMe: "Angemeldet bleiben",
        resetPassword: "Passwort zurücksetzen",
        backToLogin: "Zurück zur Anmeldung",
        createAccount: "Konto erstellen",
        alreadyHaveAccount: "Bereits ein Konto?",
        noAccount: "Noch kein Konto?",
        enable2FA: "2FA aktivieren",
        disable2FA: "2FA deaktivieren",
        twoFactorCode: "2FA Code",
        verifyEmail: "E-Mail bestätigen",
        resendVerification: "Bestätigung erneut senden",
        emailVerified: "E-Mail bestätigt",
        inviteUsers: "Nutzer einladen",
        deleteAccount: "Konto löschen",
        confirmDelete: "Löschung bestätigen",
        passwordDialog: {
          titleFallback: "Passwort erforderlich",
          descriptionFallback: "Bitte gib dein Passwort ein.",
          label: "Passwort",
          placeholder: "Passwort eingeben",
          enterPassword: "Bitte gib ein Passwort ein.",
          processing: "Wird verarbeitet...",
          error: "Ein Fehler ist aufgetreten.",
        },
        invitation: {
          acceptedTitle: "Freundschaft angenommen",
          acceptedDesc: "Die Freundschaft wurde erfolgreich erstellt!",
          errorTitle: "Fehler",
          errorDesc: "Fehler beim Akzeptieren der Einladung",
        },
        twoFactorSetup: {
          title: "2FA einrichten",
          description:
            "Richte die Zwei-Faktor-Authentifizierung für dein Konto ein.",
          initializing: "2FA wird initialisiert...",
          ready: "Bereit...",
          invalidServerResponse: "Ungültige Antwort vom Server",
          initError: "Fehler beim Initialisieren der 2FA",
          scanQr:
            "Scanne diesen QR-Code mit deiner Authenticator-App (z.B. Google Authenticator, Authy, Microsoft Authenticator):",
          qrAriaLabel: "QR Code für 2FA Setup",
          manualEntryLabel: "Oder gib diesen Code manuell ein:",
          copy: "Kopieren",
          copied: "Kopiert",
          verifyInstruction:
            "Nach dem Scannen oder Eingeben des Codes, gib den 6-stelligen Code aus deiner App ein, um die Einrichtung abzuschließen.",
          codeLabel: "6-stelliger Code aus deiner App:",
          verifyButton: "Code verifizieren",
          verifying: "Wird verarbeitet...",
          enterSixDigits: "Bitte gib einen 6-stelligen Code ein.",
          invalidCode: "Ungültiger Code. Bitte versuche es erneut.",
          enabledTitle: "2FA aktiviert",
          enabledDesc:
            "Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert.",
          copySecretSuccessTitle: "Kopiert",
          copySecretSuccessDesc:
            "Geheimer Schlüssel wurde in die Zwischenablage kopiert.",
          copySecretErrorTitle: "Fehler",
          copySecretErrorDesc:
            "Der geheime Schlüssel konnte nicht kopiert werden.",
          copyCodesSuccessTitle: "Kopiert",
          copyCodesSuccessDesc:
            "Recovery-Codes wurden in die Zwischenablage kopiert.",
          copyCodesErrorTitle: "Fehler",
          copyCodesErrorDesc:
            "Die Recovery-Codes konnten nicht kopiert werden.",
          downloadTitle: "Download gestartet",
          downloadDesc: "Recovery-Codes wurden heruntergeladen.",
          backupTitle: "Wichtig:",
          backupDesc:
            "Speichere diese Recovery-Codes an einem sicheren Ort. Du kannst sie verwenden, um auf dein Konto zuzugreifen, falls du keinen Zugriff auf deine Authenticator-App hast.",
          backupLabel: "Deine Recovery-Codes:",
          backupSingleUse:
            "Jeder Code kann nur einmal verwendet werden. Stelle sicher, dass du diese Codes an einem sicheren Ort speicherst.",
          complete: "Fertig",
        },
        twoFactorLogin: {
          title: "Zwei-Faktor-Authentifizierung",
          description:
            "Bitte gib den 6-stelligen Code aus deiner Authenticator-App ein, um die Anmeldung abzuschließen.",
          codeLabel: "2FA-Code",
          codePlaceholder: "000000",
          codeHint:
            "Gib den 6-stelligen Code aus deiner Authenticator-App ein",
          lost2fa: "2FA verloren?",
          backupCodeLabel: "Backup-Code",
          backupCodePlaceholder: "XXXX-XXXX-XXXX",
          backupCodeHint:
            "Gib einen deiner Backup-Codes ein, die du beim Einrichten der 2FA erhalten hast",
          backToCode: "Zurück zum 2FA-Code",
          back: "Zurück",
          submit: "Anmelden",
        },
        recoveryCodes: {
          title: "Neue Recovery-Codes",
          description:
            "Deine Recovery-Codes wurden zurückgesetzt. Speichere diese neuen Codes sicher.",
          copy: "Kopieren",
          copied: "Kopiert",
          download: "Download",
          done: "Fertig",
        },
      },
      // Profile
      profile: {
        title: "Profil",
        subtitle: "Verwalte deine persönlichen Einstellungen und Ziele",
        personalInfo: "Persönliche Informationen",
        displayPreferences: "Anzeige-Einstellungen",
        displayName: "Anzeigename",
        useNickname: "Spitzname verwenden",
        useFirstName: "Vorname verwenden",
        useFullName: "Vollständiger Name",
        publicProfile: "Öffentliches Profil",
        accountSettings: "Konto-Einstellungen",
        security: "Sicherheit",
        privacy: "Datenschutz",
        tabs: {
          profile: "Profil",
          security: "Sicherheit",
          preferences: "Einstellungen",
          achievements: "Erfolge",
          goals: "Wochenziele",
          danger: "Gefahrenzone",
        },
        achievements: {
          awards: "Auszeichnungen",
          badges: "Badges",
          progress: "Fortschritt",
          level: "Stufe",
          noAwards: "Noch keine Auszeichnungen erhalten.",
          noAwardsHint: "Trainiere regelmäßig, um Auszeichnungen zu erhalten!",
          noBadges: "Noch keine Badges erhalten.",
          noBadgesHint: "Erreiche Meilensteine, um Badges freizuschalten!",
          timesAchieved: "mal erreicht",
          startYourJourney: "Starte deine Reise!",
          startYourJourneyDescription:
            "Absolviere Workouts und erreiche deine Ziele, um Badges und Auszeichnungen zu sammeln. Jeder Erfolg zählt!",
        },
        profileInfo: "Profil Informationen",
        emailVerification: "E-Mail Verifizierung",
        emailVerified: "✓ Deine E-Mail ist verifiziert",
        emailNotVerified: "⚠ Bitte verifiziere deine E-Mail-Adresse",
        administrator: "Administrator",
        firstName: "Vorname",
        lastName: "Nachname",
        nickname: "Spitzname (optional)",
        nicknameLabel: "Spitzname",
        nicknameRequired:
          "Wenn 'Spitzname' als Anzeigename gewählt ist, muss ein Spitzname angegeben werden.",
        nicknameNoSpaces: "Ein Spitzname darf keine Leerzeichen enthalten.",
        nicknameInvalidFormat:
          "Ein Spitzname darf nur Buchstaben, Zahlen und Unterstriche enthalten.",
        nicknameTaken: "Dieser Spitzname ist bereits vergeben.",
        firstNamePlaceholder: "Vorname",
        lastNamePlaceholder: "Nachname",
        nicknamePlaceholder: "Spitzname",
        displayNameLabel: "Anzeigename",
        firstNameOption: "Vorname",
        fullNameOption: "Vollständiger Name",
        nicknameOption: "Spitzname",
        nicknameNotSet: "(kein Spitzname vergeben)",
        nicknameRequiredForDisplay:
          "Bitte gib einen Spitzname ein, um diese Option zu verwenden.",
        required: "*",
        updateProfile: "Profil aktualisieren",
        saving: "Wird gespeichert...",
        profileUpdated: "Profil aktualisiert",
        profileUpdatedDesc:
          "Deine Profilinformationen wurden erfolgreich gespeichert.",
        validationError: "Validierungsfehler",
        fillRequiredFields: "Bitte fülle alle Pflichtfelder aus.",
        firstNameRequired: "Vorname ist ein Pflichtfeld.",
        lastNameRequired: "Nachname ist ein Pflichtfeld.",
        profileSaveError: "Fehler beim Speichern des Profils",
        inviteFriends: "Freunde einladen",
        inviteFriendsDesc: "Lade deine Freunde ein und trainiert gemeinsam!",
        yourInviteLink: "Dein Einladungslink",
        linkCopied: "Link kopiert",
        linkCopiedDesc: "Einladungslink wurde in die Zwischenablage kopiert.",
        linkCopyError: "Link konnte nicht kopiert werden.",
        invitedFriends: "Eingeladene Freunde",
        loadingInvitations: "Lädt...",
        noInvitations: "Noch keine Einladungen gesendet.",
        invitationStatus: {
          accepted: "Angenommen",
          expired: "Abgelaufen",
          pending: "Ausstehend",
        },
        invitationResend: "Erneut versenden",
        invitationResent: "Einladung erneut versendet",
        invitationResentDesc: "Die Einladung wurde erfolgreich erneut versendet.",
        invitationResendError: "Fehler beim erneuten Versenden",
        invitationResendErrorDesc: "Fehler beim erneuten Versenden der Einladung",
        invitationDeleted: "Einladung gelöscht",
        invitationDeletedDesc: "Die Einladung wurde erfolgreich gelöscht.",
        invitationDeleteError: "Fehler beim Löschen",
        invitationDeleteErrorDesc: "Fehler beim Löschen der Einladung",
        changePassword: "Passwort ändern",
        currentPassword: "Aktuelles Passwort",
        newPassword: "Neues Passwort",
        confirmPassword: "Passwort bestätigen",
        passwordMismatch: "Die Passwörter stimmen nicht überein.",
        passwordTooShort: "Das Passwort muss mindestens 8 Zeichen lang sein.",
        currentPasswordRequired: "Bitte gib dein aktuelles Passwort ein.",
        newPasswordRequired: "Bitte gib ein neues Passwort ein.",
        passwordChanging: "Wird geändert...",
        passwordChanged: "Passwort geändert",
        passwordChangedDesc: "Dein Passwort wurde erfolgreich geändert.",
        passwordChangeError: "Fehler beim Ändern des Passworts",
        passwordChangeInDevelopment: "Funktion in Entwicklung",
        passwordChangeInDevelopmentDesc:
          "Passwort ändern wird bald verfügbar sein.",
        twoFactorAuth: "Zwei-Faktor-Authentifizierung",
        enable2FA: "2FA aktivieren",
        enable2FADesc: "Zusätzliche Sicherheit für dein Konto",
        status: "Status",
        activated: "✓ Aktiviert",
        deactivated: "○ Deaktiviert",
        twoFactorDetails: "2FA Details",
        enabledAt: "Aktiviert am:",
        notAvailable: "Nicht verfügbar",
        resetRecoveryKeys: "Recovery-Keys zurücksetzen",
        recoveryKeysReset: "Recovery-Keys zurückgesetzt",
        recoveryKeysResetDesc:
          "Neue Recovery-Keys wurden erfolgreich generiert.",
        recoveryKeysResetError: "Fehler beim Zurücksetzen der Recovery-Keys",
        disable2FATitle: "2FA deaktivieren",
        disable2FAError: "Fehler beim Deaktivieren der 2FA",
        disable2FA: "2FA deaktiviert",
        disable2FADesc:
          "Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert.",
        enable2FASuccess: "2FA aktiviert",
        enable2FASuccessDesc:
          "Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert.",
        disable2FAPrompt:
          "Bitte gib dein Passwort ein, um 2FA zu deaktivieren:",
        accountSecurity: "Kontosicherheit",
        created: "Erstellt",
        lastLogin: "Letzter Login",
        lastPasswordChange: "Letzte Passwortänderung",
        never: "Nie",
        neverChanged: "Nie geändert",
        emailVerifiedStatus: "E-Mail verifiziert",
        yes: "Ja",
        no: "Nein",
        verified: "✓ Verifiziert",
        notVerified: "⚠ Nicht verifiziert",
        deleteAccount: "Konto löschen",
        confirmDeleteAccount:
          "Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
        deleteAccountPasswordPrompt:
          "Bitte gib dein Passwort ein, um das Konto zu löschen:",
        accountDeleted: "Konto gelöscht",
        accountDeletedDesc: "Dein Konto wurde erfolgreich gelöscht.",
        deleteAccountError: "Fehler beim Löschen des Kontos",
        deleteAccountConfirmText: "LÖSCHEN",
        deleteAccountDialogTitle: "Konto löschen",
        deleteAccountDialogDesc:
          "Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden unwiderruflich gelöscht.",
        deleteAccountDialogPrompt:
          "Gib {{text}} ein, um fortzufahren:",
        deleteAccountDialogHint:
          'Bitte gib genau "{{text}}" ein (Großbuchstaben erforderlich).',
        deleteAccountDialogContinue: "Weiter",
        deleteAccountPasswordTitle: "Konto löschen",
        deleteAccountPasswordDesc:
          "Bitte gib dein Passwort ein, um das Löschen deines Kontos zu bestätigen.",
        deleteAccountPasswordLabel: "Passwort zur Bestätigung:",
        deleteAccountPasswordPlaceholder: "Dein Passwort eingeben",
        deleteAccountPasswordRequired: "Bitte gib dein Passwort ein.",
        deletingAccount: "Wird gelöscht...",
        dangerZone: "Gefahrenzone",
        deleteAccountWarning:
          "Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Trainingsdaten, Erfolge, Freundschaften und Einstellungen gehen verloren.",
        deleteAccountList: {
          data: "Alle deine Trainingsdaten werden gelöscht",
          achievements: "Deine Erfolge und Statistiken gehen verloren",
          friendships: "Alle Freundschaften werden beendet",
          profile: "Dein Profil ist nicht mehr erreichbar",
          irreversible: "Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden",
        },
        userPreferences: "Benutzereinstellungen",
        userPreferencesDesc: "Passe die App an deine Vorlieben an",
        language: "Sprache",
        timeFormat: "Uhrzeitformat",
        timeFormat24h: "24-Stunden (14:30)",
        timeFormat12h: "12-Stunden (2:30 PM)",
        theme: "Design",
        themeSystem: "Gerät",
        themeLight: "Hell",
        themeDark: "Dunkel",
        unitsPreferences: "Einheiten-Präferenzen",
        unitsPreferencesDesc: "Wähle deine bevorzugten Einheiten für Messungen",
        distance: "Distanz",
        distanceKm: "Kilometer (km)",
        distanceM: "Meter (m)",
        distanceMiles: "Meilen",
        distanceYards: "Yards",
        weight: "Gewicht",
        weightKg: "Kilogramm (kg)",
        weightLbs: "Pfund (lbs)",
        weightStone: "Stone",
        temperature: "Temperatur",
        temperatureCelsius: "Celsius (°C)",
        temperatureFahrenheit: "Fahrenheit (°F)",
        appSettings: "App-Einstellungen",
        pushNotifications: "Push-Benachrichtigungen",
        pushNotificationsDesc:
          "Erhalte Benachrichtigungen für neue Aktivitäten und Freundschaftsanfragen",
        emailNotifications: "E-Mail-Benachrichtigungen",
        emailNotificationsDesc:
          "Wöchentliche Zusammenfassung deiner Fortschritte",
        publicProfileSetting: "Öffentliches Profil",
        publicProfileDesc:
          "Andere Benutzer können dein Profil und deine Aktivitäten sehen",
        globalRankingSetting: "In globaler Rangliste anzeigen",
        globalRankingDesc:
          "Dein Profil erscheint in den globalen Statistiken und Ranglisten für alle Nutzer",
        saveAllSettings: "Alle Einstellungen speichern",
        settingsSaved: "Einstellungen gespeichert",
        settingsSavedDesc: "Deine Präferenzen wurden erfolgreich aktualisiert.",
        settingsError: "Fehler beim Speichern der Einstellungen",
        achievementsAndStats: "Erfolge & Statistiken",
        achievementsComingSoon:
          "Erfolge und detaillierte Statistiken werden bald verfügbar sein.",
        avatarSaved: "Avatar gespeichert",
        avatarSavedDesc: "Dein Avatar wurde erfolgreich aktualisiert.",
        avatarError: "Fehler beim Speichern des Avatars",
        avatarRemoved: "Avatar entfernt",
        avatarRemovedDesc: "Dein Profilbild wurde erfolgreich entfernt.",
        avatarRemoveError: "Fehler beim Entfernen des Avatars",
        removeAvatar: "Avatar entfernen",
        avatarEditor: {
          title: "Avatar erstellen",
          description: "Passe deinen Avatar nach deinen Wünschen an",
          randomize: "Zufällig generieren",
          tabs: {
            face: "Gesicht",
            hair: "Haare",
            accessories: "Accessoires",
            other: "Sonstiges",
          },
          labels: {
            gender: "Geschlecht",
            faceColor: "Gesichtsfarbe",
            earSize: "Ohrgröße",
            eyeStyle: "Augenform",
            noseStyle: "Nasenform",
            mouthStyle: "Mundform",
            hairStyle: "Haarstil",
            hairColor: "Haarfarbe",
            hat: "Hut",
            hatColor: "Hutfarbe",
            glasses: "Brille",
            clothing: "Kleidung",
            clothingColor: "Kleidungsfarbe",
            backgroundColor: "Hintergrundfarbe",
          },
          options: {
            gender: { man: "Mann", woman: "Frau" },
            faceColor: {
              light: "Hell",
              dark: "Dunkel",
              medium: "Mittel",
              pink: "Rosa",
              yellow: "Gelb",
            },
            earSize: { big: "Groß", small: "Klein" },
            eyeStyle: { circle: "Rund", oval: "Oval", smile: "Lächeln" },
            noseStyle: { short: "Kurz", long: "Lang", round: "Rund" },
            mouthStyle: { laugh: "Lachen", smile: "Lächeln", peace: "Peace" },
            hairStyle: {
              normal: "Normal",
              thick: "Dick",
              mohawk: "Mohawk",
              womanLong: "Lang (Frau)",
              womanShort: "Kurz (Frau)",
            },
            hairColor: {
              black: "Schwarz",
              brown: "Braun",
              blonde: "Blond",
              red: "Rot",
              gold: "Gold",
              gray: "Grau",
              white: "Weiß",
            },
            hat: { none: "Kein Hut", beanie: "Mütze", turban: "Turban" },
            hatColor: {
              black: "Schwarz",
              white: "Weiß",
              red: "Rot",
              blue: "Blau",
              green: "Grün",
              orange: "Orange",
            },
            glasses: { none: "Keine Brille", round: "Rund", square: "Eckig" },
            clothing: { polo: "Polo", short: "T-Shirt", hoody: "Kapuze" },
            clothingColor: {
              pink: "Rosa",
              blue: "Blau",
              green: "Grün",
              red: "Rot",
              yellow: "Gelb",
              lightGreen: "Lichtgrün",
              black: "Schwarz",
              white: "Weiß",
            },
            backgroundColor: {
              beige: "Beige",
              brown: "Braun",
              orange: "Orange",
              yellow: "Gelb",
              peach: "Pfirsich",
              blue: "Blau",
              green: "Grün",
              pink: "Rosa",
              white: "Weiß",
              black: "Schwarz",
            },
          },
          actions: { cancel: "Abbrechen", save: "Speichern" },
        },
        logo: {
          title: "Sportify",
          byline: "von Leon Stadler",
        },
        loading: "Lädt...",
        error: "Fehler",
        german: "Deutsch",
        english: "English",
        weeklyGoalsTitle: "Wochenziele",
        weeklyGoalsDesc:
          "Passe deine wöchentlichen Ziele nach deinen Wünschen an. Die Fortschritte werden automatisch basierend auf deinen Trainings aktualisiert.",
        weeklyGoalsSaving: "Wird gespeichert...",
        weeklyGoalsSaveAction: "Wochenziele speichern",
        monthlyGoalTitle: "Monatsziel",
        monthlyGoalDesc:
          "Lege dein Aktivitätsniveau fest, damit dein Monatsziel realistisch bleibt.",
        activityLevelLabel: "Aktivitätsniveau",
        activityLevelLow: "Einsteiger",
        activityLevelMedium: "Fortgeschritten",
        activityLevelHigh: "Sehr aktiv",
        activityLevelHint:
          "Das beeinflusst das automatische Monatsziel, besonders wenn dir noch keine Trainingshistorie vorliegt.",
      },
      badges: {
        categories: {
          weekly: "Wöchentlich",
          monthly: "Monatlich",
          lifetime: "Lebenszeit",
        },
        slugs: {
          "weekly-goal-exercises": {
            label: "Wochenziel (Übungen)",
            description:
              "Erreiche dein persönliches Wochenziel für Übungen {{threshold}} Mal.",
          },
          "weekly-goal-points": {
            label: "Wochenziel (Punkte)",
            description:
              "Erreiche dein Wochenziel bei den Punkten {{threshold}} Mal.",
          },
          "weekly-challenge-points": {
            label: "Wochen-Challenge",
            description:
              "Schließe die Wochen-Challenge {{threshold}} Mal erfolgreich ab.",
          },
          "monthly-challenge-points": {
            label: "Monats-Challenge",
            description:
              "Schließe die Monats-Challenge {{threshold}} Mal erfolgreich ab.",
          },
          "lifetime-pushups": {
            label: "Erste {{threshold}} Liegestütze",
            description: "Absolviere insgesamt {{threshold}} Liegestütze.",
          },
          "lifetime-pullups": {
            label: "Erste {{threshold}} Klimmzüge",
            description: "Absolviere insgesamt {{threshold}} Klimmzüge.",
          },
          "lifetime-situps": {
            label: "Erste {{threshold}} Sit-ups",
            description: "Absolviere insgesamt {{threshold}} Sit-ups.",
          },
          "lifetime-running": {
            label: "Erste {{threshold}} Lauf-Kilometer",
            description: "Laufe insgesamt {{threshold}} Kilometer.",
          },
          "lifetime-cycling": {
            label: "Erste {{threshold}} Radfahr-Kilometer",
            description: "Fahre insgesamt {{threshold}} Kilometer mit dem Rad.",
          },
        },
        icons: {
          "badge-weekly-goal-exercises": "Wochenziel Übungen",
          "badge-weekly-goal-points": "Wochenziel Punkte",
          "badge-weekly-challenge": "Wochen-Challenge",
          "badge-monthly-challenge": "Monats-Challenge",
          "badge-pushups": "Liegestütze",
          "badge-pullups": "Klimmzüge",
          "badge-situps": "Sit-ups",
          "badge-running": "Laufen",
          "badge-cycling": "Radfahren",
        },
        notifications: {
          earnedTitle: "Badge erhalten",
          earnedMessage: 'Du hast das Badge "{{badge}}" erhalten.',
        },
      },
      // NotFound
      notFound: {
        title: "Seite nicht gefunden",
        description:
          "Die Seite, die du suchst, existiert nicht oder wurde verschoben.",
        backHome: "Zur Startseite",
      },
      // Dashboard
      dashboard: {
        welcome: "Willkommen",
        welcomeMessage: "Willkommen zurück, {{name}}!",
        overview: "Übersicht",
        recentActivity: "Letzte Aktivitäten",
        statistics: "Statistiken",
        performance: "Leistung",
        goals: "Ziele",
        achievements: "Erfolge",
        title: "Dashboard",
        subtitle: "Deine sportlichen Fortschritte auf einen Blick",
        loadingProgress: "Lädt deine sportlichen Fortschritte...",
        totalPoints: "Gesamtpunkte",
        pullups: "Klimmzüge",
        runningDistance: "Laufdistanz",
        rank: "Rang",
        topExercise: "Top-Übung",
        thisWeek: "diese Woche",
        ofAthletes: "von {{count}} Athleten",
        weeklyGoals: "Wochenziele",
        goal: "Ziel",
        pushups: "Liegestütze",
        running: "Laufen",
        cycling: "Radfahren",
        error: "Fehler",
        errorLoadingData: "Fehler beim Laden der Dashboard-Daten",
        errorLoadingWorkouts:
          "Die letzten Workouts konnten nicht geladen werden.",
        pleaseLoginWorkouts:
          "Bitte melde dich an, um deine letzten Workouts zu sehen.",
        unexpectedFormat: "Unerwartetes Datenformat für Workouts erhalten.",
        workoutsNotLoaded: "Letzte Workouts konnten nicht geladen werden.",
        activityTypes: {
          pullup: "Klimmzüge",
          pushup: "Liegestütze",
          running: "Laufen",
          cycling: "Radfahren",
        },
        cardMeta: {
          auto: "Auto-Auswahl",
          manual: "Manuell",
          autoRank: "Top‑Übung automatisch #{{rank}}",
          manualSelected: "Manuell ausgewählt",
        },
        manualExercise: "Manuelle Übung",
        timeAgo: {
          minutes: "vor {{count}} Minuten",
          hours: "vor {{count}} Stunden",
          yesterday: "gestern",
          days: "vor {{count}} Tagen",
          unknown: "Unbekannt",
        },
        notAuthenticated: "Nicht authentifiziert",
        saveError: "Fehler beim Speichern",
        saveGoalsError: "Fehler beim Speichern der Ziele",
        thisMonth: "diesen Monat",
        thisQuarter: "dieses Quartal",
        thisYear: "dieses Jahr",
        points: "Punkte",
        workouts: "Anzahl Trainings",
        monthlyGoalAutoAdjust:
          "Das Monatsziel passt sich automatisch an deine letzten Monate an.",
        settings: {
          title: "Dashboard-Kacheln konfigurieren",
          description: "Passe die angezeigten Kacheln und Zeiträume nach deinen Wünschen an.",
          button: "Kacheln anpassen",
          short: "Kacheln",
          card: "Kachel",
          type: "Typ",
          period: "Zeitraum",
          color: "Farbe",
          activityMode: "Auswahl",
          activityAuto: "Top‑Übung automatisch",
          activityCustom: "Manuell auswählen",
          activityMetric: "Wert",
          activityType: "Übung",
          colors: {
            orange: "Orange",
            blue: "Blau",
            green: "Grün",
            purple: "Lila",
            teal: "Türkis",
            rose: "Rosa",
            slate: "Grau",
          },
        },
      },
      // Weekly Challenge
      weeklyChallenge: {
        title: "Wochen-Challenge",
        pleaseLogin:
          "Melde dich an, um an der wöchentlichen Challenge teilzunehmen und Punkte zu sammeln.",
        errorLoading: "Fehler beim Laden der Wochen-Challenge",
        couldNotLoad: "Die Wochen-Challenge konnte nicht geladen werden.",
        noData:
          "Aktuell liegen keine Challenge-Daten vor. Starte ein Workout, um Fortschritte zu sammeln!",
        completed: "Geschafft",
        day: "Tag",
        days: "Tage",
        points: "Punkte",
        workoutsThisWeek: "{{count}} Workouts diese Woche",
        progress: "Fortschritt",
        leaderboard: "Leaderboard",
        collectPoints: "Sammle Punkte, um in die Top 10 zu kommen",
        bonusPointsSecured: "Bonuspunkte gesichert",
        noActivitiesYet:
          "Noch keine Aktivitäten in dieser Woche. Sei der Erste und sammle Punkte!",
        you: "Du",
        kmRunning: "km Laufen",
        pullUps: "Pull-ups",
        pointsTarget: "Punkte-Ziel",
        errorLoadingFriends: "Fehler beim Laden der Freunde",
        noFriendsYet:
          "Du hast noch keine Freunde. Füge Freunde hinzu, um sie hier zu sehen.",
      },
      // Weekly Goals
      weeklyGoals: {
        saved: "Wochenziele gespeichert",
        savedDescription: "Deine Wochenziele wurden erfolgreich aktualisiert.",
        saveError: "Fehler beim Speichern der Wochenziele",
        dialog: {
          title: "Wochenziele einstellen",
          description:
            "Passe deine wöchentlichen Ziele nach deinen Wünschen an.",
          current: "Aktuell",
          pointsLabel: "Punkte-Ziel",
          pointsUnit: "Punkte",
        },
        pointsTitle: "Wöchentliches Punkte-Ziel",
        pointsDescription:
          "Lege dein persönliches Punkte-Ziel für diese Woche fest.",
        pointsLabel: "Punkte",
        pointsHint: "Standard-Challenge ist meist 1500 Punkte.",
      },
      // Activity Feed
      activityFeed: {
        title: "Aktivitäten von dir und deinen Freunden",
        widgetTitle: "Aktivitäten",
        widgetSubtitle: "Alle Aktivitäten von dir und deinen Freunden",
        pleaseLogin: "Bitte melde dich an, um Aktivitäten zu sehen.",
        unexpectedFormat: "Unerwartetes Datenformat vom Server.",
        couldNotLoad: "Aktivitäten konnten nicht geladen werden.",
        errorLoading: "Der Activity Feed konnte nicht geladen werden.",
        noActivities: "Keine Aktivitäten von Freunden",
        addFriends: "Füge Freunde hinzu, um ihre Workouts zu sehen!",
        noFriends: "Du hast noch keine Freunde",
        addFriendsToSeeActivities:
          "Füge Freunde hinzu, um deren Aktivitäten hier zu sehen.",
        goToFriends: "Zu Freunden",
        points: "Punkte",
        repetitions: "Wiederholungen",
        units: "Einheiten",
        inWorkout: 'in "{{title}}"',
        showAll: "Alle anzeigen",
        showMore: "Mehr anzeigen",
        showAllActivities: "Alle Aktivitäten anzeigen",
        you: "Du",
        timeAgoShort: {
          justNow: "gerade eben",
          minutes: "vor {{count}} Min",
          hours: "vor {{count}}h",
          hoursMinutes: "vor {{hours}}h {{minutes}}min",
          yesterday: "gestern",
          days: "vor {{count}}d",
          weeks: "vor {{count}} W",
          months: "vor {{count}} M",
          years: "vor {{count}} J",
          unknown: "Unbekannt",
        },
        activityTypes: {
          pullups: "Klimmzüge",
          pushups: "Liegestütze",
          situps: "Sit-ups",
          running: "Laufen",
          cycling: "Radfahren",
          unknown: "Unbekannte Aktivität",
        },
      },
      reactions: {
        errorTitle: "Fehler",
        loginRequired: "Bitte melde dich an.",
        errorMessage: "Aktion fehlgeschlagen.",
        noReactions: "Noch keine Reaktionen",
        countOnly: "{{count}} Reaktionen",
        openPicker: "Reaktion auswählen",
        reactWith: "Mit {{emoji}} reagieren",
      },
      friendsActivities: {
        title: "Freundes Aktivitäten",
        subtitle: "Alle Trainings von dir und deinen Freunden",
        itemsPerPage: "Pro Seite:",
        totalWorkouts: "{{count}} Trainings gefunden",
        noWorkouts: "Keine Trainings gefunden",
        noWorkoutsDescription:
          "Im ausgewählten Zeitraum wurden keine Trainings aufgezeichnet.",
      },
      myWorkouts: {
        title: "Meine Workouts",
        subtitle: "Alle deine Trainings im Überblick",
        itemsPerPage: "Pro Seite:",
        totalWorkouts: "{{count}} Trainings gefunden",
        noWorkouts: "Keine Trainings gefunden",
        noWorkoutsDescription:
          "Im ausgewählten Zeitraum wurden keine Trainings aufgezeichnet.",
        errorLoading: "Fehler beim Laden der Workouts",
      },
      friendProfile: {
        recentWorkouts: "Letzte Aktivitäten",
        noWorkouts: "Noch keine Trainings aufgezeichnet.",
        awards: "Auszeichnungen",
        noAwards: "Noch keine Auszeichnungen.",
        noBadges: "Noch keine Badges.",
        level: "Stufe",
        awardLabel: "Auszeichnung",
        joinedSince: "Mitglied seit {{date}}",
        backToFriends: "Zurück zu Freunden",
        notFriends: {
          title: "Nur für Freunde",
          description: "Dieses Profil ist nur für Freunde sichtbar.",
          backToFriends: "Zu den Freunden",
        },
        errors: {
          missingId: "Keine Freundes-ID angegeben.",
          loadFailed: "Profil konnte nicht geladen werden.",
          unknown: "Unbekannter Fehler beim Laden des Profils.",
          notFound: "Kein Profil gefunden.",
        },
      },
      // Scoreboard
      scoreboard: {
        title: "Scoreboard",
        subtitle: "Vergleiche deine Leistungen mit anderen Athleten",
        mustBeLoggedIn: "Du musst angemeldet sein, um das Scoreboard zu sehen.",
        leaderboard: "Rangliste",
        errorLoading: "Fehler beim Laden des Scoreboards",
        noData: "Keine Daten für diese Rangliste vorhanden.",
        participateToAppear:
          "Nimm an Workouts teil, um in der Rangliste zu erscheinen.",
        notRanked: "Nicht in Wertung",
        activityTypes: {
          all: "Alle",
          pullups: "Klimmzüge",
          pushups: "Liegestütze",
          running: "Laufen",
          cycling: "Radfahren",
          situps: "Sit-ups",
        },
        customExercisesTitle: "Eigene Übungen",
        customExercisesDescription:
          "Wähle bis zu drei Übungen, die zusätzlich zu den Top‑Übungen angezeigt werden.",
        customExercisesSelected: "{{count}} ausgewählt",
        customExercisesSelect: "Übung hinzufügen",
        customExercisesEmpty: "Noch keine Übungen ausgewählt.",
        pinnedExercisesSaved: "Deine Übungs-Auswahl wurde gespeichert.",
        pinnedLimitTitle: "Maximal 3 Übungen",
        pinnedLimitDescription: "Du kannst bis zu drei Übungen anheften.",
        scope: {
          friends: "Freunde",
          global: "Global",
        },
        autoExercisesHint:
          "Automatisch ausgewählt nach Leistung im gewählten Zeitraum.",
        manualExercisesHint: "Manuell ausgewählte Übung.",
        autoPersonal: "Top bei dir",
        autoFriends: "Top bei Freunden",
        autoGlobal: "Top global",
        pinnedExercise: "Manuell gewählt",
        periods: {
          all: "Gesamt",
          week: "Letzte 7 Tage",
          month: "Letzte 30 Tage",
          year: "Letztes Jahr",
        },
        units: {
          repetitions: "Wdh.",
          kilometers: "km",
          units: "Einheiten",
          minutes: "Min",
          amount: "Menge",
          points: "Punkte",
        },
        stats: {
          title: "Statistiken",
          subtitle: "Detaillierte Analyse deiner sportlichen Leistungen",
          thisWeek: "Diese Woche",
          thisMonth: "Dieser Monat",
          thisQuarter: "Dieses Quartal",
          thisYear: "Dieses Jahr",
          overview: "Übersicht",
          training: "Training",
          recovery: "Erholung",
          balance: "Balance",
          totalPoints: "Gesamtpunkte",
          totalWorkouts: "Workouts",
          totalDuration: "Trainingszeit",
          points: "Punkte",
          pointsTrend: "Punkteverlauf",
          trainingVolume: "Trainingsvolumen",
          rangeLabel: "Zeitraum: {{start}} – {{end}}",
          pullups: "Klimmzüge",
          pushups: "Liegestütze",
          situps: "Sit-ups",
          runningKm: "Laufen (km)",
          cyclingKm: "Radfahren (km)",
          averagePointsPerWorkout: "Ø Punkte pro Workout: {{value}}",
          averageDurationPerWorkout: "Ø Dauer pro Workout: {{value}}",
          readinessScore: "Readiness-Score",
          readinessDescription: "Durchschnittlicher Readiness-Score: {{value}}",
          vsPreviousPeriod: "vs. vorheriger Zeitraum",
          activityBreakdown: "Aktivitätsanteile",
          noWorkoutData: "Keine Trainingsdaten für diesen Zeitraum verfügbar.",
          longestWorkout: "Längstes Workout",
          peakDay: "Stärkster Tag",
          pointsWithUnit: "{{value}} Punkte",
          consistency: "Trainingskonstanz: {{value}}%",
          recoveryEntries: "Erholungstagebuch",
          energy: "Energie",
          sleep: "Schlafqualität",
          soreness: "Muskelkater",
          exertion: "Belastung",
          hydration: "Hydration",
          sleepDuration: "Schlafdauer",
          restingHeartRate: "Ruhepuls",
          recoveryTrend: "Erholungstrend",
          recoveryTrendDescription:
            "Verfolge deine Energie, Schlafqualität und Belastung im Verlauf.",
          noRecoveryData:
            "Keine Einträge im Erholungstagebuch für diesen Zeitraum.",
          moodDistribution: "Stimmungsverteilung",
          readinessTrend: "Balance aus Training & Readiness",
          readinessLabel: "Readiness",
          balanceSummary: "Tägliche Balance",
          date: "Datum",
          noData: "Für diesen Zeitraum liegen noch keine Analysedaten vor.",
          refreshing: "Aktualisiere Daten …",
          analyticsError: "Analytics konnten nicht geladen werden",
          analyticsErrorDescription:
            "Beim Laden der Analysedaten ist ein Fehler aufgetreten.",
          retry: "Erneut versuchen",
          weeklyActivity: "Wöchentliche Aktivität",
          monthlyActivity: "Monatliche Aktivität",
          progress: "Fortschritt",
          strengthTrainingTrend: "Kraft-Training Trend",
          strengthPoints: "Kraft-Punkte",
          enduranceTrend: "Ausdauer Trend",
          endurancePoints: "Ausdauer-Punkte",
          personalRecords: "Persönliche Rekorde",
          activityDistribution: "Aktivitätsverteilung",
        },
      },
      // Stats (Analytics)
      stats: {
        title: "Statistiken",
        subtitle: "Detaillierte Analyse deiner sportlichen Leistungen",
        thisWeek: "Diese Woche",
        thisMonth: "Dieser Monat",
        thisQuarter: "Dieses Quartal",
        thisYear: "Dieses Jahr",
        overview: "Übersicht",
        training: "Training",
        recovery: "Erholung",
        balance: "Balance",
        totalPoints: "Gesamtpunkte",
        totalWorkouts: "Workouts",
        activeDays: "Aktive Tage",
        activeDaysCount: "{{count}} aktive Tage",
        totalDuration: "Trainingszeit",
        points: "Punkte",
        pointsTrend: "Punkteverlauf",
        trainingVolume: "Trainingsvolumen",
        chartMode: "Darstellung",
        chartModeStacked: "Gestapelt",
        chartModeGrouped: "Nebeneinander",
        zoomHint: "Zoome oder filtere den Zeitraum, um Details zu sehen.",
        rangeLabel: "Zeitraum: {{start}} – {{end}}",
        customRange: "Individueller Zeitraum",
        pickRange: "Zeitraum wählen",
        pullups: "Klimmzüge",
        pushups: "Liegestütze",
        situps: "Sit-ups",
        runningKm: "Laufen (km)",
        cyclingKm: "Radfahren (km)",
        focus: "Fokus",
        averagePointsPerWorkout: "Ø Punkte pro Workout: {{value}}",
        averageDurationPerWorkout: "Ø Dauer pro Workout: {{value}}",
        readinessScore: "Readiness-Score",
        readinessDescription: "Durchschnittlicher Readiness-Score: {{value}}",
        vsPreviousPeriod: "vs. vorheriger Zeitraum",
        activityBreakdown: "Aktivitätsanteile",
        noWorkoutData: "Keine Trainingsdaten für diesen Zeitraum verfügbar.",
        longestWorkout: "Längstes Workout",
        peakDay: "Stärkster Tag",
        pointsWithUnit: "{{value}} Punkte",
        consistency: "Trainingskonstanz: {{value}}%",
        recoveryEntries: "Erholungstagebuch",
        energy: "Energie",
        sleep: "Schlafqualität",
        soreness: "Muskelkater",
        exertion: "Belastung",
        hydration: "Hydration",
        sleepDuration: "Schlafdauer",
        restingHeartRate: "Ruhepuls",
        recoveryTrend: "Erholungstrend",
        recoveryTrendDescription:
          "Verfolge deine Energie, Schlafqualität und Belastung im Verlauf.",
        noRecoveryData:
          "Keine Einträge im Erholungstagebuch für diesen Zeitraum.",
        moodDistribution: "Stimmungsverteilung",
        readinessTrend: "Balance aus Training & Readiness",
        readinessLabel: "Readiness",
        balanceSummary: "Tägliche Balance",
        noBalanceData: "Keine Balance-Daten für diesen Zeitraum.",
        date: "Datum",
        noData: "Für diesen Zeitraum liegen noch keine Analysedaten vor.",
        refreshing: "Aktualisiere Daten …",
        analyticsError: "Analytics konnten nicht geladen werden",
        analyticsErrorDescription:
          "Beim Laden der Analysedaten ist ein Fehler aufgetreten.",
        retry: "Erneut versuchen",
        customExercisesTitle: "Eigene Übungen",
        customExercisesDescription:
          "Wähle bis zu drei Übungen, die zusätzlich zu deinen Top‑Übungen angezeigt werden.",
        autoExercisesHint:
          "Die Standardübungen basieren auf deiner Aktivität im gewählten Zeitraum. Du kannst zusätzliche Übungen anheften.",
        customExercisesToggle: "Übungen anpassen",
        customExercisesHide: "Ausblenden",
        customExercisesSelected: "{{count}} ausgewählt",
        customExercisesSelect: "Übung hinzufügen",
        customExercisesEmpty: "Noch keine Übungen ausgewählt.",
        pinnedLimitTitle: "Maximal 3 Übungen",
        pinnedLimitDescription: "Du kannst bis zu drei Übungen anheften.",
        pinnedExercisesSaved: "Deine Übungs-Auswahl wurde gespeichert.",
        weeklyActivity: "Wöchentliche Aktivität",
        monthlyActivity: "Monatliche Aktivität",
        progress: "Fortschritt",
        strengthTrainingTrend: "Kraft-Training Trend",
        strengthPoints: "Kraft-Punkte",
        enduranceTrend: "Ausdauer Trend",
        endurancePoints: "Ausdauer-Punkte",
        personalRecords: "Persönliche Rekorde",
        activityDistribution: "Aktivitätsverteilung",
        correlationTitle: "Training & Erholung – Korrelationen",
        correlationDescription:
          "Welche Erholungswerte am stärksten mit deinem Training zusammenhängen.",
        topCorrelations: "Stärkste Zusammenhänge",
        readinessDrivers: "Treiber für Readiness",
        notEnoughData:
          "Für diese Analyse sind noch nicht genug Daten vorhanden.",
        samples: "{{count}} Messpunkte",
      },
      // Training
      training: {
        title: "Training",
        subtitle: "Trage deine Workouts ein und verfolge deinen Fortschritt",
        trainingsDiary: "Trainingsstagebuch",
        recoveryDiary: "Erholungstagebuch",
        newWorkout: "Neues Workout",
        newWorkoutHint: "Füge dein Training hinzu oder nutze eine Vorlage.",
        yourWorkouts: "Vergangene Workouts",
        viewAllWorkouts: "Alle anzeigen",
        noWorkouts: "Noch keine Workouts vorhanden.",
        noWorkoutsForType: "Keine Workouts für {{type}} gefunden.",
        createFirstWorkout:
          "Erstelle dein erstes Workout mit dem Formular {{location}}.",
        allExercises: "Alle Übungen",
        pullups: "Klimmzüge",
        pushups: "Liegestütze",
        situps: "Sit-ups",
        running: "Laufen",
        cycling: "Radfahren",
        mustBeLoggedIn: "Du musst angemeldet sein, um Workouts zu sehen.",
        editWindowInfo:
          "Workouts können nur innerhalb von 7 Tagen nach dem Datum bearbeitet werden.",
        loadError: "Fehler beim Laden der Workouts",
        workoutsLoadError: "Workouts konnten nicht geladen werden.",
        deleteConfirm: "Möchtest du dieses Workout wirklich löschen?",
        deleteError: "Fehler beim Löschen des Workouts",
        workoutDeleted: "Workout gelöscht",
        workoutDeletedSuccess: "Das Workout wurde erfolgreich gelöscht.",
        deleteWorkoutError: "Workout konnte nicht gelöscht werden.",
        edit: "Bearbeiten",
        delete: "Löschen",
        templates: "Workout Vorlagen",
        createTemplate: "Vorlage erstellen",
        noTemplates: "Keine Vorlagen gefunden.",
        useTemplate: "Vorlage nutzen",
        searchTemplates: "Vorlagen durchsuchen",
        favorites: {
          add: "Favorit hinzufügen",
          remove: "Favorit entfernen",
        },
        templatesOwn: "Deine Vorlagen",
        templatesFriends: "Vorlagen von Freunden",
        templatesPublic: "Öffentliche Vorlagen",
        sourceTemplateCredit: "Vorlage von {{name}}",
        previous: "Vorherige",
        next: "Nächste",
        unknownDate: "Unbekanntes Datum",
        fewMinutesAgo: "Vor wenigen Minuten",
        hoursAgo: "Vor {{hours}} Stunden",
        yesterday: "Gestern",
        recoveryDialog: {
          title: "Erholung dokumentieren?",
          description:
            "Möchtest du auch deine Erholung und Regeneration zu diesem Training dokumentieren? Du wirst zum Erholungstagebuch weitergeleitet, wo das Workout bereits verknüpft ist.",
          noLater: "Nein, später",
          yesDocument: "Ja, dokumentieren",
        },
        duration: {
          hours: "{{hours}}h {{minutes}}min",
          minutes: "{{minutes}}min",
        },
        location: {
          left: "links",
          above: "oben",
        },
        form: {
          newWorkout: "Neues Workout eintragen",
          editWorkout: "Workout bearbeiten",
          workoutTitle: "Workout-Titel",
          duration: "Dauer (Min., optional)",
          durationPlaceholder: "z.B. 60",
          date: "Datum",
          dateRequired: "Datum *",
          selectDate: "Wähle ein Datum",
          time: "Uhrzeit",
          timeRequired: "Uhrzeit *",
          startTime: "Startzeit",
          endTime: "Endzeit",
          toggleDurationEndTime: "Zeit statt Dauer verwenden",
          description: "Beschreibung (optional)",
          addDescription: "Beschreibung hinzufügen",
          hideDescription: "Beschreibung ausblenden",
          descriptionPlaceholder: "Zusätzliche Notizen zu deinem Workout...",
          activities: "Aktivitäten",
          activitiesRequired: "Aktivitäten *",
          activity: "Aktivität",
          exercise: "Übung",
          selectExercise: "Wähle eine Übung",
          unit: "Einheit",
          visibility: "Sichtbarkeit",
          visibilityPrivate: "Private",
          visibilityFriends: "Friends",
          visibilityPublic: "Public",
          saveAsTemplate: "Als Vorlage speichern",
          exerciseSearch: "Übungen finden",
          searchExercise: "Übung suchen",
          sessionType: "Session Type",
          sessionStrength: "Kraft",
          sessionCardio: "Ausdauer",
          sessionMixed: "Mixed",
          sessionClimbing: "Klettern/Bouldern",
          sessionMobility: "Mobility",
          difficulty: "Schwierigkeit",
          rounds: "Runden",
          restBetweenSets: "Standard Pause zwischen Sätzen (Sek)",
          restBetweenActivities: "Pause zwischen Übungen (Sek)",
          restBetweenRounds: "Pause zwischen Runden (Sek)",
          pauseSettings: "Pausen",
          templateAttributes: "Vorlagen-Attribute",
          movementPatternHint: "Mehrfachauswahl möglich, z. B. Push + Pull.",
          supersetGroup: "Superset",
          supersetGroupPlaceholder: "z.B. A",
          effort: "Effort (1-10)",
          restBetweenSetsOverride: "Pause zwischen Sätzen (Sek)",
          restAfterActivity: "Pause nach Übung (Sek)",
          setDefaults: "Sätze schnell anlegen",
          setCount: "Sätze",
          applySetDefaults: "Sätze anlegen",
          dropSet: "Dropset",
          filterCategory: "Kategorie",
          filterPattern: "Movement",
          filterType: "Einheitstyp",
          filterMuscle: "Muskelgruppe",
          filterEquipment: "Equipment",
          filterWeight: "Gewicht",
          filterWeightRequired: "Gewicht erforderlich",
          filterWeightOptional: "Kein Gewicht",
          showFilters: "Filter anzeigen",
          hideFilters: "Filter ausblenden",
          noExercises: "Keine Übungen gefunden",
          exerciseResults: "Übungen",
          totalDuration: "Dauer",
          durationPerSet: "Dauer (Min)",
          totalDistance: "Distanz",
          patternPush: "Push",
          patternPull: "Pull",
          patternLegs: "Beine",
          patternCore: "Core",
          patternFull: "Ganzkörper",
          measurementReps: "Wiederholungen",
          measurementTime: "Zeit",
          measurementDistance: "Distanz",
          measurementWeight: "Gewicht",
          measurementMixed: "Mixed",
          measurementRoute: "Route/Grade",
          useSetsReps: "Sets & Wiederholungen verwenden",
          sets: "Sets",
          set: "Set",
          reps: "Wdh.",
          weight: "Gewicht",
          addSet: "Set hinzufügen",
          total: "Gesamt",
          totalAmount: "Gesamtmenge",
          addActivity: "Weitere Aktivität hinzufügen",
          save: "Workout speichern",
          saving: "Speichere...",
          cancel: "Abbrechen",
          mustBeLoggedIn:
            "Du musst angemeldet sein, um ein Workout zu erstellen.",
          titleRequired: "Bitte gib einen Titel für dein Workout ein.",
          timeRequiredField: "Bitte gib eine Uhrzeit ein.",
          endTimeRequiredField: "Bitte gib eine Endzeit ein.",
          exerciseRequired: "Bitte wähle eine Übung aus.",
          requiredField: "Dieses Feld ist erforderlich.",
          activityRequired:
            "Bitte füge mindestens eine gültige Aktivität hinzu. Bei Sets & Wiederholungen müssen mindestens ein Set mit Wiederholungen > 0 eingegeben werden.",
          activityMissing: "Aktivität {{index}} unvollständig",
          saveError: "Fehler beim Speichern des Workouts.",
          workoutCreated: "Workout erstellt! 🎉",
          workoutUpdated: "Workout aktualisiert! 🎉",
          workoutSavedSuccess: "wurde erfolgreich gespeichert.",
          defaultTitles: {
            morning: "Morgen-Training",
            afternoon: "Mittags-Training",
            evening: "Abend-Training",
          },
          units: {
            repetitions: "Wiederholungen",
            repetitionsShort: "Wdh.",
            kilometers: "Kilometer",
            kilometersShort: "km",
            meters: "Meter",
            metersShort: "m",
            miles: "Meilen",
            milesShort: "mi",
            minutes: "Minuten",
            minutesShort: "Min",
            seconds: "Sekunden",
            secondsShort: "Sek",
            units: "Einheiten",
          },
        },
      },
      exerciseLibrary: {
        title: "Übungslexikon",
        subtitle: "Finde Übungen, filtere sie und füge eigene Übungen hinzu.",
        newExercise: "Neue Übung erstellen",
        name: "Name",
        namePlaceholder: "z.B. Pull-Ups",
        moreNames: "Weitere Namen (optional)",
        nameDeSingular: "Deutsch (Singular)",
        nameDePlural: "Deutsch (Plural)",
        nameEnSingular: "Englisch (Singular)",
        nameEnPlural: "Englisch (Plural)",
        nameAliases: "Weitere Synonyme",
        nameDeSingularPlaceholder: "z.B. Klimmzug",
        nameDePluralPlaceholder: "z.B. Klimmzüge",
        nameEnSingularPlaceholder: "e.g. Pull-up",
        nameEnPluralPlaceholder: "e.g. Pull-ups",
        nameAliasesPlaceholder: "Weitere Namen, getrennt durch Komma",
        category: "Kategorie",
        discipline: "Disziplin",
        measurement: "Einheiten",
        pattern: "Bewegungsmuster",
        movementPattern: "Bewegungsmuster",
        unit: "Einheit",
        defaultDistanceUnit: "Standard Distanz-Einheit",
        defaultTimeUnit: "Standard Zeit-Einheit",
        difficulty: "Schwierigkeit (1-10)",
        difficultyShort: "Level",
        description: "Beschreibung",
        addDescription: "Beschreibung hinzufügen",
        muscleGroups: "Muskelgruppen",
        muscleGroupsPlaceholder: "Muskelgruppen auswählen",
        searchMuscle: "Muskelgruppe suchen",
        noMatches: "Keine Treffer",
        equipment: "Equipment",
        equipmentPlaceholder: "z.B. bodyweight, barbell",
        requiresWeight: "Gewicht erforderlich",
        allowsWeight: "Gewicht optional",
        supportsSets: "Sets/Reps",
        reps: "Wdh",
        time: "Zeit",
        distance: "Distanz",
        route: "Route",
        similar: "Ähnliche Übungen",
        create: "Übung erstellen",
        nameRequired: "Bitte gib einen Namen an.",
        categoryRequired: "Bitte wähle eine Kategorie aus.",
        disciplineRequired: "Bitte wähle eine Disziplin aus.",
        movementPatternRequired: "Bitte wähle ein Bewegungsmuster aus.",
        requiredFields: "Bitte fülle Kategorie, Disziplin und Bewegungsmuster aus.",
        exerciseCreated: "Übung erstellt",
        exerciseCreatedInfo: "Die Übung ist sofort nutzbar.",
        exerciseCreateError: "Übung konnte nicht erstellt werden.",
        hideDescription: "Beschreibung ausblenden",
        noWeight: "Kein Gewicht",
        note: "Übungen sind sofort nutzbar. Änderungen können nur Admins vornehmen.",
        search: "Übungen durchsuchen",
        searchLabel: "Suche",
        searchPlaceholder: "Name, Beschreibung",
        filterCategory: "Kategorie",
        filterType: "Einheiten",
        filterMuscle: "Muskelgruppe",
        filterEquipment: "Equipment",
        favorites: "Favoriten",
        popular: "Beliebt",
        details: "Details",
        suggestChange: "Änderung vorschlagen",
        suggestChangeTitle: "Änderung vorschlagen",
        editRequestSent: "Änderung gesendet",
        editRequestSentDesc: "Deine Änderungsanfrage wurde gespeichert.",
        editRequestError: "Änderungsanfrage konnte nicht gesendet werden.",
        noChanges: "Keine Änderungen",
        noChangesDesc: "Bitte ändere mindestens ein Feld.",
        sendRequest: "Anfrage senden",
        report: "Melden",
        reportTitle: "Übung melden",
        reportReason: "Grund",
        reportDuplicate: "Doppelt",
        reportScoring: "Falsche Wertung",
        reportInappropriate: "Unpassend",
        reportDetails: "Beschreibung",
        reportDetailsPlaceholder: "Was stimmt nicht?",
        reportSuggest: "Änderungsvorschlag hinzufügen",
        reportSent: "Report gesendet",
        reportSentDesc: "Danke! Wir prüfen das intern.",
        reportError: "Report fehlgeschlagen.",
        sendReport: "Report senden",
        empty: "Keine Übungen gefunden.",
        loading: "Übungen werden geladen...",
        totalExercises: "{{count}} Übungen gefunden",
        categoryLabels: {
          strength: "Kraft",
          endurance: "Ausdauer",
          mobility: "Mobilität",
          skills: "Skills",
          functional: "Functional",
        },
        disciplineLabels: {
          calisthenics: "Calisthenics/Körpergewicht",
          yoga: "Yoga/Stretching",
          weights: "Krafttraining/Gym",
          running: "Laufen",
          cycling: "Radfahren",
          swimming: "Schwimmen",
          cardio: "Cardio",
        },
        movement: {
          push: "Push",
          pull: "Pull",
          squat: "Kniebeuge",
          hinge: "Hüftbeuge",
          carry: "Tragen",
          rotation: "Rotation",
          isometric: "Isometrisch",
        },
        muscleGroupLabels: {
          chest: "Brust",
          back: "Rücken",
          lats: "Latissimus",
          upperBack: "Oberer Rücken",
          lowerBack: "Unterer Rücken",
          traps: "Trapez",
          rhomboids: "Rhomboiden",
          shoulders: "Schultern",
          frontDelts: "Vordere Schulter",
          sideDelts: "Seitliche Schulter",
          rearDelts: "Hintere Schulter",
          arms: "Arme",
          biceps: "Bizeps",
          triceps: "Trizeps",
          forearms: "Unterarme",
          core: "Core",
          abs: "Bauch",
          obliques: "Schräger Bauch",
          deepCore: "Tiefe Bauchmuskeln",
          legs: "Beine",
          quads: "Quadrizeps",
          hamstrings: "Hamstrings",
          calves: "Waden",
          glutes: "Gluteus",
          adductors: "Adduktoren",
          abductors: "Abduktoren",
          hipFlexors: "Hüftbeuger",
          neck: "Nacken",
        },
      },
      admin: {
        title: "Admin Panel",
        subtitle: "Verwaltung der App-Einstellungen und Benutzer",
        tabs: {
          overview: "Übersicht",
          users: "Benutzerverwaltung",
          exercises: "Übungsverwaltung",
          moderation: "Moderation",
          monitoring: "Monitoring",
        },
        stats: {
          title: "App-Statistiken",
          users: "Registrierte Benutzer",
          verifiedEmails: "Verifizierte E-Mails",
          admins: "Administratoren",
          workouts: "Durchgeführte Trainings",
          templates: "Workout-Vorlagen",
          exercises: "Angelegte Übungen",
          recoveryEntries: "Erholungstagebuch-Einträge",
          badges: "Vergebene Badges",
          awards: "Vergebene Auszeichnungen",
          activities: "Getrackte Aktivitäten",
        },
        users: {
          title: "Benutzer-Verwaltung",
          showEmails: "E-Mails anzeigen",
          hideEmails: "E-Mails verbergen",
          refresh: "Daten aktualisieren",
          refreshLoading: "Wird geladen...",
          empty: "Keine Benutzer gefunden",
          table: {
            name: "Name",
            email: "E-Mail",
            status: "Status",
            created: "Erstellt",
            lastLogin: "Letzter Login",
          },
          badge: {
            admin: "Admin",
            verified: "✓ Verifiziert",
          },
        },
        exercises: {
          merge: {
            title: "Zusammenführen",
            source: "Quell-Übung",
            target: "Ziel-Übung",
            action: "Zusammenführen",
            sourcePlaceholder: "Quelle wählen",
            targetPlaceholder: "Ziel wählen",
            toastTitle: "Quelle gesetzt",
            toastDescription: "{{name}} als Quell-Übung ausgewählt.",
            helper:
              "Die Quell-Übung wird in die Ziel-Übung übernommen. Alle Verknüpfungen werden auf die Ziel-Übung verschoben, die Quell-Übung wird deaktiviert.",
            validation: "Bitte wähle unterschiedliche Quell- und Ziel-Übungen.",
          },
          deleteConfirm: "Möchtest du diese Übung wirklich löschen?",
          actions: {
            details: "Details",
            edit: "Bearbeiten",
            merge: "Zusammenführen",
            delete: "Löschen",
          },
        },
        errors: {
          deleteFailed: "Löschen fehlgeschlagen.",
        },
        success: {
          deleteTitle: "Übung gelöscht",
          deleteDescription: "Die Übung wurde deaktiviert.",
        },
        exerciseDetail: {
          exercise: "Übung",
          title: "Details",
          discipline: "Disziplin",
          movementPattern: "Bewegungsmuster",
          difficulty: "Schwierigkeit",
          unit: "Einheit",
          supportsSets: "Sets/Reps",
          requiresWeight: "Gewicht erforderlich",
          allowsWeight: "Gewicht optional",
          muscleGroups: "Muskelgruppen",
          equipment: "Equipment",
          yes: "Ja",
          no: "Nein",
          saveChanges: "Änderungen speichern",
        },
        moderation: {
          reports: {
            title: "Übungs-Reports",
            empty: "Keine offenen Reports",
            table: {
              exercise: "Übung",
              reason: "Grund",
              details: "Beschreibung",
              created: "Erstellt",
              actions: "Aktionen",
            },
            actions: {
              resolve: "Erledigt",
              dismiss: "Ablehnen",
            },
          },
          edits: {
            title: "Änderungsanfragen",
            empty: "Keine offenen Änderungsanfragen",
            table: {
              exercise: "Übung",
              changes: "Änderungen",
              created: "Erstellt",
              actions: "Aktionen",
            },
            actions: {
              approve: "Freigeben",
              reject: "Ablehnen",
            },
          },
        },
        monitoring: {
          title: "Monitoring",
          loading: "Monitoring-Daten werden geladen...",
          empty: "Keine Monitoring-Daten verfügbar.",
          refreshHint:
            "Klicken Sie auf \"Aktualisieren\", um Monitoring-Daten zu laden",
          jobs: {
            title: "Job-Status",
            stuck: "{{count}} stuck job(s) gefunden",
            lastRun: "Letzter Lauf",
            cleanup: "Cleanup durchführen",
            recentFailures: "Fehler der letzten 7 Tage",
          },
          emails: {
            title: "E-Mail-Warteschlange",
            recentTitle: "Letzte E-Mails (24h)",
            stats: {
              total: "Gesamt",
              failedAfterRetries: "{{count}} nach Retries",
            },
            table: {
              recipient: "Empfänger",
              subject: "Betreff",
              status: "Status",
              attempts: "Versuche",
              created: "Erstellt",
            },
          },
        },
        accessDenied: {
          title: "Zugriff verweigert",
          body: "Sie haben keine Berechtigung, auf den Admin-Bereich zuzugreifen.",
        },
        date: {
          never: "Nie",
          invalid: "Ungültiges Datum",
        },
        errors: {
          title: "Fehler",
          overviewLoad: "Übersichtsdaten konnten nicht geladen werden.",
          monitoringLoad: "Fehler beim Laden der Monitoring-Daten",
          cleanupJobs: "Fehler beim Cleanup der Jobs",
          adminLoad: "Fehler beim Laden der Admin-Daten",
          mergeFailed: "Merge fehlgeschlagen.",
        },
        success: {
          title: "Erfolg",
          cleanupJobs: "Stuck Jobs wurden bereinigt",
          mergeTitle: "Merge erfolgreich",
          mergeDescription: "Die Übung wurde zusammengeführt.",
        },
      },
      // Recovery Diary
      recoveryDiary: {
        title: "Erholungstagebuch",
        subtitle:
          "Dokumentiere deine Erholung, Regeneration, Tagesform und persönliche Notizen.",
        entries: "Einträge",
        editWindowInfo:
          "Erholungstagebuch-Einträge können nur innerhalb von 7 Tagen bearbeitet werden.",
        avgEnergy: "Ø Energie",
        avgFocus: "Ø Fokus",
        avgSleep: "Ø Schlafqualität",
        avgSoreness: "Ø Muskelkater",
        avgExertion: "Ø Belastung",
        date: "Datum",
        selectDate: "Datum wählen",
        mood: "Stimmung",
        energyLevel: "Energielevel (1-10)",
        focusLevel: "Fokus (1-10)",
        sleepQuality: "Schlafqualität (1-10)",
        sorenessLevel: "Muskelkater (0-10)",
        perceivedExertion: "Belastungsempfinden (1-10)",
        workoutLink: "Workout-Verknüpfung",
        workoutLinkPlaceholder: "Optional verknüpfen",
        noWorkout: "Kein Workout verknüpft",
        sleepDuration: "Schlafdauer (Stunden)",
        restingHeartRate: "Ruhepuls (bpm)",
        hydrationLevel: "Hydration (1-10)",
        tags: "Tags",
        tagsPlaceholder: "z. B. regeneration, intensität, fokus",
        tagsHint:
          "Mehrere Tags mit Komma trennen. Maximal 10 Tags pro Eintrag.",
        notes: "Notizen",
        notesPlaceholder:
          "Wie hast du dich gefühlt? Was lief gut, was weniger?",
        filterMood: "Stimmung",
        filterStart: "Von",
        filterEnd: "Bis",
        filterSearch: "Suche",
        filterSearchPlaceholder: "Tags oder Notizen durchsuchen",
        resetFilters: "Filter zurücksetzen",
        pastEntries: "Vergangene Einträge",
        statistics: "Statistiken",
        viewDetailedStats: "Detaillierte Statistiken",
        trends: "Trends",
        moodDistribution: "Stimmungsverteilung",
        popularTags: "Beliebte Tags",
        period: {
          week: "Woche",
          month: "Monat",
          quarter: "Quartal",
          year: "Jahr",
        },
        noEntries: "Noch keine Einträge im Erholungstagebuch vorhanden.",
        edit: "Bearbeiten",
        delete: "Löschen",
        cancelEdit: "Bearbeitung abbrechen",
        save: "Eintrag speichern",
        update: "Eintrag aktualisieren",
        previous: "Zurück",
        next: "Weiter",
        page: "Seite",
        of: "von",
        moods: {
          energized: "Energiegeladen",
          energizedHelper: "Höchste Leistungsfähigkeit",
          balanced: "Ausgeglichen",
          balancedHelper: "Stabil und fokussiert",
          tired: "Müde",
          tiredHelper: "Leichte Müdigkeit vorhanden",
          sore: "Muskelkater",
          soreHelper: "Erholung notwendig",
          stressed: "Gestresst",
          stressedHelper: "Achte auf Regeneration",
          motivated: "Motiviert",
          motivatedHelper: "Voll motiviert und bereit",
          relaxed: "Entspannt",
          relaxedHelper: "Gelassen und ruhig",
          excited: "Aufgeregt",
          excitedHelper: "Begeistert und voller Vorfreude",
          focused: "Fokussiert",
          focusedHelper: "Konzentriert und zielorientiert",
          frustrated: "Frustriert",
          frustratedHelper: "Enttäuscht oder blockiert",
          all: "Alle Stimmungen",
        },
        metrics: {
          energy: "⚡ Energie",
          focus: "🎯 Fokus",
          sleep: "🛌 Schlaf",
          soreness: "💥 Muskelkater",
          exertion: "📈 Belastung",
          sleepDuration: "🕒 Schlafdauer",
          heartRate: "❤️ Ruhepuls",
          hydration: "💧 Hydration",
        },
        errors: {
          loadError: "Fehler beim Laden des Erholungstagebuchs",
          loadErrorDescription:
            "Das Erholungstagebuch konnte nicht geladen werden.",
          saveError: "Fehler beim Speichern des Eintrags",
          saveErrorDescription: "Der Eintrag konnte nicht gespeichert werden.",
          deleteError: "Fehler beim Löschen des Eintrags",
          deleteErrorDescription: "Der Eintrag konnte nicht gelöscht werden.",
          deleteConfirm: "Möchtest du diesen Eintrag wirklich löschen?",
          loadWorkoutsError: "Fehler beim Laden der Workouts",
          notAuthenticated: "Nicht authentifiziert",
        },
        success: {
          entrySaved: "Eintrag gespeichert",
          entrySavedDescription:
            "Der Erholungstagebuch-Eintrag wurde hinzugefügt.",
          entryUpdated: "Eintrag aktualisiert",
          entryUpdatedDescription:
            "Der Erholungstagebuch-Eintrag wurde aktualisiert.",
          entryDeleted: "Eintrag gelöscht",
          entryDeletedDescription:
            "Der Erholungstagebuch-Eintrag wurde entfernt.",
        },
        placeholders: {
          energy: "z. B. 8",
          focus: "z. B. 7",
          sleep: "z. B. 6",
          soreness: "z. B. 3",
          exertion: "z. B. 8",
          sleepDuration: "z. B. 7.5",
          heartRate: "z. B. 54",
          hydration: "z. B. 8",
        },
      },
      // Settings
      settings: {
        general: "Allgemein",
        appearance: "Erscheinungsbild",
        language: "Sprache",
        theme: "Design",
        themeLight: "Hell",
        themeDark: "Dunkel",
        themeSystem: "Gerät",
        light: "Hell",
        dark: "Dunkel",
        system: "System",
        saved: "Gespeichert",
        settingSaved: "{{setting}} wurde aktualisiert.",
        saveError: "Fehler beim Speichern",
        reactions: {
          friendsCanSee: "Freunde können Reaktionen sehen",
          friendsCanSeeDescription: "Erlaube deinen Freunden, Reaktionen auf deine Workouts zu sehen",
          showNames: "Namen bei Reaktionen anzeigen",
          showNamesDescription: "Zeige die Namen der Nutzer, die auf deine Workouts reagiert haben",
        },
      },
      // Push Notifications
      pushNotifications: {
        title: "Push-Benachrichtigungen",
        description:
          "Erhalte Benachrichtigungen auch wenn die App geschlossen ist.",
        enabled: "Push aktiviert",
        enabledDescription: "Du erhältst jetzt Push-Benachrichtigungen.",
        disabled: "Push deaktiviert",
        disabledDescription: "Du erhältst keine Push-Benachrichtigungen mehr.",
        error: "Fehler",
        active: "Aktiv",
        toggle: "Push-Benachrichtigungen umschalten",
        notSupported: "Dein Browser unterstützt keine Push-Benachrichtigungen.",
        serverNotConfigured:
          "Push-Benachrichtigungen sind serverseitig nicht konfiguriert.",
        blocked: "Benachrichtigungen blockiert",
        blockedDescription:
          "Du hast Benachrichtigungen für diese Seite blockiert. Bitte erlaube sie in deinen Browser-Einstellungen.",
        howItWorks: "So funktioniert's",
        feature1: "Freundschaftsanfragen und -antworten",
        feature2: "Neue Badges und Erfolge",
        feature3: "Wöchentliche Zusammenfassungen",
        enabling: "Wird aktiviert...",
        disabling: "Wird deaktiviert...",
      },
      // Changelog
      changelog: {
        title: "Changelog",
        subtitle: "Alle Neuerungen und Verbesserungen auf einen Blick",
        stayUpdated: "Bleib auf dem Laufenden",
        description:
          "Hier findest du alle wichtigen Updates und neuen Features von Sportify.",
        latest: "Aktuell",
        moreUpdates: "Weitere Updates folgen – bleib gespannt! 🚀",
        types: {
          feature: "Neu",
          improvement: "Verbesserung",
          fix: "Bugfix",
        },
        entries: {
          v190: {
            title: "Reaktionen auf Workouts",
            description:
              "Reagiere auf die Trainings deiner Freunde mit Emojis und erhalte Benachrichtigungen über Reaktionen auf deine eigenen Workouts.",
            highlights: {
              0: "Emoji-Reaktionen: Reagiere mit 👍, ❤️, 🔥, 💪, 🎉 oder 😊 auf Workouts von Freunden",
              1: "Benachrichtigungen: Erhalte Push-Benachrichtigungen wenn jemand auf dein Training reagiert",
              2: "Reaktionen anzeigen: Sieh alle Reaktionen auf deine Workouts in der My-Workouts-Ansicht",
              3: "Privacy-Settings: Kontrolliere ob Freunde Reaktionen sehen können und ob Namen angezeigt werden",
              4: "Hover-Info: Zeige beim Hover über Reaktionen die Namen aller reagierenden Nutzer",
              5: "Eigene Workouts: Immer alle Reaktionen mit Namen sichtbar, unabhängig von den Settings",
            },
          },
          v185: {
            title: "Keyboard Shortcuts & UX-Verbesserungen",
            description:
              "Neue Keyboard Shortcuts für schnelleres Navigieren, verbesserte Mobile-Navigation, Scroll-Indikator und umfassende Accessibility-Verbesserungen.",
            highlights: {
              0: "Keyboard Shortcuts: Cmd/Ctrl+B zum Togglen der Sidebar, ESC zum Schließen",
              1: "Scroll-Indikator: Visueller Fortschrittsbalken im Header beim Scrollen",
              2: "Mobile Navigation: Verbesserte Bottom-Navigation mit erweitertem Account-Menü",
              3: "Accessibility: Umfassende aria-label Verbesserungen für Screenreader",
              4: "Design: Versteckte Scrollbars mit modernem Scroll-Indikator",
              5: "Wochenberechnung: ISO 8601 Woche (Montag-Sonntag) statt rolling 7 days",
              6: "Reduced Motion: Respektiert System-Präferenzen für reduzierte Animationen",
            },
          },
          v180: {
            title: "Rangliste, Ziele & Erholung aufgebohrt",
            description:
              "Neue Privatsphäre-Optionen in der Rangliste, bessere Weekly-Challenge/Weekly-Goals, Recovery-Kachel und frisches Dashboard-Layout.",
            highlights: {
              0: "Global-Ranglisten-Opt-in: Sichtbarkeit steuerbar, Warn-Dialog beim Deaktivieren.",
              1: "Scoreboard: Dropdowns für Woche/Monat und Freunde/Global; Top 3 plus eigener Platz.",
              2: "Wochenziele: Sit-ups-Ziel, Reset-Button, echte Wochenfortschritte statt 0-Werten.",
              3: "Wochen-Challenge: persönliches Punkteziel wird genutzt, echte Wochenpunkte/Workouts, Icon oben rechts.",
              4: "Recovery-Kachel: Erholungstagebuch-Metriken, Einträge & letzter Eintrag, Zeitraum-Umschalter.",
              5: "Dashboard-Layout: Bento-Grid mit klarer Ordnung (Ziele links, Challenge/Monthly, Scoreboard+Recovery, Aktivitäten groß).",
            },
          },
          v170: {
            title: "Freunde einladen",
            description:
              "Lade deine Freunde per E-Mail oder Einladungslink ein und trainiert gemeinsam.",
            highlights: {
              0: "Einladung per E-Mail-Adresse",
              1: "Einladungslink zum Teilen",
              2: "Übersicht aller gesendeten Einladungen",
              3: "Einfache Registrierung für neue Nutzer",
            },
          },
          v160: {
            title: "Wochen- und Monatsauswertung",
            description:
              "Erhalte automatische E-Mail-Benachrichtigungen mit deinen wöchentlichen und monatlichen Trainingszusammenfassungen.",
            highlights: {
              0: "Wöchentliche E-Mail mit Punkten und Workouts",
              1: "Monatliche Zusammenfassung mit Auszeichnungen",
              2: "Automatische Badge- und Award-Benachrichtigungen",
              3: "Zielerreichung und Leaderboard-Status",
            },
          },
          v150: {
            title: "Web Push Notifications",
            description:
              "Erhalte Push-Benachrichtigungen direkt auf dein Gerät – auch wenn die App geschlossen ist.",
            highlights: {
              0: "Push-Benachrichtigungen für Freundschaftsanfragen",
              1: "Benachrichtigungen für neue Badges und Erfolge",
              2: "Einfache Aktivierung in den Einstellungen",
              3: "Funktioniert auf Desktop und mobilen Geräten",
            },
          },
          v140: {
            title: "Auto-Save in Einstellungen",
            description:
              "Alle Einstellungen werden jetzt automatisch gespeichert – kein Speichern-Button mehr nötig.",
            highlights: {
              0: "Sofortige Speicherung bei jeder Änderung",
              1: "Toast-Benachrichtigung bei erfolgreicher Speicherung",
              2: "Kein Aufblitzen der Seite mehr beim Speichern",
              3: "Gilt für Profil- und Einstellungsseite",
            },
          },
          v130: {
            title: "Freundes-Aktivitäten",
            description:
              "Neue dedizierte Seite für alle Trainingsaktivitäten von dir und deinen Freunden.",
            highlights: {
              0: "Übersicht aller Trainings von Freunden",
              1: "Filterung nach Zeitraum",
              2: "Kompaktes, übersichtliches Design",
              3: "Direkter Link zum Freundesprofil",
            },
          },
          v120: {
            title: "Freundesprofile",
            description:
              "Sieh dir die Profile deiner Freunde an – mit Auszeichnungen, Badges und letzten Aktivitäten.",
            highlights: {
              0: "Anzeige von Auszeichnungen und Badges",
              1: "Letzte Trainingsaktivitäten",
              2: "Beitrittsdatum und Statistiken",
              3: "Klickbare Avatare und Namen",
            },
          },
          v110: {
            title: "Verbesserte Zeitraum-Navigation",
            description:
              "Navigiere einfach zwischen Wochen, Monaten und Jahren mit den neuen Pfeiltasten.",
            highlights: {
              0: "Pfeiltasten für vorherige/nächste Periode",
              1: "Dynamische Anzeige des aktuellen Zeitraums (z.B. 'KW 48')",
              2: "Tooltip mit vollständigem Datumsbereich",
              3: "Schneller 'Aktuell'-Button",
            },
          },
          v100: {
            title: "Notification Center",
            description:
              "Zentrales Benachrichtigungscenter für alle wichtigen Updates und Anfragen.",
            highlights: {
              0: "Freundschaftsanfragen und -antworten",
              1: "Badge- und Award-Benachrichtigungen",
              2: "Ungelesene Nachrichten-Indikator",
              3: "Automatisches Markieren als gelesen",
            },
          },
          v090: {
            title: "Überarbeitete Statistiken",
            description:
              "Komplett neu gestaltete Statistikseite mit detaillierten Analysen und Visualisierungen.",
            highlights: {
              0: "Aktivitäts-Timeline mit Heatmap",
              1: "Trainingsverteilung nach Typ",
              2: "Erholungs- und Recovery-Metriken",
              3: "Wochenvergleich und Trends",
            },
          },
          v080: {
            title: "Erfolge und Badges",
            description:
              "Verdiene Badges und Auszeichnungen für deine sportlichen Leistungen.",
            highlights: {
              0: "Verschiedene Badge-Kategorien",
              1: "Fortschrittsanzeige für Badges",
              2: "Wöchentliche und monatliche Awards",
              3: "Anzeige im Profil und bei Freunden",
            },
          },
          v070: {
            title: "Personalisierte Profilbilder",
            description:
              "Erstelle deinen eigenen Avatar mit vielen Anpassungsmöglichkeiten.",
            highlights: {
              0: "Avatar-Editor mit vielen Optionen",
              1: "Verschiedene Frisuren, Gesichter und Accessoires",
              2: "Farbauswahl für alle Elemente",
              3: "Zufalls-Generator für schnelle Erstellung",
            },
          },
          v060: {
            title: "Erste öffentliche Version",
            description:
              "Der Start von Sportify – deine persönliche Fitness-Tracking-Plattform.",
            highlights: {
              0: "Workout-Tracking mit Punktesystem",
              1: "Rangliste mit Freunden",
              2: "Wochenziele setzen und verfolgen",
              3: "Dark Mode und Sprachauswahl",
            },
          },
        },
      },
      // Landing Page
      landing: {
        settings: "Einstellungen",
        openSettings: "Einstellungen öffnen",
        language: "Sprache",
        theme: "Design",
        contact: "Kontakt",
        login: "Anmelden",
        register: "Registrieren",
        registerShort: "Reg.",
        skipToContent: "Zum Hauptinhalt springen",
        // Hero Section
        hero: {
          badge: "100% kostenlos • PWA • Deutsch & Englisch",
          title1: "Tracke deine",
          title2: "Fitness-Reise",
          title3: "wie ein Profi.",
          description:
            "Trainings- und Erholungstagebuch, wöchentliche Trophäen-Kämpfe mit Freunden, detaillierte Statistiken und Challenges – komplett kostenlos und DSGVO-konform.",
          cta: "Jetzt kostenlos starten",
          login: "Anmelden",
          trust1: "100% kostenlos",
          trust2: "DSGVO-konform",
          trust3: "PWA für alle Geräte",
          ctaGroup: "Aktions-Buttons",
          trustBadges: "Vertrauens-Merkmale",
        },
        // Stats Section
        stats: {
          title: "Sportify in Zahlen",
          reps: "Wiederholungen",
          athletes: "Aktive Nutzer",
          exercises: "Übungen getrackt",
          free: "Kostenlos",
        },
        // Features Section
        features: {
          badge: "Kernfunktionen",
          title: "Alles was du brauchst",
          subtitle:
            "Von wöchentlichen Trophäen-Kämpfen bis zu detaillierten Korrelations-Analysen – Sportify bietet alle Tools für deinen Erfolg.",
          learnMore: "Mehr erfahren",
          scoreboard: {
            title: "Wöchentliche Trophäe",
            description:
              "Kämpfe jede Woche gegen deinen Freundeskreis um die goldene Trophäe. Wöchentliche, monatliche und Jahres-Rankings sorgen für maximale Motivation.",
          },
          analytics: {
            title: "Statistiken & Korrelationen",
            description:
              "Analysiere deine Fortschritte mit interaktiven Charts, entdecke Zusammenhänge zwischen Training und Erholung, und optimiere dein Training.",
          },
          friends: {
            title: "Freunde & Community",
            description:
              "Verbinde dich mit Freunden, verfolge deren Aktivitäten im Feed und motiviert euch gegenseitig zu neuen Bestleistungen.",
          },
          training: {
            title: "Trainings- & Erholungstagebuch",
            description:
              "Führe detaillierte Trainings- und Erholungstagebücher. Tracke über 50 Übungen mit Sätzen, Gewichten und Wiederholungen.",
          },
          notifications: {
            title: "Push-Benachrichtigungen",
            description:
              "Erhalte sofortige Updates wenn Freunde trainieren, neue Bestleistungen erreichen oder dich zu Challenges herausfordern.",
          },
          pwa: {
            title: "PWA für alle Geräte",
            description:
              "Installiere die App auf Smartphone, Tablet oder Desktop. Nutze sie auch offline – Daten werden automatisch synchronisiert.",
          },
        },
        // Showcase Section
        showcase: {
          badge: "App Preview",
          title: "Dein Dashboard, deine Daten",
          subtitle:
            "Behalte den Überblick über all deine Trainingsfortschritte mit einem übersichtlichen, modernen Dashboard.",
          progress: {
            title: "Fortschrittsverfolgung",
            description:
              "Visualisiere deine Entwicklung über Wochen, Monate und Jahre hinweg.",
          },
          goals: {
            title: "Wochen- & Monats-Challenges",
            description:
              "Nimm an Challenges teil und erreiche gemeinsam mit der Community Ziele.",
          },
          history: {
            title: "Workout-Historie",
            description:
              "Greife jederzeit auf alle vergangenen Workouts und Statistiken zu.",
          },
          achievements: {
            title: "Erfolge & Badges",
            description:
              "Sammle Auszeichnungen für erreichte Meilensteine und Streaks.",
          },
          previewAlt:
            "Vorschau des Sportify Dashboards mit Statistiken, Streak-Anzeige und Trainingsfortschritt",
          preview: {
            streak: "Streak",
            days: "Tage",
            thisWeek: "Diese Woche",
            progress: "Wochenverlauf",
            workout: "Krafttraining",
            today: "Heute abgeschlossen",
          },
        },
        // Highlights Section
        highlights: {
          badge: "Weitere Features",
          title: "Noch mehr für dich",
          subtitle:
            "Sportify bietet dir alles was du für deine Fitness-Reise brauchst – und das völlig kostenlos.",
          diary: {
            title: "Erholungstagebuch",
            description:
              "Tracke Schlaf, Energie und Erholung für optimale Trainingsplanung.",
          },
          challenges: {
            title: "Wochen-Challenges",
            description:
              "Nimm an wöchentlichen und monatlichen Challenges teil und sammle Punkte.",
          },
          security: {
            title: "2FA-Sicherheit",
            description:
              "Schütze dein Konto mit Zwei-Faktor-Authentifizierung via Authenticator-App.",
          },
          avatar: {
            title: "Avatar-Gestaltung",
            description:
              "Gestalte deinen persönlichen Avatar mit vielen Anpassungsmöglichkeiten.",
          },
          languages: {
            title: "Deutsch & Englisch",
            description:
              "Nutze die App in deiner bevorzugten Sprache – vollständig übersetzt.",
          },
          gdpr: {
            title: "DSGVO-konform",
            description:
              "Deine Daten sind sicher. Wir erfüllen alle europäischen Datenschutzstandards.",
          },
        },
        // CTA Section
        cta: {
          badge: "Bereit durchzustarten?",
          title: "Starte jetzt deine Fitness-Reise",
          titlePart1: "Bereit für dein",
          titlePart2: "bestes Training?",
          subtitle:
            "Schließe dich unserer Community an und bringe dein Training auf das nächste Level. Tracke deine Fortschritte, kämpfe um wöchentliche Trophäen und erreiche deine Ziele – komplett kostenlos.",
          button: "Jetzt starten",
          loginButton: "Anmelden",
          buttonsLabel: "Registrierungs-Buttons",
          trust1: "100% kostenlos",
          trust2: "Keine Kreditkarte",
          trust3: "Sofort loslegen",
          trustLabel: "Vorteile der Registrierung",
          joinCommunity: "Schließe dich der wachsenden Community an",
          activeUsers: "Aktive Nutzer",
          totalReps: "Wiederholungen",
          freeForever: "Für immer kostenlos",
        },
        // Footer
        footer: {
          description:
            "Die moderne Sports Analytics Plattform für ambitionierte Athleten, die ihre Fitnessziele erreichen wollen. 100% kostenlos und DSGVO-konform.",
          madeWith: "Entwickelt mit",
          by: "von Leon Stadler",
          features: "Features",
          featuresList: {
            scoreboard: "Wöchentliche Trophäe",
            training: "Training & Erholung",
            stats: "Statistiken & Analysen",
            friends: "Freunde & Community",
            highlights: "Weitere Highlights",
          },
          developer: "Entwickler",
          tech: {
            modern: "Moderne Web-Technologien",
          },
          legal: "Rechtliches",
          legalLinks: {
            privacy: "Datenschutz",
            terms: "AGB",
            imprint: "Impressum",
            contact: "Kontakt",
            changelog: "Changelog",
          },
          copyright:
            "© 2025 Sportify. Alle Rechte vorbehalten. Entwickelt von Leon Stadler.",
        },
      },
      // Auth Pages
      authPages: {
        backToHome: "Zurück zur Startseite",
        welcomeBack: "Willkommen zurück!",
        continueJourney: "Melde dich an, um deine Fitness-Reise fortzusetzen",
        startFree: "Jetzt kostenfrei starten!",
        createAccount:
          "Erstelle dein Sportify-Konto und beginne deine Fitness-Reise",
        emailVerification: {
          backToLogin: "Zur Anmeldung",
          emailVerified: "E-Mail erfolgreich verifiziert!",
          accountActivated:
            "Ihr Sportify-Konto ist jetzt vollständig aktiviert. Sie können sich jetzt anmelden und alle Features nutzen.",
          loginNow: "Jetzt anmelden",
          backToHome: "Zur Startseite",
          verifyTitle: "E-Mail-Adresse bestätigen",
          verifying: "Ihre E-Mail wird verifiziert...",
          checkInbox:
            "Überprüfen Sie Ihr Postfach und klicken Sie auf den Bestätigungslink.",
          resendTitle: "Bestätigungs-E-Mail erneut senden",
          resendDescription:
            "Senden Sie die Bestätigungs-E-Mail erneut an {{email}}",
          resendDescriptionAlt:
            "Haben Sie keine E-Mail erhalten? Senden Sie eine neue Bestätigung.",
          emailLabel: "E-Mail-Adresse",
          emailPlaceholder: "ihre@email.com",
          checkSpam:
            "Überprüfen Sie auch Ihren Spam-Ordner. Die E-Mail kann bis zu 5 Minuten dauern.",
          sending: "Wird gesendet...",
          resendCountdown: "Erneut senden ({{count}}s)",
          resendButton: "Bestätigungs-E-Mail senden",
          invalidLink:
            "Der Verifizierungslink ist ungültig oder abgelaufen. Fordern Sie einen neuen Link an.",
          requestNewLink: "Neuen Link anfordern",
          alreadyVerified: "Bereits verifiziert?",
          loginHere: "Hier anmelden",
        },
        forgotPassword: {
          backToLogin: "Zurück zur Anmeldung",
          title: "Passwort vergessen?",
          description:
            "Kein Problem! Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.",
          resetTitle: "Passwort zurücksetzen",
          resetDescription: "Geben Sie die E-Mail-Adresse Ihres Kontos ein",
          sending: "Wird gesendet...",
          sendResetLink: "Reset-Link senden",
          emailSent: "E-Mail versendet!",
          checkEmail:
            "Wir haben eine E-Mail an {{email}} gesendet. Überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen zum Zurücksetzen Ihres Passworts.",
          noEmailReceived:
            "Haben Sie keine E-Mail erhalten? Überprüfen Sie auch Ihren Spam-Ordner oder versuchen Sie es erneut.",
          tryAgain: "versuchen Sie es erneut",
          rememberPassword: "Erinnern Sie sich wieder an Ihr Passwort?",
          loginHere: "Hier anmelden",
        },
        resetPassword: {
          backToLogin: "Zurück zur Anmeldung",
          title: "Passwort zurücksetzen",
          description: "Geben Sie Ihr neues Passwort ein",
          emailRequestTitle: "Passwort zurücksetzen",
          emailRequestDescription:
            "Kein Problem! Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.",
          resetTitle: "Neues Passwort festlegen",
          resetDescription:
            "Ihr neues Passwort muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben sowie eine Zahl enthalten.",
          passwordPlaceholder: "Neues Passwort",
          confirmPasswordPlaceholder: "Passwort bestätigen",
          passwordRequirements:
            "Mindestens 8 Zeichen, Groß- und Kleinbuchstaben sowie eine Zahl",
          tokenExpires:
            "Dieser Link ist nur für eine begrenzte Zeit gültig. Bitte setzen Sie Ihr Passwort bald zurück.",
          resetting: "Passwort wird zurückgesetzt...",
          resetButton: "Passwort zurücksetzen",
          sending: "Wird gesendet...",
          sendResetLink: "Reset-Link senden",
          emailSent: "E-Mail versendet!",
          checkEmail:
            "Wir haben eine E-Mail an {{email}} gesendet. Überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen zum Zurücksetzen Ihres Passworts.",
          noEmailReceived:
            "Haben Sie keine E-Mail erhalten? Überprüfen Sie auch Ihren Spam-Ordner oder versuchen Sie es erneut.",
          tryAgain: "versuchen Sie es erneut",
          passwordResetSuccess: "Passwort erfolgreich zurückgesetzt!",
          canLoginNow:
            "Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.",
          loginNow: "Jetzt anmelden",
          backToHome: "Zurück zur Startseite",
          rememberPassword: "Passwort wieder im Kopf?",
          loginHere: "Hier anmelden",
          missingToken: "Ungültiger oder fehlender Token",
          requestNewLink: "Bitte fordern Sie einen neuen Link an",
          invalidToken: "Ungültiger oder abgelaufener Token",
          resetFailed: "Passwort konnte nicht zurückgesetzt werden",
        },
        twoFactor: {
          backToLogin: "Zurück zur Anmeldung",
          title: "Zwei-Faktor-Authentifizierung",
          description:
            "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein, um die Anmeldung abzuschließen.",
          enterCode: "Sicherheitscode eingeben",
          codeRegenerates: "Der Code wird alle 30 Sekunden neu generiert",
          sixDigitCode: "6-stelliger Code",
          codePlaceholder: "000000",
          verifying: "Wird verifiziert...",
          verifyCode: "Code verifizieren",
          requestNewCode: "Neuen Code anfordern",
          requestNewCodeCountdown: "Neuen Code anfordern ({{count}}s)",
          problems: "Probleme mit der Authentifizierung?",
          contactUs: "Kontaktieren Sie uns",
        },
      },
      // PWA Auth Screen
      pwaAuth: {
        welcomeTitle: "Willkommen bei Sportify!",
        welcomeSubtitle: "Erstelle dein Konto und starte deine Fitness-Reise",
      },
      // Contact Page
      contact: {
        back: "Zurück",
        title: "Kontakt",
        contactUs: "Kontaktieren Sie uns",
        description:
          "Haben Sie Fragen zu Sportify? Wir sind hier um zu helfen! Senden Sie uns eine Nachricht und wir melden uns schnellstmöglich bei Ihnen.",
        contactInfo: "Kontaktinformationen",
        contactWays: "Verschiedene Wege um mit uns in Kontakt zu treten",
        email: "E-Mail",
        phone: "Telefon",
        address: "Adresse",
        responseTime:
          "Antwortzeit: Wir antworten normalerweise innerhalb von 24 Stunden",
        sendMessage: "Nachricht senden",
        formDescription:
          "Füllen Sie das Formular aus und wir melden uns bei Ihnen",
        name: "Name",
        namePlaceholder: "Ihr vollständiger Name",
        subject: "Betreff",
        subjectPlaceholder: "Worum geht es in Ihrer Nachricht?",
        message: "Nachricht",
        messagePlaceholder: "Schreiben Sie hier Ihre Nachricht...",
        privacyNote:
          "Mit dem Absenden stimmen Sie zu, dass wir Ihre Daten zur Bearbeitung Ihrer Anfrage verwenden. Weitere Informationen finden Sie in unserer",
        privacyLink: "Datenschutzerklärung",
        sending: "Wird gesendet...",
        sendMessageButton: "Nachricht senden",
        messageSent: "Nachricht erfolgreich versendet!",
        thankYouMessage:
          "Vielen Dank für Ihre Nachricht. Wir melden uns bald bei Ihnen.",
        faqTitle: "Häufig gestellte Fragen",
        faq: {
          freeTitle: "Ist Sportify kostenlos?",
          freeAnswer:
            "Ja, Sportify bietet eine kostenlose Grundversion mit allen wichtigen Features. Premium-Features werden in Zukunft verfügbar sein.",
          secureTitle: "Wie sicher sind meine Daten?",
          secureAnswer:
            "Ihre Daten werden mit modernster Verschlüsselung geschützt und niemals an Dritte weitergegeben. Datenschutz hat für uns höchste Priorität.",
          devicesTitle: "Welche Geräte werden unterstützt?",
          devicesAnswer:
            "Sportify funktioniert auf allen modernen Browsern und ist vollständig responsive für Desktop, Tablet und Smartphone optimiert.",
          appTitle: "Gibt es eine App?",
          appAnswer:
            "Sportify ist eine Progressive Web App (PWA). Sie können sie auf Smartphone, Tablet oder Desktop installieren und wie eine App nutzen.",
          responseTitle: "Wie schnell erhalte ich eine Antwort?",
          responseAnswer:
            "In der Regel antworten wir innerhalb von 24 Stunden an Werktagen. Bei komplexen Anliegen kann es etwas länger dauern.",
          exportTitle: "Kann ich meine Daten exportieren?",
          exportAnswer:
            "Aktuell gibt es keinen Self-Service-Export. Wenn Sie Ihre Daten benötigen, schreiben Sie uns bitte und wir helfen Ihnen weiter.",
          deleteTitle: "Kann ich mein Konto jederzeit löschen?",
          deleteAnswer:
            "Ja, Sie können Ihr Konto jederzeit vollständig löschen. Alle Ihre Daten werden dabei unwiderruflich entfernt.",
        },
      },
      // Legal Pages
      legal: {
        backToHome: "Zurück zur Startseite",
        disclaimer: {
          title: "Rechtlicher Hinweis",
          germanLawApplies:
            "Diese Website unterliegt ausschließlich deutschem Recht.",
          translationOnly:
            "Die englische Version dieser Seiten ist nur eine Übersetzung und dient lediglich der besseren Verständlichkeit.",
          germanVersionValid:
            "Rechtlich verbindlich ist ausschließlich die deutsche Version.",
        },
        languageNote:
          "Diese Seite ist auf Deutsch und Englisch verfügbar. Die deutsche Version ist rechtlich verbindlich.",
      },
      // Privacy Policy
      privacy: {
        title: "Datenschutzerklärung",
        lastUpdated: "Zuletzt aktualisiert",
        overview: {
          title: "1. Datenschutz auf einen Blick",
          general: {
            title: "1.1 Allgemeine Hinweise",
            content:
              "Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.",
          },
          dataCollection: {
            title: "1.2 Datenerfassung auf dieser Website",
            who: {
              title:
                "Wer ist verantwortlich für die Datenerfassung auf dieser Website?",
              content:
                'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt "Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.',
            },
            how: {
              title: "Wie erfassen wir Ihre Daten?",
              content:
                "Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder bei der Registrierung angeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.",
            },
            why: {
              title: "Wofür nutzen wir Ihre Daten?",
              content:
                "Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden, um die Plattform zu verbessern. Sofern über die Website Verträge geschlossen oder angebahnt werden können, werden die übermittelten Daten auch für Vertragsangebote, Bestellungen oder sonstige Auftragsanfragen verarbeitet.",
            },
            rights: {
              title: "Welche Rechte haben Sie bezüglich Ihrer Daten?",
              content:
                "Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.",
            },
          },
          noAnalysis: {
            title: "1.3 Analyse-Tools und Tools von Drittanbietern",
            content:
              "Beim Besuch dieser Website wird Ihr Surf-Verhalten nicht statistisch ausgewertet. Wir verwenden keine Analyseprogramme, Tracking-Tools oder ähnliche Technologien. Detaillierte Informationen hierzu finden Sie in der folgenden Datenschutzerklärung.",
          },
          responsibility:
            "Verantwortlicher für die Datenverarbeitung ist <0></0>, <1></1>.",
          legalBasis:
            "Diese Datenschutzerklärung entspricht den Vorgaben der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG).",
        },
        hosting: {
          title: "2. Hosting",
          content:
            "Wir hosten die Inhalte unserer Website bei folgenden Anbietern:",
          allinkl: {
            title: "2.1 All-Inkl (Domain)",
            content:
              "Die Domain wird von der ALL-INKL.COM - Neue Medien Münnich, Inh. René Münnich, Hauptstraße 68, 02742 Friedersdorf (nachfolgend All-Inkl) bereitgestellt. Details entnehmen Sie der Datenschutzerklärung von All-Inkl: https://all-inkl.com/datenschutzinformationen/. Die Verwendung von All-Inkl erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website.",
          },
          vercel: {
            title: "2.2 Vercel (Hosting)",
            content:
              "Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln. Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).",
            provider:
              "Wir setzen folgenden Hoster ein: Vercel Inc. mit Sitz in 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Der Server befindet sich in Frankfurt, Deutschland.",
            processing:
              "Unser Hoster wird Ihre Daten nur insoweit verarbeiten, wie dies zur Erfüllung seiner Leistungspflichten erforderlich ist und unsere Weisungen in Bezug auf diese Daten befolgt.",
          },
          avv: {
            title: "2.3 Auftragsverarbeitung",
            content:
              "Wir haben Verträge über Auftragsverarbeitung (AVV) zur Nutzung der oben genannten Dienste geschlossen. Hierbei handelt es sich um datenschutzrechtlich vorgeschriebene Verträge, die gewährleisten, dass diese die personenbezogenen Daten unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO verarbeiten.",
          },
        },
        generalInfo: {
          title: "3. Allgemeine Hinweise und Pflichtinformationen",
          dataProtection: {
            title: "3.1 Datenschutz",
            content:
              "Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.",
            security:
              "Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.",
          },
          responsible: {
            title: "3.2 Hinweis zur verantwortlichen Stelle",
            content:
              "Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist: <0></0>, <1></1>. Telefon: <2></2>, E-Mail: <3></3>",
            definition:
              "Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.",
          },
          retention: {
            title: "3.3 Speicherdauer",
            content:
              "Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe. Wenn Sie Ihr Konto löschen, werden alle zugehörigen Daten vollständig und unwiderruflich entfernt.",
          },
          legalBasis: {
            title:
              "3.4 Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung",
            content:
              "Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO verarbeitet werden. Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erfüllung einer rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1 lit. c DSGVO. Die Datenverarbeitung kann ferner auf Grundlage unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f DSGVO erfolgen. Über die jeweils im Einzelfall einschlägigen Rechtsgrundlagen wird in den folgenden Absätzen dieser Datenschutzerklärung informiert.",
          },
          recipients: {
            title: "3.5 Empfänger von personenbezogenen Daten",
            content:
              "Im Rahmen unserer Geschäftstätigkeit arbeiten wir mit verschiedenen externen Stellen zusammen. Dabei ist teilweise auch eine Übermittlung von personenbezogenen Daten an diese externen Stellen erforderlich. Wir geben personenbezogene Daten nur dann an externe Stellen weiter, wenn dies im Rahmen einer Vertragserfüllung erforderlich ist, wenn wir gesetzlich hierzu verpflichtet sind (z. B. Weitergabe von Daten an Steuerbehörden), wenn wir ein berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO an der Weitergabe haben oder wenn eine sonstige Rechtsgrundlage die Datenweitergabe erlaubt. Beim Einsatz von Auftragsverarbeitern geben wir personenbezogene Daten unserer Kunden nur auf Grundlage eines gültigen Vertrags über Auftragsverarbeitung weiter.",
          },
          revocation: {
            title: "3.6 Widerruf Ihrer Einwilligung zur Datenverarbeitung",
            content:
              "Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.",
          },
          objection: {
            title:
              "3.7 Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen Direktwerbung",
            content:
              "Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, haben Sie jederzeit das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen; dies gilt auch für ein auf diese Bestimmungen gestütztes Profiling. Die jeweilige Rechtsgrundlage, auf denen eine Verarbeitung beruht, entnehmen Sie dieser Datenschutzerklärung. Wenn Sie Widerspruch einlegen, werden wir Ihre betroffenen personenbezogenen Daten nicht mehr verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen (Widerspruch nach Art. 21 Abs. 1 DSGVO).",
            directMarketing:
              "Werden Ihre personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben, so haben Sie das Recht, jederzeit Widerspruch gegen die Verarbeitung Sie betreffender personenbezogener Daten zum Zwecke derartiger Werbung einzulegen; dies gilt auch für das Profiling, soweit es mit solcher Direktwerbung in Verbindung steht. Wenn Sie widersprechen, werden Ihre personenbezogenen Daten anschließend nicht mehr zum Zwecke der Direktwerbung verwendet (Widerspruch nach Art. 21 Abs. 2 DSGVO). Hinweis: Wir betreiben keine Direktwerbung.",
          },
          ssl: {
            title: "3.8 SSL- bzw. TLS-Verschlüsselung",
            content:
              'Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.',
          },
        },
        dataCollection: {
          title: "4. Datenerfassung auf dieser Website",
          types: {
            title: "4.1 Arten der erhobenen Daten",
            intro:
              "Wir erheben folgende Kategorien von personenbezogenen Daten:",
            personal:
              "Personenbezogene Daten: Name, E-Mail-Adresse, Profilbild (optional), Anzeigename (Vorname, Nachname oder Spitzname)",
            usage:
              "Nutzungsdaten: Workout-Daten (Art, Dauer, Intensität), Statistiken, Trainingsaktivitäten, Ranglisten-Positionen, Freunde-Verbindungen",
            technical:
              "Technische Daten: IP-Adresse (anonymisiert), Browser-Typ und -Version, Betriebssystem, Geräteinformationen, Zugriffszeiten",
          },
          purpose: {
            title: "4.2 Zweck der Datenerhebung",
            service:
              "Bereitstellung und Verbesserung unserer Dienste: Um Ihnen die Plattform-Funktionen zur Verfügung zu stellen und diese kontinuierlich zu optimieren",
            communication:
              "Kommunikation mit Nutzern: Zur Beantwortung von Anfragen, Versendung von E-Mail-Bestätigungen und wichtigen Benachrichtigungen",
            improvement:
              "Analyse und Optimierung der Plattform: Zur Verbesserung der Benutzerfreundlichkeit und Funktionalität",
            legal:
              "Erfüllung rechtlicher Verpflichtungen: Zur Einhaltung gesetzlicher Bestimmungen und zur Rechtsdurchsetzung bei Bedarf",
          },
          noHealthData: {
            title: "4.3 Keine Gesundheitsdaten",
            content:
              "Wichtig: Wir erheben keine Gesundheitsdaten im medizinischen Sinne. Die Plattform dient ausschließlich der Dokumentation von Trainingsaktivitäten. Sollten Nutzer in Trainingsnamen, Beschreibungen oder sonstigen Feldern medizinische Informationen, Diagnosen oder andere sensible Gesundheitsdaten angeben, sind sie hierfür selbst verantwortlich. Wir übernehmen keine Haftung für die Richtigkeit, Verwendung oder Weitergabe solcher Informationen.",
          },
        },
        cookies: {
          title: "5. Cookies",
          content:
            'Unsere Internetseiten verwenden so genannte "Cookies". Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung durch Ihren Webbrowser erfolgt.',
          types: {
            title: "5.1 Arten von Cookies",
            essential:
              "Notwendige Cookies: Diese Cookies sind für die Grundfunktionen der Website erforderlich (z.B. Authentifizierung, Session-Verwaltung). Diese Cookies werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert, da der Websitebetreiber ein berechtigtes Interesse an der Speicherung von notwendigen Cookies zur technisch fehlerfreien und optimierten Bereitstellung seiner Dienste hat. Diese Cookies können nicht deaktiviert werden, da die Website sonst nicht funktionsfähig wäre",
            functional:
              "Funktionale Cookies: Speichern Ihre Präferenzen und Einstellungen (z.B. Sprache, Theme) für einen besseren Nutzungskomfort",
            analytics:
              "Analyse-Cookies: Werden nicht verwendet. Wir setzen keine Analysetools wie Google Analytics oder ähnliche Dienste ein",
          },
          noTracking: {
            title: "5.2 Kein Tracking",
            content:
              "Wir verwenden keine Tracking-Technologien, keine Analysetools und keine Werbe-Cookies. Ihre Nutzung der Website wird nicht zu Analyse- oder Marketingzwecken verfolgt. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben. Bei der Deaktivierung von Cookies kann die Funktionalität dieser Website eingeschränkt sein.",
          },
        },
        contactForm: {
          title: "6. Kontaktformular",
          content:
            "Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.",
          legalBasis:
            "Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde; die Einwilligung ist jederzeit widerrufbar.",
          retention:
            "Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.",
        },
        dataUsage: {
          title: "7. Datenverwendung und -speicherung",
          content:
            "Ihre Daten werden ausschließlich zu den in Abschnitt 4.2 genannten Zwecken verwendet. Eine Weitergabe an Dritte erfolgt nur in den nachfolgend beschriebenen Fällen:",
          sharing: {
            title: "7.1 Datenweitergabe",
            content:
              "Eine Weitergabe Ihrer personenbezogenen Daten erfolgt nur in folgenden Fällen:",
            providers:
              "An Dienstleister, die uns bei der Bereitstellung unserer Dienste unterstützen: Hosting-Provider (Vercel, Server-Standort: Frankfurt), Datenbank-Provider (neon.tech), E-Mail-Versand-Dienstleister. Diese Dienstleister sind vertraglich verpflichtet, Ihre Daten nur im Rahmen unserer Anweisungen zu verwenden und die geltenden Datenschutzbestimmungen einzuhalten",
            legal:
              "Wenn dies gesetzlich vorgeschrieben ist oder zur Rechtsdurchsetzung erforderlich ist: Bei Vorliegen einer gesetzlichen Verpflichtung oder einer gerichtlichen Anordnung",
            business:
              "Bei einer Unternehmensumstrukturierung oder -übertragung: Im Falle einer Fusion, Übernahme oder sonstigen Umstrukturierung, wobei die Datenschutzbestimmungen eingehalten werden",
          },
          noCommercial: {
            title: "7.2 Keine kommerzielle Nutzung",
            content:
              "Wir verwenden Ihre Daten nicht zu kommerziellen Zwecken. Es erfolgt keine Weitergabe an Werbetreibende, keine Verwendung für Marketingzwecke und keine Analyse durch Dritte zu kommerziellen Zwecken.",
          },
        },
        security: {
          title: "8. Datensicherheit",
          content:
            "Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen und unbefugten Zugriff zu verhindern:",
          encryption:
            "Verschlüsselung von Datenübertragungen: Alle Datenübertragungen erfolgen über verschlüsselte Verbindungen (HTTPS/TLS)",
          access:
            "Zugriffskontrollen und Authentifizierung: Starke Passwort-Anforderungen, optional Zwei-Faktor-Authentifizierung, Zugriff nur für autorisierte Personen",
          regular:
            "Regelmäßige Sicherheitsüberprüfungen: Kontinuierliche Überwachung und Verbesserung der Sicherheitsmaßnahmen",
          database:
            "Sichere Datenbank: Nutzung einer professionellen Datenbank-Infrastruktur (neon.tech) mit entsprechenden Sicherheitsstandards",
        },
        rights: {
          title: "9. Ihre Rechte",
          intro:
            "Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten gemäß der DSGVO:",
          access: {
            title: "9.1 Auskunftsrecht (Art. 15 DSGVO)",
            content:
              "Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung.",
          },
          correction: {
            title: "9.2 Berichtigungsrecht (Art. 16 DSGVO)",
            content:
              "Sie haben das Recht, die Berichtigung unrichtiger oder die Vervollständigung unvollständiger Daten zu verlangen.",
          },
          deletion: {
            title: "9.3 Löschungsrecht (Art. 17 DSGVO)",
            content:
              "Sie können jederzeit die Löschung Ihrer Daten verlangen. Sie können Ihr Konto auch selbstständig im Profilbereich löschen, wodurch alle zugehörigen Daten vollständig entfernt werden. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.",
          },
          restriction: {
            title:
              "9.4 Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)",
            content:
              "Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf Einschränkung der Verarbeitung besteht in folgenden Fällen: Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten, benötigen wir in der Regel Zeit, um dies zu überprüfen. Für die Dauer der Prüfung haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah/geschieht, können Sie statt der Löschung die Einschränkung der Datenverarbeitung verlangen. Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie sie jedoch zur Ausübung, Verteidigung oder Geltendmachung von Rechtsansprüchen benötigen, haben Sie das Recht, statt der Löschung die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt haben, muss eine Abwägung zwischen Ihren und unseren Interessen vorgenommen werden. Solange noch nicht feststeht, wessen Interessen überwiegen, haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.",
          },
          objection: {
            title: "9.5 Widerspruchsrecht (Art. 21 DSGVO)",
            content:
              "Sie haben das Recht, der Verarbeitung Ihrer Daten zu widersprechen. Details hierzu finden Sie in Abschnitt 3.7 dieser Datenschutzerklärung.",
          },
          portability: {
            title: "9.6 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)",
            content:
              "Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar ist.",
          },
          complaint: {
            title:
              "9.7 Beschwerderecht bei der zuständigen Aufsichtsbehörde (Art. 77 DSGVO)",
            content:
              "Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe.",
          },
        },
        retention: {
          title: "10. Speicherdauer und Datenlöschung",
          content:
            "Ihre personenbezogenen Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Wenn Sie Ihr Konto löschen, werden alle zugehörigen Daten vollständig und unwiderruflich entfernt, einschließlich aller Trainingsdaten, Statistiken und sonstiger gespeicherter Informationen. Nach der Löschung können Ihre Daten nicht wiederhergestellt werden.",
          accountDeletion:
            "Sie können Ihr Konto jederzeit selbstständig im Profilbereich löschen. Bei der Löschung werden alle zugehörigen Nutzerdaten vollständig entfernt.",
        },
        changes: {
          title: "11. Änderungen dieser Datenschutzerklärung",
          content:
            "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Änderungen unserer Dienste anzupassen. Aktuelle Versionen finden Sie stets auf dieser Seite. Bei wesentlichen Änderungen werden wir Sie über die geänderten Bestimmungen informieren.",
        },
        contact: {
          title: "12. Kontakt und Ausübung Ihrer Rechte",
          content:
            "Bei Fragen zum Datenschutz, zur Ausübung Ihrer Rechte oder bei Beschwerden können Sie sich jederzeit an uns wenden. Wir bemühen uns, Ihre Anfragen zeitnah zu beantworten:",
          email: "E-Mail",
        },
        noForums: {
          title: "13. Keine Foren oder öffentliche Kommunikation",
          content:
            "Die Plattform bietet keine Foren, Chat-Funktionen oder andere Möglichkeiten zum öffentlichen Austausch von Nachrichten zwischen Nutzern. Die einzige Kommunikationsmöglichkeit ist das Kontaktformular für direkte Anfragen an uns.",
        },
      },
      // Terms of Service
      terms: {
        title: "Allgemeine Geschäftsbedingungen (AGB)",
        lastUpdated: "Zuletzt aktualisiert",
        acceptance: {
          title: "1. Geltungsbereich und Annahme",
          content:
            "Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Sportify-Plattform (nachfolgend „Plattform“ oder „Dienst“ genannt). Sportify ist ein privates Spaßprojekt ohne kommerzielle Absichten. Durch die Registrierung und Nutzung unserer Dienste akzeptieren Sie diese AGB vollständig und erkennen an, dass Sie diese gelesen und verstanden haben. Sollten Sie mit diesen Bedingungen nicht einverstanden sein, dürfen Sie die Plattform nicht nutzen.",
        },
        service: {
          title: "2. Beschreibung der Dienstleistung",
          description:
            "Sportify ist eine kostenlose, nicht-kommerzielle Plattform zur Verfolgung und Analyse von Fitness-Aktivitäten. Die Plattform wird als privates Spaßprojekt betrieben und dient ausschließlich persönlichen Zwecken. Wir bieten folgende Funktionen:",
          features: {
            title: "2.1 Funktionen",
            tracking:
              "Workout-Tracking und -Aufzeichnung: Nutzer können ihre Trainingsaktivitäten dokumentieren und verwalten",
            statistics:
              "Statistiken und Leistungsanalysen: Automatische Auswertung und Visualisierung von Trainingsdaten",
            community:
              "Community-Features: Möglichkeit, Freunde einzuladen und Trainingsaktivitäten zu teilen",
            scoreboard:
              "Ranglisten und Wettbewerbe: Vergleich der eigenen Leistungen mit anderen Nutzern",
          },
          freeService: "2.2 Kostenloser Service",
          freeServiceContent:
            "Die Nutzung der Plattform ist vollständig kostenlos. Es gibt keine Abonnements, keine versteckten Kosten und keine Monetarisierung. Die Plattform wird ohne Gewinnerzielungsabsicht betrieben.",
          noMonetization: "2.3 Keine Monetarisierung",
          noMonetizationContent:
            "Sportify generiert keine Einnahmen durch Werbung, Tracking, Abonnements oder andere kommerzielle Aktivitäten. Es werden keine Werbe-E-Mails versendet und keine Nutzerdaten zu kommerziellen Zwecken verwendet.",
        },
        account: {
          title: "3. Benutzerkonto",
          registration: {
            title: "3.1 Registrierung",
            age: "Sie müssen mindestens 18 Jahre alt sein oder die Einwilligung eines Erziehungsberechtigten haben",
            accuracy:
              "Sie müssen genaue und vollständige Informationen angeben und diese aktuell halten",
            responsibility:
              "Sie sind für die Sicherheit Ihres Kontos und die Vertraulichkeit Ihrer Zugangsdaten verantwortlich",
            singleAccount: "Jeder Nutzer darf nur ein Konto erstellen",
          },
          security: {
            title: "3.2 Kontosicherheit",
            content:
              "Sie sind verantwortlich für die Geheimhaltung Ihrer Anmeldedaten (E-Mail-Adresse und Passwort). Sie dürfen Ihre Zugangsdaten nicht an Dritte weitergeben. Informieren Sie uns umgehend über unbefugte Nutzung Ihres Kontos oder verdächtige Aktivitäten. Wir übernehmen keine Haftung für Schäden, die durch unberechtigten Zugriff auf Ihr Konto entstehen.",
          },
          deletion: {
            title: "3.3 Kontolöschung",
            content:
              "Sie können Ihr Konto jederzeit selbstständig im Profilbereich löschen. Bei der Löschung werden alle zugehörigen Nutzerdaten vollständig und unwiderruflich gelöscht, einschließlich aller Trainingsdaten, Statistiken und sonstiger gespeicherter Informationen.",
          },
        },
        usage: {
          title: "4. Nutzungsregeln",
          allowed: {
            title: "4.1 Erlaubte Nutzung",
            personal:
              "Persönliche Nutzung für Fitness-Tracking und Dokumentation eigener Trainingsaktivitäten",
            lawful:
              "Rechtmäßige Nutzung in Übereinstimmung mit allen geltenden Gesetzen und Vorschriften",
            respectful:
              "Respektvoller und höflicher Umgang mit anderen Nutzern der Plattform",
          },
          prohibited: {
            title: "4.2 Verbotene Nutzung",
            illegal:
              "Jegliche illegale Aktivitäten oder Handlungen, die gegen geltendes Recht verstoßen",
            harm: "Schädigung, Belästigung oder Bedrohung anderer Nutzer oder der Plattform",
            unauthorized:
              "Unbefugter Zugriff auf andere Konten, Systeme oder Daten",
            spam: "Versenden von Spam, unerwünschten Nachrichten oder massenhaften E-Mails",
            reverse:
              "Reverse Engineering, Dekompilierung oder Versuche, den Quellcode zu extrahieren oder die Plattform zu manipulieren",
            misleading:
              "Verwendung von irreführenden, unangemessenen oder anstößigen Trainingsnamen oder Inhalten",
            userContent:
              "Die Verantwortung für die Inhalte, die Sie auf der Plattform erstellen (z.B. Trainingsnamen), liegt ausschließlich bei Ihnen. Wir übernehmen keine Haftung für unangemessene oder irreführende Nutzerinhalte.",
          },
          userContent: {
            title: "4.3 Nutzerinhalte",
            content:
              "Sie sind selbst verantwortlich für alle Inhalte, die Sie auf der Plattform erstellen oder hochladen, einschließlich der Benennung von Trainings. Wir übernehmen keine Haftung für unangemessene, irreführende oder anstößige Inhalte, die von Nutzern erstellt werden. Wir behalten uns vor, Inhalte zu entfernen, die gegen diese AGB verstoßen.",
          },
        },
        content: {
          title: "5. Urheberrecht und geistiges Eigentum",
          ownership:
            "Alle Rechte an der Plattform, ihrer Software, ihrem Design und ihren Inhalten liegen bei uns oder unseren Lizenzgebern. Die Plattform und alle damit verbundenen Materialien sind urheberrechtlich geschützt.",
          userContent:
            "Sie behalten die Rechte an von Ihnen erstellten Inhalten (z.B. Trainingsdaten). Durch die Nutzung der Plattform gewähren Sie uns eine nicht-exklusive, weltweite, gebührenfreie Lizenz zur Nutzung, Speicherung und Verarbeitung Ihrer Inhalte, soweit dies für den Betrieb der Plattform erforderlich ist.",
          license:
            "Die Nutzung unserer Plattform gewährt Ihnen keine Eigentumsrechte, Lizenzen oder sonstige Rechte an der Software, dem Design oder den Inhalten der Plattform. Sie dürfen die Plattform nur im Rahmen dieser AGB nutzen.",
        },
        liability: {
          title: "6. Haftungsbeschränkung und Haftungsausschluss",
          content:
            "Die Plattform wird als privates Spaßprojekt ohne Gewinnerzielungsabsicht betrieben. Wir haften nicht für Schäden, die durch die Nutzung oder Nichtnutzbarkeit unserer Plattform entstehen, soweit gesetzlich zulässig. Dies gilt insbesondere für:",
          limitations: {
            title: "6.1 Haftungsausschlüsse",
            availability:
              "Wir garantieren keine ununterbrochene oder fehlerfreie Verfügbarkeit der Plattform. Ausfälle, Wartungsarbeiten oder technische Probleme können jederzeit auftreten",
            accuracy:
              "Wir übernehmen keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität von Nutzerdaten oder automatisch generierten Statistiken",
            damages:
              "Wir haften nicht für indirekte Schäden, Folgeschäden, entgangenen Gewinn, Datenverlust oder sonstige Vermögensschäden",
            userContent:
              "Wir übernehmen keine Haftung für unangemessene, irreführende oder anstößige Inhalte, die von Nutzern erstellt werden",
            health:
              "Wir erheben keine Gesundheitsdaten. Sollten Nutzer in Trainingsnamen oder sonstigen Feldern medizinische Daten oder andere sensible Informationen angeben, sind sie hierfür selbst verantwortlich. Wir übernehmen keine Haftung für die Verwendung solcher Informationen",
            training:
              "Wir übernehmen keine Haftung für Verletzungen oder Schäden, die im Zusammenhang mit Trainingsaktivitäten entstehen, die über die Plattform dokumentiert werden",
          },
          noHealthData: {
            title: "6.2 Keine Gesundheitsdaten",
            content:
              "Sportify erfasst keine Gesundheitsdaten im medizinischen Sinne. Sollten Nutzer in Trainingsnamen, Beschreibungen oder sonstigen Feldern medizinische Informationen, Diagnosen oder andere sensible Gesundheitsdaten angeben, sind sie hierfür selbst verantwortlich. Wir übernehmen keine Haftung für die Richtigkeit, Verwendung oder Weitergabe solcher Informationen.",
          },
        },
        termination: {
          title: "7. Kündigung und Kontolöschung",
          user: "Sie können Ihr Konto jederzeit selbstständig im Profilbereich löschen. Bei der Löschung werden alle zugehörigen Nutzerdaten vollständig und unwiderruflich entfernt, einschließlich aller Trainingsdaten, Statistiken, Freunde-Verbindungen und sonstiger gespeicherter Informationen.",
          provider:
            "Wir behalten uns vor, Konten ohne Vorankündigung zu sperren oder zu löschen, die gegen diese AGB verstoßen, rechtswidrige Aktivitäten durchführen oder die Plattform in unangemessener Weise nutzen.",
          effect:
            "Bei Kündigung oder Löschung werden Ihre Daten gemäß unserer Datenschutzerklärung behandelt. Nach der Löschung können Ihre Daten nicht wiederhergestellt werden.",
        },
        changes: {
          title: "8. Änderungen der AGB und des Dienstes",
          content:
            "Wir behalten uns vor, diese AGB jederzeit zu ändern oder zu ergänzen. Änderungen werden auf dieser Seite veröffentlicht und treten mit ihrer Veröffentlichung in Kraft. Die fortgesetzte Nutzung der Plattform nach Veröffentlichung von Änderungen gilt als Zustimmung zu den geänderten Bedingungen.",
          notification:
            "Bei wesentlichen Änderungen werden wir versuchen, Sie per E-Mail zu informieren. Es liegt jedoch in Ihrer Verantwortung, regelmäßig die aktuellen AGB zu überprüfen.",
          serviceChanges:
            "Wir behalten uns ferner vor, Funktionen der Plattform zu ändern, zu erweitern oder einzustellen, ohne dass Ihnen hieraus Ansprüche entstehen.",
        },
        governingLaw: {
          title: "9. Anwendbares Recht und Gerichtsstand",
          content:
            "Diese AGB unterliegen ausschließlich deutschem Recht unter Ausschluss des UN-Kaufrechts. Maßgeblich ist deutsches Recht.",
          jurisdiction:
            "Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesen AGB ist, sofern gesetzlich zulässig, der Sitz des Anbieters in Deutschland. Dies gilt auch für Verbraucher, die ihren Wohnsitz oder gewöhnlichen Aufenthaltsort außerhalb Deutschlands haben, sofern der Anbieter keine Niederlassung im Staat des Verbrauchers unterhält.",
        },
        contact: {
          title: "10. Kontakt und Beschwerden",
          content:
            "Bei Fragen, Anregungen oder Beschwerden zu diesen AGB können Sie sich jederzeit an uns wenden. Wir bemühen uns, Ihre Anfragen zeitnah zu beantworten:",
          email: "E-Mail",
        },
      },
      // Imprint
      imprint: {
        title: "Impressum",
        lastUpdated: "Zuletzt aktualisiert",
        responsibility: {
          title: "Angaben gemäß § 5 TMG",
          name: "Verantwortlich für den Inhalt",
          address: "Adresse",
          content:
            "Diese Website wird als privates Spaßprojekt betrieben und dient ausschließlich persönlichen Zwecken ohne kommerzielle Absichten.",
        },
        contact: {
          title: "Kontakt",
          email: "E-Mail",
          phone: "Telefon",
          content:
            "Bei Fragen, Anregungen oder Beschwerden können Sie uns jederzeit kontaktieren. Wir bemühen uns, Ihre Anfragen zeitnah zu beantworten.",
        },
        hosting: {
          title: "Hosting und technische Infrastruktur",
          content:
            "Die Domain und das Hosting werden von All Inkl Neue Münchner Medien bereitgestellt. Das Hosting der Website erfolgt über Vercel, der Server befindet sich in Frankfurt, Deutschland.",
          domainProvider: "Domain-Provider: All Inkl Neue Münchner Medien",
          hostingProvider: "Hosting-Provider: Vercel",
          serverLocation: "Server-Standort: Frankfurt, Deutschland",
        },
        disclaimer: {
          title: "Haftungsausschluss",
          content: {
            title: "Haftung für Inhalte",
            intro:
              "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.",
            responsibility:
              "Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.",
            liability:
              "Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.",
          },
          links: {
            title: "Haftung für Links",
            intro:
              "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.",
            responsibility:
              "Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.",
            investigation:
              "Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverstößen werden wir derartige Links umgehend entfernen.",
          },
          userContent: {
            title: "Haftung für Nutzerinhalte",
            content:
              "Die Verantwortung für die Inhalte, die Nutzer auf der Plattform erstellen (z.B. Trainingsnamen, Beschreibungen), liegt ausschließlich bei den jeweiligen Nutzern. Wir übernehmen keine Haftung für unangemessene, irreführende oder anstößige Inhalte, die von Nutzern erstellt werden. Wir behalten uns vor, solche Inhalte zu entfernen, sobald wir davon Kenntnis erlangen.",
          },
          health: {
            title: "Keine Gesundheitsdaten",
            content:
              "Diese Plattform erfasst keine Gesundheitsdaten im medizinischen Sinne. Sollten Nutzer in Trainingsnamen oder sonstigen Feldern medizinische Daten oder andere sensible Informationen angeben, sind sie hierfür selbst verantwortlich. Wir übernehmen keine Haftung für die Verwendung solcher Informationen.",
          },
        },
        copyright: {
          title: "Urheberrecht",
          content:
            "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
          prohibition:
            "Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.",
          violation:
            "Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.",
        },
        dataProtection: {
          title: "Datenschutz",
          content:
            "Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies stets im Rahmen der geltenden Datenschutzgesetze, insbesondere der Datenschutz-Grundverordnung (DSGVO).",
          link: "Weitere Informationen finden Sie in unserer ausführlichen Datenschutzerklärung.",
          noTracking:
            "Wir verwenden keine Tracking-Cookies oder Analysetools. Alle verwendeten Cookies sind technischer Natur und für die Grundfunktionen der Website erforderlich.",
        },
      },
      // Validation Messages
      validation: {
        invalidEmail: "Ungültige E-Mail-Adresse",
        passwordMin: "Passwort muss mindestens 6 Zeichen lang sein",
        passwordMinLength: "Passwort muss mindestens 8 Zeichen lang sein",
        passwordMin8: "Passwort muss mindestens 8 Zeichen lang sein",
        passwordUpperCase:
          "Passwort muss mindestens einen Großbuchstaben enthalten",
        passwordLowerCase:
          "Passwort muss mindestens einen Kleinbuchstaben enthalten",
        passwordNumber: "Passwort muss mindestens eine Zahl enthalten",
        passwordComplexity:
          "Passwort muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben sowie eine Zahl enthalten",
        passwordMatch: "Passwörter stimmen nicht überein",
        passwordsDoNotMatch: "Passwörter stimmen nicht überein",
        nameMin: "Name muss mindestens 2 Zeichen lang sein",
        firstNameMin: "Vorname muss mindestens 2 Zeichen lang sein",
        lastNameMin: "Nachname muss mindestens 2 Zeichen lang sein",
        subjectMin: "Betreff muss mindestens 5 Zeichen lang sein",
        messageMin: "Nachricht muss mindestens 10 Zeichen lang sein",
        passwordsNotMatch: "Passwörter stimmen nicht überein",
        termsRequired: "Sie müssen den Nutzungsbedingungen zustimmen",
        codeLength: "2FA-Code muss genau 6 Zeichen lang sein",
        codeNumbers: "2FA-Code darf nur Zahlen enthalten",
      },
      // Common
      common: {
        save: "Speichern",
        saving: "Wird gespeichert...",
        cancel: "Abbrechen",
        confirm: "Bestätigen",
        delete: "Löschen",
        edit: "Bearbeiten",
        close: "Schließen",
        back: "Zurück",
        next: "Weiter",
        previous: "Zurück",
        submit: "Absenden",
        reset: "Zurücksetzen",
        loading: "Laden...",
        error: "Fehler",
        success: "Erfolgreich",
        warning: "Warnung",
        info: "Information",
        yes: "Ja",
        no: "Nein",
        search: "Suche",
        notificationsCenter: {
          title: "Benachrichtigungen",
          ariaLabel: "Benachrichtigungen",
          ariaLabelUnread: "{{count}} ungelesen",
          empty: "Keine neuen Benachrichtigungen.",
          notificationTitleDefault: "Benachrichtigung",
          loadError: "Benachrichtigungen konnten nicht geladen werden.",
          markReadError: "Fehler beim Markieren als gelesen.",
          unknownError: "Unbekannter Fehler",
          timeAgoFallback: "Vor einiger Zeit",
          push: {
            title: "Push-Benachrichtigungen aktivieren",
            blocked:
              "Benachrichtigungen sind aktuell im Browser blockiert. Erlaube Mitteilungen in den Einstellungen deines Geräts, um Updates zu erhalten.",
            prompt:
              "Erhalte Auszeichnungen und Freundes-Updates direkt als Mitteilung auf deinem Gerät.",
            enable: "Jetzt aktivieren",
            enabling: "Aktiviere...",
            openSettings: "In Einstellungen aktivieren",
            requestError:
              "Push-Benachrichtigungen konnten nicht aktiviert werden.",
          },
        },
        developedWith: "Entwickelt mit",
        by: "von",
        copyright: "© 2025 Sportify. Entwickelt mit ❤️ von Leon Stadler.",
        displayPreview: "Anzeige:",
        optional: "(optional)",
        agreeTerms: "Ich stimme den",
        termsOfService: "Nutzungsbedingungen",
        and: "und der",
        privacyPolicy: "Datenschutzerklärung",
        to: "zu",
        versionUpdateTitle: "Neue Version verfügbar",
        versionUpdateDescription:
          "Version {{version}} ist verfügbar. Schau dir den Changelog an.",
        versionUpdateAction: "Changelog",
        versionUpdateActionAlt: "Changelog öffnen",
      },
    },
  },
  en: {
    translation: {
      // Navigation
      navigation: {
        dashboard: "Dashboard",
        scoreboard: "Scoreboard",
        stats: "Statistics",
        training: "Training",
        exercises: "Exercises",
        profile: "Profile",
        admin: "Admin",
        settings: "Settings",
        logout: "Logout",
        friends: "Friends",
        navigation: "Navigation",
        administration: "Administration",
        mainNavigation: "Main navigation",
        settingsGroup: "Settings",
        accountMenu: "My account",
      },
      friends: {
        title: "Friends",
        subtitle: "Connect with other athletes and compare your performance.",
        tabs: {
          friends: "My Friends",
          requests: "Requests",
          search: "Find",
        },
        list: {
          title: "My Friends ({{count}})",
          emptyTitle: "No friends added yet.",
          emptyHint: "Use search to find other athletes!",
          profile: "Profile",
          remove: "Remove",
        },
        requests: {
          incomingTitle: "Incoming requests ({{count}})",
          outgoingTitle: "Outgoing requests ({{count}})",
          noIncoming: "No incoming requests.",
          noOutgoing: "No sent requests.",
          accept: "Accept",
          decline: "Decline",
          cancel: "Withdraw",
        },
        search: {
          title: "Find other athletes",
          placeholder: "Search name or email...",
          noUsers: "No users found.",
          inviteTitle: "Invite someone",
          inviteDescription:
            "That person wasn’t found. Invite them to use Sportify.",
          requestAction: "Request",
        },
        errors: {
          loadFriends: "Error loading friends.",
          loadRequests: "Error loading requests.",
          invalidServerResponse: "Invalid server response. Please try again.",
          invalidServerResponseShort:
            "Invalid server response. Please refresh the page.",
          unknown: "An unknown error occurred.",
          notLoggedIn: "Not logged in.",
          removeFriend: "Error removing friend.",
          handleRequest: "Error handling request.",
          cancelRequest: "Error withdrawing request.",
          searchUsers: "Error searching users.",
          sendRequest: "Error sending request.",
        },
        toasts: {
          removingFriend: "Removing friend...",
          removedFriend: "{{name}} was removed from your friends list.",
          processingRequest: "Processing request...",
          sendingRequest: "Sending request to {{name}}...",
          requestAccepted: "Request accepted.",
          requestDeclined: "Request declined.",
          cancelingRequest: "Withdrawing request...",
          requestCanceled: "Request to {{name}} was withdrawn.",
          requestSent: "Friend request sent to {{name}}.",
        },
        invitePage: {
          loading: "Loading invitation...",
          title: "Friend invitation",
          description: "{{name}} wants to add you as a friend",
          promptAuthenticated: "Do you want to add {{name}} as a friend?",
          promptUnauthenticated:
            "To add {{name}} as a friend, please log in.",
          accept: "Accept",
          later: "Later",
          sending: "Sending...",
          confirmInfo: "The friendship will be created immediately.",
          login: "Log in",
          register: "Register",
          registerInfo: "If you don't have an account yet, you can register.",
          success: {
            friendshipCreatedTitle: "Friendship created",
            friendshipCreatedDesc: "You're now friends with {{name}}.",
            requestSentTitle: "Friend request sent",
            requestSentDesc: "A friend request has been sent to {{name}}.",
          },
          errors: {
            invalidLink: "Invalid invitation link.",
            invalidOrExpired: "Invitation link is invalid or expired.",
            selfInvite: "You can't send a friend request to yourself.",
            sendRequest: "Error sending friend request.",
            sendRequestTitle: "Error sending friend request",
            unknown: "An unknown error occurred.",
          },
        },
      },
      inviteFriendForm: {
        emailLabel: "Email address",
        emailPlaceholder: "friend@example.com",
        nameHint: "They can enter their name during registration.",
        actions: {
          sending: "Sending...",
          sendInvite: "Send invitation",
          sendRequest: "Send friend request",
          cancel: "Cancel",
        },
        info: {
          inviteAlreadySentTitle: "Invitation already sent",
          inviteAlreadySentDesc:
            "An invitation has already been sent to {{email}}.",
        },
        success: {
          inviteSentTitle: "Invitation sent",
          inviteSentDesc: "An invitation was sent to {{target}}.",
          requestSentTitle: "Friend request sent",
          requestSentDesc: "A friend request was sent to {{target}}.",
        },
        errors: {
          enterEmail: "Please enter an email address.",
          invalidEmail: "Please enter a valid email address.",
          sendInvite: "Error sending invitation",
          sendRequest: "Error sending friend request",
          unknown: "An unknown error occurred.",
        },
        userExists: {
          title: "User already registered",
          description: "The email address {{email}} is already registered.",
          nameLabel: "The user is {{name}}.",
          question:
            "Would you like to send a friend request to this person instead?",
        },
      },
      // Filters & pagination
      filters: {
        periodLabel: "Time range",
        rangePlaceholder: "Select dates",
        previous: "Previous",
        next: "Next",
        prev: "Previous",
        itemsPerPage: "Per page:",
        filter: "Filter",
        title: "Filters",
        all: "All",
        show: "Show filters",
        hide: "Hide filters",
        sort: "Sort by",
        reset: "Reset filters",
        sortNone: "None",
        sortName: "Name",
        sortCategory: "Category",
        sortDiscipline: "Discipline",
        sortMeasurement: "Units",
        sortWeight: "Weight",
        sortDifficulty: "Difficulty",
        sortNewest: "Newest",
        viewGrid: "Grid",
        viewTable: "Table",
        previousPeriod: "Previous period",
        nextPeriod: "Next period",
        alreadyCurrent: "Already current",
        current: "Current",
        pageLabel: "{{current}} / {{total}}",
        pageSummary: "{{start}}–{{end}} / {{total}}",
        itemSummary: "{{start}}–{{end}} of {{total}}",
        period: {
          all: "All time",
          week: "Week",
          month: "Month",
          quarter: "Quarter",
          year: "Year",
          custom: "Custom range",
          currentWeek: "This week",
          currentMonth: "This month",
          currentQuarter: "This quarter",
          currentYear: "This year",
        },
      },
      // Auth
      auth: {
        login: "Login",
        register: "Register",
        logout: "Logout",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        firstName: "First Name",
        lastName: "Last Name",
        nickname: "Nickname",
        forgotPassword: "Forgot Password?",
        rememberMe: "Stay logged in",
        resetPassword: "Reset Password",
        backToLogin: "Back to Login",
        createAccount: "Create Account",
        alreadyHaveAccount: "Already have an account?",
        noAccount: "Don't have an account?",
        enable2FA: "Enable 2FA",
        disable2FA: "Disable 2FA",
        twoFactorCode: "2FA Code",
        verifyEmail: "Verify Email",
        resendVerification: "Resend Verification",
        emailVerified: "Email Verified",
        inviteUsers: "Invite Users",
        deleteAccount: "Delete Account",
        confirmDelete: "Confirm Deletion",
        passwordDialog: {
          titleFallback: "Password required",
          descriptionFallback: "Please enter your password.",
          label: "Password",
          placeholder: "Enter password",
          enterPassword: "Please enter a password.",
          processing: "Processing...",
          error: "An error occurred.",
        },
        invitation: {
          acceptedTitle: "Friendship accepted",
          acceptedDesc: "The friendship was created successfully!",
          errorTitle: "Error",
          errorDesc: "Error accepting invitation",
        },
        twoFactorSetup: {
          title: "Set up 2FA",
          description: "Set up two-factor authentication for your account.",
          initializing: "Initializing 2FA...",
          ready: "Ready...",
          invalidServerResponse: "Invalid response from server",
          initError: "Error initializing 2FA",
          scanQr:
            "Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy, Microsoft Authenticator):",
          qrAriaLabel: "QR code for 2FA setup",
          manualEntryLabel: "Or enter this code manually:",
          copy: "Copy",
          copied: "Copied",
          verifyInstruction:
            "After scanning or entering the code, enter the 6-digit code from your app to complete setup.",
          codeLabel: "6-digit code from your app:",
          verifyButton: "Verify code",
          verifying: "Processing...",
          enterSixDigits: "Please enter a 6-digit code.",
          invalidCode: "Invalid code. Please try again.",
          enabledTitle: "2FA enabled",
          enabledDesc:
            "Two-factor authentication was enabled successfully.",
          copySecretSuccessTitle: "Copied",
          copySecretSuccessDesc: "Secret key copied to clipboard.",
          copySecretErrorTitle: "Error",
          copySecretErrorDesc: "Could not copy secret key.",
          copyCodesSuccessTitle: "Copied",
          copyCodesSuccessDesc: "Recovery codes copied to clipboard.",
          copyCodesErrorTitle: "Error",
          copyCodesErrorDesc: "Could not copy recovery codes.",
          downloadTitle: "Download started",
          downloadDesc: "Recovery codes downloaded.",
          backupTitle: "Important:",
          backupDesc:
            "Store these recovery codes in a safe place. You can use them to access your account if you lose access to your authenticator app.",
          backupLabel: "Your recovery codes:",
          backupSingleUse:
            "Each code can only be used once. Make sure to store these codes safely.",
          complete: "Done",
        },
        twoFactorLogin: {
          title: "Two-Factor Authentication",
          description:
            "Please enter the 6-digit code from your authenticator app to complete sign-in.",
          codeLabel: "2FA Code",
          codePlaceholder: "000000",
          codeHint: "Enter the 6-digit code from your authenticator app",
          lost2fa: "Lost 2FA?",
          backupCodeLabel: "Backup code",
          backupCodePlaceholder: "XXXX-XXXX-XXXX",
          backupCodeHint:
            "Enter one of the backup codes you received when setting up 2FA",
          backToCode: "Back to 2FA code",
          back: "Back",
          submit: "Sign in",
        },
        recoveryCodes: {
          title: "New recovery codes",
          description:
            "Your recovery codes have been reset. Store these new codes safely.",
          copy: "Copy",
          copied: "Copied",
          download: "Download",
          done: "Done",
        },
      },
      // Profile
      profile: {
        title: "Profile",
        subtitle: "Manage your personal settings and goals",
        personalInfo: "Personal Information",
        displayPreferences: "Display Preferences",
        displayName: "Display Name",
        useNickname: "Use Nickname",
        useFirstName: "Use First Name",
        useFullName: "Use Full Name",
        publicProfile: "Public Profile",
        accountSettings: "Account Settings",
        security: "Security",
        privacy: "Privacy",
        tabs: {
          profile: "Profile",
          security: "Security",
          preferences: "Preferences",
          achievements: "Achievements",
          goals: "Weekly Goals",
          danger: "Danger Zone",
        },
        achievements: {
          awards: "Awards",
          badges: "Badges",
          progress: "Progress",
          level: "Level",
          noAwards: "No awards yet.",
          noAwardsHint: "Train regularly to earn awards!",
          noBadges: "No badges yet.",
          noBadgesHint: "Reach milestones to unlock badges!",
          timesAchieved: "times achieved",
          startYourJourney: "Start your journey!",
          startYourJourneyDescription:
            "Complete workouts and reach your goals to collect badges and awards. Every success counts!",
        },
        profileInfo: "Profile Information",
        emailVerification: "Email Verification",
        emailVerified: "✓ Your email is verified",
        emailNotVerified: "⚠ Please verify your email address",
        administrator: "Administrator",
        firstName: "First Name",
        lastName: "Last Name",
        nickname: "Nickname (optional)",
        nicknameLabel: "Nickname",
        nicknameRequired:
          "If 'Nickname' is selected as display name, a nickname must be provided.",
        nicknameNoSpaces: "A nickname must not contain spaces.",
        nicknameInvalidFormat:
          "A nickname may only contain letters, numbers, and underscores.",
        nicknameTaken: "This nickname is already taken.",
        firstNamePlaceholder: "First Name",
        lastNamePlaceholder: "Last Name",
        nicknamePlaceholder: "Nickname",
        displayNameLabel: "Display Name",
        firstNameOption: "First Name",
        fullNameOption: "Full Name",
        nicknameOption: "Nickname",
        nicknameNotSet: "(no nickname set)",
        nicknameRequiredForDisplay:
          "Please enter a nickname to use this option.",
        required: "*",
        updateProfile: "Update Profile",
        saving: "Saving...",
        profileUpdated: "Profile Updated",
        profileUpdatedDesc:
          "Your profile information has been successfully saved.",
        validationError: "Validation Error",
        fillRequiredFields: "Please fill in all required fields.",
        firstNameRequired: "First name is a required field.",
        lastNameRequired: "Last name is a required field.",
        profileSaveError: "Error saving profile",
        inviteFriends: "Invite Friends",
        inviteFriendsDesc: "Invite your friends and train together!",
        yourInviteLink: "Your Invite Link",
        linkCopied: "Link Copied",
        linkCopiedDesc: "Invitation link has been copied to clipboard.",
        linkCopyError: "Could not copy link.",
        invitedFriends: "Invited Friends",
        loadingInvitations: "Loading...",
        noInvitations: "No invitations sent yet.",
        invitationStatus: {
          accepted: "Accepted",
          expired: "Expired",
          pending: "Pending",
        },
        invitationResend: "Resend",
        invitationResent: "Invitation resent",
        invitationResentDesc: "The invitation was resent successfully.",
        invitationResendError: "Error resending invitation",
        invitationResendErrorDesc: "Error resending the invitation",
        invitationDeleted: "Invitation deleted",
        invitationDeletedDesc: "The invitation was deleted successfully.",
        invitationDeleteError: "Error deleting",
        invitationDeleteErrorDesc: "Error deleting the invitation",
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        passwordMismatch: "Passwords do not match.",
        passwordTooShort: "Password must be at least 8 characters long.",
        currentPasswordRequired: "Please enter your current password.",
        newPasswordRequired: "Please enter a new password.",
        passwordChanging: "Changing...",
        passwordChanged: "Password changed",
        passwordChangedDesc: "Your password has been changed successfully.",
        passwordChangeError: "Error changing password",
        passwordChangeInDevelopment: "Feature in Development",
        passwordChangeInDevelopmentDesc:
          "Password change will be available soon.",
        twoFactorAuth: "Two-Factor Authentication",
        enable2FA: "Enable 2FA",
        enable2FADesc: "Additional security for your account",
        status: "Status",
        activated: "✓ Activated",
        deactivated: "○ Deactivated",
        twoFactorDetails: "2FA Details",
        enabledAt: "Enabled on:",
        notAvailable: "Not available",
        resetRecoveryKeys: "Reset recovery keys",
        recoveryKeysReset: "Recovery keys reset",
        recoveryKeysResetDesc: "New recovery keys were generated successfully.",
        recoveryKeysResetError: "Error resetting recovery keys",
        disable2FATitle: "Disable 2FA",
        disable2FAError: "Error disabling 2FA",
        disable2FA: "2FA Disabled",
        disable2FADesc:
          "Two-factor authentication has been successfully disabled.",
        enable2FASuccess: "2FA Enabled",
        enable2FASuccessDesc:
          "Two-factor authentication has been successfully enabled.",
        disable2FAPrompt: "Please enter your password to disable 2FA:",
        accountSecurity: "Account Security",
        created: "Created",
        lastLogin: "Last Login",
        lastPasswordChange: "Last password change",
        never: "Never",
        neverChanged: "Never changed",
        emailVerifiedStatus: "Email Verified",
        yes: "Yes",
        no: "No",
        verified: "✓ Verified",
        notVerified: "⚠ Not verified",
        deleteAccount: "Delete Account",
        confirmDeleteAccount:
          "Do you really want to delete your account? This action cannot be undone.",
        deleteAccountPasswordPrompt:
          "Please enter your password to delete the account:",
        accountDeleted: "Account Deleted",
        accountDeletedDesc: "Your account has been successfully deleted.",
        deleteAccountError: "Error deleting account",
        deleteAccountConfirmText: "DELETE",
        deleteAccountDialogTitle: "Delete account",
        deleteAccountDialogDesc:
          "Do you really want to delete your account? This action cannot be undone. All your data will be permanently deleted.",
        deleteAccountDialogPrompt: "Type {{text}} to continue:",
        deleteAccountDialogHint:
          'Please type exactly "{{text}}" (uppercase required).',
        deleteAccountDialogContinue: "Continue",
        deleteAccountPasswordTitle: "Delete account",
        deleteAccountPasswordDesc:
          "Please enter your password to confirm deleting your account.",
        deleteAccountPasswordLabel: "Password for confirmation:",
        deleteAccountPasswordPlaceholder: "Enter your password",
        deleteAccountPasswordRequired: "Please enter your password.",
        deletingAccount: "Deleting...",
        dangerZone: "Danger Zone",
        deleteAccountWarning:
          "If you delete your account, all your data will be permanently deleted. This action cannot be undone. All your training data, achievements, friendships, and settings will be lost.",
        deleteAccountList: {
          data: "All your training data will be deleted",
          achievements: "Your achievements and stats will be lost",
          friendships: "All friendships will be removed",
          profile: "Your profile will no longer be accessible",
          irreversible: "This action is permanent and cannot be undone",
        },
        userPreferences: "User Preferences",
        userPreferencesDesc: "Customize the app to your preferences",
        language: "Language",
        timeFormat: "Time Format",
        timeFormat24h: "24-Hour (14:30)",
        timeFormat12h: "12-Hour (2:30 PM)",
        theme: "Theme",
        themeSystem: "Device",
        themeLight: "Light",
        themeDark: "Dark",
        unitsPreferences: "Unit Preferences",
        unitsPreferencesDesc: "Choose your preferred units for measurements",
        distance: "Distance",
        distanceKm: "Kilometers (km)",
        distanceM: "Meters (m)",
        distanceMiles: "Miles",
        distanceYards: "Yards",
        weight: "Weight",
        weightKg: "Kilograms (kg)",
        weightLbs: "Pounds (lbs)",
        weightStone: "Stone",
        temperature: "Temperature",
        temperatureCelsius: "Celsius (°C)",
        temperatureFahrenheit: "Fahrenheit (°F)",
        appSettings: "App Settings",
        pushNotifications: "Push Notifications",
        pushNotificationsDesc:
          "Receive notifications for new activities and friend requests",
        emailNotifications: "Email Notifications",
        emailNotificationsDesc: "Weekly summary of your progress",
        publicProfileSetting: "Public Profile",
        publicProfileDesc: "Other users can see your profile and activities",
        globalRankingSetting: "Show in global leaderboard",
        globalRankingDesc:
          "Your profile appears in global stats and leaderboards for all users",
        saveAllSettings: "Save All Settings",
        settingsSaved: "Settings Saved",
        settingsSavedDesc: "Your preferences have been successfully updated.",
        settingsError: "Error saving settings",
        achievementsAndStats: "Achievements & Statistics",
        achievementsComingSoon:
          "Achievements and detailed statistics will be available soon.",
        avatarSaved: "Avatar Saved",
        avatarSavedDesc: "Your avatar has been successfully updated.",
        avatarError: "Error saving avatar",
        avatarRemoved: "Avatar removed",
        avatarRemovedDesc: "Your profile picture was removed successfully.",
        avatarRemoveError: "Error removing avatar",
        removeAvatar: "Remove avatar",
        avatarEditor: {
          title: "Create avatar",
          description: "Customize your avatar to your liking",
          randomize: "Generate randomly",
          tabs: {
            face: "Face",
            hair: "Hair",
            accessories: "Accessories",
            other: "Other",
          },
          labels: {
            gender: "Gender",
            faceColor: "Face color",
            earSize: "Ear size",
            eyeStyle: "Eye shape",
            noseStyle: "Nose shape",
            mouthStyle: "Mouth shape",
            hairStyle: "Hair style",
            hairColor: "Hair color",
            hat: "Hat",
            hatColor: "Hat color",
            glasses: "Glasses",
            clothing: "Clothing",
            clothingColor: "Clothing color",
            backgroundColor: "Background color",
          },
          options: {
            gender: { man: "Man", woman: "Woman" },
            faceColor: {
              light: "Light",
              dark: "Dark",
              medium: "Medium",
              pink: "Pink",
              yellow: "Yellow",
            },
            earSize: { big: "Large", small: "Small" },
            eyeStyle: { circle: "Round", oval: "Oval", smile: "Smile" },
            noseStyle: { short: "Short", long: "Long", round: "Round" },
            mouthStyle: { laugh: "Laugh", smile: "Smile", peace: "Peace" },
            hairStyle: {
              normal: "Normal",
              thick: "Thick",
              mohawk: "Mohawk",
              womanLong: "Long (Woman)",
              womanShort: "Short (Woman)",
            },
            hairColor: {
              black: "Black",
              brown: "Brown",
              blonde: "Blonde",
              red: "Red",
              gold: "Gold",
              gray: "Gray",
              white: "White",
            },
            hat: { none: "No hat", beanie: "Beanie", turban: "Turban" },
            hatColor: {
              black: "Black",
              white: "White",
              red: "Red",
              blue: "Blue",
              green: "Green",
              orange: "Orange",
            },
            glasses: { none: "No glasses", round: "Round", square: "Square" },
            clothing: { polo: "Polo", short: "T-shirt", hoody: "Hoodie" },
            clothingColor: {
              pink: "Pink",
              blue: "Blue",
              green: "Green",
              red: "Red",
              yellow: "Yellow",
              lightGreen: "Light green",
              black: "Black",
              white: "White",
            },
            backgroundColor: {
              beige: "Beige",
              brown: "Brown",
              orange: "Orange",
              yellow: "Yellow",
              peach: "Peach",
              blue: "Blue",
              green: "Green",
              pink: "Pink",
              white: "White",
              black: "Black",
            },
          },
          actions: { cancel: "Cancel", save: "Save" },
        },
        logo: {
          title: "Sportify",
          byline: "by Leon Stadler",
        },
        loading: "Loading...",
        error: "Error",
        german: "German",
        english: "English",
        weeklyGoalsTitle: "Weekly Goals",
        weeklyGoalsDesc:
          "Adjust your weekly goals to your preferences. Progress updates automatically based on your trainings.",
        weeklyGoalsSaving: "Saving...",
        weeklyGoalsSaveAction: "Save weekly goals",
        monthlyGoalTitle: "Monthly goal",
        monthlyGoalDesc:
          "Set your activity level so your monthly goal stays realistic.",
        activityLevelLabel: "Activity level",
        activityLevelLow: "Beginner",
        activityLevelMedium: "Intermediate",
        activityLevelHigh: "Very active",
        activityLevelHint:
          "This influences the automatic monthly goal, especially if you don't have much history yet.",
      },
      badges: {
        categories: {
          weekly: "Weekly",
          monthly: "Monthly",
          lifetime: "Lifetime",
        },
        slugs: {
          "weekly-goal-exercises": {
            label: "Weekly goal (Exercises)",
            description:
              "Reach your personal weekly exercise goal {{threshold}} times.",
          },
          "weekly-goal-points": {
            label: "Weekly goal (Points)",
            description: "Reach your weekly points goal {{threshold}} times.",
          },
          "weekly-challenge-points": {
            label: "Weekly challenge",
            description:
              "Complete the weekly challenge successfully {{threshold}} times.",
          },
          "monthly-challenge-points": {
            label: "Monthly challenge",
            description:
              "Complete the monthly challenge successfully {{threshold}} times.",
          },
          "lifetime-pushups": {
            label: "First {{threshold}} push-ups",
            description: "Complete a total of {{threshold}} push-ups.",
          },
          "lifetime-pullups": {
            label: "First {{threshold}} pull-ups",
            description: "Complete a total of {{threshold}} pull-ups.",
          },
          "lifetime-situps": {
            label: "First {{threshold}} sit-ups",
            description: "Complete a total of {{threshold}} sit-ups.",
          },
          "lifetime-running": {
            label: "First {{threshold}} running kilometers",
            description: "Run a total of {{threshold}} kilometers.",
          },
          "lifetime-cycling": {
            label: "First {{threshold}} cycling kilometers",
            description: "Ride a total of {{threshold}} kilometers.",
          },
        },
        icons: {
          "badge-weekly-goal-exercises": "Weekly goal exercises",
          "badge-weekly-goal-points": "Weekly goal points",
          "badge-weekly-challenge": "Weekly challenge",
          "badge-monthly-challenge": "Monthly challenge",
          "badge-pushups": "Push-ups",
          "badge-pullups": "Pull-ups",
          "badge-situps": "Sit-ups",
          "badge-running": "Running",
          "badge-cycling": "Cycling",
        },
        notifications: {
          earnedTitle: "Badge earned",
          earnedMessage: 'You earned the "{{badge}}" badge.',
        },
      },
      // NotFound
      notFound: {
        title: "Page not found",
        description:
          "The page you are looking for does not exist or has been moved.",
        backHome: "Back to Home",
      },
      // Dashboard
      dashboard: {
        welcome: "Welcome",
        welcomeMessage: "Welcome back, {{name}}!",
        overview: "Overview",
        recentActivity: "Recent Activity",
        statistics: "Statistics",
        performance: "Performance",
        goals: "Goals",
        achievements: "Achievements",
        title: "Dashboard",
        subtitle: "Your sports progress at a glance",
        loadingProgress: "Loading your sports progress...",
        totalPoints: "Total Points",
        pullups: "Pull-ups",
        runningDistance: "Running Distance",
        rank: "Rank",
        topExercise: "Top exercise",
        thisWeek: "this week",
        ofAthletes: "of {{count}} athletes",
        weeklyGoals: "Weekly Goals",
        goal: "Goal",
        pushups: "Push-ups",
        running: "Running",
        cycling: "Cycling",
        error: "Error",
        errorLoadingData: "Error loading dashboard data",
        errorLoadingWorkouts: "Recent workouts could not be loaded.",
        pleaseLoginWorkouts: "Please log in to see your recent workouts.",
        unexpectedFormat: "Unexpected data format for workouts received.",
        workoutsNotLoaded: "Recent workouts could not be loaded.",
        activityTypes: {
          pullup: "Pull-ups",
          pushup: "Push-ups",
          running: "Running",
          cycling: "Cycling",
        },
        cardMeta: {
          auto: "Auto selection",
          manual: "Manual",
          autoRank: "Auto top exercise #{{rank}}",
          manualSelected: "Manually selected",
        },
        manualExercise: "Manual exercise",
        timeAgo: {
          minutes: "{{count}} minutes ago",
          hours: "{{count}} hours ago",
          yesterday: "yesterday",
          days: "{{count}} days ago",
          unknown: "Unknown",
        },
        notAuthenticated: "Not authenticated",
        saveError: "Error saving",
        saveGoalsError: "Error saving goals",
        thisMonth: "this month",
        thisQuarter: "this quarter",
        thisYear: "this year",
        points: "Points",
        workouts: "Number of workouts",
        monthlyGoalAutoAdjust:
          "Your monthly goal adjusts automatically based on your recent months.",
        settings: {
          title: "Configure dashboard cards",
          description: "Adjust the displayed cards and time ranges to your preferences.",
          button: "Edit cards",
          short: "Cards",
          card: "Card",
          type: "Type",
          period: "Period",
          color: "Color",
          activityMode: "Selection",
          activityAuto: "Auto top exercise",
          activityCustom: "Select manually",
          activityMetric: "Metric",
          activityType: "Exercise",
          colors: {
            orange: "Orange",
            blue: "Blue",
            green: "Green",
            purple: "Purple",
            teal: "Teal",
            rose: "Rose",
            slate: "Gray",
          },
        },
      },
      // Weekly Challenge
      weeklyChallenge: {
        title: "Weekly Challenge",
        pleaseLogin:
          "Please log in to participate in the weekly challenge and collect points.",
        errorLoading: "Error loading weekly challenge",
        couldNotLoad: "The weekly challenge could not be loaded.",
        noData:
          "Currently no challenge data available. Start a workout to collect progress!",
        completed: "Completed",
        day: "Day",
        days: "Days",
        points: "Points",
        workoutsThisWeek: "{{count}} Workouts this week",
        progress: "Progress",
        leaderboard: "Leaderboard",
        collectPoints: "Collect points to get into the Top 10",
        bonusPointsSecured: "Bonus points secured",
        noActivitiesYet:
          "No activities yet this week. Be the first and collect points!",
        you: "You",
        kmRunning: "km Running",
        pullUps: "Pull-ups",
        pointsTarget: "Points Target",
        errorLoadingFriends: "Error loading friends",
        noFriendsYet:
          "You don't have any friends yet. Add friends to see them here.",
      },
      // Weekly Goals
      weeklyGoals: {
        saved: "Weekly goals saved",
        savedDescription: "Your weekly goals have been successfully updated.",
        saveError: "Error saving weekly goals",
        dialog: {
          title: "Set weekly goals",
          description:
            "Adjust your weekly goals according to your preferences.",
          current: "Current",
          pointsLabel: "Points goal",
          pointsUnit: "Points",
        },
        pointsTitle: "Weekly points goal",
        pointsDescription: "Set your personal points goal for this week.",
        pointsLabel: "Points",
        pointsHint: "Default challenge is usually 1500 points.",
      },
      // Activity Feed
      activityFeed: {
        title: "All training sessions by you and your friends",
        widgetTitle: "Activities",
        widgetSubtitle: "All activities from you and your friends",
        pleaseLogin: "Please log in to see activities.",
        unexpectedFormat: "Unexpected data format from server.",
        couldNotLoad: "Activities could not be loaded.",
        errorLoading: "The activity feed could not be loaded.",
        noActivities: "No activities from friends",
        addFriends: "Add friends to see their workouts!",
        noFriends: "You don't have any friends yet",
        addFriendsToSeeActivities: "Add friends to see their activities here.",
        goToFriends: "Go to Friends",
        points: "Points",
        repetitions: "repetitions",
        units: "units",
        inWorkout: 'in "{{title}}"',
        showAll: "Show all",
        showMore: "Show more",
        showAllActivities: "Show all activities",
        you: "You",
        timeAgoShort: {
          justNow: "just now",
          minutes: "{{count}} min ago",
          hours: "{{count}}h ago",
          hoursMinutes: "{{hours}}h {{minutes}}min ago",
          yesterday: "yesterday",
          days: "{{count}}d ago",
          weeks: "{{count}}w ago",
          months: "{{count}}m ago",
          years: "{{count}}y ago",
          unknown: "Unknown",
        },
        activityTypes: {
          pullups: "Pull-ups",
          pushups: "Push-ups",
          situps: "Sit-ups",
          running: "Running",
          cycling: "Cycling",
          unknown: "Unknown Activity",
        },
      },
      reactions: {
        errorTitle: "Error",
        loginRequired: "Please sign in.",
        errorMessage: "Action failed.",
        noReactions: "No reactions yet",
        countOnly: "{{count}} reactions",
        openPicker: "Choose reaction",
        reactWith: "React with {{emoji}}",
      },
      friendsActivities: {
        title: "Friend's activities",
        subtitle: "All training sessions by you and your friends",
        itemsPerPage: "Per page:",
        totalWorkouts: "{{count}} workouts found",
        noWorkouts: "No workouts found",
        noWorkoutsDescription:
          "No workouts were recorded in the selected time period.",
      },
      myWorkouts: {
        title: "My Workouts",
        subtitle: "All your training sessions at a glance",
        itemsPerPage: "Per page:",
        totalWorkouts: "{{count}} workouts found",
        noWorkouts: "No workouts found",
        noWorkoutsDescription:
          "No workouts were recorded in the selected time period.",
        errorLoading: "Error loading workouts",
      },
      friendProfile: {
        recentWorkouts: "Recent Activities",
        noWorkouts: "No workouts recorded yet.",
        awards: "Awards",
        noAwards: "No awards yet.",
        noBadges: "No badges yet.",
        level: "Level",
        awardLabel: "Award",
        joinedSince: "Member since {{date}}",
        backToFriends: "Back to Friends",
        notFriends: {
          title: "Friends only",
          description: "This profile is visible to friends only.",
          backToFriends: "Back to friends",
        },
        errors: {
          missingId: "No friend ID provided.",
          loadFailed: "Profile could not be loaded.",
          unknown: "Unknown error while loading profile.",
          notFound: "Profile not found.",
        },
      },
      // Scoreboard
      scoreboard: {
        title: "Scoreboard",
        subtitle: "Compare your performance with other athletes",
        mustBeLoggedIn: "You must be logged in to view the scoreboard.",
        leaderboard: "Leaderboard",
        errorLoading: "Error loading scoreboard",
        noData: "No data available for this leaderboard.",
        participateToAppear:
          "Participate in workouts to appear on the leaderboard.",
        notRanked: "Not ranked",
        activityTypes: {
          all: "All",
          pullups: "Pull-ups",
          pushups: "Push-ups",
          running: "Running",
          cycling: "Cycling",
          situps: "Sit-ups",
        },
        customExercisesTitle: "Pinned exercises",
        customExercisesDescription:
          "Choose up to three exercises that appear in addition to the top exercises.",
        customExercisesSelected: "{{count}} selected",
        customExercisesSelect: "Add exercise",
        customExercisesEmpty: "No exercises selected yet.",
        pinnedExercisesSaved: "Your exercise selection has been saved.",
        pinnedLimitTitle: "Maximum 3 exercises",
        pinnedLimitDescription: "You can pin up to three exercises.",
        scope: {
          friends: "Friends",
          global: "Global",
        },
        autoExercisesHint:
          "Automatically selected based on performance in the chosen period.",
        manualExercisesHint: "Manually selected exercise.",
        autoPersonal: "Top for you",
        autoFriends: "Top with friends",
        autoGlobal: "Top global",
        pinnedExercise: "Manually selected",
        periods: {
          all: "All Time",
          week: "Last 7 Days",
          month: "Last 30 Days",
          year: "Last Year",
        },
        units: {
          repetitions: "Reps",
          kilometers: "km",
          units: "Units",
          minutes: "min",
          amount: "Amount",
          points: "Points",
        },
        stats: {
          title: "Statistics",
          subtitle: "Detailed analysis of your athletic performance",
          thisWeek: "This Week",
          thisMonth: "This Month",
          thisQuarter: "This Quarter",
          thisYear: "This Year",
          overview: "Overview",
          training: "Training",
          recovery: "Recovery",
          balance: "Balance",
          totalPoints: "Total Points",
          totalWorkouts: "Workouts",
          totalDuration: "Training Time",
          points: "Points",
          pointsTrend: "Points Trend",
          trainingVolume: "Training Volume",
          rangeLabel: "Range: {{start}} – {{end}}",
          pullups: "Pull-ups",
          pushups: "Push-ups",
          situps: "Sit-ups",
          runningKm: "Running (km)",
          cyclingKm: "Cycling (km)",
          averagePointsPerWorkout: "Avg. points per workout: {{value}}",
          averageDurationPerWorkout: "Avg. duration per workout: {{value}}",
          readinessScore: "Readiness Score",
          readinessDescription: "Average readiness score: {{value}}",
          vsPreviousPeriod: "vs. previous period",
          activityBreakdown: "Activity Breakdown",
          noWorkoutData: "No training data available for this period.",
          longestWorkout: "Longest Workout",
          peakDay: "Peak Day",
          pointsWithUnit: "{{value}} points",
          consistency: "Training consistency: {{value}}%",
          recoveryEntries: "Recovery Diary",
          energy: "Energy",
          sleep: "Sleep Quality",
          soreness: "Soreness",
          exertion: "Perceived Exertion",
          hydration: "Hydration",
          sleepDuration: "Sleep Duration",
          restingHeartRate: "Resting Heart Rate",
          recoveryTrend: "Recovery Trend",
          recoveryTrendDescription:
            "Track energy, sleep quality and exertion over time.",
          noRecoveryData: "No recovery diary entries for this period.",
          moodDistribution: "Mood Distribution",
          readinessTrend: "Training & Readiness Balance",
          readinessLabel: "Readiness",
          balanceSummary: "Daily Balance",
          date: "Date",
          noData: "No analytics data is available for this period yet.",
          refreshing: "Refreshing data…",
          analyticsError: "Unable to load analytics",
          analyticsErrorDescription:
            "An error occurred while loading analytics data.",
          retry: "Try again",
          weeklyActivity: "Weekly Activity",
          monthlyActivity: "Monthly Activity",
          progress: "Progress",
        strengthTrainingTrend: "Strength Training Trend",
        strengthPoints: "Strength Points",
        enduranceTrend: "Endurance Trend",
        endurancePoints: "Endurance Points",
        personalRecords: "Personal Records",
        activityDistribution: "Activity Distribution",
      },
      },
      // Stats (Analytics)
      stats: {
        title: "Statistics",
        subtitle: "Detailed analysis of your athletic performance",
        thisWeek: "This Week",
        thisMonth: "This Month",
        thisQuarter: "This Quarter",
        thisYear: "This Year",
        overview: "Overview",
        training: "Training",
        recovery: "Recovery",
        balance: "Balance",
        totalPoints: "Total Points",
        totalWorkouts: "Workouts",
        activeDays: "Active days",
        activeDaysCount: "{{count}} active days",
        totalDuration: "Training time",
        points: "Points",
        pointsTrend: "Points trend",
        trainingVolume: "Training volume",
        chartMode: "Chart view",
        chartModeStacked: "Stacked",
        chartModeGrouped: "Side by side",
        zoomHint: "Zoom or narrow the range to explore details.",
        rangeLabel: "Period: {{start}} – {{end}}",
        customRange: "Custom range",
        pickRange: "Select dates",
        pullups: "Pull-ups",
        pushups: "Push-ups",
        situps: "Sit-ups",
        runningKm: "Running (km)",
        cyclingKm: "Cycling (km)",
        focus: "Focus",
        averagePointsPerWorkout: "Avg. points per workout: {{value}}",
        averageDurationPerWorkout: "Avg. duration per workout: {{value}}",
        readinessScore: "Readiness score",
        readinessDescription: "Average readiness score: {{value}}",
        vsPreviousPeriod: "vs. previous period",
        activityBreakdown: "Activity breakdown",
        noWorkoutData: "No training data available for this period.",
        longestWorkout: "Longest workout",
        peakDay: "Peak day",
        pointsWithUnit: "{{value}} points",
        consistency: "Training consistency: {{value}}%",
        recoveryEntries: "Recovery journal",
        energy: "Energy",
        sleep: "Sleep quality",
        soreness: "Soreness",
        exertion: "Exertion",
        hydration: "Hydration",
        sleepDuration: "Sleep duration",
        restingHeartRate: "Resting heart rate",
        recoveryTrend: "Recovery trend",
        recoveryTrendDescription:
          "Track your energy, sleep quality, and exertion over time.",
        noRecoveryData: "No recovery journal entries for this period.",
        moodDistribution: "Mood distribution",
        readinessTrend: "Training & readiness balance",
        readinessLabel: "Readiness",
        balanceSummary: "Daily balance",
        noBalanceData: "No balance data available for this period.",
        date: "Date",
        noData: "No analytics data available for this period yet.",
        refreshing: "Refreshing data …",
        analyticsError: "Unable to load analytics",
        analyticsErrorDescription:
          "An error occurred while loading analytics data.",
        retry: "Retry",
        customExercisesTitle: "Pinned exercises",
        customExercisesDescription:
          "Choose up to three exercises that appear in addition to your top exercises.",
        autoExercisesHint:
          "Default exercises are based on your activity in the selected period. You can pin additional exercises.",
        customExercisesToggle: "Customize exercises",
        customExercisesHide: "Hide",
        customExercisesSelected: "{{count}} selected",
        customExercisesSelect: "Add exercise",
        customExercisesEmpty: "No exercises selected yet.",
        pinnedLimitTitle: "Maximum 3 exercises",
        pinnedLimitDescription: "You can pin up to three exercises.",
        pinnedExercisesSaved: "Your exercise selection has been saved.",
        weeklyActivity: "Weekly activity",
        monthlyActivity: "Monthly activity",
        progress: "Progress",
        strengthTrainingTrend: "Strength training trend",
        strengthPoints: "Strength points",
        enduranceTrend: "Endurance trend",
        endurancePoints: "Endurance points",
        personalRecords: "Personal records",
        activityDistribution: "Activity distribution",
        correlationTitle: "Training & Recovery Correlations",
        correlationDescription:
          "See which recovery metrics move with your training load.",
        topCorrelations: "Strongest correlations",
        readinessDrivers: "Readiness drivers",
        notEnoughData: "Not enough data yet for this analysis.",
        samples: "{{count}} data points",
      },
      // Training
      training: {
        title: "Training",
        subtitle: "Enter your workouts and track your progress",
        trainingsDiary: "Training Diary",
        recoveryDiary: "Recovery Diary",
        newWorkout: "New workout",
        newWorkoutHint: "Add a workout or use a template.",
        yourWorkouts: "Previous Workouts",
        noWorkouts: "No workouts yet.",
        noWorkoutsForType: "No workouts found for {{type}}.",
        createFirstWorkout:
          "Create your first workout using the form {{location}}.",
        allExercises: "All Exercises",
        pullups: "Pull-ups",
        pushups: "Push-ups",
        situps: "Sit-ups",
        running: "Running",
        cycling: "Cycling",
        mustBeLoggedIn: "You must be logged in to view workouts.",
        editWindowInfo:
          "Workouts can only be edited within 7 days of their workout date.",
        loadError: "Error loading workouts",
        workoutsLoadError: "Workouts could not be loaded.",
        deleteConfirm: "Do you really want to delete this workout?",
        deleteError: "Error deleting workout",
        workoutDeleted: "Workout deleted",
        workoutDeletedSuccess: "The workout was successfully deleted.",
        deleteWorkoutError: "Workout could not be deleted.",
        edit: "Edit",
        delete: "Delete",
        templates: "Workout Templates",
        createTemplate: "Create template",
        noTemplates: "No templates found.",
        useTemplate: "Use template",
        searchTemplates: "Search templates",
        favorites: {
          add: "Add favorite",
          remove: "Remove favorite",
        },
        templatesOwn: "Your templates",
        templatesFriends: "Friends' templates",
        templatesPublic: "Public templates",
        sourceTemplateCredit: "Template by {{name}}",
        viewAllWorkouts: "View All",
        previous: "Previous",
        next: "Next",
        unknownDate: "Unknown date",
        fewMinutesAgo: "A few minutes ago",
        hoursAgo: "{{hours}} hours ago",
        yesterday: "Yesterday",
        recoveryDialog: {
          title: "Document recovery?",
          description:
            "Would you also like to document your recovery and regeneration for this training? You will be redirected to the recovery diary, where the workout is already linked.",
          noLater: "No, later",
          yesDocument: "Yes, document",
        },
        duration: {
          hours: "{{hours}}h {{minutes}}min",
          minutes: "{{minutes}}min",
        },
        location: {
          left: "on the left",
          above: "above",
        },
        form: {
          newWorkout: "Enter New Workout",
          editWorkout: "Edit Workout",
          workoutTitle: "Workout Title",
          duration: "Duration (Min., optional)",
          durationPlaceholder: "e.g. 60",
          date: "Date",
          dateRequired: "Date *",
          selectDate: "Select a date",
          time: "Time",
          timeRequired: "Time *",
          startTime: "Start Time",
          endTime: "End Time",
          toggleDurationEndTime: "Time instead of duration",
          description: "Description (optional)",
          addDescription: "Add description",
          hideDescription: "Hide description",
          descriptionPlaceholder: "Additional notes about your workout...",
          activities: "Activities",
          activitiesRequired: "Activities *",
          activity: "Activity",
          exercise: "Exercise",
          selectExercise: "Select an exercise",
          unit: "Unit",
          visibility: "Visibility",
          visibilityPrivate: "Private",
          visibilityFriends: "Friends",
          visibilityPublic: "Public",
          saveAsTemplate: "Save as template",
          exerciseSearch: "Find exercises",
          searchExercise: "Search exercise",
          sessionType: "Session Type",
          sessionStrength: "Strength",
          sessionCardio: "Cardio",
          sessionMixed: "Mixed",
          sessionClimbing: "Climbing/Bouldering",
          sessionMobility: "Mobility",
          difficulty: "Difficulty",
          rounds: "Rounds",
          restBetweenSets: "Default rest between sets (sec)",
          restBetweenActivities: "Rest between exercises (sec)",
          restBetweenRounds: "Rest between rounds (sec)",
          pauseSettings: "Rest settings",
          templateAttributes: "Template attributes",
          movementPatternHint: "Multi-select enabled, e.g. push + pull.",
          supersetGroup: "Superset",
          supersetGroupPlaceholder: "e.g. A",
          effort: "Effort (1-10)",
          restBetweenSetsOverride: "Rest between sets (sec)",
          restAfterActivity: "Rest after exercise (sec)",
          setDefaults: "Quick set builder",
          setCount: "Sets",
          applySetDefaults: "Create sets",
          dropSet: "Dropset",
          filterCategory: "Category",
          filterPattern: "Movement",
          filterType: "Unit type",
          filterMuscle: "Muscle group",
          filterEquipment: "Equipment",
          filterWeight: "Weight",
          filterWeightRequired: "Weight required",
          filterWeightOptional: "No weight",
          showFilters: "Show filters",
          hideFilters: "Hide filters",
          noExercises: "No exercises found",
          exerciseResults: "Exercises",
          totalDuration: "Duration",
          durationPerSet: "Duration (min)",
          totalDistance: "Distance",
          patternPush: "Push",
          patternPull: "Pull",
          patternLegs: "Legs",
          patternCore: "Core",
          patternFull: "Full body",
          measurementReps: "Repetitions",
          measurementTime: "Time",
          measurementDistance: "Distance",
          measurementWeight: "Weight",
          measurementMixed: "Mixed",
          measurementRoute: "Route/Grade",
          useSetsReps: "Use Sets & Repetitions",
          sets: "Sets",
          set: "Set",
          reps: "Reps",
          weight: "Weight",
          addSet: "Add Set",
          total: "Total",
          totalAmount: "Total Amount",
          addActivity: "Add Another Activity",
          save: "Save Workout",
          saving: "Saving...",
          cancel: "Cancel",
          mustBeLoggedIn: "You must be logged in to create a workout.",
          titleRequired: "Please enter a title for your workout.",
          timeRequiredField: "Please enter a time.",
          endTimeRequiredField: "Please enter an end time.",
          exerciseRequired: "Please select an exercise.",
          requiredField: "This field is required.",
          activityRequired:
            "Please add at least one valid activity. For Sets & Repetitions, at least one set with repetitions > 0 must be entered.",
          activityMissing: "Activity {{index}} is incomplete",
          saveError: "Error saving workout.",
          workoutCreated: "Workout created! 🎉",
          workoutUpdated: "Workout updated! 🎉",
          workoutSavedSuccess: "was successfully saved.",
          defaultTitles: {
            morning: "Morning Training",
            afternoon: "Afternoon Training",
            evening: "Evening Training",
          },
          units: {
            repetitions: "Repetitions",
            repetitionsShort: "Reps",
            kilometers: "Kilometers",
            kilometersShort: "km",
            meters: "Meters",
            metersShort: "m",
            miles: "Miles",
            milesShort: "mi",
            minutes: "Minutes",
            minutesShort: "min",
            seconds: "Seconds",
            secondsShort: "sec",
            units: "Units",
          },
        },
      },
      exerciseLibrary: {
        title: "Exercise Library",
        subtitle: "Find exercises, filter them, and add your own exercises.",
        newExercise: "Create exercise",
        name: "Name",
        namePlaceholder: "e.g. Pull-ups",
        moreNames: "Additional names (optional)",
        nameDeSingular: "German (singular)",
        nameDePlural: "German (plural)",
        nameEnSingular: "English (singular)",
        nameEnPlural: "English (plural)",
        nameAliases: "Other aliases",
        nameDeSingularPlaceholder: "e.g. Klimmzug",
        nameDePluralPlaceholder: "e.g. Klimmzüge",
        nameEnSingularPlaceholder: "e.g. Pull-up",
        nameEnPluralPlaceholder: "e.g. Pull-ups",
        nameAliasesPlaceholder: "Other names, separated by commas",
        category: "Category",
        discipline: "Discipline",
        measurement: "Units",
        pattern: "Movement pattern",
        movementPattern: "Movement pattern",
        unit: "Unit",
        defaultDistanceUnit: "Default distance unit",
        defaultTimeUnit: "Default time unit",
        difficulty: "Difficulty (1-10)",
        difficultyShort: "Level",
        description: "Description",
        addDescription: "Add description",
        muscleGroups: "Muscle groups",
        muscleGroupsPlaceholder: "Select muscle groups",
        searchMuscle: "Search muscle group",
        noMatches: "No matches",
        equipment: "Equipment",
        equipmentPlaceholder: "e.g. bodyweight, barbell",
        requiresWeight: "Weight required",
        allowsWeight: "Weight optional",
        supportsSets: "Sets/Reps",
        reps: "Reps",
        time: "Time",
        distance: "Distance",
        route: "Route",
        similar: "Similar exercises",
        create: "Create exercise",
        nameRequired: "Please enter a name.",
        categoryRequired: "Please select a category.",
        disciplineRequired: "Please select a discipline.",
        movementPatternRequired: "Please select a movement pattern.",
        requiredFields: "Please fill in category, discipline, and movement pattern.",
        exerciseCreated: "Exercise created",
        exerciseCreatedInfo: "The exercise is available immediately.",
        exerciseCreateError: "Could not create exercise.",
        hideDescription: "Hide description",
        noWeight: "No weight",
        note: "Exercises are available immediately. Only admins can edit them.",
        search: "Browse exercises",
        searchLabel: "Search",
        searchPlaceholder: "Name, description",
        filterCategory: "Category",
        filterType: "Units",
        filterMuscle: "Muscle group",
        filterEquipment: "Equipment",
        favorites: "Favorites",
        popular: "Popular",
        details: "Details",
        suggestChange: "Suggest change",
        suggestChangeTitle: "Suggest change",
        editRequestSent: "Change sent",
        editRequestSentDesc: "Your change request was saved.",
        editRequestError: "Change request failed.",
        noChanges: "No changes",
        noChangesDesc: "Please change at least one field.",
        sendRequest: "Send request",
        report: "Report",
        reportTitle: "Report exercise",
        reportReason: "Reason",
        reportDuplicate: "Duplicate",
        reportScoring: "Incorrect scoring",
        reportInappropriate: "Inappropriate",
        reportDetails: "Details",
        reportDetailsPlaceholder: "What is wrong?",
        reportSuggest: "Include change proposal",
        reportSent: "Report sent",
        reportSentDesc: "Thanks! We'll review internally.",
        reportError: "Report failed.",
        sendReport: "Send report",
        empty: "No exercises found.",
        loading: "Loading exercises...",
        totalExercises: "{{count}} exercises found",
        categoryLabels: {
          strength: "Strength",
          endurance: "Endurance",
          mobility: "Mobility",
          skills: "Skills",
          functional: "Functional",
        },
        disciplineLabels: {
          calisthenics: "Calisthenics/Bodyweight",
          yoga: "Yoga/Stretching",
          weights: "Weights/Gym",
          running: "Running",
          cycling: "Cycling",
          swimming: "Swimming",
          cardio: "Cardio",
        },
        movement: {
          push: "Push",
          pull: "Pull",
          squat: "Squat",
          hinge: "Hinge",
          carry: "Carry",
          rotation: "Rotation",
          isometric: "Isometric",
        },
        muscleGroupLabels: {
          chest: "Chest",
          back: "Back",
          lats: "Lats",
          upperBack: "Upper back",
          lowerBack: "Lower back",
          traps: "Traps",
          rhomboids: "Rhomboids",
          shoulders: "Shoulders",
          frontDelts: "Front delts",
          sideDelts: "Side delts",
          rearDelts: "Rear delts",
          arms: "Arms",
          biceps: "Biceps",
          triceps: "Triceps",
          forearms: "Forearms",
          core: "Core",
          abs: "Abs",
          obliques: "Obliques",
          deepCore: "Deep core",
          legs: "Legs",
          quads: "Quads",
          hamstrings: "Hamstrings",
          calves: "Calves",
          glutes: "Glutes",
          adductors: "Adductors",
          abductors: "Abductors",
          hipFlexors: "Hip flexors",
          neck: "Neck",
        },
      },
      admin: {
        title: "Admin Panel",
        subtitle: "Manage app settings and users",
        tabs: {
          overview: "Overview",
          users: "Users",
          exercises: "Exercise management",
          moderation: "Moderation",
          monitoring: "Monitoring",
        },
        stats: {
          title: "App statistics",
          users: "Registered users",
          verifiedEmails: "Verified emails",
          admins: "Administrators",
          workouts: "Completed workouts",
          templates: "Workout templates",
          exercises: "Exercises created",
          recoveryEntries: "Recovery journal entries",
          badges: "Badges awarded",
          awards: "Awards granted",
          activities: "Tracked activities",
        },
        users: {
          title: "User management",
          showEmails: "Show emails",
          hideEmails: "Hide emails",
          refresh: "Refresh data",
          refreshLoading: "Loading...",
          empty: "No users found",
          table: {
            name: "Name",
            email: "Email",
            status: "Status",
            created: "Created",
            lastLogin: "Last login",
          },
          badge: {
            admin: "Admin",
            verified: "✓ Verified",
          },
        },
        exercises: {
          merge: {
            title: "Merge",
            source: "Source exercise",
            target: "Target exercise",
            action: "Merge",
            sourcePlaceholder: "Select source",
            targetPlaceholder: "Select target",
            toastTitle: "Source set",
            toastDescription: "{{name}} selected as source exercise.",
            helper:
              "The source exercise will be merged into the target. All references move to the target and the source exercise is deactivated.",
            validation: "Please choose different source and target exercises.",
          },
          deleteConfirm: "Do you really want to delete this exercise?",
          actions: {
            details: "Details",
            edit: "Edit",
            merge: "Merge",
            delete: "Delete",
          },
        },
        errors: {
          deleteFailed: "Delete failed.",
        },
        success: {
          deleteTitle: "Exercise deleted",
          deleteDescription: "The exercise has been deactivated.",
        },
        exerciseDetail: {
          exercise: "Exercise",
          title: "Details",
          discipline: "Discipline",
          movementPattern: "Movement pattern",
          difficulty: "Difficulty",
          unit: "Unit",
          supportsSets: "Sets/Reps",
          requiresWeight: "Weight required",
          allowsWeight: "Weight optional",
          muscleGroups: "Muscle groups",
          equipment: "Equipment",
          yes: "Yes",
          no: "No",
          saveChanges: "Save changes",
        },
        moderation: {
          reports: {
            title: "Exercise reports",
            empty: "No open reports",
            table: {
              exercise: "Exercise",
              reason: "Reason",
              details: "Description",
              created: "Created",
              actions: "Actions",
            },
            actions: {
              resolve: "Resolve",
              dismiss: "Dismiss",
            },
          },
          edits: {
            title: "Edit requests",
            empty: "No open edit requests",
            table: {
              exercise: "Exercise",
              changes: "Changes",
              created: "Created",
              actions: "Actions",
            },
            actions: {
              approve: "Approve",
              reject: "Reject",
            },
          },
        },
        monitoring: {
          title: "Monitoring",
          loading: "Loading monitoring data...",
          empty: "No monitoring data available.",
          refreshHint: "Click \"Refresh\" to load monitoring data",
          jobs: {
            title: "Job status",
            stuck: "{{count}} stuck job(s) found",
            lastRun: "Last run",
            cleanup: "Run cleanup",
            recentFailures: "Failures in the last 7 days",
          },
          emails: {
            title: "Email queue",
            recentTitle: "Recent emails (24h)",
            stats: {
              total: "Total",
              failedAfterRetries: "{{count}} after retries",
            },
            table: {
              recipient: "Recipient",
              subject: "Subject",
              status: "Status",
              attempts: "Attempts",
              created: "Created",
            },
          },
        },
        accessDenied: {
          title: "Access denied",
          body: "You do not have permission to access the admin area.",
        },
        date: {
          never: "Never",
          invalid: "Invalid date",
        },
        errors: {
          title: "Error",
          overviewLoad: "Overview stats could not be loaded.",
          monitoringLoad: "Failed to load monitoring data.",
          cleanupJobs: "Failed to clean up jobs.",
          adminLoad: "Failed to load admin data.",
          mergeFailed: "Merge failed.",
        },
        success: {
          title: "Success",
          cleanupJobs: "Stuck jobs were cleaned up.",
          mergeTitle: "Merge successful",
          mergeDescription: "The exercises were merged.",
        },
      },
      // Recovery Diary
      recoveryDiary: {
        title: "Recovery Diary",
        subtitle:
          "Document your recovery, regeneration, daily form and personal notes.",
        entries: "Entries",
        editWindowInfo: "Recovery diary entries can only be edited within 7 days.",
        avgEnergy: "Ø Energy",
        avgFocus: "Ø Focus",
        avgSleep: "Ø Sleep Quality",
        avgSoreness: "Ø Soreness",
        avgExertion: "Ø Exertion",
        date: "Date",
        selectDate: "Select date",
        mood: "Mood",
        energyLevel: "Energy Level (1-10)",
        focusLevel: "Focus (1-10)",
        sleepQuality: "Sleep Quality (1-10)",
        sorenessLevel: "Soreness (0-10)",
        perceivedExertion: "Perceived Exertion (1-10)",
        workoutLink: "Workout Link",
        workoutLinkPlaceholder: "Optionally link",
        noWorkout: "No workout linked",
        sleepDuration: "Sleep Duration (Hours)",
        restingHeartRate: "Resting Heart Rate (bpm)",
        hydrationLevel: "Hydration (1-10)",
        tags: "Tags",
        tagsPlaceholder: "e.g. regeneration, intensity, focus",
        tagsHint:
          "Separate multiple tags with commas. Maximum 10 tags per entry.",
        notes: "Notes",
        notesPlaceholder: "How did you feel? What went well, what didn't?",
        filterMood: "Mood",
        filterStart: "From",
        filterEnd: "Until",
        filterSearch: "Search",
        filterSearchPlaceholder: "Search tags or notes",
        resetFilters: "Reset Filters",
        pastEntries: "Past entries",
        statistics: "Statistics",
        viewDetailedStats: "Detailed Statistics",
        trends: "Trends",
        moodDistribution: "Mood Distribution",
        popularTags: "Popular Tags",
        period: {
          week: "Week",
          month: "Month",
          quarter: "Quarter",
          year: "Year",
        },
        noEntries: "No entries in recovery diary yet.",
        edit: "Edit",
        delete: "Delete",
        cancelEdit: "Cancel Edit",
        save: "Save Entry",
        update: "Update Entry",
        previous: "Back",
        next: "Next",
        page: "Page",
        of: "of",
        moods: {
          energized: "Energized",
          energizedHelper: "Highest performance",
          balanced: "Balanced",
          balancedHelper: "Stable and focused",
          tired: "Tired",
          tiredHelper: "Slight fatigue present",
          sore: "Sore",
          soreHelper: "Recovery necessary",
          stressed: "Stressed",
          stressedHelper: "Watch out for regeneration",
          motivated: "Motivated",
          motivatedHelper: "Fully motivated and ready",
          relaxed: "Relaxed",
          relaxedHelper: "Calm and peaceful",
          excited: "Excited",
          excitedHelper: "Enthusiastic and full of anticipation",
          focused: "Focused",
          focusedHelper: "Concentrated and goal-oriented",
          frustrated: "Frustrated",
          frustratedHelper: "Disappointed or blocked",
          all: "All Moods",
        },
        metrics: {
          energy: "⚡ Energy",
          focus: "🎯 Focus",
          sleep: "🛌 Sleep",
          soreness: "💥 Soreness",
          exertion: "📈 Exertion",
          sleepDuration: "🕒 Sleep Duration",
          heartRate: "❤️ Resting Heart Rate",
          hydration: "💧 Hydration",
        },
        errors: {
          loadError: "Error loading recovery diary",
          loadErrorDescription: "The recovery diary could not be loaded.",
          saveError: "Error saving entry",
          saveErrorDescription: "The entry could not be saved.",
          deleteError: "Error deleting entry",
          deleteErrorDescription: "The entry could not be deleted.",
          deleteConfirm: "Do you really want to delete this entry?",
          loadWorkoutsError: "Error loading workouts",
          notAuthenticated: "Not authenticated",
        },
        success: {
          entrySaved: "Entry saved",
          entrySavedDescription: "The recovery diary entry was added.",
          entryUpdated: "Entry updated",
          entryUpdatedDescription: "The recovery diary entry was updated.",
          entryDeleted: "Entry deleted",
          entryDeletedDescription: "The recovery diary entry was removed.",
        },
        placeholders: {
          energy: "e.g. 8",
          focus: "e.g. 7",
          sleep: "e.g. 6",
          soreness: "e.g. 3",
          exertion: "e.g. 8",
          sleepDuration: "e.g. 7.5",
          heartRate: "e.g. 54",
          hydration: "e.g. 8",
        },
      },
      // Settings
      settings: {
        general: "General",
        appearance: "Appearance",
        language: "Language",
        theme: "Theme",
        themeLight: "Light",
        themeDark: "Dark",
        themeSystem: "Device",
        light: "Light",
        dark: "Dark",
        system: "System",
        saved: "Saved",
        settingSaved: "{{setting}} has been updated.",
        saveError: "Failed to save",
        reactions: {
          friendsCanSee: "Friends can see reactions",
          friendsCanSeeDescription: "Allow your friends to see reactions on your workouts",
          showNames: "Show names in reactions",
          showNamesDescription: "Show the names of users who reacted to your workouts",
        },
      },
      // Push Notifications
      pushNotifications: {
        title: "Push Notifications",
        description: "Receive notifications even when the app is closed.",
        enabled: "Push enabled",
        enabledDescription: "You will now receive push notifications.",
        disabled: "Push disabled",
        disabledDescription: "You will no longer receive push notifications.",
        error: "Error",
        active: "Active",
        toggle: "Toggle push notifications",
        notSupported: "Your browser does not support push notifications.",
        serverNotConfigured:
          "Push notifications are not configured on the server.",
        blocked: "Notifications blocked",
        blockedDescription:
          "You have blocked notifications for this site. Please allow them in your browser settings.",
        howItWorks: "How it works",
        feature1: "Friend requests and responses",
        feature2: "New badges and achievements",
        feature3: "Weekly summaries",
        enabling: "Enabling...",
        disabling: "Disabling...",
      },
      // Changelog
      changelog: {
        title: "Changelog",
        subtitle: "All updates and improvements at a glance",
        stayUpdated: "Stay updated",
        description:
          "Here you can find all important updates and new features of Sportify.",
        latest: "Latest",
        moreUpdates: "More updates coming soon – stay tuned! 🚀",
        types: {
          feature: "New",
          improvement: "Improvement",
          fix: "Bugfix",
        },
        entries: {
          v190: {
            title: "Workout Reactions",
            description:
              "React to your friends' workouts with emojis and receive notifications about reactions on your own workouts.",
            highlights: {
              0: "Emoji reactions: React with 👍, ❤️, 🔥, 💪, 🎉 or 😊 on friend workouts",
              1: "Notifications: Receive push notifications when someone reacts to your workout",
              2: "View reactions: See all reactions on your workouts in the My-Workouts view",
              3: "Privacy settings: Control whether friends can see reactions and if names are displayed",
              4: "Hover info: Show names of all reacting users when hovering over reactions",
              5: "Own workouts: Always show all reactions with names, regardless of settings",
            },
          },
          v185: {
            title: "Keyboard Shortcuts & UX Improvements",
            description:
              "New keyboard shortcuts for faster navigation, improved mobile navigation, scroll indicator and comprehensive accessibility improvements.",
            highlights: {
              0: "Keyboard shortcuts: Cmd/Ctrl+B to toggle sidebar, ESC to close",
              1: "Scroll indicator: Visual progress bar in header when scrolling",
              2: "Mobile navigation: Improved bottom navigation with expanded account menu",
              3: "Accessibility: Comprehensive aria-label improvements for screen readers",
              4: "Design: Hidden scrollbars with modern scroll indicator",
              5: "Week calculation: ISO 8601 week (Monday-Sunday) instead of rolling 7 days",
              6: "Reduced motion: Respects system preferences for reduced animations",
            },
          },
          v180: {
            title: "Rankings, goals & recovery upgraded",
            description:
              "New privacy controls for the leaderboard, improved weekly challenge/goals, recovery card, and a refreshed dashboard layout.",
            highlights: {
              0: "Global leaderboard opt-in: control visibility, warning dialog when disabling.",
              1: "Scoreboard: dropdowns for week/month and friends/global; top 3 plus your rank.",
              2: "Weekly goals: sit-ups goal, reset button, real weekly progress instead of zeros.",
              3: "Weekly challenge: uses personal points goal, real weekly points/workouts, settings icon top-right.",
              4: "Recovery card: recovery diary metrics, entries & last entry, period switcher.",
              5: "Dashboard layout: bento grid with clear order (goals left, challenge/monthly, scoreboard+recovery, activities large).",
            },
          },
          v170: {
            title: "Invite Friends",
            description:
              "Invite your friends via email or invitation link and train together.",
            highlights: {
              0: "Invitation via email address",
              1: "Invitation link to share",
              2: "Overview of all sent invitations",
              3: "Easy registration for new users",
            },
          },
          v160: {
            title: "Weekly and Monthly Reports",
            description:
              "Receive automatic email notifications with your weekly and monthly training summaries.",
            highlights: {
              0: "Weekly email with points and workouts",
              1: "Monthly summary with awards",
              2: "Automatic badge and award notifications",
              3: "Goal achievement and leaderboard status",
            },
          },
          v150: {
            title: "Web Push Notifications",
            description:
              "Receive push notifications directly on your device – even when the app is closed.",
            highlights: {
              0: "Push notifications for friend requests",
              1: "Notifications for new badges and achievements",
              2: "Easy activation in settings",
              3: "Works on desktop and mobile devices",
            },
          },
          v140: {
            title: "Auto-Save in Settings",
            description:
              "All settings are now saved automatically – no save button needed anymore.",
            highlights: {
              0: "Instant saving on every change",
              1: "Toast notification on successful save",
              2: "No more page flashing when saving",
              3: "Applies to profile and settings page",
            },
          },
          v130: {
            title: "Friend Activities",
            description:
              "New dedicated page for all training activities from you and your friends.",
            highlights: {
              0: "Overview of all friend workouts",
              1: "Filter by time period",
              2: "Compact, clear design",
              3: "Direct link to friend profile",
            },
          },
          v120: {
            title: "Friend Profiles",
            description:
              "View your friends' profiles – with achievements, badges and recent activities.",
            highlights: {
              0: "Display of achievements and badges",
              1: "Recent training activities",
              2: "Join date and statistics",
              3: "Clickable avatars and names",
            },
          },
          v110: {
            title: "Improved Period Navigation",
            description:
              "Navigate easily between weeks, months and years with the new arrow keys.",
            highlights: {
              0: "Arrow keys for previous/next period",
              1: "Dynamic display of current period (e.g. 'Week 48')",
              2: "Tooltip with full date range",
              3: "Quick 'Current' button",
            },
          },
          v100: {
            title: "Notification Center",
            description:
              "Central notification center for all important updates and requests.",
            highlights: {
              0: "Friend requests and responses",
              1: "Badge and award notifications",
              2: "Unread messages indicator",
              3: "Automatic mark as read",
            },
          },
          v090: {
            title: "Redesigned Statistics",
            description:
              "Completely redesigned statistics page with detailed analyses and visualizations.",
            highlights: {
              0: "Activity timeline with heatmap",
              1: "Training distribution by type",
              2: "Recovery metrics",
              3: "Weekly comparison and trends",
            },
          },
          v080: {
            title: "Achievements and Badges",
            description:
              "Earn badges and achievements for your athletic performance.",
            highlights: {
              0: "Various badge categories",
              1: "Progress display for badges",
              2: "Weekly and monthly awards",
              3: "Display in profile and with friends",
            },
          },
          v070: {
            title: "Personalized Profile Pictures",
            description:
              "Create your own avatar with many customization options.",
            highlights: {
              0: "Avatar editor with many options",
              1: "Various hairstyles, faces and accessories",
              2: "Color selection for all elements",
              3: "Random generator for quick creation",
            },
          },
          v060: {
            title: "First Public Release",
            description:
              "The launch of Sportify – your personal fitness tracking platform.",
            highlights: {
              0: "Workout tracking with point system",
              1: "Leaderboard with friends",
              2: "Set and track weekly goals",
              3: "Dark mode and language selection",
            },
          },
        },
      },
      // Landing Page
      landing: {
        settings: "Settings",
        openSettings: "Open settings",
        language: "Language",
        theme: "Theme",
        contact: "Contact",
        login: "Login",
        register: "Register",
        registerShort: "Reg.",
        skipToContent: "Skip to main content",
        // Hero Section
        hero: {
          badge: "100% free • PWA • German & English",
          title1: "Track your",
          title2: "Fitness Journey",
          title3: "like a Pro.",
          description:
            "Training and recovery diary, weekly trophy battles with friends, detailed statistics and challenges – completely free and GDPR compliant.",
          cta: "Start free now",
          login: "Login",
          trust1: "100% free",
          trust2: "GDPR compliant",
          trust3: "PWA for all devices",
          ctaGroup: "Action buttons",
          trustBadges: "Trust features",
        },
        // Stats Section
        stats: {
          title: "Sportify in numbers",
          reps: "Repetitions",
          athletes: "Active users",
          exercises: "Exercises tracked",
          free: "Free",
        },
        // Features Section
        features: {
          badge: "Core Features",
          title: "Everything you need",
          subtitle:
            "From weekly trophy battles to detailed correlation analyses – Sportify provides all the tools for your success.",
          learnMore: "Learn more",
          scoreboard: {
            title: "Weekly Trophy",
            description:
              "Compete with your friends every week for the golden trophy. Weekly, monthly, and yearly rankings provide maximum motivation.",
          },
          analytics: {
            title: "Statistics & Correlations",
            description:
              "Analyze your progress with interactive charts, discover connections between training and recovery, and optimize your workouts.",
          },
          friends: {
            title: "Friends & Community",
            description:
              "Connect with friends, follow their activities in the feed, and motivate each other to new personal bests.",
          },
          training: {
            title: "Training & Recovery Diary",
            description:
              "Keep detailed training and recovery diaries. Track over 50 exercises with sets, weights, and reps.",
          },
          notifications: {
            title: "Push Notifications",
            description:
              "Get instant updates when friends train, achieve new personal bests, or challenge you to compete.",
          },
          pwa: {
            title: "PWA for all Devices",
            description:
              "Install the app on smartphone, tablet, or desktop. Use it offline – data syncs automatically.",
          },
        },
        // Showcase Section
        showcase: {
          badge: "App Preview",
          title: "Your Dashboard, your Data",
          subtitle:
            "Keep track of all your training progress with a clear, modern dashboard.",
          progress: {
            title: "Progress Tracking",
            description:
              "Visualize your development over weeks, months, and years.",
          },
          goals: {
            title: "Weekly & Monthly Challenges",
            description:
              "Participate in challenges and achieve goals together with the community.",
          },
          history: {
            title: "Workout History",
            description: "Access all past workouts and statistics at any time.",
          },
          achievements: {
            title: "Achievements & Badges",
            description:
              "Collect awards for milestones reached and streaks maintained.",
          },
          previewAlt:
            "Preview of Sportify dashboard with statistics, streak display and training progress",
          preview: {
            streak: "Streak",
            days: "Days",
            thisWeek: "This Week",
            progress: "Weekly Progress",
            workout: "Strength Training",
            today: "Completed today",
          },
        },
        // Highlights Section
        highlights: {
          badge: "More Features",
          title: "Even more for you",
          subtitle:
            "Sportify offers everything you need for your fitness journey – completely free.",
          diary: {
            title: "Recovery Diary",
            description:
              "Track sleep, energy, and recovery for optimal training planning.",
          },
          challenges: {
            title: "Weekly Challenges",
            description:
              "Participate in weekly and monthly challenges and collect points.",
          },
          security: {
            title: "2FA Security",
            description:
              "Protect your account with two-factor authentication via authenticator app.",
          },
          avatar: {
            title: "Avatar Customization",
            description:
              "Design your personal avatar with many customization options.",
          },
          languages: {
            title: "German & English",
            description:
              "Use the app in your preferred language – fully translated.",
          },
          gdpr: {
            title: "GDPR Compliant",
            description:
              "Your data is safe. We comply with all European data protection standards.",
          },
        },
        // CTA Section
        cta: {
          badge: "Ready to start?",
          title: "Start your Fitness Journey now",
          titlePart1: "Ready for your",
          titlePart2: "best workout?",
          subtitle:
            "Join our community and take your training to the next level. Track your progress, compete for weekly trophies and achieve your goals – completely free.",
          button: "Get started",
          loginButton: "Login",
          buttonsLabel: "Registration buttons",
          trust1: "100% free",
          trust2: "No credit card",
          trust3: "Start immediately",
          trustLabel: "Benefits of registration",
          joinCommunity: "Join the growing community",
          activeUsers: "Active users",
          totalReps: "Repetitions",
          freeForever: "Free forever",
        },
        // Footer
        footer: {
          description:
            "The modern Sports Analytics platform for ambitious athletes who want to reach their fitness goals. 100% free and GDPR compliant.",
          madeWith: "Made with",
          by: "by Leon Stadler",
          features: "Features",
          featuresList: {
            scoreboard: "Weekly Trophy",
            training: "Training & Recovery",
            stats: "Statistics & Analytics",
            friends: "Friends & Community",
            highlights: "More Highlights",
          },
          developer: "Developer",
          tech: {
            modern: "Modern Web Technologies",
          },
          legal: "Legal",
          legalLinks: {
            privacy: "Privacy",
            terms: "Terms",
            imprint: "Imprint",
            contact: "Contact",
            changelog: "Changelog",
          },
          copyright:
            "© 2025 Sportify. All rights reserved. Developed by Leon Stadler.",
        },
      },
      // Auth Pages
      authPages: {
        backToHome: "Back to homepage",
        welcomeBack: "Welcome back!",
        continueJourney: "Sign in to continue your fitness journey",
        startFree: "Start free now!",
        createAccount:
          "Create your Sportify account and start your fitness journey",
        emailVerification: {
          backToLogin: "Back to login",
          emailVerified: "Email successfully verified!",
          accountActivated:
            "Your Sportify account is now fully activated. You can now sign in and use all features.",
          loginNow: "Login now",
          backToHome: "Back to homepage",
          verifyTitle: "Confirm email address",
          verifying: "Your email is being verified...",
          checkInbox: "Check your inbox and click on the confirmation link.",
          resendTitle: "Resend confirmation email",
          resendDescription: "Resend the confirmation email to {{email}}",
          resendDescriptionAlt:
            "Didn't receive an email? Send a new confirmation.",
          emailLabel: "Email address",
          emailPlaceholder: "your@email.com",
          checkSpam:
            "Also check your spam folder. The email may take up to 5 minutes.",
          sending: "Sending...",
          resendCountdown: "Resend ({{count}}s)",
          resendButton: "Send confirmation email",
          invalidLink:
            "The verification link is invalid or expired. Request a new link.",
          requestNewLink: "Request new link",
          alreadyVerified: "Already verified?",
          loginHere: "Login here",
        },
        forgotPassword: {
          backToLogin: "Back to login",
          title: "Forgot password?",
          description:
            "No problem! Enter your email address and we'll send you a reset link.",
          resetTitle: "Reset password",
          resetDescription: "Enter your account email address",
          sending: "Sending...",
          sendResetLink: "Send reset link",
          emailSent: "Email sent!",
          checkEmail:
            "We have sent an email to {{email}}. Check your inbox and follow the instructions to reset your password.",
          noEmailReceived:
            "Didn't receive an email? Also check your spam folder or try again.",
          tryAgain: "try again",
          rememberPassword: "Remember your password?",
          loginHere: "Login here",
        },
        resetPassword: {
          backToLogin: "Back to login",
          title: "Reset password",
          description: "Enter your new password",
          emailRequestTitle: "Reset password",
          emailRequestDescription:
            "No problem! Enter your email address and we'll send you a reset link.",
          resetTitle: "Set new password",
          resetDescription:
            "Your new password must be at least 8 characters long and contain uppercase and lowercase letters as well as a number.",
          passwordPlaceholder: "New password",
          confirmPasswordPlaceholder: "Confirm password",
          passwordRequirements:
            "At least 8 characters, uppercase and lowercase letters and a number",
          tokenExpires:
            "This link is only valid for a limited time. Please reset your password soon.",
          resetting: "Resetting password...",
          resetButton: "Reset password",
          sending: "Sending...",
          sendResetLink: "Send reset link",
          emailSent: "Email sent!",
          checkEmail:
            "We have sent an email to {{email}}. Check your inbox and follow the instructions to reset your password.",
          noEmailReceived:
            "Didn't receive an email? Also check your spam folder or try again.",
          tryAgain: "try again",
          passwordResetSuccess: "Password reset successfully!",
          canLoginNow:
            "Your password has been successfully changed. You can now log in with your new password.",
          loginNow: "Login now",
          backToHome: "Back to homepage",
          rememberPassword: "Remember your password?",
          loginHere: "Login here",
          missingToken: "Invalid or missing token",
          requestNewLink: "Please request a new link",
          invalidToken: "Invalid or expired token",
          resetFailed: "Password could not be reset",
        },
        twoFactor: {
          backToLogin: "Back to login",
          title: "Two-Factor Authentication",
          description:
            "Enter the 6-digit code from your authenticator app to complete the login.",
          enterCode: "Enter security code",
          codeRegenerates: "The code regenerates every 30 seconds",
          sixDigitCode: "6-digit code",
          codePlaceholder: "000000",
          verifying: "Verifying...",
          verifyCode: "Verify code",
          requestNewCode: "Request new code",
          requestNewCodeCountdown: "Request new code ({{count}}s)",
          problems: "Problems with authentication?",
          contactUs: "Contact us",
        },
      },
      // PWA Auth Screen
      pwaAuth: {
        welcomeTitle: "Welcome to Sportify!",
        welcomeSubtitle: "Create your account and start your fitness journey",
      },
      // Contact Page
      contact: {
        back: "Back",
        title: "Contact",
        contactUs: "Contact us",
        description:
          "Do you have questions about Sportify? We're here to help! Send us a message and we'll get back to you as soon as possible.",
        contactInfo: "Contact information",
        contactWays: "Different ways to get in touch with us",
        email: "Email",
        phone: "Phone",
        address: "Address",
        responseTime: "Response time: We usually respond within 24 hours",
        sendMessage: "Send message",
        formDescription: "Fill out the form and we'll get back to you",
        name: "Name",
        namePlaceholder: "Your full name",
        subject: "Subject",
        subjectPlaceholder: "What is your message about?",
        message: "Message",
        messagePlaceholder: "Write your message here...",
        privacyNote:
          "By submitting, you agree that we use your data to process your request. For more information, see our",
        privacyLink: "Privacy Policy",
        sending: "Sending...",
        sendMessageButton: "Send message",
        messageSent: "Message sent successfully!",
        thankYouMessage:
          "Thank you for your message. We will get back to you soon.",
        faqTitle: "Frequently asked questions",
        faq: {
          freeTitle: "Is Sportify free?",
          freeAnswer:
            "Yes, Sportify offers a free basic version with all important features. Premium features will be available in the future.",
          secureTitle: "How secure is my data?",
          secureAnswer:
            "Your data is protected with state-of-the-art encryption and never shared with third parties. Data protection is our top priority.",
          devicesTitle: "Which devices are supported?",
          devicesAnswer:
            "Sportify works on all modern browsers and is fully responsive optimized for desktop, tablet and smartphone.",
          appTitle: "Is there an app?",
          appAnswer:
            "Sportify is a Progressive Web App (PWA). You can install it on smartphone, tablet, or desktop and use it like an app.",
          responseTitle: "How fast do I get a response?",
          responseAnswer:
            "We usually respond within 24 hours on business days. Complex requests may take a bit longer.",
          exportTitle: "Can I export my data?",
          exportAnswer:
            "There is no self-service export yet. If you need your data, reach out and we will help you.",
          deleteTitle: "Can I delete my account at any time?",
          deleteAnswer:
            "Yes, you can delete your account completely at any time. All your data will be permanently removed.",
        },
      },
      // Validation Messages
      validation: {
        invalidEmail: "Invalid email address",
        passwordMin: "Password must be at least 6 characters long",
        passwordMinLength: "Password must be at least 8 characters long",
        passwordMin8: "Password must be at least 8 characters long",
        passwordUpperCase:
          "Password must contain at least one uppercase letter",
        passwordLowerCase:
          "Password must contain at least one lowercase letter",
        passwordNumber: "Password must contain at least one number",
        passwordComplexity:
          "Password must be at least 8 characters long and contain uppercase and lowercase letters as well as a number",
        passwordMatch: "Passwords do not match",
        passwordsDoNotMatch: "Passwords do not match",
        nameMin: "Name must be at least 2 characters long",
        firstNameMin: "First name must be at least 2 characters long",
        lastNameMin: "Last name must be at least 2 characters long",
        subjectMin: "Subject must be at least 5 characters long",
        messageMin: "Message must be at least 10 characters long",
        passwordsNotMatch: "Passwords do not match",
        termsRequired: "You must agree to the terms of service",
        codeLength: "2FA code must be exactly 6 characters long",
        codeNumbers: "2FA code may only contain numbers",
      },
      // Common
      common: {
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        confirm: "Confirm",
        delete: "Delete",
        edit: "Edit",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        reset: "Reset",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Information",
        yes: "Yes",
        no: "No",
        search: "Search",
        notificationsCenter: {
          title: "Notifications",
          ariaLabel: "Notifications",
          ariaLabelUnread: "{{count}} unread",
          empty: "No new notifications.",
          notificationTitleDefault: "Notification",
          loadError: "Notifications could not be loaded.",
          markReadError: "Error marking as read.",
          unknownError: "Unknown error",
          timeAgoFallback: "A while ago",
          push: {
            title: "Enable push notifications",
            blocked:
              "Notifications are currently blocked in your browser. Allow notifications in your device settings to receive updates.",
            prompt:
              "Get awards and friend updates directly as notifications on your device.",
            enable: "Enable now",
            enabling: "Enabling...",
            openSettings: "Enable in settings",
            requestError: "Push notifications could not be enabled.",
          },
        },
        developedWith: "Developed with",
        by: "by",
        copyright: "© 2025 Sportify. Developed with ❤️ by Leon Stadler.",
        displayPreview: "Display:",
        optional: "(optional)",
        agreeTerms: "I agree to the",
        termsOfService: "Terms of Service",
        and: "and the",
        privacyPolicy: "Privacy Policy",
        to: "",
        versionUpdateTitle: "New version available",
        versionUpdateDescription:
          "Version {{version}} is available. Check out the changelog.",
        versionUpdateAction: "Changelog",
        versionUpdateActionAlt: "Open changelog",
      },
      // Legal Pages
      legal: {
        backToHome: "Back to homepage",
        disclaimer: {
          title: "Legal Notice",
          germanLawApplies:
            "This website is subject exclusively to German law.",
          translationOnly:
            "The English version of these pages is only a translation and serves merely for better understanding.",
          germanVersionValid:
            "Legally binding is exclusively the German version.",
        },
        languageNote:
          "This page is available in German and English. The German version is legally binding.",
      },
      // Privacy Policy
      privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last updated",
        overview: {
          title: "1. Privacy at a Glance",
          general: {
            title: "1.1 General Information",
            content:
              "The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data with which you can be personally identified. Detailed information on the subject of data protection can be found in our privacy policy listed below this text.",
          },
          dataCollection: {
            title: "1.2 Data Collection on this Website",
            who: {
              title: "Who is responsible for data collection on this website?",
              content:
                'Data processing on this website is carried out by the website operator. You can find their contact details in the section "Information on the Responsible Party" in this privacy policy.',
            },
            how: {
              title: "How do we collect your data?",
              content:
                "On the one hand, your data is collected by you providing it to us. This can be, for example, data that you enter in a contact form or provide during registration. Other data is collected automatically or after your consent when you visit the website by our IT systems. This is mainly technical data (e.g. internet browser, operating system or time of page access). This data is collected automatically as soon as you enter this website.",
            },
            why: {
              title: "What do we use your data for?",
              content:
                "Some of the data is collected to ensure error-free provision of the website. Other data may be used to analyze your user behavior in order to improve the platform. If contracts can be concluded or initiated via the website, the transmitted data will also be processed for contract offers, orders or other inquiries.",
            },
            rights: {
              title: "What rights do you have regarding your data?",
              content:
                "You have the right at any time to receive information free of charge about the origin, recipient and purpose of your stored personal data. You also have the right to request the correction or deletion of this data. If you have given your consent to data processing, you can revoke this consent at any time for the future. You also have the right, under certain circumstances, to request the restriction of the processing of your personal data. Furthermore, you have the right to lodge a complaint with the competent supervisory authority. You can contact us at any time regarding this and other questions on the subject of data protection.",
            },
          },
          noAnalysis: {
            title: "1.3 Analysis Tools and Third-Party Tools",
            content:
              "When visiting this website, your surfing behavior is not statistically analyzed. We do not use analysis programs, tracking tools or similar technologies. Detailed information on this can be found in the following privacy policy.",
          },
          responsibility:
            "The person responsible for data processing is <0></0>, <1></1>.",
          legalBasis:
            "This privacy policy complies with the requirements of the General Data Protection Regulation (GDPR) and the Federal Data Protection Act (BDSG).",
        },
        hosting: {
          title: "2. Hosting",
          content:
            "We host the contents of our website with the following providers:",
          allinkl: {
            title: "2.1 All-Inkl (Domain)",
            content:
              "The domain is provided by ALL-INKL.COM - Neue Medien Münnich, Inh. René Münnich, Hauptstraße 68, 02742 Friedersdorf (hereinafter All-Inkl). For details, please refer to All-Inkl's privacy policy: https://all-inkl.com/datenschutzinformationen/. The use of All-Inkl is based on Art. 6 para. 1 lit. f GDPR. We have a legitimate interest in the most reliable presentation of our website.",
          },
          vercel: {
            title: "2.2 Vercel (Hosting)",
            content:
              "This website is hosted externally. The personal data collected on this website is stored on the hoster's servers. This may include IP addresses, contact requests, meta and communication data, contract data, contact details, names, website accesses and other data generated via a website. External hosting is carried out for the purpose of contract fulfillment vis-à-vis our potential and existing customers (Art. 6 para. 1 lit. b GDPR) and in the interest of secure, fast and efficient provision of our online offer by a professional provider (Art. 6 para. 1 lit. f GDPR).",
            provider:
              "We use the following hoster: Vercel Inc. located at 340 S Lemon Ave #4133, Walnut, CA 91789, USA. The server is located in Frankfurt, Germany.",
            processing:
              "Our hoster will only process your data to the extent necessary to fulfill its performance obligations and follow our instructions regarding this data.",
          },
          avv: {
            title: "2.3 Data Processing Agreement",
            content:
              "We have concluded data processing agreements (DPA) for the use of the above-mentioned services. These are contracts required by data protection law that ensure that these parties process the personal data of our website visitors only in accordance with our instructions and in compliance with the GDPR.",
          },
        },
        generalInfo: {
          title: "3. General Information and Mandatory Information",
          dataProtection: {
            title: "3.1 Data Protection",
            content:
              "The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy. When you use this website, various personal data is collected. Personal data is data with which you can be personally identified. This privacy policy explains what data we collect and what we use it for. It also explains how and for what purpose this is done.",
            security:
              "We point out that data transmission on the Internet (e.g. when communicating by e-mail) can have security gaps. Complete protection of data against access by third parties is not possible.",
          },
          responsible: {
            title: "3.2 Information on the Responsible Party",
            content:
              "The party responsible for data processing on this website is: <0></0>, <1></1>. Phone: <2></2>, Email: <3></3>",
            definition:
              "The responsible party is the natural or legal person who alone or jointly with others decides on the purposes and means of processing personal data (e.g. names, e-mail addresses, etc.).",
          },
          retention: {
            title: "3.3 Storage Period",
            content:
              "Unless a more specific storage period has been specified within this privacy policy, your personal data will remain with us until the purpose for data processing no longer applies. If you assert a legitimate request for deletion or revoke consent to data processing, your data will be deleted, unless we have other legally permissible reasons for storing your personal data (e.g. tax or commercial retention periods); in the latter case, deletion will take place after these reasons no longer apply. If you delete your account, all associated data will be completely and irrevocably deleted.",
          },
          legalBasis: {
            title:
              "3.4 General Information on the Legal Basis for Data Processing",
            content:
              "If you have consented to data processing, we process your personal data on the basis of Art. 6 para. 1 lit. a GDPR or Art. 9 para. 2 lit. a GDPR, if special categories of data according to Art. 9 para. 1 GDPR are processed. If your data is required for contract fulfillment or for the implementation of pre-contractual measures, we process your data on the basis of Art. 6 para. 1 lit. b GDPR. Furthermore, we process your data if this is necessary to fulfill a legal obligation on the basis of Art. 6 para. 1 lit. c GDPR. Data processing may also be carried out on the basis of our legitimate interest according to Art. 6 para. 1 lit. f GDPR. Information on the relevant legal basis in each individual case is provided in the following paragraphs of this privacy policy.",
          },
          recipients: {
            title: "3.5 Recipients of Personal Data",
            content:
              "In the course of our business activities, we work with various external parties. In some cases, this also requires the transmission of personal data to these external parties. We only pass on personal data to external parties if this is necessary for the fulfillment of a contract, if we are legally obliged to do so (e.g. passing on data to tax authorities), if we have a legitimate interest according to Art. 6 para. 1 lit. f GDPR in passing on the data or if another legal basis permits the data transfer. When using processors, we only pass on personal data of our customers on the basis of a valid data processing agreement.",
          },
          revocation: {
            title: "3.6 Revocation of Your Consent to Data Processing",
            content:
              "Many data processing operations are only possible with your express consent. You can revoke consent you have already given at any time. The legality of the data processing carried out until the revocation remains unaffected by the revocation.",
          },
          objection: {
            title:
              "3.7 Right to Object to Data Collection in Special Cases and to Direct Advertising",
            content:
              "If data processing is carried out on the basis of Art. 6 para. 1 lit. e or f GDPR, you have the right at any time to object to the processing of your personal data for reasons arising from your particular situation; this also applies to profiling based on these provisions. You can find the respective legal basis on which a processing is based in this privacy policy. If you object, we will no longer process your affected personal data unless we can demonstrate compelling legitimate grounds for processing that override your interests, rights and freedoms or the processing serves the assertion, exercise or defense of legal claims (objection according to Art. 21 para. 1 GDPR).",
            directMarketing:
              "If your personal data is processed for the purpose of direct advertising, you have the right to object at any time to the processing of personal data concerning you for the purpose of such advertising; this also applies to profiling insofar as it is associated with such direct advertising. If you object, your personal data will subsequently no longer be used for the purpose of direct advertising (objection according to Art. 21 para. 2 GDPR). Note: We do not engage in direct advertising.",
          },
          ssl: {
            title: "3.8 SSL or TLS Encryption",
            content:
              'This site uses SSL or TLS encryption for security reasons and to protect the transmission of confidential content, such as orders or inquiries that you send to us as the site operator. You can recognize an encrypted connection by the fact that the address line of the browser changes from "http://" to "https://" and by the lock symbol in your browser line. If SSL or TLS encryption is activated, the data you transmit to us cannot be read by third parties.',
          },
        },
        dataCollection: {
          title: "4. Data Collection on this Website",
          types: {
            title: "4.1 Types of Data Collected",
            intro: "We collect the following categories of personal data:",
            personal:
              "Personal data: Name, email address, profile picture (optional), display name (first name, last name or nickname)",
            usage:
              "Usage data: Workout data (type, duration, intensity), statistics, training activities, leaderboard positions, friend connections",
            technical:
              "Technical data: IP address (anonymized), browser type and version, operating system, device information, access times",
          },
          purpose: {
            title: "4.2 Purpose of Data Collection",
            service:
              "Provision and improvement of our services: To provide you with platform functions and continuously optimize them",
            communication:
              "Communication with users: To answer inquiries, send email confirmations and important notifications",
            improvement:
              "Analysis and optimization of the platform: To improve usability and functionality",
            legal:
              "Fulfillment of legal obligations: To comply with legal requirements and enforce rights if necessary",
          },
          noHealthData: {
            title: "4.3 No Health Data",
            content:
              "Important: We do not collect health data in the medical sense. The platform serves exclusively for the documentation of training activities. If users enter medical information, diagnoses or other sensitive health data in training names, descriptions or other fields, they are solely responsible for this. We assume no liability for the accuracy, use or disclosure of such information.",
          },
        },
        cookies: {
          title: "5. Cookies",
          content:
            'Our website uses so-called "cookies". Cookies are small data packages and do not cause any damage to your device. They are stored either temporarily for the duration of a session (session cookies) or permanently (permanent cookies) on your device. Session cookies are automatically deleted after your visit ends. Permanent cookies remain stored on your device until you delete them yourself or an automatic deletion by your web browser occurs.',
          types: {
            title: "5.1 Types of Cookies",
            essential:
              "Essential cookies: These cookies are required for the basic functions of the website (e.g. authentication, session management). These cookies are stored on the basis of Art. 6 para. 1 lit. f GDPR, as the website operator has a legitimate interest in storing necessary cookies for the technically error-free and optimized provision of its services. These cookies cannot be deactivated, as the website would otherwise not be functional",
            functional:
              "Functional cookies: Store your preferences and settings (e.g. language, theme) for better user comfort",
            analytics:
              "Analytics cookies: Not used. We do not use analysis tools such as Google Analytics or similar services",
          },
          noTracking: {
            title: "5.2 No Tracking",
            content:
              "We do not use tracking technologies, analysis tools or advertising cookies. Your use of the website is not tracked for analysis or marketing purposes. You can set your browser so that you are informed about the setting of cookies and only allow cookies in individual cases. When cookies are deactivated, the functionality of this website may be restricted.",
          },
        },
        contactForm: {
          title: "6. Contact Form",
          content:
            "If you send us inquiries via the contact form, your details from the inquiry form, including the contact details you provided there, will be stored by us for the purpose of processing the inquiry and in case of follow-up questions. We do not pass on this data without your consent.",
          legalBasis:
            "The processing of this data is based on Art. 6 para. 1 lit. b GDPR, if your request is related to the fulfillment of a contract or is necessary for the implementation of pre-contractual measures. In all other cases, the processing is based on our legitimate interest in the effective processing of inquiries addressed to us (Art. 6 para. 1 lit. f GDPR) or on your consent (Art. 6 para. 1 lit. a GDPR) if this was requested; the consent can be revoked at any time.",
          retention:
            "The data you enter in the contact form will remain with us until you request deletion, revoke your consent to storage or the purpose for data storage no longer applies (e.g. after your request has been processed). Mandatory legal provisions - in particular retention periods - remain unaffected.",
        },
        dataUsage: {
          title: "7. Data Usage and Storage",
          content:
            "Your data is used exclusively for the purposes mentioned in section 4.2. Disclosure to third parties only occurs in the cases described below:",
          sharing: {
            title: "7.1 Data Sharing",
            content:
              "Your personal data will only be shared in the following cases:",
            providers:
              "To service providers who support us in providing our services: Hosting providers (Vercel, server location: Frankfurt), database provider (neon.tech), email delivery service providers. These service providers are contractually obligated to use your data only within the scope of our instructions and to comply with applicable data protection regulations",
            legal:
              "If this is legally required or necessary for law enforcement: In the event of a legal obligation or court order",
            business:
              "In the event of a business restructuring or transfer: In the case of a merger, acquisition or other restructuring, whereby data protection regulations are complied with",
          },
          noCommercial: {
            title: "7.2 No Commercial Use",
            content:
              "We do not use your data for commercial purposes. There is no disclosure to advertisers, no use for marketing purposes and no analysis by third parties for commercial purposes.",
          },
        },
        security: {
          title: "8. Data Security",
          content:
            "We use technical and organizational measures to protect your data and prevent unauthorized access:",
          encryption:
            "Encryption of data transmissions: All data transmissions take place via encrypted connections (HTTPS/TLS)",
          access:
            "Access controls and authentication: Strong password requirements, optional two-factor authentication, access only for authorized persons",
          regular:
            "Regular security reviews: Continuous monitoring and improvement of security measures",
          database:
            "Secure database: Use of a professional database infrastructure (neon.tech) with corresponding security standards",
        },
        rights: {
          title: "9. Your Rights",
          intro:
            "You have the following rights regarding your personal data under the GDPR:",
          access: {
            title: "9.1 Right of Access (Art. 15 GDPR)",
            content:
              "You have the right, within the framework of applicable legal provisions, to obtain information free of charge at any time about your stored personal data, its origin and recipients and the purpose of data processing.",
          },
          correction: {
            title: "9.2 Right to Rectification (Art. 16 GDPR)",
            content:
              "You have the right to request the correction of incorrect or the completion of incomplete data.",
          },
          deletion: {
            title: "9.3 Right to Erasure (Art. 17 GDPR)",
            content:
              "You can request the deletion of your data at any time. You can also delete your account yourself in the profile section, which will completely remove all associated data. You can contact us at any time regarding this and other questions about personal data.",
          },
          restriction: {
            title: "9.4 Right to Restriction of Processing (Art. 18 GDPR)",
            content:
              "You have the right to request the restriction of the processing of your personal data. You can contact us at any time regarding this. The right to restriction of processing exists in the following cases: If you dispute the accuracy of your personal data stored with us, we usually need time to verify this. For the duration of the verification, you have the right to request the restriction of the processing of your personal data. If the processing of your personal data was/is unlawful, you can request the restriction of data processing instead of deletion. If we no longer need your personal data, but you need it to exercise, defend or assert legal claims, you have the right to request the restriction of the processing of your personal data instead of deletion. If you have lodged an objection according to Art. 21 para. 1 GDPR, a balance must be struck between your and our interests. As long as it is not yet clear whose interests prevail, you have the right to request the restriction of the processing of your personal data.",
          },
          objection: {
            title: "9.5 Right to Object (Art. 21 GDPR)",
            content:
              "You have the right to object to the processing of your data. Details can be found in section 3.7 of this privacy policy.",
          },
          portability: {
            title: "9.6 Right to Data Portability (Art. 20 GDPR)",
            content:
              "You have the right to have data that we process automatically on the basis of your consent or in fulfillment of a contract handed over to you or to a third party in a common, machine-readable format. If you request the direct transfer of the data to another responsible party, this will only be done if it is technically feasible.",
          },
          complaint: {
            title:
              "9.7 Right to Lodge a Complaint with the Supervisory Authority (Art. 77 GDPR)",
            content:
              "In the event of violations of the GDPR, data subjects have the right to lodge a complaint with a supervisory authority, in particular in the member state of their habitual residence, their place of work or the place of the alleged violation. The right to lodge a complaint exists without prejudice to other administrative or judicial remedies.",
          },
        },
        retention: {
          title: "10. Retention Period and Data Deletion",
          content:
            "Your personal data will only be stored for as long as necessary for the stated purposes or legal retention periods exist. If you delete your account, all associated data will be completely and irrevocably removed, including all training data, statistics and other stored information. After deletion, your data cannot be restored.",
          accountDeletion:
            "You can delete your account yourself at any time in the profile section. When deleted, all associated user data will be completely removed.",
        },
        changes: {
          title: "11. Changes to this Privacy Policy",
          content:
            "We reserve the right to adapt this privacy policy to changed legal situations or changes to our services. Current versions can always be found on this page. In the event of significant changes, we will inform you about the changed provisions.",
        },
        contact: {
          title: "12. Contact and Exercise of Your Rights",
          content:
            "If you have questions about data protection, the exercise of your rights or complaints, you can contact us at any time. We strive to answer your inquiries promptly:",
          email: "Email",
        },
        noForums: {
          title: "13. No Forums or Public Communication",
          content:
            "The platform does not offer forums, chat functions or other opportunities for public exchange of messages between users. The only communication option is the contact form for direct inquiries to us.",
        },
      },
      // Terms of Service
      terms: {
        title: "Terms of Service",
        lastUpdated: "Last updated",
        acceptance: {
          title: "1. Scope and Acceptance",
          content:
            "These Terms of Service (ToS) govern the use of the Sportify platform. By registering and using our services, you fully accept these ToS.",
        },
        service: {
          title: "2. Description of Service",
          description:
            "Sportify is a platform for tracking and analyzing fitness activities. We offer the following features:",
          features: {
            title: "2.1 Features",
            tracking: "Workout tracking and recording",
            statistics: "Statistics and performance analyses",
            community: "Community features and social interaction",
            scoreboard: "Leaderboards and competitions",
          },
        },
        account: {
          title: "3. User Account",
          registration: {
            title: "3.1 Registration",
            age: "You must be at least 18 years old",
            accuracy: "You must provide accurate and complete information",
            responsibility:
              "You are responsible for the security of your account",
          },
          security: {
            title: "3.2 Account Security",
            content:
              "You are responsible for keeping your login credentials confidential. Inform us immediately of any unauthorized use of your account.",
          },
        },
        usage: {
          title: "4. Usage Rules",
          allowed: {
            title: "4.1 Permitted Use",
            personal: "Personal use for fitness tracking",
            lawful: "Lawful use in accordance with all applicable laws",
            respectful: "Respectful interaction with other users",
          },
          prohibited: {
            title: "4.2 Prohibited Use",
            illegal: "Any illegal activities",
            harm: "Harming other users or the platform",
            unauthorized: "Unauthorized access to other accounts or systems",
            spam: "Sending spam or unwanted messages",
            reverse: "Reverse engineering or attempts to extract source code",
          },
        },
        content: {
          title: "5. Copyright and Intellectual Property",
          ownership:
            "All rights to the platform and its contents belong to us or our licensors.",
          userContent:
            "You retain the rights to content you create, but grant us a license to use it.",
          license:
            "Using our platform does not grant you ownership rights to the software or content.",
        },
        liability: {
          title: "6. Liability Limitation",
          content:
            "We are not liable for damages arising from the use of our platform, to the extent permitted by law.",
          limitations: {
            title: "6.1 Liability Exclusions",
            availability:
              "We do not guarantee uninterrupted availability of the platform",
            accuracy: "We assume no liability for the accuracy of user data",
            damages: "We are not liable for indirect or consequential damages",
          },
        },
        termination: {
          title: "7. Termination",
          user: "You can cancel and delete your account at any time.",
          provider:
            "We reserve the right to block or delete accounts that violate these ToS.",
          effect:
            "Upon termination, your data will be handled according to our privacy policy.",
        },
        changes: {
          title: "8. Changes to ToS",
          content:
            "We reserve the right to change these ToS. Changes will be published on this page.",
          notification: "For significant changes, we will notify you by email.",
        },
        governingLaw: {
          title: "9. Applicable Law",
          content:
            "These ToS are subject to German law. German law is decisive.",
          jurisdiction:
            "The place of jurisdiction is, if legally permissible, the seat of the provider.",
        },
        contact: {
          title: "10. Contact",
          content: "If you have questions about these ToS, you can contact us:",
          email: "Email",
        },
      },
      // Imprint
      imprint: {
        title: "Imprint",
        lastUpdated: "Last updated",
        responsibility: {
          title: "Information according to § 5 TMG",
          name: "Responsible for content",
          address: "Address",
        },
        contact: {
          title: "Contact",
          email: "Email",
          phone: "Phone",
        },
        disclaimer: {
          title: "Disclaimer",
          content: {
            title: "Liability for Content",
            intro:
              "As a service provider, we are responsible for our own content on these pages in accordance with general law pursuant to § 7 para. 1 TMG.",
            responsibility:
              "According to §§ 8 to 10 TMG, we as a service provider are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.",
          },
          links: {
            title: "Liability for Links",
            intro:
              "Our offer contains links to external websites of third parties, on whose contents we have no influence.",
            responsibility:
              "The respective provider or operator of the pages is always responsible for the contents of the linked pages.",
            investigation:
              "Upon becoming aware of legal violations, we will immediately remove such links.",
          },
        },
        copyright: {
          title: "Copyright",
          content:
            "The content and works created by the site operators on these pages are subject to German copyright law.",
          prohibition:
            "The reproduction, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.",
        },
        dataProtection: {
          title: "Data Protection",
          content:
            "The use of our website is usually possible without providing personal data. If personal data is collected on our pages, this is always done within the framework of the applicable data protection laws.",
          link: "For more information, please see our Privacy Policy.",
        },
      },
      // PWA Install Prompt
      pwa: {
        installTitle: "Sportify installieren",
        installDescription:
          "Installiere die App für schnelleren Zugriff und Offline-Nutzung",
        installDescriptionDesktop:
          "Installiere die App zum Dock/Desktop für schnelleren Zugriff",
        install: "Installieren",
        dismiss: "Schließen",
        close: "Schließen",
        instructionsDescription:
          "Folge diesen Schritten, um Sportify zu installieren:",
        iosInstallTitle: "Sportify auf iOS installieren",
        iosStep1: "Tippe auf das Teilen-Symbol in der Safari-Adressleiste",
        iosStep2: "Wähle 'Zum Home-Bildschirm'",
        iosStep3: "Tippe auf 'Hinzufügen'",
        safariDesktopInstallTitle: "Sportify zum Dock hinzufügen",
        safariDesktopStep1: "Klicke im Safari-Menü auf 'Datei'",
        safariDesktopStep2: "Wähle 'Zum Dock hinzufügen'",
        safariDesktopAlternative:
          "Alternativ: Klicke auf das Teilen-Symbol in der Adressleiste und wähle 'Zum Dock hinzufügen'",
        safariInstallTitle: "Sportify installieren",
        safariStep1: "Klicke auf das Teilen-Symbol in der Adressleiste",
        safariStep2:
          "Wähle 'Zum Startbildschirm hinzufügen' oder 'Zum Desktop hinzufügen'",
        androidChromeInstallTitle: "Sportify auf Android installieren",
        androidChromeStep1:
          "Tippe auf das Menü-Symbol (drei Punkte) oben rechts",
        androidChromeStep2:
          "Wähle 'Zum Startbildschirm hinzufügen' oder 'App installieren'",
        androidChromeStep3: "Bestätige die Installation",
        chromeDesktopInstallTitle: "Sportify in Chrome installieren",
        chromeDesktopStep1:
          "Klicke auf das Install-Symbol in der Adressleiste (oder im Menü)",
        chromeDesktopStep2: "Bestätige die Installation im Dialog",
        firefoxMobileInstallTitle: "Sportify in Firefox installieren",
        firefoxMobileStep1:
          "Tippe auf das Menü-Symbol (drei Punkte) oben rechts",
        firefoxMobileStep2: "Wähle 'Seite' → 'Zum Startbildschirm hinzufügen'",
        firefoxDesktopInstallTitle: "Sportify in Firefox installieren",
        firefoxDesktopStep1:
          "Klicke auf das Menü-Symbol (drei Striche) oben rechts",
        firefoxDesktopStep2:
          "Wähle 'Mehr' → 'Diese Seite als App installieren'",
        edgeInstallTitle: "Sportify in Edge installieren",
        edgeStep1: "Klicke auf das Menü-Symbol (drei Punkte) oben rechts",
        edgeStep2: "Wähle 'Apps' → 'Diese Seite als App installieren'",
        genericInstallTitle: "Sportify installieren",
        genericStep1: "Verwende die Install-Option in deinem Browser-Menü",
      },
      // Offline Status
      offline: {
        title: "Offline",
        description:
          "Sie sind offline. Einige Funktionen sind möglicherweise nicht verfügbar.",
      },
      // Share Target
      share: {
        title: "Geteilter Inhalt",
        description: "Inhalt wurde erfolgreich empfangen",
        noData: "Keine geteilten Daten gefunden",
        backToDashboard: "Zum Dashboard",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "de",
    lng: "de", // default language
    debug: false,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
