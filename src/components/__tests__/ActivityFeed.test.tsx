import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityFeed } from '../ActivityFeed';

const toastMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
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
