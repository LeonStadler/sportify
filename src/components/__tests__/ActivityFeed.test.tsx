import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_API_URL = "http://localhost:3001/api";
const toastMock = vi.fn();

// Store original fetch
const originalFetch = global.fetch;

// Mock all external dependencies
vi.mock("@/lib/api", () => ({
  API_URL: "http://localhost:3001/api",
}));

vi.mock("@/lib/avatar", () => ({
  parseAvatarConfig: () => null,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-1", firstName: "Test", lastName: "User" },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "activityFeed.title": "Aktivitäten",
        "activityFeed.points": "Punkte",
        "activityFeed.couldNotLoad":
          "Aktivitäten konnten nicht geladen werden.",
        "activityFeed.errorLoading": "Fehler beim Laden der Aktivitäten.",
        "activityFeed.timeAgoShort.justNow": "Gerade eben",
        "activityFeed.activityTypes.pullups": "Klimmzüge",
        "dashboard.error": "Fehler",
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("react-nice-avatar", () => ({ default: () => null }));

// Import component AFTER mocks
import { ActivityFeed } from "../ActivityFeed";

describe("ActivityFeed", () => {
  beforeEach(() => {
    toastMock.mockReset();
    localStorage.setItem("token", "test-token");
  });

  afterEach(() => {
    localStorage.clear();
    global.fetch = originalFetch;
  });

  it("calls the feed API with correct parameters on mount", async () => {
    const startTime = new Date().toISOString();

    // Create mock that resolves with valid data
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            workouts: [
              {
                workoutId: "workout-1",
                workoutTitle: "Morning Session",
                startTimeTimestamp: startTime,
                userId: "user-2",
                userName: "Max Mustermann",
                userAvatar: null,
                userFirstName: "Max",
                userLastName: "Mustermann",
                isOwnWorkout: false,
                activities: [
                  { id: "activity-1", activityType: "pullups", amount: 10, points: 25 },
                ],
                totalPoints: 25,
              },
            ],
            hasFriends: true,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: 1,
              hasNext: false,
              hasPrev: false,
            },
          }),
      })
    );

    // Replace global fetch BEFORE render
    global.fetch = mockFetch as unknown as typeof fetch;

    render(
      <MemoryRouter>
        <ActivityFeed />
      </MemoryRouter>
    );

    // Verify API was called correctly
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );

    // Verify the correct URL and headers were used
    expect(mockFetch).toHaveBeenCalledWith(
      `${TEST_API_URL}/feed?page=1&limit=5`,
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      })
    );
  });

  it("shows an error message when the API request fails", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Boom" }),
      })
    );

    global.fetch = mockFetch as unknown as typeof fetch;

    render(
      <MemoryRouter>
        <ActivityFeed />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Aktivitäten konnten nicht geladen werden."
        );
      },
      { timeout: 5000 }
    );

    expect(toastMock).toHaveBeenCalled();
  });
});
