"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { 
  Layers, 
  LayoutGrid, 
  MousePointer2, 
  Sparkles, 
  Cpu, 
  Wand2, 
  Terminal, 
  GalleryHorizontal, 
  Monitor, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  User, 
  Activity, 
  Clock, 
  Gauge, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  X, 
  Layout, 
  ShieldCheck, 
  History, 
  Settings, 
  Trash2, 
  AlertTriangle, 
  AlertCircle, 
  RotateCcw, 
  Ghost, 
  Loader2, 
  Bell, 
  ShieldAlert, 
  Info, 
  ChevronDown, 
  Smartphone, 
  PanelLeftOpen, 
  PanelLeftClose, 
  Maximize, 
  LineChart, 
  Sun, 
  Moon 
} from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';

export const AdminSystemSpecification = React.memo(() => {
  const [emailError, setEmailError] = useState("");
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [undoTarget, setUndoTarget] = useState("");
  const [generatedId, setGeneratedId] = useState("PROD_OLED_0423_X98K");
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const generateId = () => {
    const categories = ["OLED", "AIO", "MINI", "PRO", "HW"];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const date = new Date();
    const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let random = '';
    for (let i = 0; i < 4; i++) random += chars.charAt(Math.floor(Math.random() * chars.length));
    setGeneratedId(`PROD_${cat}_${mmdd}_${random}`);
  };

  return (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 01. 视觉语言与布局 */}
      <section id="admin-01" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">01. 视觉语言与布局 (Visual Identity)</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 圆角阶梯 */}
          <div className="bg-white p-10 rounded-[2rem] border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">圆角阶梯标准 (Radius)</span>
            </div>
            <div className="space-y-6">
              <div className="p-8 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center">
                <span className="text-[10px] font-bold uppercase opacity-60">容器级 (rounded-2xl)</span>
              </div>
              <div className="p-6 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-center">
                <span className="text-[10px] font-bold uppercase opacity-60">内嵌级 (rounded-xl)</span>
              </div>
              <Button className="w-full h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest">组件级 (rounded-lg)</Button>
            </div>
          </div>

          {/* 布局空间 */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[2rem] border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">全局间距与吸顶准则 (Spacing & Sticky)</span>
            </div>
            <div className="relative h-64 bg-muted/10 rounded-2xl border border-dashed border-border p-6 overflow-hidden">
               <div className="absolute top-0 left-6 right-6 h-10 bg-white/80 backdrop-blur-md border border-primary/20 rounded-b-xl flex items-center px-4 shadow-sm z-20 translate-y-2">
                  <span className="text-[9px] font-bold text-primary uppercase">Sticky Header: top-[-24px] 抵消内边距</span>
               </div>
               <div className="h-full flex items-center justify-center text-center">
                  <p className="text-[10px] text-muted-foreground uppercase leading-relaxed max-w-xs">
                    AdminLayout 统一内边距 p-6 (24px)。<br/>
                    板块头部统一 border-b pb-4 mb-6 结构。
                  </p>
               </div>
               <div className="absolute inset-0 border-[24px] border-primary/5 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 02. 字体与表单系统 */}
      <section id="admin-02" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. 字体与表单规范 (Typography & Forms)</h2>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             <div className="space-y-4">
               <Label className="text-[10px] font-bold uppercase tracking-wider text-primary">Product Name</Label>
               <Input placeholder="Enter product name (text-xs)" className="h-10 text-xs bg-muted/20 border-border/60 rounded-lg" />
               <p className="text-[9px] text-muted-foreground italic">规范：表单内容与 Placeholder 强制对齐 text-xs。</p>
             </div>
             <div className="space-y-4">
               <Label className="text-[10px] font-bold uppercase tracking-wider text-primary">Category Select</Label>
               <Select>
                 <SelectTrigger className="h-10 text-xs bg-muted/20 border-border/60 rounded-lg">
                   <SelectValue placeholder="Select Category" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-border/40">
                   <SelectItem value="display" className="text-xs">Display Panels</SelectItem>
                   <SelectItem value="server" className="text-xs">Barebone Servers</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-4">
               <Label className="text-[10px] font-bold uppercase tracking-wider text-primary">Switch Status</Label>
               <div className="h-10 flex items-center px-4 bg-muted/20 border border-border/60 rounded-lg justify-between">
                 <span className="text-xs text-muted-foreground uppercase">Visibility</span>
                 <Switch className="scale-75" />
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 03. 控件状态准则 */}
      <section id="admin-03" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. 控件状态准则 (Control States)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
             <div className="flex items-center gap-3">
                <MousePointer2 className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Focus & Interaction</span>
             </div>
             <div className="space-y-6">
                <div className="space-y-3">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">聚焦态背景微调 (Focus BG Logic)</p>
                   <Input 
                     defaultValue="Focus me to see background shift" 
                     className="h-10 text-xs bg-muted/20 border-border/60 rounded-lg focus:bg-muted/10 focus:ring-4 focus:ring-primary/5 transition-all" 
                   />
                   <p className="text-[9px] text-muted-foreground italic">规范：聚焦时背景由 bg-muted/20 变为 bg-muted/10。</p>
                </div>
                <div className="flex gap-4">
                   <Button variant="outline" className="flex-1 h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest border-border/60 hover:bg-muted/20">Default</Button>
                   <Button className="flex-1 h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Active</Button>
                </div>
             </div>
          </div>

          <div className="bg-muted/10 p-10 rounded-[2.5rem] border border-dashed border-border/60 flex items-center justify-center text-center">
             <p className="text-[10px] text-muted-foreground uppercase leading-relaxed max-w-xs">
               管理后台控件严禁使用纯白背景。<br/>
               所有交互元素必须具备明确的物理边界，以在复杂表单中保持可识别性。
             </p>
          </div>
        </div>
      </section>

      {/* 04. AI 交互规范 */}
      <section id="admin-04" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. AI 交互规范 (AI Interaction)</h2>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-16 overflow-hidden relative">
           <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                   <Sparkles className="h-4 w-4 text-primary" />
                   <span className="text-[11px] font-bold text-primary uppercase tracking-widest">极光动效标准 (Aurora Glow)</span>
                 </div>
                 <div className="p-16 rounded-[2.5rem] bg-muted/10 border border-primary/10 flex flex-col items-center justify-center space-y-10 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <ShinyButton className="scale-150 shadow-2xl shadow-primary/10">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-sm">AI-Aurora Spec</span>
                      </div>
                    </ShinyButton>

                    <div className="text-center space-y-3 relative z-10">
                       <p className="text-[12px] font-bold uppercase text-primary tracking-widest">AI-Aurora System v2.0</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] max-w-[280px] leading-relaxed">
                         4 色非线性极光渐变 + 物理级弹性旋转动画 + 呼吸感点阵纹理
                       </p>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                   <Wand2 className="h-4 w-4 text-primary" />
                   <span className="text-[11px] font-bold text-primary uppercase tracking-widest">智译按钮形态 (Smart Translate)</span>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-12">
                    <div className="space-y-4">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Premium AI Mode (Capsule)</p>
                      <div className="flex flex-wrap gap-4 items-center">
                        <ShinyButton shape="capsule" className="h-9 py-0">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>AI 智译</span>
                          </div>
                        </ShinyButton>
                        
                        <ShinyButton shape="capsule" className="h-9 py-0">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>智译</span>
                          </div>
                        </ShinyButton>

                        <ShinyButton shape="capsule" className="w-9 h-9 !p-0 flex items-center justify-center">
                          <Sparkles className="h-4 w-4" />
                        </ShinyButton>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Premium AI Mode (Rounded Rectangle)</p>
                      <div className="flex flex-wrap gap-4 items-center">
                        <ShinyButton shape="rounded" className="h-9 py-0">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>AI 智译</span>
                          </div>
                        </ShinyButton>
                        
                        <ShinyButton shape="rounded" className="h-9 py-0">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>智译</span>
                          </div>
                        </ShinyButton>

                        <ShinyButton shape="rounded" className="w-9 h-9 !p-0 flex items-center justify-center">
                          <Sparkles className="h-4 w-4" />
                        </ShinyButton>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Premium AI Mode (Disabled State)</p>
                      <div className="flex flex-wrap gap-4 items-center">
                        <ShinyButton shape="capsule" disabled className="h-9 py-0">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>AI 智译</span>
                          </div>
                        </ShinyButton>
                        
                        <ShinyButton shape="rounded" disabled className="h-9 py-0">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>智译</span>
                          </div>
                        </ShinyButton>

                        <ShinyButton shape="capsule" disabled className="w-9 h-9 !p-0 flex items-center justify-center">
                          <Sparkles className="h-4 w-4" />
                        </ShinyButton>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                        设计说明：智译按钮采用最高级视觉规格（Shiny CTA），通过自定义 CSS 变量驱动的 Conic-Gradient 实现流光效果，辅以 Radial-Gradient 点阵纹理，增强 AI 模块的权威感。
                      </p>
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* 05. 核心业务逻辑组件 */}
      <section id="admin-05" className="space-y-10 pb-40">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">05. 核心业务逻辑 (Business Logic)</h2>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
           {/* ID 生成演示 */}
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">产品 ID 生成准则 (ID Generator)</span>
              </div>
              <div className="p-8 bg-muted/5 rounded-[2rem] border border-border/40 flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-primary uppercase">{generatedId}</p>
                   <p className="text-[9px] text-muted-foreground uppercase">格式：PROD_分类_月日_随机码</p>
                 </div>
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateId}
                    className="rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    Generate New ID
                  </Button>
              </div>
           </div>

           {/* 媒体素材中心模拟 */}
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                <GalleryHorizontal className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">媒体素材中心规范 (Media Center)</span>
              </div>
              <div className="space-y-6">
                 <div className="h-[240px] flex gap-4 overflow-x-auto pb-4 scrollbar-minimal">
                    <div className="shrink-0 w-[320px] rounded-2xl bg-muted/20 border-2 border-primary/20 flex flex-col items-center justify-center relative group overflow-hidden">
                       <span className="absolute top-4 left-4 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-10">MAIN COVER</span>
                       <Monitor className="h-12 w-12 text-primary/20" />
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="shrink-0 w-[200px] rounded-2xl bg-muted/5 border border-border/40 flex flex-col items-center justify-center relative group overflow-hidden">
                         <div className="absolute bottom-4 inset-x-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg"><ChevronLeft className="h-4 w-4" /></Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg"><ChevronRight className="h-4 w-4" /></Button>
                         </div>
                         <span className="text-[10px] font-bold text-muted-foreground/20 italic">GALLERY 0{i}</span>
                      </div>
                    ))}
                 </div>
                 <p className="text-[9px] text-muted-foreground leading-relaxed italic bg-muted/5 p-4 rounded-xl border border-border/20">
                    规范建议：素材中心固定高度 240px，副图支持横向滚动。所有 Flex 子项必须强制声明 min-w-0 以防止溢出。
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 06. 数据看板与度量 */}
      <section id="admin-06" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">06. 数据看板与度量 (Dashboard & Metrics)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue', value: '$1.28M', trend: '+12.5%', color: 'text-green-500', icon: ShoppingBag },
            { label: 'Active Users', value: '4,820', trend: '+3.2%', color: 'text-blue-500', icon: User },
            { label: 'System Health', value: '99.9%', trend: 'Stable', color: 'text-primary', icon: Activity },
            { label: 'Pending Orders', value: '124', trend: '-2.4%', color: 'text-orange-500', icon: Clock }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm space-y-4 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className={stat.color + " border-none text-[8px] font-bold"}>{stat.trend}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
              </div>
              <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary/40 w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">实时数据流模拟 (Live Data Metrics)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-bold uppercase text-muted-foreground">Monitoring Live</span>
              </div>
           </div>
           
           <div className="h-48 flex items-end gap-2 px-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/10 rounded-t-lg group relative hover:bg-primary/40 transition-all cursor-crosshair"
                  style={{ height: `${20 + Math.random() * 80}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="bg-primary text-white text-[8px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {Math.floor(Math.random() * 1000)} QPS
                     </div>
                  </div>
                </div>
              ))}
           </div>
           <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="text-[8px] font-bold text-muted-foreground uppercase">00:00</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase">12:00</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase">23:59</span>
           </div>
        </div>
      </section>

      {/* 07. 高级列表与过滤 */}
      <section id="admin-07" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">07. 高级列表与过滤 (Advanced Filtering)</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
           {/* 高级过滤工具栏 */}
           <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between pb-6 border-b border-dashed border-border/60">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="搜索产品、订单或 SKU..." className="h-10 pl-10 text-xs bg-muted/10 border-none rounded-xl" />
                </div>
                <Button variant="outline" className="h-10 rounded-xl gap-2 text-[10px] font-bold uppercase border-border/60">
                   <Filter className="h-3.5 w-3.5" /> 更多筛选
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="h-10 px-4 rounded-xl bg-muted/20 border border-border/60 flex items-center gap-3">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">状态:</span>
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold">ALL SYSTEMS</Badge>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                 </div>
                 <Button className="h-10 rounded-xl px-6 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" /> 新增记录
                 </Button>
              </div>
           </div>

           {/* 批量操作工具栏 (模拟激活态) */}
           <div className="p-4 bg-primary text-white rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-top-4">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">已选中 12 个项目</span>
                 </div>
                 <div className="h-6 w-px bg-white/10" />
                 <div className="flex items-center gap-4">
                    <button className="text-[9px] font-bold uppercase hover:text-accent transition-colors">批量导出</button>
                    <button className="text-[9px] font-bold uppercase hover:text-accent transition-colors">修改状态</button>
                    <button className="text-[9px] font-bold uppercase text-rose-300 hover:text-rose-400 transition-colors">彻底删除</button>
                 </div>
              </div>
              <button className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                 <X className="h-4 w-4" />
              </button>
           </div>
           
           <p className="text-[9px] text-muted-foreground italic text-center">
              交互规范：当列表进入多选模式时，批量操作栏应从顶部滑出，背景采用品牌色（Primary）以产生强烈的交互提示。
           </p>
        </div>
      </section>

      {/* 08. 详情面板与抽屉 */}
      <section id="admin-08" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">08. 详情面板与抽屉 (Detail Panels)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-border/40 shadow-sm overflow-hidden relative min-h-[500px]">
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-primary uppercase tracking-widest">主列表区域 (Background Content)</h3>
                    <Button variant="outline" className="h-8 rounded-lg text-[9px] font-bold uppercase">Open Drawer Demo</Button>
                 </div>
                 <div className="space-y-4 opacity-20 select-none">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted/20 rounded-xl border border-dashed border-border" />
                    ))}
                 </div>
              </div>

              {/* 模拟右侧抽屉 */}
              <div className="absolute inset-y-0 right-0 w-[400px] bg-white/80 backdrop-blur-2xl border-l border-white/40 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-700">
                 <div className="p-8 border-b border-primary/5 shrink-0 flex items-center justify-between">
                    <div>
                       <h4 className="text-sm font-bold text-primary uppercase tracking-widest">产品详情预览</h4>
                       <p className="text-[9px] text-muted-foreground uppercase mt-1">ID: PROD_X98K_0423</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-primary hover:bg-primary/5">
                       <X className="h-5 w-5" />
                    </Button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-minimal">
                    <div className="aspect-video rounded-2xl bg-muted/10 border-2 border-dashed border-primary/20 flex items-center justify-center">
                       <Monitor className="h-10 w-10 text-primary/20" />
                    </div>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-primary">Product Name</Label>
                          <p className="text-xs font-bold">Heovose X-Series Pro 24"</p>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-primary">Technical Specs</Label>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-muted/5 rounded-xl border border-border/40">
                                <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">CPU</p>
                                <p className="text-[10px] font-bold">Intel i7-12Gen</p>
                             </div>
                             <div className="p-4 bg-muted/5 rounded-xl border border-border/40">
                                <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">RAM</p>
                                <p className="text-[10px] font-bold">32GB DDR5</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-8 border-t border-primary/5 bg-muted/5 flex gap-4 shrink-0">
                    <Button className="flex-1 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px]">保存修改</Button>
                    <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px]">取消</Button>
                 </div>
              </div>
           </div>

           <div className="bg-primary p-10 rounded-[2.5rem] text-white flex flex-col justify-center space-y-6 shadow-2xl shadow-primary/20">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                 <Layout className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">分层预览准则</h3>
              <p className="text-xs leading-relaxed opacity-80">
                侧滑抽屉 (Drawer) 宽度固定为 400px - 600px，必须具备 `backdrop-blur-2xl` 背景，以确保在复杂列表之上依然具备可读性。
                所有编辑操作均应在抽屉内完成，而非直接在列表中进行行内编辑。
              </p>
           </div>
        </div>
      </section>

      {/* 09. 权限与审计日志 */}
      <section id="admin-09" className="space-y-10 pb-40">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">09. 权限与审计 (Permissions & Logs)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* 权限控制矩阵 */}
           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">角色权限管理 (Permission Matrix)</span>
              </div>
              
              <div className="space-y-4">
                 {[
                   { role: 'Admin', module: 'System Config', access: 'FULL ACCESS', color: 'bg-green-500' },
                   { role: 'Editor', module: 'Content Ops', access: 'WRITE/EDIT', color: 'bg-blue-500' },
                   { role: 'Viewer', module: 'Analytics', access: 'READ ONLY', color: 'bg-muted-foreground' }
                 ].map((p, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-border/40 group hover:border-primary/40 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={cn("h-2 w-2 rounded-full", p.color)} />
                         <div>
                            <p className="text-[10px] font-bold uppercase text-primary">{p.role}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">{p.module}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <Badge className={cn("text-[8px] font-bold border-none", p.color + "/10", p.color.replace('bg-', 'text-'))}>
                            {p.access}
                         </Badge>
                         <Switch className="scale-75" defaultChecked={p.role !== 'Viewer'} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* 审计时间轴 */}
           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10 relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                 <History className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">全域审计日志 (Audit Timeline)</span>
              </div>
              
              <div className="space-y-8 pl-4 relative z-10">
                 <div className="absolute left-[23px] top-4 bottom-4 w-px bg-dashed-border bg-[linear-gradient(to_bottom,transparent_50%,#e5e7eb_50%)] bg-[length:1px_8px] repeat-y" />
                 
                 {[
                   { user: 'Admin_1572', action: 'Update System Policy', time: '10:42 AM', icon: Settings },
                   { user: 'Editor_Li', action: 'Delete Media Asset #09', time: '09:15 AM', icon: Trash2 },
                   { user: 'System', action: 'Auto-backup Completed', time: '04:00 AM', icon: ShieldCheck }
                 ].map((log, i) => (
                   <div key={i} className="flex gap-6 items-start relative group">
                      <div className="h-5 w-5 rounded-full bg-white border-2 border-primary flex items-center justify-center shrink-0 relative z-10 group-hover:scale-125 transition-transform">
                         <log.icon className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary uppercase">{log.user}</span>
                            <span className="text-[8px] text-muted-foreground font-mono">{log.time}</span>
                         </div>
                         <p className="text-[11px] font-medium text-slate-600">{log.action}</p>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
           </div>
        </div>
      </section>

      {/* 10. 异常流与撤销机制 */}
      <section id="admin-10" className="space-y-10 pb-40">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">10. 异常流与撤销机制 (Exceptions & Undo)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* 即时校验演示 */}
           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10">
              <div className="flex items-center gap-3">
                 <AlertTriangle className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">即时校验与反馈 (Instant Validation)</span>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary">邮箱地址 (验证 OnBlur 逻辑)</Label>
                    <div className="relative">
                       <Input 
                         onBlur={(e) => {
                           if (!e.target.value.includes('@')) {
                             setEmailError("请输入有效的电子邮件地址（必须包含 @）");
                           } else {
                             setEmailError("");
                           }
                         }}
                         className={cn(
                           "h-12 rounded-2xl transition-all",
                           emailError ? "border-destructive bg-destructive/5 text-destructive focus:ring-destructive/10" : "bg-muted/10 border-transparent focus:bg-white"
                         )}
                         placeholder="admin@example.com"
                       />
                       {emailError && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive animate-in zoom-in" />}
                    </div>
                    {emailError && (
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-tight animate-in slide-in-from-top-1">
                        {emailError}
                      </p>
                    )}
                 </div>
                 
                 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-[9px] text-muted-foreground leading-relaxed uppercase">
                      交互标准：采用“失焦校验”而非实时校验，避免用户正在输入时频繁报错。
                    </p>
                 </div>
              </div>
           </div>

           {/* 撤销机制演示 */}
           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10 relative overflow-hidden">
              <div className="flex items-center gap-3">
                 <RotateCcw className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">操作撤销机制 (Undo Mechanism)</span>
              </div>
              
              <div className="space-y-8">
                 <div className="flex items-center justify-between p-6 bg-muted/5 rounded-2xl border border-dashed border-border/60">
                    <div>
                       <p className="text-[10px] font-bold text-primary uppercase">项目：工业一体机 H24-P</p>
                       <p className="text-[9px] text-muted-foreground uppercase">最后修改：2024.06.05</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 px-4 rounded-xl text-[10px] font-bold uppercase"
                      onClick={() => {
                        setUndoTarget("工业一体机 H24-P");
                        setShowUndoToast(true);
                        setTimeout(() => setShowUndoToast(false), 5000);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> 模拟删除
                    </Button>
                 </div>

                 {/* 模拟 Undo Toast */}
                 {showUndoToast && (
                   <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-10 duration-500 z-50">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">已成功移除项目：{undoTarget}</span>
                      </div>
                      <button 
                        onClick={() => setShowUndoToast(false)}
                        className="bg-white/20 hover:bg-white/40 px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] transition-all"
                      >
                        撤销操作 (UNDO)
                      </button>
                   </div>
                 )}

                 <div className="p-4 bg-muted/20 rounded-xl">
                    <p className="text-[9px] text-muted-foreground leading-relaxed uppercase">
                      交互标准：删除操作后不应立即弹窗确认，而是通过提供 5-10 秒的“撤销”时间窗来平衡效率与安全。
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 11. 缺省页与加载态规范 */}
      <section id="admin-11" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">11. 缺省页与加载态 (Empty States & Loading)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Empty State */}
           <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center relative">
                 <Ghost className="h-10 w-10 text-primary/20" />
                 <div className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-full animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-sm font-bold text-primary uppercase tracking-widest">未检索到相关指令</h3>
                 <p className="text-[10px] text-muted-foreground uppercase leading-relaxed max-w-[240px]">
                   请尝试调整搜索条件，或确认您是否具备该模块的访问权限。
                 </p>
              </div>
              <Button variant="outline" className="h-10 rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest border-primary/20 text-primary hover:bg-primary/5">
                 重置搜索条件
              </Button>
           </div>

           {/* Skeleton Loading */}
           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
              <div className="flex items-center gap-3 mb-4">
                 <Loader2 className="h-4 w-4 text-primary animate-spin" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">骨架屏标准 (Skeleton Layout)</span>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/20 animate-pulse" />
                    <div className="space-y-2 flex-1">
                       <div className="h-3 w-1/3 bg-muted/20 rounded animate-pulse" />
                       <div className="h-2 w-1/2 bg-muted/10 rounded animate-pulse" />
                    </div>
                 </div>
                 <div className="h-32 bg-muted/10 rounded-2xl animate-pulse" />
                 <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-muted/20 rounded-xl animate-pulse" />
                    <div className="h-10 bg-muted/20 rounded-xl animate-pulse" />
                    <div className="h-10 bg-muted/20 rounded-xl animate-pulse" />
                 </div>
              </div>
           </div>
         </div>
      </section>

      {/* 12. 全局通知与反馈系统 */}
      <section id="admin-12" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">12. 通知与反馈系统 (Feedback & Notifications)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Toast 演示 */}
           <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10">
              <div className="flex items-center gap-3">
                 <Bell className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Toast 通知变体 (Notification Variants)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { type: 'Success', msg: '设置已同步至云端', color: 'bg-green-500', icon: CheckCircle2 },
                   { type: 'Error', msg: '数据库连接超时 (504)', color: 'bg-rose-500', icon: ShieldAlert },
                   { type: 'Warning', msg: '系统内存占用已达 85%', color: 'bg-orange-500', icon: AlertTriangle },
                   { type: 'Info', msg: '新的固件版本已就绪', color: 'bg-blue-500', icon: Info }
                 ].map(t => (
                   <button 
                     key={t.type}
                     onClick={() => {
                        setActiveToast(t.type);
                        setTimeout(() => setActiveToast(null), 3000);
                     }}
                     className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-border/40 hover:border-primary/40 transition-all group"
                   >
                      <div className="flex items-center gap-3">
                         <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white", t.color)}>
                            <t.icon className="h-4 w-4" />
                         </div>
                         <div className="text-left">
                            <p className="text-[10px] font-bold text-primary uppercase">{t.type}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">{t.msg}</p>
                         </div>
                      </div>
                      <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                 ))}
              </div>
              
              {/* Active Toast Visualization */}
              {activeToast && (
                <div className="absolute top-10 right-10 z-[120] animate-in slide-in-from-right-10 duration-500">
                  <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 flex items-center gap-6 min-w-[320px]">
                     <div className={cn(
                       "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                       activeToast === 'Success' ? 'bg-green-500' : 
                       activeToast === 'Error' ? 'bg-rose-500' : 
                       activeToast === 'Warning' ? 'bg-orange-500' : 'bg-blue-500'
                     )}>
                        <Activity className="h-6 w-6" />
                     </div>
                     <div>
                        <h5 className="text-xs font-bold text-primary uppercase tracking-widest">{activeToast} Notification</h5>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">System feedback protocol active.</p>
                     </div>
                  </div>
                </div>
              )}
           </div>

           <div className="bg-muted/10 p-10 rounded-[3rem] border border-dashed border-border/60 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-2">
                 <ShieldAlert className="h-4 w-4 text-primary" />
                 <span className="text-[10px] font-bold uppercase">交互层级规范</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed">
                全域通知必须采用 Glassmorphism 准则。<br/>
                Admin 系统的 Toast 建议悬浮于右上角，层级设为 z-[120] 以上。
              </p>
           </div>
        </div>
      </section>
    </div>
  );
});
