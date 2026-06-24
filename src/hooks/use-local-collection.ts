import { useState, useEffect, useCallback, useRef } from 'react';

// Simple global cache to deduplicate simultaneous requests
const pendingRequests = new Map<string, Promise<any>>();
export const globalCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 300000;

// Global Pub/Sub system for globalCache synchronization
const cacheListeners = new Map<string, Set<(data: any) => void>>();

export function subscribeToCache(path: string, listener: (data: any) => void) {
  if (!cacheListeners.has(path)) {
    cacheListeners.set(path, new Set());
  }
  cacheListeners.get(path)!.add(listener);
  return () => {
    const listeners = cacheListeners.get(path);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        cacheListeners.delete(path);
      }
    }
  };
}

export function notifyCacheUpdate(path: string, data: any) {
  const listeners = cacheListeners.get(path);
  if (listeners) {
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (e) {
        console.error('Error in cache listener:', e);
      }
    });
  }
}


export function useLocalCollection<T = any>(path: string | null, options?: { enabled?: boolean; initialData?: T[] }) {
  const enabled = options?.enabled !== false;

  // 在组件渲染的第一时间同步向 globalCache 填充被劫持的系统配置与分类数据，
  // 这样在组件初始化 useState(cached?.data) 时就能直接拿到数据，实现真正的 SSR 与 Hydration 同步渲染
  if (path && !globalCache.has(path)) {
    const isClient = typeof window !== 'undefined';
    const isAdmin = isClient ? window.location.pathname.includes('/admin') : false;
    
    if (!isAdmin) {
      const publicSettings = isClient 
        ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ 
        : (typeof global !== 'undefined' ? (global as any).__HEOVOSE_PUBLIC_SETTINGS__ : null);
        
      if ((path === 'productCategories' || path.startsWith('productCategories?')) && publicSettings?.productCategories) {
        const localCategories = publicSettings.productCategories;
        let localData = localCategories;
        if (path.includes('parentId=WHOLESALE')) {
          localData = localCategories.filter((c: any) => c.parentId === 'WHOLESALE' || c.id === 'WHOLESALE');
        } else if (path.includes('parentId=PROJECT')) {
          localData = localCategories.filter((c: any) => c.parentId === 'PROJECT' || c.id === 'PROJECT');
        }
        globalCache.set(path, { data: localData, timestamp: Date.now() });
      } else if (path.startsWith('localizedStrings?lang=') && publicSettings?.translations) {
        globalCache.set(path, { data: publicSettings.translations, timestamp: Date.now() });
      }
    }
  }

  if (path && options?.initialData !== undefined && !globalCache.has(path)) {
    globalCache.set(path, { data: options.initialData, timestamp: Date.now() });
  }
  
  const cached = path ? globalCache.get(path) : null;
  
  const [data, setData] = useState<T[] | null>(cached?.data || null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);

  const latestPathRef = useRef(path);

  useEffect(() => {
    latestPathRef.current = path;
  }, [path]);

  const fetchData = useCallback(async (currentPath: string) => {
    // 对 productCategories 做本地劫持，避免客户端 AJAX 请求和秒替换闪烁
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
    if (currentPath.startsWith('productCategories') && !isAdmin) {
      const publicSettings = typeof window !== 'undefined' ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ : null;
      const localCategories = publicSettings?.productCategories || [];
      
      let localData = localCategories;
      if (currentPath.includes('parentId=WHOLESALE')) {
        localData = localCategories.filter((c: any) => c.parentId === 'WHOLESALE' || c.id === 'WHOLESALE');
      } else if (currentPath.includes('parentId=PROJECT')) {
        localData = localCategories.filter((c: any) => c.parentId === 'PROJECT' || c.id === 'PROJECT');
      }
      
      if (currentPath !== latestPathRef.current) return;
      globalCache.set(currentPath, { data: localData, timestamp: Date.now() });
      setData(localData);
      setError(null);
      setIsLoading(false);
      return;
    }
    // 对 localizedStrings?lang= 做本地劫持，避免客户端 AJAX 请求和秒替换闪烁
    if (currentPath.startsWith('localizedStrings?lang=') && !isAdmin) {
      const publicSettings = typeof window !== 'undefined' ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ : null;
      const localData = publicSettings?.translations || [];
      
      if (currentPath !== latestPathRef.current) return;
      globalCache.set(currentPath, { data: localData, timestamp: Date.now() });
      setData(localData);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (pendingRequests.has(currentPath)) {
      try {
        const result = await pendingRequests.get(currentPath);
        if (currentPath !== latestPathRef.current) return;
        const cachedEntry = globalCache.get(currentPath);
        setData(cachedEntry ? cachedEntry.data : result);
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

      // Merge strategy: to avoid wiping out client-injected business translations (e.g., category, product)
      // that might have been populated before this fetch resolved, we merge network data with existing cached data.
      const existing = globalCache.get(currentPath)?.data || [];
      const dataMap = new Map<string, any>();
      existing.forEach((item: any) => {
        if (item && item.id) {
          dataMap.set(item.id, item);
        }
      });
      json.forEach((item: any) => {
        if (item && item.id) {
          const exist = dataMap.get(item.id);
          if (exist) {
            dataMap.set(item.id, {
              ...exist,
              ...item,
              content: {
                ...(exist.content || {}),
                ...(item.content || {})
              }
            });
          } else {
            dataMap.set(item.id, item);
          }
        }
      });
      const merged = Array.from(dataMap.values());

      globalCache.set(currentPath, { data: merged, timestamp: Date.now() });
      setData(merged);
      notifyCacheUpdate(currentPath, merged);
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

    // Check cache again, if it has data, set it instead of resetting to null.
    // This prevents the state from flashing back to null during hydration effects.
    const currentCached = globalCache.get(path);
    if (!currentCached) {
      setData(null);
      setIsLoading(true);
    } else {
      setData(currentCached.data);
      setIsLoading(false);
    }

    // 针对被劫持的公共路径（分类和系统翻译），若缓存已存在数据，无需再通过网络 Fetch 发起数据拉取
    // 这样可以避免客户端再次触发 AJAX 导致在网络慢时又被覆盖为中间态空数据
    const isHijacked = path.startsWith('productCategories') || path.startsWith('localizedStrings?lang=');
    if (isHijacked && currentCached) {
      return;
    }

    fetchData(path);
  }, [path, enabled, fetchData]);

  useEffect(() => {
    if (!path || !enabled) return;
    const unsubscribe = subscribeToCache(path, (newData) => {
      setData(newData);
    });
    return unsubscribe;
  }, [path, enabled]);

  const mutate = useCallback(() => {
    if (path) {
      globalCache.delete(path);
      pendingRequests.delete(path); // Clear any pending requests to force a real fetch
      // 必须将本地状态清空或设置为 null，以允许干净的拉取，避免 Merge 机制将网络拉回的已删除列表中不存在的项目继续残留
      setData(null);
      fetchData(path);
    }
  }, [path, fetchData]);

  return { data, isLoading, error, mutate };
}
