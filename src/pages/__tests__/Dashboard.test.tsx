import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../Dashboard';

const toastMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/components/ActivityFeed', () => ({
  ActivityFeed: () => <div data-testid="activity-feed" />,
}));

describe('Dashboard', () => {
  const fetchMock = vi.fn();

  const statsResponse = {
    totalPoints: 1200,
    weekPoints: 150,
    totalWorkouts: 42,
    userRank: 3,
    totalUsers: 100,
    activities: {
      pullups: { total: 200, week: 20 },
      pushups: { total: 400, week: 40 },
      running: { total: 300, week: 30 },
      cycling: { total: 500, week: 50 },
    },
  };

  const goalsResponse = {
    pullups: { target: 100, current: 50 },
    pushups: { target: 200, current: 75 },
    running: { target: 40, current: 20 },
    cycling: { target: 150, current: 60 },
  };

  const workoutsResponse = [
    {
      id: 'workout-1',
      createdAt: new Date().toISOString(),
      notes: 'Test workout',
      activities: [
        { activityType: 'pullups', amount: 10, points: 20 },
      ],
    },
  ];

  beforeEach(() => {
    fetchMock.mockReset();
    toastMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads dashboard resources and keeps recent workout error hidden on success', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => statsResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => goalsResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => workoutsResponse } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'}/recent-workouts?limit=5`,
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error message when recent workouts fail to load', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => statsResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => goalsResponse } as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'nope' }) } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Letzte Workouts konnten nicht geladen werden.');
    });

    expect(toastMock).toHaveBeenCalled();
  });
});
