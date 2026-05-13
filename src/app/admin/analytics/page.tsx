'use client';

import { useState, useMemo } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Users, 
  MousePointer2, 
  Clock, 
  Globe, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Monitor,
  Smartphone,
  Navigation,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { data: sessions, isLoading: isSessionsLoading } = useLocalCollection<any>('analytics/sessions');
  const { data: events, isLoading: isEventsLoading } = useLocalCollection<any>('analytics/events');

  const stats = useMemo(() => {
    if (!sessions || !events) return null;

    // 1. Filter events to exclude admin/dashboard paths
    const filteredEvents = events.filter((e: any) => 
      !e.path?.startsWith('/admin') && 
      !e.path?.startsWith('/dashboard')
    );

    // 2. Identify sessions that have at least one frontend event
    const frontendSessionIds = new Set(filteredEvents.map((e: any) => e.sessionId));
    const filteredSessions = sessions.filter((s: any) => frontendSessionIds.has(s.id));

    // 3. Calculate metrics based on filtered data
    const totalSessions = filteredSessions.length;
    const uniqueVisitors = new Set(filteredSessions.map((s: any) => s.visitorId)).size;
    const totalEvents = filteredEvents.length;
    const clickEvents = filteredEvents.filter((e: any) => e.type === 'CLICK').length;

    // Page distribution
    const pageCounts: Record<string, number> = {};
    filteredEvents
      .filter((e: any) => e.type === 'PAGEVIEW')
      .forEach((e: any) => {
        pageCounts[e.path] = (pageCounts[e.path] || 0) + 1;
      });

    const sortedPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalSessions,
      uniqueVisitors,
      totalEvents,
      clickEvents,
      sortedPages
    };
  }, [sessions, events]);

  if (isSessionsLoading || isEventsLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest animate-pulse">正在生成深度洞察报告 / GENERATING INSIGHTS</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">数据洞察</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">实时监控全站流量、访客行为及交互转化热区。</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">实时监听中 (Live Tracking Active)</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '总访问会话', value: stats?.totalSessions || 0, icon: Globe, trend: '+12%', color: 'blue' },
          { label: '独立访客数', value: stats?.uniqueVisitors || 0, icon: Users, trend: '+8%', color: 'indigo' },
          { label: '交互总次数', value: stats?.totalEvents || 0, icon: Activity, trend: '+24%', color: 'orange' },
          { label: '平均停留时长', value: '4m 32s', icon: Clock, trend: '-2%', color: 'slate' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-[0_16px_32px_-8px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden group hover:translate-y-[-4px] transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner",
                  stat.color === 'blue' ? "bg-blue-50 text-blue-500" :
                  stat.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                  stat.color === 'orange' ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-500"
                )}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                  stat.trend.startsWith('+') ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                )}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-6 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-headline font-black text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Page Distribution */}
        <Card className="lg:col-span-7 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-headline font-bold text-slate-900">核心页面热度</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Page View Distribution</CardDescription>
              </div>
              <BarChart3 className="h-8 w-8 text-slate-200" />
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            {stats?.sortedPages.map(([path, count], i) => (
              <div key={path} className="space-y-3 group">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      0{i+1}
                    </div>
                    <span className="text-sm font-bold text-slate-700 font-mono tracking-tight">{path}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{count} <span className="text-[10px] font-bold text-slate-400 uppercase">PV</span></span>
                </div>
                <Progress 
                  value={(count / (stats.sortedPages[0][1] as number)) * 100} 
                  className="h-2 bg-slate-50"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Interaction Profile */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
            <CardHeader className="p-10 border-b border-white/5 relative z-10">
              <CardTitle className="text-lg font-headline font-bold">交互成分分析</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Event Type Composition</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8 relative z-10">
              <div className="flex items-center gap-8">
                 <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                        className="text-primary"
                        strokeDasharray={`${(stats?.clickEvents || 0) / (stats?.totalEvents || 1) * 282} 282`} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black">{Math.round((stats?.clickEvents || 0) / (stats?.totalEvents || 1) * 100)}%</span>
                    </div>
                 </div>
                 <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">有效点击 (Clicks)</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-tighter">Heatmap Triggered</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">被动浏览 (Views)</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-tighter">Auto-Recorded</span>
                      </div>
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                    <Monitor className="h-5 w-5 text-blue-400 mb-3" />
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">桌面端</p>
                    <p className="text-xl font-headline font-bold">72%</p>
                 </div>
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                    <Smartphone className="h-5 w-5 text-accent mb-3" />
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">移动端</p>
                    <p className="text-xl font-headline font-bold">28%</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/admin/analytics/heatmap">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden hover:translate-y-[-4px] transition-all duration-500 cursor-pointer group">
               <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                        <Navigation className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-900">查看热区分析地图</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interaction Heatmap Overlay</p>
                     </div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-primary/20 group-hover:text-primary transition-all">
                     <ChevronRight className="h-5 w-5" />
                  </div>
               </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
