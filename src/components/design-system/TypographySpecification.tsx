"use client";

import React from 'react';
import { Type, AlignLeft, Hash } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TypographySpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => (
  <section id={variant === "frontend" ? "section-01" : "admin-01"} className="space-y-10">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">01. 字体系统规范定义 (Typography)</h2>
    </div>

    <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Type className="h-3 w-3" /> 标题字体家族</span>
          <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20">
            <p className="text-4xl font-headline font-bold text-primary">Space Grotesk</p>
            <p className="text-[9px] mt-2 text-muted-foreground">用于 H1-H3 等级。具备工业几何美感与科技穿透力。</p>
          </div>
        </div>
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><AlignLeft className="h-3 w-3" /> 正文字体家族</span>
          <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20">
            <p className="text-4xl font-body font-bold text-primary">Inter</p>
            <p className="text-[9px] mt-2 text-muted-foreground">提供极高阅读清晰度的无衬线体。</p>
          </div>
        </div>
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Hash className="h-3 w-3" /> 技术等宽家族</span>
          <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20">
            <p className="text-3xl font-mono font-bold text-primary">JetBrains Mono</p>
            <p className="text-[9px] mt-2 text-muted-foreground">确保物理参数、SKU 和数值在纵向排版时严丝合缝。</p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em] border-l-2 border-primary pl-4">排版层级阶梯与技术规格模型</h3>
          <Badge variant="outline" className="h-6 text-[8px] font-bold uppercase">Typography hierarchy v3.0</Badge>
        </div>
        <div className="overflow-hidden border border-border/40 rounded-2xl">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-[10px] uppercase">Level / 用途</TableHead>
                <TableHead className="font-bold text-[10px] uppercase">Font Family</TableHead>
                <TableHead className="font-bold text-[10px] uppercase">Size (px)</TableHead>
                <TableHead className="font-bold text-[10px] uppercase">Leading / Tracking</TableHead>
                <TableHead className="font-bold text-[10px] uppercase pl-10">Visual Sample</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="group hover:bg-muted/5">
                <TableCell className="font-bold text-xs">Hero Main / 主标题</TableCell>
                <TableCell className="font-mono text-[10px]">Space Grotesk</TableCell>
                <TableCell className="font-mono text-[10px]">96px</TableCell>
                <TableCell className="font-mono text-[10px]">0.85 / -5%</TableCell>
                <TableCell className="pl-10 py-10">
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold text-primary leading-[0.85] tracking-tighter uppercase">HEOVOSE</h1>
                </TableCell>
              </TableRow>
              <TableRow className="group hover:bg-muted/5">
                <TableCell className="font-bold text-xs">Section Heading / 章节标题</TableCell>
                <TableCell className="font-mono text-[10px]">Space Grotesk</TableCell>
                <TableCell className="font-mono text-[10px]">48px</TableCell>
                <TableCell className="font-mono text-[10px]">1.1 / -2%</TableCell>
                <TableCell className="pl-10 py-6">
                  <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary leading-[1.1] tracking-tight uppercase">Precision Hardware</h2>
                </TableCell>
              </TableRow>
              <TableRow className="group hover:bg-muted/5">
                <TableCell className="font-bold text-xs">Technical Specs / 规格参数</TableCell>
                <TableCell className="font-mono text-[10px]">JetBrains Mono (V)</TableCell>
                <TableCell className="font-mono text-[10px]">14px (V) / 10px (L)</TableCell>
                <TableCell className="font-mono text-[10px]">1.2 / 0%</TableCell>
                <TableCell className="pl-10 py-6">
                  <div className="flex gap-4 max-w-sm">
                    <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-sm flex-1 flex flex-col justify-between h-24">
                      <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block mb-2">Display Panel</span>
                      <span className="font-mono text-[14px] font-medium text-primary block leading-tight">23.8" IPS 1080P</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-sm flex-1 flex flex-col justify-between h-24">
                      <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block mb-2">Main Processor</span>
                      <span className="font-mono text-[14px] font-medium text-primary block leading-tight">Intel i7-12700</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="group hover:bg-muted/5">
                <TableCell className="font-bold text-xs">Body Text / 标准正文</TableCell>
                <TableCell className="font-mono text-[10px]">Inter</TableCell>
                <TableCell className="font-mono text-[10px]">16px</TableCell>
                <TableCell className="font-mono text-[10px]">1.6 / 0%</TableCell>
                <TableCell className="pl-10 py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">Heovose technology defines the future of all-in-one computing with precision engineering.</p>
                </TableCell>
              </TableRow>
              <TableRow className="group hover:bg-muted/5">
                <TableCell className="font-bold text-xs">Supplementary / 技术辅助</TableCell>
                <TableCell className="font-mono text-[10px]">JetBrains Mono</TableCell>
                <TableCell className="font-mono text-[10px]">10px</TableCell>
                <TableCell className="font-mono text-[10px]">1.0 / 10%</TableCell>
                <TableCell className="pl-10 py-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-muted/30 px-2 py-1 rounded">SKU: H24_PRO_SERIES</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </section>
));
TypographySpecification.displayName = "TypographySpecification";
