
"use client";

import React from 'react';
import { Eye, Layers, Palette, Wand2, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ReadabilitySpecification = React.memo(() => {
  const bgImage = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"; // A colorful, high-contrast abstract background

  const SolutionCard = ({ title, subtitle, description, children, className }: any) => (
    <div className="space-y-6">
      <div className="relative h-64 rounded-3xl overflow-hidden bg-slate-900 border border-border/20 shadow-xl group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className={cn("absolute inset-0 transition-all duration-500", className)}>
          {children}
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-[12px] font-bold text-primary uppercase tracking-widest">{title}</h4>
        <p className="text-[10px] text-primary/60 font-bold uppercase">{subtitle}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed italic">{description}</p>
      </div>
    </div>
  );

  return (
    <section id="section-17" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">17. 复杂背景文字可读性规范 (Readability)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 relative z-10">
          
          {/* Solution 1: Gradient Scrim */}
          <SolutionCard 
            title="方案 01: 非线性渐变遮罩"
            subtitle="Linear-to-Transparent Scrim"
            description="在背景与文字之间增加一层 40%-60% 透明度的黑色渐变。适用于全屏背景或卡片背景。"
            className="bg-gradient-to-r from-black/60 via-black/20 to-transparent"
          >
            <div className="absolute inset-0 flex items-center px-10">
              <div className="max-w-[200px] space-y-2">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Crystal Clear</h3>
                <p className="text-[10px] text-white/70 uppercase font-bold tracking-widest">Visibility Optimized</p>
              </div>
            </div>
          </SolutionCard>

          {/* Solution 2: Backdrop Blur */}
          <SolutionCard 
            title="方案 02: 局部背景模糊"
            subtitle="Backdrop Blur (Glassmorphism)"
            description="对文字下方区域进行 Gaussian Blur 处理。能有效抹平背景噪点，提供稳定的视觉平面。"
            className="flex items-center justify-center"
          >
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl mx-8 text-center">
              <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Soft Focus</h3>
              <p className="text-[10px] text-white/70 uppercase font-bold tracking-widest mt-1">Noise Reduction Layer</p>
            </div>
          </SolutionCard>

          {/* Solution 3: Mix Blend Mode */}
          <SolutionCard 
            title="方案 03: 混合模式反转"
            subtitle="Mix Blend Mode: Difference"
            description="利用 CSS mix-blend-mode 属性使文字颜色根据背景自动反色。适用于极简极客风格。"
            className="flex items-center justify-center"
          >
            <div className="mix-blend-difference text-center">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">DYNAMIC</h3>
              <p className="text-[10px] text-white uppercase font-bold tracking-[0.4em] mt-2">Auto Contrast</p>
            </div>
          </SolutionCard>

          {/* Solution 4: Diffuse Shadow */}
          <SolutionCard 
            title="方案 04: 弥散投影/光晕"
            subtitle="Soft Diffuse Glow"
            description="给文字增加多层、大半径的柔和投影。在浅色背景下形成微弱轮廓，在深色下无感。"
            className="flex items-center justify-center"
          >
            <div className="text-center">
              <h3 className="text-4xl font-bold text-white uppercase tracking-tight [text-shadow:0_10px_30px_rgba(0,0,0,0.5),0_0_80px_rgba(0,0,0,0.3)]">
                GLOWING
              </h3>
              <p className="text-[10px] text-white/90 uppercase font-bold tracking-widest mt-2 [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
                Contrast Edge
              </p>
            </div>
          </SolutionCard>

          {/* Solution 5: Semi-transparent Overlay */}
          <SolutionCard 
            title="方案 05: 全局/半透层叠加"
            subtitle="Solid Translucent Overlay"
            description="背景图整体覆盖一层 10%-30% 的色层。最简单粗暴但也最能统一全站调性的方案。"
            className="bg-primary/20 backdrop-brightness-75"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-2xl font-bold text-white uppercase tracking-tight">UNIFIED VIBE</h3>
              <div className="h-0.5 w-12 bg-accent mt-3 mb-4 shadow-[0_0_15px_rgba(255,180,0,0.8)]" />
              <p className="text-[10px] text-white/70 uppercase font-bold tracking-widest">Tonal Consistency</p>
            </div>
          </SolutionCard>

          {/* Guidelines Summary */}
          <div className="p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">设计原则 (Principles)</span>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: Eye, text: "对比度必须符合 WCAG 2.1 AA 级标准。" },
                  { icon: Box, text: "优先使用非侵入式遮罩，保留背景呼吸感。" },
                  { icon: Layers, text: "复杂场景建议组合使用方案 1 + 方案 2。" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <item.icon className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    <span className="text-[10px] text-muted-foreground uppercase leading-relaxed font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 border-t border-primary/10">
               <div className="flex items-center gap-2 text-primary">
                 <Wand2 className="h-4 w-4" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Smart Core v2.0 Ready</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

ReadabilitySpecification.displayName = "ReadabilitySpecification";
