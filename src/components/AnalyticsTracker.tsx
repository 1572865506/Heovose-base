'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string | null>(null);

  // DISABLE tracking if running inside an iframe (e.g., admin heatmap preview)
  // or if explicitly disabled via query param
  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      console.log('[Analytics] Tracking disabled inside iframe');
      return;
    }
  }, []);

  if (typeof window !== 'undefined' && window.self !== window.top) {
    return null;
  }

  // 1. Track Page View & Dwell Time (停留时间)
  useEffect(() => {
    const pageStartTime = Date.now();
    const currentPath = pathname;

    const runTracking = () => {
      // Initialize or retrieve Session & Visitor ID
      let visitorId = localStorage.getItem('heovose-analytics-visitor');
      if (!visitorId) {
        visitorId = `vis_${Math.random().toString(36).substring(2)}_${Date.now()}`;
        localStorage.setItem('heovose-analytics-visitor', visitorId);
      }
      visitorIdRef.current = visitorId;

      let sessionId = sessionStorage.getItem('heovose-analytics-session');
      if (!sessionId) {
        sessionId = `sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
        sessionStorage.setItem('heovose-analytics-session', sessionId);
      }
      sessionIdRef.current = sessionId;

      // Track Page View
      const trackPageView = async () => {
        try {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'pageview',
              sessionId: sessionIdRef.current,
              visitorId: visitorIdRef.current,
              path: currentPath,
              referrer: document.referrer,
              userAgent: navigator.userAgent,
            }),
          });
        } catch (e) {
          // Silent fail
        }
      };

      trackPageView();
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => runTracking());
      } else {
        setTimeout(runTracking, 1000);
      }
    }

    return () => {
      // 页面离开时统计停留时间 (单位秒)
      const duration = Math.round((Date.now() - pageStartTime) / 1000);
      if (duration > 0 && duration < 7200) {
        const vId = localStorage.getItem('heovose-analytics-visitor') || visitorIdRef.current;
        const sId = sessionStorage.getItem('heovose-analytics-session') || sessionIdRef.current;
        
        if (vId && sId) {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'scroll', // 借用 scroll 传输停留时间，或者其他合规 type
              sessionId: sId,
              visitorId: vId,
              path: currentPath,
              duration: duration,
            }),
            keepalive: true, // 保证在卸载/跳转时传输成功
          }).catch(() => {});
        }
      }
    };
  }, [pathname]);

  // 2. Track Clicks (Heatmap Data)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Avoid tracking clicks on admin panel or sensitive elements
      if (pathname.startsWith('/admin')) return;

      const doc = document.documentElement;
      const clickData = {
        type: 'click',
        sessionId: sessionIdRef.current,
        visitorId: visitorIdRef.current,
        path: pathname,
        x: (e.pageX / doc.scrollWidth) * 100,
        y: (e.pageY / doc.scrollHeight) * 100,
        element: (e.target as HTMLElement).tagName,
        layout: {
          scrollWidth: doc.scrollWidth,
          scrollHeight: doc.scrollHeight,
          clientWidth: doc.clientWidth,
          clientHeight: doc.clientHeight,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          pageX: e.pageX,
          pageY: e.pageY
        }
      };

      const sendClickData = async () => {
        try {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clickData),
          });
        } catch (e) {
          // Silent fail
        }
      };

      if (typeof window !== 'undefined') {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => sendClickData());
        } else {
          setTimeout(sendClickData, 0);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [pathname]);

  return null;
}
