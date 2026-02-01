import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Workout } from "@/types/workout";

const toastMock = vi.fn();
const originalFetch = global.fetch;
const mockUser = {
  id: "u1",
  preferences: {
    units: {
      distance: "km",
      weight: "kg",
    },
  },
};

vi.mock("@/lib/api", () => ({
  API_URL: "http://localhost:3001/api",
}));

vi.mock("@/hooks/use-auth", () => ({
  // Keep a stable user reference to avoid effect loops in tests.
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    i18n: { language: "de" },
  }),
}));

import { WorkoutForm } from "@/components/training/WorkoutForm";

const hasExpectedUnit = (text: string, units: string[]) =>
  units.some((unit) => text.toLowerCase().includes(unit.toLowerCase()));

describe("WorkoutForm totals", () => {
  beforeEach(() => {
    toastMock.mockReset();
    localStorage.setItem("token", "test-token");
    if (!("ResizeObserver" in globalThis)) {
      // Radix Switch uses ResizeObserver in JSDOM tests.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  });

  afterEach(() => {
    localStorage.clear();
    global.fetch = originalFetch;
  });

  it("calculates total time in mixed reps+time set mode (2 x 8 sec = 16 sec)", async () => {
    const prefillWorkout: Workout = {
      id: "w1",
      title: "Prefill",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          activityType: "frontlever",
          amount: 0,
          unit: "sec",
          sets: [{ reps: 2, duration: 0 }],
        },
      ],
    };

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            exercises: [
              {
                id: "frontlever",
                name: "Front Lever",
                measurementType: "mixed",
                supportsTime: true,
                supportsDistance: false,
                supportsSets: true,
                requiresWeight: false,
                allowsWeight: false,
                unit: "sec",
                unitOptions: [
                  { value: "min", label: "Minuten", multiplier: 1 },
                  { value: "sec", label: "Sekunden", multiplier: 1 / 60 },
                ],
              },
            ],
            facets: { categories: [], muscleGroups: [], equipment: [] },
          }),
      })
    );
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<WorkoutForm prefillWorkout={prefillWorkout} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const durationInput = screen.getByPlaceholderText("Zeit (Min)");
    fireEvent.change(durationInput, { target: { value: "8" } });

    await waitFor(() => {
      const totalLine = screen
        .getAllByText((content) => content.includes("16"))
        .find((node) =>
          hasExpectedUnit(node.textContent || "", [
            "sekunden",
            "training.form.units.seconds",
          ])
        );
      expect(totalLine).toBeTruthy();
    });
  });

  it("shows both distance and time totals for distance+time exercises", async () => {
    const prefillWorkout: Workout = {
      id: "w2",
      title: "Run",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          activityType: "running",
          amount: 7,
          unit: "km",
          sets: [{ distance: 7, duration: 7, reps: 0 }],
        },
      ],
    };

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            exercises: [
              {
                id: "running",
                name: "Laufen",
                measurementType: "distance",
                supportsTime: true,
                supportsDistance: true,
                supportsSets: true,
                requiresWeight: false,
                allowsWeight: false,
                unit: "km",
                unitOptions: [
                  { value: "km", label: "km", multiplier: 1 },
                  { value: "m", label: "m", multiplier: 0.001 },
                ],
              },
            ],
            facets: { categories: [], muscleGroups: [], equipment: [] },
          }),
      })
    );
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<WorkoutForm prefillWorkout={prefillWorkout} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const totalLine = screen
      .getAllByText((content) => content.includes("7"))
      .find((node) =>
        hasExpectedUnit(node.textContent || "", [
          "km",
          "training.form.units.kilometers",
        ]) &&
        hasExpectedUnit(node.textContent || "", [
          "minuten",
          "training.form.units.minutes",
        ])
      );
    expect(totalLine).toBeTruthy();
  });

  it("calculates mixed reps+time totals even when reps stay empty (duration only)", async () => {
    const prefillWorkout: Workout = {
      id: "w3",
      title: "Prefill",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          activityType: "frontlever",
          amount: 0,
          unit: "sec",
          sets: [{ reps: 0, duration: 0 }],
        },
      ],
    };

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            exercises: [
              {
                id: "frontlever",
                name: "Front Lever",
                measurementType: "mixed",
                supportsTime: true,
                supportsDistance: false,
                supportsSets: true,
                requiresWeight: false,
                allowsWeight: false,
                unit: "sec",
                unitOptions: [
                  { value: "min", label: "Minuten", multiplier: 1 },
                  { value: "sec", label: "Sekunden", multiplier: 1 / 60 },
                ],
              },
            ],
            facets: { categories: [], muscleGroups: [], equipment: [] },
          }),
      })
    );
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<WorkoutForm prefillWorkout={prefillWorkout} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const durationInput = screen.getByPlaceholderText("Zeit (Min)");
    fireEvent.change(durationInput, { target: { value: "8" } });

    await waitFor(() => {
      const totalLine = screen
        .getAllByText((content) => content.includes("8"))
        .find((node) =>
          hasExpectedUnit(node.textContent || "", [
            "sekunden",
            "training.form.units.seconds",
          ])
        );
      expect(totalLine).toBeTruthy();
    });
  });
});
