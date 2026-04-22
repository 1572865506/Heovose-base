"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Cpu, 
  ShoppingBag, 
  Building2, 
  Search, 
  ArrowRight,
  Monitor,
  LayoutGrid,
  Globe,
  Edit2,
  Zap,
  Layers,
  ShieldCheck,
  FileText,
  Plus,
  Maximize2,
  Type,
  Move,
  History,
  ExternalLink,
  Loader2,
  X
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getFrontendManifest } from './actions';

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
  const [manifestContent, setManifestContent] = useState('');
  const [isLoadingManifest, setIsLoadingManifest] = useState(false);

  const loadManifest = async () => {
    setIsLoadingManifest(true);
    const res = await getFrontendManifest();
    if (res.success) {
      setManifestContent(res.content);
    }
    setIsLoadingManifest(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-40">
      <AiGradientDef />
      
      {/* 顶部系统切换器 */}
      <header className="bg-white border-b border-border/40 sticky top-0 z-[110] px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest leading-none">Heovose Design Lab</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60 mt-1">视觉实验室 • 核心版本 v1.7.0</p>
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
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">00. 核心色彩模组定义</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">批发业务：品牌蓝主题栈</span>
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
                    <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-[0.2em]">项目业务：工业橙主题栈</span>
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

            {/* 01. 字体系统规范定义 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">01. 字体系统规范定义</h2>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">标题字体 (Display)</span>
                    <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20">
                      <p className="text-4xl font-headline font-bold text-primary">Space Grotesk</p>
                      <p className="text-[9px] mt-2 text-muted-foreground">用于 H1-H3 等级。具备工业几何美感。</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">正文字体 (Sans-serif)</span>
                    <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20">
                      <p className="text-4xl font-body font-bold text-primary">Inter</p>
                      <p className="text-[9px] mt-2 text-muted-foreground">用于全站文本、说明。高可读性核心。</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">技术辅助字体 (Monospace)</span>
                    <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-primary/20">
                      <p className="text-3xl font-mono font-bold text-primary">JetBrains Mono</p>
                      <p className="text-[9px] mt-2 text-muted-foreground">用于 SKU、技术参数。确保数值严丝合缝。</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="grid grid-cols-12 border-b border-border/40 pb-4 text-[10px] font-bold uppercase text-primary/40">
                      <div className="col-span-3">层级名称</div>
                      <div className="col-span-2 text-center">Size / Line-height</div>
                      <div className="col-span-7 pl-6">视觉预览</div>
                   </div>
                   <div className="grid grid-cols-12 items-center py-6 border-b border-dashed border-border/40 group hover:bg-muted/5 transition-all px-4 rounded-xl">
                      <div className="col-span-3 font-bold text-xs uppercase">Hero Main / 主标题</div>
                      <div className="col-span-2 text-center font-mono text-[10px]">96px / 0.85</div>
                      <div className="col-span-7 pl-6">
                        <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary leading-[0.85] tracking-tighter uppercase">HEOVOSE TECHNOLOGY</h1>
                      </div>
                   </div>
                   <div className="grid grid-cols-12 items-center py-6 border-b border-dashed border-border/40 group hover:bg-muted/5 transition-all px-4 rounded-xl">
                      <div className="col-span-3 font-bold text-xs uppercase">Technical Spec / 技术规格</div>
                      <div className="col-span-2 text-center font-mono text-[10px]">13px / 1.5</div>
                      <div className="col-span-7 pl-6">
                        <p className="font-mono text-sm tracking-tight text-primary/80">CORE_I7_12700H | RTX_3060_6GB | NVME_2TB</p>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 02. 边框与圆角规范定义 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. 边框与圆角规范定义</h2>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                   <div className="space-y-8">
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">线宽阶梯与风格 (Stroke Scale)</span>
                     <div className="space-y-6">
                       <div className="flex items-center gap-8">
                         <div className="h-12 w-32 border border-primary rounded-xl bg-muted/10 flex items-center justify-center font-mono text-[10px] font-bold">1px (border)</div>
                         <p className="text-[10px] text-muted-foreground">基础装饰、原子组件、次级分割。</p>
                       </div>
                       <div className="flex items-center gap-8">
                         <div className="h-12 w-32 border-2 border-primary rounded-xl bg-muted/10 flex items-center justify-center font-mono text-[10px] font-bold">2px (border-2)</div>
                         <p className="text-[10px] text-muted-foreground">容器主边界、交互激活态提示。</p>
                       </div>
                       <div className="flex items-center gap-8">
                         <div className="h-12 w-32 border border-dashed border-primary rounded-xl bg-muted/10 flex items-center justify-center font-mono text-[10px] font-bold">DASHED 1px</div>
                         <p className="text-[10px] text-muted-foreground">空位占位、引导性导入区。</p>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-8">
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">圆角阶梯标准 (Radius Standard)</span>
                     <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2 text-center">
                          <div className="aspect-square rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-bold">8px</div>
                          <p className="text-[9px] font-bold uppercase">Small (lg)</p>
                        </div>
                        <div className="space-y-2 text-center">
                          <div className="aspect-square rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-bold">16px</div>
                          <p className="text-[9px] font-bold uppercase">Large (2xl)</p>
                        </div>
                        <div className="space-y-2 text-center">
                          <div className="aspect-square rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-bold">40px</div>
                          <p className="text-[9px] font-bold uppercase">Brand (3rem)</p>
                        </div>
                     </div>
                   </div>
                </div>

                {/* 阴影体系 */}
                <div className="pt-16 border-t border-dashed border-border/60">
                   <div className="flex items-center gap-3 mb-10">
                     <Layers className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">阴影与投影规范 (Shadow Hierarchy)</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="space-y-4">
                        <div className="h-32 bg-white rounded-2xl shadow-sm border border-border/20 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-sm</div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase">极简隔离</p>
                          <p className="text-[9px] text-muted-foreground">用于徽章、标签及微型原子组件。</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-32 bg-white rounded-2xl shadow-md border border-border/20 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-md</div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase">标准浮动</p>
                          <p className="text-[9px] text-muted-foreground">用于常规卡片、二级容器。</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-32 bg-white rounded-2xl shadow-xl border border-border/20 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-xl</div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase">视觉强调</p>
                          <p className="text-[9px] text-muted-foreground">用于激活态卡片、产品详情区。</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-32 bg-white rounded-2xl shadow-2xl border border-border/20 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-2xl</div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase">全局深度</p>
                          <p className="text-[9px] text-muted-foreground">用于全局导航、Hero 浮动层。</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 03. 品牌双轨视觉应用 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. 品牌双轨视觉应用</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="group space-y-6">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Wholesale Blue / 品牌蓝</span>
                  <div className="p-10 rounded-[3rem] bg-primary text-white space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                    <ShoppingBag className="h-10 w-10 text-accent" />
                    <h4 className="text-3xl font-bold font-headline uppercase leading-none">标准化批发生产</h4>
                    <p className="text-sm opacity-70 leading-relaxed font-medium">代表稳定性、可规模化与专业硬件素养。</p>
                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Active Theme</span>
                       <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
                    </div>
                  </div>
                </div>
                <div className="group space-y-6">
                  <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-[0.3em]">Project Orange / 工业橙</span>
                  <div className="p-10 rounded-[3rem] bg-[#F97316] text-white space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                    <Building2 className="h-10 w-10 text-white" />
                    <h4 className="text-3xl font-bold font-headline uppercase leading-none">定制化项目集成</h4>
                    <p className="text-sm opacity-70 leading-relaxed font-medium">代表创新力、定制服务与全场景应用张力。</p>
                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white">Project Specific</span>
                       <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 04. 双色控件与交互行为 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. 双色控件与交互行为</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                    <div className="space-y-8">
                       <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] border-l-2 border-primary pl-3">批发风格按钮组</p>
                       <div className="flex flex-wrap gap-4">
                          <Button className="h-14 px-10 rounded-2xl font-bold bg-primary shadow-xl hover:scale-105 transition-all text-white">Wholesale Main</Button>
                          <Button variant="outline" className="h-14 px-10 rounded-2xl font-bold border-primary text-primary hover:bg-primary/5">Outline Action</Button>
                       </div>
                       <div className="space-y-4">
                         <Label className="text-[10px] font-bold uppercase opacity-40 tracking-widest">主题聚焦态演示</Label>
                         <Input readOnly value="聚焦后触发品牌蓝光晕..." className="h-12 rounded-xl focus-visible:ring-primary/20" />
                       </div>
                    </div>
                    <div className="space-y-8">
                       <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-[0.2em] border-l-2 border-[#F97316] pl-3">项目风格按钮组</p>
                       <div className="flex flex-wrap gap-4">
                          <Button className="h-14 px-10 rounded-2xl font-bold bg-[#F97316] shadow-xl hover:shadow-orange-500/20 hover:scale-105 transition-all text-white">Project Solution</Button>
                          <Button variant="outline" className="h-14 px-10 rounded-2xl font-bold border-[#F97316] text-[#F97316] hover:bg-orange-500/5">Outline Action</Button>
                       </div>
                       <div className="space-y-4">
                         <Label className="text-[10px] font-bold uppercase opacity-40 tracking-widest">项目聚焦态演示</Label>
                         <Input readOnly value="聚焦后触发工业橙光晕..." className="h-12 rounded-xl focus-visible:ring-orange-500/20 border-orange-500/20" />
                       </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* 05. 业务核心组件单元 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">05. 业务核心组件单元</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="group bg-white rounded-[3rem] border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-700 p-10 space-y-6">
                   <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-2 shadow-inner"><Monitor className="h-8 w-8" /></div>
                   <div className="space-y-2">
                     <span className="text-[9px] font-bold uppercase text-primary tracking-[0.3em]">Category: AIO Pro</span>
                     <h3 className="text-3xl font-headline font-bold text-primary leading-tight uppercase">Heovose H24 高性能一体机</h3>
                   </div>
                   <p className="text-sm text-muted-foreground leading-relaxed font-medium">模块化集成设计，专为现代办公空间与规模化部署打造。12代高性能处理器加持。</p>
                   <div className="pt-8 border-t border-dashed border-border/60 flex items-center justify-between">
                     <span className="text-xs font-bold text-primary flex items-center gap-2 group-hover:translate-x-2 transition-transform cursor-pointer">查看详细规格 <ArrowRight className="h-4 w-4" /></span>
                     <Badge variant="outline" className="bg-primary/5 text-[9px] uppercase font-bold text-primary border-primary/10">Stock: Ready</Badge>
                   </div>
                </div>
                <div className="group bg-white rounded-[3rem] border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-700 p-10 space-y-6">
                   <div className="h-16 w-16 rounded-2xl bg-orange-500/5 flex items-center justify-center text-[#F97316] mb-2 shadow-inner"><Zap className="h-8 w-8" /></div>
                   <div className="space-y-2">
                     <span className="text-[9px] font-bold uppercase text-orange-600 tracking-[0.3em]">Solution: Smart Retail</span>
                     <h3 className="text-3xl font-headline font-bold text-[#F97316] leading-tight uppercase">智慧零售数字化终端</h3>
                   </div>
                   <p className="text-sm text-muted-foreground leading-relaxed font-medium">赋能全球零售商，提供涵盖自助结账、互动导购的全链路方案。支持深度接口定制。</p>
                   <div className="pt-8 border-t border-dashed border-border/60 flex items-center justify-between">
                     <span className="text-xs font-bold text-[#F97316] flex items-center gap-2 group-hover:translate-x-2 transition-transform cursor-pointer">获取集成方案 <ArrowRight className="h-4 w-4" /></span>
                     <Badge variant="outline" className="bg-orange-500/5 text-[9px] uppercase font-bold text-[#F97316] border-orange-500/10">Project: Bespoke</Badge>
                   </div>
                </div>
              </div>
            </section>

            {/* 06. 交互模式与视觉特效 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full opacity-20" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">06. 交互模式与视觉特效</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                   <div className="space-y-8">
                     <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                       <Sparkles className="h-4 w-4 ai-icon-gradient" /> 
                       AI 智感流光控件 (AI Aurora)
                     </p>
                     <div className="flex flex-col gap-6">
                        <Button className="ai-btn-glow h-16 px-10 rounded-2xl gap-3 font-bold uppercase tracking-widest text-sm shadow-2xl">
                          <Sparkles className="h-5 w-5 ai-icon-gradient" /> AI 智译全局内容
                        </Button>
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                          AI 专用组件采用独特的 4 色动态流光作为核心识别，传达“智慧辅助”感。
                        </p>
                     </div>
                   </div>

                   <div className="space-y-8">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Globe className="h-4 w-4" /> 
                        玻璃拟态对比 (Glass-morphism)
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-40 rounded-[2rem] bg-primary/10 backdrop-blur-md border border-white/40 flex flex-col items-center justify-center gap-2 shadow-xl">
                          <span className="text-[10px] font-bold uppercase text-primary tracking-widest">M1: 标准蒙砂</span>
                          <Badge variant="outline" className="text-[8px] border-primary/20">Blur: 16px</Badge>
                        </div>
                        <div className="h-40 rounded-[2rem] bg-white/40 backdrop-blur-3xl border border-white/20 flex flex-col items-center justify-center gap-2 shadow-2xl">
                          <span className="text-[10px] font-bold uppercase text-primary tracking-widest">M2: 重质玻璃</span>
                          <Badge variant="outline" className="text-[8px] border-primary/20">Blur: 40px</Badge>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* 后台系统预览 */
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary leading-none">01. 后台核心规范 (Admin Specs)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-white border border-border/40 shadow-sm space-y-6">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block border-b pb-2">物理圆角标准</span>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-center"><span className="text-[10px] font-bold uppercase opacity-40">容器级 (rounded-xl)</span></div>
                    <Button className="w-full rounded-lg h-10 text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 shadow-none hover:bg-primary/20">组件级 (rounded-lg)</Button>
                  </div>
                </div>
                <div className="p-8 rounded-2xl bg-white border border-border/40 shadow-sm space-y-6">
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block border-b pb-2">排版字号逻辑</span>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-primary">标签 (text-[10px])</Label>
                      <Input readOnly value="内容字号 (text-xs / 12px)" className="h-10 text-xs bg-muted/20 border-border/60" />
                    </div>
                    <Textarea readOnly value="多行文本同样锁定为 12px。确保管理后台界面在紧密排列下依然清晰有序。" className="text-xs bg-muted/20 min-h-[100px]" />
                  </div>
                </div>
                <div className="p-8 rounded-2xl bg-primary text-white shadow-xl space-y-4">
                   <div className="flex items-center gap-3">
                     <ShieldCheck className="h-6 w-6" />
                     <h4 className="font-bold text-sm uppercase tracking-widest">管理员治理准则</h4>
                   </div>
                   <p className="text-[11px] opacity-70 leading-relaxed font-medium">管理后台遵循《管理员设计白皮书》，强调操作流的高效与控件的高度对齐。</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border/40 px-12 py-3 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-8">
          <Dialog modal={false}>
            <DialogTrigger asChild>
               <Button onClick={loadManifest} size="sm" className="rounded-full h-10 px-6 gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg">
                 <FileText className="h-4 w-4" /> 查阅前台视觉白皮书
               </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[85vh] p-0 rounded-3xl overflow-hidden flex flex-col shadow-2xl border-none">
               <div className="bg-primary p-6 text-white shrink-0">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="h-6 w-6 text-accent" />
                       <div>
                         <DialogTitle className="text-xl font-bold uppercase tracking-widest">Heovose Elevate 前台规范白皮书</DialogTitle>
                         <DialogDescription className="text-white/60 text-xs uppercase mt-1">本项目前台视觉与交互治理的最高准则。</DialogDescription>
                       </div>
                    </div>
                  </DialogHeader>
               </div>
               <div className="flex-1 overflow-y-auto p-12 bg-white scrollbar-minimal">
                  {isLoadingManifest ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                      <Loader2 className="h-10 w-10 animate-spin" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">正在调取云端规范...</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate prose-sm max-w-none prose-headings:font-headline prose-headings:text-primary">
                       <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-slate-700 bg-muted/5 p-4 rounded-xl border border-border/40">
                         {manifestContent}
                       </pre>
                    </div>
                  )}
               </div>
               <div className="bg-muted/10 p-4 border-t flex justify-end shrink-0">
                 <DialogClose asChild>
                   <Button variant="ghost" className="rounded-xl px-8 font-bold uppercase text-[10px]">返回设计系统</Button>
                 </DialogClose>
               </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lab Environment Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">仅限开发者预览模式 • 不可用于生产环境外发</p>
        </div>
      </footer>
    </div>
  );
}

// 辅助组件：Label
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
