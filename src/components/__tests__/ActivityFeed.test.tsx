import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityFeed } from '../ActivityFeed';

const toastMock = vi.fn();

const mockUser = { id: 'user-1' } as const;

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

const translate = (key: string, options?: Record<string, unknown>) => {
  switch (key) {
    case 'activityFeed.points':
      return 'Punkte';
    case 'activityFeed.repetitions':
      return 'Wiederholungen';
    case 'activityFeed.timeAgoShort.unknown':
      return 'Vor einiger Zeit';
    case 'activityFeed.timeAgoShort.minutes':
      return `${options?.count} Minuten`;
    case 'activityFeed.timeAgoShort.hours':
      return `${options?.count} Stunden`;
    case 'activityFeed.timeAgoShort.days':
      return `${options?.count} Tage`;
    case 'activityFeed.inWorkout':
      return `im Workout ${options?.title ?? ''}`.trim();
    case 'activityFeed.couldNotLoad':
      return 'Aktivitäten konnten nicht geladen werden.';
    case 'activityFeed.errorLoading':
      return 'Fehler beim Laden';
    case 'activityFeed.title':
      return 'Aktivitäten deiner Freunde';
    case 'activityFeed.activityTypes.pullups':
      return 'Klimmzüge';
    case 'activityFeed.activityTypes.unknown':
      return 'Aktivität';
    default:
      return key;
  }
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { changeLanguage: async () => undefined },
  }),
}));

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

    render(
      <MemoryRouter>
        <ActivityFeed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('25 Punkte')).toBeInTheDocument();
    });
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

    render(
      <MemoryRouter>
        <ActivityFeed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText('Aktivitäten konnten nicht geladen werden.')
    ).toBeInTheDocument();

    expect(toastMock).toHaveBeenCalled();
  });
});
