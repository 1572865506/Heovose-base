"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToUnifiedLogin() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-white/20 text-xs font-bold uppercase tracking-[0.5em]">
        Redirecting to Unified Security Gateway...
      </div>
    </div>
  );
}
