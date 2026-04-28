import { useState, useEffect, useCallback } from 'react';

export function useLocalCollection<T = any>(path: string | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (currentPath: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/${currentPath}`);
      if (!res.ok) throw new Error(`Failed to fetch collection "${currentPath}": ${res.statusText} (Status: ${res.status})`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(`Error fetching local collection "${currentPath}" from /api/${currentPath}:`, err);
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
