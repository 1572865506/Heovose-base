"use client";

import React from 'react';
import { Box, Maximize, Layers } from 'lucide-react';

export const GeometrySpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => (
  <section id={variant === 'frontend' ? "section-02" : "admin-02"} className="space-y-10">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. 几何与投影规范定义 (Geometry & Shadows)</h2>
    </div>

    <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
         <div className="space-y-8">
           <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Box className="h-4 w-4" /> 边框阶梯与样式 (Stroke & Style)</span>
           <div className="space-y-6">
             <div className="grid grid-cols-1 gap-6">
               <div className="space-y-3">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">实线系列 (Solid Borders)</p>
                 <div className="flex items-center gap-6">
                   <div className="h-14 w-32 border border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">1px</div>
                   <div className="h-14 w-32 border-2 border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">2px</div>
                   <div className="h-14 w-32 border-4 border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">4px</div>
                 </div>
               </div>
               <div className="space-y-3">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">虚线系列 (Dashed Borders)</p>
                 <div className="flex items-center gap-6">
                   <div className="h-14 w-32 border border-dashed border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">1px Dashed</div>
                   <div className="h-14 w-32 border-2 border-dashed border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">2px Dashed</div>
                 </div>
               </div>
             </div>
           </div>
         </div>

         <div className="space-y-8">
           <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Maximize className="h-4 w-4" /> 圆角阶梯标准 (Radius Standard)</span>
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="space-y-2">
                <div className="h-32 w-full rounded-none bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">0px</div>
                <p className="text-[9px] font-bold uppercase">无圆角 (Sharp)</p>
              </div>
              <div className="space-y-2">
                <div className="h-32 w-full rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">8px</div>
                <p className="text-[9px] font-bold uppercase">小圆角 (lg)</p>
              </div>
              <div className="space-y-2">
                <div className="h-32 w-full rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">16px</div>
                <p className="text-[9px] font-bold uppercase">大圆角 (2xl)</p>
              </div>
              <div className="space-y-2">
                <div className="h-32 w-full rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">40px</div>
                <p className="text-[9px] font-bold uppercase text-primary">超级圆角 (Brand)</p>
              </div>
              <div className="space-y-2">
                <div className="h-32 w-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">Pill</div>
                <p className="text-[9px] font-bold uppercase">圆形圆角 (Full)</p>
              </div>
           </div>
         </div>
      </div>

      <div className="pt-16 border-t border-dashed border-border/60">
         <div className="flex items-center gap-3 mb-10">
           <Layers className="h-4 w-4 text-primary" />
           <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">阴影投影阶梯 (Shadow Hierarchy)</span>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-white rounded-2xl shadow-sm border border-border/20 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-sm</div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase">极简隔离</p>
                <p className="text-[9px] text-muted-foreground">用于徽章、标签及微型原子组件。</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-white rounded-2xl shadow-md border border-border/40 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-md</div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase">标准浮动</p>
                <p className="text-[9px] text-muted-foreground">用于常规卡片、二级容器。</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-white rounded-2xl shadow-xl border border-border/40 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-xl</div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase">强调浮动</p>
                <p className="text-[9px] text-muted-foreground">用于激活态卡片、产品详情展示区。</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-white rounded-2xl shadow-2xl border border-border/20 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-2xl</div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase">全局深度</p>
                <p className="text-[9px] text-muted-foreground">用于全局导航、Hero 屏悬浮视觉块。</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  </section>
));
GeometrySpecification.displayName = "GeometrySpecification";
