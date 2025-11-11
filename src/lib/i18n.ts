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
        profile: "Profil",
        admin: "Admin",
        settings: "Einstellungen",
        logout: "Abmelden",
        friends: "Freunde",
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
        },
        profileInfo: "Profil Informationen",
        emailVerification: "E-Mail Verifizierung",
        emailVerified: "✓ Deine E-Mail ist verifiziert",
        emailNotVerified: "⚠ Bitte verifiziere deine E-Mail-Adresse",
        administrator: "Administrator",
        firstName: "Vorname",
        lastName: "Nachname",
        nickname: "Spitzname (optional)",
        nicknameRequired:
          "Wenn 'Spitzname' als Anzeigename gewählt ist, muss ein Spitzname angegeben werden.",
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
        changePassword: "Passwort ändern",
        currentPassword: "Aktuelles Passwort",
        newPassword: "Neues Passwort",
        confirmPassword: "Passwort bestätigen",
        passwordMismatch: "Die Passwörter stimmen nicht überein.",
        passwordTooShort: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        passwordChangeInDevelopment: "Funktion in Entwicklung",
        passwordChangeInDevelopmentDesc:
          "Passwort ändern wird bald verfügbar sein.",
        twoFactorAuth: "Zwei-Faktor-Authentifizierung",
        enable2FA: "2FA aktivieren",
        enable2FADesc: "Zusätzliche Sicherheit für dein Konto",
        status: "Status",
        activated: "✓ Aktiviert",
        deactivated: "○ Deaktiviert",
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
        never: "Nie",
        emailVerifiedStatus: "E-Mail verifiziert",
        yes: "Ja",
        no: "Nein",
        deleteAccount: "Konto löschen",
        confirmDeleteAccount:
          "Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
        deleteAccountPasswordPrompt:
          "Bitte gib dein Passwort ein, um das Konto zu löschen:",
        accountDeleted: "Konto gelöscht",
        accountDeletedDesc: "Dein Konto wurde erfolgreich gelöscht.",
        deleteAccountError: "Fehler beim Löschen des Kontos",
        userPreferences: "Benutzereinstellungen",
        userPreferencesDesc: "Passe die App an deine Vorlieben an",
        language: "Sprache",
        timeFormat: "Uhrzeitformat",
        timeFormat24h: "24-Stunden (14:30)",
        timeFormat12h: "12-Stunden (2:30 PM)",
        theme: "Design",
        themeSystem: "System",
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
        loading: "Lädt...",
        error: "Fehler",
        german: "Deutsch",
        english: "English",
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
        timeAgo: {
          minutes: "vor {{count}} Minuten",
          hours: "vor {{count}} Stunden",
          yesterday: "gestern",
          days: "vor {{count}} Tagen",
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
      },
      // Activity Feed
      activityFeed: {
        title: "Aktivitäten der Freunde",
        pleaseLogin: "Bitte melde dich an, um Aktivitäten zu sehen.",
        unexpectedFormat: "Unerwartetes Datenformat vom Server.",
        couldNotLoad: "Aktivitäten konnten nicht geladen werden.",
        errorLoading: "Der Activity Feed konnte nicht geladen werden.",
        noActivities: "Keine Aktivitäten von Freunden",
        addFriends: "Füge Freunde hinzu, um ihre Workouts zu sehen!",
        points: "Punkte",
        repetitions: "Wiederholungen",
        units: "Einheiten",
        inWorkout: 'in "{{title}}"',
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
        },
        activityTypes: {
          pullups: "Klimmzüge",
          pushups: "Liegestütze",
          situps: "Sit-ups",
          running: "Laufen",
          cycling: "Radfahren",
          other: "Sonstiges",
          unknown: "Unbekannte Aktivität",
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
        activityTypes: {
          all: "Alle",
          pullups: "Klimmzüge",
          pushups: "Liegestütze",
          running: "Laufen",
          cycling: "Radfahren",
          situps: "Sit-ups",
          other: "Sonstiges",
        },
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
          points: "Punkte",
        },
        stats: {
          title: "Statistiken",
          subtitle: "Detaillierte Analyse deiner sportlichen Leistungen",
          thisWeek: "Diese Woche",
          thisMonth: "Dieser Monat",
          thisQuarter: "Dieses Quartal",
          overview: "Übersicht",
          trends: "Trends",
          records: "Rekorde",
          distribution: "Verteilung",
          weeklyActivity: "Wöchentliche Aktivität",
          monthlyActivity: "Monatliche Aktivität",
          progress: "Fortschritt",
          totalPoints: "Gesamtpunkte",
          points: "Punkte",
          weeklyStatistics: "Wochenstatistiken",
          kmRunning: "km Laufen",
          kmCycling: "km Radfahren",
          strengthTrainingTrend: "Kraft-Training Trend",
          strengthPoints: "Kraft-Punkte",
          enduranceTrend: "Ausdauer Trend",
          endurancePoints: "Ausdauer-Punkte",
          personalRecords: "Persönliche Rekorde",
          onSaturday: "am Samstag",
          longestRun: "Längster Lauf",
          longestRide: "Längste Tour",
          activityDistribution: "Aktivitätsverteilung",
          trainingIntensity: "Training Intensität",
          monday: "Montag",
          tuesday: "Dienstag",
          wednesday: "Mittwoch",
          thursday: "Donnerstag",
          friday: "Freitag",
          saturday: "Samstag",
          sunday: "Sonntag",
          week1: "Woche 1",
          week2: "Woche 2",
          week3: "Woche 3",
          week4: "Woche 4",
          pullups: "Klimmzüge",
          pushups: "Liegestütze",
          running: "Laufen",
          cycling: "Radfahren",
          runningKm: "Laufen (km)",
          cyclingKm: "Radfahren (km)",
        },
      },
      // Training
      training: {
        title: "Training Log",
        subtitle: "Trage deine Workouts ein und verfolge deinen Fortschritt",
        trainingsDiary: "Trainingsstagebuch",
        recoveryDiary: "Erholungstagebuch",
        yourWorkouts: "Deine Workouts",
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
        other: "Sonstiges",
        mustBeLoggedIn: "Du musst angemeldet sein, um Workouts zu sehen.",
        loadError: "Fehler beim Laden der Workouts",
        workoutsLoadError: "Workouts konnten nicht geladen werden.",
        deleteConfirm: "Möchtest du dieses Workout wirklich löschen?",
        deleteError: "Fehler beim Löschen des Workouts",
        workoutDeleted: "Workout gelöscht",
        workoutDeletedSuccess: "Das Workout wurde erfolgreich gelöscht.",
        deleteWorkoutError: "Workout konnte nicht gelöscht werden.",
        edit: "Bearbeiten",
        delete: "Löschen",
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
          descriptionPlaceholder: "Zusätzliche Notizen zu deinem Workout...",
          activities: "Aktivitäten",
          activitiesRequired: "Aktivitäten *",
          activity: "Aktivität",
          exercise: "Übung",
          selectExercise: "Wähle eine Übung",
          unit: "Einheit",
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
          activityRequired:
            "Bitte füge mindestens eine gültige Aktivität hinzu. Bei Sets & Wiederholungen müssen mindestens ein Set mit Wiederholungen > 0 eingegeben werden.",
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
            kilometers: "Kilometer",
            meters: "Meter",
            miles: "Meilen",
            units: "Einheiten",
          },
        },
      },
      // Recovery Diary
      recoveryDiary: {
        title: "Erholungstagebuch",
        subtitle:
          "Dokumentiere deine Erholung, Regeneration, Tagesform und persönliche Notizen.",
        entries: "Einträge",
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
        statistics: "Statistiken",
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
        light: "Hell",
        dark: "Dunkel",
        system: "System",
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
        newFeature: "Neu: Multi-Language Support",
        heroTitle: "Deine ultimative",
        heroSubtitle: "Sports Analytics",
        heroSubtitle2: "Plattform",
        heroDescription:
          "Tracke deine Workouts, analysiere deine Fortschritte und erreiche deine Fitnessziele mit der modernsten Sports Analytics Plattform.",
        startFree: "Kostenlos starten",
        contactUs: "Kontakt aufnehmen",
        noCreditCard: "Keine Kreditkarte erforderlich",
        secure: "100% sicher",
        startNow: "Sofort loslegen",
        features: "Features",
        featuresTitle: "Alles was du brauchst",
        featuresDescription:
          "Von Live-Tracking bis zu detaillierten Analytics - Sportify bietet alle Tools für deinen Fitness-Erfolg.",
        testimonials: "Testimonials",
        testimonialsTitle: "Was unsere Nutzer sagen",
        testimonialsDescription:
          "Tausende von Athleten vertrauen bereits auf Sportify",
        ctaBadge: "Jetzt starten",
        ctaTitle: "Bereit durchzustarten?",
        ctaDescription:
          "Schließe dich tausenden von Athleten an und beginne noch heute deine Fitness-Reise mit Sportify.",
        ctaButton: "Jetzt kostenlos registrieren",
        freeStart: "Kostenlos starten",
        noCommitment: "Keine Bindung",
        startImmediately: "Sofort loslegen",
        footerDescription:
          "Die moderne Sports Analytics Plattform für ambitionierte Athleten.",
        footerDeveloped: "Entwickelt mit",
        footerBy: "von Leon Stadler.",
        footerFeatures: "Features",
        footerDeveloper: "Entwickler",
        footerLegal: "Rechtliches",
        footerCopyright:
          "© 2025 Sportify. Alle Rechte vorbehalten. Entwickelt von Leon Stadler.",
        featuresList: {
          liveScoreboard: "Live Scoreboard",
          workoutTracking: "Workout Tracking",
          statistics: "Statistiken & Analytics",
          community: "Community Features",
        },
        footerTech: {
          react: "React & TypeScript",
          modern: "Moderne Web-Technologien",
          opensource: "Open Source Komponenten",
        },
        footerLinks: {
          privacy: "Datenschutz",
          terms: "AGB",
          imprint: "Impressum",
          contact: "Kontakt",
        },
        featureTitles: {
          detailedStats: "Detaillierte Statistiken",
          realtime: "Echtzeit Updates",
          secure: "Sichere Daten",
          mobile: "Mobile First",
        },
        featureDescriptions: {
          liveScoreboard:
            "Verfolge deine Leistungen in Echtzeit und vergleiche dich mit anderen Athleten.",
          detailedStats:
            "Analysiere deine Fortschritte mit umfassenden Charts und Metriken.",
          community:
            "Verbinde dich mit Freunden, lade sie ein und motiviert euch gegenseitig.",
          realtime:
            "Erhalte sofortige Updates über deine Aktivitäten und Erfolge.",
          secure:
            "Deine persönlichen Daten sind mit modernster Verschlüsselung geschützt.",
          mobile:
            "Perfekt optimiert für mobile Geräte - trainiere und tracke überall.",
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
            "Verantwortlicher für die Datenverarbeitung ist Leon Stadler, Uferstraße 42, 88149 Nonnenorn, Deutschland.",
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
              "Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist: Leon Stadler, Uferstraße 42, 88149 Nonnenorn, Deutschland. Telefon: +49 176 35491384, E-Mail: sportify@leon-stadler.com",
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
        cancel: "Abbrechen",
        confirm: "Bestätigen",
        delete: "Löschen",
        edit: "Bearbeiten",
        close: "Schließen",
        back: "Zurück",
        next: "Weiter",
        previous: "Zurück",
        submit: "Absenden",
        loading: "Laden...",
        error: "Fehler",
        success: "Erfolgreich",
        warning: "Warnung",
        info: "Information",
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
        profile: "Profile",
        admin: "Admin",
        settings: "Settings",
        logout: "Logout",
        friends: "Friends",
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
        },
        profileInfo: "Profile Information",
        emailVerification: "Email Verification",
        emailVerified: "✓ Your email is verified",
        emailNotVerified: "⚠ Please verify your email address",
        administrator: "Administrator",
        firstName: "First Name",
        lastName: "Last Name",
        nickname: "Nickname (optional)",
        nicknameRequired:
          "If 'Nickname' is selected as display name, a nickname must be provided.",
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
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        passwordMismatch: "Passwords do not match.",
        passwordTooShort: "Password must be at least 6 characters long.",
        passwordChangeInDevelopment: "Feature in Development",
        passwordChangeInDevelopmentDesc:
          "Password change will be available soon.",
        twoFactorAuth: "Two-Factor Authentication",
        enable2FA: "Enable 2FA",
        enable2FADesc: "Additional security for your account",
        status: "Status",
        activated: "✓ Activated",
        deactivated: "○ Deactivated",
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
        never: "Never",
        emailVerifiedStatus: "Email Verified",
        yes: "Yes",
        no: "No",
        deleteAccount: "Delete Account",
        confirmDeleteAccount:
          "Do you really want to delete your account? This action cannot be undone.",
        deleteAccountPasswordPrompt:
          "Please enter your password to delete the account:",
        accountDeleted: "Account Deleted",
        accountDeletedDesc: "Your account has been successfully deleted.",
        deleteAccountError: "Error deleting account",
        userPreferences: "User Preferences",
        userPreferencesDesc: "Customize the app to your preferences",
        language: "Language",
        timeFormat: "Time Format",
        timeFormat24h: "24-Hour (14:30)",
        timeFormat12h: "12-Hour (2:30 PM)",
        theme: "Theme",
        themeSystem: "System",
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
        loading: "Loading...",
        error: "Error",
        german: "German",
        english: "English",
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
        timeAgo: {
          minutes: "{{count}} minutes ago",
          hours: "{{count}} hours ago",
          yesterday: "yesterday",
          days: "{{count}} days ago",
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
      },
      // Activity Feed
      activityFeed: {
        title: "Friends' Activities",
        pleaseLogin: "Please log in to see activities.",
        unexpectedFormat: "Unexpected data format from server.",
        couldNotLoad: "Activities could not be loaded.",
        errorLoading: "The activity feed could not be loaded.",
        noActivities: "No activities from friends",
        addFriends: "Add friends to see their workouts!",
        points: "Points",
        repetitions: "repetitions",
        units: "units",
        inWorkout: 'in "{{title}}"',
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
        },
        activityTypes: {
          pullups: "Pull-ups",
          pushups: "Push-ups",
          situps: "Sit-ups",
          running: "Running",
          cycling: "Cycling",
          other: "Other",
          unknown: "Unknown Activity",
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
        activityTypes: {
          all: "All",
          pullups: "Pull-ups",
          pushups: "Push-ups",
          running: "Running",
          cycling: "Cycling",
          situps: "Sit-ups",
          other: "Other",
        },
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
          points: "Points",
        },
        stats: {
          title: "Statistics",
          subtitle: "Detailed analysis of your athletic performance",
          thisWeek: "This Week",
          thisMonth: "This Month",
          thisQuarter: "This Quarter",
          overview: "Overview",
          trends: "Trends",
          records: "Records",
          distribution: "Distribution",
          weeklyActivity: "Weekly Activity",
          monthlyActivity: "Monthly Activity",
          progress: "Progress",
          totalPoints: "Total Points",
          points: "Points",
          weeklyStatistics: "Weekly Statistics",
          kmRunning: "km Running",
          kmCycling: "km Cycling",
          strengthTrainingTrend: "Strength Training Trend",
          strengthPoints: "Strength Points",
          enduranceTrend: "Endurance Trend",
          endurancePoints: "Endurance Points",
          personalRecords: "Personal Records",
          onSaturday: "on Saturday",
          longestRun: "Longest Run",
          longestRide: "Longest Ride",
          activityDistribution: "Activity Distribution",
          trainingIntensity: "Training Intensity",
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday",
          week1: "Week 1",
          week2: "Week 2",
          week3: "Week 3",
          week4: "Week 4",
          pullups: "Pull-ups",
          pushups: "Push-ups",
          running: "Running",
          cycling: "Cycling",
          runningKm: "Running (km)",
          cyclingKm: "Cycling (km)",
        },
      },
      // Training
      training: {
        title: "Training Log",
        subtitle: "Enter your workouts and track your progress",
        trainingsDiary: "Training Diary",
        recoveryDiary: "Recovery Diary",
        yourWorkouts: "Your Workouts",
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
        other: "Other",
        mustBeLoggedIn: "You must be logged in to view workouts.",
        loadError: "Error loading workouts",
        workoutsLoadError: "Workouts could not be loaded.",
        deleteConfirm: "Do you really want to delete this workout?",
        deleteError: "Error deleting workout",
        workoutDeleted: "Workout deleted",
        workoutDeletedSuccess: "The workout was successfully deleted.",
        deleteWorkoutError: "Workout could not be deleted.",
        edit: "Edit",
        delete: "Delete",
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
          descriptionPlaceholder: "Additional notes about your workout...",
          activities: "Activities",
          activitiesRequired: "Activities *",
          activity: "Activity",
          exercise: "Exercise",
          selectExercise: "Select an exercise",
          unit: "Unit",
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
          activityRequired:
            "Please add at least one valid activity. For Sets & Repetitions, at least one set with repetitions > 0 must be entered.",
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
            kilometers: "Kilometers",
            meters: "Meters",
            miles: "Miles",
            units: "Units",
          },
        },
      },
      // Recovery Diary
      recoveryDiary: {
        title: "Recovery Diary",
        subtitle:
          "Document your recovery, regeneration, daily form and personal notes.",
        entries: "Entries",
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
        statistics: "Statistics",
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
        light: "Light",
        dark: "Dark",
        system: "System",
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
        newFeature: "New: Multi-Language Support",
        heroTitle: "Your ultimate",
        heroSubtitle: "Sports Analytics",
        heroSubtitle2: "Platform",
        heroDescription:
          "Track your workouts, analyze your progress and achieve your fitness goals with the most modern Sports Analytics platform.",
        startFree: "Start free",
        contactUs: "Contact us",
        noCreditCard: "No credit card required",
        secure: "100% secure",
        startNow: "Start now",
        features: "Features",
        featuresTitle: "Everything you need",
        featuresDescription:
          "From live tracking to detailed analytics - Sportify provides all the tools for your fitness success.",
        testimonials: "Testimonials",
        testimonialsTitle: "What our users say",
        testimonialsDescription: "Thousands of athletes already trust Sportify",
        ctaBadge: "Get started",
        ctaTitle: "Ready to get started?",
        ctaDescription:
          "Join thousands of athletes and start your fitness journey with Sportify today.",
        ctaButton: "Register now for free",
        freeStart: "Start free",
        noCommitment: "No commitment",
        startImmediately: "Start immediately",
        footerDescription:
          "The modern Sports Analytics platform for ambitious athletes.",
        footerDeveloped: "Developed with",
        footerBy: "by Leon Stadler.",
        footerFeatures: "Features",
        footerDeveloper: "Developer",
        footerLegal: "Legal",
        footerCopyright:
          "© 2025 Sportify. All rights reserved. Developed by Leon Stadler.",
        featuresList: {
          liveScoreboard: "Live Scoreboard",
          workoutTracking: "Workout Tracking",
          statistics: "Statistics & Analytics",
          community: "Community Features",
        },
        footerTech: {
          react: "React & TypeScript",
          modern: "Modern Web Technologies",
          opensource: "Open Source Components",
        },
        footerLinks: {
          privacy: "Privacy",
          terms: "Terms",
          imprint: "Imprint",
          contact: "Contact",
        },
        featureTitles: {
          detailedStats: "Detailed Statistics",
          realtime: "Real-time Updates",
          secure: "Secure Data",
          mobile: "Mobile First",
        },
        featureDescriptions: {
          liveScoreboard:
            "Track your performance in real-time and compare yourself with other athletes.",
          detailedStats:
            "Analyze your progress with comprehensive charts and metrics.",
          community:
            "Connect with friends, invite them and motivate each other.",
          realtime:
            "Get instant updates about your activities and achievements.",
          secure:
            "Your personal data is protected with state-of-the-art encryption.",
          mobile:
            "Perfectly optimized for mobile devices - train and track anywhere.",
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
        cancel: "Cancel",
        confirm: "Confirm",
        delete: "Delete",
        edit: "Edit",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Information",
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
            "The person responsible for data processing is Leon Stadler, Uferstraße 42, 88149 Nonnenorn, Germany.",
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
              "The party responsible for data processing on this website is: Leon Stadler, Uferstraße 42, 88149 Nonnenorn, Germany. Phone: +49 176 35491384, Email: sportify@leon-stadler.com",
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
