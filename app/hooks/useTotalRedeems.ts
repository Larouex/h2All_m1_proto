import { useState, useEffect, useCallback, useRef } from "react";

interface TotalRedeemsData {
  totalRedeems: number;
  cached: boolean;
  stale?: boolean;
  timestamp: string;
}

interface UseTotalRedeemsResult {
  totalRedeems: number | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
  stale: boolean;
  refetch: () => Promise<void>;
  lastUpdated: string | null;
}

export function useTotalRedeems(
  autoRefresh: boolean = false,
  refreshInterval: number = 60000
): UseTotalRedeemsResult {
  const [data, setData] = useState<TotalRedeemsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalRedeems = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch("/api/total-redeems", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add cache busting for fresh data when needed
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData({
          totalRedeems: result.totalRedeems,
          cached: result.cached || false,
          stale: result.stale || false,
          timestamp: result.timestamp,
        });
      } else {
        throw new Error(result.error || "Failed to fetch total redeems");
      }
    } catch (err) {
      console.error("Error fetching total redeems:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch - use ref to prevent dependency issues
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTotalRedeems();
    }
  }, [fetchTotalRedeems]);

  // Auto refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTotalRedeems();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchTotalRedeems]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchTotalRedeems();
  }, [fetchTotalRedeems]);

  return {
    totalRedeems: data?.totalRedeems ?? null,
    loading,
    error,
    cached: data?.cached ?? false,
    stale: data?.stale ?? false,
    refetch,
    lastUpdated: data?.timestamp ?? null,
  };
}

// Utility function for one-off fetches
export async function fetchTotalRedeems(): Promise<number> {
  try {
    const response = await fetch("/api/total-redeems");
    const result = await response.json();

    if (result.success) {
      return result.totalRedeems;
    } else {
      throw new Error(result.error || "Failed to fetch total redeems");
    }
  } catch (error) {
    console.error("Error fetching total redeems:", error);
    throw error;
  }
}

// Utility function to invalidate cache (admin use)
export async function invalidateTotalRedeemsCache(): Promise<boolean> {
  try {
    const response = await fetch("/api/total-redeems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "invalidate-cache" }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error invalidating cache:", error);
    return false;
  }
}
