'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    console.error('Unhandled System Error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-aurora flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow particles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full glass-morphism rounded-3xl p-8 md:p-10 shadow-2xl relative border border-white/20 text-center space-y-8 gpu-accelerated">
        <div className="mx-auto w-24 h-24 rounded-full bg-destructive/5 flex items-center justify-center border border-destructive/20 shadow-inner relative">
          <AlertTriangle className="w-12 h-12 text-destructive animate-bounce animate-infinite" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 rounded-full border border-destructive/30 animate-ping opacity-25" style={{ animationDuration: '2s' }} />
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-bold tracking-tight text-destructive font-headline">
            500
          </h1>
          <p className="text-lg font-semibold text-foreground">
            系统运行异常 / System Error
          </p>
          <div className="h-px bg-border/50 my-4" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            抱歉，系统在处理您的请求时遇到了内部错误。如果问题持续存在，请刷新重试或联系系统管理员。
          </p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed italic mt-1">
            Sorry, the system encountered an internal error. If the problem persists, please try again or contact the administrator.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-border rounded-xl bg-white hover:bg-slate-50 text-foreground text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新尝试 / Try Again</span>
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary/95 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/10"
          >
            <Home className="w-4 h-4" />
            <span>前往首页 / Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
