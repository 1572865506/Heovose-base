"use client";

import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Users, 
  TrendingUp, 
  ExternalLink,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalDoc } from "@/hooks/use-local-doc";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const statCards = [
    { 
      label: "产品总量", 
      value: stats?.stats?.products || 0, 
      icon: Package, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      link: "/admin/products" 
    },
    { 
      label: "分类层级", 
      value: stats?.stats?.categories || 0, 
      icon: Layers, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      link: "/admin/categories" 
    },
    { 
      label: "系统成员", 
      value: stats?.stats?.users || 0, 
      icon: Users, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      link: "/admin/users" 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 顶部欢迎区 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            控制面板 (Overview)
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] pl-14">Management / System Status</p>
        </div>

        <div className="flex items-center gap-3">
           <Badge variant="outline" className="h-10 px-4 rounded-xl border-emerald-100 bg-emerald-50/50 text-emerald-600 font-bold gap-2">
             <ShieldCheck className="h-3.5 w-3.5" /> SYSTEM SECURE
           </Badge>
           <Link href="/admin/products/editor">
             <Button className="rounded-2xl h-12 px-6 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/20">
               <Plus className="h-3.5 w-3.5" /> 发布新硬件
             </Button>
           </Link>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.link}>
            <Card className="p-8 rounded-[2.5rem] border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className={stat.bg + " absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"} />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                  <div className={stat.color + " h-12 w-12 rounded-2xl flex items-center justify-center bg-white shadow-sm ring-1 ring-slate-100"}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-4xl font-headline font-bold text-slate-900">
                      {isLoading ? "..." : stat.value}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 最近更新产品 */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-primary" /> 最近更新的资源 (Recent Updates)
            </h3>
            <Link href="/admin/products" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">查看全部</Link>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-sm overflow-hidden">
            {isLoading ? (
               <div className="p-20 flex flex-col items-center justify-center gap-4 opacity-20">
                 <Zap className="h-8 w-8 animate-pulse" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em]">正在同步全息数据...</p>
               </div>
            ) : stats?.recentProducts?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.recentProducts.map((p: any) => (
                  <Link key={p.id} href={`/admin/products/editor?id=${p.id}`} className="flex items-center gap-6 p-6 hover:bg-slate-50/50 transition-colors group">
                    <div className="h-12 w-12 rounded-xl border border-slate-100 bg-white overflow-hidden relative shrink-0">
                      {p.mainImageUrl ? (
                        <Image src={p.mainImageUrl} alt="" fill className="object-contain p-1.5" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300"><Package className="h-5 w-5" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors truncate">{(p.nameText?.content as any)?.zh || (p.nameText as any)?.zh || p.id}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.category?.id || '未分类'}</p>
                    </div>
                    <div className="text-right shrink-0">
                       <Badge variant="secondary" className="text-[8px] font-bold uppercase h-5">{p.status}</Badge>
                       <p className="text-[9px] text-slate-300 mt-1 font-medium">{new Date(p.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-20 flex flex-col items-center justify-center gap-4 opacity-30">
                 <Package className="h-10 w-10 text-slate-200" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em]">暂无产品记录</p>
              </div>
            )}
          </div>
        </div>

        {/* 系统快捷入口 & 状态 */}
        <div className="lg:col-span-2 space-y-8">
           <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 px-2">快捷实验室 (Quick Lab)</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: "全局翻译", icon: Globe, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/translations" },
                   { label: "AI 核心", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/settings" },
                 ].map((nav, i) => (
                   <Link key={i} href={nav.href}>
                     <div className="p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className={nav.bg + " h-10 w-10 rounded-xl flex items-center justify-center " + nav.color + " mb-4"}>
                           <nav.icon className="h-5 w-5" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{nav.label}</p>
                     </div>
                   </Link>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Administrator Identity</p>
                  <h4 className="text-xl font-headline font-bold truncate">{session?.user?.name || "Administrator"}</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="opacity-40 uppercase tracking-widest">Current Role</span>
                    <span className="text-primary uppercase tracking-widest">{(session?.user as any)?.role || 'EDITOR'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="opacity-40 uppercase tracking-widest">Session Status</span>
                    <span className="text-emerald-400 uppercase tracking-widest">ACTIVE / VERIFIED</span>
                  </div>
                </div>
                <Link href="/admin/profile">
                  <Button variant="outline" className="w-full h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest mt-4">账户安全性配置</Button>
                </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
