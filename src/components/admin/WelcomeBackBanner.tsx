'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Zap, 
  MessageSquare, 
  Package, 
  Users, 
  TrendingUp, 
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

interface WelcomeData {
  hasData: boolean;
  newInquiries: number;
  newProducts: number;
  newSessions: number;
  totalPending: number;
  processedSinceLastSeen: number;
  awayTime: string;
}

export function WelcomeBackBanner() {
  const { data: session } = useSession();
  const [data, setData] = useState<WelcomeData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only fetch once per session
    const hasChecked = sessionStorage.getItem('welcome_back_checked');
    if (hasChecked) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/welcome-back');
        if (!res.ok) {
          const errorJson = await res.json().catch(() => ({}));
          console.warn('Welcome back API error:', res.status, errorJson);
          return;
        }
        
        const text = await res.text();
        if (!text) return;
        
        const json = JSON.parse(text);
        
        if (json.hasData) {
          setData(json);
          setIsVisible(true);
          sessionStorage.setItem('welcome_back_checked', 'true');
        } else {
          sessionStorage.setItem('welcome_back_checked', 'true');
        }
      } catch (err) {
        console.error('Failed to parse welcome back data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isVisible && bannerRef.current) {
      gsap.fromTo(bannerRef.current, 
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 1 }
      );
    }
  }, [isVisible]);

  const handleClose = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setIsVisible(false)
      });
    }
  };

  if (!isVisible || !data) return null;

  return (
    <div 
      ref={bannerRef}
      className="fixed bottom-8 right-8 z-[100] w-[320px] pointer-events-auto"
    >
      <div className="relative overflow-hidden bg-card/80 backdrop-blur-3xl border border-border/40 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-6 group">
        {/* Decorative aurora glow elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl hover:bg-muted/40 text-muted-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 relative overflow-hidden group/icon shrink-0">
              <Sparkles className="h-5 w-5 text-white relative z-10 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-headline font-bold text-foreground tracking-tight truncate">Hi, {session?.user?.name?.split(' ')[0] || 'Admin'}</h4>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed">
                您不在的这 {data.awayTime} 里...
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(data.newInquiries > 0 || data.totalPending > 0) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">
                   <span>询盘动态 (Inquiries)</span>
                   <span className="text-primary">{data.newInquiries} NEW</span>
                </div>
                
                <div className="p-4 rounded-3xl bg-muted/10 border border-border/30 hover:border-primary/20 transition-all space-y-3">
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      累计新增了 <span className="text-primary font-black">{data.newInquiries}</span> 条咨询，团队已处理其中 <span className="text-emerald-500 font-bold">{data.processedSinceLastSeen}</span> 条。
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden flex">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                          style={{ width: `${data.newInquiries > 0 ? (data.processedSinceLastSeen / data.newInquiries) * 100 : 0}%` }} 
                        />
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground/50">
                        {data.newInquiries > 0 ? Math.round((data.processedSinceLastSeen / data.newInquiries) * 100) : 0}% 办结
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/20">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_6px_rgba(251,146,60,0.7)]" />
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">待办积压</span>
                    </div>
                    <span className="text-xs font-black text-foreground">{data.totalPending} 份</span>
                  </div>
                </div>
              </div>
            )}

            {(data.newProducts > 0 || data.newSessions > 0) && (
              <div className="grid grid-cols-2 gap-2">
                {data.newSessions > 0 && (
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">访客增长</span>
                    <span className="text-sm font-black text-foreground">+{data.newSessions}</span>
                  </div>
                )}
                {data.newProducts > 0 && (
                  <div className="p-3 rounded-2xl bg-muted/10 border border-border/20 flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">新产品</span>
                    <span className="text-sm font-black text-foreground">+{data.newProducts}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-emerald-500 bg-emerald-500/5 px-4 py-2.5 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">业务持续攀升中</span>
              </div>
              <ArrowUpRight className="h-3 w-3 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
