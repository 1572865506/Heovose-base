'use client';

import { useState, useMemo } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { GlassCard } from '@/components/admin/GlassCard';
import {
  Users,
  Clock,
  Globe,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Navigation,
  Loader2,
  ChevronRight,
  MapPin,
  Zap,
  FileText,
  ShoppingBag,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { parseUA } from '@/lib/ua-parser';
import {
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
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const { data: sessions, isLoading: isSessionsLoading, mutate: mutateSessions } = useLocalCollection<any>('analytics/sessions');
  const { data: events, isLoading: isEventsLoading, mutate: mutateEvents } = useLocalCollection<any>('analytics/events');
  const { data: products, isLoading: isProductsLoading } = useLocalCollection<any>('products');
  const { data: inquiries, isLoading: isInquiriesLoading, mutate: mutateInquiries } = useLocalCollection<any>('inquiries');

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'year' | 'all'>('7d');
  const [matrixSortBy, setMatrixSortBy] = useState<'pv' | 'dwell'>('pv');

  // 一键清洗相关状态
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [clearInquiries, setClearInquiries] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  const isSuperAdmin = (session?.user as any)?.role === 'superadmin';

  const stats = useMemo(() => {
    if (!sessions || !events) return null;

    const now = new Date();

    // 过滤辅助函数：判断是否在所选时间范围内
    const isInTimeRange = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const diffTime = now.getTime() - date.getTime();

      switch (timeRange) {
        case '24h':
          return diffTime <= 24 * 60 * 60 * 1000;
        case '7d':
          return diffTime <= 7 * 24 * 60 * 60 * 1000;
        case '30d':
          return diffTime <= 30 * 24 * 60 * 60 * 1000;
        case 'year':
          return date.getFullYear() === now.getFullYear();
        case 'all':
        default:
          return true;
      }
    };

    // 1. Filter events to exclude admin/dashboard paths AND match timeRange
    const filteredEvents = events.filter((e: any) =>
      !e.path?.startsWith('/admin') &&
      !e.path?.startsWith('/dashboard') &&
      isInTimeRange(e.timestamp)
    );

    // 2. Filter sessions to match timeRange
    const timeFilteredSessions = sessions.filter((s: any) => isInTimeRange(s.createdAt));

    // 3. Identify sessions that have at least one frontend event in this timeRange
    const frontendSessionIds = new Set(filteredEvents.map((e: any) => e.sessionId));
    const filteredSessions = timeFilteredSessions.filter((s: any) => frontendSessionIds.has(s.id));

    // Calculate metrics based on filtered data
    const totalSessions = filteredSessions.length;
    const uniqueVisitors = new Set(filteredSessions.map((s: any) => s.visitorId)).size;
    const totalEvents = filteredEvents.length;
    const clickEvents = filteredEvents.filter((e: any) => e.type === 'CLICK').length;

    // Page distribution (PV)
    const pageCounts: Record<string, number> = {};
    filteredEvents
      .filter((e: any) => e.type === 'PAGEVIEW')
      .forEach((e: any) => {
        pageCounts[e.path] = (pageCounts[e.path] || 0) + 1;
      });

    // Dwell Time (停留时间) 统计
    const pathDurations: Record<string, { total: number; count: number }> = {};
    events.forEach((e: any) => {
      const duration = e.extraData?.duration;
      if (duration !== undefined && duration !== null) {
        const d = Number(duration);
        if (!isNaN(d) && d > 0) {
          if (!pathDurations[e.path]) {
            pathDurations[e.path] = { total: 0, count: 0 };
          }
          pathDurations[e.path].total += d;
          pathDurations[e.path].count += 1;
        }
      }
    });

    const pathAverageDurations: Record<string, number> = {};
    Object.entries(pathDurations).forEach(([path, { total, count }]) => {
      pathAverageDurations[path] = Math.round(total / count);
    });

    // 整合页面矩阵数据
    const matrixData = Object.entries(pageCounts).map(([path, pv]) => {
      const avgDwell = pathAverageDurations[path] || 0;
      return { path, pv, avgDwell };
    });

    // 根据选择的维度进行排序 (PV 或 停留时间)
    const sortedPages = matrixData
      .sort((a, b) => {
        if (matrixSortBy === 'dwell') {
          return b.avgDwell - a.avgDwell;
        }
        return b.pv - a.pv;
      })
      .slice(0, 10);

    // 联合统计各产品的访问和询盘量
    const productStats: Record<string, { views: number; inquiries: number }> = {};

    // 1. 统计当前时间段内产品页面的 PAGEVIEW 事件数量
    filteredEvents
      .filter((e: any) => e.type === 'PAGEVIEW' && e.path?.startsWith('/products/'))
      .forEach((e: any) => {
        const prodId = e.path.split('/').pop();
        if (prodId) {
          if (!productStats[prodId]) productStats[prodId] = { views: 0, inquiries: 0 };
          productStats[prodId].views += 1;
        }
      });

    // 2. 统计当前时间段内产品的询盘数量 (过滤当前所选时间段内的 inquiries)
    const filteredInquiries = (inquiries || []).filter((inq: any) => isInTimeRange(inq.createdAt));
    filteredInquiries.forEach((inq: any) => {
      const prodId = inq.productId;
      if (prodId) {
        if (!productStats[prodId]) productStats[prodId] = { views: 0, inquiries: 0 };
        productStats[prodId].inquiries += 1;
      }
    });

    // 3. 与 products 列表联合生成指标
    const productMetrics = (products || []).map((prod: any) => {
      const statsForProd = productStats[prod.id] || { views: 0, inquiries: 0 };
      const views = statsForProd.views;
      const inqCount = statsForProd.inquiries;
      const name = prod.nameText?.content?.zh || prod.nameText?.content?.en || '未命名产品';
      const conversion = views > 0 ? `${Math.round((inqCount / views) * 100)}%` : '0%';

      return {
        id: prod.id,
        name,
        views,
        inquiries: inqCount,
        conversion
      };
    }).sort((a: any, b: any) => b.views - a.views) // 默认按访问量倒序
      .slice(0, 8); // 取前8个

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
    const deviceCounts: Record<string, number> = { '桌面端': 0, '移动端': 0, '平板端': 0 };
    filteredSessions.forEach((s: any) => {
      const { type } = parseUA(s.userAgent);
      const zhType = type === 'Desktop' ? '桌面端' : type === 'Mobile' ? '移动端' : type === 'Tablet' ? '平板端' : type;
      deviceCounts[zhType] = (deviceCounts[zhType] || 0) + 1;
    });
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

    // Time Series based on selected timeRange
    let timeSeries: { date: string; sessions: number; events: number }[] = [];

    if (timeRange === '24h') {
      timeSeries = Array.from({ length: 24 }, (_, i) => {
        const d = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        const hourStr = d.getHours().toString().padStart(2, '0') + ':00';

        const hourlySessions = filteredSessions.filter((s: any) => {
          const sd = new Date(s.createdAt);
          return sd.toDateString() === d.toDateString() && sd.getHours() === d.getHours();
        }).length;

        const hourlyEvents = filteredEvents.filter((e: any) => {
          const ed = new Date(e.timestamp);
          return ed.toDateString() === d.toDateString() && ed.getHours() === d.getHours();
        }).length;

        return {
          date: hourStr,
          sessions: hourlySessions,
          events: hourlyEvents
        };
      });
    } else if (timeRange === '7d' || timeRange === '30d') {
      const daysCount = timeRange === '7d' ? 7 : 30;
      timeSeries = Array.from({ length: daysCount }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (daysCount - 1 - i));
        const dateStr = d.toISOString().split('T')[0];

        const dailySessions = filteredSessions.filter((s: any) =>
          new Date(s.createdAt).toISOString().split('T')[0] === dateStr
        ).length;

        const dailyEvents = filteredEvents.filter((e: any) =>
          new Date(e.timestamp).toISOString().split('T')[0] === dateStr
        ).length;

        return {
          date: dateStr.split('-').slice(1).join('/'),
          sessions: dailySessions,
          events: dailyEvents
        };
      });
    } else if (timeRange === 'year') {
      timeSeries = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i; // 0-11
        const monthLabel = `${monthNum + 1}月`;

        const monthlySessions = filteredSessions.filter((s: any) => {
          const sd = new Date(s.createdAt);
          return sd.getFullYear() === now.getFullYear() && sd.getMonth() === monthNum;
        }).length;

        const monthlyEvents = filteredEvents.filter((e: any) => {
          const ed = new Date(e.timestamp);
          return ed.getFullYear() === now.getFullYear() && ed.getMonth() === monthNum;
        }).length;

        return {
          date: monthLabel,
          sessions: monthlySessions,
          events: monthlyEvents
        };
      });
    } else {
      let startYear = now.getFullYear();
      let startMonth = now.getMonth();

      const allDates = [
        ...filteredSessions.map((s: any) => new Date(s.createdAt)),
        ...filteredEvents.map((e: any) => new Date(e.timestamp))
      ].filter(d => !isNaN(d.getTime()));

      if (allDates.length > 0) {
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        startYear = minDate.getFullYear();
        startMonth = minDate.getMonth();
      } else {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        startYear = sixMonthsAgo.getFullYear();
        startMonth = sixMonthsAgo.getMonth();
      }

      const monthsList: { year: number; month: number; label: string }[] = [];
      let tempYear = startYear;
      let tempMonth = startMonth;

      while (tempYear < now.getFullYear() || (tempYear === now.getFullYear() && tempMonth <= now.getMonth())) {
        monthsList.push({
          year: tempYear,
          month: tempMonth,
          label: `${tempYear}/${(tempMonth + 1).toString().padStart(2, '0')}`
        });
        tempMonth++;
        if (tempMonth > 11) {
          tempMonth = 0;
          tempYear++;
        }
      }

      timeSeries = monthsList.map(({ year, month, label }) => {
        const monthlySessions = filteredSessions.filter((s: any) => {
          const sd = new Date(s.createdAt);
          return sd.getFullYear() === year && sd.getMonth() === month;
        }).length;

        const monthlyEvents = filteredEvents.filter((e: any) => {
          const ed = new Date(e.timestamp);
          return ed.getFullYear() === year && ed.getMonth() === month;
        }).length;

        return {
          date: label,
          sessions: monthlySessions,
          events: monthlyEvents
        };
      });
    }

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
      referrerData,
      productMetrics
    };
  }, [sessions, events, timeRange, matrixSortBy, products, inquiries]);

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/analytics/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearInquiries })
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || '数据清洗失败');
      }
      toast({
        title: "清洗成功",
        description: "所有开发/测试流量数据已被物理清空，图表已恢复初始状态。"
      });
      setIsClearOpen(false);
      setConfirmText("");
      // 触发 localCollection 的 mutate，立刻刷新前端视图归零
      mutateSessions();
      mutateEvents();
      if (clearInquiries) {
        mutateInquiries();
      }
    } catch (e: any) {
      toast({
        title: "操作失败",
        description: e.message || "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '24h': return '过去 24 小时';
      case '7d': return '过去 7 天';
      case '30d': return '过去 30 天';
      case 'year': return '今年';
      case 'all': return '全部时间';
    }
  };

  const formatDwellTime = (seconds: number) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  if (isSessionsLoading || isEventsLoading || isProductsLoading || isInquiriesLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">正在生成深度洞察报告 / GENERATING INSIGHTS</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <AdminPageHeader
        title="数据洞察中心"
        subtitle="Overview / Analytics"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="inline-flex p-1 rounded-2xl bg-card border border-border/20 backdrop-blur-md">
              {[
                { value: '24h', label: '24小时' },
                { value: '7d', label: '7天' },
                { value: '30d', label: '30天' },
                { value: 'year', label: '今年' },
                { value: 'all', label: '全部' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setTimeRange(item.value as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300",
                    timeRange === item.value
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {isSuperAdmin && (
              <Button
                variant="outline"
                className="group h-12 rounded-2xl px-6 font-bold text-[10px] border-red-500/20 bg-transparent text-red-500 hover:bg-red-500/10 hover:!text-red-500 hover:!border-red-500/50 shadow-sm transition-all"
                onClick={() => setIsClearOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:!text-red-500" /> 清洗测试数据
              </Button>
            )}

            <Button
              variant="outline"
              className="h-12 rounded-2xl px-6 font-bold uppercase tracking-widest text-[10px] border-border/40 hover:bg-muted/10 text-foreground"
              onClick={() => setIsReportOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" /> 生成深度报告
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 shadow-sm shrink-0">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">实时监听中</span>
            </div>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '总访问会话', value: stats?.totalSessions || 0, icon: Globe, trend: '+12%', color: 'blue', sub: getTimeRangeLabel() },
          { label: '独立访客数', value: stats?.uniqueVisitors || 0, icon: Users, trend: '+8%', color: 'indigo', sub: getTimeRangeLabel() },
          { label: '交互总次数', value: stats?.totalEvents || 0, icon: Activity, trend: '+24%', color: 'orange', sub: getTimeRangeLabel() },
          { label: '平均转化率', value: `${Math.round((stats?.clickEvents || 0) / (stats?.totalEvents || 1) * 100)}%`, icon: Zap, trend: '+5%', color: 'yellow', sub: getTimeRangeLabel() },
        ].map((stat, i) => (
          <GlassCard key={i} className="border-none overflow-hidden group hover:translate-y-1 transition-all duration-500 bg-card">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner",
                  stat.color === 'blue' ? "bg-blue-500/10 text-blue-400" :
                    stat.color === 'indigo' ? "bg-indigo-500/10 text-indigo-400" :
                      stat.color === 'orange' ? "bg-orange-500/10 text-orange-400" : "bg-yellow-500/10 text-yellow-400"
                )}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                  stat.trend.startsWith('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
                )}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-6 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <span className="text-[8px] font-bold text-muted-foreground/40 uppercase">{stat.sub}</span>
                </div>
                <p className="text-3xl font-headline font-black text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart - Traffic Over Time */}
        <GlassCard className="lg:col-span-8 border-none bg-card overflow-hidden">
          <CardHeader className="p-10 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-headline font-bold text-foreground">流量动态监测</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  Traffic Volume Tracking ({timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : timeRange === 'year' ? 'This Year' : 'All Time'})
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold py-1 px-2.5 rounded-lg">访问会话</Badge>
                <Badge className="bg-orange-500/10 text-orange-500 border-none text-[10px] font-bold py-1 px-2.5 rounded-lg">交互事件</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border) / 0.1)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground) / 0.4)' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground) / 0.4)' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1.25rem', border: '1px solid hsl(var(--border) / 0.2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', padding: '1rem' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '0.25rem' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="访问会话 (Sessions)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    name="交互事件 (Events)"
                    stroke="#f97316"
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill="url(#colorEvents)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassCard>

        {/* Device Breakdown & Heatmap */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="border-none bg-slate-900 text-white overflow-hidden relative">
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
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={8}
                        cornerRadius={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats?.deviceData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#0ea5e9', '#f59e0b'][index % 3]} />
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
                        <div className="h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: ['#6366f1', '#0ea5e9', '#f59e0b'][i % 3] }} />
                        <span className="text-[10px] font-bold text-white/40 group-hover/item:text-white transition-colors">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-white/80">{Math.round((item.value / (stats?.totalSessions || 1)) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </GlassCard>

          <Link href="/admin/analytics/heatmap">
            <GlassCard className="border-none bg-card overflow-hidden hover:translate-y-[-4px] transition-all duration-500 cursor-pointer group">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/4 transition-all duration-500 shadow-inner">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">交互热力图分析</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Heatmap Behavior Tracking</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-all" />
              </CardContent>
            </GlassCard>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Geographic Distribution */}
        <GlassCard className="lg:col-span-5 border-none bg-card overflow-hidden">
          <CardHeader className="p-10 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-headline font-bold text-foreground">访客来源分布</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Geographic Influence</CardDescription>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground/10" />
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            {stats?.geoData.slice(0, 6).map((item: any, i: number) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground/20">0{i + 1}</span>
                    <span className="text-sm font-bold text-foreground uppercase tracking-tighter">{item.name || '其他'}</span>
                  </div>
                  <span className="text-sm font-black text-foreground">{item.value} <span className="text-[10px] text-muted-foreground">UV</span></span>
                </div>
                <Progress
                  value={stats.geoData[0]?.value ? (item.value / stats.geoData[0].value) * 100 : 0}
                  className="h-1.5 bg-muted/20"
                />
              </div>
            ))}
          </CardContent>
        </GlassCard>

        {/* Content Performance (核心内容热度矩阵) */}
        <GlassCard className="lg:col-span-7 border-none bg-card overflow-hidden">
          <CardHeader className="p-10 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-headline font-bold text-foreground">核心内容热度矩阵</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Content matrix performance</CardDescription>
              </div>
              {/* 排序筛选按钮 */}
              <div className="inline-flex p-1 rounded-xl bg-muted/50 border border-border/10 backdrop-blur-sm shrink-0">
                <button
                  onClick={() => setMatrixSortBy('pv')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-300",
                    matrixSortBy === 'pv' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  按浏览量 (PV)
                </button>
                <button
                  onClick={() => setMatrixSortBy('dwell')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-300",
                    matrixSortBy === 'dwell' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  按停留时间
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                  <th className="px-10 py-6">路径 / Page Path</th>
                  <th className="px-10 py-6 text-right">浏览量 / PV</th>
                  <th className="px-10 py-6 text-right">平均停留时间</th>
                  <th className="px-10 py-6 text-right">占比 / Share</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-muted-foreground">
                {stats?.sortedPages.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-border/10 group hover:bg-muted/10 transition-all">
                    <td className="px-10 py-5 font-mono text-muted-foreground/60 group-hover:text-primary">{item.path}</td>
                    <td className="px-10 py-5 text-right font-black text-foreground">{item.pv}</td>
                    <td className="px-10 py-5 text-right text-indigo-400 font-mono">{formatDwellTime(item.avgDwell)}</td>
                    <td className="px-10 py-5 text-right">
                      <Badge variant="secondary" className="rounded-full bg-muted/20 text-muted-foreground border-none font-bold">
                        {stats.totalEvents > 0 ? Math.round((item.pv / stats.totalEvents) * 100) : 0}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </GlassCard>
      </div>

      {/* 产品维度数据监测板块 */}
      <GlassCard className="border-none bg-card overflow-hidden">
        <CardHeader className="p-10 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline font-bold text-foreground">产品数据监测中心</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Product Traffic & Inquiry Conversion Analysis</CardDescription>
            </div>
            <ShoppingBag className="h-8 w-8 text-muted-foreground/10" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                <th className="px-10 py-6">产品名称</th>
                <th className="px-10 py-6 text-right">被访问数量 (PV)</th>
                <th className="px-10 py-6 text-right">产品询盘数</th>
                <th className="px-10 py-6 text-right">询盘转化率</th>
                <th className="px-10 py-6 text-right">转化趋势</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-muted-foreground">
              {stats?.productMetrics && stats.productMetrics.length > 0 ? (
                stats.productMetrics.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-border/10 group hover:bg-muted/10 transition-all">
                    <td className="px-10 py-5 font-semibold text-foreground group-hover:text-primary max-w-xs truncate">{item.name}</td>
                    <td className="px-10 py-5 text-right font-mono text-muted-foreground/60">{item.views} 次</td>
                    <td className="px-10 py-5 text-right font-mono text-foreground flex items-center justify-end gap-1.5">
                      <MessageSquare className="h-3 w-3 text-orange-400" />
                      <span>{item.inquiries} 个</span>
                    </td>
                    <td className="px-10 py-5 text-right font-black text-green-500 font-mono">{item.conversion}</td>
                    <td className="px-10 py-5 text-right">
                      <div className="w-24 ml-auto">
                        <Progress
                          value={parseFloat(item.conversion) || 0}
                          className="h-1.5 bg-muted/20"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground/40 font-medium">
                    暂无产品监测数据，请先前去前台浏览产品或提交询盘。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </GlassCard>

      <AnalyticsReport
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={stats}
      />

      {/* 数据清洗二次确认弹框 */}
      <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <DialogContent className="max-w-md rounded-[2rem] bg-card border border-border/20 p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">物理清洗测试数据</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              此操作将从数据库中<strong className="text-red-500">物理清空</strong>所有访客会话（VisitorSession）和埋点事件（AnalyticsEvent）。操作一旦执行将无法恢复！
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="clearInquiries"
                checked={clearInquiries}
                onChange={(e) => setClearInquiries(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="clearInquiries" className="text-xs font-bold text-foreground cursor-pointer">
                同时清空客户提交的测试询盘数据 (Inquiries)
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                输入 <span className="text-red-500 font-black">CLEAR</span> 以确认操作
              </label>
              <input
                type="text"
                placeholder="CLEAR"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border/20 bg-muted/20 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsClearOpen(false);
                setConfirmText("");
              }}
              className="h-12 rounded-xl px-6 text-xs font-bold"
            >
              取消
            </Button>
            <Button
              onClick={handleClearData}
              disabled={confirmText !== "CLEAR" || isClearing}
              className="h-12 rounded-xl px-6 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10"
            >
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  清洗中...
                </>
              ) : (
                "确认清洗"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
