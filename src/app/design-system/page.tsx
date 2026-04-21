
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Sparkles, 
  Settings, 
  ShieldCheck, 
  Info, 
  AlertTriangle, 
  LayoutGrid,
  Monitor,
  ShoppingBag,
  Building2,
  Check,
  Search,
  ChevronRight,
  AppWindow,
  Cpu
} from 'lucide-react';
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
      <header className="bg-white border-b border-border/40 sticky top-0 z-[100] px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest">Heovose Design Labs</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">Visual Sandbox • Dual-System Debugging</p>
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
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 01. 前台品牌基础 */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-headline font-bold uppercase tracking-widest">Front-end Identity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* 业务线配色对比 */}
                <div className="space-y-6">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Business Line Themes</span>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2.5rem] bg-primary text-white space-y-4 shadow-xl">
                      <ShoppingBag className="h-8 w-8 text-accent" />
                      <h4 className="text-xl font-bold">Wholesale Line</h4>
                      <p className="text-xs opacity-60 leading-relaxed font-medium">Classical Navy Blue (#005B99). Represents reliability and mass production.</p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-[#F97316] text-white space-y-4 shadow-xl">
                      <Building2 className="h-8 w-8" />
                      <h4 className="text-xl font-bold">Project Solutions</h4>
                      <p className="text-xs opacity-60 leading-relaxed font-medium">Industrial Orange (#F97316). Represents innovation and integration.</p>
                    </div>
                  </div>
                </div>

                {/* 前台圆角规范 */}
                <div className="space-y-6">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Signature Radii</span>
                  <div className="space-y-4">
                    <div className="h-32 rounded-[2.5rem] bg-white border border-border/40 shadow-sm flex items-center justify-center">
                       <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Rounded-2.5xl (Standard Card)</span>
                    </div>
                    <div className="h-32 rounded-[3rem] bg-muted/20 border border-dashed border-border flex items-center justify-center">
                       <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Rounded-3xl (Section Wrapper)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02. 前台交互组件 */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-2 w-10 bg-accent rounded-full" />
                <h2 className="text-xl font-headline font-bold uppercase tracking-widest">Front-end Interaction</h2>
              </div>
              <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-12">
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 ai-icon-gradient" /> AI Core Component
                  </p>
                  <div className="flex flex-wrap gap-8 items-center">
                    <Button className="ai-btn-glow h-16 px-10 rounded-2xl gap-3 font-bold uppercase tracking-widest text-sm shadow-2xl">
                       <Sparkles className="h-5 w-5 ai-icon-gradient" /> AI 智译本页
                    </Button>
                    <div className="p-4 bg-muted/20 rounded-2xl border border-dashed text-[10px] text-muted-foreground font-medium max-w-xs leading-relaxed">
                      前台 AI 按钮采用 <span className="text-primary font-bold">Rounded-2xl</span> 与更大幅度的阴影，强调“智能资产”的独特性。
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
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary">Admin System Standards</h2>
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

            {/* 02. 后台专用组件 */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b pb-4 border-primary/20">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary">Admin System Controls</h2>
              </div>
              <div className="bg-white p-10 rounded-2xl border border-border/40 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admin AI Interactions (2.2)</p>
                        <div className="flex flex-wrap gap-6 items-end">
                           <div className="space-y-2">
                             <span className="text-[9px] opacity-40 block">Full Version</span>
                             <Button className="ai-btn-glow h-10 px-5 rounded-lg gap-2 font-bold uppercase tracking-widest text-[10px]">
                               <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" /> AI 智译
                             </Button>
                           </div>
                           <div className="space-y-2">
                             <span className="text-[9px] opacity-40 block">Minimal Version</span>
                             <Button variant="ghost" size="icon" className="ai-btn-glow h-9 w-9 rounded-lg">
                               <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" />
                             </Button>
                           </div>
                        </div>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Feedback & Toast Specs</p>
                      <Alert className="rounded-xl border-primary/20 bg-primary/5">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-[10px] font-bold uppercase tracking-tight">Security Context Active</AlertTitle>
                        <AlertDescription className="text-[10px] opacity-70">Admin layout uses consistent padding p-6 (24px) globally.</AlertDescription>
                      </Alert>
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
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lab Core v1.3</span>
           </div>
           <div className="h-4 w-px bg-border/60" />
           <div className="flex items-center gap-2">
             <AppWindow className="h-3.5 w-3.5 opacity-40" />
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
               {activeSystem === 'frontend' ? 'Debugging: Brand Layer' : 'Debugging: Admin Manifest v1.8'}
             </span>
           </div>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Development Environment Only</p>
      </footer>
    </div>
  );
}

// 辅助组件：Label
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
