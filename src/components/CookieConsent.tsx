'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { locale, isReady } = useLanguage();
  const { t, isLoading } = useTranslations(locale);

  useEffect(() => {
    // 禁用后台路由弹出
    if (pathname?.startsWith('/admin')) return;

    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Delay for better UX
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);

    // Track consent acceptance to trigger IP / UA backfilling on backend
    const sId = sessionStorage.getItem('heovose-analytics-session');
    const vId = localStorage.getItem('heovose-analytics-visitor');
    if (sId && vId) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cookie_accept',
          sessionId: sId,
          visitorId: vId,
          path: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {});
    }
  };

  if (!isReady || isLoading || pathname?.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100] no-print"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-colors duration-500" />
            
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <ShieldCheck className="h-6 w-6" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Cookie Privacy</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t('COOKIE_CONSENT_MESSAGE') || (locale === 'zh' ? '我们使用 Cookie 来改善您的浏览体验。继续访问本网站即表示您同意我们使用 Cookie。' : 'We use cookies to improve your experience. By continuing to visit this site you agree to our use of cookies.')}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleAccept}
                    className="rounded-full bg-slate-900 text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all font-bold text-[10px] uppercase tracking-widest px-6 h-10"
                  >
                    {t('COOKIE_CONSENT_ACCEPT') || (locale === 'zh' ? '接受' : 'Accept')}
                  </Button>
                  <Link href={`/${locale}/privacy`}>
                    <Button 
                      variant="ghost"
                      className="rounded-full text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest h-10"
                    >
                      {t('COOKIE_CONSENT_PRIVACY') || (locale === 'zh' ? '隐私政策' : 'Privacy Policy')}
                    </Button>
                  </Link>
                </div>
              </div>

              <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
