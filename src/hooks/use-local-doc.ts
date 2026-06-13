import { useState, useEffect, useCallback, useRef } from 'react';

// Simple global cache to deduplicate simultaneous requests
const pendingRequests = new Map<string, Promise<any>>();
const globalCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes cache for stability

export function useLocalDoc<T = any>(path: string | null, id: string | null = '', options?: { enabled?: boolean; initialData?: T }) {
  const enabled = options?.enabled !== false;
  const cacheKey = path ? `${path}/${id || ''}` : null;
  
  // 在组件渲染的第一时间同步向 globalCache 填充被劫持的系统配置与分类数据，
  // 这样在组件初始化 useState(cached?.data) 时就能直接拿到数据，实现真正的 SSR 与 Hydration 同步渲染
  if (cacheKey && path === 'settings' && id && !globalCache.has(cacheKey)) {
    const PUBLIC_SETTINGS = ['site', 'navigation', 'about_page_content', 'service_centers', 'storage', 'languages'];
    if (PUBLIC_SETTINGS.includes(id)) {
      const isClient = typeof window !== 'undefined';
      const publicSettings = isClient 
        ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ 
        : (typeof global !== 'undefined' ? (global as any).__HEOVOSE_PUBLIC_SETTINGS__ : null);
      const localData = publicSettings?.[id] || {};
      globalCache.set(cacheKey, { data: JSON.parse(JSON.stringify(localData)), timestamp: Date.now() });
    }
  }

  if (cacheKey && options?.initialData !== undefined && !globalCache.has(cacheKey)) {
    globalCache.set(cacheKey, { data: options.initialData, timestamp: Date.now() });
  }
  
  const cached = cacheKey ? globalCache.get(cacheKey) : null;
  
  const [data, setData] = useState<T | null>(cached?.data || null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);

  const latestKeyRef = useRef(cacheKey);

  useEffect(() => {
    latestKeyRef.current = cacheKey;
  }, [cacheKey]);

  const fetchData = useCallback(async (currentPath: string, currentId: string) => {
    const key = `${currentPath}/${currentId}`;

    // 对 settings 中的公开配置做本地劫持，避免发送 AJAX 请求，从根源关闭匿名访问 API 的通道
    // 在后台管理界面 (以 /admin 开头) 则放行，允许通过 API 获取最新配置，以便状态实时更新
    const PUBLIC_SETTINGS = ['site', 'navigation', 'about_page_content', 'service_centers', 'storage', 'languages'];
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (!isAdmin && currentPath === 'settings' && currentId && PUBLIC_SETTINGS.includes(currentId)) {
      const publicSettings = typeof window !== 'undefined' ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ : null;
      const localData = publicSettings?.[currentId] || {};
      const clonedData = JSON.parse(JSON.stringify(localData));
      
      if (key !== latestKeyRef.current) return;
      globalCache.set(key, { data: clonedData, timestamp: Date.now() });
      setData(clonedData);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (pendingRequests.has(key)) {
      try {
        const result = await pendingRequests.get(key);
        if (key !== latestKeyRef.current) return;
        setData(result);
        setError(null);
        setIsLoading(false);
        return;
      } catch (err: any) {
        if (key !== latestKeyRef.current) return;
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

    // Only transition to loading state if we have no cached data to show,
    // achieving smooth Stale-While-Revalidate without flash/whiteout.
    if (!currentCached) {
      setIsLoading(true);
    }
    
    const fetchPromise = (async () => {
      const url = currentId ? `/api/${currentPath}/${currentId}` : `/api/${currentPath}`;
      // Restored stable URL to leverage local memory caching and protect server load
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!res.ok) throw new Error(`Failed to fetch doc "${key}": ${res.statusText} (Status: ${res.status})`);
      return await res.json();
    })();

    pendingRequests.set(key, fetchPromise);

    try {
      const json = await fetchPromise;
      if (key !== latestKeyRef.current) return;
      globalCache.set(key, { data: json, timestamp: Date.now() });
      setData(json);
      setError(null);
      
      // 同步更新全局 window 对象上的缓存数据，保证系统其他引用该配置的组件也同步拿到最新值
      if (typeof window !== 'undefined' && (window as any).__HEOVOSE_PUBLIC_SETTINGS__) {
        (window as any).__HEOVOSE_PUBLIC_SETTINGS__[currentId] = json;
      }
    } catch (err: any) {
      if (key !== latestKeyRef.current) return;
      console.error(`CRITICAL: Failed to fetch "${key}":`, err);
      setError(err);
    } finally {
      pendingRequests.delete(key);
      if (key === latestKeyRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!path || id === null || id === 'new' || !enabled) {
      if (!path || id === null || id === 'new') setData(null);
      setIsLoading(false);
      return;
    }

    const key = `${path}/${id || ''}`;
    const currentCached = globalCache.get(key);
    if (!currentCached) {
      setData(null);
      setIsLoading(true);
    } else {
      setData(currentCached.data);
      setIsLoading(false);
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
