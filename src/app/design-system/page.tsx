
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Checkbox 
} from "@/components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Switch
} from "@/components/ui/switch";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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
  Zap,
  Layers,
  ShieldCheck,
  FileText,
  Type,
  Loader2,
  X,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  TableProperties,
  ArrowUpRight,
  History,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldAlert,
  Terminal,
  Clock,
  Wand2,
  Hammer,
  ListChecks,
  Gauge,
  Box,
  Maximize,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Info,
  Plus,
  Download,
  Mail,
  ChevronRight,
  MoreHorizontal,
  ChevronDown,
  User,
  Lock,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Filter,
  Play,
  RotateCcw,
  Activity,
  Workflow,
  Move,
  Tag,
  XCircle,
  Folder,
  File,
  ChevronDown as ChevronDownIcon
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getFrontendManifest } from './actions';
import { Progress } from '@/components/ui/progress';

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
  const [showPassword, setShowPassword] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 树形菜单状态模拟
  const [treeExpanded, setTreeExpanded] = useState<Set<string>>(new Set(['root', 'products']));

  const toggleTree = (id: string) => {
    const next = new Set(treeExpanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setTreeExpanded(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedRows(next);
  };

  const loadManifest = async () => {
    setIsLoadingManifest(true);
    const res = await getFrontendManifest();
    if (res.success) {
      setManifestContent(res.content);
    }
    setIsLoadingManifest(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-40 font-body">
      <AiGradientDef />
      
      {/* 顶部系统切换器 */}
      <header className="bg-white border-b border-border/40 sticky top-0 z-[110] px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest leading-none">Heovose Design Lab</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60 mt-1">视觉实验室 • 核心版本 v1.9.8</p>
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

            {/* 02. 几何与投影规范定义 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">02. 几何与投影规范定义</h2>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                   <div className="space-y-8">
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Box className="h-4 w-4" /> 边框阶梯与样式 (Stroke & Style)</span>
                     <div className="space-y-6">
                       <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-3">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase">实线系列 (Solid Borders)</p>
                           <div className="flex items-center gap-6">
                             <div className="h-14 w-32 border border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">1px</div>
                             <div className="h-14 w-32 border-2 border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">2px</div>
                             <div className="h-14 w-32 border-4 border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">4px</div>
                           </div>
                         </div>
                         <div className="space-y-3">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase">虚线系列 (Dashed Borders)</p>
                           <div className="flex items-center gap-6">
                             <div className="h-14 w-32 border border-dashed border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">1px Dashed</div>
                             <div className="h-14 w-32 border-2 border-dashed border-primary rounded-xl bg-muted/5 flex items-center justify-center font-mono text-[10px] font-bold">2px Dashed</div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-8">
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Maximize className="h-4 w-4" /> 圆角阶梯标准 (Radius Standard)</span>
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="space-y-2">
                          <div className="h-32 w-full rounded-none bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">0px</div>
                          <p className="text-[9px] font-bold uppercase">无圆角 (Sharp)</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-32 w-full rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">8px</div>
                          <p className="text-[9px] font-bold uppercase">小圆角 (lg)</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-32 w-full rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">16px</div>
                          <p className="text-[9px] font-bold uppercase">大圆角 (2xl)</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-32 w-full rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">40px</div>
                          <p className="text-[9px] font-bold uppercase text-primary">超级圆角 (Brand)</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-32 w-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary/60">Pill</div>
                          <p className="text-[9px] font-bold uppercase">圆形圆角 (Full)</p>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="pt-16 border-t border-dashed border-border/60">
                   <div className="flex items-center gap-3 mb-10">
                     <Layers className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">阴影投影阶梯 (Shadow Hierarchy)</span>
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
                          <p className="text-[10px] font-bold uppercase">强调浮动</p>
                          <p className="text-[9px] text-muted-foreground">用于激活态卡片、产品详情展示区。</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-32 bg-white rounded-2xl shadow-2xl border border-border/20 flex items-center justify-center font-mono text-[10px] font-bold uppercase text-primary/40">shadow-2xl</div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase">全局深度</p>
                          <p className="text-[9px] text-muted-foreground">用于全局导航、Hero 屏悬浮视觉块。</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 04. 按钮系统规范定义 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. 按钮系统规范定义</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Maximize className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">4.1 物理尺寸阶梯 (Size Scale)</span>
                  </div>
                  <div className="flex items-end gap-6 flex-wrap">
                    <div className="space-y-3">
                      <Button className="h-7 px-2 text-[9px] font-bold uppercase rounded-md">Extra Small</Button>
                      <p className="text-[9px] text-center font-mono opacity-40">XS / 28px</p>
                    </div>
                    <div className="space-y-3">
                      <Button className="h-9 px-4 text-[10px] font-bold uppercase rounded-lg">Small Action</Button>
                      <p className="text-[9px] text-center font-mono opacity-40">SM / 36px</p>
                    </div>
                    <div className="space-y-3">
                      <Button className="h-11 px-8 text-xs font-bold uppercase rounded-xl shadow-md">Default Button</Button>
                      <p className="text-[9px] text-center font-mono opacity-40">BASE / 44px</p>
                    </div>
                    <div className="space-y-3">
                      <Button className="h-14 px-12 text-sm font-bold uppercase rounded-2xl shadow-xl">Large Display</Button>
                      <p className="text-[9px] text-center font-mono opacity-40">LG / 56px</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">4.2 状态语义按钮 (Status Matrix)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest border-l-2 border-green-600 pl-2">Safety / 安全</p>
                      <div className="space-y-2">
                        <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> 确认提交</Button>
                        <Button variant="outline" className="w-full h-11 border-green-600 text-green-600 hover:bg-green-50 rounded-xl font-bold text-[10px] uppercase">线性样式</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-l-2 border-blue-600 pl-2">Info / 信息</p>
                      <div className="space-y-2">
                        <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><Info className="h-3.5 w-3.5" /> 查看详情</Button>
                        <Button variant="outline" className="w-full h-11 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-[10px] uppercase">辅助引导</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest border-l-2 border-orange-600 pl-2">Warning / 警告</p>
                      <div className="space-y-2">
                        <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><AlertCircle className="h-3.5 w-3.5" /> 谨慎操作</Button>
                        <Button variant="outline" className="w-full h-11 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl font-bold text-[10px] uppercase">风险提示</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-widest border-l-2 border-destructive pl-2">Danger / 危险</p>
                      <div className="space-y-2">
                        <Button className="w-full h-11 bg-destructive hover:bg-destructive/90 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><Trash2 className="h-3.5 w-3.5" /> 永久删除</Button>
                        <Button variant="outline" className="w-full h-11 border-destructive text-destructive hover:bg-destructive/5 rounded-xl font-bold text-[10px] uppercase">撤销更改</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l-2 border-muted pl-2">Disabled / 禁用</p>
                      <div className="space-y-2">
                        <Button disabled className="w-full h-11 rounded-xl font-bold text-[10px] uppercase">锁定状态</Button>
                        <Button disabled variant="outline" className="w-full h-11 rounded-xl font-bold text-[10px] uppercase">无法点击</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">4.3 纯图标与混合交互</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button size="icon" className="h-12 w-12 rounded-full bg-primary text-white shadow-lg"><Plus className="h-6 w-6" /></Button>
                      <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl border-primary text-primary"><Search className="h-5 w-5" /></Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"><MoreHorizontal className="h-5 w-5" /></Button>
                      <div className="h-10 w-px bg-border mx-4" />
                      <Button className="h-12 px-6 rounded-2xl bg-muted/30 text-primary border-none font-bold text-[10px] uppercase gap-3 hover:bg-primary hover:text-white transition-all group/spec">
                        <Download className="h-4 w-4 opacity-40 group-hover/spec:opacity-100 transition-opacity group-hover/spec:text-white" /> <span className="group-hover/spec:text-white">规格书下载</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">4.4 模组化按钮组 (Button Groups)</span>
                    </div>
                    <div className="flex">
                       <div className="inline-flex rounded-2xl border border-border/60 bg-muted/20 p-1 gap-1 overflow-hidden">
                         <button className="h-10 px-4 rounded-xl bg-primary text-white hover:text-white text-[10px] font-bold uppercase shadow-sm">Grid View</button>
                         <button className="h-10 px-4 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-bold uppercase">List View</button>
                         <button className="h-10 px-4 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-bold uppercase">Table</button>
                       </div>
                    </div>
                    <div className="flex">
                       <div className="inline-flex rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
                         <Button variant="ghost" size="icon" className="h-10 w-10 border-r rounded-none hover:bg-white hover:text-primary transition-colors"><AlignLeft className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-10 w-10 border-r rounded-none hover:bg-white hover:text-primary transition-colors"><AlignCenter className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none hover:bg-white hover:text-primary transition-colors"><AlignRight className="h-4 w-4" /></Button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 07. 交互组件单元规范 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">07. 交互组件单元规范</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  <div className="space-y-12">
                    <div className="space-y-8">
                       <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 多选框规范 (Checkbox Matrix)</p>
                       <div className="flex flex-wrap gap-12">
                          <div className="flex items-center space-x-3">
                            <Checkbox id="c-interactive" className="h-5 w-5 rounded-md" defaultChecked />
                            <Label htmlFor="c-interactive" className="text-xs font-bold uppercase text-primary cursor-pointer">可交互展示 (Interactive)</Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox id="c-disabled" disabled className="h-5 w-5 rounded-md" />
                            <Label htmlFor="c-disabled" className="text-xs font-bold uppercase opacity-20">禁用态 (Disabled)</Label>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> 单选框规范 (Radio Group)</p>
                       <div className="flex flex-wrap gap-12">
                         <RadioGroup defaultValue="r-demo-1" className="flex items-center gap-12">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="r-demo-1" id="r1" className="h-5 w-5" />
                              <Label htmlFor="r1" className="text-xs font-bold uppercase text-primary cursor-pointer">选项 A (Active)</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="r-demo-2" id="r2" className="h-5 w-5" />
                              <Label htmlFor="r2" className="text-xs font-bold uppercase text-primary cursor-pointer">选项 B (Normal)</Label>
                            </div>
                         </RadioGroup>
                         <div className="flex items-center space-x-3 opacity-20">
                            <div className="h-5 w-5 rounded-full border border-primary flex items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
                            </div>
                            <Label className="text-xs font-bold uppercase">锁定 (Disabled)</Label>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="space-y-8">
                       <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Zap className="h-4 w-4" /> 开关按钮规范 (Toggle Switch)</p>
                       <div className="flex flex-wrap gap-12">
                          <div className="flex items-center space-x-4">
                            <Switch defaultChecked className="scale-110" id="s-interactive" />
                            <Label htmlFor="s-interactive" className="text-xs font-bold uppercase text-primary cursor-pointer">可交互开关 (Toggle)</Label>
                          </div>
                          <div className="flex items-center space-x-4 opacity-40">
                            <Switch disabled className="scale-110" />
                            <Label className="text-xs font-bold uppercase">锁定 (Disabled)</Label>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><ChevronDown className="h-4 w-4" /> 菜单选择规范 (Dropdowns)</p>
                       <div className="flex flex-wrap gap-6">
                          <div className="space-y-2 w-48">
                            <Label className="text-[9px] font-bold uppercase opacity-40">标准选择器 (Select)</Label>
                            <Select defaultValue="en">
                              <SelectTrigger className="h-11 rounded-xl border-border/60 text-[11px] font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-2xl border-none">
                                <SelectItem value="zh" className="text-xs font-medium">中文简体 (ZH)</SelectItem>
                                <SelectItem value="en" className="text-xs font-medium">English (EN)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 w-48">
                            <Label className="text-[9px] font-bold uppercase opacity-40">多级下拉 (Cascader)</Label>
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full h-11 rounded-xl justify-between px-4 text-[11px] font-bold border-border/60">
                                  项目分类 <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="z-[200] w-56 p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl">
                                <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3">业务垂直领域</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/10" />
                                <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-primary/5 focus:bg-primary/5">零售终端</DropdownMenuItem>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-primary/5 focus:bg-primary/5">
                                    工业制造
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="z-[200] p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl">
                                    <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold">工业一体机</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold">嵌入式盒子</DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold">医疗显控</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 08. 输入系统规范 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">08. 输入系统规范</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Maximize className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">8.1 高度尺寸标准 (Input Scale)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase opacity-40">Extra Small / 28px</Label>
                      <Input className="h-7 text-[10px] rounded-md" placeholder="XS Input..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase opacity-40">Small / 36px</Label>
                      <Input className="h-9 text-[11px] rounded-lg" placeholder="SM Input..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase opacity-40">Default / 44px</Label>
                      <Input className="h-11 text-xs rounded-xl" placeholder="Base Input..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase opacity-40">Large / 56px</Label>
                      <Input className="h-14 text-sm rounded-2xl" placeholder="LG Input..." />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-10">
                    <div className="space-y-8">
                       <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Hash className="h-4 w-4" /> 复合型输入框 (Composite Inputs)</span>
                       <div className="space-y-6">
                         <div className="space-y-2">
                           <Label className="text-[9px] font-bold uppercase opacity-40">Icon Prefix / 搜索模式</Label>
                           <div className="relative">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                             <Input className="h-12 pl-12 rounded-2xl bg-muted/10 border-none shadow-inner" placeholder="输入搜索关键词..." />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <Label className="text-[9px] font-bold uppercase opacity-40">Password with Toggle / 密码态</Label>
                           <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                             <Input 
                               type={showPassword ? "text" : "password"} 
                               className="h-12 pl-12 pr-12 rounded-2xl" 
                               placeholder="请输入登录密码" 
                               defaultValue="secure_password_123"
                             />
                             <button 
                               onClick={() => setShowPassword(!showPassword)}
                               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                             >
                               {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                             </button>
                           </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase opacity-40">Action Suffix / 组合模式</Label>
                            <div className="flex gap-2">
                               <Input className="h-12 rounded-2xl flex-1" placeholder="Enter coupon code..." />
                               <Button className="h-12 px-6 rounded-2xl uppercase font-bold text-[10px] tracking-widest">Apply</Button>
                            </div>
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-8">
                       <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> 状态逻辑展示 (State Matrix)</span>
                       <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-destructive">Error State / 校验失败</Label>
                            <div className="relative">
                               <Input className="h-12 rounded-2xl border-destructive bg-destructive/5 text-destructive focus-visible:ring-destructive/10" defaultValue="invalid_email@format" />
                               <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                            </div>
                            <p className="text-[9px] font-bold text-destructive uppercase tracking-tight">请输入有效的电子邮件地址</p>
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase opacity-40">Disabled State / 禁用锁定</Label>
                            <Input disabled className="h-12 rounded-2xl" defaultValue="readonly_data_field" />
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase opacity-40">Multi-line Textarea / 多行文本</Label>
                            <Textarea className="min-h-[120px] rounded-lg px-3 py-2 text-xs leading-relaxed" placeholder="在此输入详细的硬件项目需求说明..." />
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 09. 表格系统规范 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">09. 表格系统规范</h2>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {/* 9.1 基础与状态展示 */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><TableProperties className="h-4 w-4" /> 9.1 基础形态与业务状态 (Styles & Status)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">斑马纹带状态表格 (Zebra with Status)</p>
                      <div className="rounded-2xl border overflow-hidden shadow-sm">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="text-[9px] font-bold uppercase tracking-widest pl-6">ID</TableHead>
                              <TableHead className="text-[9px] font-bold uppercase tracking-widest">任务名称</TableHead>
                              <TableHead className="text-[9px] font-bold uppercase tracking-widest pr-6">当前进度</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="even:bg-muted/20 hover:bg-primary/5 transition-colors">
                              <TableCell className="text-xs font-mono pl-6 opacity-40">#001</TableCell>
                              <TableCell>
                                 <div className="flex flex-col">
                                   <span className="text-xs font-bold">核心主板 SMT 贴片</span>
                                   <Badge className="w-fit mt-1 h-4 text-[7px] bg-green-50 text-green-700 border-green-200">运行中 / LIVE</Badge>
                                 </div>
                              </TableCell>
                              <TableCell className="pr-6 w-32">
                                 <div className="space-y-1.5">
                                    <div className="flex justify-between text-[8px] font-bold uppercase"><span className="opacity-40">Progress</span><span>85%</span></div>
                                    <Progress value={85} className="h-1" />
                                 </div>
                              </TableCell>
                            </TableRow>
                            <TableRow className="even:bg-muted/20 hover:bg-primary/5 transition-colors">
                              <TableCell className="text-xs font-mono pl-6 opacity-40">#002</TableCell>
                              <TableCell>
                                 <div className="flex flex-col">
                                   <span className="text-xs font-bold">24寸屏体老化测试</span>
                                   <Badge variant="outline" className="w-fit mt-1 h-4 text-[7px] bg-orange-50 text-orange-700 border-orange-200">待检 / WAITING</Badge>
                                 </div>
                              </TableCell>
                              <TableCell className="pr-6 w-32">
                                 <div className="space-y-1.5">
                                    <div className="flex justify-between text-[8px] font-bold uppercase"><span className="opacity-40">Progress</span><span>12%</span></div>
                                    <Progress value={12} className="h-1 [&>div]:bg-orange-400" />
                                 </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">无边框与极简状态 (Borderless & Minimal)</p>
                      <Table>
                        <TableHeader className="border-b-2 border-primary/10">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[9px] font-bold uppercase text-primary">工程参数</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase text-primary text-right">监控指标</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-b-0 hover:bg-primary/5 transition-colors">
                            <TableCell className="text-xs font-medium flex items-center gap-2">
                               <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> 电压稳定性 (V_IN)
                            </TableCell>
                            <TableCell className="text-xs text-right font-mono font-bold text-primary">220.4 V</TableCell>
                          </TableRow>
                          <TableRow className="border-b-0 hover:bg-primary/5 transition-colors">
                            <TableCell className="text-xs font-medium flex items-center gap-2">
                               <div className="h-1.5 w-1.5 rounded-full bg-destructive" /> 环境湿度控制
                            </TableCell>
                            <TableCell className="text-xs text-right font-mono font-bold text-destructive">68.2% RH</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* 9.2 固定表头与固定列 */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Maximize className="h-4 w-4" /> 9.2 固定表头与固定列 (Sticky & Fixed)</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* 固定表头型 */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">固定表头型 (Sticky Header / Y-Axis)</p>
                      <div className="rounded-2xl border border-separate border-spacing-0 overflow-hidden shadow-inner bg-white relative">
                        <div className="max-h-[300px] overflow-y-auto scrollbar-minimal">
                          <Table className="border-separate border-spacing-0">
                            <TableHeader>
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md font-bold text-[9px] uppercase pl-6 py-4 border-b border-border/60">检测项</TableHead>
                                <TableHead className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md font-bold text-[9px] uppercase py-4 border-b border-border/60">检测时间</TableHead>
                                <TableHead className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md font-bold text-[9px] uppercase pr-6 py-4 text-right border-b border-border/60">结果</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 15 }).map((_, i) => (
                                <TableRow key={i} className="hover:bg-muted/5 transition-colors border-b">
                                  <TableCell className="text-xs font-bold pl-6 py-4 flex items-center gap-2 bg-white">
                                     <div className="w-1.5 h-1.5 rounded-full bg-primary/20" /> QA_STEP_{100 + i}
                                  </TableCell>
                                  <TableCell className="text-[10px] opacity-40 font-mono bg-white">2024.06.05 14:00:{i < 10 ? `0${i}` : i}</TableCell>
                                  <TableCell className="pr-6 text-right font-bold text-green-600 text-[10px] uppercase bg-white">Pass</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    {/* 固定列型 */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">固定首列型 (Fixed Column / X-Axis)</p>
                      <div className="rounded-2xl border border-separate border-spacing-0 overflow-hidden shadow-inner bg-white relative">
                        <div className="max-w-full overflow-x-auto scrollbar-minimal">
                          <div className="min-w-[800px]">
                            <Table className="border-separate border-spacing-0">
                              <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-b">
                                  <TableHead className="sticky left-0 top-0 z-50 bg-muted font-bold text-[9px] uppercase pl-6 border-r border-border/60 py-4 shadow-[2px_0_10px_rgba(0,0,0,0.05)]">核心产品型号 (Fixed)</TableHead>
                                  <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">主板架构</TableHead>
                                  <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">显示规格</TableHead>
                                  <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">内存通道</TableHead>
                                  <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">存储插槽</TableHead>
                                  <TableHead className="text-[9px] font-bold uppercase pr-6 text-right py-4 bg-muted/30">发布时间</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[
                                  { model: 'Heovose H24 Pro', arch: 'Intel Alder Lake', disp: '23.8" IPS 1080P', mem: 'DDR4 Dual', storage: '2x M.2 NVMe', date: '2024 Q3' },
                                  { model: 'Mini M10 Lite', arch: 'AMD Ryzen 5000', disp: 'N/A (Mini PC)', mem: 'SO-DIMM DDR4', storage: '1x M.2 + 1x SATA', date: '2024 Q2' },
                                  { model: 'X-Station Ultra', arch: 'Intel Core i9', disp: '32" 4K HDR', mem: 'DDR5 6400', storage: '4x M.2 Gen5', date: '2024 Q4' },
                                ].map((row, i) => (
                                  <TableRow key={i} className="hover:bg-primary/5 group transition-colors border-b">
                                    <TableCell className="sticky left-0 z-30 bg-white font-bold text-xs pl-6 border-r border-border/60 py-4 shadow-[2px_0_10px_rgba(0,0,0,0.05)] group-hover:bg-muted/10">{row.model}</TableCell>
                                    <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.arch}</TableCell>
                                    <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.disp}</TableCell>
                                    <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.mem}</TableCell>
                                    <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.storage}</TableCell>
                                    <TableCell className="text-[10px] font-mono font-bold pr-6 text-right uppercase py-4 bg-white group-hover:bg-transparent">{row.date}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 9.3 深度交互与逻辑展开 */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Workflow className="h-4 w-4" /> 9.3 深度交互与逻辑展开 (Advanced Interaction)</span>
                  </div>

                  <div className="grid grid-cols-1 gap-12">
                    {/* 多级复合表头与排序 */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <p className="text-[10px] font-bold text-muted-foreground uppercase">多级表头与动态排序 (Multi-level & Sort)</p>
                         <Badge variant="outline" className="text-[8px] h-5"><Filter className="h-2.5 w-2.5 mr-1" /> ACTIVE ANALYTICS</Badge>
                       </div>
                       <div className="rounded-2xl border overflow-hidden shadow-sm">
                         <Table>
                           <TableHeader className="bg-muted/30">
                             <TableRow className="hover:bg-transparent border-none">
                               <TableHead rowSpan={2} className="pl-6 border-r font-bold text-[9px] uppercase tracking-tighter w-48">制造业务线 (Lines)</TableHead>
                               <TableHead colSpan={2} className="text-center border-b border-r font-bold text-[9px] uppercase tracking-widest py-3 bg-primary/5">库存与物流状态</TableHead>
                               <TableHead rowSpan={2} className="font-bold text-[9px] uppercase pr-6 text-right">
                                  <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-primary transition-colors">
                                    最后审计时间 <ArrowDown className="h-3 w-3" />
                                  </div>
                               </TableHead>
                             </TableRow>
                             <TableRow className="hover:bg-transparent">
                               <TableHead className="text-[8px] font-bold uppercase text-center border-r py-2">仓储实存</TableHead>
                               <TableHead className="text-[8px] font-bold uppercase text-center border-r py-2">在途订单</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {[
                               { name: 'All-in-One Series', stock: '1,240', transit: '300', time: '2 mins ago' },
                               { name: 'Mini PC Series', stock: '850', transit: '120', time: '14 mins ago' },
                               { name: 'Industrial Displays', stock: '430', transit: '45', time: '1 hour ago' },
                               { name: 'Touch Panel Kits', stock: '2,100', transit: '600', time: '5 mins ago' },
                               { name: 'Server Barebones', stock: '120', transit: '12', time: '4 hours ago' }
                             ].map((row, i) => (
                               <TableRow key={i} className="hover:bg-primary/5 transition-colors">
                                 <TableCell className="pl-6 font-bold text-xs border-r">{row.name}</TableCell>
                                 <TableCell className="text-center border-r font-mono text-xs font-bold text-primary">{row.stock}</TableCell>
                                 <TableCell className="text-center border-r font-mono text-xs opacity-60">{row.transit}</TableCell>
                                 <TableCell className="text-[10px] opacity-40 pr-6 uppercase text-right">{row.time}</TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                       </div>
                    </div>

                    {/* 展开行型交互 */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">可展开详情行 (Expandable Row Interaction)</p>
                      <div className="rounded-2xl border overflow-hidden shadow-md">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow className="border-none">
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="text-[9px] font-bold uppercase tracking-widest">订单 ID</TableHead>
                              <TableHead className="text-[9px] font-bold uppercase tracking-widest">终端客户</TableHead>
                              <TableHead className="text-[9px] font-bold uppercase tracking-widest pr-6 text-right">订单估值 (USD)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              { id: 'ord-1', code: '#ORD-2024-0051', client: 'Amazon EU Distribution', value: '$42,500.00', addr: 'Rue de Rivoli 75, Paris, France', items: 'H24 Pro x50, Mini M10 x120' },
                              { id: 'ord-2', code: '#ORD-2024-0052', client: 'Tesla R&D Center', value: '$18,200.00', addr: '3500 Deer Creek Rd, Palo Alto, USA', items: 'Custom Touch Panels x12, GPU Kits x5' },
                              { id: 'ord-3', code: '#ORD-2024-0053', client: 'Samsung Global Logistics', value: '$156,000.00', addr: 'Gyeonggi-do, South Korea', items: 'AIO Barebones x400, SSD Bulk x800' },
                              { id: 'ord-4', code: '#ORD-2024-0054', client: 'Siemens Industrial Automation', value: '$9,400.00', addr: 'Werner-von-Siemens-Straße, Munich, DE', items: 'IP65 Monitors x20' },
                              { id: 'ord-5', code: '#ORD-2024-0055', client: 'Google Mountain View HQ', value: '$21,000.00', addr: '1600 Amphitheatre Pkwy, CA, USA', items: 'Micro PC Prototypes x30' }
                            ].map((row) => (
                              <React.Fragment key={row.id}>
                                <TableRow 
                                  className={cn("cursor-pointer transition-all duration-300", expandedRows.has(row.id) ? "bg-primary/5" : "hover:bg-muted/10")} 
                                  onClick={() => toggleRow(row.id)}
                                >
                                  <TableCell className="pl-4">
                                    <ChevronRight className={cn("h-4 w-4 transition-transform duration-500", expandedRows.has(row.id) && "rotate-90 text-primary")} />
                                  </TableCell>
                                  <TableCell className="text-xs font-mono font-bold text-primary">{row.code}</TableCell>
                                  <TableCell className="text-xs font-medium">{row.client}</TableCell>
                                  <TableCell className="text-xs font-mono font-bold pr-6 text-right text-primary">{row.value}</TableCell>
                                </TableRow>
                                {expandedRows.has(row.id) && (
                                  <TableRow className="bg-muted/5 border-b-2 border-primary/10 animate-in fade-in slide-in-from-top-4 duration-700">
                                    <TableCell colSpan={4} className="p-8">
                                      <div className="grid grid-cols-3 gap-12">
                                        <div className="space-y-2">
                                          <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">配送地址 / SHIPPING</p>
                                          <p className="text-xs font-medium leading-relaxed">{row.addr}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">物料清单 / ITEMS</p>
                                          <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">{row.items}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">结算状态 / STATUS</p>
                                          <Badge className="h-5 text-[8px] font-bold bg-green-500 text-white border-none uppercase">Verified & Paid</Badge>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. 标签与徽章系统规范 */}
            <section className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">10. 标签与徽章系统规范</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  {/* 语义状态 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.1 语义状态矩阵 (Semantic States)</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="space-y-2">
                        <Badge className="bg-primary text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest">Default / 默认</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">PRIMARY</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-blue-500 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest">Info / 提示</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">BLUE_500</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-orange-500 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest">Warning / 警告</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">ORANGE_500</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-green-600 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest">Safety / 安全</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">GREEN_600</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-muted-foreground text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest">Neutral / 中性</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">GRAY_600</p>
                      </div>
                    </div>
                  </div>

                  {/* 物理尺寸 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <Maximize className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.2 物理尺寸阶梯 (Badge Sizes)</span>
                    </div>
                    <div className="flex items-end gap-8">
                       <div className="space-y-2">
                         <Badge className="h-5 px-2 text-[8px] font-bold uppercase border-primary/20 text-primary bg-primary/5">Small Badge</Badge>
                         <p className="text-[8px] text-center font-mono opacity-40">SM / 20px</p>
                       </div>
                       <div className="space-y-2">
                         <Badge className="h-6 px-3 text-[10px] font-bold uppercase border-primary/20 text-primary bg-primary/5">Standard Base</Badge>
                         <p className="text-[8px] text-center font-mono opacity-40">BASE / 24px</p>
                       </div>
                       <div className="space-y-2">
                         <Badge className="h-8 px-4 text-xs font-bold uppercase border-primary/20 text-primary bg-primary/5">Large Tag</Badge>
                         <p className="text-[8px] text-center font-mono opacity-40">LG / 32px</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-16 border-t border-dashed">
                  {/* 可移除标签 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.3 可移除交互标签 (Removable Tags)</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="group flex items-center gap-2 bg-muted/40 hover:bg-muted/60 pl-3 pr-1.5 py-1 rounded-lg border border-border/40 transition-colors cursor-default">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Project</span>
                        <button className="h-5 w-5 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="group flex items-center gap-2 bg-muted/40 hover:bg-muted/60 pl-3 pr-1.5 py-1 rounded-lg border border-border/40 transition-colors cursor-default">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Core HW v2.4</span>
                        <button className="h-5 w-5 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground italic">常用于过滤条件选择、工程参数追加及多选结果展示。</p>
                  </div>

                  {/* 标签组演示 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.4 标签云排版 (Tag Cloud)</span>
                    </div>
                    <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-border/60">
                       <div className="flex flex-wrap gap-2">
                          {['Industrial', 'Smart Retail', '4K UHD', 'Intel Core i9', 'Global Logistics', 'IP65 Rated', '24/7 Service', 'Touch Panel'].map(tag => (
                            <Badge key={tag} variant="outline" className="bg-white text-[9px] uppercase font-bold tracking-tighter h-6 border-border/60">{tag}</Badge>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 11. 树形结构菜单规范 */}
            <section className="space-y-10 pb-40">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">11. 树形结构菜单规范</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                   {/* 11.1 基础形态与层级 */}
                   <div className="space-y-10">
                      <div className="flex items-center gap-3">
                        <Workflow className="h-4 w-4 text-primary" />
                        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.1 基础层级形态 (Basic Hierarchy)</span>
                      </div>
                      
                      <div className="bg-muted/5 rounded-3xl border border-border/40 p-6">
                        <div className="space-y-1">
                          {/* Root Level */}
                          <div 
                            className={cn(
                              "flex items-center gap-3 h-10 px-3 rounded-xl cursor-pointer transition-all",
                              "hover:bg-primary/5 text-primary group"
                            )}
                            onClick={() => toggleTree('root')}
                          >
                            <ChevronRightIcon className={cn("h-4 w-4 transition-transform duration-300 opacity-40", treeExpanded.has('root') && "rotate-90")} />
                            <Folder className="h-4 w-4 opacity-60" />
                            <span className="text-sm font-bold">Heovose Enterprise</span>
                            <Badge variant="outline" className="ml-auto text-[7px] h-4">ROOT</Badge>
                          </div>

                          {/* Level 1 */}
                          {treeExpanded.has('root') && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                              <div className="pl-6 border-l border-primary/10 ml-5 space-y-1">
                                <div 
                                  className="flex items-center gap-3 h-10 px-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                                  onClick={() => toggleTree('products')}
                                >
                                  <ChevronRightIcon className={cn("h-4 w-4 transition-transform duration-300", treeExpanded.has('products') && "rotate-90")} />
                                  <Folder className="h-4 w-4 opacity-40" />
                                  <span className="text-sm font-medium">Product Portfolio</span>
                                </div>

                                {/* Level 2 */}
                                {treeExpanded.has('products') && (
                                  <div className="pl-6 border-l border-primary/10 ml-5 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-center gap-3 h-9 px-3 rounded-lg border-l-2 border-primary bg-primary/5 text-primary">
                                      <Monitor className="h-3.5 w-3.5" />
                                      <span className="text-[13px] font-bold">AIO Series Pro</span>
                                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                    <div className="flex items-center gap-3 h-9 px-3 rounded-lg hover:bg-primary/5 transition-all text-muted-foreground/60 hover:text-primary">
                                      <Cpu className="h-3.5 w-3.5" />
                                      <span className="text-[13px]">Mini PC Solutions</span>
                                    </div>
                                    <div className="flex items-center gap-3 h-9 px-3 rounded-lg hover:bg-primary/5 transition-all text-muted-foreground/60 hover:text-primary">
                                      <File className="h-3.5 w-3.5" />
                                      <span className="text-[13px]">User Guide.pdf</span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-3 h-10 px-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-all text-muted-foreground">
                                  <ChevronRightIcon className="h-4 w-4 opacity-20" />
                                  <Folder className="h-4 w-4 opacity-40" />
                                  <span className="text-sm font-medium">Technical Specs</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                   </div>

                   {/* 11.2 物理参数定义 */}
                   <div className="space-y-10">
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-primary" />
                        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.2 物理参数定义 (Specs Definition)</span>
                      </div>
                      
                      <div className="space-y-6">
                         <div className="flex items-start gap-8">
                            <div className="w-24 h-24 bg-muted/20 rounded-2xl flex items-center justify-center border border-dashed border-primary/20">
                               <Move className="h-10 w-10 text-primary/40" />
                            </div>
                            <div className="space-y-2">
                               <p className="text-[10px] font-bold uppercase">标准缩进步长</p>
                               <p className="text-2xl font-headline font-bold text-primary">24px</p>
                               <p className="text-[9px] text-muted-foreground leading-relaxed uppercase">确保层级深度感知明确，不因层级过多导致视觉局促。</p>
                            </div>
                         </div>
                         
                         <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex items-center gap-2 mb-4">
                               <ShieldCheck className="h-4 w-4 text-primary" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">交互反馈标准</span>
                            </div>
                            <ul className="space-y-3">
                               <li className="flex items-center justify-between text-[11px]">
                                  <span className="text-muted-foreground">默认节点高度 (Primary)</span>
                                  <span className="font-mono font-bold">40px</span>
                               </li>
                               <li className="flex items-center justify-between text-[11px]">
                                  <span className="text-muted-foreground">次级节点高度 (Secondary)</span>
                                  <span className="font-mono font-bold">36px</span>
                               </li>
                               <li className="flex items-center justify-between text-[11px]">
                                  <span className="text-muted-foreground">Hover 背景色</span>
                                  <code className="bg-white px-1.5 rounded border">bg-primary/5</code>
                               </li>
                            </ul>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
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
              </div>
            </section>
          </div>
        )}
      </div>

      {/* 固定底栏 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border/40 px-12 py-3 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-8">
          <Dialog modal={false}>
            <DialogTrigger asChild>
               <button onClick={loadManifest} className="inline-flex items-center justify-center rounded-full h-10 px-6 gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                 <FileText className="h-4 w-4" /> 查阅前台视觉白皮书
               </button>
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
                   <Button variant="ghost" className="rounded-xl px-8 font-bold uppercase text-[10px]">返回设计 system</Button>
                 </DialogClose>
               </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lab Environment Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
