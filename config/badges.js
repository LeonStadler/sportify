export const WEEKLY_PROGRESS_BADGES = [
    {
        slug: 'weekly-goal-exercises',
        category: 'weekly',
        label: 'Wochenziel (Übungen)',
        description: 'Erreiche dein persönliches Wochenziel für Übungen {threshold} Mal.',
        icon: 'badge-weekly-goal-exercises',
        thresholds: [1, 5, 10, 25, 50, 75, 100, 150, 200]
    },
    {
        slug: 'weekly-goal-points',
        category: 'weekly',
        label: 'Wochenziel (Punkte)',
        description: 'Erreiche dein Wochenziel bei den Punkten {threshold} Mal.',
        icon: 'badge-weekly-goal-points',
        thresholds: [1, 5, 10, 25, 50, 75, 100, 150, 200]
    },
    {
        slug: 'weekly-challenge-points',
        category: 'weekly',
        label: 'Wochen-Challenge',
        description: 'Schließe die Wochen-Challenge {threshold} Mal erfolgreich ab.',
        icon: 'badge-weekly-challenge',
        thresholds: [1, 5, 10, 25, 50, 75, 100, 150, 200]
    }
];

export const MONTHLY_PROGRESS_BADGES = [
    {
        slug: 'monthly-challenge-points',
        category: 'monthly',
        label: 'Monats-Challenge',
        description: 'Schließe die Monats-Challenge {threshold} Mal erfolgreich ab.',
        icon: 'badge-monthly-challenge',
        thresholds: [1, 3, 6, 12, 24, 36, 60]
    }
];

export const LIFETIME_ACTIVITY_BADGES = [
    {
        slug: 'lifetime-pushups',
        category: 'lifetime',
        activityType: 'pushups',
        label: 'Erste {threshold} Liegestütze',
        description: 'Absolviere insgesamt {threshold} Liegestütze.',
        icon: 'badge-pushups',
        thresholds: [10, 50, 100, 250, 500, 1000, 1500]
    },
    {
        slug: 'lifetime-pullups',
        category: 'lifetime',
        activityType: 'pullups',
        label: 'Erste {threshold} Klimmzüge',
        description: 'Absolviere insgesamt {threshold} Klimmzüge.',
        icon: 'badge-pullups',
        thresholds: [10, 25, 50, 100, 250, 500, 750]
    },
    {
        slug: 'lifetime-situps',
        category: 'lifetime',
        activityType: 'situps',
        label: 'Erste {threshold} Sit-ups',
        description: 'Absolviere insgesamt {threshold} Sit-ups.',
        icon: 'badge-situps',
        thresholds: [50, 100, 250, 500, 1000]
    },
    {
        slug: 'lifetime-running',
        category: 'lifetime',
        activityType: 'running',
        label: 'Erste {threshold} Lauf-Kilometer',
        description: 'Laufe insgesamt {threshold} Kilometer.',
        icon: 'badge-running',
        thresholds: [10, 50, 100, 250, 500, 1000]
    },
    {
        slug: 'lifetime-cycling',
        category: 'lifetime',
        activityType: 'cycling',
        label: 'Erste {threshold} Radfahr-Kilometer',
        description: 'Fahre insgesamt {threshold} Kilometer mit dem Rad.',
        icon: 'badge-cycling',
        thresholds: [25, 100, 250, 500, 1000, 2000]
    }
];

export const DEFAULT_WEEKLY_POINTS_GOAL = 500;
export const DEFAULT_WEEKLY_POINT_CHALLENGE = 1500;
export const DEFAULT_MONTHLY_POINT_CHALLENGE = 2000;
