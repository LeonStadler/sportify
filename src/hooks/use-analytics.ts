import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { API_URL } from "@/lib/api";
import type { AnalyticsResponse } from "@/types/analytics";

export interface AnalyticsSelection {
  period: string;
  start?: Date | null;
  end?: Date | null;
}

interface UseAnalyticsResult {
  data: AnalyticsResponse | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAnalytics(selection: AnalyticsSelection): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const rangeKey = useMemo(() => {
    const start = selection.start ? selection.start.toISOString() : "";
    const end = selection.end ? selection.end.toISOString() : "";
    return `${selection.period}:${start}:${end}`;
  }, [selection.end, selection.period, selection.start]);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams({ period: selection.period });
    if (selection.period === "custom" && selection.start && selection.end) {
      params.set("start", selection.start.toISOString().slice(0, 10));
      params.set("end", selection.end.toISOString().slice(0, 10));
    }
    return params.toString();
  }, [selection.end, selection.period, selection.start]);

  const loadAnalytics = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("missing-token");
      setData(null);
      return;
    }

    if (selection.period === "custom" && (!selection.start || !selection.end)) {
      setData(null);
      setError(null);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/stats/analytics?${buildQueryString()}`, {
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
  }, [buildQueryString, selection.end, selection.period, selection.start]);

  useEffect(() => {
    loadAnalytics();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadAnalytics, rangeKey]);

  return {
    data,
    isLoading,
    error,
    reload: loadAnalytics,
  };
}
