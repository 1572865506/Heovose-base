
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal,
  ChevronDown,
  ChevronDown as ChevronDownIcon,
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
  Settings,
  ArrowLeft,
  GalleryHorizontal,
  Layout,
  Bell,
  MousePointer2
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
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
import { getFrontendManifest, getAdminManifest } from './actions';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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

// 轮播组件规范子组件 - 隔离状态以优化性能
const CarouselSpecification = React.memo(() => {
  // Countdown Carousel state
  const [countdownApi, setCountdownApi] = useState<CarouselApi>();
  const [countdownCurrent, setCountdownCurrent] = useState(0);
  const [countdownCount, setCountdownCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!countdownApi) return;
    
    setCountdownCount(countdownApi.scrollSnapList().length);
    setCountdownCurrent(countdownApi.selectedScrollSnap() + 1);

    countdownApi.on("select", () => {
      setCountdownCurrent(countdownApi.selectedScrollSnap() + 1);
      setProgress(0);
    });
  }, [countdownApi]);

  useEffect(() => {
    if (!countdownApi) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (5000 / 50)); // 5s duration, 50ms interval
      });
    }, 50);

    return () => clearInterval(interval);
  }, [countdownApi]);

  // Enhanced Carousel state
  const [enhancedApi, setEnhancedApi] = useState<CarouselApi>();
  const [enhancedCurrent, setEnhancedCurrent] = useState(0);
  const [enhancedCount, setEnhancedCount] = useState(0);
  const [enhancedProgress, setEnhancedProgress] = useState(0);

  useEffect(() => {
    if (!enhancedApi) return;
    
    setEnhancedCount(enhancedApi.scrollSnapList().length);
    setEnhancedCurrent(enhancedApi.selectedScrollSnap() + 1);

    enhancedApi.on("select", () => {
      setEnhancedCurrent(enhancedApi.selectedScrollSnap() + 1);
      setEnhancedProgress(0);
    });
  }, [enhancedApi]);

  useEffect(() => {
    if (!enhancedApi) return;
    
    const interval = setInterval(() => {
      setEnhancedProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (5000 / 50)); // 5s duration, 50ms interval
      });
    }, 50);

    return () => clearInterval(interval);
  }, [enhancedApi]);

  // Large Carousel state
  const [largeApi, setLargeApi] = useState<CarouselApi>();
  const [largeCurrent, setLargeCurrent] = useState(0);
  const [largeCount, setLargeCount] = useState(0);
  const [largeProgress, setLargeProgress] = useState(0);

  useEffect(() => {
    if (!largeApi) return;
    
    setLargeCount(largeApi.scrollSnapList().length);
    setLargeCurrent(largeApi.selectedScrollSnap() + 1);

    largeApi.on("select", () => {
      setLargeCurrent(largeApi.selectedScrollSnap() + 1);
      setLargeProgress(0);
    });
  }, [largeApi]);

  useEffect(() => {
    if (!largeApi) return;
    
    const interval = setInterval(() => {
      setLargeProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (5000 / 50)); // 5s duration, 50ms interval
      });
    }, 50);

    return () => clearInterval(interval);
  }, [largeApi]);

  return (
    <section id="section-11" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">11. 轮播组件系统规范 (Carousel)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        <div className="grid grid-cols-1 gap-20">
          
          {/* 11.1 基础型：导航模式 (Basic Navigation) */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <GalleryHorizontal className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.1 基础型：导航模式 (Basic Navigation)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 内置切换按钮 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">内置切换按钮 (Internal Overlay Controls)</p>
                <div className="bg-muted/5 p-8 rounded-3xl border border-border/40 shadow-inner">
                  <Carousel className="w-full max-w-xs mx-auto group">
                    <CarouselContent>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-primary/10 bg-white">
                              <span className="text-2xl font-headline font-bold text-primary/20">{index + 1}</span>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm border-border/40 text-primary opacity-0 group-hover:opacity-100 disabled:hidden transition-all duration-300" />
                    <CarouselNext className="right-4 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm border-border/40 text-primary opacity-0 group-hover:opacity-100 disabled:hidden transition-all duration-300" />
                  </Carousel>
                </div>
                <p className="text-[9px] text-muted-foreground italic mt-2">按钮内置于容器内，仅在 Hover 时显现，减少视觉干扰。</p>
              </div>

              {/* 倒计时指示器 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">倒计时指示器 (Countdown Indicators)</p>
                <div className="bg-muted/5 p-8 rounded-3xl border border-border/40 shadow-inner">
                  <div className="relative w-full max-w-xs mx-auto">
                    <Carousel 
                      setApi={setCountdownApi} 
                      className="w-full"
                      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                    >
                      <CarouselContent>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-primary/10 bg-white">
                                <span className="text-2xl font-headline font-bold text-primary/20">{index + 1}</span>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    
                    <div className="mt-8 flex items-center justify-center gap-3">
                      {Array.from({ length: countdownCount }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => countdownApi?.scrollTo(i)}
                          className="relative w-12 h-1 bg-primary/10 rounded-full overflow-hidden group transition-all"
                        >
                          {countdownCurrent === i + 1 && (
                            <div 
                              className="absolute inset-0 bg-primary transition-all duration-[50ms] ease-linear"
                              style={{ width: `${progress}%` }}
                            />
                          )}
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic mt-2">指示器带有自动步进的倒计时进度条，增强交互的可预测性。</p>
              </div>
            </div>
          </div>

          {/* 11.2 增强型：进度与指示 (Enhanced Indicators) */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.2 增强型：进度与指示 (Enhanced Indicators)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">索引右置模式 (Index Aligned Right of Indicators)</p>
                <div className="bg-muted/5 p-12 rounded-3xl border border-border/40 shadow-inner">
                  <div className="relative w-full max-w-xs mx-auto">
                    <Carousel 
                      setApi={setEnhancedApi} 
                      className="w-full"
                      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                    >
                      <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-primary/10 bg-white">
                                <span className="text-2xl font-headline font-bold text-primary/20">{index + 1}</span>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    
                    <div className="mt-8 flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2">
                        {Array.from({ length: enhancedCount }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => enhancedApi?.scrollTo(i)}
                            className="relative w-8 h-1 bg-primary/10 rounded-full overflow-hidden group transition-all"
                          >
                            {enhancedCurrent === i + 1 && (
                              <div 
                                className="absolute inset-0 bg-primary transition-all duration-[50ms] ease-linear"
                                style={{ width: `${enhancedProgress}%` }}
                              />
                            )}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                      
                      <div className="h-6 flex items-center pl-4 border-l border-primary/10">
                        <span className="text-[10px] font-mono font-bold text-primary tracking-tighter">
                          {enhancedCurrent.toString().padStart(2, '0')} <span className="opacity-20 mx-1">/</span> {enhancedCount.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic mt-2">索引编号移至指示器右侧并由竖线分隔，视觉结构更清晰。</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">轮播切换逻辑规范</span>
                  </div>
                  <ul className="space-y-4">
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">自动播放步进 (Auto-play)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">OPTIONAL</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">建议间隔为 3000ms - 5000ms，检测到鼠标悬停时应暂停。</p>
                    </li>
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">切换过渡动画 (Transition)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">SPRING</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">采用弹性物理模拟 (Spring Physics)，避免生硬的匀速线性移动。</p>
                    </li>
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">手势交互 (Gestures)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">MANDATORY</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">全平台支持 Drag/Touch 拖拽切换，具备越界回弹效果。</p>
                    </li>
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">对齐规范 (Alignment)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">SIZE-BASED</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">宽 &lt; 1200px 居中；宽 &ge; 1200px 右对齐（限 1400px 容器）。</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 11.3 大型组件：对齐模式 (Large Component Alignment) */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <Layout className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.3 大型组件：对齐模式 (Large Component Alignment)</span>
            </div>

            <div className="space-y-8">
              <div className="bg-muted/5 p-12 rounded-[2.5rem] border border-border/40 shadow-inner overflow-hidden">
                <div className="max-w-[1400px] mx-auto w-full">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-6">大型组件右对齐演示 (Width &gt; 1200px, Right Aligned Indicators)</p>
                  <div className="relative w-full">
                    <Carousel 
                      setApi={setLargeApi} 
                      className="w-full"
                      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                    >
                      <CarouselContent>
                        {Array.from({ length: 4 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="flex h-[360px] items-center justify-center rounded-[2.5rem] border-2 border-dashed border-primary/10 bg-white shadow-sm overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                                <span className="text-4xl font-headline font-bold text-primary/10 relative z-10">Large Hero Slide {index + 1}</span>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {/* 大型组件导航按钮通常位于边缘内部 */}
                      <CarouselPrevious className="left-8 h-12 w-12 rounded-2xl bg-white/90 shadow-lg border-primary/5 text-primary" />
                      <CarouselNext className="right-8 h-12 w-12 rounded-2xl bg-white/90 shadow-lg border-primary/5 text-primary" />
                    </Carousel>
                    
                    {/* 指示器右对齐 UI - 保持在 1400px 约束内 */}
                    <div className="mt-10 flex items-center justify-end gap-8 px-4">
                      <div className="flex items-center gap-3">
                        {Array.from({ length: largeCount }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => largeApi?.scrollTo(i)}
                            className="relative w-14 h-1 bg-primary/10 rounded-full overflow-hidden group transition-all"
                          >
                            {largeCurrent === i + 1 && (
                              <div 
                                className="absolute inset-0 bg-primary transition-all duration-[50ms] ease-linear"
                                style={{ width: `${largeProgress}%` }}
                              />
                            )}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                      
                      <div className="h-8 flex items-center pl-6 border-l border-primary/10">
                        <span className="text-[12px] font-mono font-bold text-primary tracking-tighter">
                          {largeCurrent.toString().padStart(2, '0')} <span className="opacity-20 mx-1">/</span> {largeCount.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-primary block mb-1">对齐逻辑限制：</strong>
                  对于组件宽度 &lt; 1200px 的中小型轮播，指示器应强制居中以保持视觉重心稳定。
                  当宽度 &ge; 1200px 时，指示器转为右对齐，以匹配大型 Hero 区块的视觉流向。
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-primary block mb-1">内容宽度约束：</strong>
                  右对齐的指示器依然必须遵循全局最大内容宽度（1400px）的约束，不可贴合浏览器屏幕边缘。
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

// 13. 动力学系统规范组件
const MotionSpecification = React.memo(() => {
  const [activeCurve, setActiveCurve] = useState('spring-stiff');
  const [isAnimate, setIsAnimate] = useState(false);
  const [staggerKey, setStaggerKey] = useState(0);

  const curves = [
    { id: 'spring-stiff', name: 'Stiff (高刚性)', desc: '用于极速反馈，如点击态、微交互。', class: 'animate-in zoom-in-95 duration-200' },
    { id: 'spring-gentle', name: 'Gentle (柔和型)', desc: '品牌标准动效，适用于大型卡片、面板进入。', class: 'animate-in fade-in slide-in-from-bottom-8 duration-700 ease-spring-gentle' },
    { id: 'brand-reveal', name: 'Reveal (品牌揭示)', desc: '极具张力的揭示效果，用于 Hero 屏。', class: 'animate-in slide-in-from-left-full duration-1000 ease-brand-reveal' }
  ];

  const triggerAnimation = () => {
    setIsAnimate(false);
    setTimeout(() => setIsAnimate(true), 10);
  };

  const triggerStagger = () => {
    setStaggerKey(prev => prev + 1);
  };

  return (
    <section id="section-13" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">13. 动力学系统规范 (Motion)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* 13.1 物理曲线实验室 */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">13.1 动力学曲线实验室 (Curve Lab)</span>
            </div>
            
            <div className="space-y-4">
              {curves.map(curve => (
                <button
                  key={curve.id}
                  onClick={() => { setActiveCurve(curve.id); triggerAnimation(); }}
                  className={cn(
                    "w-full p-6 rounded-2xl border transition-all text-left group relative overflow-hidden",
                    activeCurve === curve.id ? "bg-primary border-primary text-white" : "bg-muted/5 border-border/40 hover:border-primary/40"
                  )}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <p className="text-[10px] font-bold uppercase mb-1 opacity-60">Physical Curve</p>
                      <h4 className="text-sm font-bold uppercase tracking-widest">{curve.name}</h4>
                    </div>
                    <ArrowRight className={cn("h-4 w-4 transition-transform", activeCurve === curve.id ? "translate-x-1" : "opacity-20")} />
                  </div>
                  <p className={cn("text-[9px] mt-2 leading-relaxed relative z-10", activeCurve === curve.id ? "text-white/60" : "text-muted-foreground")}>
                    {curve.desc}
                  </p>
                  {activeCurve === curve.id && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          {/* 动画演示 */}
          <div className="flex flex-col items-center justify-center p-12 bg-muted/5 rounded-[2.5rem] border border-border/40 min-h-[400px]">
             <div className="relative w-48 h-48">
               {isAnimate && (
                 <div className={cn(
                   "absolute inset-0 rounded-3xl bg-primary flex items-center justify-center shadow-2xl",
                   curves.find(c => c.id === activeCurve)?.class
                 )}>
                   <Zap className="h-12 w-12 text-white" />
                 </div>
               )}
               {!isAnimate && (
                  <div className="absolute inset-0 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Awaiting Trigger</span>
                  </div>
               )}
             </div>
             <Button 
                onClick={triggerAnimation} 
                variant="outline" 
                className="mt-12 rounded-full px-8"
              >
               Replay Animation
             </Button>
          </div>
        </div>

        {/* 13.2 级联进入动效演示 */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Layers className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">13.2 级联进入规范 (Staggered Entrance)</span>
             </div>
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={triggerStagger}
               className="h-7 text-[9px] uppercase font-bold tracking-widest border border-primary/10"
             >
               <RotateCcw className="h-3 w-3 mr-2" /> Trigger Staggered Reveal
             </Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6" key={staggerKey}>
             {[1, 2, 3, 4].map(i => (
               <div 
                key={i} 
                style={{ animationDelay: `${i * 150}ms` }}
                className="h-32 rounded-2xl bg-white border border-border/40 p-6 flex flex-col justify-end animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards opacity-0 shadow-sm"
               >
                 <div className="h-1 w-8 bg-primary/20 rounded-full mb-4" />
                 <p className="text-[10px] font-bold text-primary uppercase">Module 0{i}</p>
                 <p className="text-[8px] text-muted-foreground uppercase mt-1">Stagger {i * 150}ms</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </section>
  );
});

// 14. 反馈与加载规范组件
const FeedbackSpecification = React.memo(() => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <section id="section-14" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">14. 反馈与加载规范 (Feedback \u0026 Loading)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* 14.1 骨架屏规范 */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Box className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">14.1 骨架屏占位规范 (Skeleton Design)</span>
            </div>

            <div className="p-8 bg-muted/5 rounded-[2.5rem] border border-border/40 space-y-8 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase text-primary/40">Product Card Preview</p>
                <Button variant="ghost" size="sm" onClick={simulateLoading} className="h-7 text-[9px] uppercase font-bold tracking-widest border border-primary/10">
                   Toggle Loading
                </Button>
              </div>

              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-[200px] w-full rounded-2xl bg-primary/5" />
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-2/3 bg-primary/5" />
                      <Skeleton className="h-4 w-full bg-primary/5" />
                      <Skeleton className="h-4 w-5/6 bg-primary/5" />
                    </div>
                    <div className="flex gap-2 pt-2">
                       <Skeleton className="h-8 w-24 rounded-full bg-primary/5" />
                       <Skeleton className="h-8 w-24 rounded-full bg-primary/5" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="h-[200px] w-full rounded-2xl bg-muted/20 flex items-center justify-center overflow-hidden">
                       <Monitor className="h-12 w-12 text-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-primary uppercase">Heovose X-Series Pro</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Industry-leading technical specifications for next-generation manufacturing platforms.
                      </p>
                    </div>
                    <div className="flex gap-2">
                       <Button size="sm" className="rounded-full px-6">Explore</Button>
                       <Button variant="outline" size="sm" className="rounded-full px-6">Buy Now</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 14.2 全域通知系统 */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">14.2 全域通知系统 (Notifications)</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => toast({
                  title: "Submission Successful",
                  description: "Your technical inquiry has been sent to our expert team.",
                  className: "bg-white/80 backdrop-blur-xl border-primary/20 rounded-2xl shadow-2xl"
                })}
                className="p-6 rounded-2xl bg-white border border-border/40 hover:border-primary/40 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold uppercase text-primary">Success Notification</h5>
                    <p className="text-[9px] text-muted-foreground mt-1">点击触发成功提示（Toast Success）</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => toast({
                  title: "Authentication Failed",
                  description: "Unable to verify secure access credentials.",
                  variant: "destructive",
                  className: "rounded-2xl shadow-2xl"
                })}
                className="p-6 rounded-2xl bg-white border border-border/40 hover:border-destructive/40 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold uppercase text-destructive">Error Notification</h5>
                    <p className="text-[9px] text-muted-foreground mt-1">点击触发错误提示（Toast Error）</p>
                  </div>
                </div>
              </button>
            </div>
            
            <p className="text-[9px] text-muted-foreground italic leading-relaxed bg-muted/5 p-4 rounded-xl border border-border/20">
              规范建议：全域通知必须遵循 **玻璃质感 (Glassmorphism)** 准则，并位于屏幕右上角（Desktop）或顶部中央（Mobile），确保不干扰核心操作路径。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

// 15. 导航深度与展示规范组件
const ExhibitionSpecification = React.memo(() => {
  return (
    <section id="section-15" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">15. 导航深度与展示 (Exhibition)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        {/* 15.1 面包屑与结构 */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Monitor className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">15.1 探索路径规范 (Breadcrumbs)</span>
          </div>

          <div className="p-8 bg-muted/5 rounded-[2rem] border border-border/40">
            <nav className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
                <Globe className="h-3 w-3" />
                Solutions
              </div>
              <ChevronRight className="h-3 w-3 text-primary/20" />
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Smart Manufacturing
              </div>
              <ChevronRight className="h-3 w-3 text-primary/20" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                X-Series 09 Pro
              </div>
            </nav>
          </div>
        </div>

        {/* 15.2 巨型菜单展示 */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
             <LayoutGrid className="h-4 w-4 text-primary" />
             <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">15.2 巨型菜单排版 (Mega Menu)</span>
           </div>

           <div className="relative group w-full">
             <div className="w-full h-14 bg-primary rounded-2xl flex items-center px-8 text-white relative z-20">
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  Product Categories <ChevronDown className="h-3 w-3" />
                </span>
             </div>
             
             {/* 浮动面板 */}
             <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-500 ease-spring-gentle z-50">
               <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2.5rem] p-10 grid grid-cols-4 gap-10 overflow-hidden">
                 {/* 装饰图 */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                 
                 {[
                   { title: 'Wholesale Solutions', items: ['Smart Displays', 'OLED Terminals', 'Touch Modules', 'Standard ICs'] },
                   { title: 'Project Customization', items: ['Medical Grade', 'Military Specs', 'Aviation Panels', 'Automotive UI'] },
                   { title: 'Technical Services', items: ['R&D Support', 'Integration Guide', 'Global Logistics', 'QA Protocol'] },
                   { title: 'Brand Story', items: ['History', 'Innovation Lab', 'Sustainability', 'Global Press'] }
                 ].map(cat => (
                   <div key={cat.title} className="space-y-6 relative z-10">
                     <h5 className="text-[11px] font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-3">{cat.title}</h5>
                     <ul className="space-y-4">
                       {cat.items.map(item => (
                         <li key={item} className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-between group/item">
                           {item}
                           <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                         </li>
                       ))}
                     </ul>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>

        {/* 15.3 多媒体展示框架 */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
             <GalleryHorizontal className="h-4 w-4 text-primary" />
             <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">15.3 多媒体展示规范 (Multimedia Frame)</span>
           </div>

           <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border/40 group shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40" />
              
              {/* 中央播放按钮 */}
              <button className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white/40">
                   <Play className="h-8 w-8 text-white fill-white ml-1" />
                 </div>
              </button>

              {/* 底部控制器规范 */}
              <div className="absolute bottom-10 left-10 right-10 flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                 <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 w-1/3 bg-primary" />
                 </div>
                 <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                    <span className="font-mono text-[10px] text-white">03:42 / 12:00</span>
                    <div className="h-3 w-px bg-white/20" />
                    <Maximize className="h-4 w-4 text-white cursor-pointer hover:text-primary transition-colors" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
});

// 后台系统规范组件 (Admin Design System)
const AdminSystemSpecification = React.memo(() => {
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
                 <div className="p-10 rounded-3xl bg-muted/20 border border-primary/20 flex flex-col items-center justify-center space-y-8 relative group">
                    <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-xl relative z-10 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-indigo-500 to-rose-400 animate-pulse opacity-10" />
                       <Cpu className="h-10 w-10 text-primary relative z-20" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-[11px] font-bold uppercase text-primary">AI-Aurora System</p>
                       <p className="text-[9px] text-muted-foreground uppercase tracking-widest">4 色极光渐变 + 呼吸感光晕</p>
                    </div>
                    <div className="absolute inset-0 rounded-3xl border-2 border-primary/0 group-hover:border-primary/20 transition-all duration-1000 shadow-[0_0_40px_rgba(79,70,229,0)] group-hover:shadow-[0_0_40px_rgba(79,70,229,0.1)]" />
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                   <Wand2 className="h-4 w-4 text-primary" />
                   <span className="text-[11px] font-bold text-primary uppercase tracking-widest">智译按钮形态 (Smart Translate)</span>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">01. 完整版 (Full Mode)</p>
                      <Button className="h-10 rounded-lg px-6 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                         <Sparkles className="h-3.5 w-3.5" /> AI 智译
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">02. 简短版 (Short Mode)</p>
                      <Button variant="outline" className="h-10 rounded-lg px-6 gap-2 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary">
                         <Sparkles className="h-3.5 w-3.5" /> 智译
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">03. 精简版 (Minimal Mode)</p>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-primary hover:bg-primary/5">
                         <Sparkles className="h-4 w-4" />
                      </Button>
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
                   <p className="text-[10px] font-bold text-primary uppercase">PROD_OLED_0423_X98K</p>
                   <p className="text-[9px] text-muted-foreground uppercase">格式：PROD_分类_月日_随机码</p>
                 </div>
                 <Button variant="outline" size="sm" className="rounded-full text-[9px] uppercase font-bold tracking-widest">Generate New ID</Button>
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
    </div>

  );
});

// 段落导航条组件 (Timeline-like Navigation)
const TimelineNav = ({ activeSystem }: { activeSystem: string }) => {
  const [activeSection, setActiveSection] = useState(activeSystem === 'frontend' ? 'section-00' : 'admin-01');

  const frontendSections = [
    { id: 'section-00', title: '00. 核心色彩', icon: ShoppingBag },
    { id: 'section-01', title: '01. 字体系统', icon: Type },
    { id: 'section-02', title: '02. 几何投影', icon: Layers },
    { id: 'section-03', title: '03. 按钮系统', icon: Zap },
    { id: 'section-04', title: '04. 交互组件', icon: MousePointer2 },
    { id: 'section-05', title: '05. 输入系统', icon: Terminal },
    { id: 'section-06', title: '06. 表格系统', icon: TableProperties },
    { id: 'section-07', title: '07. 标签徽章', icon: Tag },
    { id: 'section-08', title: '08. 树形结构', icon: Workflow },
    { id: 'section-09', title: '09. 分页系统', icon: LayoutGrid },
    { id: 'section-10', title: '10. 选项卡系统', icon: Layout },
    { id: 'section-11', title: '11. 轮播组件', icon: GalleryHorizontal },
    { id: 'section-12', title: '12. 毛玻璃效果', icon: Sparkles },
    { id: 'section-13', title: '13. 动力学系统', icon: Activity },
    { id: 'section-14', title: '14. 反馈与加载', icon: Loader2 },
    { id: 'section-15', title: '15. 导航与展示', icon: Monitor },
  ];

  const adminSections = [
    { id: 'admin-01', title: '01. 视觉语言', icon: Building2 },
    { id: 'admin-02', title: '02. 字体表单', icon: Type },
    { id: 'admin-03', title: '03. 控件状态', icon: MousePointer2 },
    { id: 'admin-04', title: '04. AI 交互', icon: Sparkles },
    { id: 'admin-05', title: '05. 业务逻辑', icon: Cpu },
    { id: 'admin-06', title: '06. 看板度量', icon: Gauge },
    { id: 'admin-07', title: '07. 高级过滤', icon: Filter },
    { id: 'admin-08', title: '08. 详情面板', icon: Layout },
    { id: 'admin-09', title: '09. 权限审计', icon: Settings },

  ];

  const sections = activeSystem === 'frontend' ? frontendSections : adminSections;

  useEffect(() => {
    setActiveSection(activeSystem === 'frontend' ? 'section-00' : 'admin-01');
  }, [activeSystem]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        threshold: 0.1, 
        rootMargin: '-20% 0px -60% 0px' 
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // 考虑到顶部导航或间距
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden 2xl:flex flex-col items-center py-6 px-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3 animate-in fade-in slide-in-from-right-10 duration-1000">
      <div className="absolute inset-y-10 right-1/2 translate-x-1/2 w-px bg-primary/5 -z-10" />
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="group relative flex items-center justify-center h-6 w-6"
          >
            {/* Active Section Label (Persistent for Active) */}
            {isActive && (
              <div className="absolute right-full mr-3 animate-in fade-in slide-in-from-right-2 duration-500 pointer-events-none">
                <div className="bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                  {section.title}
                </div>
              </div>
            )}

            {/* Tooltip (On Hover for Inactive) */}
            {!isActive && (
              <div className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md text-primary text-[8px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-md border border-primary/10 shadow-sm whitespace-nowrap">
                  {section.title}
                </div>
              </div>
            )}
            
            {/* Dot/Icon container */}
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-500 border relative overflow-hidden",
              isActive 
                ? "border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/20" 
                : "border-border/20 bg-white/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:scale-105"
            )}>
              <Icon className={cn(
                "h-2.5 w-2.5 transition-transform duration-500",
                isActive ? "scale-100" : "group-hover:scale-110"
              )} />
            </div>

            {/* Active Indicator Pulse */}
            {isActive && (
              <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-primary animate-ping" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default function DesignSystemPage() {
  const [activeSystem, setActiveSystem] = useState('frontend');
  const [manifestContent, setManifestContent] = useState('');
  const [isLoadingManifest, setIsLoadingManifest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Tabs state
  const [activeBasicTab, setActiveBasicTab] = useState('Overview');
  const [activePillTab, setActivePillTab] = useState('Details');
  const [activeCardTab, setActiveCardTab] = useState('Hardware');
  const [activeLeftTab, setActiveLeftTab] = useState('Profile');
  const [activeRightTab, setActiveRightTab] = useState('System');
  
  // 06.3 排序逻辑状态
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'asc' });
  const initialBusinessData = useMemo(() => [
    { name: 'All-in-One Series', stock: 1240, transit: 300, time: 2, timeStr: '2 mins ago' },
    { name: 'Mini PC Series', stock: 850, transit: 120, time: 14, timeStr: '14 mins ago' },
    { name: 'Industrial Displays', stock: 430, transit: 45, time: 60, timeStr: '1 hour ago' },
    { name: 'Touch Panel Kits', stock: 2100, transit: 600, time: 5, timeStr: '5 mins ago' },
    { name: 'Server Barebones', stock: 120, transit: 12, time: 240, timeStr: '4 hours ago' }
  ], []);

  const sortedBusinessData = useMemo(() => {
    const data = [...initialBusinessData];
    data.sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [sortConfig, initialBusinessData]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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
    const res = activeSystem === 'frontend' ? await getFrontendManifest() : await getAdminManifest();
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
            {/* Timeline Navigation */}
            <TimelineNav activeSystem={activeSystem} />
            
            {/* 00. 核心色彩模组定义 */}
            <section id="section-00" className="space-y-10">
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
            <section id="section-01" className="space-y-10">
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
            <section id="section-02" className="space-y-10">
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
                          <p className="text-10px] font-bold uppercase">极简隔离</p>
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

            {/* 03. 按钮系统规范定义 */}
            <section id="section-03" className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. 按钮系统规范定义</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Maximize className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.1 物理尺寸阶梯 (Size Scale)</span>
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
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.2 状态语义按钮 (Status Matrix)</span>
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
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.3 纯图标与混合交互</span>
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
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.4 模组化按钮组 (Button Groups)</span>
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

            {/* 04. 交互组件单元规范 */}
            <section id="section-04" className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">04. 交互组件单元规范</h2>
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

            {/* 05. 输入系统规范 */}
            <section id="section-05" className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">05. 输入系统规范</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Maximize className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">5.1 高度尺寸标准 (Input Scale)</span>
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
                       <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> 5.3 状态逻辑展示 (State Matrix)</span>
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
                            <Textarea className="min-h-[120px] rounded-lg px-3 py-2 text-xs leading-relaxed" placeholder="在此输入详细s的硬件项目需求说明..." />
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 06. 表格系统规范 */}
            <section id="section-06" className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">06. 表格系统规范</h2>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {/* 9.1 基础与状态展示 */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><TableProperties className="h-4 w-4" /> 6.1 基础形态与业务状态 (Styles & Status)</span>
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
                                   <Badge className="w-fit mt-1 h-4 text-[7px] bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors cursor-default">运行中 / LIVE</Badge>
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
                                   <Badge variant="outline" className="w-fit mt-1 h-4 text-[7px] bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-colors cursor-default">待检 / WAITING</Badge>
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

                {/* 06.2 固定表头与固定列 */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Maximize className="h-4 w-4" /> 6.2 固定表头与固定列 (Sticky & Fixed)</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* 固定表头型 */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">固定表头型 (Sticky Header / Y-Axis)</p>
                      <div className="rounded-2xl border border-separate border-spacing-0 overflow-hidden shadow-inner bg-white relative">
                        <div className="max-h-[300px] overflow-y-auto scrollbar-minimal">
                          <Table className="border-separate border-spacing-0">
                            <TableHeader className="sticky top-0 z-40">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="sticky top-0 z-50 bg-muted font-bold text-[9px] uppercase pl-6 py-4 border-b border-border/60 shadow-sm">检测项</TableHead>
                                <TableHead className="sticky top-0 z-50 bg-muted font-bold text-[9px] uppercase py-4 border-b border-border/60 shadow-sm">检测时间</TableHead>
                                <TableHead className="sticky top-0 z-50 bg-muted font-bold text-[9px] uppercase pr-6 py-4 text-right border-b border-border/60 shadow-sm">结果</TableHead>
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
                          <div className="min-w-[1200px]">
                            <Table className="border-separate border-spacing-0">
                              <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-b">
                                  <TableHead className="sticky left-0 top-0 z-50 bg-muted font-bold text-[9px] uppercase pl-6 border-r border-border/60 py-4 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">核心产品型号 (Fixed)</TableHead>
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
                                    <TableCell className="sticky left-0 z-30 bg-white font-bold text-xs pl-6 border-r border-border/60 py-4 shadow-[4px_0_10px_rgba(0,0,0,0.1)] group-hover:bg-muted/10">{row.model}</TableCell>
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

                {/* 06.3 深度交互与逻辑展开 */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Workflow className="h-4 w-4" /> 6.3 深度交互与逻辑展开 (Advanced Interaction)</span>
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
                                  <div 
                                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-primary transition-colors group"
                                    onClick={() => handleSort('time')}
                                  >
                                    最后审计时间 
                                    {sortConfig.key === 'time' && (
                                      sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-primary animate-in zoom-in" /> : <ArrowDown className="h-3 w-3 text-primary animate-in zoom-in" />
                                    )}
                                    {sortConfig.key !== 'time' && <ArrowDown className="h-3 w-3 opacity-20 group-hover:opacity-100" />}
                                  </div>
                               </TableHead>
                             </TableRow>
                             <TableRow className="hover:bg-transparent">
                               <TableHead className="text-[8px] font-bold uppercase text-center border-r py-2">仓储实存</TableHead>
                               <TableHead className="text-[8px] font-bold uppercase text-center border-r py-2">在途订单</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {sortedBusinessData.map((row, i) => (
                               <TableRow key={i} className="hover:bg-primary/5 transition-colors">
                                 <TableCell className="pl-6 font-bold text-xs border-r">{row.name}</TableCell>
                                 <TableCell className="text-center border-r font-mono text-xs font-bold text-primary">{row.stock.toLocaleString()}</TableCell>
                                 <TableCell className="text-center border-r font-mono text-xs opacity-60">{row.transit.toLocaleString()}</TableCell>
                                 <TableCell className="text-[10px] opacity-40 pr-6 uppercase text-right">{row.timeStr}</TableCell>
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

            {/* 07. 标签与徽章系统规范 */}
            <section id="section-07" className="space-y-10">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">07. 标签与徽章系统规范</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  {/* 语义状态 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.1 语义状态矩阵 (Semantic States)</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="space-y-2">
                        <Badge className="bg-primary text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-primary/90 transition-all cursor-default">Default / 默认</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">PRIMARY</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-blue-500 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all cursor-default">Info / 提示</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">BLUE_500</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-orange-500 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-orange-600 transition-all cursor-default">Warning / 警告</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">ORANGE_500</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-green-600 text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-green-700 transition-all cursor-default">Safety / 安全</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">GREEN_600</p>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-muted-foreground text-white border-none px-3 py-1 font-bold uppercase text-[9px] tracking-widest hover:bg-foreground transition-all cursor-default">Neutral / 中性</Badge>
                        <p className="text-[8px] text-center font-mono opacity-40">GRAY_600</p>
                      </div>
                    </div>
                  </div>

                  {/* 物理尺寸 */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <Maximize className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.2 物理尺寸阶梯 (Badge Sizes)</span>
                    </div>
                    <div className="flex items-end gap-8">
                       <div className="space-y-2">
                         <Badge className="h-5 px-2 text-[8px] font-bold uppercase border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all cursor-default">Small Badge</Badge>
                         <p className="text-[8px] text-center font-mono opacity-40">SM / 20px</p>
                       </div>
                       <div className="space-y-2">
                         <Badge className="h-6 px-3 text-[10px] font-bold uppercase border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all cursor-default">Standard Base</Badge>
                         <p className="text-[8px] text-center font-mono opacity-40">BASE / 24px</p>
                       </div>
                       <div className="space-y-2">
                         <Badge className="h-8 px-4 text-xs font-bold uppercase border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all cursor-default">Large Tag</Badge>
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
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.3 可移除交互标签 (Removable Tags)</span>
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
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">7.4 标签云排版 (Tag Cloud)</span>
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

            {/* 08. 树形结构菜单规范 */}
            <section id="section-08" className="space-y-10 pb-40">
               <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">08. 树形结构菜单规范</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                   {/* 08.1 基础形态与层级 */}
                   <div className="space-y-10">
                      <div className="flex items-center gap-3">
                        <Workflow className="h-4 w-4 text-primary" />
                        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">8.1 基础层级形态 (Basic Hierarchy)</span>
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

                   {/* 8.2 物理参数定义 */}
                   <div className="space-y-10">
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-primary" />
                        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">8.2 物理参数定义 (Specs Definition)</span>
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

            {/* 09. 分页系统规范 */}
            <section id="section-09" className="space-y-10 pb-40">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">09. 分页系统规范 (Pagination)</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 gap-20">
                  <div className="space-y-10">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">9.1 标准形态与页数 (Standard & Count)</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* 较少页数 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">较少页数 (Few Pages)</p>
                        <div className="flex items-center gap-2 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4 rotate-180" /></Button>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-primary/20 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 hover:text-primary">1</Button>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">2</Button>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">3</Button>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">4</Button>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">5</Button>
                          </div>
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4" /></Button>
                        </div>
                      </div>

                      {/* 较多页数 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">较多页数 (Many Pages & Ellipsis)</p>
                        <div className="flex items-center gap-2 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4 rotate-180" /></Button>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">1</Button>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">2</Button>
                            <div className="h-10 w-8 flex items-center justify-center opacity-40">
                               <MoreHorizontal className="h-4 w-4" />
                            </div>
                            <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-primary/20 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 hover:text-primary">6</Button>
                            <div className="h-10 w-8 flex items-center justify-center opacity-40">
                               <MoreHorizontal className="h-4 w-4" />
                            </div>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all">10</Button>
                          </div>
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">9.2 变体与复合功能 (Variants & Features)</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* 小型分页按钮 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">小型分页按钮 (Small Size)</p>
                        <div className="flex items-center gap-1.5 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-3 w-3 rotate-180" /></Button>
                          <Button variant="outline" className="h-7 w-7 p-0 rounded-lg border-primary/20 bg-primary/10 text-primary font-bold shadow-sm text-[10px] hover:bg-primary/20 hover:text-primary">1</Button>
                          <Button variant="ghost" className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:bg-primary/5 text-[10px] font-medium">2</Button>
                          <Button variant="ghost" className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:bg-primary/5 text-[10px] font-medium">3</Button>
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-3 w-3" /></Button>
                        </div>
                        <p className="text-[9px] text-muted-foreground italic mt-2">适用于卡片内部、侧边栏或空间局促的表格底栏。</p>
                      </div>

                      {/* 带有跳转功能的分页按钮 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">复合跳转功能 (Pagination with Jump)</p>
                        <div className="flex flex-col sm:flex-row items-center gap-6 bg-muted/10 p-4 rounded-2xl border border-dashed border-primary/10">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4 rotate-180" /></Button>
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all text-xs">1</Button>
                            <div className="h-9 w-6 flex items-center justify-center opacity-40">
                               <MoreHorizontal className="h-3 w-3" />
                            </div>
                            <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-primary/20 bg-primary/10 text-primary font-bold shadow-sm text-xs hover:bg-primary/20 hover:text-primary">4</Button>
                            <div className="h-9 w-6 flex items-center justify-center opacity-40">
                               <MoreHorizontal className="h-3 w-3" />
                            </div>
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium transition-all text-xs">24</Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-primary border-border/60 hover:bg-primary/5 hover:text-primary"><ChevronRightIcon className="h-4 w-4" /></Button>
                          </div>
                          <div className="flex items-center gap-2 border-l border-border/60 pl-6">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest whitespace-nowrap">Go to</span>
                            <Input className="h-9 w-12 rounded-lg text-center font-mono text-[11px] p-0 border-border/60" defaultValue="5" />
                            <Button variant="outline" className="h-9 px-3 rounded-lg text-[10px] font-bold uppercase border-border/60 hover:text-primary hover:bg-primary/5 whitespace-nowrap">GO</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. 选项卡系统规范 */}
            <section id="section-10" className="space-y-10 pb-40">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">10. 选项卡系统规范 (Tabs)</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
                <div className="grid grid-cols-1 gap-20">
                  
                  {/* 横向基础样式 */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.1 横向基础样式 (Horizontal Styles)</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* 基础下划线 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">基础样式 (Underline Tab)</p>
                        <div className="bg-muted/5 p-8 rounded-2xl border border-border/40 shadow-inner flex justify-center">
                          <div className="w-full max-w-sm">
                            <div className="flex border-b border-border/40">
                              {['Overview', 'Specs', 'Reviews'].map(tab => (
                                <button 
                                  key={tab}
                                  onClick={() => setActiveBasicTab(tab)}
                                  className={cn(
                                    "h-10 px-6 uppercase tracking-widest transition-colors border-b-2",
                                    activeBasicTab === tab 
                                      ? "font-bold text-[10px] text-primary border-primary bg-primary/5" 
                                      : "font-medium text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent"
                                  )}
                                >
                                  {tab}
                                </button>
                              ))}
                            </div>
                            <div className="p-4 pt-6 text-[11px] text-muted-foreground leading-relaxed h-20">
                               {activeBasicTab === 'Overview' && '使用底部粗线条作为当前状态指示器，常用于页面级别的顶部导航或大版块切换。'}
                               {activeBasicTab === 'Specs' && '这是技术参数面板的交互占位内容，用于展示物理规格。'}
                               {activeBasicTab === 'Reviews' && '这是用户评价面板的占位内容，展现动态反馈。'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 胶囊选项卡 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">选项卡样式 (Segmented Pill)</p>
                        <div className="bg-muted/5 p-8 rounded-2xl border border-border/40 shadow-inner flex justify-center">
                          <div className="w-full max-w-sm flex flex-col items-center">
                            <div className="inline-flex bg-muted/20 p-1.5 rounded-xl border border-border/40">
                              {['Details', 'Logs', 'Settings'].map(tab => (
                                <button 
                                  key={tab}
                                  onClick={() => setActivePillTab(tab)}
                                  className={cn(
                                    "h-9 px-6 uppercase tracking-widest rounded-lg transition-colors",
                                    activePillTab === tab 
                                      ? "font-bold text-[10px] bg-white text-primary shadow-sm" 
                                      : "font-medium text-[10px] text-muted-foreground hover:text-primary"
                                  )}
                                >
                                  {tab}
                                </button>
                              ))}
                            </div>
                            <div className="p-4 pt-6 text-[11px] text-muted-foreground leading-relaxed w-full h-20 text-center">
                               {activePillTab === 'Details' && '被包含在明显的槽位容器中，选项采用白底与投影框出实体感。'}
                               {activePillTab === 'Logs' && '展示详细的系统操作日志流。'}
                               {activePillTab === 'Settings' && '面板的高级配置选项。'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 卡片式结构 */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.2 卡片容器式 (Card Container)</span>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">卡片式 (Folder Card Tab)</p>
                       <div className="bg-muted/5 p-8 rounded-2xl border border-border/40 shadow-inner">
                          <div className="max-w-2xl mx-auto">
                            <div className="flex gap-2 px-8">
                              {['Hardware', 'Software', 'Network'].map(tab => (
                                <button 
                                  key={tab}
                                  onClick={() => setActiveCardTab(tab)}
                                  className={cn(
                                    "h-12 px-8 uppercase tracking-widest transition-all relative group",
                                    activeCardTab === tab 
                                      ? "font-bold text-[10px] bg-white text-primary border border-b-0 border-border/40 rounded-t-2xl z-10" 
                                      : "font-medium text-[10px] text-muted-foreground bg-transparent border-transparent hover:text-primary z-0"
                                  )}
                                >
                                  {tab}
                                  
                                  {/* 激活状态下的平滑反向圆角 (Inverted Corners) - 重新计算以匹配 16px (2xl) 的内容区圆角 */}
                                  {activeCardTab === tab && (
                                    <>
                                      {/* 左侧反向圆角桥接 */}
                                      <div className="absolute -left-4 bottom-0 w-4 h-4 overflow-hidden pointer-events-none">
                                        <div className="w-full h-full rounded-br-2xl border-r border-b border-border/40 shadow-[0_0_0_20px_#ffffff]" />
                                      </div>
                                      
                                      {/* 右侧反向圆角桥接 */}
                                      <div className="absolute -right-4 bottom-0 w-4 h-4 overflow-hidden pointer-events-none">
                                        <div className="w-full h-full rounded-bl-2xl border-l border-b border-border/40 shadow-[0_0_0_20px_#ffffff]" />
                                      </div>

                                      {/* 底部遮罩，确保边框无缝融合 */}
                                      <div className="absolute -left-[1px] -bottom-[1px] w-[calc(100%+2px)] h-[2.5px] bg-white z-20" />
                                    </>
                                  )}

                                  {/* 非激活状态下的简单悬停效果 */}
                                  {activeCardTab !== tab && (
                                    <div className="absolute inset-0 bg-primary/5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-sm relative z-0 -mt-[1px]">
                               <div className="h-24 flex items-center justify-center border-2 border-dashed border-primary/10 rounded-xl transition-all">
                                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{activeCardTab} Configuration Panel</span>
                               </div>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* 垂直位置选项卡 */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-3">
                      <AlignLeft className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.3 垂直排版样式 (Vertical Positions)</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* 左侧垂直 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">左侧标签页 (Left Position)</p>
                        <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden flex min-h-[240px]">
                          <div className="w-32 flex flex-col border-r border-border/40 bg-muted/5 pt-4">
                            {['Profile', 'Security', 'Billing'].map(tab => (
                              <button 
                                key={tab}
                                onClick={() => setActiveLeftTab(tab)}
                                className={cn(
                                  "h-12 px-4 text-left uppercase tracking-widest border-l-[3px] transition-colors",
                                  activeLeftTab === tab 
                                    ? "font-bold text-[10px] text-primary border-primary bg-primary/5" 
                                    : "font-medium text-[10px] text-muted-foreground border-transparent hover:bg-muted/10 hover:text-primary"
                                )}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                          <div className="flex-1 p-6 flex flex-col">
                             <h4 className="text-sm font-bold uppercase mb-4 text-primary">{activeLeftTab} Settings</h4>
                             <div className="flex-1 border-2 border-dashed border-primary/10 rounded-xl flex items-center justify-center transition-all">
                                <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">{activeLeftTab} Content Area</span>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* 右侧垂直 */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">右侧标签页 (Right Position)</p>
                        <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden flex min-h-[240px]">
                          <div className="flex-1 p-6 flex flex-col">
                             <h4 className="text-sm font-bold uppercase mb-4 text-primary text-right">{activeRightTab} Config</h4>
                             <div className="flex-1 border-2 border-dashed border-primary/10 rounded-xl flex items-center justify-center transition-all">
                                <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">{activeRightTab} Content Area</span>
                             </div>
                          </div>
                          <div className="w-32 flex flex-col border-l border-border/40 bg-muted/5 pt-4">
                            {['System', 'Users', 'Logs'].map(tab => (
                              <button 
                                key={tab}
                                onClick={() => setActiveRightTab(tab)}
                                className={cn(
                                  "h-12 px-4 text-right uppercase tracking-widest border-r-[3px] transition-colors",
                                  activeRightTab === tab 
                                    ? "font-bold text-[10px] text-primary border-primary bg-primary/5" 
                                    : "font-medium text-[10px] text-muted-foreground border-transparent hover:bg-muted/10 hover:text-primary"
                                )}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 11. 轮播组件系统规范 */}
            <CarouselSpecification />

            {/* 12. 毛玻璃效果规范 */}
            <section id="section-12" className="space-y-10 pb-40">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">12. 毛玻璃效果规范 (Glassmorphism)</h2>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20 overflow-hidden relative">
                {/* 装饰性背景 */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="grid grid-cols-1 gap-20 relative z-10">
                  <div className="space-y-10">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">12.1 模糊阶梯与背景透明度 (Levels & Opacity)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {/* 轻薄型 */}
                      <div className="space-y-4">
                         <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                           <div className="absolute inset-4 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                              <span className="text-[10px] font-bold uppercase text-primary mb-1">Level 01: Crystal</span>
                              <p className="text-[8px] opacity-60">Blur: 4px | Opacity: 30%</p>
                           </div>
                         </div>
                         <p className="text-[9px] text-muted-foreground italic">适用于轻量化悬浮、二级菜单或信息提示浮层。</p>
                      </div>

                      {/* 标准型 */}
                      <div className="space-y-4">
                         <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                           <div className="absolute inset-4 backdrop-blur-md bg-white/60 border border-white/20 rounded-xl flex flex-col items-center justify-center p-4 text-center shadow-lg">
                              <span className="text-[10px] font-bold uppercase text-primary mb-1">Level 02: Frosted</span>
                              <p className="text-[8px] opacity-60">Blur: 12px | Opacity: 60%</p>
                           </div>
                         </div>
                         <p className="text-[9px] text-muted-foreground italic">品牌标准玻璃效果，用于核心卡片、导航栏背景。</p>
                      </div>

                      {/* 深邃型 */}
                      <div className="space-y-4">
                         <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                           <div className="absolute inset-4 backdrop-blur-2xl bg-white/80 border border-white/10 rounded-xl flex flex-col items-center justify-center p-4 text-center shadow-2xl">
                              <span className="text-[10px] font-bold uppercase text-primary mb-1">Level 03: Deep</span>
                              <p className="text-[8px] opacity-60">Blur: 40px | Opacity: 80%</p>
                           </div>
                         </div>
                         <p className="text-[9px] text-muted-foreground italic">高隔离感容器，适用于模态框、侧边抽屉或全局遮罩。</p>
                      </div>

                      {/* 暗色型 */}
                      <div className="space-y-4">
                         <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200">
                           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                           <div className="absolute inset-4 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                              <span className="text-[10px] font-bold uppercase text-white mb-1">Level 04: Eclipse</span>
                              <p className="text-[8px] text-white/60">Blur: 12px | Opacity: 40% (Dark)</p>
                           </div>
                         </div>
                         <p className="text-[9px] text-muted-foreground italic">工业质感暗色玻璃，用于项目线业务或深色主题模式。</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                    <div className="space-y-8">
                       <div className="flex items-center gap-3">
                         <Zap className="h-4 w-4 text-primary" />
                         <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">12.2 物理边框与感知逻辑 (Logic)</span>
                       </div>
                       <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6">
                         <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase text-primary">高光发丝边框 (Highlight Stroke)</p>
                            <p className="text-[9px] text-muted-foreground leading-relaxed">
                              毛玻璃组件必须搭配 **1px 内部高光描边**（通常为 `border-white/20`），以模拟玻璃边缘的折射感，增强层级深度。
                            </p>
                         </div>
                         <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase text-primary">多重投影叠加 (Layered Shadows)</p>
                            <p className="text-[9px] text-muted-foreground leading-relaxed">
                              深层毛玻璃必须配合 `shadow-2xl`，通过弥散投影进一步强化“物理悬浮”的感知，而非单纯的平面遮盖。
                            </p>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="flex items-center gap-3">
                         <Layers className="h-4 w-4 text-primary" />
                         <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">12.3 适用场景矩阵 (Use Cases)</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         {[
                           { label: 'Nav Bars', desc: 'Header & Fixed Menu' },
                           { label: 'Modals', desc: 'Dialog & Popups' },
                           { label: 'Quick Info', desc: 'Tooltips & Badges' },
                           { label: 'Hero Cards', desc: 'Floating Content' }
                         ].map(item => (
                           <div key={item.label} className="p-4 rounded-xl border border-dashed border-primary/20 bg-white/40 backdrop-blur-sm">
                             <p className="text-[10px] font-bold uppercase text-primary">{item.label}</p>
                             <p className="text-[8px] opacity-40 uppercase mt-1">{item.desc}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 13. 动力学系统规范 */}
            <MotionSpecification />

            {/* 14. 反馈与加载规范 */}
            <FeedbackSpecification />

            {/* 15. 导航深度与展示规范 */}
            <ExhibitionSpecification />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Timeline Navigation */}
            <TimelineNav activeSystem={activeSystem} />
            
            <AdminSystemSpecification />
          </div>
        )}
      </div>

      {/* 固定底栏 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border/40 px-12 py-3 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-8">
          <Dialog modal={false}>
            <DialogTrigger asChild>
               <button onClick={loadManifest} className="inline-flex items-center justify-center rounded-full h-10 px-6 gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                 <FileText className="h-4 w-4" /> 查阅{activeSystem === 'frontend' ? '前台' : '后台'}视觉白皮书
               </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[85vh] p-0 rounded-3xl overflow-hidden flex flex-col shadow-2xl border-none">
               <div className="bg-primary p-6 text-white shrink-0">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="h-6 w-6 text-accent" />
                       <div>
                         <DialogTitle className="text-xl font-bold uppercase tracking-widest">Heovose Elevate {activeSystem === 'frontend' ? '前台' : '管理后台'}规范白皮书</DialogTitle>
                         <DialogDescription className="text-white/60 text-xs uppercase mt-1">本项目{activeSystem === 'frontend' ? '前台' : '管理后台'}视觉与交互治理的最高准则。</DialogDescription>
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
