// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'overview',
    'architecture',
    'frontend',
    'backend',
    'development',
    'deployment',
    'database',
    'features',
    'scoring',
    {
      type: 'category',
      label: 'PWA',
      items: ['pwa', 'pwa-implementation', 'pwa-testing'],
    },
    {
      type: 'category',
      label: 'E-Mail',
      items: ['email/README'],
    },
    {
      type: 'category',
      label: 'Exercise System',
      items: [
        'exercise-system-analysis',
        'exercise-system-implementation',
        'exercise-workout-plan',
        'exercise-workout-plan-grok',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/README',
        'api/authentication',
        'api/profile',
        'api/users',
        'api/workouts',
        'api/exercises',
        'api/training-journal',
        'api/goals',
        'api/challenges',
        'api/friends',
        'api/feed',
        'api/reactions',
        'api/scoreboard',
        'api/stats',
        'api/recent-workouts',
        'api/notifications',
        'api/events',
        'api/contact',
        'api/admin',
      ],
    },
  ],
};

export default sidebars;
