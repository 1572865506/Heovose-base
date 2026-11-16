'use client';

import React, { useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  Download, 
  FileText, 
  Globe, 
  Users, 
  Activity, 
  Smartphone,
  TrendingUp,
  MapPin,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ShieldCheck,
  Zap,
  Gauge,
  CheckCircle2,
  Package
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { getAssetUrl } from '@/lib/image-utils';

interface AnalyticsReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  timeRange?: string;
}

export function AnalyticsReport({ isOpen, onClose, data, timeRange = '7d' }: AnalyticsReportProps) {
  const { data: siteConfig } = useLocalDoc<any>('settings', 'site');

  const reportId = useMemo(() => {
    return `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }, [isOpen]);

  const reportDateFormatted = useMemo(() => {
    return new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }, [isOpen]);

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case '24h': return '近 24 小时 (Past 24 Hours)';
      case '7d': return '近 7 天统计 (Past 7 Days)';
      case '30d': return '近 30 天统计 (Past 30 Days)';
      case 'year': return '本年度统计 (Current Year)';
      case 'all': return '全部历史累计 (All Time)';
      default: return '近 7 天统计 (Past 7 Days)';
    }
  }, [timeRange]);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const exportData = {
      reportId,
      reportDate: new Date().toISOString(),
      timeRange,
      timeRangeLabel,
      company: siteConfig?.companyName || 'Heovose Technology',
      website: siteConfig?.siteUrl || 'https://www.heovose.com',
      metrics: {
        totalSessions: data.totalSessions,
        uniqueVisitors: data.uniqueVisitors,
        totalEvents: data.totalEvents,
        clickEvents: data.clickEvents,
        sessionsGrowth: data.sessionsGrowth,
        eventsGrowth: data.eventsGrowth,
        avgScrollDepth: `${data.avgScrollDepth}%`,
        formAbandonRate: `${data.formAbandonRate}%`,
        conversionRate: data.totalEvents > 0 ? `${Math.round((data.clickEvents / data.totalEvents) * 100)}%` : '0%'
      },
      timeSeries: data.timeSeries,
      geoDistribution: data.geoData,
      deviceBreakdown: data.deviceData,
      contentPerformance: data.sortedPages,
      productPerformance: data.productMetrics,
      referrerChannels: data.referrerData,
      performance: data.perfStats
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heovose-analytics-report-${reportId.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 统计概览计算
  const avgPagesPerSession = data.totalSessions > 0
    ? (data.totalEvents / data.totalSessions).toFixed(1)
    : '0.0';

  const totalInquiries = (data.productMetrics || []).reduce((acc: number, curr: any) => acc + (curr.inquiries || 0), 0);
  const totalProductViews = (data.productMetrics || []).reduce((acc: number, curr: any) => acc + (curr.views || 0), 0);
  const overallInquiryRate = totalProductViews > 0
    ? `${((totalInquiries / totalProductViews) * 100).toFixed(1)}%`
    : '0.0%';

  // 峰值数据计算
  const peakTimePoint = (data.timeSeries || []).reduce((prev: any, curr: any) => {
    return (curr.sessions > (prev?.sessions || 0)) ? curr : prev;
  }, null);

  const logoSrc = siteConfig?.logoStandard ? getAssetUrl(siteConfig.logoStandard) : '/image/Heovose-color.svg';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[92vh] overflow-y-auto scrollbar-minimal p-0 border border-border/40 shadow-2xl rounded-[2rem] bg-white print:fixed print:inset-0 print:h-auto print:w-auto print:max-w-none print:m-0 print:rounded-none print:overflow-visible print:bg-white print:z-[9999] print:border-none print:shadow-none">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { 
              size: A4 portrait;
              margin: 12mm 14mm 14mm 14mm;
            }
            
            body, html { 
              height: auto !important; 
              overflow: visible !important; 
              background: #ffffff !important;
              color: #0f172a !important;
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body * { visibility: hidden; }
            
            .print-area, .print-area * { visibility: visible; }
            
            .print-area { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important; 
              height: auto !important;
              overflow: visible !important;
              display: block !important;
              background: #ffffff !important;
              color: #0f172a !important;
              z-index: 99999 !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            [role="dialog"], div[data-state="open"] {
              position: static !important;
              transform: none !important;
              max-width: none !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
            }

            /* 隐藏屏幕专用按钮与浮动层 */
            .no-print, [aria-label="Close"], button[aria-label="Close"] { 
              display: none !important; 
            }
            
            /* 图表容器在打印机视口下的优化 */
            .recharts-responsive-container { 
              width: 100% !important; 
              height: 260px !important; 
              min-height: 260px !important;
            }
            .recharts-surface { 
              width: 100% !important; 
              height: 100% !important; 
            }
            
            /* 分页与断页防护 */
            .print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            
            section { 
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              margin-bottom: 1.5rem !important;
            }

            /* 强制背景色在打印时输出 */
            .print-bg-slate {
              background-color: #f8fafc !important;
              border-color: #e2e8f0 !important;
            }
            .print-bg-primary-light {
              background-color: #f0f7fc !important;
              border-color: #bae6fd !important;
            }
            .print-header-bg {
              background: #005B99 !important;
              color: #ffffff !important;
            }
          }
        ` }} />
        
        <div className="print-area font-body text-slate-800 antialiased">
          {/* ────── 报告封面标头 (Executive Header) ────── */}
          <div className="p-8 md:p-10 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden print:bg-none print:bg-white print:text-slate-900 print:border-b-2 print:border-slate-800 print:p-0 print:pb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              {/* 品牌 Logo 与企业名称 */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-auto max-w-[180px] flex items-center justify-center bg-white/95 rounded-xl p-2 shadow-sm border border-white/20 print:bg-transparent print:border-none print:p-0">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="max-h-8 w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="h-8 w-px bg-white/20 hidden md:block print:bg-slate-300" />
                <div>
                  <DialogTitle className="text-xl md:text-2xl font-headline font-bold tracking-tight text-white print:text-slate-900">
                    商业智能与流量转化深度洞察报告
                  </DialogTitle>
                  <DialogDescription className="text-[10px] md:text-xs text-white/70 uppercase tracking-[0.2em] font-mono mt-0.5 print:text-slate-500">
                    Executive Digital Analytics & Conversion Report
                  </DialogDescription>
                </div>
              </div>

              {/* 报告元数据标签 */}
              <div className="flex flex-wrap md:flex-col md:items-end gap-2 text-xs font-mono">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 print:bg-slate-100 print:border-slate-200 print:text-slate-700">
                  <Calendar className="h-3 w-3 text-primary print:text-slate-600" />
                  <span className="font-bold">{timeRangeLabel}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/60 print:text-slate-500">
                  <span>编号: <strong className="text-white print:text-slate-800 font-bold">{reportId}</strong></span>
                  <span>•</span>
                  <span>生成时间: {reportDateFormatted}</span>
                </div>
                <div className="text-[9px] uppercase tracking-widest text-emerald-400 print:text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> 内部机密 • 商业经营决策参考
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10 print:p-0 print:pt-6 print:space-y-6">
            {/* ────── 1. 核心经营指标看板 (Executive KPI Scorecard) ────── */}
            <section className="print-avoid-break">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-1 bg-primary rounded-full inline-block" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    一、核心经营指标概览 (Key Performance Indicators)
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">包含与上一周期同期对比</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {/* 1. 总访问会话 */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">总访问会话</p>
                    <Globe className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-headline font-bold text-slate-900">{data.totalSessions}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold">
                    {data.sessionsGrowth > 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />+{data.sessionsGrowth}%
                      </span>
                    ) : data.sessionsGrowth < 0 ? (
                      <span className="text-rose-600 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />{data.sessionsGrowth}%
                      </span>
                    ) : (
                      <span className="text-slate-400">环比持平 0%</span>
                    )}
                    <span className="text-slate-400 font-normal">较上期</span>
                  </div>
                </div>

                {/* 2. 独立访客 UV */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">独立访客 (UV)</p>
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-headline font-bold text-slate-900">{data.uniqueVisitors}</p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    人均访问 <strong className="text-slate-700 font-bold">{data.uniqueVisitors > 0 ? (data.totalSessions / data.uniqueVisitors).toFixed(1) : 1}</strong> 次
                  </p>
                </div>

                {/* 3. 页面浏览总数 PV */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">页面浏览量 PV</p>
                    <Activity className="h-3.5 w-3.5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-headline font-bold text-slate-900">{data.totalEvents}</p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    会话深度 <strong className="text-slate-700 font-bold">{avgPagesPerSession}</strong> 页/次
                  </p>
                </div>

                {/* 4. 产品询盘总量 */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 print:bg-emerald-50/30 print:border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">产品询盘总量</p>
                    <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-headline font-bold text-emerald-700">{totalInquiries}</p>
                  <p className="mt-2 text-[10px] text-emerald-700 font-bold">
                    产品转化率 {overallInquiryRate}
                  </p>
                </div>

                {/* 5. 平均滚动深度 */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">平均滚动深度</p>
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-600" />
                  </div>
                  <p className="text-2xl font-headline font-bold text-slate-900">{data.avgScrollDepth}%</p>
                  <p className="mt-2 text-[10px] text-slate-500 font-medium">
                    {data.avgScrollDepth >= 70 ? '阅读参与度极高' : data.avgScrollDepth >= 40 ? '阅读参与度良好' : '首屏停留偏多'}
                  </p>
                </div>

                {/* 6. 表单流失率 */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">表单流失率</p>
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-headline font-bold text-slate-900">{data.formAbandonRate}%</p>
                  <p className="mt-2 text-[10px] text-slate-500 font-medium">
                    {data.formAbandonRate === 0 ? '表单零流失' : data.formAbandonRate <= 30 ? '流失控制优异' : '建议精简字段'}
                  </p>
                </div>
              </div>
            </section>

            {/* ────── 2. 流量走势与同期对比分析 (Traffic Dynamics & Comparison) ────── */}
            <section className="print-avoid-break">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-1 bg-primary rounded-full inline-block" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    二、流量动态监测与同期对比走势 (Traffic Dynamics & Period Comparison)
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span>本期会话量</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <span>上期同期会话</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-200/80 print:bg-white print:border print:border-slate-200 print:p-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={{ stroke: '#cbd5e1' }} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }}
                      />
                      <Bar 
                        name="本期访问会话" 
                        dataKey="sessions" 
                        fill="#005B99" 
                        radius={[4, 4, 0, 0]} 
                        barSize={16} 
                      />
                      <Bar 
                        name="上期同期对比" 
                        dataKey="prevSessions" 
                        fill="#cbd5e1" 
                        radius={[4, 4, 0, 0]} 
                        barSize={16} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 走势关键摘要 */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">本期总会话</span>
                    <strong className="text-slate-800 font-bold text-sm">{data.currentTotalSessions ?? data.totalSessions} 次</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">上期总会话</span>
                    <strong className="text-slate-800 font-bold text-sm">{data.prevTotalSessions ?? 0} 次</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">同期净增减</span>
                    <strong className={data.sessionsGrowth >= 0 ? "text-emerald-600 font-bold text-sm" : "text-rose-600 font-bold text-sm"}>
                      {data.sessionsGrowth >= 0 ? `+${data.sessionsGrowth}%` : `${data.sessionsGrowth}%`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">峰值时段/日期</span>
                    <strong className="text-slate-800 font-bold text-sm">
                      {peakTimePoint ? `${peakTimePoint.date} (${peakTimePoint.sessions}次)` : '无'}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* ────── 3. 访客地域与渠道来源 (Geographic & Channels) ────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-avoid-break">
              {/* 地域分布 Top 5 */}
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 bg-primary rounded-full inline-block" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      三、访客地域分布 (Top Regions)
                    </h2>
                  </div>
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 space-y-3 print:bg-white print:border print:border-slate-200">
                  {data.geoData && data.geoData.length > 0 ? (
                    data.geoData.slice(0, 5).map((item: any, i: number) => {
                      const maxVal = data.geoData[0]?.value || 1;
                      const percent = Math.round((item.value / maxVal) * 100);
                      const sharePercent = data.totalSessions > 0 ? ((item.value / data.totalSessions) * 100).toFixed(1) : 0;
                      return (
                        <div key={i} className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-2.5 min-w-[120px]">
                            <span className="font-mono text-[10px] text-slate-400 font-bold w-4">0{i + 1}</span>
                            <span className="font-bold text-slate-700 truncate">{item.name || '其他 / 未知'}</span>
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="font-mono text-slate-900 font-bold w-12 text-right">{item.value} 次</span>
                            <span className="font-mono text-slate-400 text-[10px] w-12 text-right">{sharePercent}%</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">暂无访客地域分布数据</p>
                  )}
                </div>
              </section>

              {/* 渠道来源矩阵 */}
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 bg-primary rounded-full inline-block" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      四、访问渠道来源 (Traffic Acquisition)
                    </h2>
                  </div>
                  <Globe className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 space-y-3 print:bg-white print:border print:border-slate-200">
                  {data.referrerData && data.referrerData.length > 0 ? (
                    data.referrerData.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2.5 min-w-[140px]">
                          <span className="font-mono text-[10px] text-slate-400 font-bold w-4">0{i + 1}</span>
                          <span className="font-bold text-slate-700 truncate">{item.name}</span>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${item.percentage}%` }} />
                          </div>
                          <span className="font-mono text-slate-900 font-bold w-12 text-right">{item.value} 次</span>
                          <span className="font-mono text-slate-400 text-[10px] w-12 text-right">{item.percentage}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">暂无来源渠道数据</p>
                  )}
                </div>
              </section>
            </div>

            {/* ────── 4. 核心产品监测与商机转化排行 (Product Conversion Matrix) ────── */}
            {data.productMetrics && data.productMetrics.length > 0 && (
              <section className="print-avoid-break">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 bg-primary rounded-full inline-block" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      五、核心产品监测与商机转化排行 (Product Conversion & Performance Matrix)
                    </h2>
                  </div>
                  <span className="text-[10px] text-slate-400">包含产品缩略图与真实询盘转化率</span>
                </div>

                <div className="rounded-3xl border border-slate-200/80 overflow-x-auto scrollbar-minimal print:border print:border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider print:bg-slate-100">
                        <th className="py-3 px-4 w-12 text-center">序号</th>
                        <th className="py-3 px-4">产品信息 (Product Details)</th>
                        <th className="py-3 px-4 text-right">浏览量 (PV)</th>
                        <th className="py-3 px-4 text-right">获得询盘 (Inquiries)</th>
                        <th className="py-3 px-4 text-right">询盘转化率 (CR)</th>
                        <th className="py-3 px-4 text-center">转化评级</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {data.productMetrics.slice(0, 10).map((item: any, i: number) => {
                        const thumbUrl = item.mainImageUrl ? getAssetUrl(item.mainImageUrl) : null;
                        const crVal = item.conversionRate || 0;
                        const rating = crVal >= 15 ? '核心收割' : crVal >= 5 ? '良好转化' : item.views > 10 ? '高潜待转' : '培育阶段';

                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                            <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400">
                              0{i + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                                  {thumbUrl ? (
                                    <img
                                      src={thumbUrl}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                      crossOrigin="anonymous"
                                    />
                                  ) : (
                                    <Package className="h-4 w-4 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block truncate max-w-[260px]">{item.name}</span>
                                  <span className="font-mono text-[9px] text-slate-400">ID: {item.id ? item.id.slice(0, 8) : '--'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {item.views} 次
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                              {item.inquiries} 条
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 print:border-none">
                                {item.conversion}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-[10px] font-bold text-slate-500">
                                {rating}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ────── 5. 内容热度矩阵与终端技术基建 (Content & Tech) ────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-avoid-break">
              {/* 高频访问内容矩阵 */}
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 bg-primary rounded-full inline-block" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      六、核心内容与热度路径 (Content Matrix)
                    </h2>
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-minimal print:border print:border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider print:bg-slate-100">
                        <th className="py-2.5 px-3">路径 URL</th>
                        <th className="py-2.5 px-3 text-right">浏览量 (PV)</th>
                        <th className="py-2.5 px-3 text-right">全站占比</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {(data.sortedPages || []).slice(0, 6).map((item: any, i: number) => {
                        const share = data.totalEvents > 0 ? ((item.pv / data.totalEvents) * 100).toFixed(1) : 0;
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                            <td className="py-2.5 px-3 font-semibold text-slate-700 truncate max-w-[200px]">
                              {item.path}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {item.pv}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-500">
                              {share}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 终端设备与 Web Vitals 网站性能 */}
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 bg-primary rounded-full inline-block" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      七、终端环境与网站性能体验 (Tech & Web Vitals)
                    </h2>
                  </div>
                  <Smartphone className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 space-y-4 print:bg-white print:border print:border-slate-200">
                  {/* 设备占比 */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">设备类型分布</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(data.deviceData || []).map((dev: any, i: number) => {
                        const totalDev = (data.deviceData || []).reduce((acc: number, d: any) => acc + d.value, 0);
                        const devPct = totalDev > 0 ? Math.round((dev.value / totalDev) * 100) : 0;
                        return (
                          <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">{dev.name}</span>
                            <span className="text-sm font-headline font-bold text-slate-900 mt-0.5 block">{devPct}%</span>
                            <span className="text-[9px] text-slate-400 font-mono">{dev.value} 次</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Web Vitals 指标 */}
                  {data.perfStats && (
                    <div className="pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">首屏加载时长</span>
                        <strong className="text-xs font-bold text-slate-800 font-mono">{data.perfStats.avgLoadTimeSec || '--'} 秒</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">TTFB 首字节</span>
                        <strong className="text-xs font-bold text-slate-800 font-mono">{data.perfStats.avgTtfbMs || '--'} ms</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">整体网络评级</span>
                        <strong className="text-xs font-bold text-emerald-600">
                          {data.perfStats.overallStatus === 'excellent' ? '极佳 (Fast)' : '良好 (Normal)'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ────── 6. 报告落款与声明 (Report Declaration & Sign-off) ────── */}
            <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:pt-4">
              <div className="space-y-1">
                <p className="font-semibold text-slate-600">
                  {siteConfig?.companyName || 'Heovose Technology Co., Ltd.'} • 商业智能中心 (Heovose Elevate OS)
                </p>
                <p>
                  本报告由系统基于实际访问会话与全栈埋点数据自动汇总生成，数据真实有效，专供企业内部经营管理与市场投放复盘使用。
                </p>
              </div>
              <div className="text-right font-mono text-[9px] text-slate-400 shrink-0">
                <p>官方网址: {siteConfig?.siteUrl || 'www.heovose.com'}</p>
                <p>打印校验码: {reportId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ────── 屏幕端固定操作底栏 (Screen Action Bar) ────── */}
        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200 flex flex-row items-center justify-between no-print sticky bottom-0 z-20">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-11 rounded-2xl px-6 font-bold uppercase tracking-widest text-[11px] text-slate-500 hover:bg-slate-200/50"
          >
            关闭预览
          </Button>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="h-11 rounded-2xl px-6 font-bold uppercase tracking-widest text-[11px] border-slate-300 hover:bg-slate-100"
            >
              <Download className="mr-2 h-4 w-4" /> 导出 JSON 数据
            </Button>
            <Button 
              onClick={handlePrint}
              className="h-11 rounded-2xl px-7 font-bold uppercase tracking-widest text-[11px] bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              <Printer className="mr-2 h-4 w-4" /> 打印 / 另存为 PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
