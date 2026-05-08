import { useState, useEffect, useCallback } from 'react';

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

  const fetchData = useCallback(async (currentPath: string) => {
    if (pendingRequests.has(currentPath)) {
      try {
        const result = await pendingRequests.get(currentPath);
        setData(result);
        setError(null);
        setIsLoading(false);
        return;
      } catch (err: any) {
        setError(err);
        setIsLoading(false);
        return;
      }
    }

    const currentCached = globalCache.get(currentPath);
    if (currentCached && Date.now() - currentCached.timestamp < 10000) {
      return;
    }

    setIsLoading(true);
    
    // REMOVED cache-busting timestamp to allow browser caching
    const url = `/api/${currentPath}`;

    const fetchPromise = (async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch collection "${currentPath}": ${res.statusText} (Status: ${res.status})`);
      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error(`Collection "${currentPath}" returned invalid data (not an array)`);
      }
      return json;
    })();

    pendingRequests.set(currentPath, fetchPromise);

    try {
      const json = await fetchPromise;
      globalCache.set(currentPath, { data: json, timestamp: Date.now() });
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(`CRITICAL: Failed to fetch "${currentPath}":`, err);
      setError(err);
    } finally {
      pendingRequests.delete(currentPath);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!path || !enabled) {
      if (!path) setData(null);
      setIsLoading(false);
      return;
    }

    fetchData(path);
  }, [path, enabled, fetchData]);

  const mutate = useCallback(() => {
    if (path) {
      globalCache.delete(path);
      fetchData(path);
    }
  }, [path, fetchData]);

  return { data, isLoading, error, mutate };
}
