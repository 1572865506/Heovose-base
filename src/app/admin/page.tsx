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
  Globe,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalDoc } from "@/hooks/use-local-doc";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getAssetUrl } from '@/lib/image-utils';
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GlassCard } from "@/components/admin/GlassCard";

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
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      link: "/admin/products"
    },
    {
      label: "分类层级",
      value: stats?.stats?.categories || 0,
      icon: Layers,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      link: "/admin/categories"
    },
    {
      label: "系统成员",
      value: stats?.stats?.users || 0,
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      link: "/admin/users"
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-8rem)] space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">


      <AdminPageHeader
        title="控制面板"
        subtitle="Overview / Dashboard"
        icon={LayoutDashboard}
        actions={
          <>
            <Badge variant="outline" className="h-12 px-6 rounded-2xl border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-bold gap-3 shadow-sm shrink-0">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="uppercase tracking-[0.1em] text-[10px]">Security Protocol Active</span>
            </Badge>
            <Link href="/admin/products/editor">
              <Button className="rounded-2xl h-12 px-8 font-bold uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white border-none">
                <Plus className="h-4 w-4" /> 发布新硬件
              </Button>
            </Link>
          </>
        }
      />

      {/* 统计概览 - 极光玻璃卡片群 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.link} className="group">
            <GlassCard className="p-10 border backdrop-blur-3xl hover:shadow-[0_10px_20px_-20px_rgba(0,91,153,0.12)] hover:-translate-y-1 relative">
              <div className={cn(stat.bg, "absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10 blur-[80px] group-hover:scale-150 transition-transform duration-1000")} />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-8">
                  <div className={cn(stat.color, "h-16 w-16 rounded-[1.5rem] flex items-center justify-center bg-background/50 border border-border/5 shadow-inner")}>
                    <stat.icon className="h-8 w-8 transition-transform duration-500 group-hover:rotate-6" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">{stat.label}</p>
                    <p className="text-5xl font-headline font-bold text-foreground tracking-tighter">
                      {isLoading ? (
                        <span className="inline-block w-12 h-10 bg-muted/20 animate-pulse rounded-lg" />
                      ) : stat.value}
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 relative z-10">
        {/* 最近更新产品 - 工业级黑盒列表 */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.35em] text-foreground/30 flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,91,153,0.8)]" />
              最近更新的资源
            </h3>
            <Link href="/admin/products" className="group/all flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-all">
              查看全部 <ArrowRight className="h-3 w-3 transition-transform group-hover/all:translate-x-1" />
            </Link>
          </div>

          <GlassCard className="backdrop-blur-3xl overflow-hidden">
            {isLoading ? (
              <div className="p-32 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="h-14 w-14 rounded-2xl border-2 border-primary/20 animate-[spin_4s_linear_infinite]" />
                  <Zap className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">数据同步中...</p>
              </div>
            ) : stats?.recentProducts?.length > 0 ? (
              <div className="divide-y divide-border/5">
                {stats.recentProducts.map((p: any) => (
                  <Link key={p.id} href={`/admin/products/editor?id=${p.id}`} className="flex items-center gap-8 p-8 hover:bg-primary/[0.03] transition-all group relative">
                    <div className="h-16 w-16 rounded-[1.25rem] border border-border/10 bg-background/40 overflow-hidden relative shrink-0 group-hover:scale-105 transition-all duration-500 shadow-inner ring-1 ring-white/5">
                      {p.mainImageUrl ? (
                        <Image src={getAssetUrl(p.mainImageUrl)} alt="" fill className="object-contain p-2.5 brightness-110 contrast-110" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><Package className="h-8 w-8" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors truncate">{(p.nameText?.content as any)?.zh || (p.nameText as any)?.zh || p.id}</p>
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-0.5 rounded-md bg-muted/20 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{p.category?.id || 'GLOBAL'}</span>
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                        <p className="text-[9px] font-mono text-muted-foreground/40 tracking-wider">HEX_ID: {p.id.slice(0, 12).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-3">
                      <Badge className="text-[8px] font-black uppercase h-6 px-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg"> {p.status || 'PUBLISHED'} </Badge>
                      <div className="flex items-center gap-2 opacity-30">
                        <Clock className="h-3 w-3" />
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{new Date(p.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 rounded-r-full shadow-[0_0_15px_rgba(0,91,153,0.8)]" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-32 flex flex-col items-center justify-center gap-8 text-muted-foreground/10">
                <div className="p-12 rounded-[4rem] bg-muted/5 border border-border/10 shadow-inner">
                  <Package className="h-20 w-20 opacity-20" />
                </div>
                <p className="text-[12px] font-bold uppercase tracking-[0.5em] opacity-30">暂无资源记录 / EMPTY REGISTRY</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* 系统快捷入口 & 状态 - 极光黑曜石 */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.35em] text-foreground/30 px-4">核心功能入口</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "全局翻译", icon: Globe, color: "text-orange-400", bg: "bg-orange-500/10", href: "/admin/translations" },
                { label: "系统运维", icon: Zap, color: "text-primary", bg: "bg-primary/10", href: "/admin/settings" },
              ].map((nav, i) => (
                <Link key={i} href={nav.href} className="group">
                  <GlassCard className="p-8 hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
                    <div className={cn(nav.bg, "h-14 w-14 rounded-2xl flex items-center justify-center", nav.color, "mb-6 shadow-inner ring-1 ring-white/5")}>
                      <nav.icon className="h-7 w-7 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{nav.label}</p>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>

          {/* 身份核心卡片 - Adaptive Obsidian Style */}
          <GlassCard className="p-12 text-foreground dark:text-white relative overflow-hidden dark:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] dark:border-white/10 group ring-1 ring-black/5 dark:ring-white/5">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-40 group-hover:scale-125 transition-transform duration-[2000ms]" />
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-1000">
              <ShieldCheck className="h-40 w-40" />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,91,153,1)]" />
                  <p className="text-[10px] font-bold text-muted-foreground/60 dark:text-white/40 uppercase tracking-[0.5em]">Identity Verified</p>
                </div>
                <h4 className="text-3xl font-headline font-black truncate tracking-tighter drop-shadow-2xl">
                  {session?.user?.name || "ADMINISTRATOR"}
                </h4>
              </div>

              <div className="space-y-6 pt-6 border-t border-border/40 dark:border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-muted-foreground/50 dark:text-white/30 uppercase tracking-[0.2em]">Security Tier</span>
                  <Badge className="bg-muted dark:bg-white/10 text-foreground dark:text-white border-border dark:border-white/10 hover:bg-muted/80 dark:hover:bg-white/20 uppercase tracking-[0.2em] text-[9px] h-7 px-4 rounded-lg">
                    {(session?.user as any)?.role === 'superadmin' ? 'Tier-0 Root' : 'Tier-1 Editor'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-muted-foreground/50 dark:text-white/30 uppercase tracking-[0.2em]">Uplink Status</span>
                  <span className="text-emerald-500 uppercase tracking-[0.15em] flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    ENCRYPTED_ACTIVE
                  </span>
                </div>
              </div>

              <Link href="/admin/profile" className="block pt-4">
                <Button className="w-full h-16 rounded-[1.5rem] bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-primary/5 hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]">
                  安全身份配置 (Security)
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
