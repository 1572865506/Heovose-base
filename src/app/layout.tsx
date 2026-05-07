
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Heovose Elevate | Technology Manufacturing',
  description: 'High-end technology manufacturing solutions including AIO, Mini PCs, and Industrial Monitors.',
};

import { AuthProvider } from '@/components/providers/session-provider';
import { LanguageIntelligence } from '@/components/LanguageIntelligence';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
            <Suspense fallback={null}>
              <LanguageIntelligence />
            </Suspense>
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
