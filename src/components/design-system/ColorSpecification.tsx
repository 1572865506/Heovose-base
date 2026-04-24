"use client";

import React from 'react';
import { ShoppingBag, Building2 } from 'lucide-react';

export const ColorSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => (
  <section id={variant === "frontend" ? "section-00" : "admin-00"} className="space-y-10">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">00. 核心色彩模组定义 (Core Colors)</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">批发业务：品牌蓝主题色</span>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm grid grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="h-20 w-full rounded-2xl bg-primary shadow-lg border border-primary/20" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase">主色 (Primary)</p>
              <p className="text-[8px] font-mono opacity-60">#005B99</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-20 w-full rounded-2xl bg-accent shadow-lg border border-accent/20" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase">辅助色 (Accent)</p>
              <p className="text-[8px] font-mono opacity-60">#FCDC00</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-20 w-full rounded-2xl bg-secondary shadow-lg border border-secondary/20" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase">中性色 (Neutral)</p>
              <p className="text-[8px] font-mono opacity-60">#3C434A</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-4 w-4 text-[#F97316]" />
          <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-[0.2em]">项目业务：工业橙主题色</span>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm grid grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="h-20 w-full rounded-2xl bg-[#F97316] shadow-lg border-orange-500/20" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase">主色 (Primary)</p>
              <p className="text-[8px] font-mono opacity-60">#F97316</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-20 w-full rounded-2xl bg-[#101820] shadow-lg border-black/20" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase">辅助色 (Accent)</p>
              <p className="text-[8px] font-mono opacity-60">#101820</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-20 w-full rounded-2xl bg-muted shadow-lg border-border/40" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase">中性色 (Neutral)</p>
              <p className="text-[8px] font-mono opacity-60">#E5E7EB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));
ColorSpecification.displayName = "ColorSpecification";
