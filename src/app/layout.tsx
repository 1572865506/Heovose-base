
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Heovose Elevate | Technology Manufacturing',
  description: 'High-end technology manufacturing solutions including AIO, Mini PCs, and Industrial Monitors.',
};

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
