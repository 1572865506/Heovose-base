'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InquiryDialog } from '@/components/InquiryDialog';
import { Locale } from '@/lib/translations';

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
  
  // Use prop locale if provided, otherwise fallback to 'en' (it will be updated by page logic anyway)
  const locale = propLocale || 'en';

  const openInquiry = (options: { productId?: string; productName?: string } = {}) => {
    setInquiryOptions(options);
    setIsOpen(true);
  };

  return (
    <InquiryContext.Provider value={{ openInquiry }}>
      {children}
      <InquiryDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        locale={locale}
        productId={inquiryOptions.productId}
        productName={inquiryOptions.productName}
      />
    </InquiryContext.Provider>
  );
}
