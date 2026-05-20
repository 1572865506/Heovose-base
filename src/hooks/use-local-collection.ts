import { useState, useEffect, useCallback, useRef } from 'react';

// Simple global cache to deduplicate simultaneous requests
const pendingRequests = new Map<string, Promise<any>>();
const globalCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 300000;

export function useLocalCollection<T = any>(path: string | null, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const cached = path ? globalCache.get(path) : null;
  
  const [data, setData] = useState<T[] | null>(cached?.data || null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);

  const latestPathRef = useRef(path);

  useEffect(() => {
    latestPathRef.current = path;
  }, [path]);

  const fetchData = useCallback(async (currentPath: string) => {
    if (pendingRequests.has(currentPath)) {
      try {
        const result = await pendingRequests.get(currentPath);
        if (currentPath !== latestPathRef.current) return;
        setData(result);
        setError(null);
        setIsLoading(false);
        return;
      } catch (err: any) {
        if (currentPath !== latestPathRef.current) return;
        setError(err);
        setIsLoading(false);
        return;
      }
    }

    const currentCached = globalCache.get(currentPath);
    if (currentCached && Date.now() - currentCached.timestamp < 10000) {
      return;
    }

    // Only transition to loading state if we have no cached data to show,
    // achieving smooth Stale-While-Revalidate without flash/whiteout.
    if (!currentCached) {
      setIsLoading(true);
    }
    
    // Restored stable URL to leverage local memory caching and protect server load
    const url = `/api/${currentPath}`;

    const fetchPromise = (async () => {
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!res.ok) {
        let errorMessage = res.statusText;
        try {
          const errorJson = await res.json();
          if (errorJson.error) errorMessage = errorJson.error;
        } catch (e) {
          // Fallback to status text
        }
        throw new Error(`Failed to fetch collection "${currentPath}": ${errorMessage} (Status: ${res.status})`);
      }
      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error(`Collection "${currentPath}" returned invalid data (not an array)`);
      }
      return json;
    })();

    pendingRequests.set(currentPath, fetchPromise);

    try {
      const json = await fetchPromise;
      if (currentPath !== latestPathRef.current) return;
      globalCache.set(currentPath, { data: json, timestamp: Date.now() });
      setData(json);
      setError(null);
    } catch (err: any) {
      if (currentPath !== latestPathRef.current) return;
      console.error(`CRITICAL: Failed to fetch "${currentPath}":`, err);
      setError(err);
    } finally {
      pendingRequests.delete(currentPath);
      if (currentPath === latestPathRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!path || !enabled) {
      if (!path) setData(null);
      setIsLoading(false);
      return;
    }

    // Reset data if path changed and it's not in cache to avoid stale data from different queries
    const currentCached = globalCache.get(path);
    if (!currentCached) {
      setData(null);
      setIsLoading(true);
    } else {
      setData(currentCached.data);
      setIsLoading(false);
    }

    fetchData(path);
  }, [path, enabled, fetchData]);

  const mutate = useCallback(() => {
    if (path) {
      globalCache.delete(path);
      pendingRequests.delete(path); // Clear any pending requests to force a real fetch
      fetchData(path);
    }
  }, [path, fetchData]);

  return { data, isLoading, error, mutate };
}
