"use client";

import React from 'react';
import { 
  Menu, 
  ChevronDown, 
  Search, 
  ArrowRight,
  Monitor,
  Cpu,
  Laptop,
  Zap,
  LayoutGrid,
  Sparkles,
  MousePointer2,
  Globe,
  MessageSquare,
  Download
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from 'next/image';

export const NavbarSpecification = React.memo(() => (
  <section id="section-18" className="space-y-10">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">18. 导航系统与二级菜单规范 (Navigation)</h2>
    </div>

    <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
      {/* 18.1 顶栏基础态 */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Menu className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">18.1 顶栏物理规格与背景态 (Navbar States)</span>
        </div>
        <div className="grid grid-cols-1 gap-8">
          {/* Transparent State */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">Initial State / 初始透明态</p>
            <div className="relative h-20 bg-slate-900 rounded-3xl overflow-hidden flex items-center px-8 border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between w-full">
                  <div className="h-8 w-32 bg-white/20 rounded-lg animate-pulse" />
                  <div className="flex items-center gap-12">
                    <div className="flex gap-8">
                      <div className="h-4 w-16 bg-white/40 rounded-full" />
                      <div className="h-4 w-16 bg-white/40 rounded-full" />
                      <div className="h-4 w-16 bg-white/40 rounded-full" />
                    </div>
                    <div className="h-10 w-32 bg-white/20 rounded-full" />
                  </div>
                </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
            </div>
          </div>
          {/* Active State */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">Active State / 交互激活态 (Glassmorphism)</p>
            <div className="relative h-20 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden flex items-center px-8 border border-white shadow-xl">
                <div className="flex items-center justify-between w-full">
                  <div className="h-8 w-32 bg-primary/10 rounded-lg animate-pulse" />
                  <div className="flex items-center gap-12">
                    <div className="flex gap-8">
                      <div className="h-4 w-16 bg-primary/60 rounded-full" />
                      <div className="h-4 w-16 bg-primary/60 rounded-full" />
                      <div className="h-4 w-16 bg-primary/60 rounded-full" />
                    </div>
                    <div className="h-10 w-32 bg-primary rounded-full" />
                  </div>
                </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-black/5" />
            </div>
          </div>
        </div>
      </div>

      {/* 18.2 二级菜单 (Mega Menu) */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">18.2 二级巨型菜单布局 (Mega Menu Architecture)</span>
        </div>
        
        <div className="bg-slate-50 rounded-[3rem] p-12 border border-border/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10 grid grid-cols-12 gap-12">
            {/* Left: Product Grid */}
            <div className="col-span-8 space-y-8">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <h4 className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Product Categories / 核心产品序列</h4>
                <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:translate-x-1 transition-transform">
                  View All <ArrowRight className="h-3 w-3" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: Monitor, title: "All-in-One PC", desc: "一体机电脑系列，极简办公新体验" },
                  { icon: Laptop, title: "Notebook Series", desc: "轻薄便携笔记本，满足多场景算力需求" },
                  { icon: Cpu, title: "Mini PC Console", desc: "微型主机，强悍性能隐藏于方寸之间" },
                  { icon: Zap, title: "Electromechanical", desc: "精密机电组件，工业级稳定性保障" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 group cursor-pointer">
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary group-hover:text-primary transition-colors">{item.title}</span>
                        <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-40 -rotate-90 transition-all" />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Featured Promotion */}
            <div className="col-span-4">
              <div className="bg-transparent rounded-[2rem] p-8 border border-black/[0.02] space-y-6 group/card relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-6">
                  <div className="aspect-[4/3] rounded-2xl bg-slate-200/50 overflow-hidden relative border border-black/[0.03]">
                     <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <Monitor className="h-12 w-12" />
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5" />
                  </div>
                  <div className="pt-2">
                    <button className="w-full h-11 rounded-2xl bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 group/download">
                       <Download className="h-3.5 w-3.5 opacity-40 group-hover/download:opacity-100 transition-opacity" /> 立即下载手册
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 18.5 导航底层材质规范 */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">18.5 导航底层材质规范 (Material System)</span>
        </div>
        <div className="p-10 rounded-[2.5rem] bg-slate-100 border border-border/20 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="glass-frosted p-10 rounded-3xl border-white/40 shadow-2xl space-y-6">
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Level 02: Frosted</span>
                 </div>
                 <h4 className="text-sm font-bold text-primary">标准导航毛玻璃材质</h4>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter">
                       <span className="text-muted-foreground">Blur Radius</span>
                       <span className="font-bold text-primary">12px (Medium)</span>
                    </div>
                    <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[30%]" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter">
                       <span className="text-muted-foreground">Surface Opacity</span>
                       <span className="font-bold text-primary">60%</span>
                    </div>
                    <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[60%]" />
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                 <p className="text-[11px] text-muted-foreground leading-relaxed uppercase">
                    顶栏在滚动激活后必须应用 **Level 02: Frosted** 材质。该材质通过 12px 的高斯模糊与 60% 的白色半透明叠层，确保在复杂背景（如 Hero 视频或大图）上依然保持极佳的文字可读性，同时维持物理世界的通透感。
                 </p>
                 <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-white/50 border border-white/20 text-[9px] font-bold text-primary uppercase">Alpha: 0.6</div>
                    <div className="px-4 py-2 rounded-lg bg-white/50 border border-white/20 text-[9px] font-bold text-primary uppercase">Blur: 12px</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 18.3 交互逻辑与动效 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <MousePointer2 className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">18.3 交互响应规范 (Interactions)</span>
          </div>
          <div className="space-y-6">
             <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20 space-y-4">
                <div className="flex items-center gap-4">
                   <div className="h-3 w-3 rounded-full bg-primary animate-ping" />
                   <span className="text-[11px] font-bold text-primary">Hover Intent / 意图识别</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                   二级菜单触发采用 300ms 的防抖延迟，确保用户在快速移动鼠标时不会频繁触发菜单开闭，增强体验的顺滑感。
                </p>
             </div>
             <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20 space-y-4">
                <div className="flex items-center gap-4">
                   <div className="h-3 w-3 rounded-full bg-accent" />
                   <span className="text-[11px] font-bold text-primary">Visual Continuity / 视觉连贯性</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                   菜单弹出采用 Fade + Scale + Slide 的复合动效，持续时间 500ms，曲线采用 cubic-bezier(0.23, 1, 0.32, 1)。
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">18.4 辅助功能区域 (Utilities)</span>
          </div>
          <div className="flex items-center gap-10">
             <div className="space-y-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Language Toggle</p>
                <div className="h-10 px-6 rounded-full bg-white border border-border/40 shadow-sm flex items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors">
                   <Globe className="h-3.5 w-3.5 text-primary/40" />
                   <span className="text-[10px] font-bold text-primary uppercase">EN / ZH</span>
                   <ChevronDown className="h-3 w-3 text-primary/20" />
                </div>
             </div>
             <div className="space-y-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Quick Contact</p>
                <div className="h-10 px-6 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all">
                   <MessageSquare className="h-3.5 w-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Contact Us</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));

NavbarSpecification.displayName = "NavbarSpecification";
