
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Factory
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
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest">Heovose Design Labs</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">Visual Sandbox • Core v1.4.2</p>
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
            Front-end (User)
          </button>
          <button 
            onClick={() => setActiveSystem('backend')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSystem === 'backend' ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-primary"
            )}
          >
            Back-end (Admin)
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
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">01. Front-end Identity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* 业务线配色标准 */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Business Line Contrast</span>
                     <Badge variant="outline" className="text-[8px] uppercase">Accent Standards</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2.5rem] bg-primary text-white space-y-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <ShoppingBag className="h-6 w-6 text-accent" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold font-headline uppercase tracking-tight">Wholesale Line</h4>
                        <p className="text-xs opacity-60 leading-relaxed font-medium">Classical Navy Blue. Focused on mass reliability.</p>
                      </div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-[#F97316] text-white space-y-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold font-headline uppercase tracking-tight">Project Solutions</h4>
                        <p className="text-xs opacity-60 leading-relaxed font-medium">Industrial Orange. Focused on innovation & integration.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 前台排版与圆角 */}
                <div className="space-y-6">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Typographic Hierarchy</span>
                  <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-4xl font-headline font-bold text-primary leading-tight">Heovose Elevate Architecture</h3>
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed">Redefining high-end industrial computing through aesthetic engineering and precision manufacturing.</p>
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

            {/* 02. 前台业务核心组件 */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-accent/20">
                <div className="h-2 w-10 bg-accent rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. Core Business Units</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* 产品卡片标准 (Wholesale vs Project) */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Themed Product Item (Standard)</span>
                     <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div className="h-2 w-2 rounded-full bg-[#F97316]" />
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Wholesale Card */}
                     <div className="group bg-white rounded-[2.5rem] border border-border/40 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 shadow-sm flex flex-col">
                        <div className="relative aspect-[4/3] bg-muted/20 flex items-center justify-center">
                           <Monitor className="h-20 w-20 text-primary/10" />
                           <div className="absolute top-4 left-4"><Badge className="bg-primary text-white text-[9px] uppercase tracking-widest font-bold">AIO Series</Badge></div>
                        </div>
                        <div className="p-8 space-y-4">
                           <h3 className="text-xl font-headline font-bold text-primary group-hover:text-accent transition-colors leading-tight">Heovose H24 Advanced</h3>
                           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-60">High-performance All-in-One PC integrated with premium barebone kits.</p>
                           <div className="pt-6 border-t border-dashed flex items-center justify-between">
                              <span className="text-xs font-bold text-primary flex items-center gap-2 cursor-pointer">View Details <ArrowRight className="h-3.5 w-3.5" /></span>
                              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><ShoppingBag className="h-4 w-4" /></div>
                           </div>
                        </div>
                     </div>
                     {/* Project Card */}
                     <div className="group bg-white rounded-[2.5rem] border border-border/40 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 shadow-sm flex flex-col border-b-[#F97316]/40">
                        <div className="relative aspect-[4/3] bg-muted/20 flex items-center justify-center">
                           <Zap className="h-20 w-20 text-[#F97316]/10" />
                           <div className="absolute top-4 left-4"><Badge className="bg-[#F97316] text-white text-[9px] uppercase tracking-widest font-bold">Solutions</Badge></div>
                        </div>
                        <div className="p-8 space-y-4">
                           <h3 className="text-xl font-headline font-bold text-[#F97316] group-hover:text-primary transition-colors leading-tight">Smart Retail Kiosk V2</h3>
                           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-60">Custom self-service terminal for seamless global checkout deployment.</p>
                           <div className="pt-6 border-t border-dashed flex items-center justify-between">
                              <span className="text-xs font-bold text-[#F97316] flex items-center gap-2 cursor-pointer">Inquire Now <ArrowRight className="h-3.5 w-3.5" /></span>
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
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Bento Grid Unit</span>
                      <div className="group relative h-48 rounded-[2rem] overflow-hidden border border-border/40 bg-primary shadow-xl cursor-pointer">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                         <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
                            <span className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] mb-1">Industrial</span>
                            <h4 className="text-white font-headline font-bold text-lg">Industrial PC</h4>
                         </div>
                         <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100 transition-all duration-500">
                           <ArrowRight className="h-4 w-4" />
                         </div>
                      </div>
                   </div>

                   {/* 制造流程预览 */}
                   <div className="space-y-4">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Production Pipeline Step</span>
                      <div className="flex items-center gap-6 p-4 bg-white rounded-3xl border shadow-sm">
                         <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-white font-headline font-bold text-xl shadow-lg">08</div>
                         <div className="space-y-1 flex-1">
                            <h4 className="text-sm font-bold text-primary">Manufacturing</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">Precision Assembly</p>
                         </div>
                         <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/40"><ClipboardList className="h-4 w-4" /></div>
                      </div>
                   </div>

                   {/* 案例标签预览 */}
                   <div className="space-y-4">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Success Case Tag</span>
                      <div className="group relative rounded-2xl overflow-hidden aspect-video border shadow-lg cursor-pointer">
                         <div className="absolute inset-0 bg-primary/10 transition-colors group-hover:bg-primary/20" />
                         <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                            <div className="space-y-1">
                               <Badge className="bg-accent text-accent-foreground text-[9px] font-bold tracking-widest border-none">RETAIL</Badge>
                               <h5 className="text-white font-bold text-sm">Smart Transformation</h5>
                            </div>
                            <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-lg"><ArrowRight className="h-3 w-3" /></div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 03. 前台交互与特效 (UI Patterns) */}
            <section className="space-y-12">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. Patterns & Effects</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                   {/* AI Core Interaction */}
                   <div className="space-y-8">
                     <div className="space-y-2">
                       <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                         <Sparkles className="h-4 w-4 ai-icon-gradient" /> Intelligence Asset Buttons
                       </p>
                       <p className="text-xs text-muted-foreground leading-relaxed">Front-end AI buttons use 16px radius and heavy elevation to distinguish from standard controls.</p>
                     </div>
                     <div className="flex flex-wrap gap-8 items-center">
                        <Button className="ai-btn-glow h-16 px-10 rounded-2xl gap-3 font-bold uppercase tracking-widest text-sm shadow-2xl">
                           <Sparkles className="h-5 w-5 ai-icon-gradient" /> AI 智译本页 (Full Flow)
                        </Button>
                        <div className="h-12 w-12 rounded-full ai-btn-glow flex items-center justify-center cursor-pointer shadow-lg">
                           <Sparkles className="h-5 w-5 ai-icon-gradient" />
                        </div>
                     </div>
                   </div>

                   {/* Material Specs */}
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                          <Globe className="h-4 w-4" /> Material & Glass Spec
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Hero and Navbar specific background-blur standards.</p>
                      </div>
                      <div className="flex gap-6">
                         <div className="flex-1 h-32 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">M1: Glass Light</span>
                         </div>
                         <div className="flex-1 h-32 rounded-3xl bg-primary/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">M2: Glass Heavy</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 04. 前台全局元素 */}
            <section className="space-y-12">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                  <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                  <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. Global Layout Units</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Stats Components */}
                  <div className="space-y-6">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Trust Indicators (Stats)</span>
                     <div className="bg-primary p-12 rounded-[3rem] text-white flex flex-col items-center text-center space-y-4 shadow-xl">
                        <div className="p-4 bg-white/10 rounded-2xl">
                          <Factory className="h-8 w-8 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-6xl font-headline font-bold block">3</span>
                          <span className="text-xl font-medium opacity-90 block uppercase">Global Factories</span>
                        </div>
                     </div>
                  </div>
                  {/* Copyright & Footer Meta */}
                  <div className="space-y-6">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Meta & Legal</span>
                     <div className="bg-white p-12 rounded-[3rem] border shadow-sm space-y-8">
                        <div className="space-y-4">
                           <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center text-primary/40"><ShieldCheck className="h-5 w-5" /></div>
                              <div className="space-y-1">
                                 <p className="text-xs font-bold text-primary uppercase tracking-tight">Terms of Reliability</p>
                                 <p className="text-[10px] text-muted-foreground leading-relaxed">Systematic quality assurance for high-end hardware deployment.</p>
                              </div>
                           </div>
                        </div>
                        <div className="pt-8 border-t border-dashed flex justify-between items-center opacity-40 text-[9px] uppercase tracking-[0.2em] font-bold">
                           <p>© 2024 Heovose Technology</p>
                           <div className="flex gap-6"><span>Privacy</span><span>Terms</span></div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          </div>
        ) : (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 01. 后台规范 (依 Manifest) */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary">01. Admin Identity & Specs</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1.1 圆角标准测试 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.1 Border Radius</span>
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Container (16px)</span>
                      <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Internal (12px)</span>
                         <Button className="mt-4 w-full rounded-lg h-10 text-[10px] font-bold uppercase tracking-wider">
                           Component (8px)
                         </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.3 字体标准测试 */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.3 Typography Logic</span>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 space-y-6">
                    <div className="space-y-1.5 border-b pb-4">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <AppWindow className="h-4 w-4" /> Section Heading
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Admin Manifest 1.2 Hierarchy</p>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                         <Label className="text-[10px] font-bold uppercase tracking-wider">Field Label</Label>
                         <Input placeholder="Form Content Alignment (12px)" value="Standard text-xs" readOnly className="h-10 text-xs" />
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
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">1.4 Border & States</span>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 space-y-6">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase opacity-40">Idle Background</Label>
                        <div className="h-10 bg-muted/20 border border-border/60 rounded-lg" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-primary">Focused State</Label>
                        <div className="h-10 bg-muted/10 border-primary/50 ring-4 ring-primary/5 rounded-lg flex items-center px-3">
                           <div className="h-1 w-4 bg-primary rounded-full animate-pulse" />
                        </div>
                     </div>
                     <div className="pt-4 border-t border-dashed">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600" />
                           </div>
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">Compliance Validated</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 03. 后台表格与数据流 */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                  <div className="h-2 w-10 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-primary">03. Tables & Data Streams</h2>
               </div>
               <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
                  <Table>
                     <TableHeader className="bg-muted/30">
                        <TableRow>
                           <TableHead className="w-14 pl-6">视觉</TableHead>
                           <TableHead className="font-bold uppercase text-[10px] tracking-widest">资产名称与 ID</TableHead>
                           <TableHead className="font-bold uppercase text-[10px] tracking-widest">状态标签</TableHead>
                           <TableHead className="text-right pr-6 font-bold uppercase text-[10px] tracking-widest">操作集</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        <TableRow className="group bg-primary/5">
                           <TableCell className="pl-6"><div className="h-10 w-10 bg-muted/40 rounded-lg flex items-center justify-center"><Package className="h-4 w-4 opacity-40" /></div></TableCell>
                           <TableCell>
                              <div className="flex flex-col">
                                 <span className="font-bold text-sm text-primary">Selected Asset State</span>
                                 <span className="text-[9px] font-mono opacity-40 uppercase">ID: MAPPED_ENTRY_001</span>
                              </div>
                           </TableCell>
                           <TableCell><Badge className="bg-green-600 text-white text-[8px] uppercase">Active</Badge></TableCell>
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
                                 <span className="font-bold text-sm text-muted-foreground">Standard Row Hover</span>
                                 <span className="text-[9px] font-mono opacity-40 uppercase">ID: STATIC_ENTRY_002</span>
                              </div>
                           </TableCell>
                           <TableCell><Badge variant="secondary" className="text-[8px] uppercase">Draft</Badge></TableCell>
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
                     <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">End of List Container / Empty State Design</p>
                  </div>
               </div>
            </section>

            {/* 04. 后台反馈与进度 */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                  <div className="h-2 w-10 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-primary">04. Feedback & Gauges</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Task & Process Feedback */}
                  <div className="p-8 rounded-2xl bg-white border space-y-6">
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Syncing Asset</p>
                              <p className="text-sm font-bold text-primary">Heovose-H24-Base64.png</p>
                           </div>
                           <span className="text-[10px] font-mono font-bold text-primary">78%</span>
                        </div>
                        <Progress value={78} className="h-1.5" />
                     </div>
                     <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                        <AlertCircle className="h-4 w-4 text-orange-600 shrink-0" />
                        <p className="text-[10px] text-orange-800 leading-relaxed font-medium">
                           <b>Storage Warning:</b> Base64 size approaching 700KB limit. Consider cloud asset migration.
                        </p>
                     </div>
                  </div>
                  {/* Toast & Error Specs */}
                  <div className="p-8 rounded-2xl bg-white border space-y-6">
                     <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Toast Standards (Error only)</p>
                        <div className="bg-destructive text-destructive-foreground p-4 rounded-xl flex items-center gap-4 shadow-xl border-none">
                           <X className="h-5 w-5" />
                           <div className="space-y-0.5">
                              <p className="text-xs font-bold uppercase">Operation Failed</p>
                              <p className="text-[10px] opacity-80">Firestore Security Rules: Permission Denied.</p>
                           </div>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-dashed flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Info className="h-4 w-4" /></div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                           后台规范建议：仅在操作失败或具有重大风险时使用 Toast，常规成功提示应采用内联 Badge。
                        </p>
                     </div>
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
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lab Core v1.4.2</span>
           </div>
           <div className="h-4 w-px bg-border/60" />
           <div className="flex items-center gap-2">
             <AppWindow className="h-3.5 w-3.5 opacity-40" />
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
               {activeSystem === 'frontend' ? 'Viewport: Business Components' : 'Viewport: Admin Manifest 1.8 Compliance'}
             </span>
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 rounded-full border border-border/20">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Debug Grid: ON</span>
           </div>
           <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Developer Preview Only</p>
        </div>
      </footer>
    </div>
  );
}

// 辅助组件：Label
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
