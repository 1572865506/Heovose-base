'use client';

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
  ShoppingBag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LabelList
} from 'recharts';

interface AnalyticsReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function AnalyticsReport({ isOpen, onClose, data }: AnalyticsReportProps) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const exportData = {
      reportDate: new Date().toISOString(),
      metrics: {
        totalSessions: data.totalSessions,
        uniqueVisitors: data.uniqueVisitors,
        clickEvents: data.clickEvents,
        conversionRate: `${Math.round((data.clickEvents / data.totalEvents) * 100)}%`
      },
      timeSeries: data.timeSeries,
      geoDistribution: data.geoData,
      deviceBreakdown: data.deviceData,
      contentPerformance: data.sortedPages,
      productPerformance: data.productMetrics
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heovose-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-[2.5rem] bg-white print:fixed print:inset-0 print:h-screen print:w-screen print:max-w-none print:m-0 print:rounded-none print:overflow-visible print:bg-white print:z-[9999]">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Remove browser headers and footers (URL, Title, Date) */
            @page { 
              margin: 0; 
            }
            
            /* Reset body and hide all other elements */
            body, html { 
              height: auto !important; 
              overflow: visible !important; 
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            body * { visibility: hidden; }
            
            /* Target the specific print container */
            .print-area, .print-area * { visibility: visible; }
            .print-area { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important; 
              height: auto !important;
              overflow: visible !important;
              display: block !important;
              background: white !important;
              color: black !important;
              z-index: 99999 !important;
              padding: 1.5cm !important; /* Add padding to compensate for 0 margin */
            }

            /* Strip Dialog specific fixed positioning/transforms */
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
            }

            .no-print { display: none !important; }
            
            /* Chart and Table adjustments */
            .recharts-responsive-container { 
              width: 100% !important; 
              height: 350px !important; 
              min-height: 350px !important;
            }
            .recharts-surface { width: 100% !important; height: 100% !important; }
            
            .print-dark-bg { 
              background-color: #0f172a !important; 
              color: white !important; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Ensure section spacing and prevent breaks inside sections */
            section { 
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 2rem !important;
            }
          }
        ` }} />
        
        <div className="print-area">
          <div className="bg-slate-900 p-12 text-white relative overflow-hidden print-dark-bg print:p-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full translate-x-24 -translate-y-24 print:hidden" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 print:bg-primary print:text-white">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-headline font-bold uppercase tracking-tight">深度数据洞察报告</DialogTitle>
                  <DialogDescription className="text-white/40 font-bold uppercase tracking-[0.2em] mt-1 print:text-white/60">
                    Business Summary • {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest print:text-white/50">总访问次数</p>
                <p className="text-2xl font-headline font-bold">{data.totalSessions}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest print:text-white/50">独立访客</p>
                <p className="text-2xl font-headline font-bold">{data.uniqueVisitors}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest print:text-white/50">总点击次数</p>
                <p className="text-2xl font-headline font-bold">{data.clickEvents}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest print:text-white/50">平均点击率</p>
                <p className="text-2xl font-headline font-bold">{data.totalEvents > 0 ? Math.round((data.clickEvents / data.totalEvents) * 100) : 0}%</p>
              </div>
            </div>
          </div>

          <div className="p-12 space-y-16 print:p-10">
            {/* Section 1: Traffic Trend */}
            <section className="space-y-8 print:break-inside-avoid">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">流量增长趋势 (Traffic Trend)</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20}>
                      <LabelList dataKey="sessions" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#94a3b8' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Section 2: Geo and Device */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <section className="space-y-8 print:break-inside-avoid">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">访客地域分布 (Geo Location)</h3>
                </div>
                <div className="space-y-4">
                  {data.geoData && data.geoData.length > 0 ? (
                    data.geoData.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-300">0{i+1}</span>
                          <span className="text-xs font-bold text-slate-600 uppercase">{item.name || '其他'}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-1 max-w-[200px]">
                          <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${data.geoData[0]?.value ? (item.value / data.geoData[0].value) * 100 : 0}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 w-8 text-right">{item.value}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">暂无地域分布数据</p>
                  )}
                </div>
              </section>

              <section className="space-y-8 print:break-inside-avoid">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">设备与基建 (Infrastructure)</h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.deviceData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={8}
                        cornerRadius={6}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.deviceData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#0ea5e9', '#f59e0b'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6">
                  {data.deviceData.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#0ea5e9', '#f59e0b'][i % 3] }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Section 3: Content Performance */}
            <section className="space-y-8 print:break-inside-avoid">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">内容表现矩阵 (Content matrix)</h3>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 overflow-hidden print:bg-white print:p-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="pb-6">路径 / Page Path</th>
                      <th className="pb-6 text-right">浏览量 / PV</th>
                      <th className="pb-6 text-right">占比 / Share</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-slate-600">
                    {data.sortedPages.map((item: any, i: number) => (
                      <tr key={i} className="border-t border-slate-200/50">
                        <td className="py-4 font-mono">{item.path}</td>
                        <td className="py-4 text-right text-slate-900">{item.pv}</td>
                        <td className="py-4 text-right">{data.totalEvents > 0 ? Math.round((item.pv / data.totalEvents) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Product Performance */}
            {data.productMetrics && data.productMetrics.length > 0 && (
              <section className="space-y-8 print:break-inside-avoid">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">产品询盘与转化表现 (Product performance)</h3>
                </div>
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 overflow-hidden print:bg-white print:p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="pb-6">产品名称</th>
                        <th className="pb-6 text-right">被访问数量 (PV)</th>
                        <th className="pb-6 text-right">产品询盘数</th>
                        <th className="pb-6 text-right">询盘转化率</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-slate-600">
                      {data.productMetrics.map((item: any, i: number) => (
                        <tr key={i} className="border-t border-slate-200/50">
                          <td className="py-4 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-4 text-right text-slate-500">{item.views} 次</td>
                          <td className="py-4 text-right text-slate-900">{item.inquiries} 个</td>
                          <td className="py-4 text-right text-green-600 font-mono">{item.conversion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 gap-4 no-print">
          <Button variant="ghost" onClick={onClose} className="h-12 rounded-2xl px-8 font-bold uppercase tracking-widest text-[10px] text-slate-400">关闭报告</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="h-12 rounded-2xl px-8 font-bold uppercase tracking-widest text-[10px] border-slate-200">
              <Printer className="mr-2 h-4 w-4" /> 打印报告
            </Button>
            <Button 
              onClick={handleExport}
              className="h-12 rounded-2xl px-8 font-bold uppercase tracking-widest text-[10px] bg-primary shadow-xl shadow-primary/20 text-white"
            >
              <Download className="mr-2 h-4 w-4" /> 导出数据
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
