import { useState, useEffect, useCallback } from 'react';

export function useLocalDoc<T = any>(path: string | null, id: string | null = '') {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (currentPath: string, currentId: string) => {
    setIsLoading(true);
    try {
      const url = currentId ? `/api/${currentPath}/${currentId}` : `/api/${currentPath}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch doc: ${res.statusText}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(`Error fetching local doc ${currentPath}${currentId ? '/' + currentId : ''}:`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!path || id === null || id === 'new') {
      setData(null);
      setIsLoading(false);
      return;
    }

    fetchData(path, id);
  }, [path, id, fetchData]);

  const mutate = useCallback(() => {
    if (path && id !== null && id !== 'new') {
      fetchData(path, id);
    }
  }, [path, id, fetchData]);

  return { data, isLoading, error, mutate };
}
