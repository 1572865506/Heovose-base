
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Layers, Globe, Star, ArrowUpRight, TrendingUp, Factory, Home, Bot, Clock } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const prodsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const catsRef = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const transRef = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const casesRef = useMemoFirebase(() => firestore ? collection(firestore, 'caseStudies') : null, [firestore]);

  const { data: products } = useCollection<any>(prodsRef);
  const { data: categories } = useCollection<any>(catsRef);
  const { data: translations } = useCollection<any>(transRef);
  const { data: cases } = useCollection<any>(casesRef);

  const totalNodes = (products?.length || 0) + (categories?.length || 0) + (cases?.length || 0);
  
  // Calculate business distribution (simplified logic)
  const wholesaleCount = products?.filter((p: any) => p.productCategoryId?.startsWith('WHOLESALE') || p.productCategoryId === 'WHOLESALE').length || 0;
  const projectCount = products?.filter((p: any) => p.productCategoryId?.startsWith('PROJECT') || p.productCategoryId === 'PROJECT').length || 0;
  const otherCount = totalNodes - wholesaleCount - projectCount;

  const wholesalePercent = totalNodes > 0 ? Math.round((wholesaleCount / totalNodes) * 100) : 0;
  const projectPercent = totalNodes > 0 ? Math.round((projectCount / totalNodes) * 100) : 0;
  const otherPercent = totalNodes > 0 ? 100 - wholesalePercent - projectPercent : 0;

  const quickStats = [
    { label: "Active Products", value: products?.length.toString().padStart(2, '0') || "...", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", change: "+12%" },
    { label: "Categories", value: categories?.length.toString().padStart(2, '0') || "...", icon: Layers, color: "text-amber-500", bg: "bg-amber-500/10", change: "Stable" },
    { label: "Translations", value: translations?.length.toString() || "...", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10", change: "+45" },
    { label: "Success Cases", value: cases?.length.toString().padStart(2, '0') || "...", icon: Star, color: "text-indigo-500", bg: "bg-indigo-500/10", change: "+1" },
  ];

  // Derive recent activity from products and cases
  const recentUpdates = [
    ...(products?.slice(0, 2).map((p: any) => ({
      type: 'Update',
      user: 'admin@heovose.com',
      action: `Modified product metadata: [${p.id}]`,
      time: p.updatedAt ? new Date(p.updatedAt.seconds * 1000).toLocaleTimeString() : 'Recently',
      icon: Package,
      color: 'text-primary'
    })) || []),
    ...(cases?.slice(0, 1).map((c: any) => ({
      type: 'Create',
      user: 'editor@heovose.com',
      action: `Published case study: [${c.id}]`,
      time: 'Recently',
      icon: Star,
      color: 'text-emerald-500'
    })) || [])
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* 顶部统计卡片 - 极简扁平化 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, i) => (
          <div key={i} className="group bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] p-6 rounded-[2rem] transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-sm", stat.change.includes('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner", stat.bg, stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            {/* 底部微型渐变条 */}
            <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full", i % 2 === 0 ? "w-1/3 bg-primary/20" : "w-1/4 bg-accent/20")} />
          </div>
        ))}
      </div>

      {/* 中部核心图表 - 业务指标监控 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：智能终端分布 - Donut Chart Concept */}
        <div className="lg:col-span-5 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm p-8 rounded-[2.5rem] space-y-8 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">终端业务分布</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em]">Terminals Distribution</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary opacity-40" />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative py-10">
            {/* Donut Chart SVG Wrapper */}
            <div className="relative h-56 w-56">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#005B99" strokeWidth="12" strokeDasharray={`${(wholesalePercent / 100) * 251.2} 251.2`} strokeLinecap="round" className="animate-[dash_2s_auto]" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="12" strokeDasharray={`${(projectPercent / 100) * 251.2} 251.2`} strokeDashoffset={`-${(wholesalePercent / 100) * 251.2}`} strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray={`${(otherPercent / 100) * 251.2} 251.2`} strokeDashoffset={`-${((wholesalePercent + projectPercent) / 100) * 251.2}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-headline font-bold text-slate-900">{totalNodes}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Assets</span>
              </div>
            </div>

            {/* 图例 */}
            <div className="grid grid-cols-3 gap-8 mt-12 w-full">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-1.5 w-8 rounded-full bg-[#005B99]" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter text-center">Wholesale</span>
                <span className="text-[10px] font-bold text-slate-400">{wholesalePercent}%</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-1.5 w-8 rounded-full bg-[#D4AF37]" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter text-center">Projects</span>
                <span className="text-[10px] font-bold text-slate-400">{projectPercent}%</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-1.5 w-8 rounded-full bg-[#6366f1]" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter text-center">Others</span>
                <span className="text-[10px] font-bold text-slate-400">{otherPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：系统负载与趋势 - Bar Chart Concept */}
        <div className="lg:col-span-7 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/10 space-y-8 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
             <Bot className="h-32 w-32 text-white" />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1 text-white">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                系统实时性能概览 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.1em]">Live performance monitor</p>
            </div>
            <div className="flex gap-2">
               <div className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 flex items-center text-[10px] font-bold text-white uppercase tracking-widest">Real-time</div>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-3 pt-12 relative z-10">
            {[40, 65, 45, 90, 60, 75, 40, 55, 80, 50, 65, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                <div className="relative w-full h-40 bg-white/5 rounded-t-lg overflow-hidden">
                  <div 
                    className={cn(
                      "absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/bar:brightness-125",
                      i === 3 ? "bg-accent shadow-[0_0_20px_rgba(212,175,55,0.4)]" : i === 9 ? "bg-emerald-500" : "bg-primary"
                    )}
                    style={{ height: `${val}%`, transitionDelay: `${i * 50}ms` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">{12 + i}:00</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-primary" />
                   <span className="text-[10px] font-bold text-white/60 uppercase">Sync Traffic</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-accent" />
                   <span className="text-[10px] font-bold text-white/60 uppercase">AI Load</span>
                </div>
             </div>
             <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">+4.2% Eff. increase</p>
          </div>
        </div>
      </div>

      {/* 底部：操作日志与快速入口 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 操作审计流 */}
        <div className="lg:col-span-8 bg-white/60 backdrop-blur-md border border-white/40 p-8 rounded-[2.5rem] space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" /> 操作审计流水 (Audit Log)
              </h3>
            </div>
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 text-primary">View Full History</Button>
          </div>

          <div className="space-y-4">
            {recentUpdates.length > 0 ? recentUpdates.map((log, i) => (
              <div key={i} className="group flex items-center justify-between p-5 bg-white/40 hover:bg-white border border-transparent hover:border-border/40 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className={cn("h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform", log.color)}>
                    <log.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-slate-900 tracking-tight">{log.action}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      <span className="text-primary/70">{log.user}</span>
                      <span className="w-px h-2 bg-slate-200" />
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-8 px-3 rounded-lg border border-slate-100 flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all cursor-pointer">Verify</div>
                </div>
              </div>
            )) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Clock className="h-8 w-8 opacity-20 mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No recent updates detected</p>
              </div>
            )}
          </div>
        </div>

        {/* 快捷中枢 */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] pl-2">快速管理中枢 (Center)</h3>
          {[
            { title: "发布新硬件产品", sub: "New Product Launch", href: "/admin/products", icon: Package, gradient: "from-blue-600 to-blue-400" },
            { title: "全站智译中枢", sub: "Global Localization", href: "/admin/translations", icon: Globe, gradient: "from-emerald-600 to-emerald-400" },
            { title: "配置核心视觉", icon: Home, sub: "Visual Configuration", href: "/admin/home", gradient: "from-slate-800 to-slate-700" }
          ].map((action, i) => (
            <Link key={i} href={action.href} className="group block relative overflow-hidden rounded-[2rem] p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 isolate">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity rounded-[2rem]", action.gradient)} />
              <div className="absolute right-0 bottom-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <action.icon className="h-24 w-24 text-white" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight">{action.title}</h4>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{action.sub}</p>
                </div>
              </div>
              <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all transform translate-x-4 group-hover:translate-x-0">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes dash {
          from { stroke-dashoffset: 251.2; }
          to { stroke-dashoffset: 0; }
        }
        .scrollbar-minimal::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-minimal::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
