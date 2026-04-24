"use client";

import React from 'react';
import { LayoutGrid, Zap, ChevronRight as ChevronRightIcon, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const PaginationSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => (
  <section id={variant === "frontend" ? "section-09" : "admin-09"} className="space-y-10 pb-40">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">09. 分页系统规范 (Pagination)</h2>
    </div>

    <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
      <div className="grid grid-cols-1 gap-20">
        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">9.1 标准形态与页数 (Standard & Count)</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 较少页数 */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">较少页数 (Few Pages)</p>
              <div className="flex items-center gap-2 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4 rotate-180" /></Button>
                <div className="flex items-center gap-1">
                  <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-primary/20 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 hover:text-primary">1</Button>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">2</Button>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">3</Button>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">4</Button>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">5</Button>
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4" /></Button>
              </div>
            </div>
            {/* 较多页数 */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">较多页数 (Many Pages & Ellipsis)</p>
              <div className="flex items-center gap-2 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4 rotate-180" /></Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">1</Button>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">2</Button>
                  <div className="h-10 w-8 flex items-center justify-center opacity-40">
                     <MoreHorizontal className="h-4 w-4" />
                  </div>
                  <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-primary/20 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 hover:text-primary">6</Button>
                  <div className="h-10 w-8 flex items-center justify-center opacity-40">
                     <MoreHorizontal className="h-4 w-4" />
                  </div>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">10</Button>
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">9.2 变体与复合功能 (Variants & Features)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 小型分页按钮 */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">小型分页按钮 (Small Size)</p>
              <div className="flex items-center gap-1.5 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-3 w-3 rotate-180" /></Button>
                <Button variant="outline" className="h-7 w-7 p-0 rounded-lg border-primary/20 bg-primary/10 text-primary font-bold shadow-sm text-[10px] hover:bg-primary/20 hover:text-primary">1</Button>
                <Button variant="ghost" className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:bg-primary/5 text-[10px] font-medium">2</Button>
                <Button variant="ghost" className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:bg-primary/5 text-[10px] font-medium">3</Button>
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-3 w-3" /></Button>
              </div>
              <p className="text-[9px] text-muted-foreground italic mt-2 uppercase">适用于卡片内部、侧边栏或空间局促的表格底栏。</p>
            </div>

            {/* 带有跳转功能的分页按钮 */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">复合跳转功能 (Pagination with Jump)</p>
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4 rotate-180" /></Button>
                  <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all text-xs">1</Button>
                  <div className="h-9 w-6 flex items-center justify-center opacity-40">
                     <MoreHorizontal className="h-3 w-3" />
                  </div>
                  <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-primary/20 bg-primary/10 text-primary font-bold shadow-sm text-xs hover:bg-primary/20 hover:text-primary">4</Button>
                  <div className="h-9 w-6 flex items-center justify-center opacity-40">
                     <MoreHorizontal className="h-3 w-3" />
                  </div>
                  <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all text-xs">24</Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2 border-l border-border/60 pl-6">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest whitespace-nowrap">Go to</span>
                  <Input className="h-9 w-12 rounded-lg text-center font-mono text-[11px] p-0 border-border/60" defaultValue="5" />
                  <Button variant="outline" className="h-9 px-3 rounded-lg text-[10px] font-bold uppercase border-border/60 hover:text-primary hover:bg-primary/5 whitespace-nowrap">GO</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));
PaginationSpecification.displayName = "PaginationSpecification";
