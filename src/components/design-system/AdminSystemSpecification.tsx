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
  PieChart,
  TrendingUp,
  ArrowUpRight,
  Sun, 
  Moon 
} from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';
import { TypographySpecification } from './TypographySpecification';
import { GeometrySpecification } from './GeometrySpecification';
import { ButtonSpecification } from './ButtonSpecification';
import { ControlSpecification } from './ControlSpecification';
import { InputSpecification } from './InputSpecification';
import { TableSpecification } from './TableSpecification';
import { TagSpecification } from './TagSpecification';
import { TreeSpecification } from './TreeSpecification';
import { PaginationSpecification } from './PaginationSpecification';
import { TabSpecification } from './TabSpecification';
import { FeedbackSpecification } from './FeedbackSpecification';
import { ExhibitionSpecification } from './ExhibitionSpecification';

export const AdminSystemSpecification = React.memo(() => {
  const [emailError, setEmailError] = useState("");
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [undoTarget, setUndoTarget] = useState("");
  const [generatedId, setGeneratedId] = useState("PROD_OLED_0423_X98K");
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

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

      {/* ─── 沿用前台规范说明横幅 ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 px-10 py-7 flex items-center gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-primary/5 to-transparent" />
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div className="relative">
          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">设计规范继承说明 (Shared Specification)</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            以下 <span className="font-bold text-primary">01–12</span> 章节为后台管理系统与前台系统共用的基础规范，直接沿用前台设计准则，确保产品视觉语言全链路一致性。
          </p>
        </div>
      </div>

      {/* ─── 01. 字体系统规范 (沿用前台) ─── */}
      <div id="admin-shared-01" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <TypographySpecification variant="backend" />
      </div>

      {/* ─── 02. 几何与投影规范 (沿用前台) ─── */}
      <div id="admin-shared-02" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <GeometrySpecification variant="backend" />
      </div>

      {/* ─── 03. 按钮系统规范 (沿用前台) ─── */}
      <div id="admin-shared-03" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <ButtonSpecification variant="backend" />
      </div>

      {/* ─── 04. 交互组件单元规范 (沿用前台) ─── */}
      <div id="admin-shared-04" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <ControlSpecification variant="backend" />
      </div>
      
      {/* ─── 05. 输入系统规范 (沿用前台) ─── */}
      <div id="admin-shared-05" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <InputSpecification variant="backend" />
      </div>

      {/* ─── 06. 表格系统规范 (沿用前台) ─── */}
      <div id="admin-shared-06" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <TableSpecification variant="backend" />
      </div>

      {/* ─── 07. 标签徽章规范 (沿用前台) ─── */}
      <div id="admin-shared-07" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <TagSpecification variant="backend" />
      </div>

      {/* ─── 08. 树形结构规范 (沿用前台) ─── */}
      <div id="admin-shared-08" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <TreeSpecification variant="backend" />
      </div>

      {/* ─── 09. 分页系统规范 (沿用前台) ─── */}
      <div id="admin-shared-09" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <PaginationSpecification variant="backend" />
      </div>

      {/* ─── 10. 选项卡系统规范 (沿用前台) ─── */}
      <div id="admin-shared-10" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <TabSpecification variant="backend" />
      </div>

      {/* ─── 11. 反馈与加载规范 (沿用前台) ─── */}
      <div id="admin-shared-11" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <FeedbackSpecification variant="backend" />
      </div>

      {/* ─── 12. 导航与展示规范 (沿用前台) ─── */}
      <div id="admin-shared-12" className="relative pb-16">
        <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span>↔</span>
          <span>沿用前台规范</span>
        </div>
        <ExhibitionSpecification variant="backend" />
      </div>

      {/* 13. AI 交互规范 */}
      <section id="admin-13" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">13. AI 交互规范 (AI Interaction)</h2>
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

          {/* AI-Aura 加载态 */}
          <div className="pt-16 border-t border-dashed border-border/60">
            <div className="flex items-center gap-3 mb-8">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">AI-Aura 加载与生成逻辑 (Aura Loading)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-primary">智算态输入框 (Active Aura)</Label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400 rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                  <Input
                    readOnly
                    defaultValue="正在智能生成内容..."
                    className="h-12 bg-white/80 border-primary/20 rounded-lg relative z-10 text-xs font-medium pl-10"
                  />
                  <div className="absolute left-3 inset-y-0 flex items-center z-20">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic">规范：激活 AI 任务时，Input 强制 Read-only 并开启流光外扩光晕。</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-primary">生成式骨架屏 (Generative Skeleton)</p>
                <div className="p-6 bg-muted/5 rounded-2xl border border-border/40 space-y-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  <div className="h-4 w-3/4 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                  <div className="h-4 w-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                  <div className="h-4 w-1/2 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                </div>
                <p className="text-[9px] text-muted-foreground italic">规范：不使用纯灰色，采用低饱和色彩梯度模拟生成感。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. 核心业务逻辑组件 */}
      <section id="admin-14" className="space-y-10 pb-40">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">14. 核心业务逻辑 (Business Logic)</h2>
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

      {/* 15. 数据看板与度量 */}
      <section id="admin-15" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">15. 数据看板与度量 (Dashboard & Metrics)</h2>
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
                <Badge variant="outline" className={stat.color + " border-none text-[11px] font-bold"}>{stat.trend}</Badge>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* 实时数据流 - 柱状图 */}
           <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                   <Gauge className="h-4 w-4 text-primary" />
                   <span className="text-[11px] font-bold text-primary uppercase tracking-widest">实时负载监控 (Live Load Monitor)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Monitoring Live</span>
                 </div>
              </div>
              
              <div className="flex-1 flex items-end gap-2 px-4 h-48">
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

           <div className="flex flex-col gap-6">
              {/* 周度趋势 - 折线图 */}
              <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-3.5 w-3.5 text-primary" />
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest">周度增长趋势</span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                 </div>

                 {/* SVG Line Chart */}
                 {(() => {
                   const linePoints = [
                     { x: 0,   y: 80, val: '$28k' },
                     { x: 40,  y: 30, val: '$52k' },
                     { x: 80,  y: 60, val: '$38k' },
                     { x: 120, y: 15, val: '$74k' },
                     { x: 160, y: 40, val: '$61k' },
                     { x: 200, y: 10, val: '$85k' },
                   ];
                   const smoothD = linePoints.reduce((acc, p, i, arr) => {
                     if (i === 0) return `M${p.x},${p.y}`;
                     const prev = arr[i - 1];
                     const cpx = (prev.x + p.x) / 2;
                     return acc + ` C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
                   }, '');

                   return (
                     <div className="relative" style={{ height: '160px' }}>
                       <svg
                         width="100%" height="100%"
                         viewBox="0 0 200 100"
                         preserveAspectRatio="xMidYMid meet"
                         className="overflow-visible cursor-crosshair"
                       >
                         <defs>
                           <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                             <stop offset="0%" stopColor="#005B99" />
                             <stop offset="100%" stopColor="#F97316" />
                           </linearGradient>
                           <clipPath id="line-clip">
                             <rect x="0" y="0" width="200" height="100" />
                           </clipPath>
                         </defs>

                         {/* Area fill */}
                         <path
                           d={smoothD + ` L200,100 L0,100 Z`}
                           fill="url(#line-grad)"
                           fillOpacity="0.06"
                           clipPath="url(#line-clip)"
                         />

                         {/* Line shadow */}
                         <path d={smoothD} fill="none" stroke="#005B99" strokeWidth="6" strokeOpacity="0.08" strokeLinecap="round" clipPath="url(#line-clip)" />

                         {/* Main line */}
                         <path d={smoothD} fill="none" stroke="url(#line-grad)" strokeWidth="3" strokeLinecap="round" clipPath="url(#line-clip)" />

                         {/* Data points */}
                         {linePoints.map((point, i) => (
                           <g key={i}
                             onMouseEnter={() => setHoveredLinePoint(i)}
                             onMouseLeave={() => setHoveredLinePoint(null)}
                             style={{ cursor: 'pointer' }}
                           >
                             {/* Hit area */}
                             <circle cx={point.x} cy={point.y} r="12" fill="transparent" />
                             {/* Point dot */}
                             <circle
                               cx={point.x} cy={point.y} r={hoveredLinePoint === i ? 5 : 3}
                               fill="white"
                               stroke={hoveredLinePoint === i ? '#005B99' : '#005B99'}
                               strokeWidth={hoveredLinePoint === i ? 2.5 : 1.5}
                               style={{ transition: 'r 0.2s ease' }}
                             />
                           </g>
                         ))}

                         {/* Tooltip — rendered last so it's on top */}
                         {hoveredLinePoint !== null && (() => {
                           const pt = linePoints[hoveredLinePoint];
                           const tipX = Math.min(Math.max(pt.x - 20, 0), 160);
                           const tipY = pt.y > 30 ? pt.y - 38 : pt.y + 12;
                           return (
                             <g>
                               <rect x={tipX} y={tipY} width="40" height="20" rx="6"
                                 fill="#005B99" />
                               <text x={tipX + 20} y={tipY + 13.5} textAnchor="middle"
                                 fill="white" fontSize="9" fontWeight="700">
                                 {pt.val}
                               </text>
                             </g>
                           );
                         })()}
                       </svg>
                     </div>
                   );
                 })()}

                 <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">+24.8%</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Vs Last Week</span>
                 </div>
              </div>

              {/* 市场分布 - 环形图 */}
              <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col">
                 <div className="flex items-center gap-2 mb-6">
                    <PieChart className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">终端分布 (Terminals)</span>
                 </div>
                 <div className="flex items-center gap-6">
                    {/* Donut chart */}
                    {(() => {
                      const slices = [
                        { label: 'OLED Series', pct: 70, color: '#005B99' },
                        { label: 'Industrial P', pct: 20, color: '#F97316' },
                        { label: 'Others', pct: 10, color: '#94a3b8' },
                      ];
                      const r = 15.9;
                      const circ = 2 * Math.PI * r; // ~99.9
                      let offset = 0;
                      return (
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Track */}
                            <circle cx="18" cy="18" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
                            {slices.map((slice, i) => {
                              const dash = (slice.pct / 100) * circ;
                              const gap = circ - dash;
                              const el = (
                                <circle
                                  key={i}
                                  cx="18" cy="18" r={r}
                                  fill="none"
                                  stroke={slice.color}
                                  strokeWidth={hoveredSlice === i ? 5 : 4}
                                  strokeDasharray={`${dash} ${gap}`}
                                  strokeDashoffset={-offset}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-width 0.2s ease, opacity 0.2s ease', cursor: 'pointer', opacity: hoveredSlice !== null && hoveredSlice !== i ? 0.35 : 1 }}
                                  onMouseEnter={() => setHoveredSlice(i)}
                                  onMouseLeave={() => setHoveredSlice(null)}
                                />
                              );
                              offset += dash;
                              return el;
                            })}
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                              {hoveredSlice !== null ? (
                                <>
                                  <span className="text-[11px] font-bold block" style={{ color: slices[hoveredSlice].color }}>{slices[hoveredSlice].pct}%</span>
                                  <span className="text-[7px] font-bold text-muted-foreground uppercase leading-tight block">{slices[hoveredSlice].label.split(' ')[0]}</span>
                                </>
                              ) : (
                                <span className="text-[12px] font-bold text-primary">70%</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Legend */}
                    <div className="space-y-2">
                       {[
                         { label: 'OLED Series', color: 'bg-primary', hoverColor: 'group-hover/legend:text-primary', idx: 0 },
                         { label: 'Industrial P', color: 'bg-orange-500', hoverColor: 'group-hover/legend:text-orange-500', idx: 1 },
                         { label: 'Others', color: 'bg-slate-400', hoverColor: 'group-hover/legend:text-slate-500', idx: 2 },
                       ].map((item) => (
                         <div
                           key={item.idx}
                           className="flex items-center gap-2 group/legend cursor-pointer"
                           onMouseEnter={() => setHoveredSlice(item.idx)}
                           onMouseLeave={() => setHoveredSlice(null)}
                         >
                           <div className={`h-2 w-2 rounded-full ${item.color} transition-transform ${hoveredSlice === item.idx ? 'scale-150' : ''}`} />
                           <span className={`text-[8px] font-bold uppercase transition-colors ${hoveredSlice === item.idx ? item.hoverColor.replace('group-hover/legend:', '') : 'text-muted-foreground'}`}>{item.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 16. 高级列表与过滤 */}
      <section id="admin-16" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">16. 高级列表与过滤 (Advanced Filtering)</h2>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">过滤工具栏布局 (Filter Bar)</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search records..." className="h-10 pl-9 w-64 bg-muted/10 border-none rounded-lg text-[10px] uppercase font-bold tracking-widest" />
               </div>
               <Button variant="outline" className="h-10 px-4 rounded-lg text-[10px] font-bold uppercase border-border/40">
                  <Settings className="h-3.5 w-3.5 mr-2" />
                  Filters
               </Button>
            </div>
          </div>
          
          <div className="p-20 bg-muted/5 rounded-[2rem] border border-dashed border-border/60 flex flex-col items-center justify-center space-y-6">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 w-10 rounded-full bg-white border-2 border-muted/20 flex items-center justify-center text-primary font-bold text-xs">{i}</div>)}
             </div>
             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Multi-level Filtering Logic Active</p>
          </div>
        </div>
      </section>

      {/* 17. 详情面板与抽屉 */}
      <section id="admin-17" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">17. 详情面板与抽屉 (Detail Panels)</h2>
        </div>

        <div className="flex gap-10">
           <div className="flex-1 bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed">
                 主列表区域 (Main List Content)
              </p>
           </div>
           <div className="w-[400px] bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-primary/10 shadow-2xl space-y-8 animate-in slide-in-from-right-10">
              <div className="flex items-center justify-between border-b pb-6">
                 <h4 className="text-sm font-bold text-primary uppercase">Detail Inspector</h4>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><X className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-6">
                 <div className="h-32 bg-muted/5 rounded-2xl border border-dashed border-border/60" />
                 <div className="space-y-2">
                    <div className="h-3 w-1/2 bg-primary/10 rounded-full" />
                    <div className="h-3 w-full bg-muted/10 rounded-full" />
                    <div className="h-3 w-3/4 bg-muted/10 rounded-full" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 18. 权限与审计 */}
      <section id="admin-18" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">18. 权限与审计 (Permissions & Logs)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">角色语义化标签 (Role Semantics)</span>
              </div>
              <div className="flex flex-wrap gap-4">
                 <Badge className="bg-green-500/10 text-green-600 border-green-200 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">Administrator</Badge>
                 <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">Editor</Badge>
                 <Badge className="bg-slate-500/10 text-slate-600 border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">Viewer</Badge>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <History className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">审计时间轴 (Audit Trail)</span>
              </div>
              <div className="space-y-6 relative">
                 <div className="absolute left-[15px] top-2 bottom-2 w-px bg-muted/40 border-dashed border-l" />
                 {[1, 2].map(i => (
                    <div key={i} className="flex gap-6 items-start relative z-10 group cursor-pointer">
                       <div className="h-8 w-8 rounded-full bg-white border border-border/60 flex items-center justify-center shrink-0 group-hover:scale-125 transition-transform group-hover:border-primary group-hover:shadow-lg">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                       </div>
                       <div className="pt-1">
                          <p className="text-[10px] font-bold text-primary uppercase">User Login Action</p>
                          <p className="text-[9px] text-muted-foreground uppercase">2024.06.12 14:20:05</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 19. 异常流与撤销机制 */}
      <section id="admin-19" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">19. 异常流与撤销机制 (Exceptions & Undo)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 即时校验演示 */}
          <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">即时校验反馈 (Validation)</span>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase text-primary">Support Email</Label>
              <div className="relative">
                <Input
                  placeholder="admin@heovose.com"
                  onBlur={(e) => {
                    if (!e.target.value.includes('@')) setEmailError("Invalid email format (admin usage)");
                    else setEmailError("");
                  }}
                  className={cn(
                    "h-10 text-xs rounded-lg transition-all",
                    emailError ? "bg-rose-500/5 border-rose-500/50 focus:ring-rose-500/10" : "bg-muted/20 border-border/60"
                  )}
                />
                {emailError && (
                  <p className="mt-2 text-[9px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {emailError}
                  </p>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground italic uppercase">规范：强制采用 OnBlur 校验，错误态应用 5% 透明度红色背景。</p>
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
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>

              {/* Undo Toast Concept */}
              {showUndoToast && (
                <div className="absolute inset-x-10 bottom-10 animate-in slide-in-from-bottom-10 duration-500">
                  <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 animate-spin" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{undoTarget} 已移动至回收站</p>
                    </div>
                    <Button variant="ghost" className="h-8 px-4 text-[10px] font-bold uppercase text-white hover:bg-white/10 rounded-lg">Undo (5s)</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 20. 缺省页、加载态与通知反馈 */}
      <section id="admin-20" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">20. 缺省页、加载态与通知反馈</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Light Theme Reference */}
          <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Light Mode (Default)</span>
            </div>
            <div className="p-8 bg-muted/5 rounded-2xl space-y-4">
              <div className="h-10 bg-white border border-border/60 rounded-lg" />
              <div className="h-24 bg-white border border-border/60 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-10 flex-1 bg-primary rounded-lg" />
                <div className="h-10 flex-1 bg-muted/20 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Dark Mode Concept */}
          <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-8">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Dark Mode (Concept)</span>
            </div>
            <div className="p-8 bg-slate-900/50 rounded-2xl space-y-4 border border-slate-800">
              <div className="h-10 bg-slate-900 border border-slate-700/50 rounded-lg" />
              <div className="h-24 bg-slate-900 border border-slate-700/50 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-10 flex-1 bg-cyan-600 rounded-lg shadow-lg shadow-cyan-900/20" />
                <div className="h-10 flex-1 bg-slate-800 rounded-lg" />
              </div>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/20 animate-pulse" />
                    <div className="flex-1 space-y-2">
                       <div className="h-3 w-1/3 bg-muted/20 rounded-full" />
                       <div className="h-3 w-full bg-muted/10 rounded-full" />
                    </div>
                 </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 italic uppercase">
              暗色模式规范：强制使用 Slate-900/950 背景。高亮色建议使用高饱和 Accent（如 Cyan-400），边框透明度提升至 15%。
            </p>
          </div>
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

          {/* AI-Aura 加载态 */}
          <div className="pt-16 border-t border-dashed border-border/60">
            <div className="flex items-center gap-3 mb-8">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">AI-Aura 加载与生成逻辑 (Aura Loading)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-primary">智算态输入框 (Active Aura)</Label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400 rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                  <Input
                    readOnly
                    defaultValue="正在智能生成内容..."
                    className="h-12 bg-white/80 border-primary/20 rounded-lg relative z-10 text-xs font-medium pl-10"
                  />
                  <div className="absolute left-3 inset-y-0 flex items-center z-20">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic">规范：激活 AI 任务时，Input 强制 Read-only 并开启流光外扩光晕。</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-primary">生成式骨架屏 (Generative Skeleton)</p>
                <div className="p-6 bg-muted/5 rounded-2xl border border-border/40 space-y-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  <div className="h-4 w-3/4 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                  <div className="h-4 w-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                  <div className="h-4 w-1/2 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-rose-500/10 rounded-full" />
                </div>
                <p className="text-[9px] text-muted-foreground italic">规范：不使用纯灰色，采用低饱和色彩梯度模拟生成感。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. 核心业务逻辑组件 */}
      <section id="admin-14" className="space-y-10 pb-40">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">14. 核心业务逻辑 (Business Logic)</h2>
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

      {/* 15. 数据看板与度量 */}
      <section id="admin-15" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">15. 数据看板与度量 (Dashboard & Metrics)</h2>
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
                <Badge variant="outline" className={stat.color + " border-none text-[11px] font-bold"}>{stat.trend}</Badge>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* 实时数据流 - 柱状图 */}
           <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                   <Gauge className="h-4 w-4 text-primary" />
                   <span className="text-[11px] font-bold text-primary uppercase tracking-widest">实时负载监控 (Live Load Monitor)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Monitoring Live</span>
                 </div>
              </div>
              
              <div className="flex-1 flex items-end gap-2 px-4 h-48">
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

           <div className="flex flex-col gap-6">
              {/* 周度趋势 - 折线图 */}
              <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-3.5 w-3.5 text-primary" />
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest">周度增长趋势</span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                 </div>

                 {/* SVG Line Chart */}
                 {(() => {
                   const linePoints = [
                     { x: 0,   y: 80, val: '$28k' },
                     { x: 40,  y: 30, val: '$52k' },
                     { x: 80,  y: 60, val: '$38k' },
                     { x: 120, y: 15, val: '$74k' },
                     { x: 160, y: 40, val: '$61k' },
                     { x: 200, y: 10, val: '$85k' },
                   ];
                   const smoothD = linePoints.reduce((acc, p, i, arr) => {
                     if (i === 0) return `M${p.x},${p.y}`;
                     const prev = arr[i - 1];
                     const cpx = (prev.x + p.x) / 2;
                     return acc + ` C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
                   }, '');

                   return (
                     <div className="relative" style={{ height: '160px' }}>
                       <svg
                         width="100%" height="100%"
                         viewBox="0 0 200 100"
                         preserveAspectRatio="xMidYMid meet"
                         className="overflow-visible cursor-crosshair"
                       >
                         <defs>
                           <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                             <stop offset="0%" stopColor="#005B99" />
                             <stop offset="100%" stopColor="#F97316" />
                           </linearGradient>
                           <clipPath id="line-clip">
                             <rect x="0" y="0" width="200" height="100" />
                           </clipPath>
                         </defs>

                         {/* Area fill */}
                         <path
                           d={smoothD + ` L200,100 L0,100 Z`}
                           fill="url(#line-grad)"
                           fillOpacity="0.06"
                           clipPath="url(#line-clip)"
                         />

                         {/* Line shadow */}
                         <path d={smoothD} fill="none" stroke="#005B99" strokeWidth="6" strokeOpacity="0.08" strokeLinecap="round" clipPath="url(#line-clip)" />

                         {/* Main line */}
                         <path d={smoothD} fill="none" stroke="url(#line-grad)" strokeWidth="3" strokeLinecap="round" clipPath="url(#line-clip)" />

                         {/* Data points */}
                         {linePoints.map((point, i) => (
                           <g key={i}
                             onMouseEnter={() => setHoveredLinePoint(i)}
                             onMouseLeave={() => setHoveredLinePoint(null)}
                             style={{ cursor: 'pointer' }}
                           >
                             {/* Hit area */}
                             <circle cx={point.x} cy={point.y} r="12" fill="transparent" />
                             {/* Point dot */}
                             <circle
                               cx={point.x} cy={point.y} r={hoveredLinePoint === i ? 5 : 3}
                               fill="white"
                               stroke={hoveredLinePoint === i ? '#005B99' : '#005B99'}
                               strokeWidth={hoveredLinePoint === i ? 2.5 : 1.5}
                               style={{ transition: 'r 0.2s ease' }}
                             />
                           </g>
                         ))}

                         {/* Tooltip — rendered last so it's on top */}
                         {hoveredLinePoint !== null && (() => {
                           const pt = linePoints[hoveredLinePoint];
                           const tipX = Math.min(Math.max(pt.x - 20, 0), 160);
                           const tipY = pt.y > 30 ? pt.y - 38 : pt.y + 12;
                           return (
                             <g>
                               <rect x={tipX} y={tipY} width="40" height="20" rx="6"
                                 fill="#005B99" />
                               <text x={tipX + 20} y={tipY + 13.5} textAnchor="middle"
                                 fill="white" fontSize="9" fontWeight="700">
                                 {pt.val}
                               </text>
                             </g>
                           );
                         })()}
                       </svg>
                     </div>
                   );
                 })()}

                 <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">+24.8%</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Vs Last Week</span>
                 </div>
              </div>

              {/* 市场分布 - 环形图 */}
              <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col">
                 <div className="flex items-center gap-2 mb-6">
                    <PieChart className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">终端分布 (Terminals)</span>
                 </div>
                 <div className="flex items-center gap-6">
                    {/* Donut chart */}
                    {(() => {
                      const slices = [
                        { label: 'OLED Series', pct: 70, color: '#005B99' },
                        { label: 'Industrial P', pct: 20, color: '#F97316' },
                        { label: 'Others', pct: 10, color: '#94a3b8' },
                      ];
                      const r = 15.9;
                      const circ = 2 * Math.PI * r; // ~99.9
                      let offset = 0;
                      return (
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Track */}
                            <circle cx="18" cy="18" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
                            {slices.map((slice, i) => {
                              const dash = (slice.pct / 100) * circ;
                              const gap = circ - dash;
                              const el = (
                                <circle
                                  key={i}
                                  cx="18" cy="18" r={r}
                                  fill="none"
                                  stroke={slice.color}
                                  strokeWidth={hoveredSlice === i ? 5 : 4}
                                  strokeDasharray={`${dash} ${gap}`}
                                  strokeDashoffset={-offset}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-width 0.2s ease, opacity 0.2s ease', cursor: 'pointer', opacity: hoveredSlice !== null && hoveredSlice !== i ? 0.35 : 1 }}
                                  onMouseEnter={() => setHoveredSlice(i)}
                                  onMouseLeave={() => setHoveredSlice(null)}
                                />
                              );
                              offset += dash;
                              return el;
                            })}
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                              {hoveredSlice !== null ? (
                                <>
                                  <span className="text-[11px] font-bold block" style={{ color: slices[hoveredSlice].color }}>{slices[hoveredSlice].pct}%</span>
                                  <span className="text-[7px] font-bold text-muted-foreground uppercase leading-tight block">{slices[hoveredSlice].label.split(' ')[0]}</span>
                                </>
                              ) : (
                                <span className="text-[12px] font-bold text-primary">70%</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Legend */}
                    <div className="space-y-2">
                       {[
                         { label: 'OLED Series', color: 'bg-primary', hoverColor: 'group-hover/legend:text-primary', idx: 0 },
                         { label: 'Industrial P', color: 'bg-orange-500', hoverColor: 'group-hover/legend:text-orange-500', idx: 1 },
                         { label: 'Others', color: 'bg-slate-400', hoverColor: 'group-hover/legend:text-slate-500', idx: 2 },
                       ].map((item) => (
                         <div
                           key={item.idx}
                           className="flex items-center gap-2 group/legend cursor-pointer"
                           onMouseEnter={() => setHoveredSlice(item.idx)}
                           onMouseLeave={() => setHoveredSlice(null)}
                         >
                           <div className={`h-2 w-2 rounded-full ${item.color} transition-transform ${hoveredSlice === item.idx ? 'scale-150' : ''}`} />
                           <span className={`text-[8px] font-bold uppercase transition-colors ${hoveredSlice === item.idx ? item.hoverColor.replace('group-hover/legend:', '') : 'text-muted-foreground'}`}>{item.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 16. 高级列表与过滤 */}
      <section id="admin-16" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">16. 高级列表与过滤 (Advanced Filtering)</h2>
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

      {/* 17. 详情面板与抽屉 */}
      <section id="admin-17" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">17. 详情面板与抽屉 (Detail Panels)</h2>
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

      {/* 18. 权限与审计 (Permissions & Logs) */}
      <section id="admin-18" className="space-y-10 pb-40">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">18. 权限与审计 (Permissions & Logs)</h2>
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

      {/* 19. 异常流与撤销机制 (Exceptions & Undo) */}
      <section id="admin-19" className="space-y-10 pb-40">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">19. 异常流与撤销机制 (Exceptions & Undo)</h2>
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

<<<<<<< HEAD
      {/* 10 & 11. 缺省页、加载态与通知反馈 (Empty States, Loading & Notifications) */}
      <section id="admin-10-11" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">10 & 11. 缺省页、加载态与通知反馈</h2>
=======
      {/* 20. 缺省页、加载与反馈 (Empty States & Feedback) */}
      <section id="admin-20" className="space-y-10 pb-20">
        <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
          <div className="h-2 w-10 bg-primary rounded-full" />
          <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">20. 缺省页、加载与反馈 (Empty States & Feedback)</h2>
>>>>>>> a00e2da (refactor: optimize admin design system structure, sync shared components and update manifest v2.0)
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Light Theme Reference */}
          <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Light Mode (Default)</span>
            </div>
            <div className="p-8 bg-muted/5 rounded-2xl space-y-4">
              <div className="h-10 bg-white border border-border/60 rounded-lg" />
              <div className="h-24 bg-white border border-border/60 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-10 flex-1 bg-primary rounded-lg" />
                <div className="h-10 flex-1 bg-muted/20 rounded-lg" />
              </div>
            </div>
          </div>

<<<<<<< HEAD
          {/* Dark Mode Concept */}
          <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-8">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Dark Mode (Concept)</span>
            </div>
            <div className="p-8 bg-slate-900/50 rounded-2xl space-y-4 border border-slate-800">
              <div className="h-10 bg-slate-900 border border-slate-700/50 rounded-lg" />
              <div className="h-24 bg-slate-900 border border-slate-700/50 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-10 flex-1 bg-cyan-600 rounded-lg shadow-lg shadow-cyan-900/20" />
                <div className="h-10 flex-1 bg-slate-800 rounded-lg" />
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

      {/* 11. 通知与反馈系统 (Feedback & Notifications) */}
      <section id="admin-11" className="space-y-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Toast 演示 */}
           <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10">
=======
           {/* Notification Feedback & Loading */}
           <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-sm space-y-10 overflow-hidden relative">
>>>>>>> a00e2da (refactor: optimize admin design system structure, sync shared components and update manifest v2.0)
              <div className="flex items-center gap-3">
                 <Bell className="h-4 w-4 text-primary" />
                 <span className="text-[11px] font-bold text-primary uppercase tracking-widest">通知系统反馈 (Notification Feedback)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { type: 'Success', msg: '设置已同步', color: 'bg-green-500', icon: CheckCircle2 },
                   { type: 'Error', msg: '连接超时', color: 'bg-rose-500', icon: ShieldAlert },
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

