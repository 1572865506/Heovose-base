
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
  ListChecks
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
            <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">视觉沙盒 • 核心版本 v1.4.2</p>
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
            
            {/* 01. 品牌基础体系 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">01. 前台视觉识别 (Frontend)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* 业务线配色标准 */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">业务线视觉对比</span>
                     <Badge variant="outline" className="text-[8px] uppercase">强调色规范</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2.5rem] bg-primary text-white space-y-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <ShoppingBag className="h-6 w-6 text-accent" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold font-headline uppercase tracking-tight">批发业务线</h4>
                        <p className="text-xs opacity-60 leading-relaxed font-medium">品牌深海蓝。专注于大规模生产的稳定性与可靠性。</p>
                      </div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-[#F97316] text-white space-y-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold font-headline uppercase tracking-tight">项目解决方案</h4>
                        <p className="text-xs opacity-60 leading-relaxed font-medium">工业活力橙。专注于创新集成与定制化行业方案。</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 前台排版与圆角 */}
                <div className="space-y-6">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">字体排版层级</span>
                  <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-4xl font-headline font-bold text-primary leading-tight">Heovose 品牌建筑美学</h3>
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed">通过审美工程与精密制造，重新定义高端工业计算体验。</p>
                     </div>
                     <div className="pt-8 border-t border-dashed flex gap-4">
                        <div className="h-16 w-16 rounded-[2rem] bg-muted/20 border border-border/40 flex items-center justify-center">
                           <span className="text-[10px] font-bold opacity-30 uppercase">R:2.0</span>
                        </div>
                        <div className="h-16 w-16 rounded-[2.5rem] bg-primary/5 border border-primary/20 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-primary uppercase">R:2.5</span>
                        </div>
                        <div className="h-16 w-16 rounded-[3rem] bg-primary text-white flex items-center justify-center shadow-lg">
                           <span className="text-[10px] font-bold uppercase">R:3.0</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02. 前台输入与按钮控件 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. 控件与交互行为</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  {/* 按钮矩阵 */}
                  <div className="space-y-8">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">按钮变体 (Buttons)</span>
                    <div className="flex flex-wrap gap-6 items-end">
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase">英雄屏主操作</p>
                        <Button className="h-16 px-10 rounded-2xl text-base font-bold shadow-xl">立即探索</Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase">次级按钮</p>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl text-sm font-bold">了解更多</Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase">轻量化交互</p>
                        <Button variant="ghost" className="h-10 px-4 text-xs font-bold gap-2">查看案例 <ArrowRight className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>

                  {/* 表单输入 */}
                  <div className="space-y-8">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">前台场景化输入</span>
                    <div className="space-y-6 max-w-sm">
                      <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40 group-focus-within:text-primary transition-all" />
                        <Input placeholder="搜索产品或技术文档..." className="h-14 pl-14 rounded-2xl bg-muted/20 border-none shadow-inner text-sm font-medium focus-visible:ring-primary/20" readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest ml-2 opacity-60">专家技术咨询</label>
                        <Textarea placeholder="请描述您的硬件规格需求或应用场景..." className="min-h-[120px] rounded-2xl p-6 bg-muted/20 border-none shadow-inner resize-none" readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  {/* 选择器与下拉菜单 */}
                  <div className="space-y-8">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">导航与菜单 (Menus)</span>
                    <div className="flex gap-6 items-center">
                      <Select defaultValue="en">
                        <SelectTrigger className="w-[180px] h-12 rounded-xl bg-white border-border/40 shadow-sm font-bold uppercase text-[10px] tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="en">English (全球站)</SelectItem>
                          <SelectItem value="zh">简体中文 (中国站)</SelectItem>
                        </SelectContent>
                      </Select>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-12 rounded-xl bg-muted/30 border border-border/20 font-bold uppercase text-[10px] tracking-widest gap-2">
                            快捷导航 <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-border/40 bg-white/95 backdrop-blur-xl">
                          <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">服务支持中心</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">全球物流追踪</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-primary font-bold">获取即时报价</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* 选项卡 */}
                  <div className="space-y-8">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">内容筛选器 (Tabs)</span>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="bg-transparent h-auto p-0 border-b border-border/40 w-full justify-start gap-10 rounded-none mb-6">
                        <TabsTrigger value="overview" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">核心概览</TabsTrigger>
                        <TabsTrigger value="specs" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">技术规格</TabsTrigger>
                        <TabsTrigger value="manual" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all opacity-40">用户手册</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            </section>

            {/* 03. 前台业务核心组件 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-accent/20">
                <div className="h-2 w-10 bg-accent rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. 业务核心组件单元</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* 产品卡片标准 */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">业务卡片标准 (Standard)</span>
                     <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div className="h-2 w-2 rounded-full bg-[#F97316]" />
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* 批发卡片 */}
                     <div className="group bg-white rounded-[2.5rem] border border-border/40 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 shadow-sm flex flex-col">
                        <div className="relative aspect-[4/3] bg-muted/20 flex items-center justify-center">
                           <Monitor className="h-20 w-20 text-primary/10" />
                           <div className="absolute top-4 left-4"><Badge className="bg-primary text-white text-[9px] uppercase tracking-widest font-bold">AIO 一体机系列</Badge></div>
                        </div>
                        <div className="p-8 space-y-4">
                           <h3 className="text-xl font-headline font-bold text-primary group-hover:text-accent transition-colors leading-tight">Heovose H24 高端版</h3>
                           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-60">集成高性能准系统的全能办公桌面方案，专为现代商务环境定制。</p>
                           <div className="pt-6 border-t border-dashed flex items-center justify-between">
                              <span className="text-xs font-bold text-primary flex items-center gap-2 cursor-pointer">查看详情 <ArrowRight className="h-3.5 w-3.5" /></span>
                              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><ShoppingBag className="h-4 w-4" /></div>
                           </div>
                        </div>
                     </div>
                     {/* 项目卡片 */}
                     <div className="group bg-white rounded-[2.5rem] border border-border/40 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 shadow-sm flex flex-col border-b-[#F97316]/40">
                        <div className="relative aspect-[4/3] bg-muted/20 flex items-center justify-center">
                           <Zap className="h-20 w-20 text-[#F97316]/10" />
                           <div className="absolute top-4 left-4"><Badge className="bg-[#F97316] text-white text-[9px] uppercase tracking-widest font-bold">项目定制方案</Badge></div>
                        </div>
                        <div className="p-8 space-y-4">
                           <h3 className="text-xl font-headline font-bold text-[#F97316] group-hover:text-primary transition-colors leading-tight">智慧零售自助终端 V2</h3>
                           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-60">为全球零售商设计的无缝支付与交互系统，支持深度模块化定制。</p>
                           <div className="pt-6 border-t border-dashed flex items-center justify-between">
                              <span className="text-xs font-bold text-[#F97316] flex items-center gap-2 cursor-pointer">立即咨询 <ArrowRight className="h-3.5 w-3.5" /></span>
                              <div className="h-8 w-8 rounded-full bg-[#F97316]/5 flex items-center justify-center text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white transition-all"><Building2 className="h-4 w-4" /></div>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>

                {/* 辅助业务模块单元 */}
                <div className="space-y-8">
                   {/* Bento单元预览 */}
                   <div className="space-y-4">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Bento 宫格基础单元</span>
                      <div className="group relative h-48 rounded-[2rem] overflow-hidden border border-border/40 bg-primary shadow-xl cursor-pointer">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                         <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
                            <span className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] mb-1">工业级</span>
                            <h4 className="text-white font-headline font-bold text-lg">工控小主机</h4>
                         </div>
                         <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100 transition-all duration-500">
                           <ArrowRight className="h-4 w-4" />
                         </div>
                      </div>
                   </div>

                   {/* 制造流程预览 */}
                   <div className="space-y-4">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">生产环节步骤单元</span>
                      <div className="flex items-center gap-6 p-4 bg-white rounded-3xl border shadow-sm">
                         <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-white font-headline font-bold text-xl shadow-lg">08</div>
                         <div className="space-y-1 flex-1">
                            <h4 className="text-sm font-bold text-primary">生产制造</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">精密组装工艺</p>
                         </div>
                         <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/40"><ClipboardList className="h-4 w-4" /></div>
                      </div>
                   </div>

                   {/* 案例标签预览 */}
                   <div className="space-y-4">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">成功案例展示标签</span>
                      <div className="group relative rounded-2xl overflow-hidden aspect-video border shadow-lg cursor-pointer">
                         <div className="absolute inset-0 bg-primary/10 transition-colors group-hover:bg-primary/20" />
                         <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                            <div className="space-y-1">
                               <Badge className="bg-accent text-accent-foreground text-[9px] font-bold tracking-widest border-none">零售行业</Badge>
                               <h5 className="text-white font-bold text-sm">数字化门店转型案例</h5>
                            </div>
                            <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-lg"><ArrowRight className="h-3 w-3" /></div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 04. 前台交互与特效 (UI Patterns) */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. 交互模式与视觉特效</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                   {/* AI 核心交互 */}
                   <div className="space-y-8">
                     <div className="space-y-2">
                       <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                         <Sparkles className="h-4 w-4 ai-icon-gradient" /> AI 智感资产交互按钮
                       </p>
                       <p className="text-xs text-muted-foreground leading-relaxed">前台 AI 按钮采用 16px 圆角及高重力投影，通过流光特效在标准控件中产生视觉聚焦。</p>
                     </div>
                     <div className="flex flex-wrap gap-8 items-center">
                        <Button className="ai-btn-glow h-16 px-10 rounded-2xl gap-3 font-bold uppercase tracking-widest text-sm shadow-2xl">
                           <Sparkles className="h-5 w-5 ai-icon-gradient" /> AI 智译本页 (完整流)
                        </Button>
                        <div className="h-12 w-12 rounded-full ai-btn-glow flex items-center justify-center cursor-pointer shadow-lg">
                           <Sparkles className="h-5 w-5 ai-icon-gradient" />
                        </div>
                     </div>
                   </div>

                   {/* 材质规范 */}
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                          <Globe className="h-4 w-4" /> 玻璃拟态材质规范 (Glass)
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">适用于英雄屏、导航栏及悬浮面板的背景模糊度标准。</p>
                      </div>
                      <div className="flex gap-6">
                         <div className="flex-1 h-32 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">M1: 轻量透明</span>
                         </div>
                         <div className="flex-1 h-32 rounded-3xl bg-primary/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">M2: 重质磨砂</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 05. 前台全局元素 */}
            <section className="space-y-12">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                  <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                  <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">05. 全局布局组件</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* 数据统计组件 */}
                  <div className="space-y-6">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">信任指标 (数据统计)</span>
                     <div className="bg-primary p-12 rounded-[3rem] text-white flex flex-col items-center text-center space-y-4 shadow-xl">
                        <div className="p-4 bg-white/10 rounded-2xl">
                          <Factory className="h-8 w-8 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-6xl font-headline font-bold block">3</span>
                          <span className="text-xl font-medium opacity-90 block uppercase">全球制造工厂</span>
                        </div>
                     </div>
                  </div>
                  {/* 版权与页脚元数据 */}
                  <div className="space-y-6">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">元数据与法律声明</span>
                     <div className="bg-white p-12 rounded-[3rem] border shadow-sm space-y-8">
                        <div className="space-y-4">
                           <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center text-primary/40"><ShieldCheck className="h-5 w-5" /></div>
                              <div className="space-y-1">
                                 <p className="text-xs font-bold text-primary uppercase tracking-tight">可靠性服务协议</p>
                                 <p className="text-[10px] text-muted-foreground leading-relaxed">为高端硬件部署提供系统化的质量保证与合规说明。</p>
                              </div>
                           </div>
                        </div>
                        <div className="pt-8 border-t border-dashed flex justify-between items-center opacity-40 text-[9px] uppercase tracking-[0.2em] font-bold">
                           <p>© 2024 Heovose 科技</p>
                           <div className="flex gap-6"><span>隐私政策</span><span>服务条款</span></div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          </div>
        ) : (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 01. 后台规范 (依据 Manifest) */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary">01. 后台视觉识别与物理参数</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1.1 圆角标准测试 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.1 圆角阶梯标准</span>
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">容器级 (16px)</span>
                      <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">内嵌级 (12px)</span>
                         <Button className="mt-4 w-full rounded-lg h-10 text-[10px] font-bold uppercase tracking-wider">
                           组件级 (8px)
                         </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.3 字体标准测试 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.3 字体逻辑标准</span>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 space-y-6">
                    <div className="space-y-1.5 border-b pb-4">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <AppWindow className="h-4 w-4" /> 板块标题样式
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">遵循白皮书 1.2 层级定义</p>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase tracking-wider">表单标签字号 (10px)</Label>
                         <Input placeholder="表单内容与占位符强制对齐" value="标准内容字号 (12px)" readOnly className="h-10 text-xs" />
                       </div>
                       <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-[9px] text-primary leading-relaxed italic font-medium">
                            白皮书准则：后台表单内容与占位符强制对齐，统一使用 12px (text-xs)。
                          </p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* 1.4 状态反馈测试 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.4 边框与物理状态</span>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 space-y-6">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase opacity-40">基础态背景</Label>
                        <div className="h-10 bg-muted/20 border border-border/60 rounded-lg" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-primary">激活/聚焦状态</Label>
                        <div className="h-10 bg-muted/10 border-primary/50 ring-4 ring-primary/5 rounded-lg flex items-center px-3">
                           <div className="h-1 w-4 bg-primary rounded-full animate-pulse" />
                        </div>
                     </div>
                     <div className="pt-4 border-t border-dashed">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600" />
                           </div>
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">合规性验证通过</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02. 后台基础控件矩阵 */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary">02. 基础控件矩阵</h2>
              </div>
              <div className="bg-white p-10 rounded-2xl border border-border/40 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* 按钮 */}
                  <div className="space-y-6">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">按钮尺寸与变体</span>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold opacity-30 uppercase">大号 (h-11)</p>
                        <Button size="lg" className="rounded-xl px-8 font-bold uppercase tracking-widest text-[10px]">保存全局配置</Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold opacity-30 uppercase">标准 (h-10)</p>
                        <Button className="rounded-lg px-5 font-bold uppercase text-[10px] gap-2"><Plus className="h-3.5 w-3.5" /> 新增条目</Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold opacity-30 uppercase">小号 (h-9)</p>
                        <Button size="sm" variant="outline" className="rounded-lg px-4 text-[10px] font-bold">放弃修改</Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold opacity-30 uppercase">图标按钮 (h-8)</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Edit2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="destructive" className="h-10 rounded-lg text-[10px] font-bold uppercase tracking-wider px-6">永久删除</Button>
                      <Button variant="secondary" className="h-10 rounded-lg text-[10px] font-bold uppercase tracking-wider px-6">重置表单</Button>
                    </div>
                  </div>

                  {/* 表单输入 */}
                  <div className="space-y-6">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">输入框与文本域规范</span>
                    <div className="space-y-4 max-w-sm">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-primary">标准输入字段</Label>
                        <Input placeholder="输入唯一标识 ID..." className="h-10 bg-muted/20" readOnly />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase opacity-40">禁用/锁定状态</Label>
                        <Input disabled value="PROTECTED_VALUE_001" className="h-10 font-mono opacity-50" readOnly />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-destructive">错误校验反馈</Label>
                        <Input value="包含非法空格字符" className="h-10 border-destructive bg-destructive/5 text-destructive" readOnly />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-primary">文档正文编辑 (Markdown)</Label>
                        <Textarea placeholder="在此输入详细的说明文字..." className="min-h-[100px] text-xs bg-muted/10 font-medium" readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 border-t pt-10">
                  {/* 选择器与菜单 */}
                  <div className="space-y-6">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">选择器与弹出面板</span>
                    <div className="flex gap-4 items-center">
                      <div className="space-y-1.5 flex-1">
                        <Label className="text-[10px] font-bold uppercase opacity-40">系统角色分配</Label>
                        <Select defaultValue="editor">
                          <SelectTrigger className="h-10 rounded-lg bg-muted/20 border-transparent text-xs font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="superadmin" className="text-xs font-bold text-orange-600">超级管理员</SelectItem>
                            <SelectItem value="editor" className="text-xs">内容编辑员</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <Label className="text-[10px] font-bold uppercase opacity-40">快速管理操作</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-10 rounded-lg text-xs font-bold justify-between px-3">
                              管理选项 <MoreHorizontal className="h-3.5 w-3.5 opacity-40" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 rounded-xl p-1.5 shadow-xl border-border/40">
                            <DropdownMenuLabel className="text-[9px] uppercase tracking-widest opacity-40">管理工具集</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-lg text-xs gap-2 py-2"><Edit2 className="h-3 w-3" /> 快速编辑</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg text-xs gap-2 py-2"><ArrowUpRight className="h-3 w-3" /> 查看前台预览</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg text-xs text-destructive gap-2 py-2"><Trash2 className="h-3 w-3" /> 归档此行数据</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* 后台选项卡 */}
                  <div className="space-y-6">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">功能模块切换 (Tabs)</span>
                    <Tabs defaultValue="visual" className="w-full">
                      <TabsList className="bg-muted/40 p-1 rounded-xl h-12 w-full grid grid-cols-2">
                        <TabsTrigger value="visual" className="rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2 flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-sm">
                          <ImageIcon className="h-3.5 w-3.5" /> 视觉元数据
                        </TabsTrigger>
                        <TabsTrigger value="data" className="rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2 flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-sm">
                          <BarChart3 className="h-3.5 w-3.5" /> 技术参数矩阵
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            </section>

            {/* 03. 后台表格与数据流 */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                  <div className="h-2 w-10 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-primary">03. 表格与数据流规范</h2>
               </div>
               <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
                  <Table>
                     <TableHeader className="bg-muted/30">
                        <TableRow>
                           <TableHead className="w-14 pl-6">视觉预览</TableHead>
                           <TableHead className="font-bold uppercase text-[10px] tracking-widest">资产名称与唯一 ID</TableHead>
                           <TableHead className="font-bold uppercase text-[10px] tracking-widest">状态标签</TableHead>
                           <TableHead className="text-right pr-6 font-bold uppercase text-[10px] tracking-widest">管理操作集</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        <TableRow className="group bg-primary/5">
                           <TableCell className="pl-6"><div className="h-10 w-10 bg-muted/40 rounded-lg flex items-center justify-center"><Package className="h-4 w-4 opacity-40" /></div></TableCell>
                           <TableCell>
                              <div className="flex flex-col">
                                 <span className="font-bold text-sm text-primary">已选定的行状态 (Selected)</span>
                                 <span className="text-[9px] font-mono opacity-40 uppercase">ID: MAPPED_ENTRY_001</span>
                              </div>
                           </TableCell>
                           <TableCell><Badge className="bg-green-600 text-white text-[8px] uppercase">已激活 (Live)</Badge></TableCell>
                           <TableCell className="pr-6 text-right">
                              <div className="flex justify-end gap-1 opacity-100">
                                 <Button size="icon" variant="ghost" className="h-8 w-8 text-primary"><Edit2 className="h-3.5 w-3.5" /></Button>
                                 <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                        <TableRow className="group hover:bg-muted/5 transition-colors">
                           <TableCell className="pl-6"><div className="h-10 w-10 bg-muted/40 rounded-lg flex items-center justify-center"><Layers className="h-4 w-4 opacity-40" /></div></TableCell>
                           <TableCell>
                              <div className="flex flex-col">
                                 <span className="font-bold text-sm text-muted-foreground">标准行悬停状态 (Hover)</span>
                                 <span className="text-[9px] font-mono opacity-40 uppercase">ID: STATIC_ENTRY_002</span>
                              </div>
                           </TableCell>
                           <TableCell><Badge variant="secondary" className="text-[8px] uppercase">草稿 (Draft)</Badge></TableCell>
                           <TableCell className="pr-6 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button size="icon" variant="ghost" className="h-8 w-8"><Edit2 className="h-3.5 w-3.5" /></Button>
                                 <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     </TableBody>
                  </Table>
                  <div className="p-12 text-center border-t border-dashed bg-muted/5">
                     <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">列表容器末端 / 空数据状态设计</p>
                  </div>
               </div>
            </section>

            {/* 04. 后台反馈与进度 */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                  <div className="h-2 w-10 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-primary">04. 系统反馈与指标监控</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 任务反馈 */}
                  <div className="p-8 rounded-2xl bg-white border space-y-6">
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">云端资产同步中</p>
                              <p className="text-sm font-bold text-primary">Heovose-H24-高清渲染.png</p>
                           </div>
                           <span className="text-[10px] font-mono font-bold text-primary">78%</span>
                        </div>
                        <Progress value={78} className="h-1.5" />
                     </div>
                     <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                        <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-800 leading-relaxed font-medium">
                           <b>存储预警：</b>当前图片 Base64 体积接近 700KB 限制。请考虑通过云端素材库进行引用。
                        </p>
                     </div>
                  </div>
                  {/* 错误提示规范 */}
                  <div className="p-8 rounded-2xl bg-white border space-y-6">
                     <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Toast 全局提示标准 (仅限错误)</p>
                        <div className="bg-destructive text-destructive-foreground p-4 rounded-xl flex items-center gap-4 shadow-xl border-none">
                           <X className="h-5 w-5" />
                           <div className="space-y-0.5">
                              <p className="text-xs font-bold uppercase">关键操作拦截</p>
                              <p className="text-[10px] opacity-80">Firestore 安全规则：无权修改系统默认配置。</p>
                           </div>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-dashed flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Info className="h-4 w-4" /></div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                           后台规范建议：仅在操作失败或具有重大风险时使用 Toast。常规成功提示应采用内联 Badge 或静默反馈。
                        </p>
                     </div>
                  </div>
               </div>
            </section>

            {/* 05. 后台 AI 智译引擎配置预览 */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                  <div className="h-2 w-10 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-primary">05. AI 智译引擎配置界面</h2>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <Card className="rounded-2xl border-none shadow-2xl overflow-hidden">
                      <div className="bg-primary p-6 text-white">
                        <div className="flex flex-row items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bot className="h-6 w-6" />
                            <div>
                              <CardTitle className="text-lg font-bold">核心智译引擎</CardTitle>
                              <CardDescription className="text-white/60 text-xs uppercase tracking-widest">Gemini 2.5 架构</CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-accent text-accent-foreground text-[10px] font-bold px-3 h-6">专家指令模式</Badge>
                        </div>
                      </div>
                      <CardContent className="p-8 space-y-6 bg-white">
                         <div className="space-y-3">
                           <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-2"><Hammer className="h-3.5 w-3.5" /> 系统级专家指令 (Skill Payload)</Label>
                           <Textarea value="你是一位专业的工业硬件制造专家，擅长将复杂的计算机规格翻译成地道的商务语言..." className="min-h-[100px] text-xs leading-relaxed" readOnly />
                         </div>
                         <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                              <ListChecks className="h-4 w-4" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">已激活的专家技能</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                               <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary/10 text-[9px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 硬件专业术语动态关联</div>
                               <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary/10 text-[9px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> HTML 排版语义无损映射</div>
                            </div>
                         </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-2xl border-none bg-white shadow-xl overflow-hidden">
                      <div className="p-6 border-b bg-muted/10">
                        <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-[0.2em]"><Activity className="h-4 w-4 text-accent" /> 实时连通性诊断</CardTitle>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-800 text-xs">
                          <div className="flex items-start gap-3">
                             <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                             <div className="space-y-1">
                                <p className="font-bold">引擎就绪</p>
                                <p className="opacity-80 leading-relaxed text-[10px]">成功与 Google AI Studio 建立握手，当前模型响应延迟为 240ms。</p>
                             </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[9px] bg-black/5 p-2 rounded">
                          <Terminal className="h-3 w-3 opacity-40" /> ID: gemini-2.5-flash-enterprise
                        </div>
                        <Button variant="outline" className="w-full rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest">执行手动压力测试</Button>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none bg-white shadow-xl overflow-hidden">
                       <div className="p-6 border-b bg-muted/10">
                         <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-[0.2em]"><Gauge className="h-4 w-4 text-blue-500" /> 模型调用仪表盘</CardTitle>
                       </div>
                       <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">每分钟限额 (RPM)</span>
                            <span className="text-xl font-headline font-bold text-primary">15</span>
                          </div>
                          <Progress value={45} className="h-1.5" />
                          <p className="text-[9px] text-muted-foreground leading-relaxed italic">当前已消耗每日免费额度的 45%。建议非必要场景使用 Flash Lite 模型。</p>
                       </CardContent>
                    </Card>
                  </div>
               </div>
            </section>
          </div>
        )}
      </div>

      {/* 固定底部状态栏 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border/40 px-12 py-3 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary">设计系统核心 v1.4.2</span>
           </div>
           <div className="h-4 w-px bg-border/60" />
           <div className="flex items-center gap-2">
             <AppWindow className="h-3.5 w-3.5 opacity-40" />
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
               {activeSystem === 'frontend' ? '当前视图：前台业务组件库' : '当前视图：后台管理规范 (Manifest 1.8)'}
             </span>
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 rounded-full border border-border/20">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">调试网格：开启</span>
           </div>
           <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">仅限开发者预览模式</p>
        </div>
      </footer>
    </div>
  );
}

// 辅助组件：Label
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
