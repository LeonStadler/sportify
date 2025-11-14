import { useCallback, useEffect, useRef, useState } from "react";

import { API_URL } from "@/lib/api";
import type { AnalyticsResponse } from "@/types/analytics";

interface UseAnalyticsResult {
  data: AnalyticsResponse | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAnalytics(period: string): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadAnalytics = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("missing-token");
      setData(null);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/stats/analytics?period=${encodeURIComponent(period)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = typeof errorBody.error === "string" ? errorBody.error : "analytics.fetchError";
        throw new Error(message);
      }

      const payload = (await response.json()) as AnalyticsResponse;
      setData(payload);
    } catch (fetchError) {
      if ((fetchError as Error).name === "AbortError") {
        return;
      }
      setError((fetchError as Error).message || "analytics.fetchError");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadAnalytics]);

  return {
    data,
    isLoading,
    error,
    reload: loadAnalytics,
  };
}
