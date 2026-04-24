"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Activity, Zap, ArrowRight, Layers, RotateCcw } from 'lucide-react';

export const MotionSpecification = React.memo(() => {
  const [activeCurve, setActiveCurve] = useState('spring-stiff');
  const [isAnimate, setIsAnimate] = useState(false);
  const [staggerKey, setStaggerKey] = useState(0);

  const curves = [
    { id: 'spring-stiff', name: 'Stiff (高刚性)', desc: '用于极速反馈，如点击态、微交互。', class: 'animate-in zoom-in-95 duration-200' },
    { id: 'spring-gentle', name: 'Gentle (柔和型)', desc: '品牌标准动效，适用于大型卡片、面板进入。', class: 'animate-in fade-in slide-in-from-bottom-8 duration-700 ease-spring-gentle' },
    { id: 'brand-reveal', name: 'Reveal (品牌揭示)', desc: '极具张力的揭示效果，用于 Hero 屏。', class: 'animate-in slide-in-from-left-full duration-1000 ease-brand-reveal' }
  ];

  const triggerAnimation = () => {
    setIsAnimate(false);
    setTimeout(() => setIsAnimate(true), 10);
  };

  const triggerStagger = () => {
    setStaggerKey(prev => prev + 1);
  };

  return (
    <section id="section-13" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">13. 动力学系统规范 (Motion)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* 13.1 物理曲线实验室 */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">13.1 动力学曲线实验室 (Curve Lab)</span>
            </div>
            
            <div className="space-y-4">
              {curves.map(curve => (
                <button
                  key={curve.id}
                  onClick={() => { setActiveCurve(curve.id); triggerAnimation(); }}
                  className={cn(
                    "w-full p-6 rounded-2xl border transition-all text-left group relative overflow-hidden",
                    activeCurve === curve.id ? "bg-primary border-primary text-white" : "bg-muted/5 border-border/40 hover:border-primary/40"
                  )}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <p className="text-[10px] font-bold uppercase mb-1 opacity-60">Physical Curve</p>
                      <h4 className="text-sm font-bold uppercase tracking-widest">{curve.name}</h4>
                    </div>
                    <ArrowRight className={cn("h-4 w-4 transition-transform", activeCurve === curve.id ? "translate-x-1" : "opacity-20")} />
                  </div>
                  <p className={cn("text-[9px] mt-2 leading-relaxed relative z-10", activeCurve === curve.id ? "text-white/60" : "text-muted-foreground")}>
                    {curve.desc}
                  </p>
                  {activeCurve === curve.id && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          {/* 动画演示 */}
          <div className="flex flex-col items-center justify-center p-12 bg-muted/5 rounded-[2.5rem] border border-border/40 min-h-[400px]">
             <div className="relative w-48 h-48">
               {isAnimate && (
                 <div className={cn(
                   "absolute inset-0 rounded-3xl bg-primary flex items-center justify-center shadow-2xl",
                   curves.find(c => c.id === activeCurve)?.class
                 )}>
                   <Zap className="h-12 w-12 text-white" />
                 </div>
               )}
               {!isAnimate && (
                  <div className="absolute inset-0 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Awaiting Trigger</span>
                  </div>
               )}
             </div>
             <Button 
                onClick={triggerAnimation} 
                variant="outline" 
                className="mt-12 rounded-full px-8"
              >
               Replay Animation
             </Button>
          </div>
        </div>

        {/* 13.2 级联进入动效演示 */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Layers className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">13.2 级联进入规范 (Staggered Entrance)</span>
             </div>
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={triggerStagger}
               className="h-7 text-[9px] uppercase font-bold tracking-widest border border-primary/10"
             >
               <RotateCcw className="h-3 w-3 mr-2" /> Trigger Staggered Reveal
             </Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6" key={staggerKey}>
             {[1, 2, 3, 4].map(i => (
               <div 
                key={i} 
                style={{ animationDelay: `${i * 150}ms` }}
                className="h-32 rounded-2xl bg-white border border-border/40 p-6 flex flex-col justify-end animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards opacity-0 shadow-sm"
               >
                 <div className="h-1 w-8 bg-primary/20 rounded-full mb-4" />
                 <p className="text-[10px] font-bold text-primary uppercase">Module 0{i}</p>
                 <p className="text-[8px] text-muted-foreground uppercase mt-1">Stagger {i * 150}ms</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </section>
  );
});
MotionSpecification.displayName = "MotionSpecification";
