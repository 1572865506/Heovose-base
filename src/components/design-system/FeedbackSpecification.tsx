"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Box, Monitor, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export const FeedbackSpecification = React.memo(() => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <section id="section-15" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">15. 反馈与加载规范 (Feedback & Loading)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* 15.1 骨架屏规范 */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Box className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">15.1 骨架屏占位规范 (Skeleton Design)</span>
            </div>

            <div className="p-8 bg-muted/5 rounded-[2.5rem] border border-border/40 space-y-8 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase text-primary/40">Product Card Preview</p>
                <Button variant="ghost" size="sm" onClick={simulateLoading} className="h-7 text-[9px] uppercase font-bold tracking-widest border border-primary/10">
                   Toggle Loading
                </Button>
              </div>

              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-[200px] w-full rounded-2xl bg-primary/5" />
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-2/3 bg-primary/5" />
                      <Skeleton className="h-4 w-full bg-primary/5" />
                      <Skeleton className="h-4 w-5/6 bg-primary/5" />
                    </div>
                    <div className="flex gap-2 pt-2">
                       <Skeleton className="h-8 w-24 rounded-full bg-primary/5" />
                       <Skeleton className="h-8 w-24 rounded-full bg-primary/5" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="h-[200px] w-full rounded-2xl bg-muted/20 flex items-center justify-center overflow-hidden">
                       <Monitor className="h-12 w-12 text-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-primary uppercase">Heovose X-Series Pro</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Industry-leading technical specifications for next-generation manufacturing platforms.
                      </p>
                    </div>
                    <div className="flex gap-2">
                       <Button size="sm" className="rounded-full px-6">Explore</Button>
                       <Button variant="outline" size="sm" className="rounded-full px-6">Buy Now</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 15.2 全域通知系统 */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">15.2 全域通知系统 (Notifications)</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => toast({
                  title: "Submission Successful",
                  description: "Your technical inquiry has been sent to our expert team.",
                  className: "bg-white/80 backdrop-blur-xl border-primary/20 rounded-2xl shadow-2xl"
                })}
                className="p-6 rounded-2xl bg-white border border-border/40 hover:border-primary/40 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold uppercase text-primary">Success Notification</h5>
                    <p className="text-[9px] text-muted-foreground mt-1">点击触发成功提示（Toast Success）</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => toast({
                  title: "Authentication Failed",
                  description: "Unable to verify secure access credentials.",
                  variant: "destructive",
                  className: "rounded-2xl shadow-2xl"
                })}
                className="p-6 rounded-2xl bg-white border border-border/40 hover:border-destructive/40 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold uppercase text-destructive">Error Notification</h5>
                    <p className="text-[9px] text-muted-foreground mt-1">点击触发错误提示（Toast Error）</p>
                  </div>
                </div>
              </button>
            </div>
            
            <p className="text-[9px] text-muted-foreground italic leading-relaxed bg-muted/5 p-4 rounded-xl border border-border/20">
              规范建议：全域通知必须遵循 **玻璃质感 (Glassmorphism)** 准则，并位于屏幕右上角（Desktop）或顶部中央（Mobile），确保不干扰核心操作路径。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
FeedbackSpecification.displayName = "FeedbackSpecification";
