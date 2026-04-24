"use client";

import React from 'react';
import { Sparkles, Zap, Layers } from 'lucide-react';

export const GlassSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => (
  <section id={variant === 'frontend' ? "section-12" : "admin-12"} className="space-y-10 pb-40">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">12. 毛玻璃效果规范 (Glassmorphism)</h2>
    </div>

    <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20 overflow-hidden relative">
      {/* 装饰性背景 */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="grid grid-cols-1 gap-20 relative z-10">
        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">12.1 模糊阶梯与背景透明度 (Levels & Opacity)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 轻薄型 */}
            <div className="space-y-4">
               <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                 <div className="absolute inset-4 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[10px] font-bold uppercase text-primary mb-1">Level 01: Crystal</span>
                    <p className="text-[8px] opacity-60 uppercase">Blur: 4px | Opacity: 30%</p>
                 </div>
               </div>
               <p className="text-[9px] text-muted-foreground italic uppercase">适用于轻量化悬浮、二级菜单或信息提示浮层。</p>
            </div>

            {/* 标准型 */}
            <div className="space-y-4">
               <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                 <div className="absolute inset-4 backdrop-blur-md bg-white/60 border border-white/20 rounded-xl flex flex-col items-center justify-center p-4 text-center shadow-lg">
                    <span className="text-[10px] font-bold uppercase text-primary mb-1">Level 02: Frosted</span>
                    <p className="text-[8px] opacity-60 uppercase">Blur: 12px | Opacity: 60%</p>
                 </div>
               </div>
               <p className="text-[9px] text-muted-foreground italic uppercase">品牌标准玻璃效果，用于核心卡片、导航栏背景。</p>
            </div>

            {/* 深邃型 */}
            <div className="space-y-4">
               <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                 <div className="absolute inset-4 backdrop-blur-2xl bg-white/80 border border-white/10 rounded-xl flex flex-col items-center justify-center p-4 text-center shadow-2xl">
                    <span className="text-[10px] font-bold uppercase text-primary mb-1">Level 03: Deep</span>
                    <p className="text-[8px] opacity-60 uppercase">Blur: 40px | Opacity: 80%</p>
                 </div>
               </div>
               <p className="text-[9px] text-muted-foreground italic uppercase">高隔离感容器，适用于模态框、侧边抽屉或全局遮罩。</p>
            </div>

            {/* 暗色型 */}
            <div className="space-y-4">
               <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                 <div className="absolute inset-4 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[10px] font-bold uppercase text-white mb-1">Level 04: Eclipse</span>
                    <p className="text-[8px] text-white/60 uppercase">Blur: 12px | Opacity: 40% (Dark)</p>
                 </div>
               </div>
               <p className="text-[9px] text-muted-foreground italic uppercase">工业质感暗色玻璃，用于项目线业务或深色主题模式。</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-8">
             <div className="flex items-center gap-3">
               <Zap className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">12.2 物理边框与感知逻辑 (Logic)</span>
             </div>
             <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6">
               <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-primary">高光发丝边框 (Highlight Stroke)</p>
                  <p className="text-[9px] text-muted-foreground leading-relaxed uppercase">
                    毛玻璃组件必须搭配 **1px 内部高光描边**（通常为 `border-white/20`），以模拟玻璃边缘的折射感，增强层级深度。
                  </p>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-primary">多重投影叠加 (Layered Shadows)</p>
                  <p className="text-[9px] text-muted-foreground leading-relaxed uppercase">
                    深层毛玻璃必须配合 `shadow-2xl`，通过弥散投影进一步强化“物理悬浮”的感知，而非单纯的平面遮盖。
                  </p>
               </div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="flex items-center gap-3">
               <Layers className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">12.3 适用场景矩阵 (Use Cases)</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Nav Bars', desc: 'Header & Fixed Menu' },
                 { label: 'Modals', desc: 'Dialog & Popups' },
                 { label: 'Quick Info', desc: 'Tooltips & Badges' },
                 { label: 'Hero Cards', desc: 'Floating Content' }
               ].map(item => (
                 <div key={item.label} className="p-4 rounded-xl border border-dashed border-primary/20 bg-white/40 backdrop-blur-sm">
                   <p className="text-[10px] font-bold uppercase text-primary">{item.label}</p>
                   <p className="text-[8px] opacity-40 uppercase mt-1">{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));
GlassSpecification.displayName = "GlassSpecification";
