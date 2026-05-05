import { useState, useEffect, useCallback } from 'react';

export function useLocalCollection<T = any>(path: string | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (currentPath: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/${currentPath}?_t=${Date.now()}`);
      if (!res.ok) throw new Error(`Failed to fetch collection "${currentPath}": ${res.statusText} (Status: ${res.status})`);
      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error(`Collection "${currentPath}" returned invalid data (not an array)`);
      }
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(`CRITICAL: Failed to fetch "${currentPath}":`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!path) {
      setData(null);
      setIsLoading(false);
      return;
    }

    fetchData(path);
  }, [path, fetchData]);

  const mutate = useCallback(() => {
    if (path) fetchData(path);
  }, [path, fetchData]);

  return { data, isLoading, error, mutate };
}
