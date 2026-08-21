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

  // 1. Track Page View, UTM, Landing Page, Dwell Time & Scroll Depth
  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) return;

    const pageStartTime = Date.now();
    const currentPath = pathname;
    
    let maxScrollPercent = 0;
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.pageYOffset || doc.scrollTop;
      const scrollHeight = doc.scrollHeight;
      const clientHeight = doc.clientHeight;
      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable > 0) {
        const percent = Math.round((scrollTop / totalScrollable) * 100);
        if (percent > maxScrollPercent) {
          maxScrollPercent = Math.min(percent, 100);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

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

      // GDPR Privacy check
      const hasConsent = localStorage.getItem('cookie-consent') === 'accepted';

      // Landing Page identification
      const isLandingPage = !sessionStorage.getItem('heovose-is-landing-tracked');
      if (isLandingPage) {
        sessionStorage.setItem('heovose-is-landing-tracked', 'true');
      }

      // UTM params
      const searchParams = new URLSearchParams(window.location.search);
      const utm_source = searchParams.get('utm_source') || undefined;
      const utm_medium = searchParams.get('utm_medium') || undefined;
      const utm_campaign = searchParams.get('utm_campaign') || undefined;

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
              // Sensitivity shielding: only send referrer/UA if consent granted
              referrer: hasConsent ? document.referrer : undefined,
              userAgent: hasConsent ? navigator.userAgent : undefined,
              hasConsent,
              isLandingPage: isLandingPage ? true : undefined,
              utm_source,
              utm_medium,
              utm_campaign,
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
      window.removeEventListener('scroll', handleScroll);
      
      // Send dwell time & max scroll depth on page leave
      const duration = Math.round((Date.now() - pageStartTime) / 1000);
      if (duration > 0 && duration < 7200) {
        const vId = localStorage.getItem('heovose-analytics-visitor') || visitorIdRef.current;
        const sId = sessionStorage.getItem('heovose-analytics-session') || sessionIdRef.current;
        const hasConsent = localStorage.getItem('cookie-consent') === 'accepted';
        
        if (vId && sId) {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'scroll',
              sessionId: sId,
              visitorId: vId,
              path: currentPath,
              duration: duration,
              scrollDepth: maxScrollPercent,
              hasConsent,
            }),
            keepalive: true,
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
      const hasConsent = localStorage.getItem('cookie-consent') === 'accepted';
      const clickData = {
        type: 'click',
        sessionId: sessionIdRef.current,
        visitorId: visitorIdRef.current,
        path: pathname,
        x: (e.pageX / doc.scrollWidth) * 100,
        y: (e.pageY / doc.scrollHeight) * 100,
        element: (e.target as HTMLElement).tagName,
        hasConsent,
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

  // 3. Track Form Focus (Inquiry Abandonment Tracking)
  useEffect(() => {
    let formStarted = false;
    const handleFormFocus = (e: FocusEvent) => {
      if (formStarted) return;
      const target = e.target as HTMLElement;
      if (
        !pathname.startsWith('/admin') &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        const parentForm = target.closest('form');
        if (parentForm || pathname.includes('inquir') || pathname.includes('contact')) {
          formStarted = true;
          
          const sendFormStart = async () => {
            const hasConsent = localStorage.getItem('cookie-consent') === 'accepted';
            try {
              await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'form_start',
                  sessionId: sessionIdRef.current,
                  visitorId: visitorIdRef.current,
                  path: pathname,
                  element: target.id || target.getAttribute('name') || 'inquiry_input',
                  hasConsent,
                }),
              });
            } catch (e) {
              // Silent fail
            }
          };

          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => sendFormStart());
          } else {
            setTimeout(sendFormStart, 0);
          }
        }
      }
    };

    document.addEventListener('focusin', handleFormFocus);
    return () => document.removeEventListener('focusin', handleFormFocus);
  }, [pathname]);

  return null;
}
