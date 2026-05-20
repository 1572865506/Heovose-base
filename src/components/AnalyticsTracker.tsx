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

  useEffect(() => {
    const runTracking = () => {
      // 1. Initialize or retrieve Session & Visitor ID
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

      // 2. Track Page View
      const trackPageView = async () => {
        try {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'pageview',
              sessionId: sessionIdRef.current,
              visitorId: visitorIdRef.current,
              path: pathname,
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
  }, [pathname]);

  useEffect(() => {
    // 3. Track Clicks (Heatmap Data)
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
        // Detailed layout context for reconstruction
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
