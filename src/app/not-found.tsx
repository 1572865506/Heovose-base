'use client';

import Link from 'next/link';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-aurora flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow particles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-project/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full glass-morphism rounded-3xl p-8 md:p-10 shadow-2xl relative border border-white/20 text-center space-y-8 gpu-accelerated">
        <div className="mx-auto w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20 shadow-inner relative">
          <Compass className="w-12 h-12 text-primary animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-0 rounded-full border border-project/30 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-bold tracking-tight text-primary font-headline">
            404
          </h1>
          <p className="text-lg font-semibold text-foreground">
            页面未找到 / Page Not Found
          </p>
          <div className="h-px bg-border/50 my-4" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            抱歉，您访问的页面不存在或已被移除。你可以点击下方按钮返回首页或返回上一页。
          </p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed italic mt-1">
            Sorry, the page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-border rounded-xl bg-white hover:bg-slate-50 text-foreground text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回上一页 / Go Back</span>
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
