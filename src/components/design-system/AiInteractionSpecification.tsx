"use client";

import React from 'react';
import { Sparkles, Wand2, Cpu, Loader2 } from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AiInteractionSpecification = React.memo(() => {
  return (
    <section id="frontend-14" className="space-y-10 pb-20">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">14. AI 智算与交互全链路 (AI Interaction)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* 14.3 AI 视觉资产标准 (Aurora Glow) */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">极光动效标准 (Aurora Glow)</span>
            </div>
            <div className="p-16 rounded-[2.5rem] bg-muted/10 border border-primary/10 flex flex-col items-center justify-center space-y-10 relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <ShinyButton className="scale-150 shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm">AI-Aurora Spec</span>
                </div>
              </ShinyButton>

              <div className="text-center space-y-3 relative z-10">
                 <p className="text-[12px] font-bold uppercase text-primary tracking-widest">AI-Aurora System v2.0</p>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] max-w-[280px] leading-relaxed">
                   4 色非线性极光渐变 + 物理级弹性旋转动画 + 呼吸感点阵纹理
                 </p>
              </div>

              {/* Background decorations */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">智译按钮形态 (Smart Translate)</span>
            </div>
            
            <div className="grid grid-cols-1 gap-12">
              {/* 14.2 AI 按钮几何形态 */}
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Capsule (旗舰级独立功能)</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <ShinyButton shape="capsule" className="h-11 px-8">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI 智译</span>
                    </div>
                  </ShinyButton>
                  <ShinyButton shape="capsule" disabled className="h-11 px-8">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>禁用状态</span>
                    </div>
                  </ShinyButton>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Rounded (嵌入式表单操作)</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <ShinyButton shape="rounded" className="h-11 px-8">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>智译模式</span>
                    </div>
                  </ShinyButton>
                  <ShinyButton shape="rounded" className="w-11 h-11 !p-0 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </ShinyButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 14.1 AI-Aura 加载态 */}
        <div className="pt-16 border-t border-dashed border-border/60">
          <div className="flex items-center gap-3 mb-8">
            <Loader2 className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">AI-Aura 加载与生成逻辑 (Aura Loading)</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase text-primary">智算态输入框 (Active Aura)</Label>
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400 rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                <Input 
                  readOnly 
                  defaultValue="正在智能生成内容..." 
                  className="h-12 bg-white/80 border-primary/20 rounded-lg relative z-10 text-xs font-medium pl-10" 
                />
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin z-20" />
              </div>
              <p className="text-[9px] text-muted-foreground italic">规范：激活 AI 任务时，Input 强制 Read-only 并开启流光外扩光晕。</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase text-primary">生成式骨架屏 (Generative Skeleton)</p>
              <div className="p-6 bg-muted/5 rounded-2xl border border-border/40 space-y-4 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                 <div className="h-4 w-3/4 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                 <div className="h-4 w-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                 <div className="h-4 w-1/2 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
              </div>
              <p className="text-[9px] text-muted-foreground italic">规范：不使用纯灰色，采用低饱和色彩梯度模拟生成感。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
