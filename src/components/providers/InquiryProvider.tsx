'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { useParams, usePathname } from 'next/navigation';
import { Locale } from '@/lib/translations';

const InquiryDialog = nextDynamic(
  () => import('@/components/InquiryDialog').then(mod => mod.InquiryDialog),
  { ssr: false }
);

const CookieConsent = nextDynamic(
  () => import('@/components/CookieConsent'),
  { ssr: false }
);

const AnalyticsTracker = nextDynamic(
  () => import('@/components/AnalyticsTracker').then(mod => mod.AnalyticsTracker),
  { ssr: false }
);

const LanguageIntelligence = nextDynamic(
  () => import('@/components/LanguageIntelligence').then(mod => mod.LanguageIntelligence),
  { ssr: false }
);

interface InquiryContextType {
  openInquiry: (options?: { productId?: string; productName?: string }) => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export function useInquiry() {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
}

interface InquiryProviderProps {
  children: ReactNode;
  locale?: Locale;
}

export function InquiryProvider({ children, locale: propLocale }: InquiryProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiryOptions, setInquiryOptions] = useState<{ productId?: string; productName?: string }>({});
  
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as Locale) || propLocale || 'en';

  const [showAnalytics, setShowAnalytics] = useState(false);
  const isAdmin = pathname?.startsWith('/admin') || 
                  pathname?.startsWith('/auth') || 
                  pathname?.includes('/login');

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => {
        setShowAnalytics(true);
      });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(() => {
        setShowAnalytics(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openInquiry = (options: { productId?: string; productName?: string } = {}) => {
    setInquiryOptions(options);
    setIsOpen(true);
  };

  return (
    <InquiryContext.Provider value={{ openInquiry }}>
      {!isAdmin && (
        <Suspense fallback={null}>
          <LanguageIntelligence />
        </Suspense>
      )}
      {showAnalytics && <AnalyticsTracker />}
      {children}
      {isOpen && (
        <InquiryDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          locale={locale}
          productId={inquiryOptions.productId}
          productName={inquiryOptions.productName}
        />
      )}
      {!isAdmin && <CookieConsent />}
    </InquiryContext.Provider>
  );
}
