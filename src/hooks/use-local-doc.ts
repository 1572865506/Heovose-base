import { useState, useEffect, useCallback } from 'react';

// Simple global cache to deduplicate simultaneous requests
const pendingRequests = new Map<string, Promise<any>>();
const globalCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes cache for stability

export function useLocalDoc<T = any>(path: string | null, id: string | null = '', options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const cacheKey = path ? `${path}/${id || ''}` : null;
  const cached = cacheKey ? globalCache.get(cacheKey) : null;
  
  const [data, setData] = useState<T | null>(cached?.data || null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (currentPath: string, currentId: string) => {
    const key = `${currentPath}/${currentId}`;

    if (pendingRequests.has(key)) {
      try {
        const result = await pendingRequests.get(key);
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

    const currentCached = globalCache.get(key);
    // Use short TTL for background revalidation if desired, 
    // but here we check if it's "fresh enough" to skip fetch entirely
    if (currentCached && Date.now() - currentCached.timestamp < 10000) { // 10 seconds skip revalidation
       return;
    }

    setIsLoading(true);
    
    const fetchPromise = (async () => {
      const url = currentId ? `/api/${currentPath}/${currentId}` : `/api/${currentPath}`;
      // REMOVED cache-busting timestamp to allow browser caching
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch doc "${key}": ${res.statusText} (Status: ${res.status})`);
      return await res.json();
    })();

    pendingRequests.set(key, fetchPromise);

    try {
      const json = await fetchPromise;
      globalCache.set(key, { data: json, timestamp: Date.now() });
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(`CRITICAL: Failed to fetch "${key}":`, err);
      setError(err);
    } finally {
      pendingRequests.delete(key);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!path || id === null || id === 'new' || !enabled) {
      if (!path || id === null || id === 'new') setData(null);
      setIsLoading(false);
      return;
    }

    fetchData(path, id);
  }, [path, id, enabled, fetchData]);

  const mutate = useCallback(() => {
    if (path) {
      const key = `${path}/${id || ''}`;
      globalCache.delete(key);
      fetchData(path, id || '');
    }
  }, [path, id, fetchData]);

  return { data, isLoading, error, mutate };
}
