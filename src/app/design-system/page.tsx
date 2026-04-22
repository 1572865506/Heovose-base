
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
  Minimize2
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
import NextImage from 'next/image';

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
            
            {/* 01. 品牌双色视觉体系 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">01. 品牌双色视觉体系 (Dual-Theme Identity)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* 批发蓝 (Wholesale Blue) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">批发业务：品牌深海蓝 (Wholesale Blue)</span>
                     <Badge className="bg-primary text-white text-[8px] uppercase">核心主色</Badge>
                  </div>
                  <div className="p-8 rounded-[3rem] bg-primary text-white space-y-6 shadow-2xl relative overflow-hidden group border border-white/10">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                      <ShoppingBag className="h-7 w-7 text-accent" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-bold font-headline uppercase tracking-tight">标准化批发生产</h4>
                      <p className="text-sm opacity-70 leading-relaxed font-medium">采用品牌经典深海蓝，传达工业生产的稳定性、可靠性与全球化分销的专业感。适用于 AIO 一体机、迷你电脑等标准硬件线。</p>
                    </div>
                    <div className="flex gap-2">
                       <div className="h-8 w-8 rounded-full bg-white/20 border border-white/30" />
                       <div className="h-8 w-8 rounded-full bg-accent" />
                       <div className="h-8 w-8 rounded-full bg-white/5" />
                    </div>
                  </div>
                </div>

                {/* 项目橙 (Project Orange) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-[0.2em]">项目业务：工业活力橙 (Project Orange)</span>
                     <Badge className="bg-[#F97316] text-white text-[8px] uppercase">业务应用色</Badge>
                  </div>
                  <div className="p-8 rounded-[3rem] bg-[#F97316] text-white space-y-6 shadow-2xl relative overflow-hidden group border border-white/10">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                      <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-bold font-headline uppercase tracking-tight">创新项目集成方案</h4>
                      <p className="text-sm opacity-70 leading-relaxed font-medium">采用工业活力橙，强调场景化应用的创新、灵活集成与定制化服务的张力。适用于智慧零售、工业显示及 LED 工程等项目线。</p>
                    </div>
                    <div className="flex gap-2">
                       <div className="h-8 w-8 rounded-full bg-white/20 border border-white/30" />
                       <div className="h-8 w-8 rounded-full bg-[#101820]" />
                       <div className="h-8 w-8 rounded-full bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02. 双色控件与交互行为 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. 双色控件与交互行为 (Themes & Controls)</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  {/* 批发蓝按钮 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <div className="h-4 w-4 rounded-full bg-primary" />
                       <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">批发蓝按钮体系</span>
                    </div>
                    <div className="flex flex-wrap gap-6 items-end">
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase">主操作 (Blue)</p>
                        <Button className="h-14 px-10 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">蓝色主选</Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase">描边 (Blue)</p>
                        <Button variant="outline" className="h-12 px-8 rounded-xl text-xs font-bold border-primary text-primary hover:bg-primary/5">了解详细</Button>
                      </div>
                    </div>
                  </div>

                  {/* 项目橙按钮 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <div className="h-4 w-4 rounded-full bg-[#F97316]" />
                       <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-[0.2em]">项目橙按钮体系</span>
                    </div>
                    <div className="flex flex-wrap gap-6 items-end">
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase">主操作 (Orange)</p>
                        <Button className="h-14 px-10 rounded-2xl text-base font-bold bg-[#F97316] hover:bg-[#EA580C] shadow-xl shadow-orange-500/20">橙色主选</Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase">描边 (Orange)</p>
                        <Button variant="outline" className="h-12 px-8 rounded-xl text-xs font-bold border-[#F97316] text-[#F97316] hover:bg-orange-50">项目咨询</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 border-t pt-16">
                  {/* 输入聚焦反馈对照 */}
                  <div className="space-y-8">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">业务场景聚焦反馈</span>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase opacity-60">批发线输入 (Blue Focus)</Label>
                          <Input value="正在输入中..." readOnly className="h-12 rounded-xl bg-muted/20 border-primary/40 ring-4 ring-primary/5" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase opacity-60">项目线输入 (Orange Focus)</Label>
                          <Input value="正在选择方案..." readOnly className="h-12 rounded-xl bg-muted/20 border-orange-400 ring-4 ring-orange-500/10" />
                       </div>
                    </div>
                  </div>

                  {/* 状态指示器对照 */}
                  <div className="space-y-8">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">业务状态标识对照</span>
                    <div className="flex gap-4">
                       <Badge className="bg-primary/10 text-primary border-primary/20 h-7 px-4 rounded-full text-[10px] font-bold">WHOLESALE ACTIVE</Badge>
                       <Badge className="bg-orange-50 text-orange-600 border-orange-200 h-7 px-4 rounded-full text-[10px] font-bold">PROJECT ACTIVE</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 03. 前台业务核心组件 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-accent/20">
                <div className="h-2 w-10 bg-accent rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. 业务核心组件单元 (Business Units)</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* 批发卡片预览 */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                     <Monitor className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">批发线：产品展示单元</span>
                   </div>
                   <div className="group bg-white rounded-[3rem] border border-border/40 overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-700 shadow-sm">
                      <div className="relative aspect-[16/10] bg-muted/20 flex items-center justify-center">
                         <div className="h-32 w-32 bg-primary/5 rounded-full blur-2xl animate-pulse" />
                         <Package className="h-24 w-24 text-primary/10 relative z-10" />
                         <div className="absolute top-6 left-6"><Badge className="bg-primary text-white text-[9px] uppercase tracking-widest font-bold px-4 h-6">AIO SERIES</Badge></div>
                      </div>
                      <div className="p-10 space-y-4">
                         <h3 className="text-2xl font-headline font-bold text-primary leading-tight">Heovose H24 高性能一体机</h3>
                         <p className="text-sm text-muted-foreground opacity-70 leading-relaxed">模块化集成设计，专为现代办公空间与规模化部署打造的旗舰级桌面方案。</p>
                         <div className="pt-8 border-t border-dashed flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-2">查看技术规格 <ArrowRight className="h-3.5 w-3.5" /></span>
                            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><ShoppingBag className="h-5 w-5" /></div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 项目卡片预览 */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                     <Zap className="h-4 w-4 text-[#F97316]" />
                     <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-[0.2em]">项目线：解决方案单元</span>
                   </div>
                   <div className="group bg-white rounded-[3rem] border border-border/40 overflow-hidden hover:shadow-2xl hover:border-orange-500/20 transition-all duration-700 shadow-sm">
                      <div className="relative aspect-[16/10] bg-muted/20 flex items-center justify-center">
                         <div className="h-32 w-32 bg-orange-500/5 rounded-full blur-2xl animate-pulse" />
                         <Building2 className="h-24 w-24 text-[#F97316]/10 relative z-10" />
                         <div className="absolute top-6 left-6"><Badge className="bg-[#F97316] text-white text-[9px] uppercase tracking-widest font-bold px-4 h-6">SOLUTION</Badge></div>
                      </div>
                      <div className="p-10 space-y-4">
                         <h3 className="text-2xl font-headline font-bold text-[#F97316] leading-tight">智慧零售数字化终端</h3>
                         <p className="text-sm text-muted-foreground opacity-70 leading-relaxed">赋能全球零售商，提供涵盖自助结账、互动导购及后台集成的全链路方案。</p>
                         <div className="pt-8 border-t border-dashed flex items-center justify-between">
                            <span className="text-xs font-bold text-[#F97316] flex items-center gap-2">获取即时方案 <ArrowRight className="h-3.5 w-3.5" /></span>
                            <div className="h-10 w-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-lg"><Zap className="h-5 w-5" /></div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 04. 交互模式与视觉特效 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. 交互模式与视觉特效 (Visual FX)</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                   {/* AI 核心交互 */}
                   <div className="space-y-8">
                     <div className="space-y-2">
                       <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                         <Sparkles className="h-4 w-4 ai-icon-gradient" /> AI 智感流光控件 (AI Aurora)
                       </p>
                       <p className="text-xs text-muted-foreground leading-relaxed">通过 4 色极光流动渐变与呼吸感光晕，为 AI 功能提供独特的视觉聚焦，独立于蓝/橙业务色系之外。</p>
                     </div>
                     <div className="flex flex-wrap gap-8 items-center">
                        <Button className="ai-btn-glow h-16 px-10 rounded-2xl gap-3 font-bold uppercase tracking-widest text-sm shadow-2xl">
                           <Sparkles className="h-5 w-5 ai-icon-gradient" /> AI 智译本页 (完整版)
                        </Button>
                        <div className="h-12 w-12 rounded-full ai-btn-glow flex items-center justify-center cursor-pointer shadow-lg">
                           <Sparkles className="h-5 w-5 ai-icon-gradient" />
                        </div>
                     </div>
                   </div>

                   {/* 玻璃拟态规范 */}
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                          <Globe className="h-4 w-4" /> 玻璃拟态材质规范 (Glass-morphism)
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">定义英雄屏及导航栏的背景模糊度标准。M1 适用于轻量悬浮，M2 适用于重质背景。</p>
                      </div>
                      <div className="flex gap-6">
                         <div className="flex-1 h-32 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">M1: 极轻量</span>
                         </div>
                         <div className="flex-1 h-32 rounded-3xl bg-primary/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">M2: 重磨砂</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 后台系统预览 (遵循白皮书) */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary">01. 后台视觉识别与物理参数</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1.1 圆角阶梯 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.1 圆角标准测试</span>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm space-y-4">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-center">
                       <span className="text-[10px] font-bold uppercase opacity-40">内嵌级 (12px)</span>
                    </div>
                    <Button className="w-full rounded-lg h-10 text-[10px] font-bold uppercase tracking-wider">
                      组件级 (8px)
                    </Button>
                  </div>
                </div>

                {/* 1.3 字体逻辑 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.3 字体与占位符比例</span>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 space-y-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">表单标签 (10px)</Label>
                      <Input value="标准内容字号 (12px)" readOnly className="h-10 text-xs bg-muted/10" />
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-relaxed italic border-t pt-4">白皮书规范：标签必须锁定 10px Bold，内容强制对齐 12px。</p>
                  </div>
                </div>

                {/* 1.4 状态反馈 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.4 边框与物理状态</span>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 space-y-4">
                     <div className="h-10 bg-muted/20 border border-border/60 rounded-lg flex items-center px-3">
                        <span className="text-[10px] font-medium opacity-40">基础状态背景</span>
                     </div>
                     <div className="h-10 bg-muted/10 border-primary/50 ring-4 ring-primary/5 rounded-lg flex items-center px-3 border shadow-sm">
                        <span className="text-[10px] font-bold text-primary">聚焦/激活状态</span>
                     </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 后台数据表格 */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                  <div className="h-2 w-10 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-primary">02. 表格与复杂列表规范</h2>
               </div>
               <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
                  <Table>
                     <TableHeader className="bg-muted/30">
                        <TableRow>
                           <TableHead className="w-14 pl-6">视觉预览</TableHead>
                           <TableHead className="font-bold uppercase text-[10px] tracking-widest">资产标识与名称</TableHead>
                           <TableHead className="font-bold uppercase text-[10px] tracking-widest">业务状态</TableHead>
                           <TableHead className="text-right pr-6 font-bold uppercase text-[10px] tracking-widest">管理操作</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        <TableRow className="group bg-primary/5">
                           <TableCell className="pl-6"><div className="h-10 w-10 bg-muted/40 rounded-lg flex items-center justify-center"><Package className="h-4 w-4 opacity-40" /></div></TableCell>
                           <TableCell>
                              <div className="flex flex-col">
                                 <span className="font-bold text-sm text-primary">已选定的行项目 (Selected)</span>
                                 <span className="text-[9px] font-mono opacity-40">ID: PROD_AIO_0605_AX92</span>
                              </div>
                           </TableCell>
                           <TableCell><Badge className="bg-green-600 text-white text-[8px] uppercase">已上线 (Live)</Badge></TableCell>
                           <TableCell className="pr-6 text-right">
                              <div className="flex justify-end gap-1">
                                 <Button size="icon" variant="ghost" className="h-8 w-8 text-primary"><Edit2 className="h-3.5 w-3.5" /></Button>
                                 <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                        <TableRow className="group hover:bg-muted/5 transition-colors">
                           <TableCell className="pl-6"><div className="h-10 w-10 bg-muted/40 rounded-lg flex items-center justify-center"><Layers className="h-4 w-4 opacity-40" /></div></TableCell>
                           <TableCell>
                              <div className="flex flex-col">
                                 <span className="font-bold text-sm text-muted-foreground">悬停状态预览 (Hover)</span>
                                 <span className="text-[9px] font-mono opacity-40">ID: CAT_MINIPC_GEN2</span>
                              </div>
                           </TableCell>
                           <TableCell><Badge variant="secondary" className="text-[8px] uppercase">草稿 (Draft)</Badge></TableCell>
                           <TableCell className="pr-6 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     </TableBody>
                  </Table>
                  <div className="p-12 text-center border-t border-dashed bg-muted/5">
                     <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] italic">空列表 / 默认态展示规范</p>
                  </div>
               </div>
            </section>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
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
               {activeSystem === 'frontend' ? '视图：前台品牌双色设计' : '视图：后台管理工业规范 (Manifest 1.8)'}
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
