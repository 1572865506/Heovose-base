"use client";

import React from 'react';
import { Tag, Maximize, XCircle, X, LayoutGrid } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const TagSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => (
  <section id={variant === "frontend" ? "section-07" : "admin-07"} className="space-y-10">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">07. 标签与徽章系统规范 (Tags & Badges)</h2>
    </div>

    <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        {/* 7.1 语义状态 */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.1 语义状态矩阵 (Semantic States)</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Badge className="bg-primary text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-primary/90 transition-all cursor-default">Default / 默认</Badge>
              <p className="text-[8px] text-center font-mono opacity-40">PRIMARY</p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-blue-500 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all cursor-default">Info / 提示</Badge>
              <p className="text-[8px] text-center font-mono opacity-40">BLUE_500</p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-orange-500 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-orange-600 transition-all cursor-default">Warning / 警告</Badge>
              <p className="text-[8px] text-center font-mono opacity-40">ORANGE_500</p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-green-600 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-green-700 transition-all cursor-default">Safety / 安全</Badge>
              <p className="text-[8px] text-center font-mono opacity-40">GREEN_600</p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-muted-foreground text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-foreground transition-all cursor-default">Neutral / 中性</Badge>
              <p className="text-[8px] text-center font-mono opacity-40">GRAY_600</p>
            </div>
          </div>
        </div>

        {/* 7.2 物理尺寸 */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Maximize className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.2 物理尺寸阶梯 (Badge Sizes)</span>
          </div>
          <div className="flex items-end gap-8">
             <div className="space-y-2">
               <Badge className="h-5 px-2 text-[8px] font-bold uppercase border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all cursor-default">Small Badge</Badge>
               <p className="text-[8px] text-center font-mono opacity-40">SM / 20px</p>
             </div>
             <div className="space-y-2">
               <Badge className="h-6 px-3 text-[10px] font-bold uppercase border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all cursor-default">Standard Base</Badge>
               <p className="text-[8px] text-center font-mono opacity-40">BASE / 24px</p>
             </div>
             <div className="space-y-2">
               <Badge className="h-8 px-4 text-xs font-bold uppercase border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all cursor-default">Large Tag</Badge>
               <p className="text-[8px] text-center font-mono opacity-40">LG / 32px</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-16 border-t border-dashed">
        {/* 7.3 可移除标签 */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <XCircle className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.3 可移除交互标签 (Removable Tags)</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="group flex items-center gap-2 bg-muted/40 hover:bg-muted/60 pl-3 pr-1.5 py-1 rounded-lg border border-border/40 transition-colors cursor-default">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Project</span>
              <button className="h-5 w-5 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="group flex items-center gap-2 bg-muted/40 hover:bg-muted/60 pl-3 pr-1.5 py-1 rounded-lg border border-border/40 transition-colors cursor-default">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Core HW v2.4</span>
              <button className="h-5 w-5 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground italic uppercase">常用用于过滤条件选择、工程参数追加及多选结果展示。</p>
        </div>
        {/* 7.4 标签云演示 */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.4 标签云排版 (Tag Cloud)</span>
          </div>
          <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-border/60">
             <div className="flex flex-wrap gap-2">
                {['Industrial', 'Smart Retail', '4K UHD', 'Intel Core i9', 'Global Logistics', 'IP65 Rated', '24/7 Service', 'Touch Panel'].map(tag => (
                  <Badge key={tag} variant="outline" className="bg-white text-[9px] uppercase font-bold tracking-tighter h-6 border-border/60">{tag}</Badge>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));
TagSpecification.displayName = "TagSpecification";
