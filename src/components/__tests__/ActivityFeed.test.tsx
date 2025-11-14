import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityFeed } from '../ActivityFeed';

const toastMock = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, any>) => {
      const dictionary: Record<string, string | ((opts?: Record<string, any>) => string)> = {
        'activityFeed.title': 'Aktivitäten',
        'activityFeed.activityTypes.unknown': 'Unbekannte Aktivität',
        'activityFeed.repetitions': 'Wiederholungen',
        'activityFeed.units': 'Einheiten',
        'activityFeed.inWorkout': (opts) =>
          opts?.title ? `im Workout ${opts.title}` : 'im Workout',
        'activityFeed.timeAgoShort.unknown': 'Unbekannt',
        'activityFeed.timeAgoShort.justNow': 'Gerade eben',
        'activityFeed.points': 'Punkte',
        'activityFeed.couldNotLoad': 'Aktivitäten konnten nicht geladen werden.',
        'activityFeed.errorLoading': 'Fehler beim Laden der Aktivitäten.',
        'activityFeed.noFriends': 'Noch keine Freunde vorhanden.',
        'activityFeed.addFriendsToSeeActivities':
          'Füge Freunde hinzu, um Aktivitäten zu sehen.',
        'activityFeed.goToFriends': 'Zu Freunden',
        'activityFeed.noActivities': 'Noch keine Aktivitäten vorhanden.',
        'activityFeed.addFriends': 'Lade Freunde ein!',
        'dashboard.error': 'Fehler',
      };

      const entry = dictionary[key];
      if (typeof entry === 'function') {
        return entry(options);
      }
      if (entry) {
        return entry;
      }
      if (typeof options?.count === 'number') {
        return `${options.count} ${key}`;
      }
      return key;
    },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('ActivityFeed', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    toastMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders activities returned by the API', async () => {
    const createdAt = new Date().toISOString();

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        activities: [
          {
            id: 'activity-1',
            userName: 'Max Mustermann',
            userAvatar: '',
            userFirstName: 'Max',
            userLastName: 'Mustermann',
            activityType: 'pullups',
            amount: 10,
            points: 25,
            workoutTitle: 'Morning Session',
            createdAt,
          },
        ],
      }),
    } as Response);

    render(<ActivityFeed />);

    expect(await screen.findByText('Max Mustermann')).toBeInTheDocument();
    expect(screen.getByText('25 Punkte')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'}/feed?page=1&limit=10`,
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
    );
  });

  it('shows an error message when the API request fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Boom' }),
    } as Response);

    render(<ActivityFeed />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Aktivitäten konnten nicht geladen werden.');
    });

    expect(toastMock).toHaveBeenCalled();
  });
});
