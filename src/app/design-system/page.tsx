
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Settings, 
  Package, 
  ShieldCheck, 
  Info, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  Globe,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

// AI 极光渐变定义组件 (必须包含在页面中以使 .ai-icon-gradient 生效)
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
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-40">
      <AiGradientDef />
      
      {/* 顶部标题栏 */}
      <header className="bg-white border-b border-border/40 sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest">Heovose Design System</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">UI/UX Kit v1.2 • Development Preview</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="h-8 px-3 rounded-lg border-green-200 bg-green-50 text-green-700 font-bold text-[10px] uppercase">
             Live Styles Enabled
           </Badge>
           <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'} className="text-xs font-bold uppercase tracking-widest">Back to Front-end</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 pt-12 space-y-20">
        
        {/* 色彩系统 */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-2 w-10 bg-primary rounded-full" />
            <h2 className="text-xl font-bold uppercase tracking-widest">01. Color Palette</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <ColorBlock label="Primary Blue" variable="bg-primary" hex="#005B99" description="Brand identity & Wholesale" />
            <ColorBlock label="Project Orange" variable="bg-[#F97316]" hex="#F97316" description="Project solutions" />
            <ColorBlock label="Accent Yellow" variable="bg-accent" hex="#FCDC00" description="Highlights & AI states" />
            <ColorBlock label="Background" variable="bg-background" hex="#F8F9FA" description="Global page bg" />
            <ColorBlock label="Neutral 900" variable="bg-[#101820]" hex="#101820" description="Headlines & Text" />
            <ColorBlock label="Neutral 500" variable="bg-muted-foreground" hex="#3C434A" description="Body & Captions" />
          </div>
        </section>

        {/* 字体排版 */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-2 w-10 bg-primary rounded-full" />
            <h2 className="text-xl font-bold uppercase tracking-widest">02. Typography</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6 bg-white p-8 rounded-3xl border shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Headlines / Space Grotesk</span>
              <div className="space-y-4">
                <h1 className="text-6xl font-bold">Heading 01</h1>
                <h2 className="text-4xl font-bold">Heading 02</h2>
                <h3 className="text-2xl font-bold">Heading 03</h3>
                <h4 className="text-xl font-bold">Heading 04</h4>
              </div>
            </div>
            <div className="space-y-6 bg-white p-8 rounded-3xl border shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Body Text / Inter</span>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">Large Body: Let excellent application solutions benefit the world! This is a longer paragraph to test readability and line height.</p>
                <p className="text-sm leading-relaxed text-muted-foreground">Standard Body: Global Intelligence Manufacturing strategies and premium computing hardware solutions.</p>
                <p className="text-xs font-medium uppercase tracking-widest text-primary">Caption Small: High-end technology manufacturing solutions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 按钮矩阵 */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-2 w-10 bg-primary rounded-full" />
            <h2 className="text-xl font-bold uppercase tracking-widest">03. Buttons & Actions</h2>
          </div>
          <div className="bg-white p-10 rounded-3xl border shadow-sm space-y-12">
             <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Standard UI Buttons</p>
                <div className="flex flex-wrap gap-4">
                  <Button className="rounded-xl h-11 px-8 uppercase font-bold text-xs tracking-widest">Primary Action</Button>
                  <Button variant="secondary" className="rounded-xl h-11 px-8 uppercase font-bold text-xs tracking-widest">Secondary</Button>
                  <Button variant="outline" className="rounded-xl h-11 px-8 uppercase font-bold text-xs tracking-widest">Outline Style</Button>
                  <Button variant="ghost" className="rounded-xl h-11 px-6 uppercase font-bold text-xs tracking-widest">Ghost Button</Button>
                  <Button variant="destructive" className="rounded-xl h-11 px-6 uppercase font-bold text-xs tracking-widest">Destructive</Button>
                </div>
             </div>

             <div className="space-y-6 pt-10 border-t border-dashed">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                     <Sparkles className="h-4 w-4 ai-icon-gradient" /> AI Enhanced Components
                   </p>
                </div>
                <div className="flex flex-wrap gap-8 items-center">
                  <div className="space-y-3">
                    <span className="text-[9px] text-muted-foreground uppercase block font-bold">AI Glow Button (Default State)</span>
                    <Button className="ai-btn-glow h-12 px-8 rounded-xl gap-2 font-bold uppercase tracking-widest text-xs">
                       <Sparkles className="h-4 w-4 ai-icon-gradient" /> AI 智译本页
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <span className="text-[9px] text-muted-foreground uppercase block font-bold">Active / Open State</span>
                    <Button data-state="open" className="ai-btn-glow h-12 px-8 rounded-xl gap-2 font-bold uppercase tracking-widest text-xs">
                       <Sparkles className="h-4 w-4 text-accent-foreground" /> AI 正在处理
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[9px] text-muted-foreground uppercase block font-bold">Minimal AI Tool</span>
                    <Button variant="ghost" size="icon" className="ai-btn-glow h-10 w-10 rounded-full">
                       <Sparkles className="h-4 w-4 ai-icon-gradient" />
                    </Button>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* 表单控件 */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-2 w-10 bg-primary rounded-full" />
            <h2 className="text-xl font-bold uppercase tracking-widest">04. Form Controls</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Card className="rounded-3xl border-none shadow-xl">
               <CardHeader><CardTitle className="text-sm font-bold uppercase">Inputs & Selects</CardTitle></CardHeader>
               <CardContent className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Default Input</label>
                   <Input placeholder="Enter hardware specification..." className="rounded-xl h-11" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Dropdown Selection</label>
                   <Select>
                     <SelectTrigger className="h-11 rounded-xl">
                       <SelectValue placeholder="Select Category" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                       <SelectItem value="aio">All-in-One PC</SelectItem>
                       <SelectItem value="mini">Mini PC Series</SelectItem>
                       <SelectItem value="led">Industrial LED</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </CardContent>
             </Card>

             <Card className="rounded-3xl border-none shadow-xl">
               <CardHeader><CardTitle className="text-sm font-bold uppercase">Switches & Toggles</CardTitle></CardHeader>
               <CardContent className="space-y-8">
                 <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                   <div className="space-y-1">
                      <p className="text-xs font-bold uppercase">Feature Toggle</p>
                      <p className="text-[9px] opacity-60">Enable real-time synchronization</p>
                   </div>
                   <Switch checked />
                 </div>
                 <div className="flex items-center gap-3 ml-1">
                   <Checkbox id="terms" checked />
                   <label htmlFor="terms" className="text-xs font-medium">Accept global terms and conditions</label>
                 </div>
               </CardContent>
             </Card>

             <Card className="rounded-3xl border-none shadow-xl">
               <CardHeader><CardTitle className="text-sm font-bold uppercase">Range & Sliders</CardTitle></CardHeader>
               <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold uppercase opacity-40">Brightness</span>
                      <span className="text-[10px] font-bold">85%</span>
                    </div>
                    <Slider defaultValue={[85]} max={100} step={1} />
                  </div>
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold uppercase opacity-40">System Load</span>
                      <span className="text-[10px] font-bold">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
               </CardContent>
             </Card>
          </div>
        </section>

        {/* 状态与徽章 */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-2 w-10 bg-primary rounded-full" />
            <h2 className="text-xl font-bold uppercase tracking-widest">05. Status & Badges</h2>
          </div>
          <div className="bg-white p-10 rounded-3xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Badge Varieties</p>
               <div className="flex flex-wrap gap-3">
                 <Badge className="bg-primary px-3 py-1 text-[10px] uppercase font-bold tracking-widest">Published</Badge>
                 <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest">Draft</Badge>
                 <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-[10px] uppercase font-bold tracking-widest">EN READY</Badge>
                 <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 text-[10px] uppercase font-bold tracking-widest">Urgent</Badge>
                 <Badge className="bg-accent text-accent-foreground px-3 py-1 text-[10px] uppercase font-bold tracking-widest">Featured</Badge>
               </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Alert Notifications</p>
              <Alert className="rounded-2xl border-primary/20 bg-primary/5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle className="text-xs font-bold uppercase tracking-tight">Security Check Passed</AlertTitle>
                <AlertDescription className="text-[10px] opacity-70">Your credentials have been verified by the central command.</AlertDescription>
              </Alert>
              <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold uppercase tracking-tight">Connection Failed</AlertTitle>
                <AlertDescription className="text-[10px] opacity-70">Model RPM quota has been exceeded. Please wait 60s.</AlertDescription>
              </Alert>
            </div>
          </div>
        </section>

        {/* 布局组件 */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-2 w-10 bg-primary rounded-full" />
            <h2 className="text-xl font-bold uppercase tracking-widest">06. Layout & Navigation</h2>
          </div>
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
             <Tabs defaultValue="overview" className="w-full">
               <TabsList className="bg-muted/30 p-1 h-14 w-full justify-start rounded-none px-6 border-b">
                 <TabsTrigger value="overview" className="px-8 text-xs font-bold uppercase tracking-wider gap-2">Overview</TabsTrigger>
                 <TabsTrigger value="specs" className="px-8 text-xs font-bold uppercase tracking-wider gap-2">Specifications</TabsTrigger>
                 <TabsTrigger value="gallery" className="px-8 text-xs font-bold uppercase tracking-wider gap-2">Asset Gallery</TabsTrigger>
               </TabsList>
               <TabsContent value="overview" className="p-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="text-2xl font-bold text-primary">Component Architecture</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Testing the combination of tabs, typography and spacing in a standard content view. 
                        The layout should feel airy yet structured for industrial applications.
                      </p>
                      <Button className="rounded-xl px-10 gap-2">
                        Get Started <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="relative aspect-video rounded-3xl bg-muted/30 border border-dashed border-border/60 overflow-hidden flex items-center justify-center">
                       <Monitor className="h-12 w-12 opacity-10" />
                       <span className="absolute bottom-4 text-[9px] font-bold uppercase opacity-30 tracking-[0.3em]">Placeholder Container</span>
                    </div>
                  </div>
               </TabsContent>
             </Tabs>
          </div>
        </section>
      </div>

      {/* 浮动底部信息 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-border/40 px-12 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary">System Core v1.2</span>
           </div>
           <Separator orientation="vertical" className="h-4" />
           <div className="flex items-center gap-2">
             <Globe className="h-3 w-3 opacity-40" />
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Ready for Global Deployment</span>
           </div>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Design Standards Compliance: Whitepaper v1.8</p>
      </footer>
    </div>
  );
}

// 辅助子组件：色彩块
function ColorBlock({ label, variable, hex, description }: { label: string, variable: string, hex: string, description: string }) {
  return (
    <div className="space-y-3 group">
      <div className={cn("aspect-square rounded-3xl shadow-lg border border-white/20 transition-transform group-hover:scale-105 duration-500", variable)} />
      <div className="space-y-0.5 px-1">
        <p className="text-[11px] font-bold text-primary">{label}</p>
        <p className="text-[9px] font-mono text-muted-foreground uppercase">{hex}</p>
        <p className="text-[9px] text-muted-foreground/60 leading-tight pt-1">{description}</p>
      </div>
    </div>
  );
}
