
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Sparkles, 
  Cpu, 
  ShoppingBag, 
  Building2, 
  Check, 
  Search, 
  ChevronRight, 
  AppWindow, 
  ArrowRight,
  Monitor,
  LayoutGrid,
  MapPin,
  ClipboardList,
  Star,
  Zap,
  Globe,
  Trash2,
  Edit2,
  MoreHorizontal,
  Info,
  AlertCircle,
  Clock,
  ExternalLink,
  Menu,
  X,
  User,
  ShieldCheck,
  Package,
  Layers,
  FileText,
  Factory,
  ChevronDown,
  Plus,
  ArrowUpRight,
  Image as ImageIcon,
  BarChart3,
  Gauge,
  Activity,
  Terminal,
  Wand2,
  Hammer,
  ListChecks,
  Maximize2,
  Minimize2,
  Type,
  Square,
  Circle,
  Minus
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// AI 极光渐变定义组件
const AiGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="ai-aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#06B6D4" offset="0%">
          <animate attributeName="stop-color" values="#06B6D4;#4F46E5;#06B6D4" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#4F46E5" offset="33%">
          <animate attributeName="stop-color" values="#4F46E5;#D946EF;#4F46E5" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#D946EF" offset="66%">
          <animate attributeName="stop-color" values="#D946EF;#F43F5E;#D946EF" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#F43F5E" offset="100%">
          <animate attributeName="stop-color" values="#F43F5E;#06B6D4;#F43F5E" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
  </svg>
);

export default function DesignSystemPage() {
  const [activeSystem, setActiveSystem] = useState('frontend');

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-40">
      <AiGradientDef />
      
      {/* 系统切换主导航 */}
      <header className="bg-white border-b border-border/40 sticky top-0 z-[110] px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest">Heovose 设计实验室</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">视觉沙盒 • 核心版本 v1.5.0</p>
          </div>
        </div>

        <div className="flex bg-muted/40 p-1 rounded-full border border-border/20">
          <button 
            onClick={() => setActiveSystem('frontend')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSystem === 'frontend' ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-primary"
            )}
          >
            前台系统 (用户端)
          </button>
          <button 
            onClick={() => setActiveSystem('backend')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSystem === 'backend' ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-primary"
            )}
          >
            管理后台 (管理员)
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 pt-12">
        
        {activeSystem === 'frontend' ? (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 00. 核心色彩模组定义 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">00. 核心色彩模组定义 (Color Palette)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* 批发业务色彩栈 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">批发业务：品牌蓝主题栈</span>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      {/* 主色 */}
                      <div className="space-y-3">
                        <div className="h-24 w-full rounded-2xl bg-primary shadow-lg border border-primary/20" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-primary">主色 (Primary)</p>
                          <p className="text-[9px] font-mono text-muted-foreground">#005B99</p>
                          <p className="text-[8px] text-muted-foreground opacity-60">品牌身份 / 交互重心</p>
                        </div>
                      </div>
                      {/* 辅助色 */}
                      <div className="space-y-3">
                        <div className="h-24 w-full rounded-2xl bg-accent shadow-lg border border-accent/20" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-primary">辅助色 (Accent)</p>
                          <p className="text-[9px] font-mono text-muted-foreground">#FCDC00</p>
                          <p className="text-[8px] text-muted-foreground opacity-60">强调反馈 / 视觉点睛</p>
                        </div>
                      </div>
                      {/* 中性色 */}
                      <div className="space-y-3">
                        <div className="h-24 w-full rounded-2xl bg-secondary shadow-lg border border-secondary/20" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-primary">中性色 (Neutral)</p>
                          <p className="text-[9px] font-mono text-muted-foreground">#3C434A</p>
                          <p className="text-[8px] text-muted-foreground opacity-60">次级文本 / 容器边框</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 项目业务色彩栈 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-[#F97316]" />
                    <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-[0.2em]">项目业务：工业橙主题栈</span>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      {/* 主色 */}
                      <div className="space-y-3">
                        <div className="h-24 w-full rounded-2xl bg-[#F97316] shadow-lg border-orange-500/20" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-[#F97316]">主色 (Primary)</p>
                          <p className="text-[9px] font-mono text-muted-foreground">#F97316</p>
                          <p className="text-[8px] text-muted-foreground opacity-60">业务核心 / 工业活力</p>
                        </div>
                      </div>
                      {/* 辅助色 */}
                      <div className="space-y-3">
                        <div className="h-24 w-full rounded-2xl bg-[#101820] shadow-lg border-black/20" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-[#101820]">辅助色 (Accent)</p>
                          <p className="text-[9px] font-mono text-muted-foreground">#101820</p>
                          <p className="text-[8px] text-muted-foreground opacity-60">品质压重 / 技术质感</p>
                        </div>
                      </div>
                      {/* 中性色 */}
                      <div className="space-y-3">
                        <div className="h-24 w-full rounded-2xl bg-muted shadow-lg border-border/40" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">中性色 (Neutral)</p>
                          <p className="text-[9px] font-mono text-muted-foreground">#E5E7EB</p>
                          <p className="text-[8px] text-muted-foreground opacity-60">背景基底 / 弱关联区</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 01. 字体系统规范定义 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">01. 字体系统规范定义 (Typography Definition)</h2>
              </div>

              <div className="bg-white p-12 rounded-[2.5rem] border border-border/40 shadow-sm space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">品牌标题字体 (Display)</span>
                    <div className="p-6 rounded-2xl bg-muted/20 border border-dashed">
                      <p className="text-4xl font-headline font-bold text-primary">Space Grotesk</p>
                      <p className="text-[10px] mt-2 text-muted-foreground font-medium">H1-H3 级标题。具有工业几何感。</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">全站正文字体 (Sans-serif)</span>
                    <div className="p-6 rounded-2xl bg-muted/20 border border-dashed">
                      <p className="text-4xl font-body font-bold text-primary">Inter</p>
                      <p className="text-[10px] mt-2 text-muted-foreground font-medium">全站通用，确保高可读性。</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">辅助技术字体 (Monospace)</span>
                    <div className="p-6 rounded-2xl bg-muted/20 border border-dashed">
                      <p className="text-4xl font-mono font-bold text-primary">JetBrains Mono</p>
                      <p className="text-[10px] mt-2 text-muted-foreground font-medium">用于规格、SKU 及数值对齐。</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 hover:bg-muted/10 transition-all border-b border-border/40 last:border-0">
                    <div className="lg:col-span-3 flex flex-col text-left">
                      <span className="text-[10px] font-bold text-primary uppercase">主标题 (Main Hero)</span>
                      <span className="text-[9px] text-muted-foreground font-mono mt-1">Size: 96px / Leading: 0.85</span>
                    </div>
                    <div className="lg:col-span-9 text-left">
                      <h1 className="text-6xl md:text-8xl font-headline font-bold text-primary leading-[0.85] tracking-tighter uppercase">HEOVOSE ELEVATE</h1>
                    </div>
                  </div>
                  <div className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 hover:bg-muted/10 transition-all border-b border-border/40">
                    <div className="lg:col-span-3 flex flex-col text-left">
                      <span className="text-[10px] font-bold text-primary uppercase">辅助/标签 (Caption)</span>
                      <span className="text-[9px] text-muted-foreground font-mono mt-1">Size: 10px / Tracking: widest</span>
                    </div>
                    <div className="lg:col-span-9 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">TECHNICAL SPECIFICATIONS HUB</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02. 边框与圆角规范定义 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. 边框与圆角规范定义 (Border & Radius)</h2>
              </div>

              <div className="bg-white p-12 rounded-[2.5rem] border border-border/40 shadow-sm space-y-20">
                {/* 边框粗细 */}
                <div className="space-y-10">
                   <div className="flex items-center gap-3">
                     <Minus className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">边框粗细与线型规格</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <p className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-2">实线风格 (Solid)</p>
                        <div className="space-y-4">
                           <div className="flex items-center gap-6">
                              <div className="h-14 w-32 bg-muted/10 border border-primary rounded-xl flex items-center justify-center"><span className="text-[9px] font-mono font-bold">1px (border)</span></div>
                              <p className="text-[10px] text-muted-foreground">基础分割与装饰。</p>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="h-14 w-32 bg-muted/10 border-2 border-primary rounded-xl flex items-center justify-center"><span className="text-[9px] font-mono font-bold">2px (border-2)</span></div>
                              <p className="text-[10px] text-muted-foreground">交互激活态标识。</p>
                           </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <p className="text-[9px] font-bold opacity-40 uppercase flex items-center gap-2">虚线风格 (Dashed)</p>
                        <div className="space-y-4">
                           <div className="flex items-center gap-6">
                              <div className="h-14 w-32 bg-muted/5 border border-dashed border-primary/40 rounded-xl flex items-center justify-center"><span className="text-[9px] font-mono font-bold">Dashed 1px</span></div>
                              <p className="text-[10px] text-muted-foreground">空位占位与引导。</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* 圆角阶梯 */}
                <div className="space-y-10 border-t pt-16">
                   <div className="flex items-center gap-3">
                     <Circle className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">圆角阶梯规范 (Radius Scale)</span>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="space-y-4 text-center">
                         <div className="aspect-square bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center"><span className="text-xs font-bold font-mono">8px</span></div>
                         <p className="text-[10px] font-bold uppercase">组件级 (lg)</p>
                      </div>
                      <div className="space-y-4 text-center">
                         <div className="aspect-square bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center"><span className="text-xs font-bold font-mono">16px</span></div>
                         <p className="text-[10px] font-bold uppercase">中容器 (2xl)</p>
                      </div>
                      <div className="space-y-4 text-center">
                         <div className="aspect-square bg-primary/10 rounded-[2.5rem] border border-primary/20 flex items-center justify-center"><span className="text-xs font-bold font-mono">40px</span></div>
                         <p className="text-[10px] font-bold uppercase">品牌级 (3rem)</p>
                      </div>
                      <div className="space-y-4 text-center">
                         <div className="aspect-square bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center"><span className="text-xs font-bold font-mono">FULL</span></div>
                         <p className="text-[10px] font-bold uppercase">圆形 (full)</p>
                      </div>
                   </div>
                </div>

                {/* 阴影与投影补全 */}
                <div className="space-y-10 border-t pt-16">
                   <div className="flex items-center gap-3">
                     <Layers className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">阴影与投影体系 (Shadow Hierarchy)</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="space-y-4">
                         <div className="h-32 bg-white rounded-2xl shadow-sm border border-border/20 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">shadow-sm</span>
                         </div>
                         <p className="text-[9px] text-muted-foreground text-center">用于徽章、轻量组件。</p>
                      </div>
                      <div className="space-y-4">
                         <div className="h-32 bg-white rounded-2xl shadow-md border border-border/20 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">shadow-md</span>
                         </div>
                         <p className="text-[9px] text-muted-foreground text-center">用于常规卡片、二级容器。</p>
                      </div>
                      <div className="space-y-4">
                         <div className="h-32 bg-white rounded-2xl shadow-xl border border-border/20 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">shadow-xl</span>
                         </div>
                         <p className="text-[9px] text-muted-foreground text-center">用于产品展示、激活悬停。</p>
                      </div>
                      <div className="space-y-4">
                         <div className="h-32 bg-white rounded-2xl shadow-2xl border border-border/20 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">shadow-2xl</span>
                         </div>
                         <p className="text-[9px] text-muted-foreground text-center">用于导航栏、Hero 浮动层。</p>
                      </div>
                   </div>
                </div>
              </div>
            </section>
            
            {/* 03. 品牌双色视觉应用 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. 品牌双色视觉应用 (Dual-Theme Identity)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <div className="space-y-6">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">品牌蓝 (Wholesale Blue)</span>
                  <div className="p-8 rounded-[3rem] bg-primary text-white space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                    <ShoppingBag className="h-10 w-10 text-accent" />
                    <h4 className="text-2xl font-bold font-headline uppercase">标准化批发生产</h4>
                    <p className="text-sm opacity-70 leading-relaxed">传达工业生产的稳定性、可靠性。适用于 AIO、迷你电脑等标准硬件线。</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-[0.2em]">工业橙 (Project Orange)</span>
                  <div className="p-8 rounded-[3rem] bg-[#F97316] text-white space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                    <Building2 className="h-10 w-10 text-white" />
                    <h4 className="text-2xl font-bold font-headline uppercase">项目集成方案</h4>
                    <p className="text-sm opacity-70 leading-relaxed">强调定制化服务的张力。适用于零售、工业显示等项目线。</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 04. 双色控件与交互行为 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. 双色控件与交互行为 (Themes & Controls)</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="text-[9px] font-bold opacity-40 uppercase text-left">批发线按钮</p>
                    <div className="flex flex-wrap gap-4"><Button className="h-12 px-8 rounded-xl font-bold bg-primary">Wholesale Action</Button></div>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[9px] font-bold opacity-40 uppercase text-left">项目线按钮</p>
                    <div className="flex flex-wrap gap-4"><Button className="h-12 px-8 rounded-xl font-bold bg-[#F97316]">Project Action</Button></div>
                  </div>
                </div>
              </div>
            </section>

            {/* 05. 业务核心组件单元 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-accent/20">
                <div className="h-2 w-10 bg-accent rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">05. 业务核心组件单元 (Business Units)</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="group bg-white rounded-[3rem] border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-700 p-10 space-y-4 text-left">
                   <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6"><Monitor className="h-7 w-7" /></div>
                   <h3 className="text-2xl font-headline font-bold text-primary leading-tight">Heovose H24 高性能一体机</h3>
                   <p className="text-sm text-muted-foreground opacity-70 leading-relaxed">模块化集成设计，专为现代办公空间与规模化部署打造。</p>
                   <div className="pt-8 border-t border-dashed flex items-center justify-between"><span className="text-xs font-bold text-primary flex items-center gap-2">查看规格 <ArrowRight className="h-3.5 w-3.5" /></span></div>
                </div>
                <div className="group bg-white rounded-[3rem] border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-700 p-10 space-y-4 text-left">
                   <div className="h-14 w-14 rounded-2xl bg-orange-500/5 flex items-center justify-center text-[#F97316] mb-6"><Zap className="h-7 w-7" /></div>
                   <h3 className="text-2xl font-headline font-bold text-[#F97316] leading-tight">智慧零售数字化终端</h3>
                   <p className="text-sm text-muted-foreground opacity-70 leading-relaxed">赋能全球零售商，提供涵盖自助结账、互动导购的全链路方案。</p>
                   <div className="pt-8 border-t border-dashed flex items-center justify-between"><span className="text-xs font-bold text-[#F97316] flex items-center gap-2">获取方案 <ArrowRight className="h-3.5 w-3.5" /></span></div>
                </div>
              </div>
            </section>

            {/* 06. 交互模式与视觉特效 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">06. 交互模式与视觉特效 (Visual FX)</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 text-left">
                   <div className="space-y-8">
                     <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles className="h-4 w-4 ai-icon-gradient" /> AI 智感流光控件 (AI Aurora)</p>
                     <Button className="ai-btn-glow h-16 px-10 rounded-2xl gap-3 font-bold uppercase tracking-widest text-sm shadow-2xl"><Sparkles className="h-5 w-5 ai-icon-gradient" /> AI 智译内容</Button>
                   </div>
                   <div className="space-y-8">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Globe className="h-4 w-4" /> 玻璃拟态 (Glass-morphism)</p>
                      <div className="h-32 rounded-3xl bg-primary/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center"><span className="text-[10px] font-bold text-primary uppercase tracking-widest">M2: 重磨砂材质</span></div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 后台部分保持原样，遵循白皮书规范 */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary">01. 后台视觉识别与物理参数</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest text-left block">圆角标准</span>
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-center"><span className="text-[10px] font-bold uppercase opacity-40">容器级 (12px)</span></div>
                  <Button className="w-full rounded-lg h-10 text-[10px] font-bold uppercase">组件级 (8px)</Button>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-border/40 space-y-6">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest text-left block">字体逻辑</span>
                  <div className="space-y-1.5 text-left"><Label className="text-[10px] font-bold uppercase text-primary">标签 (10px)</Label><Input readOnly value="内容字号 (12px)" className="h-10 text-xs bg-muted/10" /></div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border/40 px-12 py-3 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-8"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-primary">设计系统核心 v1.5.0</span></div></div>
        <div className="flex items-center gap-6"><p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">仅限开发者预览模式</p></div>
      </footer>
    </div>
  );
}

// 辅助组件：Label
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
