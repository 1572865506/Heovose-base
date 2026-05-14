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
  ChevronRight,
  MapPin,
  Calendar,
  Zap,
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { parseUA } from '@/lib/ua-parser';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { AnalyticsReport } from '@/components/admin/AnalyticsReport';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const { data: sessions, isLoading: isSessionsLoading } = useLocalCollection<any>('analytics/sessions');
  const { data: events, isLoading: isEventsLoading } = useLocalCollection<any>('analytics/events');
  const [isReportOpen, setIsReportOpen] = useState(false);

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
      .slice(0, 10);

    // Geo Distribution
    const countryCounts: Record<string, number> = {};
    filteredSessions.forEach((s: any) => {
      const country = s.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const geoData = Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Device Distribution
    const deviceCounts: Record<string, number> = { 'Desktop': 0, 'Mobile': 0, 'Tablet': 0 };
    filteredSessions.forEach((s: any) => {
      const { type } = parseUA(s.userAgent);
      deviceCounts[type] = (deviceCounts[type] || 0) + 1;
    });
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

    // Time Series (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const timeSeries = last7Days.map(date => {
      const dailySessions = filteredSessions.filter((s: any) => 
        new Date(s.createdAt).toISOString().split('T')[0] === date
      ).length;
      const dailyEvents = filteredEvents.filter((e: any) => 
        new Date(e.timestamp).toISOString().split('T')[0] === date
      ).length;
      return { 
        date: date.split('-').slice(1).join('/'), 
        sessions: dailySessions,
        events: dailyEvents 
      };
    });

    // Referrer Analysis
    const referrerCounts: Record<string, number> = {};
    filteredSessions.forEach((s: any) => {
      let source = 'Direct';
      if (s.referrer) {
        try {
          const url = new URL(s.referrer);
          if (url.hostname.includes('google')) source = 'Search (Google)';
          else if (url.hostname.includes('bing')) source = 'Search (Bing)';
          else if (url.hostname.includes('facebook') || url.hostname.includes('t.co')) source = 'Social';
          else source = url.hostname;
        } catch {
          source = 'Other';
        }
      }
      referrerCounts[source] = (referrerCounts[source] || 0) + 1;
    });
    const referrerData = Object.entries(referrerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalSessions,
      uniqueVisitors,
      totalEvents,
      clickEvents,
      sortedPages,
      geoData,
      deviceData,
      timeSeries,
      referrerData
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
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">数据洞察中心</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">深度解析全链路访客行为，挖掘多维度业务增长节点。</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button 
             variant="outline" 
             className="h-12 rounded-2xl px-6 font-bold uppercase tracking-widest text-[10px] border-slate-200 hover:bg-slate-50"
             onClick={() => setIsReportOpen(true)}
           >
             <FileText className="mr-2 h-4 w-4" /> 生成深度报告
           </Button>
           <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 shadow-sm">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">实时监听中</span>
           </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '总访问会话', value: stats?.totalSessions || 0, icon: Globe, trend: '+12%', color: 'blue', sub: '过去 7 天' },
          { label: '独立访客数', value: stats?.uniqueVisitors || 0, icon: Users, trend: '+8%', color: 'indigo', sub: '过去 7 天' },
          { label: '交互总次数', value: stats?.totalEvents || 0, icon: Activity, trend: '+24%', color: 'orange', sub: '过去 7 天' },
          { label: '平均转化率', value: `${Math.round((stats?.clickEvents || 0) / (stats?.totalEvents || 1) * 100)}%`, icon: Zap, trend: '+5%', color: 'yellow', sub: '过去 7 天' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-[0_16px_32px_-8px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden group hover:translate-y-[-4px] transition-all duration-500 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner",
                  stat.color === 'blue' ? "bg-blue-50 text-blue-500" :
                  stat.color === 'indigo' ? "bg-indigo-50 text-indigo-500" :
                  stat.color === 'orange' ? "bg-orange-50 text-orange-500" : "bg-yellow-50 text-yellow-600"
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
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{stat.sub}</span>
                </div>
                <p className="text-3xl font-headline font-black text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart - Traffic Over Time */}
        <Card className="lg:col-span-8 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-10 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-headline font-bold text-slate-900">流量动态监测</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Traffic Volume Tracking (Last 7 Days)</CardDescription>
              </div>
              <div className="flex gap-2">
                 <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black">SESSIONS</Badge>
                 <Badge variant="outline" className="text-slate-300 border-slate-100 text-[9px] font-black">EVENTS</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.timeSeries}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#cbd5e1' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#cbd5e1' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '1.25rem' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSessions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown & Heatmap */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-12 -translate-y-12" />
            <CardHeader className="p-10 border-b border-white/5 relative z-10">
              <CardTitle className="text-xl font-headline font-bold">终端设备画像</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">Infrastructure Profiling</CardDescription>
            </CardHeader>
            <CardContent className="p-10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.deviceData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.deviceData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#ffffff', '#3b82f6', '#fcd34d'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                   {stats?.deviceData.map((item: any, i: number) => (
                     <div key={i} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ['#ffffff', '#3b82f6', '#fcd34d'][i % 3] }} />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover/item:text-white transition-colors">{item.name}</span>
                        </div>
                        <span className="text-sm font-black text-white/80">{Math.round((item.value / (stats?.totalSessions || 1)) * 100)}%</span>
                     </div>
                   ))}
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
                        <p className="text-sm font-bold text-slate-900">交互热力图分析</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Heatmap Behavior Tracking</p>
                     </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all" />
               </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Geographic Distribution */}
        <Card className="lg:col-span-5 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-10 border-b border-slate-50">
             <div className="flex items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-headline font-bold text-slate-900">访客来源分布</CardTitle>
                   <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Geographic Influence</CardDescription>
                </div>
                <MapPin className="h-8 w-8 text-slate-100" />
             </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
             {stats?.geoData.slice(0, 6).map((item: any, i: number) => (
               <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-200">0{i+1}</span>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tighter">{item.name || '其他'}</span>
                     </div>
                     <span className="text-sm font-black text-slate-900">{item.value} <span className="text-[10px] text-slate-400">UV</span></span>
                  </div>
                  <Progress 
                    value={(item.value / stats.geoData[0].value) * 100} 
                    className="h-1.5 bg-slate-50"
                  />
               </div>
             ))}
          </CardContent>
        </Card>

        {/* Content Performance */}
        <Card className="lg:col-span-7 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
           <CardHeader className="p-10 border-b border-slate-50">
              <div className="flex items-center justify-between">
                 <div>
                    <CardTitle className="text-xl font-headline font-bold text-slate-900">核心内容热度矩阵</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Content matrix performance</CardDescription>
                 </div>
                 <Zap className="h-8 w-8 text-slate-100" />
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                       <th className="px-10 py-6">路径 / Page Path</th>
                       <th className="px-10 py-6 text-right">浏览量 / PV</th>
                       <th className="px-10 py-6 text-right">占比 / Share</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs font-bold text-slate-600">
                    {stats?.sortedPages.map(([path, count]: any, i: number) => (
                       <tr key={i} className="border-t border-slate-50 group hover:bg-slate-50/50 transition-all">
                          <td className="px-10 py-5 font-mono text-slate-500 group-hover:text-primary">{path}</td>
                          <td className="px-10 py-5 text-right font-black text-slate-900">{count}</td>
                          <td className="px-10 py-5 text-right">
                             <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 border-none font-bold">
                                {Math.round((count / stats.totalEvents) * 100)}%
                             </Badge>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </CardContent>
        </Card>
      </div>

      <AnalyticsReport 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        data={stats} 
      />
    </div>
  );
}
